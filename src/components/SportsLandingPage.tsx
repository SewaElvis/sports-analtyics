/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UCU Sports Analytics - Professional Institutional Landing Page
 * Clean, enterprise-grade blue & white design.
 */

import React, { useState } from 'react';
import { SportType, UserRole } from '../types';
import { Shield, ArrowRight, Activity, Users, Trophy, ChevronRight } from 'lucide-react';
import ucuShowcaseImg from '../assets/images/ucu_athlete_showcase_1793973783235.jpg';
import athleteTitusImg from '../assets/images/avatar_athlete_titus_1793973784097.jpg';
import coachAvatarImg from '../assets/images/avatar_coach_nicholas_1793973783261.jpg';

interface SportsLandingPageProps {
  onEnterApp: (role: UserRole, sport: SportType) => void;
  onNavigateAuth: (mode: 'login' | 'register') => void;
}

export const SportsLandingPage: React.FC<SportsLandingPageProps> = ({
  onEnterApp,
  onNavigateAuth,
}) => {
  const [selectedSport, setSelectedSport] = useState<SportType>('basketball');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 lg:px-16 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2954ea] text-white flex items-center justify-center font-black text-sm shadow-md">
            UCU
          </div>
          <div>
            <span className="font-extrabold text-sm uppercase tracking-wider font-['Barlow_Condensed'] block text-slate-900">
              UCU Sports Analytics
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Institutional Intelligence Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateAuth('login')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all border border-slate-300"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigateAuth('register')}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2954ea] hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center text-center space-y-12">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2954ea] text-xs font-bold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Uganda Christian University Sports Directorate</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight font-['Barlow_Condensed'] text-slate-900 leading-none">
            Elite Multi-Sport Analytics, <br />
            <span className="text-[#2954ea]">
              Talent Management & Scouting
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Centralized institutional intelligence platform for UCU Canons Basketball, UCU Cardinals Football, and UCU Netball. Powered by advanced automated video analysis and role-based access control.
          </p>
        </div>

        {/* Featured Photography Showcase */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 group shadow-lg h-60 bg-slate-100">
            <img src={ucuShowcaseImg} alt="UCU Athlete Showcase" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-mono text-blue-300 font-bold uppercase">Varsity Squads</span>
              <h4 className="text-sm font-black uppercase font-['Barlow_Condensed'] text-white">Canons & Cardinals</h4>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200 group shadow-lg h-60 bg-slate-100">
            <img src={athleteTitusImg} alt="Titus Lual" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-mono text-blue-300 font-bold uppercase">Athlete Portal</span>
              <h4 className="text-sm font-black uppercase font-['Barlow_Condensed'] text-white">Performance Tracking</h4>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200 group shadow-lg h-60 bg-slate-100">
            <img src={coachAvatarImg} alt="Coach Nicholas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-mono text-blue-300 font-bold uppercase">Coach Desk</span>
              <h4 className="text-sm font-black uppercase font-['Barlow_Condensed'] text-white">Tactical Analysis & Fusion</h4>
            </div>
          </div>
        </div>

        {/* Sport Selector */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setSelectedSport('basketball')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              selectedSport === 'basketball'
                ? 'bg-[#2954ea] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            🏀 Basketball (Canons)
          </button>
          <button
            onClick={() => setSelectedSport('football')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              selectedSport === 'football'
                ? 'bg-[#2954ea] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            ⚽ Football (Cardinals)
          </button>
          <button
            onClick={() => setSelectedSport('netball')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              selectedSport === 'netball'
                ? 'bg-[#2954ea] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            🏐 Netball Team
          </button>
        </div>

        {/* Access Role Cards (Clean Blue & White) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div 
            onClick={() => onEnterApp('coach', selectedSport)}
            className="group bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-500 p-6 rounded-3xl cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2954ea] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase font-['Barlow_Condensed'] text-slate-900 group-hover:text-[#2954ea]">
                1. Coach (Overseer)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Oversees matches, enters lineups, reviews automated video analysis, and publishes verified reports.
              </p>
            </div>
            <div className="text-xs font-bold text-[#2954ea] flex items-center gap-1 pt-1">
              <span>Access Coach Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onEnterApp('admin', selectedSport)}
            className="group bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-500 p-6 rounded-3xl cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2954ea] flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase font-['Barlow_Condensed'] text-slate-900 group-hover:text-[#2954ea]">
                2. Admin (Directorate)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Confirms finalized statistics, accredits external talent scouts, and oversees institutional audit trails.
              </p>
            </div>
            <div className="text-xs font-bold text-[#2954ea] flex items-center gap-1 pt-1">
              <span>Access Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onEnterApp('player', selectedSport)}
            className="group bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-500 p-6 rounded-3xl cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2954ea] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase font-['Barlow_Condensed'] text-slate-900 group-hover:text-[#2954ea]">
                3. Player Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Personalized metrics, match ratings, video clips, self-evaluations, and scout consent controls.
              </p>
            </div>
            <div className="text-xs font-bold text-[#2954ea] flex items-center gap-1 pt-1">
              <span>Access Player Portal</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onEnterApp('scout', selectedSport)}
            className="group bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-500 p-6 rounded-3xl cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2954ea] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase font-['Barlow_Condensed'] text-slate-900 group-hover:text-[#2954ea]">
                4. Talent Scout Hub
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Browse consented prospect profiles and submit secure contact requests via the directorate.
              </p>
            </div>
            <div className="text-xs font-bold text-[#2954ea] flex items-center gap-1 pt-1">
              <span>Access Scout Hub</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-center gap-4 text-xs">
          <button
            onClick={() => onNavigateAuth('login')}
            className="px-8 py-3.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all"
          >
            Sign In to System
          </button>
          <button
            onClick={() => onNavigateAuth('register')}
            className="px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold uppercase tracking-wider transition-all"
          >
            Create Account
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-slate-50">
        <p>© 2026 Uganda Christian University Sports Department • Mukono, Uganda</p>
      </footer>
    </div>
  );
};
