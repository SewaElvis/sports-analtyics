/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { relations } from 'drizzle-orm';
import { 
  integer, pgTable, serial, text, timestamp, jsonb, doublePrecision, boolean 
} from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('coach'), // 'coach' | 'player' | 'scout' | 'admin'
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Matches table
export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  sportId: text('sport_id').notNull(), // 'basketball' | 'football'
  opponent: text('opponent').notNull(),
  date: text('date').notNull(),
  venue: text('venue'),
  status: text('status').notNull().default('scheduled'), // 'scheduled' | 'analyzing' | 'needs_review' | 'published'
  scoreUcu: integer('score_ucu'),
  scoreOpponent: integer('score_opponent'),
  videoPath: text('video_path'),
  enteredStats: jsonb('entered_stats').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

// Match Events table (Gemini AI extracted actions)
export const matchEvents = pgTable('match_events', {
  id: serial('id').primaryKey(),
  matchId: text('match_id').notNull().references(() => matches.id),
  type: text('type').notNull(), // 'pass' | 'shot' | 'goal' | 'assist' | 'turnover' | 'rebound' | 'tackle' | 'foul'
  timestampSeconds: integer('timestamp_seconds').notNull(),
  playerRef: text('player_ref').notNull(),
  team: text('team').notNull(),
  outcome: text('outcome').notNull(), // 'success' | 'fail' | 'unknown'
  confidence: doublePrecision('confidence').notNull().default(0.9),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Match Reports table (Grounded plain-English AI reports)
export const matchReports = pgTable('match_reports', {
  id: serial('id').primaryKey(),
  matchId: text('match_id').notNull().references(() => matches.id),
  summary: text('summary').notNull(),
  verifiedStats: jsonb('verified_stats').default({}),
  flags: jsonb('flags').default([]),
  status: text('status').notNull().default('draft'), // 'draft' | 'published'
  approvedBy: text('approved_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Scout Contact Requests table
export const scoutRequests = pgTable('scout_requests', {
  id: serial('id').primaryKey(),
  scoutUid: text('scout_uid').notNull(),
  scoutName: text('scout_name').notNull(),
  targetPlayerId: text('target_player_id').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Entries table (Immutable compliance trail)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  targetCollection: text('target_collection').notNull(),
  targetId: text('target_id').notNull(),
  details: text('details').notNull(),
  timestamp: text('timestamp').notNull(),
});

// Relations
export const matchesRelations = relations(matches, ({ many }) => ({
  events: many(matchEvents),
  reports: many(matchReports),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, {
    fields: [matchEvents.matchId],
    references: [matches.id],
  }),
}));
