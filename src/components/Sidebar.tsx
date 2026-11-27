/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Left Navigation Sidebar directly inspired by reference design:
 * - Top: Cobalt blue profile card with user avatar in gold ring, name, role, and follower/stat counters
 * - Actor Switcher Quick-Bar: Coach Desk, Player Portal, Scout Hub, Admin Console
 * - Bottom: 2-column icon navigation (Dashboard, Posts, Saved, Rewards, Notifications, Messages, Teams, Settings)
 *   with active cobalt blue card state matching the reference's "Teams" block
 */

import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, MessageSquare, Bookmark, Award, Bell, 
  Mail, Users, Settings, GitCompare, FileText, ShieldCheck, 
  Database, User, Compass, Bot
} from 'lucide-react';

interface SidebarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeRoute: string;
  onRouteChange: (route: string) => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
  onOpenAudit: () => void;
  onUpdateAvatar?: (url: string) => void;
  customAvatar?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRole,
  onRoleChange,
  activeRoute,
  onRouteChange,
  unreadNotificationsCount = 3,
  unreadMessagesCount = 2,
  onOpenAudit,
  onUpdateAvatar,
  customAvatar,
}) => {
  // Dynamic profile info based on active role
  const profileData = {
    coach: {
      name: 'Nicholas Natuhereza',
      title: 'Head Coach · 4 Seasons',
      stat1: '2,434 Squad Views',
      stat2: '89.4% Win Rate',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
    },
    player: {
      name: 'Titus Lual (#7)',
      title: 'Varsity Center · Year 3',
      stat1: '1,840 Follows',
      stat2: '17.4 PPG',
      avatar: '/src/assets/images/avatar_athlete_titus_1793973784097.jpg',
    },
    scout: {
      name: 'David Ochieng',
      title: 'Accredited Scout · FUBA',
      stat1: '320 Prospects',
      stat2: 'Accredited',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
    },
    admin: {
      name: 'Dr. Sewa Elvis',
      title: 'Director of Sports · UCU',
      stat1: '4 Teams',
      stat2: '48 Audits',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
    },
    guest: {
      name: 'Guest Observer',
      title: 'Read-Only Preview Mode',
      stat1: 'Public View',
      stat2: 'No Privileges',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
    },
  }[activeRole] || {
    name: 'Guest Observer',
    title: 'Read-Only Preview',
    stat1: 'Public View',
    stat2: 'No Privileges',
    avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
  };

  // Actor workspace routes
  const actorRoutes = [
    { id: 'coach', label: 'Coach Desk', role: 'coach' as UserRole },
    { id: 'player', label: 'Player Portal', role: 'player' as UserRole },
    { id: 'scout', label: 'Scout Hub', role: 'scout' as UserRole },
    { id: 'admin', label: 'Admin Deck', role: 'admin' as UserRole },
    { id: 'guest', label: 'Guest Overview', role: 'guest' as UserRole },
  ];

  // Reference 2-column navigation items
  const navGridItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'messages', label: 'Messages', icon: Mail, badge: unreadMessagesCount },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col bg-white border-r border-slate-200/80 shadow-xs lg:min-h-screen">
      {/* Top Cobalt Profile Card (matching reference design top-left card) */}
      <div className="bg-[#2954ea] p-6 text-white flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle decorative circles from reference */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-blue-400/20 blur-lg pointer-events-none" />

        {/* User Avatar with Glowing Yellow/Gold Accent Ring & Upload */}
        <label className="relative mb-2.5 cursor-pointer group/avatar block" title="Click to update profile picture">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 shadow-lg group-hover/avatar:scale-105 transition-transform">
            <img
              src={customAvatar || profileData.avatar}
              alt={profileData.name}
              className="w-full h-full object-cover rounded-full bg-slate-900 border-2 border-white"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onUpdateAvatar) {
                onUpdateAvatar(URL.createObjectURL(file));
              }
            }}
          />
          <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
        </label>

        {/* User Name & Subtitle */}
        <h2 className="text-base font-bold text-white tracking-tight">{profileData.name}</h2>
        <p className="text-xs text-blue-100 font-medium mt-0.5">{profileData.title}</p>

        {/* Follower / Stat Counters */}
        <div className="flex items-center justify-center gap-3.5 mt-4 pt-3 border-t border-white/20 w-full text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-blue-50">
            <User className="w-3.5 h-3.5 text-blue-200" />
            <span className="font-mono tabular-nums">{profileData.stat1}</span>
          </div>
          <span className="text-white/30">·</span>
          <div className="flex items-center gap-1.5 text-blue-50">
            <Award className="w-3.5 h-3.5 text-blue-200" />
            <span className="font-mono tabular-nums">{profileData.stat2}</span>
          </div>
        </div>
      </div>

      {/* Role View Switcher */}
      <div className="p-3 bg-slate-50/80 border-b border-slate-200">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5 px-1">
          Active Workspace Actor:
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {actorRoutes.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onRoleChange(item.role);
                onRouteChange(item.id);
              }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center ${
                activeRole === item.role
                  ? 'bg-[#2954ea] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Icons 2-Column Grid (Directly mirroring the reference layout) */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 px-1">
            System Modules
          </span>

          <nav className="grid grid-cols-2 gap-2.5">
            {navGridItems.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onRouteChange(item.id)}
                  className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all text-xs font-bold ${
                    isActive
                      ? 'bg-[#2954ea] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="tracking-tight">{item.label}</span>

                  {/* Badge count (e.g. for notifications & messages) */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Specialized Shortcuts for 3D Arena, AI Assistant, Fusion & Reports */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
            3D Arena & AI Intelligence
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onRouteChange('arena')}
              className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeRoute === 'arena'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">3D Arena</span>
            </button>
            <button
              onClick={() => onRouteChange('assistant')}
              className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeRoute === 'assistant'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">AI Chatbot</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onRouteChange('fusion')}
              className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeRoute === 'fusion'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Fusion Matrix</span>
            </button>
            <button
              onClick={() => onRouteChange('reports')}
              className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeRoute === 'reports'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">AI Reports</span>
            </button>
          </div>
        </div>

        {/* Bottom Utility Actions & Footnotes (matching reference bottom text) */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <button
            onClick={onOpenAudit}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Compliance Audit Trail</span>
            </div>
            <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Live</span>
          </button>

          {/* Reference image bottom grey links */}
          <div className="text-[10px] text-slate-400 leading-tight space-x-1.5 text-center">
            <span>About us</span>
            <span>·</span>
            <span>Privacy Notice</span>
            <span>·</span>
            <span>Open Policy</span>
            <span>·</span>
            <span>UCU 2026</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
