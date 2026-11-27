/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unit Test Suite for:
 * 1. Statistical Fusion Logic
 * 2. Grounded Report Writer Number Checker
 * 
 * 5 Concrete Test Examples demonstrating verification and dispute handling.
 */

import { buildGroundingNumberSet, checkReportGroundedNumbers } from '../src/lib/numberChecker.js';
import { computeStatisticalFusion, extractShirtNumber } from '../src/lib/fusionEngine.js';
import { CoachEnteredStats, GeminiVideoEvent } from '../src/types/index.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

console.log('\n======================================================');
console.log('UCU SPORTS ANALYTICS: FUSION & NUMBER CHECKER UNIT TESTS');
console.log('======================================================\n');

// -------------------------------------------------------------
// TEST 1: Number Checker - Perfectly Grounded Report Sentence
// -------------------------------------------------------------
console.log('Test 1: Grounded Number Checker with 100% verified data');
{
  const mockMatchData = {
    score: { ucu: 78, opponent: 65 },
    enteredStats: {
      7: {
        name: 'Titus Lual',
        minutesPlayed: 32,
        stats: { shots: 14, assists: 6, rebounds: 11 },
      },
    },
    events: [
      { timestamp_seconds: 142, player_ref: '#7', type: 'shot' as const },
      { timestamp_seconds: 385, player_ref: '#7', type: 'assist' as const },
    ],
  };

  const groundingSet = buildGroundingNumberSet(mockMatchData);
  const reportText = 'Titus Lual (#7) dominated the glass with 11 rebounds and distributed 6 assists in 32 minutes as UCU sealed a 78 to 65 victory.';

  const result = checkReportGroundedNumbers(reportText, groundingSet);

  assert(
    result.passed === true,
    'Report with only verified numbers passes verification',
    `Expected pass, but got ${result.flaggedSentences.length} flagged sentences`
  );
  assert(
    result.flaggedSentences.length === 0,
    'Zero sentences flagged for verified report'
  );
}

// -------------------------------------------------------------
// TEST 2: Number Checker - Catches Hallucinated Number
// -------------------------------------------------------------
console.log('\nTest 2: Number Checker catches hallucinated statistic');
{
  const mockMatchData = {
    score: { ucu: 82, opponent: 74 },
    enteredStats: {
      10: {
        name: 'Jimmy Otim',
        minutesPlayed: 25,
        stats: { shots: 8, rebounds: 4 },
      },
    },
  };

  const groundingSet = buildGroundingNumberSet(mockMatchData);
  // Model hallucinates "28 points" and "9 steals" which do not exist in the dataset
  const reportText = 'Jimmy Otim (#10) exploded for 28 points and recorded 9 steals in the second half.';

  const result = checkReportGroundedNumbers(reportText, groundingSet);

  assert(
    result.passed === false,
    'Report with hallucinated numbers is successfully rejected',
    'Expected check to fail'
  );
  assert(
    result.flaggedSentences.length === 1,
    'Flagged sentence count is exactly 1'
  );
  assert(
    result.flaggedSentences[0].unmatchedNumbers.includes(28) &&
    result.flaggedSentences[0].unmatchedNumbers.includes(9),
    'Both hallucinated numbers (28, 9) identified in flag details'
  );
}

// -------------------------------------------------------------
// TEST 3: Number Checker - Partial Hallucination Isolation
// -------------------------------------------------------------
console.log('\nTest 3: Number Checker isolates only ungrounded sentences');
{
  const mockMatchData = {
    score: { ucu: 2, opponent: 1 },
    enteredStats: {
      9: {
        name: 'Allan Okello',
        stats: { goals: 2, shots: 5, tackles: 4 },
      },
    },
  };

  const groundingSet = buildGroundingNumberSet(mockMatchData);
  const multiSentenceReport =
    'Allan Okello (#9) scored 2 goals from 5 shots to lead UCU Cardinals to a 2 to 1 triumph. ' +
    'The forward also completed 47 sprint accelerations during the match.'; // 47 is hallucinated!

  const result = checkReportGroundedNumbers(multiSentenceReport, groundingSet);

  assert(
    result.validSentences.length === 1,
    'Verified sentence is safely retained in clean output'
  );
  assert(
    result.flaggedSentences.length === 1 && result.flaggedSentences[0].unmatchedNumbers.includes(47),
    'Hallucinated sentence with phantom number 47 is isolated'
  );
}

// -------------------------------------------------------------
// TEST 4: Fusion Engine - Exact Match (No Disputes)
// -------------------------------------------------------------
console.log('\nTest 4: Statistical Fusion - Concordant data produces 0 flags');
{
  const coachStats: CoachEnteredStats = {
    5: {
      name: 'Fadhil Chuma',
      stats: { rebounds: 2, fouls: 1 },
    },
  };

  const geminiEvents: GeminiVideoEvent[] = [
    {
      type: 'rebound',
      timestamp_seconds: 45,
      team: 'UCU Canons',
      player_ref: 'Shirt 5',
      outcome: 'success',
      confidence: 0.92,
      note: 'Defensive rebound under the rim',
    },
    {
      type: 'rebound',
      timestamp_seconds: 180,
      team: 'UCU Canons',
      player_ref: '#5',
      outcome: 'success',
      confidence: 0.88,
      note: 'Offensive putback rebound',
    },
    {
      type: 'foul',
      timestamp_seconds: 210,
      team: 'UCU Canons',
      player_ref: 'Player 5',
      outcome: 'unknown',
      confidence: 0.85,
      note: 'Reach-in personal foul',
    },
  ];

  const fusion = computeStatisticalFusion(coachStats, geminiEvents);

  assert(
    fusion.flags.length === 0,
    'No flags created when coach tallies match Gemini event counts'
  );
  assert(
    fusion.matchedMetricsCount === 2,
    'Both rebounds (2) and fouls (1) confirmed as matched'
  );
}

// -------------------------------------------------------------
// TEST 5: Fusion Engine - Discrepancy Detection & Clip Anchoring
// -------------------------------------------------------------
console.log('\nTest 5: Statistical Fusion - Count discrepancy generates FusionFlag with clip timestamps');
{
  const coachStats: CoachEnteredStats = {
    11: {
      name: 'Jerry Kayanga',
      stats: { assists: 4 }, // Coach recorded 4 assists
    },
  };

  // Gemini only saw 2 assist events on video footage
  const geminiEvents: GeminiVideoEvent[] = [
    {
      type: 'assist',
      timestamp_seconds: 115,
      team: 'UCU Canons',
      player_ref: '#11',
      outcome: 'success',
      confidence: 0.94,
      note: 'Kick-out pass for corner three',
    },
    {
      type: 'assist',
      timestamp_seconds: 420,
      team: 'UCU Canons',
      player_ref: '#11 Kayanga',
      outcome: 'success',
      confidence: 0.91,
      note: 'Fastbreak bounce pass inside',
    },
  ];

  const fusion = computeStatisticalFusion(coachStats, geminiEvents);

  assert(
    fusion.flags.length === 1,
    'Discrepancy flag generated when coach assists (4) differs from AI assists (2)'
  );

  const flag = fusion.flags[0];
  assert(
    flag.coachCount === 4 && flag.geminiCount === 2,
    'Flag preserves both coach number (4) and Gemini number (2)'
  );
  assert(
    flag.clipTimes.length === 2 && flag.clipTimes[0] === 115 && flag.clipTimes[1] === 420,
    'Flag links to both video clip timestamps (115s, 420s)'
  );
  assert(
    flag.status === 'pending',
    'Discrepancy marked as pending coach review (never silently overwritten)'
  );
}

console.log('\n======================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
