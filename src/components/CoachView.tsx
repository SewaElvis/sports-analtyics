/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Coach Match Workspace:
 * - Line-up & Offline Box-Score Counters
 * - Multimodal Video Analysis & Clip Jumping
 * - Statistical Fusion Conflict Matrix
 * - Grounded Report Writer with Strict Number Checker
 * - Review, Tag Confirmation & Publish Gate
 */

import React, { useState } from 'react';
import { Match, Player, GeminiVideoEvent, FusionFlag, MatchReport } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { computeStatisticalFusion } from '../lib/fusionEngine';
import { logAuditEntry } from '../lib/storage';
import { 
  Plus, Minus, CheckCircle, AlertCircle, FileText, Send, 
  Sparkles, ShieldCheck, RefreshCw, Layers, Clock, User
} from 'lucide-react';

interface CoachViewProps {
  match: Match;
  onUpdateMatch: (updated: Match) => void;
  squad: Player[];
  onPublishReport: (matchId: string, report: MatchReport) => void;
}

export const CoachView: React.FC<CoachViewProps> = ({
  match,
  onUpdateMatch,
  squad,
  onPublishReport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'video_analysis' | 'stats_entry' | 'fusion' | 'report'>('video_analysis');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [flags, setFlags] = useState<FusionFlag[]>(() => {
    if (match.analysis?.events) {
      return computeStatisticalFusion(match.enteredStats, match.analysis.events).flags;
    }
    return [];
  });

  const sportMetrics = match.sportId === 'basketball'
    ? ['shots', 'assists', 'rebounds', 'fouls', 'turnovers']
    : ['goals', 'shots', 'passes', 'tackles', 'fouls'];

  // Handle Box-Score Count Adjustments (Offline capable)
  const handleStatChange = (shirtNumber: number, metric: string, delta: number) => {
    const updatedStats = { ...match.enteredStats };
    if (!updatedStats[shirtNumber]) {
      const player = squad.find(p => p.shirtNumber === shirtNumber);
      updatedStats[shirtNumber] = {
        name: player?.name || `Player #${shirtNumber}`,
        stats: {},
      };
    }

    const currentVal = updatedStats[shirtNumber].stats[metric] || 0;
    const newVal = Math.max(0, currentVal + delta);
    updatedStats[shirtNumber].stats[metric] = newVal;

    const updatedMatch: Match = {
      ...match,
      enteredStats: updatedStats,
      lastUpdated: new Date().toISOString(),
    };

    onUpdateMatch(updatedMatch);

    // Re-run fusion comparison
    if (match.analysis?.events) {
      const fusion = computeStatisticalFusion(updatedStats, match.analysis.events);
      setFlags(fusion.flags);
    }

    logAuditEntry({
      actorUid: 'usr_coach_current',
      actorEmail: 'coach@ucu.ac.ug',
      actorRole: 'coach',
      action: 'UPDATE_STATS',
      targetCollection: 'matches',
      targetId: match.id,
      details: `Adjusted ${metric} for #${shirtNumber} to ${newVal}.`,
    });
  };

  // Trigger Gemini Video Analysis via Server-Side API
  const handleRunGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportId: match.sportId,
          matchName: `${match.opponent} Match`,
          videoMetadata: { durationSeconds: 600 },
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        const updatedMatch: Match = {
          ...match,
          analysis: data.analysis,
          status: 'needs_review',
        };
        onUpdateMatch(updatedMatch);

        // Run fusion comparison
        const fusion = computeStatisticalFusion(match.enteredStats, data.analysis.events);
        setFlags(fusion.flags);

        logAuditEntry({
          actorUid: 'usr_coach_current',
          actorEmail: 'coach@ucu.ac.ug',
          actorRole: 'coach',
          action: 'VIEW_REPORT',
          targetCollection: 'analyses',
          targetId: match.id,
          details: `Processed Gemini video event analysis. Extracted ${data.analysis.events.length} events.`,
        });
      }
    } catch (err) {
      console.error('Failed to run Gemini analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resolve Fusion Discrepancy Flag
  const handleResolveFlag = (flagId: string, resolution: 'coach' | 'gemini') => {
    const updatedFlags = flags.map(f => {
      if (f.id === flagId) {
        return {
          ...f,
          status: (resolution === 'coach' ? 'resolved_coach' : 'resolved_gemini') as FusionFlag['status'],
          resolutionNote: resolution === 'coach' ? 'Confirmed coach manual tally' : 'Accepted video-detected event tally',
        };
      }
      return f;
    });
    setFlags(updatedFlags);

    const flag = flags.find(f => f.id === flagId);
    if (flag && resolution === 'gemini') {
      // Update coach stats to match Gemini
      handleStatChange(flag.playerShirt, flag.metric, flag.geminiCount - flag.coachCount);
    }

    logAuditEntry({
      actorUid: 'usr_coach_current',
      actorEmail: 'coach@ucu.ac.ug',
      actorRole: 'coach',
      action: 'RESOLVE_FLAG',
      targetCollection: 'reports',
      targetId: flagId,
      details: `Resolved flag for #${flag?.playerShirt} (${flag?.metric}): accepted ${resolution.toUpperCase()} value.`,
    });
  };

  // Generate Grounded Match Report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchData: match,
          resolvedFlags: flags,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        const updatedMatch: Match = {
          ...match,
          report: data.report,
        };
        onUpdateMatch(updatedMatch);
        setActiveSubTab('report');
      }
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Coach Final Confirmation & Publication Gate
  const handleFinalPublish = () => {
    if (!match.report) return;
    const publishedReport: MatchReport = {
      ...match.report,
      status: 'published',
      approvedBy: 'coach_natuhereza',
      publishedAt: new Date().toISOString(),
    };

    onPublishReport(match.id, publishedReport);

    logAuditEntry({
      actorUid: 'usr_coach_current',
      actorEmail: 'coach@ucu.ac.ug',
      actorRole: 'coach',
      action: 'PUBLISH_REPORT',
      targetCollection: 'reports',
      targetId: publishedReport.id,
      details: `Coach published official match report. Athlete tags activated.`,
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Match Header Strip */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="uppercase tracking-wider font-semibold text-zinc-300">
              {match.sportId === 'basketball' ? 'UCU Canons' : 'UCU Cardinals'}
            </span>
            <span aria-hidden="true">·</span>
            <span>vs {match.opponent}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{match.date}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Match Deck: {match.opponent} ({match.score ? `${match.score.ucu} - ${match.score.opponent}` : 'Scheduled'})
          </h1>
        </div>

        {/* Status & Sub-tab navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="inline-flex p-1 rounded-lg bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setActiveSubTab('video_analysis')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'video_analysis' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Video & AI
            </button>
            <button
              onClick={() => setActiveSubTab('stats_entry')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'stats_entry' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Box-Score (Offline)
            </button>
            <button
              onClick={() => setActiveSubTab('fusion')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'fusion' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Fusion</span>
              {flags.filter(f => f.status === 'pending').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] flex items-center justify-center font-bold">
                  {flags.filter(f => f.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('report')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'report' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Report & Publish
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Video Analysis & AI Event Timeline */}
      {activeSubTab === 'video_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <VideoPlayer
              videoUrl={match.videoUrl}
              events={match.analysis?.events}
              videoQuality={match.analysis?.video_quality}
              selectedTimestamp={selectedTimestamp}
              onSelectTimestamp={(t) => setSelectedTimestamp(t)}
              onAnalyzeTrigger={handleRunGeminiAnalysis}
              isAnalyzing={isAnalyzing}
            />

            {/* AI Team Summary Breakdown */}
            {match.analysis?.team_summary && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs space-y-2">
                <h3 className="font-semibold text-zinc-200 text-sm">Gemini Multimodal Observations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-zinc-400 pt-1">
                  <div>
                    <strong className="text-zinc-300 block mb-0.5">Possession Notes</strong>
                    <p>{match.analysis.team_summary.possession_notes}</p>
                  </div>
                  <div>
                    <strong className="text-zinc-300 block mb-0.5">Tempo Notes</strong>
                    <p>{match.analysis.team_summary.tempo_notes}</p>
                  </div>
                  <div>
                    <strong className="text-zinc-300 block mb-0.5">Late-Game Shifts</strong>
                    <p>{match.analysis.team_summary.late_game_changes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detected Events Feed with Click-to-Jump */}
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">AI Detected Match Events</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Click any event row to seek video to that timestamp.
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-zinc-400">
                {match.analysis?.events?.length || 0} Events
              </span>
            </div>

            <div className="overflow-y-auto space-y-2 mt-3 flex-1 pr-1">
              {!match.analysis?.events || match.analysis.events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <Clock className="w-8 h-8 mb-2 stroke-1" />
                  <p className="text-xs">No video events analyzed yet.</p>
                  <button
                    onClick={handleRunGeminiAnalysis}
                    className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  >
                    Run Gemini Video Analysis
                  </button>
                </div>
              ) : (
                match.analysis.events.map((evt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTimestamp(evt.timestamp_seconds)}
                    className="w-full text-left p-2.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-850 hover:border-zinc-700 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold tabular-nums text-zinc-300">
                          {formatSeconds(evt.timestamp_seconds)}
                        </span>
                        <span className="text-zinc-600" aria-hidden="true">·</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-zinc-200">
                          {evt.type}
                        </span>
                        <span className="text-zinc-600" aria-hidden="true">·</span>
                        <span className="text-xs text-zinc-400">{evt.player_ref}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{evt.note}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                        {Math.round(evt.confidence * 100)}% conf
                      </span>
                      <span className={`block text-[10px] uppercase font-semibold ${
                        evt.outcome === 'success' ? 'text-emerald-400' : evt.outcome === 'fail' ? 'text-rose-400' : 'text-zinc-500'
                      }`}>
                        {evt.outcome}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Coach Live Box-Score & Line-Up Entry (Offline Capable) */}
      {activeSubTab === 'stats_entry' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Official Roster & Box-Score Counters</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Increment or decrement player actions in real-time. Automatically saves locally and syncs to cloud.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Offline Persistence Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3 font-mono text-center">#</th>
                  {sportMetrics.map(m => (
                    <th key={m} className="py-2.5 px-3 text-center capitalize">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {squad.map((player) => {
                  const playerStats = match.enteredStats[player.shirtNumber]?.stats || {};
                  return (
                    <tr key={player.id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-200">{player.name}</div>
                        <div className="text-xs text-zinc-400">{player.position}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-center font-bold text-zinc-300">
                        {player.shirtNumber}
                      </td>
                      {sportMetrics.map((metric) => {
                        const val = playerStats[metric] || 0;
                        return (
                          <td key={metric} className="py-3 px-2 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                              <button
                                onClick={() => handleStatChange(player.shirtNumber, metric, -1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-mono font-semibold tabular-nums text-zinc-100">
                                {val}
                              </span>
                              <button
                                onClick={() => handleStatChange(player.shirtNumber, metric, 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Statistical Fusion Discrepancy Matrix */}
      {activeSubTab === 'fusion' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <span>Statistical Fusion Conflict Engine</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Rule: Never Overwrite Silently
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Comparing coach-entered tallies against multimodal Gemini detected events per player shirt number.
              </p>
            </div>

            <button
              onClick={() => {
                if (match.analysis?.events) {
                  const fusion = computeStatisticalFusion(match.enteredStats, match.analysis.events);
                  setFlags(fusion.flags);
                }
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Evaluate Fusion</span>
            </button>
          </div>

          {flags.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 bg-zinc-950/60 rounded-xl border border-zinc-850">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-zinc-200">Full Alignment Achieved</p>
              <p className="text-xs text-zinc-500 mt-1">
                All coach box-score tallies perfectly match AI video event counts. No conflict flags exist.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className={`p-4 rounded-xl border transition-all ${
                    flag.status === 'pending'
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : 'bg-zinc-950 border-zinc-800 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          #{flag.playerShirt} {flag.playerName}
                        </span>
                        <span className="text-zinc-600" aria-hidden="true">·</span>
                        <span className="text-xs font-semibold capitalize text-amber-300">
                          {flag.metric} Conflict
                        </span>
                        <span className="text-zinc-600" aria-hidden="true">·</span>
                        <span className="text-xs text-zinc-400 font-mono tabular-nums">
                          Δ {flag.discrepancy}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-300 mt-2 font-mono tabular-nums">
                        <div>Coach Entry: <strong className="text-white text-sm">{flag.coachCount}</strong></div>
                        <div>Gemini Video Count: <strong className="text-white text-sm">{flag.geminiCount}</strong></div>
                      </div>

                      {/* Video Clip Timestamps Anchors */}
                      {flag.clipTimes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <span className="text-[11px] text-zinc-500">Clip Timestamps:</span>
                          {flag.clipTimes.map((sec, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedTimestamp(sec);
                                setActiveSubTab('video_analysis');
                              }}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-xs transition-colors flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span>{formatSeconds(sec)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {flag.resolutionNote && (
                        <p className="text-xs text-emerald-400 mt-2 font-medium">
                          ✓ {flag.resolutionNote}
                        </p>
                      )}
                    </div>

                    {flag.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveFlag(flag.id, 'coach')}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                        >
                          Confirm Coach ({flag.coachCount})
                        </button>
                        <button
                          onClick={() => handleResolveFlag(flag.id, 'gemini')}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors"
                        >
                          Accept AI ({flag.geminiCount})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Grounded Report Writer & Verification Checker */}
      {activeSubTab === 'report' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Grounded Match Report & Numerical Audit
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every numerical statistic is verified against match data prior to coach sign-off.
              </p>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
              <span>{isGeneratingReport ? 'Compiling Report...' : 'Generate AI Report'}</span>
            </button>
          </div>

          {!match.report ? (
            <div className="p-10 text-center text-zinc-500 bg-zinc-950/40 rounded-xl border border-zinc-850">
              <FileText className="w-10 h-10 mx-auto mb-2 stroke-1 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-300">No Match Report Drafted Yet</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Click &quot;Generate AI Report&quot; above to compose an analytical summary grounded strictly in the computed match data and resolved fusion tallies.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Number Checker Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                match.report.checkerAudit.passed
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
              }`}>
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                <div className="text-xs">
                  <div className="font-semibold text-sm">
                    {match.report.checkerAudit.passed
                      ? 'Numerical Grounding Audit: PASSED'
                      : 'Numerical Grounding Audit: Discrepancy Flagged'}
                  </div>
                  <p className="mt-0.5 text-zinc-300">
                    Checked {match.report.checkerAudit.totalNumbersChecked} extracted numbers against verified match box-scores and event timestamps.
                  </p>
                  {match.report.checkerAudit.flaggedSentences.length > 0 && (
                    <div className="mt-2 space-y-1 text-amber-300 font-mono text-[11px]">
                      {match.report.checkerAudit.flaggedSentences.map((flag, idx) => (
                        <div key={idx}>⚠️ {flag}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Report Sections */}
              <div className="space-y-4">
                {match.report.sections.map((section, idx) => (
                  <div key={idx} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-200 text-sm">{section.title}</h4>
                      {section.clipTimestamps.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-500">Clips:</span>
                          {section.clipTimestamps.map((sec, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedTimestamp(sec);
                                setActiveSubTab('video_analysis');
                              }}
                              className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300 hover:text-white"
                            >
                              {formatSeconds(sec)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coach Sign-off & Publish Button */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-zinc-400">
                  <p>
                    <strong>Publication Policy:</strong> Nothing reaches student-athlete portals until you officially publish this report.
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    Publishing generates personalized clips, updates season metrics, and notifies tagged athletes.
                  </p>
                </div>

                <button
                  onClick={handleFinalPublish}
                  disabled={match.report.status === 'published'}
                  className="px-5 py-2.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{match.report.status === 'published' ? 'Report Published & Tags Active' : 'Sign-Off & Publish Report'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
