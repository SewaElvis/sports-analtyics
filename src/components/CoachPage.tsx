/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dedicated Coach Workspace Page
 * Pristine, uncrowded layout with Video Deck, Offline Box-Scores, Fusion & Reports
 */

import React, { useState } from 'react';
import { Match, Player, FusionFlag, MatchReport } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { VideoGeneratorModal } from './VideoGeneratorModal';
import { computeStatisticalFusion } from '../lib/fusionEngine';
import { logAuditEntry } from '../lib/storage';
import { 
  Play, Plus, Minus, CheckCircle, AlertTriangle, Sparkles, 
  Send, RefreshCw, Clock, Film, Layers, FileCheck, ArrowRight,
  Compass, Bot, Video
} from 'lucide-react';

interface CoachPageProps {
  match: Match;
  onUpdateMatch: (updated: Match) => void;
  squad: Player[];
  onPublishReport: (matchId: string, report: MatchReport) => void;
  onSelectOtherMatch: () => void;
}

export const CoachPage: React.FC<CoachPageProps> = ({
  match,
  onUpdateMatch,
  squad,
  onPublishReport,
  onSelectOtherMatch,
}) => {
  const [activeSection, setActiveSection] = useState<'video' | 'boxscore' | 'fusion' | 'report'>('video');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [flags, setFlags] = useState<FusionFlag[]>(() => {
    if (match.analysis?.events) {
      return computeStatisticalFusion(match.enteredStats, match.analysis.events).flags;
    }
    return [];
  });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const sportMetrics = match.sportId === 'basketball'
    ? ['shots', 'assists', 'rebounds', 'fouls', 'turnovers']
    : match.sportId === 'netball'
    ? ['goals', 'attempts', 'feeds', 'interceptions', 'turnovers']
    : ['goals', 'shots', 'passes', 'tackles', 'fouls'];

  // Handle Box-Score Count Adjustments
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

    if (match.analysis?.events) {
      const fusion = computeStatisticalFusion(updatedStats, match.analysis.events);
      setFlags(fusion.flags);
    }

    logAuditEntry({
      actorUid: 'usr_coach_natuhereza',
      actorEmail: 'coach.natuhereza@ucu.ac.ug',
      actorRole: 'coach',
      action: 'UPDATE_STATS',
      targetCollection: 'matches',
      targetId: match.id,
      details: `Adjusted ${metric} for #${shirtNumber} to ${newVal}.`,
    });
  };

  // Trigger Gemini Video Analysis
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

        const fusion = computeStatisticalFusion(match.enteredStats, data.analysis.events);
        setFlags(fusion.flags);

        logAuditEntry({
          actorUid: 'usr_coach_natuhereza',
          actorEmail: 'coach.natuhereza@ucu.ac.ug',
          actorRole: 'coach',
          action: 'VIEW_REPORT',
          targetCollection: 'analyses',
          targetId: match.id,
          details: `Gemini Multimodal Video Analysis completed. Extracted ${data.analysis.events.length} events.`,
        });
      }
    } catch (err) {
      console.error('Gemini analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resolve Discrepancy Flag
  const handleResolveFlag = (flagId: string, resolution: 'coach' | 'gemini') => {
    const updatedFlags = flags.map(f => {
      if (f.id === flagId) {
        return {
          ...f,
          status: (resolution === 'coach' ? 'resolved_coach' : 'resolved_gemini') as FusionFlag['status'],
          resolutionNote: resolution === 'coach' ? 'Confirmed coach observation' : 'Accepted AI video detection',
        };
      }
      return f;
    });
    setFlags(updatedFlags);

    const flag = flags.find(f => f.id === flagId);
    if (flag && resolution === 'gemini') {
      handleStatChange(flag.playerShirt, flag.metric, flag.geminiCount - flag.coachCount);
    }

    logAuditEntry({
      actorUid: 'usr_coach_natuhereza',
      actorEmail: 'coach.natuhereza@ucu.ac.ug',
      actorRole: 'coach',
      action: 'RESOLVE_FLAG',
      targetCollection: 'reports',
      targetId: flagId,
      details: `Resolved flag for #${flag?.playerShirt} (${flag?.metric}): accepted ${resolution.toUpperCase()} value.`,
    });
  };

  // Generate Grounded Report
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
        onUpdateMatch({
          ...match,
          report: data.report,
        });
        setActiveSection('report');
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Publish Report
  const handlePublish = () => {
    if (!match.report) return;
    const published: MatchReport = {
      ...match.report,
      status: 'published',
      approvedBy: 'coach_natuhereza',
      publishedAt: new Date().toISOString(),
    };
    onPublishReport(match.id, published);
  };

  const handleDownloadReport = () => {
    const csvRows = [
      `UCU SPORTS DEPARTMENT - MATCH STATISTICAL REPORT`,
      `Match: ${match.opponent} (${match.sportId.toUpperCase()})`,
      `Date: ${match.date}`,
      `Status: ${match.status}`,
      ``,
      `PLAYER BOX-SCORE STATISTICS`,
      `Shirt Number,Player Name,${sportMetrics.join(',')}`,
      ...Object.entries(match.enteredStats).map(([num, data]) => {
        const statsVals = sportMetrics.map(m => data.stats[m] || 0).join(',');
        return `${num},"${data.name}",${statsVals}`;
      }),
      ``,
      `AI VIDEO ANALYSIS & FUSION FLAGS`,
      `Event Count: ${match.analysis?.events?.length || 0}`,
      `Video Quality Score: ${match.analysis?.video_quality?.score_0_to_1 || 'N/A'}`,
      `Flags Count: ${flags.length}`,
      ``,
      `VERIFIED REPORT SUMMARY`,
      match.report?.sections?.map(s => `"${s.title}","${s.content}"`).join('\n') || 'No published report yet.'
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UCU_Match_Report_${match.opponent.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAuditEntry({
      actorUid: 'usr_coach_natuhereza',
      actorEmail: 'coach.natuhereza@ucu.ac.ug',
      actorRole: 'coach',
      action: 'VIEW_REPORT',
      targetCollection: 'reports',
      targetId: match.id,
      details: `Downloaded match statistical report for ${match.opponent}.`,
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Match Selector Bar */}
      <div className="bwin-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="uppercase tracking-wider font-bold text-blue-600">Coach Match Studio</span>
            <span>·</span>
            <span>{match.sportId === 'basketball' ? 'Canons Basketball' : 'Cardinals Football'}</span>
            <span>·</span>
            <span className="font-mono">{match.date}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            vs {match.opponent} {match.score && `(${match.score.ucu} - ${match.score.opponent})`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>📥 Download Report (.CSV)</span>
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveSection('video')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'video'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Video Analysis
          </button>
          <button
            onClick={() => setActiveSection('boxscore')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'boxscore'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Box-Score Log
          </button>
          <button
            onClick={() => setActiveSection('fusion')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSection === 'fusion'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Fusion Matrix</span>
            {flags.filter(f => f.status === 'pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                {flags.filter(f => f.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('report')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeSection === 'report'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report & Publish
          </button>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            title="Generate AI video play using gemini-omni-1.2-flash"
          >
            <Video className="w-3.5 h-3.5 text-purple-600" />
            <span>Generate Video</span>
          </button>

          <button
            onClick={() => { window.location.hash = 'arena'; }}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            title="Launch 3D Tactical Arena"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>3D Arena</span>
          </button>

          <button
            onClick={() => { window.location.hash = 'assistant'; }}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            title="Open Gemini AI Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>Tactical AI</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: VIDEO ANALYSIS STUDIO */}
      {activeSection === 'video' && (
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

            {/* Tactical Notes Summary */}
            {match.analysis?.team_summary && (
              <div className="bwin-card p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Gemini Multimodal Observations</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-1">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-900 block mb-1">Possession Dynamics</strong>
                    <p>{match.analysis.team_summary.possession_notes}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-900 block mb-1">Tempo Notes</strong>
                    <p>{match.analysis.team_summary.tempo_notes}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-900 block mb-1">Tactical Shift</strong>
                    <p>{match.analysis.team_summary.late_game_changes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Extracted Event Timeline */}
          <div className="lg:col-span-5 bwin-card p-5 flex flex-col h-[540px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Extracted Events Feed</h3>
                <p className="text-xs text-slate-500">Click any action to jump video directly to timestamp.</p>
              </div>
              <span className="font-mono text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                {match.analysis?.events?.length || 0} Events
              </span>
            </div>

            <div className="overflow-y-auto space-y-2 mt-3 flex-1 pr-1">
              {!match.analysis?.events || match.analysis.events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Film className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                  <p className="text-xs">No video footage analyzed yet.</p>
                  <button
                    onClick={handleRunGeminiAnalysis}
                    className="mt-3 px-4 py-2 text-xs font-bold rounded-xl bg-[#2954ea] text-white shadow-xs"
                  >
                    Run Multimodal Analysis
                  </button>
                </div>
              ) : (
                match.analysis.events.map((evt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTimestamp(evt.timestamp_seconds)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/60 hover:border-blue-200 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {formatSeconds(evt.timestamp_seconds)}
                        </span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {evt.type}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{evt.player_ref}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-1">{evt.note}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {Math.round(evt.confidence * 100)}% conf
                      </span>
                      <span className={`text-[10px] uppercase font-bold ${
                        evt.outcome === 'success' ? 'text-emerald-600' : evt.outcome === 'fail' ? 'text-rose-500' : 'text-slate-400'
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

      {/* SECTION 2: LIVE OFFLINE BOX-SCORE COUNTERS */}
      {activeSection === 'boxscore' && (
        <div className="bwin-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Roster Box-Score Logging (Offline-Capable)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record active shots, rebounds, fouls, or passes. Changes persist locally and sync seamlessly.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="font-medium">Local Storage Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-3">Player</th>
                  <th className="py-3 px-3 text-center font-mono">#</th>
                  {sportMetrics.map(m => (
                    <th key={m} className="py-3 px-3 text-center capitalize">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {squad.map((player) => {
                  const stats = match.enteredStats[player.shirtNumber]?.stats || {};
                  return (
                    <tr key={player.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{player.name}</div>
                        <div className="text-xs text-slate-500">{player.position}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        #{player.shirtNumber}
                      </td>
                      {sportMetrics.map((metric) => {
                        const val = stats[metric] || 0;
                        return (
                          <td key={metric} className="py-3 px-2 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                              <button
                                onClick={() => handleStatChange(player.shirtNumber, metric, -1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-mono font-bold text-slate-900 tabular-nums">
                                {val}
                              </span>
                              <button
                                onClick={() => handleStatChange(player.shirtNumber, metric, 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
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

      {/* SECTION 3: STATISTICAL FUSION CONFLICT MATRIX */}
      {activeSection === 'fusion' && (
        <div className="bwin-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Statistical Fusion Conflict Matrix</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Zero Silent Overwrites
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Comparing coach box-score tallies against multimodal Gemini detected events per shirt number.
              </p>
            </div>

            <button
              onClick={() => {
                if (match.analysis?.events) {
                  const fusion = computeStatisticalFusion(match.enteredStats, match.analysis.events);
                  setFlags(fusion.flags);
                }
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Evaluate</span>
            </button>
          </div>

          {flags.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-base">Perfect Concordance</p>
              <p className="text-xs text-slate-500 mt-1">
                Every coach stat perfectly matches the video events extracted by Gemini. No discrepancies found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    flag.status === 'pending'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          #{flag.playerShirt} {flag.playerName}
                        </span>
                        <span>·</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                          {flag.metric} Count Discrepancy
                        </span>
                        <span>·</span>
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          Delta: {flag.discrepancy}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-slate-700 mt-2 font-mono">
                        <div>Coach Box-Score: <strong className="text-base text-slate-900">{flag.coachCount}</strong></div>
                        <div>Gemini Video Events: <strong className="text-base text-slate-900">{flag.geminiCount}</strong></div>
                      </div>

                      {/* Video Clip Anchors */}
                      {flag.clipTimes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          <span className="text-[11px] text-slate-500 font-medium">Video Anchors:</span>
                          {flag.clipTimes.map((sec, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedTimestamp(sec);
                                setActiveSection('video');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-mono text-xs shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>{formatSeconds(sec)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {flag.resolutionNote && (
                        <p className="text-xs text-emerald-700 font-semibold mt-2.5">
                          ✓ {flag.resolutionNote}
                        </p>
                      )}
                    </div>

                    {flag.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveFlag(flag.id, 'coach')}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors shadow-2xs"
                        >
                          Confirm Coach ({flag.coachCount})
                        </button>
                        <button
                          onClick={() => handleResolveFlag(flag.id, 'gemini')}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white transition-colors shadow-sm"
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

      {/* SECTION 4: GROUNDED REPORT WRITER & SIGN-OFF GATE */}
      {activeSection === 'report' && (
        <div className="bwin-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Grounded Match Report & Numerical Verification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI report grounded exclusively in confirmed match data. Zero hallucinated metrics allowed.
              </p>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-5 py-2.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isGeneratingReport ? 'Compiling Report...' : 'Generate Grounded Report'}</span>
            </button>
          </div>

          {!match.report ? (
            <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
              <FileCheck className="w-12 h-12 mx-auto mb-2 stroke-1 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No Report Drafted</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Generate a plain-English match report. The deterministic Number Checker verifies all stats before publication.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Number Checker Badge */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                match.report.checkerAudit.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-sm">
                    {match.report.checkerAudit.passed
                      ? 'Numerical Grounding Audit: 100% PASSED'
                      : 'Audit Warning: Unverified Numbers Flagged'}
                  </div>
                  <p className="mt-0.5 text-slate-600">
                    Verified {match.report.checkerAudit.totalNumbersChecked} numbers against box-score tallies and video timestamps.
                  </p>
                </div>
              </div>

              {/* Report Content Blocks */}
              <div className="space-y-4">
                {match.report.sections.map((section, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{section.title}</h4>
                      {section.clipTimestamps.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400 mr-1">Clips:</span>
                          {section.clipTimestamps.map((sec, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedTimestamp(sec);
                                setActiveSection('video');
                              }}
                              className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-white border border-slate-200 text-blue-700 hover:bg-blue-50"
                            >
                              {formatSeconds(sec)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Publish Bar */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <strong className="text-slate-800">Student Protection Rule:</strong> Nothing is released to athlete portals or scouts until you officially sign off and publish.
                </div>

                <button
                  onClick={handlePublish}
                  disabled={match.report.status === 'published'}
                  className="px-6 py-2.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{match.report.status === 'published' ? 'Report Published & Tags Active' : 'Sign-Off & Publish Report'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text-to-Video Generator Modal */}
      <VideoGeneratorModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};
