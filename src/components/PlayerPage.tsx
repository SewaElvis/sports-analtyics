/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dedicated Student-Athlete Portal Page
 * Clean, modern bwin-inspired athlete hub with personal stats, clips, appraisals, and privacy toggles.
 */

import React, { useState } from 'react';
import { Player, Match, CoachAppraisal } from '../types';
import { updatePlayerConsents, logAuditEntry, saveAppraisal } from '../lib/storage';
import { 
  ShieldCheck, Lock, Play, Award, 
  CheckCircle, ArrowUpRight, Clock, Star
} from 'lucide-react';

interface PlayerPageProps {
  player: Player;
  onUpdatePlayer: (updated: Player) => void;
  matches: Match[];
  appraisal?: CoachAppraisal;
  onSelectClip: (time: number) => void;
}

export const PlayerPage: React.FC<PlayerPageProps> = ({
  player,
  onUpdatePlayer,
  matches,
  appraisal,
  onSelectClip,
}) => {
  const [consents, setConsents] = useState(player.consents);
  const [selfEvalNotes, setSelfEvalNotes] = useState(appraisal?.playerNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  // Toggle privacy switches with real-time audit logging
  const handleToggle = (key: keyof Player['consents']) => {
    const updated = {
      ...consents,
      [key]: !consents[key],
    };
    setConsents(updated);
    updatePlayerConsents(player.id, updated);
    onUpdatePlayer({ ...player, consents: updated });

    logAuditEntry({
      actorUid: player.userId || `usr_player_${player.shirtNumber}`,
      actorEmail: `${player.name.toLowerCase().replace(/\s+/g, '.')}@students.ucu.ac.ug`,
      actorRole: 'player',
      action: 'UPDATE_CONSENT',
      targetCollection: 'players',
      targetId: player.id,
      details: `Student-athlete updated ${key} consent to ${updated[key] ? 'ENABLED' : 'DISABLED'}.`,
    });
  };

  const handleSaveNotes = () => {
    if (!appraisal) return;
    saveAppraisal({
      ...appraisal,
      playerNotes: selfEvalNotes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Find latest match and tagged clips
  const latestMatch = matches[0];
  const personalStats = latestMatch?.enteredStats[player.shirtNumber]?.stats || {};
  const taggedClips = latestMatch?.analysis?.events.filter(e => e.player_ref.includes(String(player.shirtNumber))) || [];

  return (
    <div className="space-y-6">
      {/* Athlete Hero Header Card */}
      <div className="bwin-hero p-6 sm:p-8 relative overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 shadow-md">
              <img
                src="/src/assets/images/avatar_athlete_titus_1793973784097.jpg"
                alt={player.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-blue-600 text-white font-mono text-xs font-bold px-1.5 py-0.5 rounded">
                #{player.shirtNumber}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-blue-600 uppercase tracking-wider">{player.position}</span>
                <span>·</span>
                <span>Year {player.yearOfStudy}</span>
                <span>·</span>
                <span>{player.faculty}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
                {player.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">{player.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[80px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Height</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{player.heightCm ? `${player.heightCm}cm` : 'N/A'}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[80px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Weight</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{player.weightKg ? `${player.weightKg}kg` : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Match Performance & Tagged Clips */}
        <div className="lg:col-span-7 space-y-6">
          {/* Latest Match Performance */}
          <div className="bwin-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Latest Match Box-Score</h2>
                <p className="text-xs text-slate-500 mt-0.5">vs {latestMatch?.opponent || 'Upcoming Match'}</p>
              </div>
              <span className="font-mono text-xs text-slate-400 font-medium">{latestMatch?.date}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {Object.entries(personalStats).map(([key, val]) => (
                <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">{key}</span>
                  <span className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Tagged Video Clips */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Your Tagged Match Video Clips ({taggedClips.length})
              </h3>

              {taggedClips.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                  No video events tagged for #{player.shirtNumber} in latest match.
                </div>
              ) : (
                <div className="space-y-2">
                  {taggedClips.map((evt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectClip(evt.timestamp_seconds)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-[#2954ea] group-hover:text-white text-blue-600 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 capitalize">
                            {evt.type} ({evt.outcome})
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{evt.note}</p>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-blue-600 tabular-nums">
                        {Math.floor(evt.timestamp_seconds / 60)}:{(evt.timestamp_seconds % 60).toString().padStart(2, '0')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coach Appraisal */}
          {appraisal && (
            <div className="bwin-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Coach Appraisal & Ratings</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Confidential Feedback</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {Object.entries(appraisal.ratings).map(([attr, score]) => (
                  <div key={attr} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block truncate">
                      {attr.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1 text-amber-500 font-mono font-black text-lg">
                      <span>{score}</span>
                      <span className="text-slate-300 text-xs">/ 5</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Coach Observations:</span>
                <p className="text-slate-600 leading-relaxed">{appraisal.coachComments}</p>
              </div>

              {/* Self Reflection */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Student-Athlete Self-Reflection:
                </label>
                <textarea
                  value={selfEvalNotes}
                  onChange={(e) => setSelfEvalNotes(e.target.value)}
                  placeholder="Record your game reflections and physical readiness..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2954ea] text-white shadow-xs"
                >
                  {isSaved ? 'Saved to Profile!' : 'Save Reflection'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Privacy Consent Switches & Season Progress */}
        <div className="lg:col-span-5 space-y-6">
          {/* Privacy Consent Switches */}
          <div className="bwin-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Privacy & Consent Switches</h2>
                <p className="text-xs text-slate-500">Student-athlete authority over analytics and scout visibility.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Scout Visibility (The Critical Rule) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scout Directory Visibility</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Allow accredited scouts to view your stats. (Personal contact details are never disclosed).
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('scoutVisible')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.scoutVisible ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.scoutVisible ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5 shadow-xs`}
                  />
                </button>
              </div>

              {/* AI Analysis */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-slate-900 block">AI Video Analysis</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Authorize multimodal video action detection on your gameplay clips.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('analysis')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.analysis ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.analysis ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5 shadow-xs`}
                  />
                </button>
              </div>

              {/* Team Sharing */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-slate-900 block">Team Staff Sharing</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Share telemetry with university physical therapy and nutrition specialists.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('teamSharing')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.teamSharing ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.teamSharing ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5 shadow-xs`}
                  />
                </button>
              </div>

              {/* Public Highlights */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-slate-900 block">Public Highlights</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Permit university media team to publish match clips on official university channels.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('publicHighlights')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.publicHighlights ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.publicHighlights ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5 shadow-xs`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Season Progression */}
          <div className="bwin-card p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Season Progression</h2>
            <div className="space-y-3">
              {Object.entries(player.seasonStats).map(([metric, val]) => (
                <div key={metric} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase text-slate-500 font-bold">{metric}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{val}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(val * 4, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
