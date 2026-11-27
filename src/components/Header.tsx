/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Cobalt Blue Header Bar directly mirroring reference design:
 * - Brand wordmark (UCU SPORTS) with module dropdown
 * - Center horizontal navigation tabs (Sport, Basketball, Football, Video Analysis, Fusion, Reports, Scout Hub, Alerts)
 * - Clock badge (15:41 EAT), glass search trigger, and actor quick-switch chip
 */

import React, { useState, useEffect } from 'react';
import { SportType, UserRole } from '../types';
import { Search, Clock, Shield, ChevronDown, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (route: string) => void;
  activeRoute: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeSport,
  onSportChange,
  activeRole,
  onRoleChange,
  onNavigate,
  activeRoute,
}) => {
  const [timeStr, setTimeStr] = useState('15:41 (EAT)');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes} (EAT)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'dashboard', label: 'Match Center' },
    { id: 'arena', label: '3D Arena' },
    { id: 'cv', label: 'CV Hub (YOLO/ByteTrack)' },
    { id: 'assistant', label: 'AI Assistant' },
    { id: 'coach', label: 'Video Analysis' },
    { id: 'fusion', label: 'Fusion Matrix' },
    { id: 'reports', label: 'Verified Reports' },
    { id: 'scouts', label: 'Scout Hub' },
    { id: 'notifications', label: 'Alert Stream' },
  ];

  return (
    <header className="bg-[#2954ea] text-white sticky top-0 z-40 border-b border-blue-600/60 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Section Indicator (mirrors "bwin Dashboard ▾" in reference) */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 group text-left"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Barlow_Condensed'] uppercase italic">
              ucu<span className="text-amber-400">sports</span>
            </span>
            <div className="hidden sm:flex items-center text-xs text-blue-200/90 font-bold pl-2.5 border-l border-blue-400/40">
              <span className="capitalize">{activeRole} Workspace</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Center: Sports & Module Navigation Tabs (mirrors SPORT, LIVE BETTING, VIRTUALS in reference) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          {navTabs.map((tab) => {
            const isActive = activeRoute === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                    : 'text-blue-100 hover:text-white hover:bg-blue-600/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Clock & Search & Role Chip (matching reference image) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Clock badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium text-blue-100 bg-blue-700/60 border border-blue-500/40 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-blue-200" />
            <span className="tabular-nums">{timeStr}</span>
          </div>

          {/* Landing & Auth Page Links */}
          <button
            onClick={() => onNavigate('landing')}
            className="hidden md:flex px-3 py-1.5 text-xs font-bold rounded-full bg-blue-800/80 hover:bg-blue-800 text-blue-100 border border-blue-500/40 transition-all items-center gap-1"
          >
            <span>Landing</span>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="hidden md:flex px-3 py-1.5 text-xs font-bold rounded-full bg-red-600/90 hover:bg-red-600 text-white transition-all items-center gap-1 shadow-xs"
          >
            <span>Login / Auth</span>
          </button>

          {/* Search Glass Button from reference */}
          <button
            onClick={() => onNavigate('scouts')}
            title="Search prospects and matches"
            className="w-9 h-9 rounded-full bg-blue-700/60 hover:bg-blue-700 border border-blue-500/40 flex items-center justify-center text-blue-100 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Role View indicator button */}
          <button
            onClick={() => {
              const roles: UserRole[] = ['coach', 'player', 'scout', 'admin'];
              const nextRole = roles[(roles.indexOf(activeRole) + 1) % roles.length];
              onRoleChange(nextRole);
              onNavigate(nextRole);
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="capitalize">{activeRole}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
