/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Statistical Fusion Engine
 * 
 * Compares Gemini-detected video events with coach-entered box scores
 * per player/shirt number. When discrepancies occur, generates a FusionFlag
 * containing both numbers and associated clip timestamps.
 * 
 * Invariant: Never overwrite silently!
 */

import { CoachEnteredStats, GeminiVideoEvent, FusionFlag } from '../types';

/**
 * Standard metric mapping between Gemini event types and coach stat labels
 */
const EVENT_TO_METRIC_MAP: Record<string, string[]> = {
  shot: ['shots', 'field_goals', 'attempts'],
  goal: ['goals'],
  assist: ['assists'],
  rebound: ['rebounds'],
  tackle: ['tackles'],
  foul: ['fouls'],
  turnover: ['turnovers'],
  pass: ['passes'],
};

/**
 * Extracts shirt number from player_ref string
 * e.g. "7", "#7", "Shirt 7", "Red #14", "Player 7 (guard)" -> 7
 */
export function extractShirtNumber(ref: string): number | null {
  if (!ref) return null;
  const match = ref.match(/(?:#|shirt\s*|player\s*|^)(\d{1,2})\b/i);
  return match ? parseInt(match[1], 10) : null;
}

export interface FusionResult {
  flags: FusionFlag[];
  matchedMetricsCount: number;
  discrepancyCount: number;
  playerSummary: Record<number, {
    playerName: string;
    metrics: Record<string, { coach: number; gemini: number; clipTimes: number[] }>;
  }>;
}

/**
 * Computes statistical fusion between coach box-scores and Gemini events.
 */
export function computeStatisticalFusion(
  enteredStats: CoachEnteredStats,
  geminiEvents: GeminiVideoEvent[]
): FusionResult {
  const flags: FusionFlag[] = [];
  const playerSummary: FusionResult['playerSummary'] = {};

  // Initialize summary for every coach-entered player
  for (const [shirtKey, playerVal] of Object.entries(enteredStats)) {
    const shirt = parseInt(shirtKey, 10);
    if (isNaN(shirt)) continue;

    playerSummary[shirt] = {
      playerName: playerVal.name || `Player #${shirt}`,
      metrics: {},
    };

    // Populate baseline metrics from coach stats
    for (const [metric, count] of Object.entries(playerVal.stats || {})) {
      playerSummary[shirt].metrics[metric.toLowerCase()] = {
        coach: Number(count) || 0,
        gemini: 0,
        clipTimes: [],
      };
    }
  }

  // Tally Gemini events per shirt number
  for (const event of geminiEvents) {
    const shirt = extractShirtNumber(event.player_ref);
    if (shirt === null) continue;

    if (!playerSummary[shirt]) {
      playerSummary[shirt] = {
        playerName: `Player #${shirt}`,
        metrics: {},
      };
    }

    const eventType = event.type.toLowerCase();
    const metricCandidates = EVENT_TO_METRIC_MAP[eventType] || [eventType];
    const metricKey = metricCandidates[0];

    if (!playerSummary[shirt].metrics[metricKey]) {
      playerSummary[shirt].metrics[metricKey] = {
        coach: 0,
        gemini: 0,
        clipTimes: [],
      };
    }

    // Only count successful or recorded attempts based on metric
    playerSummary[shirt].metrics[metricKey].gemini += 1;
    if (typeof event.timestamp_seconds === 'number') {
      playerSummary[shirt].metrics[metricKey].clipTimes.push(event.timestamp_seconds);
    }
  }

  // Compare tallies and generate discrepancy flags
  let matchedCount = 0;

  for (const [shirtKey, summary] of Object.entries(playerSummary)) {
    const shirt = parseInt(shirtKey, 10);

    for (const [metricName, data] of Object.entries(summary.metrics)) {
      if (data.coach === data.gemini) {
        matchedCount++;
      } else {
        // Discrepancy detected! Create explicit non-silent flag
        flags.push({
          id: `flag_${shirt}_${metricName}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          playerShirt: shirt,
          playerName: summary.playerName,
          metric: metricName,
          coachCount: data.coach,
          geminiCount: data.gemini,
          discrepancy: Math.abs(data.coach - data.gemini),
          clipTimes: data.clipTimes.sort((a, b) => a - b),
          status: 'pending',
          resolutionNote: undefined,
        });
      }
    }
  }

  return {
    flags,
    matchedMetricsCount: matchedCount,
    discrepancyCount: flags.length,
    playerSummary,
  };
}
