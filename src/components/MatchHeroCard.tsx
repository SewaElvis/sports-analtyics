/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Featured Match Hero Card directly mirroring the bwin showcase card in the reference image:
 * - Left: Team badges, league name, team names, odds/stat pills (yellow, dark, light blue)
 * - Center/Right: Prominent player cutout image in university white jersey
 * - Top Right: Avatar cluster + time badge (23:30 · 28 Oct 2026)
 * - Right Edge: Red vertical badge with briefcase icon and "New tips"
 * - Bottom: Starters avatar cluster + tips pill (+10 tips)
 */

import React from 'react';
import { Match } from '../types';
import { Play, Sparkles, Clock, CheckCircle2, AlertTriangle, Layers, Briefcase } from 'lucide-react';

interface MatchHeroCardProps {
  match: Match;
  onOpenDeck: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const MatchHeroCard: React.FC<MatchHeroCardProps> = ({
  match,
  onOpenDeck,
  onAnalyze,
  isAnalyzing,
}) => {
  const isBasketball = match.sportId === 'basketball';
  const teamTitle = isBasketball ? 'UCU Canons' : 'UCU Cardinals';
  const opponentTitle = match.opponent;
  const leagueName = isBasketball ? 'Premier League · NBL Conference' : 'Premier League · University Football League';

  return (
    <div className="bwin-hero relative overflow-hidden bg-white p-6 sm:p-8 transition-all hover:shadow-xl">
      {/* Red Vertical Pill on the right edge (mirroring "New tips" in reference image) */}
      <button
        onClick={onOpenDeck}
        className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff3b53] hover:bg-[#e02e45] text-white py-5 px-3 rounded-l-2xl shadow-lg flex-col items-center gap-1.5 cursor-pointer transition-colors z-20 group"
      >
        <Briefcase className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
          Match Video
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Information Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Row: Team Crests + League Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 shadow-2xs">
                {isBasketball ? '🏀' : '⚽'}
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shadow-2xs">
                VS
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">{leagueName}</span>
          </div>

          {/* Big Matchup Title (Two-line layout from reference: Real Madrid / Atletico Madrid) */}
          <div className="space-y-0.5">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-['Barlow_Condensed'] uppercase leading-none">
              {teamTitle}
            </h2>
            <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-400 font-['Barlow_Condensed'] uppercase leading-none">
              {opponentTitle}
            </h3>
          </div>

          {/* Odds / Stat Pills (matching reference: HAS 1.29 (yellow), Draw 1.82 (dark), ATM 1.12 (blue)) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-amber-900 border border-amber-300/80 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer shadow-2xs">
              <span className="text-amber-700 text-[10px] uppercase mr-1">UCU Win</span>
              <span>1.29</span>
            </div>

            <div className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer shadow-2xs">
              <span className="text-slate-400 text-[10px] uppercase mr-1">Draw</span>
              <span>1.82</span>
            </div>

            <div className="bg-[#e0e7ff] hover:bg-[#c7d2fe] text-indigo-900 border border-indigo-200 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer shadow-2xs">
              <span className="text-indigo-600 text-[10px] uppercase mr-1">Opp</span>
              <span>1.12</span>
            </div>

            {match.score && (
              <div className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold ml-1">
                Score: {match.score.ucu} - {match.score.opponent}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDeck}
              className="px-6 py-2.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Video Deck & Stats</span>
            </button>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isAnalyzing ? 'Gemini Analyzing...' : 'Run Multimodal AI'}</span>
            </button>
          </div>
        </div>

        {/* Right Athlete Showcase Column (matching James Rodriguez cutout in reference) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-sm aspect-4/3 sm:aspect-square flex items-center justify-center">
            {/* Soft decorative background radial glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-blue-50 to-transparent rounded-full filter blur-2xl opacity-75 pointer-events-none" />

            {/* Featured Athlete Image */}
            <img
              src="/src/assets/images/ucu_athlete_showcase_1793973783235.jpg"
              alt="Featured UCU Athlete"
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-full object-cover rounded-3xl shadow-lg border-2 border-white"
            />

            {/* Floating Top-Right Time Badge + Avatar Stack (mirroring "23:30 · 28 Jun 2018" in reference) */}
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <img className="w-6 h-6 rounded-full border border-white object-cover" referrerPolicy="no-referrer" src="/src/assets/images/avatar_coach_nicholas_1793973783261.jpg" alt="Avatar" />
                <img className="w-6 h-6 rounded-full border border-white object-cover" referrerPolicy="no-referrer" src="/src/assets/images/avatar_athlete_titus_1793973784097.jpg" alt="Avatar" />
              </div>
              <div className="text-right border-l border-slate-200 pl-2">
                <span className="font-mono text-xs font-black text-slate-900 block">23:30</span>
                <span className="text-[10px] text-slate-400 font-medium block">28 Oct 2026</span>
              </div>
            </div>

            {/* Floating Bottom Starter Avatars Cluster + Green Tips Pill (+10 tips like reference) */}
            <div className="absolute -bottom-3 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center gap-2.5">
              <div className="flex -space-x-2">
                <img className="w-6 h-6 rounded-full border border-white object-cover" referrerPolicy="no-referrer" src="/src/assets/images/avatar_athlete_titus_1793973784097.jpg" alt="Starter" />
                <img className="w-6 h-6 rounded-full border border-white object-cover" referrerPolicy="no-referrer" src="/src/assets/images/avatar_coach_nicholas_1793973783261.jpg" alt="Starter" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 font-mono">+9 Squad</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                +10 Tips
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
