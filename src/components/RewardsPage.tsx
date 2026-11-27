/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rewards, Appraisals & Athlete Badges Page
 * MVP recognitions, coach performance scorecards, and season milestone badges.
 */

import React, { useState } from 'react';
import { Player, CoachAppraisal, SportType } from '../types';
import { Award, Star, Trophy, Medal, Sparkles, ShieldCheck, Flame, User } from 'lucide-react';

interface RewardsPageProps {
  players: Player[];
  appraisals: CoachAppraisal[];
  activeSport: SportType;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ players, appraisals, activeSport }) => {
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');

  const filteredPlayers = players.filter(p => selectedSport === 'all' || p.sportId === selectedSport);

  // Notable achievements / rewards
  const achievements = [
    {
      id: 'ach_1',
      title: 'Player of the Week (NBL University Round 8)',
      recipient: 'Titus Lual (#7)',
      sport: 'basketball',
      description: 'Recorded 17.4 PPG, 11.2 RPG with zero turnovers in the second half vs KIU Titans.',
      icon: Trophy,
      badgeColor: 'from-amber-400 to-yellow-500',
      date: '24 Oct 2026',
    },
    {
      id: 'ach_2',
      title: 'Golden Boot Leader (UFL Conference)',
      recipient: 'Allan Okello (#9)',
      sport: 'football',
      description: 'Reached 12 league goals in 9 games with 64% shot accuracy on target.',
      icon: Medal,
      badgeColor: 'from-blue-500 to-indigo-600',
      date: '19 Oct 2026',
    },
    {
      id: 'ach_3',
      title: 'Playmaker of the Month',
      recipient: 'Jerry Kayanga (#11)',
      sport: 'basketball',
      description: 'Averaging 6.8 assists with a 3.4 assist-to-turnover ratio across October.',
      icon: Star,
      badgeColor: 'from-emerald-400 to-teal-500',
      date: '26 Oct 2026',
    },
    {
      id: 'ach_4',
      title: 'Lockdown Defensive Anchor',
      recipient: 'Godfrey Akol (#4)',
      sport: 'football',
      description: 'Completed 44 interceptions and 38 tackles with 0 defensive errors.',
      icon: ShieldCheck,
      badgeColor: 'from-purple-500 to-pink-600',
      date: '20 Oct 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Athletic Honors</span>
            <span>·</span>
            <span>Appraisals & Performance Ratings</span>
            <span>·</span>
            <span className="text-emerald-600">Varsity Recognition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            Athlete Honors, Appraisals & Rewards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Celebrating excellence across UCU Canons Basketball and UCU Cardinals Football squads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Varsity Honors</span>
            <span className="font-mono font-bold text-slate-900 text-sm">4 Active Honors</span>
          </div>
        </div>
      </div>

      {/* Featured Honors Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((item) => (
          <div key={item.id} className="bwin-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.badgeColor} text-white flex items-center justify-center shadow-md mb-3`}>
              <item.icon className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              {item.sport === 'basketball' ? '🏀 Basketball' : '⚽ Football'} · {item.date}
            </span>
            <h2 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h2>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase">
              {item.recipient}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Coach Appraisal Scorecards Grid */}
      <div className="bwin-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span>Head Coach Appraisal Rating Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              4-dimensional evaluation: Work Rate, Tactical Awareness, Decision Making, and Discipline.
            </p>
          </div>

          {/* Sport Filter */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSport === 'all' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Teams
            </button>
            <button
              onClick={() => setSelectedSport('basketball')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSport === 'basketball' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Canons
            </button>
            <button
              onClick={() => setSelectedSport('football')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSport === 'football' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Cardinals
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlayers.map((player) => {
            const appraisal = appraisals.find(a => a.playerId === player.id);
            const defaultRatings = {
              workRate: 4,
              tacticalAwareness: 4,
              decisionMaking: 5,
              discipline: 5,
            };
            const ratings = appraisal?.ratings || defaultRatings;

            return (
              <div key={player.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">#{player.shirtNumber}</span>
                    <h3 className="text-base font-bold text-slate-900">{player.name}</h3>
                    <p className="text-xs text-slate-500">{player.position} · Year {player.yearOfStudy}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Score</span>
                    <span className="text-lg font-mono font-black text-amber-500">
                      {((ratings.workRate + ratings.tacticalAwareness + ratings.decisionMaking + ratings.discipline) / 4).toFixed(1)} / 5
                    </span>
                  </div>
                </div>

                {/* Rating Dimensions */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">Work Rate</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{ratings.workRate}/5</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">Tactical</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{ratings.tacticalAwareness}/5</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">Decisions</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{ratings.decisionMaking}/5</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">Discipline</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{ratings.discipline}/5</span>
                  </div>
                </div>

                {appraisal?.coachComments && (
                  <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
                    &quot;{appraisal.coachComments}&quot;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
