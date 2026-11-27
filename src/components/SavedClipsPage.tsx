/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Saved Highlights & Bookmarked Match Clips Page
 * Fast clip jumping, categorized by athlete, sport, and event outcome with instant video review.
 */

import React, { useState } from 'react';
import { Match, GeminiVideoEvent } from '../types';
import { Bookmark, Play, Film, Clock, Share2, Tag, CheckCircle2, Search, Filter } from 'lucide-react';

interface SavedClipsPageProps {
  matches: Match[];
  onPlayClip: (matchId: string, timestamp: number) => void;
}

interface SavedClipItem {
  id: string;
  matchId: string;
  matchTitle: string;
  sport: 'basketball' | 'football';
  event: GeminiVideoEvent;
  bookmarkedBy: string;
  tags: string[];
}

export const SavedClipsPage: React.FC<SavedClipsPageProps> = ({ matches, onPlayClip }) => {
  const [filterSport, setFilterSport] = useState<'all' | 'basketball' | 'football'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract events across matches into saved highlights
  const savedClips: SavedClipItem[] = [
    {
      id: 'clip_1',
      matchId: 'match_canons_vs_kiu',
      matchTitle: 'UCU Canons vs KIU Titans',
      sport: 'basketball',
      event: {
        type: 'shot',
        timestamp_seconds: 18,
        team: 'UCU Canons',
        player_ref: '#7 Titus Lual',
        outcome: 'success',
        confidence: 0.95,
        note: 'Mid-range pull-up jumper from free throw line elbow with clean release.',
      },
      bookmarkedBy: 'Coach Nicholas',
      tags: ['JumpShot', 'Offense', 'Titus7'],
    },
    {
      id: 'clip_2',
      matchId: 'match_canons_vs_kiu',
      matchTitle: 'UCU Canons vs KIU Titans',
      sport: 'basketball',
      event: {
        type: 'assist',
        timestamp_seconds: 115,
        team: 'UCU Canons',
        player_ref: '#11 Jerry Kayanga',
        outcome: 'success',
        confidence: 0.92,
        note: 'Drive-and-kick corner skip pass for open corner 3-pointer.',
      },
      bookmarkedBy: 'Coach Nicholas',
      tags: ['Playmaking', 'DriveAndKick', 'Jerry11'],
    },
    {
      id: 'clip_3',
      matchId: 'match_canons_vs_kiu',
      matchTitle: 'UCU Canons vs KIU Titans',
      sport: 'basketball',
      event: {
        type: 'rebound',
        timestamp_seconds: 45,
        team: 'UCU Canons',
        player_ref: '#7 Titus Lual',
        outcome: 'success',
        confidence: 0.93,
        note: 'Contested defensive rebound clearing two opposing centers under the rim.',
      },
      bookmarkedBy: 'Scout David Ochieng',
      tags: ['Defense', 'Rebounding', 'PaintControl'],
    },
    {
      id: 'clip_4',
      matchId: 'match_cardinals_vs_ku',
      matchTitle: 'UCU Cardinals vs Kampala University',
      sport: 'football',
      event: {
        type: 'goal',
        timestamp_seconds: 285,
        team: 'UCU Cardinals',
        player_ref: '#9 Allan Okello',
        outcome: 'success',
        confidence: 0.98,
        note: 'Thunderous header from in-swinging corner into the bottom right corner.',
      },
      bookmarkedBy: 'Coach Kintu Mwera',
      tags: ['HeaderGoal', 'SetPiece', 'Allan9'],
    },
    {
      id: 'clip_5',
      matchId: 'match_cardinals_vs_ku',
      matchTitle: 'UCU Cardinals vs Kampala University',
      sport: 'football',
      event: {
        type: 'tackle',
        timestamp_seconds: 68,
        team: 'UCU Cardinals',
        player_ref: '#4 Godfrey Akol',
        outcome: 'success',
        confidence: 0.91,
        note: 'Decisive slide tackle in the defensive penalty box preventing clear chance.',
      },
      bookmarkedBy: 'Coach Kintu Mwera',
      tags: ['SlideTackle', 'CleanDefense', 'Godfrey4'],
    },
  ];

  const filteredClips = savedClips.filter((clip) => {
    if (filterSport !== 'all' && clip.sport !== filterSport) return false;
    if (filterType !== 'all' && clip.event.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${clip.event.player_ref} ${clip.event.note} ${clip.matchTitle} ${clip.tags.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Video Vault</span>
            <span>·</span>
            <span>Bookmarked Key Moments</span>
            <span>·</span>
            <span className="text-emerald-600">Film Room</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            Saved Highlights & Tagged Clips
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key match events bookmarked by coaching staff and scouts with instant film seek.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Saved Clips</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{filteredClips.length} Clips</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bwin-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sport Filter */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100">
            <button
              onClick={() => setFilterSport('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterSport === 'all' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sports
            </button>
            <button
              onClick={() => setFilterSport('basketball')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterSport === 'basketball' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Basketball
            </button>
            <button
              onClick={() => setFilterSport('football')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterSport === 'football' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Football
            </button>
          </div>

          {/* Event Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="all">All Action Types</option>
            <option value="shot">Shots</option>
            <option value="goal">Goals</option>
            <option value="assist">Assists</option>
            <option value="rebound">Rebounds</option>
            <option value="tackle">Tackles</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clips by player or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-slate-800 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClips.map((item) => (
          <div
            key={item.id}
            className="bwin-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all group"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <span>{item.sport === 'basketball' ? '🏀' : '⚽'}</span>
                  <span>{item.matchTitle}</span>
                </span>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {formatSeconds(item.event.timestamp_seconds)}
                </span>
              </div>

              {/* Action Banner */}
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{item.event.player_ref}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md">
                    {item.event.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.event.note}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((t, i) => (
                  <span key={i} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Play Button & Bookmark Meta */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">By {item.bookmarkedBy}</span>

              <button
                onClick={() => onPlayClip(item.matchId, item.event.timestamp_seconds)}
                className="px-4 py-2 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play at {formatSeconds(item.event.timestamp_seconds)}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
