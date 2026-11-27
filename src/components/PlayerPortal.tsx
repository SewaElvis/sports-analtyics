/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Student Athlete (Player) Portal:
 * - Latest Match Performance & Personal Numbers
 * - Tagged Video Clips for this Athlete
 * - Coach Appraisal & Performance Ratings
 * - Season Progression Metrics
 * - Athlete Self-Evaluation Submission
 * - Granular Privacy Consent Switches (Scout visibility firewall, analysis, sharing)
 */

import React, { useState } from 'react';
import { Player, Match, CoachAppraisal } from '../types';
import { updatePlayerConsents, logAuditEntry, saveAppraisal } from '../lib/storage';
import { 
  ShieldCheck, Lock, Play, Star, CheckCircle, 
  Sliders, Award, Clock
} from 'lucide-react';

interface PlayerPortalProps {
  player: Player;
  onUpdatePlayer: (updated: Player) => void;
  matches: Match[];
  appraisal?: CoachAppraisal;
  onSelectClipTimestamp: (time: number) => void;
}

export const PlayerPortal: React.FC<PlayerPortalProps> = ({
  player,
  onUpdatePlayer,
  matches,
  appraisal,
  onSelectClipTimestamp,
}) => {
  const [consents, setConsents] = useState(player.consents);
  const [selfEvalNotes, setSelfEvalNotes] = useState(appraisal?.playerNotes || '');
  const [isSavedSelfEval, setIsSavedSelfEval] = useState(false);

  // Toggle privacy switches with real-time audit logging
  const handleConsentToggle = (key: keyof Player['consents']) => {
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
      details: `Student-athlete adjusted ${key} consent to ${updated[key] ? 'ENABLED' : 'DISABLED'}.`,
    });
  };

  // Submit Self-Evaluation
  const handleSaveSelfEval = () => {
    if (!appraisal) return;
    const updatedAppraisal: CoachAppraisal = {
      ...appraisal,
      playerNotes: selfEvalNotes,
    };
    saveAppraisal(updatedAppraisal);
    setIsSavedSelfEval(true);
    setTimeout(() => setIsSavedSelfEval(false), 3000);

    logAuditEntry({
      actorUid: player.userId || `usr_player_${player.shirtNumber}`,
      actorEmail: `${player.name.toLowerCase().replace(/\s+/g, '.')}@students.ucu.ac.ug`,
      actorRole: 'player',
      action: 'UPDATE_PROFILE',
      targetCollection: 'appraisals',
      targetId: appraisal.id,
      details: `Submitted athlete self-evaluation notes for match review.`,
    });
  };

  // Filter latest published match events tagged for this player
  const latestMatch = matches.find(m => m.status === 'published' || m.status === 'needs_review');
  const playerStats = latestMatch?.enteredStats[player.shirtNumber]?.stats || {};
  const taggedEvents = latestMatch?.analysis?.events.filter(e => {
    return e.player_ref.includes(String(player.shirtNumber));
  }) || [];

  return (
    <div className="space-y-6">
      {/* Athlete Profile Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-mono text-zinc-300 font-bold">#{player.shirtNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{player.position}</span>
            <span aria-hidden="true">·</span>
            <span>Year {player.yearOfStudy}</span>
            <span aria-hidden="true">·</span>
            <span>{player.faculty}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {player.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{player.bio}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Height / Weight</span>
            <span className="text-sm font-semibold text-zinc-200 font-mono tabular-nums">
              {player.heightCm ? `${player.heightCm} cm` : 'N/A'} · {player.weightKg ? `${player.weightKg} kg` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Match Performance & Tagged Video Clips */}
        <div className="lg:col-span-7 space-y-6">
          {/* Latest Match Performance Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">Latest Match Performance</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Opponent: {latestMatch?.opponent || 'Upcoming Match'}
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">{latestMatch?.date}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {Object.entries(playerStats).map(([key, val]) => (
                <div key={key} className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 text-center">
                  <span className="text-xs uppercase text-zinc-400 block tracking-wider">{key}</span>
                  <span className="text-2xl font-bold text-white font-mono tabular-nums mt-1 block">
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Tagged Video Clips List */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Your Tagged Match Video Clips ({taggedEvents.length})
              </h4>

              {taggedEvents.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 bg-zinc-950 rounded-lg text-xs">
                  No video events tagged for #{player.shirtNumber} in latest match.
                </div>
              ) : (
                <div className="space-y-2">
                  {taggedEvents.map((evt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectClipTimestamp(evt.timestamp_seconds)}
                      className="w-full text-left p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-zinc-900 group-hover:bg-zinc-100 group-hover:text-zinc-950 text-zinc-300 flex items-center justify-center transition-colors">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-200 capitalize">
                            {evt.type} ({evt.outcome})
                          </div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1">{evt.note}</div>
                        </div>
                      </div>

                      <div className="font-mono text-xs text-zinc-400 tabular-nums">
                        {Math.floor(evt.timestamp_seconds / 60)}:{(evt.timestamp_seconds % 60).toString().padStart(2, '0')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coach Appraisal Card */}
          {appraisal && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-zinc-400" />
                  <span>Coach Match Appraisal & Ratings</span>
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Confidential to Athlete</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {Object.entries(appraisal.ratings).map(([attr, score]) => (
                  <div key={attr} className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                    <span className="text-[11px] text-zinc-400 capitalize block truncate">
                      {attr.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1 text-amber-400 font-mono font-bold text-lg">
                      <span>{score}</span>
                      <span className="text-zinc-600 text-xs">/ 5</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-850 text-xs space-y-1">
                <span className="font-semibold text-zinc-300 block">Head Coach Observations:</span>
                <p className="text-zinc-400 leading-relaxed">{appraisal.coachComments}</p>
              </div>

              {/* Student Self-Evaluation Form */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Athlete Self-Evaluation & Reflection:
                </label>
                <textarea
                  value={selfEvalNotes}
                  onChange={(e) => setSelfEvalNotes(e.target.value)}
                  placeholder="Record your own reflections on tactical execution, physical readiness, and areas for film review..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-zinc-500 transition-colors"
                />
                <button
                  onClick={handleSaveSelfEval}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors"
                >
                  {isSavedSelfEval ? 'Reflection Saved!' : 'Save Self-Evaluation'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Privacy Consent Switches & Season Progression */}
        <div className="lg:col-span-5 space-y-6">
          {/* Privacy Consent Switches Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">Privacy & Data Consent Controls</h3>
                <p className="text-[11px] text-zinc-400">
                  Granular student-athlete authority over analytics, scout indexing, and sharing.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Scout Visibility (The Critical Firewall Rule) */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Scout Directory Visibility</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Allow verified talent scouts to discover your athletic profile. (Personal contact info is always hidden).
                  </p>
                </div>
                <button
                  onClick={() => handleConsentToggle('scoutVisible')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.scoutVisible ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.scoutVisible ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* AI Video Analysis */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-semibold text-zinc-200 block">AI Video Analysis</span>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Consent to multimodal video event detection and biometric event logging.
                  </p>
                </div>
                <button
                  onClick={() => handleConsentToggle('analysis')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.analysis ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.analysis ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* Team Staff Sharing */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-semibold text-zinc-200 block">Team Staff Sharing</span>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Share performance metrics with university medical, conditioning, and nutrition staff.
                  </p>
                </div>
                <button
                  onClick={() => handleConsentToggle('teamSharing')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.teamSharing ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.teamSharing ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* Public Highlights */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 flex items-start justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-semibold text-zinc-200 block">Public Highlights</span>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Authorize university media department to include match clips in public reels.
                  </p>
                </div>
                <button
                  onClick={() => handleConsentToggle('publicHighlights')}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    consents.publicHighlights ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      consents.publicHighlights ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Season Progression Chart / Metrics */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm">2025/2026 Season Performance Averages</h3>
            <div className="space-y-3">
              {Object.entries(player.seasonStats).map(([metric, val]) => (
                <div key={metric} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase text-zinc-400 font-mono tracking-wider">{metric}</span>
                    <span className="font-mono font-bold text-zinc-200 tabular-nums">{val}</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                    <div
                      className="bg-zinc-100 h-full rounded-full"
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
