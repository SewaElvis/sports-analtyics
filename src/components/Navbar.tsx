/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Navigation Bar adhering to the Frontend Design 3-Zone Contract:
 * Zone 1: Wordmark Brand
 * Zone 2: Navigation Links
 * Zone 3: Role Switcher & Sync Status
 */

import React from 'react';
import { UserRole, SportType } from '../types';
import { ShieldCheck, Activity, Users, Eye, Database, Wifi } from 'lucide-react';

interface NavbarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOnline: boolean;
  onOpenAuditLogs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onRoleChange,
  activeSport,
  onSportChange,
  activeTab,
  onTabChange,
  isOnline,
  onOpenAuditLogs,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
      {/* Top Banner: UCU Sports Department Quick-Switch Bar */}
      <div className="border-b border-zinc-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-200 tracking-wider uppercase text-[11px]">
            Uganda Christian University
          </span>
          <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-zinc-400">Sports Department</span>
          <span className="text-zinc-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="tabular-nums font-mono text-[11px] text-zinc-400">
              {isOnline ? 'Live Sync' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* Demo Fast Role Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 mr-1 hidden md:inline">Role View:</span>
          <div className="inline-flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            {(['coach', 'player', 'scout', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                  activeRole === role
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAuditLogs}
            title="Inspect Audit Logs"
            className="ml-2 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-md transition-colors flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Audit</span>
          </button>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <a href="#" className="flex items-center gap-2 text-zinc-100 hover:text-white transition-colors">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-sm tracking-tight text-white">
              U
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg whitespace-nowrap text-white font-['Barlow_Condensed'] uppercase tracking-wide">
              UCU Sports Analytics
            </span>
          </a>

          {/* Sport Selector */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 ml-2">
            <button
              onClick={() => onSportChange('basketball')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                activeSport === 'basketball'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Canons (Basketball)
            </button>
            <button
              onClick={() => onSportChange('football')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                activeSport === 'football'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cardinals (Football)
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={() => onTabChange('matches')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'matches' ? 'text-white border-b-2 border-white' : 'hover:text-zinc-200'
            }`}
          >
            Matches & Video
          </button>
          <button
            onClick={() => onTabChange('fusion')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'fusion' ? 'text-white border-b-2 border-white' : 'hover:text-zinc-200'
            }`}
          >
            Fusion Matrix
          </button>
          <button
            onClick={() => onTabChange('squad')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'squad' ? 'text-white border-b-2 border-white' : 'hover:text-zinc-200'
            }`}
          >
            Squad & Athletes
          </button>
          <button
            onClick={() => onTabChange('scouts')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'scouts' ? 'text-white border-b-2 border-white' : 'hover:text-zinc-200'
            }`}
          >
            Scout Directory
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-zinc-400 hidden xl:inline">
            Active: <strong className="text-zinc-200 capitalize">{activeRole}</strong>
          </span>
          <button
            onClick={() => {
              if (activeRole === 'coach') onTabChange('matches');
              else if (activeRole === 'player') onTabChange('squad');
              else if (activeRole === 'scout') onTabChange('scouts');
              else onTabChange('matches');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white transition-all whitespace-nowrap shrink-0 active:scale-[0.98]"
          >
            {activeRole === 'coach' && 'Open Coach Deck'}
            {activeRole === 'player' && 'Athlete Portal'}
            {activeRole === 'scout' && 'Scout Prospects'}
            {activeRole === 'admin' && 'Admin Console'}
          </button>
        </div>
      </div>
    </header>
  );
};
