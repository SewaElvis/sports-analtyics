/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Teams & Squad Formations Board Page
 * Visual roster, starting line-ups on basketball court and football pitch, and athlete profile details.
 */

import React, { useState } from 'react';
import { Player, Team, SportType } from '../types';
import { Users, Shield, ArrowRight, Star, Award, Lock, ExternalLink, Activity, Info } from 'lucide-react';

interface TeamsPageProps {
  teams: Team[];
  players: Player[];
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
  onSelectPlayer: (playerId: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({
  teams,
  players,
  activeSport,
  onSportChange,
  onSelectPlayer,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'roster' | 'formation'>('roster');

  const currentTeam = teams.find(t => t.sport === activeSport) || teams[0];
  const squad = players.filter(p => p.sportId === activeSport);

  // Group by starters vs reserves
  const starters = squad.slice(0, activeSport === 'basketball' ? 5 : 11);
  const bench = squad.slice(activeSport === 'basketball' ? 5 : 11);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">{currentTeam.season}</span>
            <span>·</span>
            <span>Head Coach: {currentTeam.headCoach}</span>
            <span>·</span>
            <span className="text-emerald-600">Mukono Campus</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            {currentTeam.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official varsity athletic line-ups, jersey numbers, academic faculties, and privacy consent controls.
          </p>
        </div>

        {/* Sport Switcher & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs">
            <button
              onClick={() => onSportChange('basketball')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeSport === 'basketball' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              🏀 Canons (Basketball)
            </button>
            <button
              onClick={() => onSportChange('football')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeSport === 'football' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              ⚽ Cardinals (Football)
            </button>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs">
            <button
              onClick={() => setViewMode('roster')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'roster' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Roster Cards
            </button>
            <button
              onClick={() => setViewMode('formation')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'formation' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Court / Pitch Board
            </button>
          </div>
        </div>
      </div>

      {/* FORMATION BOARD VIEW */}
      {viewMode === 'formation' && (
        <div className="bwin-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tactical Formation & Starting Line-Up ({starters.length})
              </h2>
              <p className="text-xs text-slate-500">
                {activeSport === 'basketball' ? 'Standard 5-Out High Post Spacing' : '4-3-3 Attacking System'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {currentTeam.headCoach}
            </span>
          </div>

          {/* Court / Pitch Canvas Representation */}
          <div className={`w-full aspect-16/9 max-h-[460px] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between ${
            activeSport === 'basketball'
              ? 'bg-gradient-to-b from-amber-900/90 via-amber-800 to-amber-900 border-4 border-amber-950 shadow-inner'
              : 'bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800 border-4 border-emerald-900 shadow-inner'
          }`}>
            {/* Court markings */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-2xl pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/30 rounded-full pointer-events-none" />

            {/* Positioned Starters */}
            <div className="relative z-10 w-full h-full flex flex-wrap items-center justify-around gap-4 p-4">
              {starters.map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="flex flex-col items-center cursor-pointer group hover:scale-105 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-white text-blue-700 border-2 border-amber-400 font-mono font-black text-base flex items-center justify-center shadow-lg group-hover:bg-[#2954ea] group-hover:text-white transition-colors">
                    #{player.shirtNumber}
                  </div>
                  <div className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-xl text-center mt-1.5 shadow-md">
                    <span className="text-xs font-bold text-white block whitespace-nowrap">{player.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-amber-300 uppercase font-semibold block">{player.position.split('/')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROSTER CARDS GRID VIEW */}
      {viewMode === 'roster' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {squad.map((player) => (
              <div
                key={player.id}
                className="bwin-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <span className="font-mono font-bold text-blue-600">#{player.shirtNumber}</span>
                        <span>·</span>
                        <span className="uppercase">{player.position}</span>
                        <span>·</span>
                        <span>Year {player.yearOfStudy}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{player.faculty}</p>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-mono font-black text-sm text-slate-700">
                      #{player.shirtNumber}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
                    {player.bio || `${player.position} competing in the official university league.`}
                  </p>

                  {/* Physical Dimensions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Height</span>
                      <span className="text-slate-900 font-bold">{player.heightCm ? `${player.heightCm} cm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Weight</span>
                      <span className="text-slate-900 font-bold">{player.weightKg ? `${player.weightKg} kg` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Season Stats Averages */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Season Averages
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                      {Object.entries(player.seasonStats).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                          <span className="uppercase text-slate-400 text-[10px] mr-1">{key}:</span>
                          <strong className="text-slate-900">{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    player.consents.scoutVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {player.consents.scoutVisible ? '✓ Scout Visible' : '🔒 Private'}
                  </span>

                  <button
                    onClick={() => {
                      onSelectPlayer(player.id);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Player Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Athlete Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bwin-card max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">#{selectedPlayer.shirtNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedPlayer.name}</h3>
                <p className="text-xs text-slate-500">{selectedPlayer.position} · Year {selectedPlayer.yearOfStudy}</p>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedPlayer.bio}</p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Academic Faculty</span>
                <span className="text-slate-800 font-semibold">{selectedPlayer.faculty}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Biometrics</span>
                <span className="text-slate-800 font-mono font-semibold">{selectedPlayer.heightCm}cm · {selectedPlayer.weightKg}kg</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-800 block">Season Career Metrics</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {Object.entries(selectedPlayer.seasonStats).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="uppercase text-slate-400 mr-1">{k}:</span>
                    <strong className="text-slate-900">{v}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                Scout Directory: <strong className="text-slate-800">{selectedPlayer.consents.scoutVisible ? 'Authorized' : 'Restricted'}</strong>
              </span>

              <button
                onClick={() => {
                  onSelectPlayer(selectedPlayer.id);
                  setSelectedPlayer(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2954ea] text-white font-bold text-xs shadow-xs"
              >
                Open Athlete Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
