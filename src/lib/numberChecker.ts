/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Strict Grounded Number Checker
 * 
 * Rule: Every number occurring in the AI-generated report text must exist
 * in the computed source match data (box scores, event counts, team scores,
 * timestamps, percentages, or jersey numbers). Any sentence containing an
 * ungrounded number is flagged and excluded or annotated.
 */

export interface NumberCheckResult {
  passed: boolean;
  totalSentences: number;
  validSentences: string[];
  flaggedSentences: Array<{
    sentence: string;
    unmatchedNumbers: number[];
    reason: string;
  }>;
  groundedNumbersFound: number[];
  allExtractedNumbers: number[];
}

/**
 * Extracts all valid numerical values from raw match data structures
 * into a searchable whitelist set.
 */
export function buildGroundingNumberSet(data: {
  enteredStats?: Record<string | number, any>;
  events?: Array<{ timestamp_seconds?: number; [key: string]: any }>;
  score?: { ucu: number; opponent: number };
  extraValues?: number[];
}): Set<number> {
  const allowed = new Set<number>();

  // Add zero and single-digit ordinals or percentages if relevant
  allowed.add(0);
  allowed.add(1); // Quarters, halves, common unit steps
  allowed.add(2);
  allowed.add(3);
  allowed.add(4);

  // Add match scores
  if (data.score) {
    allowed.add(data.score.ucu);
    allowed.add(data.score.opponent);
    allowed.add(Math.abs(data.score.ucu - data.score.opponent)); // Point margin
  }

  // Add coach-entered stats (all player shirt numbers and stat counts)
  if (data.enteredStats) {
    for (const [shirtKey, playerVal] of Object.entries(data.enteredStats)) {
      const shirtNum = Number(shirtKey);
      if (!isNaN(shirtNum)) allowed.add(shirtNum);

      if (playerVal && typeof playerVal === 'object') {
        if (typeof playerVal.minutesPlayed === 'number') {
          allowed.add(playerVal.minutesPlayed);
        }
        if (playerVal.stats && typeof playerVal.stats === 'object') {
          for (const val of Object.values(playerVal.stats)) {
            if (typeof val === 'number') {
              allowed.add(val);
            }
          }
        }
      }
    }
  }

  // Add Gemini events (timestamps, clip seconds, shirt refs)
  if (Array.isArray(data.events)) {
    allowed.add(data.events.length);
    for (const evt of data.events) {
      if (typeof evt.timestamp_seconds === 'number') {
        allowed.add(Math.round(evt.timestamp_seconds));
        // Add minutes approximation too
        allowed.add(Math.floor(evt.timestamp_seconds / 60));
      }
      if (typeof evt.confidence === 'number') {
        allowed.add(Math.round(evt.confidence * 100)); // confidence as percentage e.g. 85%
      }
      if (evt.player_ref) {
        const match = evt.player_ref.match(/\d+/);
        if (match) allowed.add(Number(match[0]));
      }
    }
  }

  // Explicit extra values (e.g. calculated totals, shooting percentages)
  if (Array.isArray(data.extraValues)) {
    data.extraValues.forEach(v => allowed.add(v));
  }

  return allowed;
}

/**
 * Extracts numbers from a sentence string, ignoring year markers like 2026/2025
 * if configured, or time formatting like 12:30.
 */
export function extractNumbersFromSentence(sentence: string): number[] {
  // Matches integers and decimals: e.g. "82", "3.5", "14"
  const regex = /\b\d+(?:\.\d+)?\b/g;
  const matches = sentence.match(regex) || [];
  return matches
    .map(m => Number(m))
    .filter(n => !isNaN(n));
}

/**
 * Checks a match report against the grounded dataset.
 * Returns valid sentences and flagged ungrounded sentences.
 */
export function checkReportGroundedNumbers(
  reportText: string,
  groundingSet: Set<number>,
  ignoredNumbers: number[] = [2026, 2025, 2024] // Academic years/dates
): NumberCheckResult {
  // Split into sentences using punctuation boundaries
  const rawSentences = reportText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const validSentences: string[] = [];
  const flaggedSentences: Array<{ sentence: string; unmatchedNumbers: number[]; reason: string }> = [];
  const groundedNumbersFound = new Set<number>();
  const allExtractedNumbers: number[] = [];

  const ignoredSet = new Set(ignoredNumbers);

  for (const sentence of rawSentences) {
    const numbersInSentence = extractNumbersFromSentence(sentence);
    const ungrounded: number[] = [];

    for (const num of numbersInSentence) {
      allExtractedNumbers.push(num);
      if (ignoredSet.has(num)) {
        continue;
      }
      if (groundingSet.has(num)) {
        groundedNumbersFound.add(num);
      } else {
        ungrounded.push(num);
      }
    }

    if (ungrounded.length === 0) {
      validSentences.push(sentence);
    } else {
      flaggedSentences.push({
        sentence,
        unmatchedNumbers: ungrounded,
        reason: `Sentence contains number(s) [${ungrounded.join(', ')}] not verified in match data.`,
      });
    }
  }

  return {
    passed: flaggedSentences.length === 0,
    totalSentences: rawSentences.length,
    validSentences,
    flaggedSentences,
    groundedNumbersFound: Array.from(groundedNumbersFound).sort((a, b) => a - b),
    allExtractedNumbers,
  };
}
