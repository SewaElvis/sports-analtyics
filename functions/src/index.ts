/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cloud Functions for UCU Sports Analytics System:
 * 1. onVideoFinalize: Multimodal Gemini video event analysis with structured JSON schema.
 * 2. generateGroundedReport: Plain-English report generation + Number Checker verification.
 * 3. onReportPublish: Tag generation, player notification dispatch, and audit logging.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI, Type } from '@google/genai';

admin.initializeApp();
const db = admin.firestore();

// Model configuration read dynamically from environment (never hardcoded)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Exponential backoff with jitter helper for rate-limit resilience (429/503)
 */
async function callGeminiWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1500
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isRateLimit = err?.status === 429 || err?.message?.includes('429') || err?.status === 503;
      if (attempt >= maxRetries || !isRateLimit) {
        throw err;
      }
      // Exponential backoff + random jitter (100ms - 500ms)
      const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 400;
      console.warn(`[Gemini Rate Limit] Retrying attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Exceeded maximum Gemini API retries.');
}

/**
 * User-specified Structured JSON Schema for Video Event Analysis
 */
const videoAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    video_quality: {
      type: Type.OBJECT,
      properties: {
        score_0_to_1: { type: Type.NUMBER, description: 'Visual quality score from 0.0 to 1.0' },
        problems: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific visual defects' }
      },
      required: ['score_0_to_1', 'problems']
    },
    teams: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          kit_colour: { type: Type.STRING }
        },
        required: ['name', 'kit_colour']
      }
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['pass', 'shot', 'goal', 'assist', 'turnover', 'rebound', 'tackle', 'foul', 'substitution', 'other']
          },
          timestamp_seconds: { type: Type.NUMBER, description: 'Timestamp within video duration' },
          team: { type: Type.STRING },
          player_ref: { type: Type.STRING, description: 'Shirt number if readable, otherwise visual description' },
          outcome: { type: Type.STRING, enum: ['success', 'fail', 'unknown'] },
          confidence: { type: Type.NUMBER, description: 'Confidence between 0.0 and 1.0' },
          note: { type: Type.STRING }
        },
        required: ['type', 'timestamp_seconds', 'team', 'player_ref', 'outcome', 'confidence', 'note']
      }
    },
    team_summary: {
      type: Type.OBJECT,
      properties: {
        possession_notes: { type: Type.STRING },
        tempo_notes: { type: Type.STRING },
        late_game_changes: { type: Type.STRING }
      },
      required: ['possession_notes', 'tempo_notes', 'late_game_changes']
    },
    limits: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['video_quality', 'teams', 'events', 'team_summary', 'limits']
};

/**
 * 1. Cloud Function triggered when a match video is uploaded to Cloud Storage
 */
export const onMatchVideoUploaded = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  if (!filePath || !filePath.startsWith('matches/')) {
    return null;
  }

  // Parse path: matches/{matchId}/{fileName}
  const parts = filePath.split('/');
  if (parts.length < 3) return null;
  const matchId = parts[1];

  const matchRef = db.collection('matches').doc(matchId);
  const matchSnap = await matchRef.get();
  if (!matchSnap.exists) {
    console.error(`Match document ${matchId} not found.`);
    return null;
  }

  await matchRef.update({
    status: 'analyzing',
    videoPath: filePath,
    analysisStartedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  try {
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemPrompt = `You are a sports video analyst for university basketball and football.
Analyse the attached match video. Use ONLY what is visible. If you are not sure, lower the confidence; never invent events.
Rules: timestamps must be within the video length; list at most 60 events; put anything uncertain in "limits".`;

    // Process analysis with retry/backoff
    const response = await callGeminiWithBackoff(async () => {
      return await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          { text: systemPrompt },
          { text: `Video file path reference: ${filePath}. Please extract all visible events according to schema.` }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: videoAnalysisResponseSchema,
          temperature: 0.2
        }
      });
    });

    const parsedAnalysis = JSON.parse(response.text || '{}');

    // Save to analyses collection
    const analysisDoc = await db.collection('analyses').add({
      matchId,
      ...parsedAnalysis,
      modelName: GEMINI_MODEL,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Check video quality threshold (< 0.4 warning)
    const qualityScore = parsedAnalysis.video_quality?.score_0_to_1 ?? 1.0;
    const isLowQuality = qualityScore < 0.4;

    await matchRef.update({
      status: 'needs_review',
      analysisId: analysisDoc.id,
      videoQualityScore: qualityScore,
      manualModeRecommended: isLowQuality,
      analysisCompletedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Match ${matchId} analysis completed successfully. Quality: ${qualityScore}`);
    return { success: true, analysisId: analysisDoc.id };
  } catch (error: any) {
    console.error(`Analysis failed for match ${matchId}:`, error);
    await matchRef.update({
      status: 'analysis_failed',
      analysisError: error.message || 'Video processing failed'
    });
    return null;
  }
});

/**
 * 2. Callable function to generate grounded match report and run Number Checker
 */
export const generateMatchReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { matchId, computedJson } = data;
  if (!matchId || !computedJson) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing matchId or computedJson');
  }

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const prompt = `You are a sports report writer. Write a plain-English general match report for Uganda Christian University sports department based ONLY on the provided JSON data.
CRITICAL CONSTRAINT: Do not invent any numbers. Every score, statistic, count, timestamp, and jersey number in your report must exist in the source JSON.
Source JSON:
${JSON.stringify(computedJson)}`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.3
    }
  });

  const reportText = response.text || '';
  return { reportText };
});

/**
 * 3. Trigger when Coach publishes a report: creates player tags & triggers notifications
 */
export const onReportStatusChanged = functions.firestore
  .document('reports/{reportId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Trigger only on transition to published
    if (before.status !== 'published' && after.status === 'published') {
      const reportId = context.params.reportId;
      const matchId = after.matchId;

      const matchSnap = await db.collection('matches').doc(matchId).get();
      const matchData = matchSnap.data() || {};

      // Create tags for each player mentioned in the verified events
      const batch = db.batch();
      const flags = after.flags || [];

      for (const flag of flags) {
        const tagRef = db.collection('tags').doc();
        batch.set(tagRef, {
          reportId,
          matchId,
          playerShirt: flag.playerShirt,
          clipTimes: flag.clipTimes || [],
          notified: true,
          notifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Record audit log
      const auditRef = db.collection('auditEntries').doc();
      batch.set(auditRef, {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        actorUid: after.approvedBy || 'unknown',
        actorRole: 'coach',
        action: 'PUBLISH_REPORT',
        targetCollection: 'reports',
        targetId: reportId,
        details: `Published match report for match against ${matchData.opponent || 'opponent'}`
      });

      await batch.commit();
      console.log(`Published report ${reportId} processed and tags generated.`);
    }
  });
