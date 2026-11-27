/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audit Log Modal Viewer
 * Clean white/cobalt theme matching the system design.
 */

import React from 'react';
import { AuditEntry } from '../types';
import { Database, ShieldCheck, X } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bwin-card max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden bg-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">UCU Sports Department Compliance Audit Stream</h3>
              <p className="text-xs text-slate-500">
                Live immutable record tracking all views, box-score mutations, fusion decisions, and consent switches.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No audit records logged yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/70 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span>·</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[11px]">
                      {log.action}
                    </span>
                    <span>·</span>
                    <span className="text-slate-700 font-sans font-semibold">{log.actorEmail}</span>
                  </div>
                  <p className="font-sans text-xs text-slate-600 mt-1">{log.details}</p>
                </div>

                <div className="text-[11px] text-slate-400 sm:text-right shrink-0">
                  Target: {log.targetCollection}/{log.targetId}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Immutable Append-Only Audit Trail</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold transition-colors shadow-2xs"
          >
            Close Stream
          </button>
        </div>
      </div>
    </div>
  );
};
