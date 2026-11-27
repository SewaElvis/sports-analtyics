/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local & Offline-First Persistence Adapter
 * Provides local caching, offline box-score tracking, and mock Firestore store.
 */

import { Match, Player, AuditEntry, ScoutProfile, ScoutContactRequest, CoachAppraisal } from '../types';
import { SEED_MATCHES, SEED_PLAYERS, SEED_AUDIT_LOGS, SEED_SCOUT_PROFILES, SEED_APPRAISALS } from './mockData';

const STORAGE_KEYS = {
  MATCHES: 'ucu_sports_matches',
  PLAYERS: 'ucu_sports_players',
  AUDIT: 'ucu_sports_audit',
  SCOUT_PROFILES: 'ucu_sports_scouts',
  SCOUT_REQUESTS: 'ucu_sports_scout_requests',
  APPRAISALS: 'ucu_sports_appraisals',
  OFFLINE_QUEUE: 'ucu_sports_offline_queue',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to persist to ${key}:`, err);
  }
}

export function getStoredMatches(): Match[] {
  return safeGet<Match[]>(STORAGE_KEYS.MATCHES, SEED_MATCHES);
}

export function saveStoredMatches(matches: Match[]): void {
  safeSet(STORAGE_KEYS.MATCHES, matches);
}

export function getStoredPlayers(): Player[] {
  return safeGet<Player[]>(STORAGE_KEYS.PLAYERS, SEED_PLAYERS);
}

export function saveStoredPlayers(players: Player[]): void {
  safeSet(STORAGE_KEYS.PLAYERS, players);
}

export function updatePlayerConsents(playerId: string, consents: Player['consents']): void {
  const players = getStoredPlayers();
  const idx = players.findIndex(p => p.id === playerId);
  if (idx !== -1) {
    players[idx].consents = consents;
    saveStoredPlayers(players);
  }
}

export function getStoredAuditLogs(): AuditEntry[] {
  return safeGet<AuditEntry[]>(STORAGE_KEYS.AUDIT, SEED_AUDIT_LOGS);
}

export function logAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const logs = getStoredAuditLogs();
  const newEntry: AuditEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  logs.unshift(newEntry);
  safeSet(STORAGE_KEYS.AUDIT, logs.slice(0, 100)); // retain last 100 entries
}

export function getStoredScoutProfiles(): ScoutProfile[] {
  return safeGet<ScoutProfile[]>(STORAGE_KEYS.SCOUT_PROFILES, SEED_SCOUT_PROFILES);
}

export function getStoredScoutRequests(): ScoutContactRequest[] {
  return safeGet<ScoutContactRequest[]>(STORAGE_KEYS.SCOUT_REQUESTS, []);
}

export function saveScoutRequest(req: ScoutContactRequest): void {
  const reqs = getStoredScoutRequests();
  reqs.unshift(req);
  safeSet(STORAGE_KEYS.SCOUT_REQUESTS, reqs);
}

export function getStoredAppraisals(): CoachAppraisal[] {
  return safeGet<CoachAppraisal[]>(STORAGE_KEYS.APPRAISALS, SEED_APPRAISALS);
}

export function saveAppraisal(appraisal: CoachAppraisal): void {
  const appraisals = getStoredAppraisals();
  const existingIdx = appraisals.findIndex(a => a.playerId === appraisal.playerId && a.matchId === appraisal.matchId);
  if (existingIdx !== -1) {
    appraisals[existingIdx] = appraisal;
  } else {
    appraisals.push(appraisal);
  }
  safeSet(STORAGE_KEYS.APPRAISALS, appraisals);
}
