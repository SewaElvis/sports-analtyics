/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Notifications & Alert Stream Page
 * Live institutional notifications for video processing, fusion disputes, scout inquiries, and publications.
 */

import React, { useState } from 'react';
import { Bell, Sparkles, AlertTriangle, UserCheck, FileCheck, Check, Clock, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'analysis' | 'fusion' | 'scout' | 'report' | 'consent';
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  linkText?: string;
  routeTarget?: string;
}

interface NotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      category: 'fusion',
      title: 'Statistical Fusion Conflict Detected',
      message: 'Canons vs KIU Titans: Coach recorded 4 assists for Jerry Kayanga (#11), but Gemini video events extracted 2. Direct clip timestamps available for review.',
      timeAgo: '15 mins ago',
      isRead: false,
      linkText: 'Resolve in Fusion Matrix',
      routeTarget: 'fusion',
    },
    {
      id: 'notif_2',
      category: 'analysis',
      title: 'Multimodal Video Analysis Completed',
      message: 'Footage from Mukono Courts processed with 92% visual quality score. 8 match events extracted with confidence scores.',
      timeAgo: '42 mins ago',
      isRead: false,
      linkText: 'Open Video Deck',
      routeTarget: 'coach',
    },
    {
      id: 'notif_3',
      category: 'scout',
      title: 'New Scout Recruitment Inquiry',
      message: 'David Ochieng (East Africa Basketball Federation) submitted a formal recruitment inquiry regarding Titus Lual (#7).',
      timeAgo: '2 hours ago',
      isRead: false,
      linkText: 'Inspect in Admin Deck',
      routeTarget: 'admin',
    },
    {
      id: 'notif_4',
      category: 'report',
      title: 'Match Report Numerical Verification Passed',
      message: '100% of numerical figures in the Canons post-match report verified against raw box-scores and timestamps. Ready for coach sign-off.',
      timeAgo: '3 hours ago',
      isRead: true,
      linkText: 'Review Report',
      routeTarget: 'reports',
    },
    {
      id: 'notif_5',
      category: 'consent',
      title: 'Athlete Privacy Consent Mutated',
      message: 'Student-athlete Titus Lual updated his scout directory visibility to ENABLED. Profile now searchable by accredited scouts.',
      timeAgo: 'Yesterday',
      isRead: true,
      linkText: 'View Audit Trail',
      routeTarget: 'admin',
    },
  ]);

  const markAllRead = () => {
    setItems(items.map(i => ({ ...i, isRead: true })));
  };

  const markOneRead = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isRead: true } : i));
  };

  const displayedItems = items.filter(i => filter === 'all' || !i.isRead);

  const getIcon = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'analysis':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'fusion':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'scout':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'report':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'consent':
        return <Bell className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Alert Center</span>
            <span>·</span>
            <span>Live System Stream</span>
            <span>·</span>
            <span className="text-emerald-600">Institutional Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            Notifications & System Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Video analysis results, fusion conflict alerts, verified scout recruitment inquiries, and publications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filter === 'all' ? 'bg-[#2954ea] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          All Alerts ({items.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filter === 'unread' ? 'bg-[#2954ea] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Unread ({items.filter(i => !i.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className={`bwin-card p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
              !item.isRead ? 'border-l-4 border-l-[#2954ea] bg-blue-50/20' : ''
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {getIcon(item.category)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {item.linkText && item.routeTarget && (
                <button
                  onClick={() => {
                    markOneRead(item.id);
                    onNavigate(item.routeTarget!);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs"
                >
                  {item.linkText}
                </button>
              )}
              {!item.isRead && (
                <button
                  onClick={() => markOneRead(item.id)}
                  title="Mark read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
