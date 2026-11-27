/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dedicated Sports Administration Console Page
 * Accreditation toggle, mediated scout requests, squads oversight, and immutable audit logs.
 */

import React, { useState } from 'react';
import { Team, Player, ScoutContactRequest, AuditEntry } from '../types';
import { getStoredScoutRequests, saveScoutRequest, logAuditEntry } from '../lib/storage';
import { 
  ShieldCheck, Users, Check, X, Database, 
  UserCheck, AlertTriangle, Clock
} from 'lucide-react';

interface AdminPageProps {
  teams: Team[];
  players: Player[];
  isScoutApproved: boolean;
  onToggleScoutApproval: () => void;
  auditLogs: AuditEntry[];
}

export const AdminPage: React.FC<AdminPageProps> = ({
  teams,
  players,
  isScoutApproved,
  onToggleScoutApproval,
  auditLogs,
}) => {
  const [scoutRequests, setScoutRequests] = useState<ScoutContactRequest[]>(() => getStoredScoutRequests());
  const [activeTab, setActiveTab] = useState<'accreditation' | 'teams' | 'audit'>('accreditation');

  const handleResolve = (requestId: string, status: 'approved' | 'rejected') => {
    const updated = scoutRequests.map(r => (r.id === requestId ? { ...r, status } : r));
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
        details: `Sports Admin ${status.toUpperCase()} contact inquiry from scout (${req.scoutName}) for ${req.playerDisplayRef}.`,
      });
    }
  };

  const handleDownloadInstitutionalReport = () => {
    const csvRows = [
      `UCU SPORTS DEPARTMENT - INSTITUTIONAL STATISTICAL & AUDIT REPORT`,
      `Generated: ${new Date().toISOString()}`,
      `Total Athletes: ${players.length}`,
      `Total Teams: ${teams.length}`,
      ``,
      `ATHLETE ROSTER & DETAILS`,
      `ID,Name,Sport,Position,Shirt Number,Scout Visible`,
      ...players.map(p => `${p.id},"${p.name}",${p.sportId},"${p.position}",${p.shirtNumber},${p.consents.scoutVisible}`),
      ``,
      `IMMUTABLE AUDIT LOGS (${auditLogs.length} entries)`,
      `Timestamp,Actor,Role,Action,Details`,
      ...auditLogs.map(a => `"${a.timestamp}","${a.actorEmail}","${a.actorRole}","${a.action}","${a.details.replace(/"/g, '""')}"`)
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UCU_Institutional_Statistical_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Institutional Oversight</span>
            <span>·</span>
            <span>Uganda Christian University</span>
            <span>·</span>
            <span className="text-emerald-600">Sports Department Directorate</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Sports Governance & Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise external talent scout accreditation, process recruitment inquiries, and monitor immutable compliance trails.
          </p>
          <div className="pt-3">
            <button
              onClick={handleDownloadInstitutionalReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>📥 Download Institutional Report (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Athletes</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{players.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Teams</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{teams.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Audits</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{auditLogs.length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] text-emerald-600 uppercase font-bold block">Cloud SQL</span>
            <span className="font-mono font-bold text-emerald-800 text-xs">PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('accreditation')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'accreditation' ? 'bg-[#2954ea] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Scout Accreditation & Inquiries
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'teams' ? 'bg-[#2954ea] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          University Teams ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-[#2954ea] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Audit Stream ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Scout Accreditation & Requests */}
      {activeTab === 'accreditation' && (
        <div className="space-y-6">
          {/* Accreditation Firewall Card */}
          <div className="bwin-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>External Scout Accreditation Firewall</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                When authorized, certified regional scouts can discover student-athletes who granted scout consent. When revoked, scout queries return null.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-mono font-bold ${isScoutApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isScoutApproved ? 'ACCREDITATION ACTIVE' : 'ACCREDITATION REVOKED'}
              </span>
              <button
                onClick={onToggleScoutApproval}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                  isScoutApproved
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isScoutApproved ? 'Revoke Scout Access' : 'Grant Scout Accreditation'}
              </button>
            </div>
          </div>

          {/* Mediated Inquiries */}
          <div className="bwin-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Scout Recruitment Inquiries Queue ({scoutRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  All requests must be reviewed by UCU sports administration prior to authorizing official contact.
                </p>
              </div>
            </div>

            {scoutRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                No recruitment inquiries currently in queue.
              </div>
            ) : (
              <div className="space-y-3">
                {scoutRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <strong className="text-slate-900">{req.scoutName}</strong>
                        <span>·</span>
                        <span>{req.scoutOrg}</span>
                        <span>·</span>
                        <span className="font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="text-sm font-bold text-slate-900 mt-1">
                        Inquiry Target: <span className="text-blue-600 font-mono">{req.playerDisplayRef}</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 bg-white p-3 rounded-xl border border-slate-200">
                        &quot;{req.message}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolve(req.id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleResolve(req.id, 'approved')}
                            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Authorize</span>
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs uppercase font-bold font-mono px-3 py-1 rounded-full ${
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
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

      {/* TAB 2: University Teams */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((team) => (
            <div key={team.id} className="bwin-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-blue-600 block">
                    {team.gender} {team.sport}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{team.name}</h3>
                </div>
                <span className="text-2xl">{team.sport === 'basketball' ? '🏀' : '⚽'}</span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>League: <strong className="text-slate-900">{team.season}</strong></div>
                <div>Head Coach: <strong className="text-slate-900">{team.headCoach}</strong></div>
                <div>Rostered Athletes: <strong className="text-slate-900 font-mono">{team.playersCount}</strong></div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Mukono Campus</span>
                <span className="text-emerald-600 font-bold">Active in League</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Audit Stream */}
      {activeTab === 'audit' && (
        <div className="bwin-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Compliance & Security Audit Stream ({auditLogs.length} Records)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Append-only log recording every report publication, scout inquiry, box-score adjustment, and athlete consent change.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Collection / Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{log.actorEmail}</span>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">({log.actorRole})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {log.targetCollection}/{log.targetId}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-sans text-xs">
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
