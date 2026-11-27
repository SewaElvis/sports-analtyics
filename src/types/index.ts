/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Core Data Models & Schemas for UCU Smart Multi-Field Sports Analytics System
 */

export type UserRole = 'admin' | 'coach' | 'player' | 'scout';

export type SportType = 'basketball' | 'football' | 'netball';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  approved: boolean; // Scouts must be approved by admin
  createdAt: string;
}

export interface PlayerConsent {
  analysis: boolean;        // consent to AI video analysis
  portal: boolean;          // consent to athlete portal display
  teamSharing: boolean;     // consent to sharing with team staff
  scoutVisible: boolean;    // student athlete consent to be visible to vetted scouts
  publicHighlights: boolean;// consent for promotional clips
}

export interface Player {
  id: string;
  userId?: string;
  teamId: string;
  sportId: SportType;
  name: string;
  shirtNumber: number;
  position: string;
  yearOfStudy: number;
  faculty: string;
  heightCm?: number;
  weightKg?: number;
  consents: PlayerConsent;
  seasonStats: Record<string, number>;
  bio?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  sport: SportType;
  gender: 'Men' | 'Women';
  season: string;
  headCoach: string;
  playersCount: number;
}

// User-specified Gemini Video Analysis Schema
export interface GeminiVideoEvent {
  type: 'pass' | 'shot' | 'goal' | 'assist' | 'turnover' | 'rebound' | 'tackle' | 'foul' | 'substitution' | 'other';
  timestamp_seconds: number;
  team: string;
  player_ref: string; // shirt number if readable, otherwise visual description
  outcome: 'success' | 'fail' | 'unknown';
  confidence: number;
  note: string;
}

export interface GeminiVideoAnalysis {
  video_quality: {
    score_0_to_1: number;
    problems: string[];
  };
  teams: Array<{
    name: string;
    kit_colour: string;
  }>;
  events: GeminiVideoEvent[];
  team_summary: {
    possession_notes: string;
    tempo_notes: string;
    late_game_changes: string;
  };
  limits: string[];
  analyzedAt?: string;
  modelName?: string;
}

export interface CoachEnteredStats {
  [shirtNumber: number]: {
    name: string;
    stats: Record<string, number>; // e.g. { shots: 5, assists: 3, rebounds: 4 }
    minutesPlayed?: number;
  };
}

export interface FusionFlag {
  id: string;
  playerShirt: number;
  playerName: string;
  metric: string;
  coachCount: number;
  geminiCount: number;
  discrepancy: number;
  clipTimes: number[];
  status: 'pending' | 'resolved_coach' | 'resolved_gemini' | 'resolved_custom';
  resolutionNote?: string;
}

export interface ReportSection {
  title: string;
  content: string;
  clipTimestamps: number[];
  verifiedNumbers: number[];
}

export interface MatchReport {
  id: string;
  matchId: string;
  status: 'draft' | 'published';
  approvedBy?: string;
  publishedAt?: string;
  executiveSummary: string;
  sections: ReportSection[];
  flags: FusionFlag[];
  checkerAudit: {
    passed: boolean;
    totalNumbersChecked: number;
    flaggedSentences: string[];
  };
}

export interface Match {
  id: string;
  teamId: string;
  sportId: SportType;
  opponent: string;
  date: string;
  venue: string;
  isHome: boolean;
  score?: {
    ucu: number;
    opponent: number;
  };
  videoPath?: string;
  videoUrl?: string;
  enteredStats: CoachEnteredStats;
  status: 'scheduled' | 'in_progress' | 'analyzing' | 'needs_review' | 'published';
  analysis?: GeminiVideoAnalysis;
  report?: MatchReport;
  lastUpdated: string;
}

export interface PlayerTag {
  id: string;
  reportId: string;
  matchId: string;
  playerId: string;
  playerShirt: number;
  clipTimes: number[];
  notified: boolean;
  notifiedAt?: string;
}

export interface CoachAppraisal {
  id: string;
  matchId: string;
  playerId: string;
  coachId: string;
  ratings: {
    workRate: number;      // 1-5
    tacticalAwareness: number;
    decisionMaking: number;
    discipline: number;
  };
  coachComments: string;
  playerNotes?: string;
  createdAt: string;
}

export interface ScoutProfile {
  id: string;
  playerId: string;
  sport: SportType;
  position: string;
  heightCm?: number;
  graduationYear: number;
  academicFaculty: string;
  statsAverage: Record<string, number>;
  highlightClipsCount: number;
  verifiedByAdmin: boolean;
  // Note: Direct PII like phone, email, and national ID are stripped completely
}

export interface ScoutContactRequest {
  id: string;
  scoutId: string;
  scoutName: string;
  scoutOrg: string;
  playerId: string;
  playerDisplayRef: string;
  sport: SportType;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'VIEW_REPORT' | 'VIEW_PROFILE' | 'UPDATE_PROFILE' | 'UPDATE_CONSENT' | 'UPDATE_STATS' | 'RESOLVE_FLAG' | 'PUBLISH_REPORT' | 'APPROVE_SCOUT' | 'SCOUT_CONTACT_REQUEST';
  targetCollection: string;
  targetId: string;
  details: string;
}
