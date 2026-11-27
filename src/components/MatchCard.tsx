/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Match Card Component mirroring the lower cards from reference image:
 * Bayern vs PSG, Man Utd vs Leicester, Chelsea vs Huddersfield
 * - Team crests + time badge
 * - 2-line matchup with scores
 * - Bottom: overlapping avatar cluster + colored tips pill (+10 tips / -4 tips)
 */

import React from 'react';
import { Match } from '../types';
import { Play, CheckCircle2, Clock, Film } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onSelect: () => void;
  tipsBadge?: { count: string; isPositive: boolean };
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect, tipsBadge }) => {
  const isBasketball = match.sportId === 'basketball';
  const ucuTeamName = isBasketball ? 'UCU Canons' : 'UCU Cardinals';

  // Default tips badges matching the reference image (+10 tips, -4 tips, +3 tips)
  const defaultTips = tipsBadge || (
    match.status === 'published'
      ? { count: '+10 tips', isPositive: true }
      : { count: '+4 tips', isPositive: true }
  );

  return (
    <div
      onClick={onSelect}
      className="bwin-card p-5 cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all group flex flex-col justify-between bg-white border border-slate-200/80"
    >
      <div>
        {/* Top Header: Team Crests + Time Badge (mirroring 14:30 / 28 Jun 2018 in reference) */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
              {isBasketball ? '🏀' : '⚽'}
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
              VS
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-900 block tabular-nums">
              {match.sportId === 'basketball' ? '14:30' : '23:30'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              {match.date}
            </span>
          </div>
        </div>

        {/* Team Names and Scores (exact 2-line layout from reference image) */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-base font-['Barlow_Condensed'] uppercase tracking-wide">
              {ucuTeamName}
            </span>
            <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
              {match.score ? match.score.ucu : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600 text-sm font-['Barlow_Condensed'] uppercase tracking-wide">
              {match.opponent}
            </span>
            <span className="font-mono font-medium text-base text-slate-500 tabular-nums">
              {match.score ? match.score.opponent : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Starter Avatars Cluster + Colored Tips Pill (matching reference bottom) */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Avatars Stack (mirroring the 4-5 small avatars in reference) */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            <img className="w-5 h-5 rounded-full border border-white object-cover" referrerPolicy="no-referrer" src="/src/assets/images/avatar_coach_nicholas_1793973783261.jpg" alt="Player" />
            <img className="w-5 h-5 rounded-full border border-white object-cover" referrerPolicy="no-referrer" src="/src/assets/images/avatar_athlete_titus_1793973784097.jpg" alt="Player" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-semibold">
            {Object.keys(match.enteredStats || {}).length} logged
          </span>
        </div>

        {/* Tips Pill Badge (matching green +10 tips / red -4 tips in reference) */}
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-tight ${
          defaultTips.isPositive
            ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
            : 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'
        }`}>
          {defaultTips.count}
        </div>
      </div>
    </div>
  );
};
