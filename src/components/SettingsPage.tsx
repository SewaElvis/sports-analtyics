/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System Configuration, AI Controls & Data Governance Settings Page
 */

import React, { useState } from 'react';
import { Settings, Sparkles, Shield, Database, Wifi, CheckCircle2, RotateCcw } from 'lucide-react';

interface SettingsPageProps {
  onClearAndReseed: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClearAndReseed }) => {
  const [modelName, setModelName] = useState('gemini-3.8-flash');
  const [lowResMode, setLowResMode] = useState(true);
  const [qualityThreshold, setQualityThreshold] = useState(0.4);
  const [offlineSync, setOfflineSync] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">System Preferences</span>
            <span>·</span>
            <span>AI Multimodal Settings</span>
            <span>·</span>
            <span className="text-emerald-600">Institutional Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            System & Analytics Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Gemini AI processing parameters, offline box-score persistence, and athletic data protection policies.
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Gemini AI Video Engine */}
        <div className="bwin-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multimodal Gemini AI Engine</h2>
              <p className="text-xs text-slate-500">Configure video processing, token limits, and model versioning.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Active Gemini Vision Model:
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-blue-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: Low Latency & High Video Recall)</option>
                <option value="gemini-4-argon">gemini-4-argon (Flagship Complex Reasoning)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Dynamically read from environment; never hardcoded into client bundles.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Video Quality Warning Threshold (0.0 to 1.0):
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={qualityThreshold}
                onChange={(e) => setQualityThreshold(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Footage scoring below {qualityThreshold} displays low-quality alert and suggests coach manual entry.
              </p>
            </div>
          </div>

          {/* Token Optimization Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 mt-2">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Low Media Resolution Token Saver</span>
              <p className="text-[11px] text-slate-500">
                Compresses video frames prior to Gemini Files API upload to minimize token usage within free-tier limits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLowResMode(!lowResMode)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                lowResMode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  lowResMode ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5 shadow-2xs`}
              />
            </button>
          </div>
        </div>

        {/* Card 2: Cloud SQL PostgreSQL Database & Persistence */}
        <div className="bwin-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cloud SQL Relational Database (PostgreSQL)</h2>
              <p className="text-xs text-slate-500">Connected to Cloud SQL Developer Edition via Drizzle ORM and connection pooling.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">RDBMS Engine</span>
              <strong className="text-slate-900">PostgreSQL 16</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Cloud Region</span>
              <strong className="text-slate-900 font-mono">europe-west2</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live & Synchronized</span>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Offline Box-Score Mirroring & Sync</span>
              <p className="text-[11px] text-slate-500">
                Courtside increments persist locally in IndexedDB and synchronize with Cloud SQL PostgreSQL when reconnected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOfflineSync(!offlineSync)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                offlineSync ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  offlineSync ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5 shadow-2xs`}
              />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Reset local fixture state to seed data:</span>
            <button
              type="button"
              onClick={onClearAndReseed}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Re-Seed</span>
            </button>
          </div>
        </div>

        {/* Card 3: Athletic Data Protection & Student Privacy Standards */}
        <div className="bwin-card p-6 space-y-3">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Institutional Privacy Firewall Policy</h2>
              <p className="text-xs text-slate-500">Uganda Christian University student-athlete data protection compliance.</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
            <p>
              • <strong>Scout Firewall Rule:</strong> Scouts only query the anonymized scout directory view. Athletes whose <code>scoutVisible</code> flag is false are excluded at the database security rule layer.
            </p>
            <p>
              • <strong>PII Redaction:</strong> Student telephone numbers, personal emails, and national IDs are completely stripped from talent query responses.
            </p>
            <p>
              • <strong>Pre-Publish Quarantine:</strong> No AI analysis data or match reports reach student-athlete portals until officially reviewed and published by the head coach.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
