/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tactical Drills Selector & Path Visualization Sub-Component
 * Uganda Christian University (UCU) Sports Department
 */

import React, { useState } from 'react';
import { SportType } from '../types';
import { Layers, Play, CheckCircle2, Compass, ArrowRight, Zap, Target, Shield, Activity } from 'lucide-react';

export interface TacticalDrill {
  id: string;
  name: string;
  sport: SportType;
  description: string;
  keyPlayer: string;
  successRate: string;
  pathPoints: Array<{ x: number; z: number; label: string }>;
}

interface TacticalDrillsOverlayProps {
  sport: SportType;
  selectedDrillId: string;
  onSelectDrill: (drill: TacticalDrill) => void;
}

export const TACTICAL_DRILLS: TacticalDrill[] = [
  // Basketball Drills
  {
    id: 'bball_pick_and_roll',
    name: 'Pick and Roll (High Screen)',
    sport: 'basketball',
    description: 'Guard #11 dribbles off screen set by #14, forcing switch or drop coverage before feeding rolling center #7.',
    keyPlayer: '#7 Titus Lual & #11 Jerry Kayanga',
    successRate: '88.4% Efficiency',
    pathPoints: [
      { x: -7, z: 3, label: 'Start (Guard #11)' },
      { x: -4, z: 0, label: 'Screen Set (#14)' },
      { x: -2, z: -2, label: 'Roll to Rim (#7)' },
    ],
  },
  {
    id: 'bball_zone_defense',
    name: 'Box-and-One Zone Defense',
    sport: 'basketball',
    description: 'Four defenders form a protective box around the paint while wing defender face-guards primary scorer.',
    keyPlayer: 'Defensive Unit',
    successRate: '91.2% Stop Rate',
    pathPoints: [
      { x: 2, z: 2, label: 'Paint Guard 1' },
      { x: 2, z: -2, label: 'Paint Guard 2' },
      { x: 6, z: 4, label: 'Wing Stopper' },
    ],
  },
  {
    id: 'bball_fastbreak',
    name: 'Transition Fastbreak 3-on-2',
    sport: 'basketball',
    description: 'Explosive outlet pass from defensive rebound to streaking guards for quick uncontested layup.',
    keyPlayer: '#5 Peter Sifuna',
    successRate: '94.0% Conversion',
    pathPoints: [
      { x: -10, z: 0, label: 'Rebound Outlet' },
      { x: 0, z: 4, label: 'Wing Fill' },
      { x: 10, z: 0, label: 'Finishing Rim' },
    ],
  },

  // Football Drills
  {
    id: 'football_high_press',
    name: '4-3-3 Gegenpress High Block',
    sport: 'football',
    description: 'Aggressive forward line press cutting off opposition passing lanes within 3 seconds of turnover.',
    keyPlayer: '#9 Allan Okello',
    successRate: '86.5% Recovery',
    pathPoints: [
      { x: 8, z: 0, label: 'Striker Press' },
      { x: 4, z: -5, label: 'Midfield Trap' },
      { x: 0, z: 5, label: 'Cover Shield' },
    ],
  },
  {
    id: 'football_wing_overload',
    name: 'Flank Overload & Cross',
    sport: 'football',
    description: 'Full-back overlaps winger to create 2v1 advantage before delivering in-swinger into the penalty box.',
    keyPlayer: '#7 Winger & #9 Striker',
    successRate: '89.1% Box Entry',
    pathPoints: [
      { x: -5, z: 12, label: 'Build-up' },
      { x: 5, z: 14, label: 'Overlap' },
      { x: 15, z: 2, label: 'Cross to Box' },
    ],
  },
  {
    id: 'football_set_piece',
    name: 'In-Swinging Corner Header',
    sport: 'football',
    description: 'Coordinated near-post decoy run opening space for back-post header conversion.',
    keyPlayer: '#4 Godfrey Akol',
    successRate: '92.3% Success',
    pathPoints: [
      { x: 22, z: -14, label: 'Corner Kick' },
      { x: 18, z: -4, label: 'Near Decoy' },
      { x: 20, z: 2, label: 'Header Strike' },
    ],
  },
  // Netball Drills
  {
    id: 'netball_centre_pass',
    name: 'Centre Pass to Goal Shooter',
    sport: 'netball',
    description: 'Rapid transition from center pass through Wing Attack to Goal Shooter inside the circle.',
    keyPlayer: '#1 Sarah Namulondo',
    successRate: '93.4% Efficiency',
    pathPoints: [
      { x: 0, z: 0, label: 'Centre Circle' },
      { x: 5, z: 4, label: 'Wing Attack Feed' },
      { x: 10, z: 0, label: 'Goal Shooter Shot' },
    ],
  },
  {
    id: 'netball_zone_defense',
    name: 'Goal Defence Interception Trap',
    sport: 'netball',
    description: 'Tight zonal marking in goal third forcing hurried passes and high-percentage interceptions.',
    keyPlayer: 'Defensive Unit',
    successRate: '89.2% Stop Rate',
    pathPoints: [
      { x: 8, z: 3, label: 'Goal Defence' },
      { x: 10, z: -2, label: 'Goal Keeper' },
      { x: 6, z: 0, label: 'Intercept Zone' },
    ],
  },
];

export const TacticalDrillsOverlay: React.FC<TacticalDrillsOverlayProps> = ({
  sport,
  selectedDrillId,
  onSelectDrill,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableDrills = TACTICAL_DRILLS.filter(d => d.sport === sport);
  const activeDrill = availableDrills.find(d => d.id === selectedDrillId) || availableDrills[0];

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-end">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all group"
      >
        <Target className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
        <span>Tactical Drills & Paths</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1" />
      </button>

      {/* Drill Selection Flyout Panel */}
      {isOpen && (
        <div className="mt-2 w-80 sm:w-96 bg-slate-900/95 border border-slate-700/90 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight font-['Barlow_Condensed'] text-white">
                Select Tactical Drill ({sport.toUpperCase()})
              </h3>
              <p className="text-[11px] text-slate-400">Visualizing 3D movement paths & play execution</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Drills List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {availableDrills.map((drill) => {
              const isSelected = drill.id === activeDrill?.id;
              return (
                <button
                  key={drill.id}
                  onClick={() => {
                    onSelectDrill(drill);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="text-amber-400">⚡</span>
                      <span>{drill.name}</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                      {drill.successRate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{drill.description}</p>
                </button>
              );
            })}
          </div>

          {/* Active Drill Summary Footer */}
          {activeDrill && (
            <div className="pt-3 border-t border-slate-800 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Key Execution Lead</span>
                <span className="font-mono font-bold text-amber-400">{activeDrill.keyPlayer}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>3D Waypoints: {activeDrill.pathPoints.map(p => p.label).join(' → ')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
