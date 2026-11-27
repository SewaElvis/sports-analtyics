/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './index.ts';
import { users, matches, matchEvents, matchReports, scoutRequests, auditLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, role = 'coach') {
  try {
    const result = await db.insert(users)
      .values({ uid, email, role })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email, role },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getDbMatches() {
  try {
    return await db.select().from(matches);
  } catch (error) {
    console.error('Database query failed in getDbMatches:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getDbAuditLogs() {
  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.id)).limit(100);
  } catch (error) {
    console.error('Database query failed in getDbAuditLogs:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
