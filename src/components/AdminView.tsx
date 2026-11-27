/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sports Department Administrator Console:
 * - Scout Verification & Accreditation Switch
 * - Review Scout Recruitment Contact Inquiries
 * - Manage Sports, Teams & Seasons
 * - Live Audit Trail Stream
 */

import React, { useState } from 'react';
import { Team, Player, ScoutContactRequest, AuditEntry } from '../types';
import { getStoredScoutRequests, saveScoutRequest, logAuditEntry } from '../lib/storage';
import { 
  ShieldCheck, Users, Trophy, UserCheck, Check, X, 
  Send, Database, Plus, Search, Clock
} from 'lucide-react';

interface AdminViewProps {
  teams: Team[];
  players: Player[];
  isScoutApproved: boolean;
  onToggleScoutApproval: () => void;
  auditLogs: AuditEntry[];
}

export const AdminView: React.FC<AdminViewProps> = ({
  teams,
  players,
  isScoutApproved,
  onToggleScoutApproval,
  auditLogs,
}) => {
  const [scoutRequests, setScoutRequests] = useState<ScoutContactRequest[]>(() => getStoredScoutRequests());
  const [activeTab, setActiveTab] = useState<'scouts' | 'teams' | 'audit'>('scouts');

  const handleResolveScoutRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const updated = scoutRequests.map(r => {
      if (r.id === requestId) {
        return { ...r, status };
      }
      return r;
    });
    setScoutRequests(updated);

    const req = scoutRequests.find(r => r.id === requestId);
    if (req) {
      saveScoutRequest({ ...req, status });
      logAuditEntry({
        actorUid: 'usr_admin_1',
        actorEmail: 'director.sports@ucu.ac.ug',
        actorRole: 'admin',
        action: 'APPROVE_SCOUT',
        targetCollection: 'scoutRequests',
        targetId: requestId,
        details: `Admin ${status.toUpperCase()} contact request from scout (${req.scoutName}) regarding ${req.playerDisplayRef}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Department of Sports & Recreation</span>
            <span aria-hidden="true">·</span>
            <span>Uganda Christian University</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Institutional Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Sports Administration Deck
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Accredit external scouts, review student recruitment requests, supervise university sports rosters, and audit data compliance.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Athletes</span>
            <span className="font-mono font-bold text-white tabular-nums text-base">{players.length}</span>
          </div>
          <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Teams</span>
            <span className="font-mono font-bold text-white tabular-nums text-base">{teams.length}</span>
          </div>
          <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 text-center">
            <span className="text-[10px] text-zinc-500 uppercase block">Audits</span>
            <span className="font-mono font-bold text-white tabular-nums text-base">{auditLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('scouts')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'scouts' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Scout Accreditation & Inquiries
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'teams' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          University Teams & Squads
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Compliance Audit Trail</span>
        </button>
      </div>

      {/* Tab 1: Scout Accreditation & Requests */}
      {activeTab === 'scouts' && (
        <div className="space-y-6">
          {/* Scout Accreditation Switch Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>External Scout Accreditation Firewall</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                When enabled, vetted talent scouts (FUBA, CECAFA, national federations) can view athletes who gave scout consent. When disabled, scout access is completely blocked.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-mono font-semibold ${isScoutApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isScoutApproved ? 'ACCREDITED (ACCESS GRANTED)' : 'ACCREDITATION REVOKED'}
              </span>
              <button
                onClick={onToggleScoutApproval}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isScoutApproved
                    ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isScoutApproved ? 'Revoke Approval' : 'Grant Scout Accreditation'}
              </button>
            </div>
          </div>

          {/* Scout Recruitment Inquiries Queue */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">
                  Mediated Recruitment Inquiries ({scoutRequests.length})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official recruitment requests sent by scouts. Admin approval is required before student meetings or contact details are released.
                </p>
              </div>
            </div>

            {scoutRequests.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 bg-zinc-950 rounded-xl text-xs">
                No recruitment inquiries currently in queue.
              </div>
            ) : (
              <div className="space-y-3">
                {scoutRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <strong className="text-zinc-200">{req.scoutName}</strong>
                        <span aria-hidden="true">·</span>
                        <span>{req.scoutOrg}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-1 text-sm font-semibold text-white">
                        Inquiry Target: <span className="text-zinc-200 font-mono">{req.playerDisplayRef}</span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-2 bg-zinc-900 p-2.5 rounded border border-zinc-800/60">
                        &quot;{req.message}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolveScoutRequest(req.id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleResolveScoutRequest(req.id, 'approved')}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Authorize</span>
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs uppercase font-semibold font-mono ${
                          req.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Teams & Sports */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    {team.gender} {team.sport}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{team.name}</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                  {team.sport === 'basketball' ? '🏀' : '⚽'}
                </div>
              </div>

              <div className="text-xs text-zinc-400 space-y-1">
                <div>League: <strong className="text-zinc-200">{team.season}</strong></div>
                <div>Head Coach: <strong className="text-zinc-200">{team.headCoach}</strong></div>
                <div>Rostered Athletes: <strong className="text-zinc-200 font-mono">{team.playersCount}</strong></div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>Mukono Campus</span>
                <span className="text-emerald-400 font-medium">Active Season</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Compliance Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">
                Immutable Regulatory Audit Stream ({auditLogs.length} Records)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cryptographically tracked record of every report publication, scout contact request, and student consent change.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-mono">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Actor & Role</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Collection / Target</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-850/40 font-mono text-[11px]">
                    <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-zinc-200">{log.actorEmail}</span>
                      <span className="text-zinc-500 block text-[10px] uppercase">({log.actorRole})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                      {log.targetCollection}/{log.targetId}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 font-sans text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
