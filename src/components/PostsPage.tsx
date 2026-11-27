/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Match Feed & Tactical Posts Page
 * Live game day updates, coach bulletins, tactical previews, and analysis announcements.
 */

import React, { useState } from 'react';
import { Match, SportType } from '../types';
import { MessageSquare, Heart, Share2, Sparkles, Send, Clock, User, Pin, Tag } from 'lucide-react';

interface PostsPageProps {
  activeSport: SportType;
  matches: Match[];
}

interface PostItem {
  id: string;
  author: string;
  role: string;
  avatar: string;
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  isPinned?: boolean;
  matchRef?: string;
}

export const PostsPage: React.FC<PostsPageProps> = ({ activeSport, matches }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'p1',
      author: 'Coach Nicholas Natuhereza',
      role: 'Head Coach · UCU Canons Basketball',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
      timeAgo: '2 hours ago',
      title: 'Post-Match Film Breakdown: Defensive Rebound Execution vs KIU Titans',
      content: 'Film review from the 4th quarter demonstrates great weak-side rim protection by Titus Lual (#7). Our transition offense directly produced 18 fastbreak points. Let\'s continue sharpening the high-post entry pass before next week\'s semifinal.',
      tags: ['TacticalAnalysis', 'FilmReview', 'CanonsPride', 'Rebounding'],
      likes: 24,
      commentsCount: 6,
      isPinned: true,
      matchRef: 'Canons vs KIU Titans (78 - 65)',
    },
    {
      id: 'p2',
      author: 'Dr. Sewa Elvis',
      role: 'Director of Sports · UCU Sports Department',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
      timeAgo: 'Yesterday at 16:30',
      title: 'Multimodal Video Analytics Pilot Launched for Mukono Varsity Teams',
      content: 'Official announcement: The Department has enabled Gemini multimodal match event extraction for all home fixtures. Coaches can now resolve count discrepancies via the Statistical Fusion engine with direct clip timestamps.',
      tags: ['SmartSports', 'AIAnalytics', 'UCUSports', 'Innovation'],
      likes: 42,
      commentsCount: 11,
      matchRef: 'University Athletics Directorate',
    },
    {
      id: 'p3',
      author: 'Coach Kintu Mwera Jimmy',
      role: 'Head Coach · UCU Cardinals Football',
      avatar: '/src/assets/images/avatar_athlete_titus_1793973784097.jpg',
      timeAgo: '2 days ago',
      title: 'Cardinals Squad Bulletin: Allan Okello Reaches 12-Goal Milestone',
      content: 'With his second-half header against Kampala University, striker Allan Okello (#9) has scored 12 goals in the University Football League conference. Video highlights and scout profile are now accessible to vetted talent scouts.',
      tags: ['CardinalsFC', 'Goalscorer', 'UFL2026', 'Milestone'],
      likes: 38,
      commentsCount: 9,
      matchRef: 'Cardinals vs Kampala University (2 - 1)',
    },
  ]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: PostItem = {
      id: `post_${Date.now()}`,
      author: 'Nicholas Natuhereza',
      role: 'Head Coach · UCU Canons',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
      timeAgo: 'Just now',
      title: newPostTitle.trim() || 'Coaching Staff Tactical Update',
      content: newPostContent.trim(),
      tags: [activeSport === 'basketball' ? 'Basketball' : 'Football', 'GamePrep', 'Varsity'],
      likes: 1,
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">UCU Match Center</span>
            <span>·</span>
            <span>Community & Coaching Feed</span>
            <span>·</span>
            <span className="text-emerald-600">Varsity Athletics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            Tactical Feed & Match Bulletins
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time game reports, coaching staff tactical debriefs, and athlete milestone announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Feed Items</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{posts.length} Posts</span>
          </div>
        </div>
      </div>

      {/* Create New Post Card */}
      <div className="bwin-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <img
            src="/src/assets/images/avatar_coach_nicholas_1793973783261.jpg"
            alt="Coach"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
          />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Publish Tactical Note or Squad Bulletin</h2>
            <p className="text-xs text-slate-500">Share film review takeaways or training focus with the team.</p>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <input
            type="text"
            placeholder="Post headline (e.g., Transition Defense Focus for Saturday's Derby)..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
          />
          <textarea
            rows={3}
            required
            placeholder="Write tactical notes, player shout-outs, or film review insights..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Auto-tagged for {activeSport === 'basketball' ? 'Canons Basketball' : 'Cardinals Football'}</span>
              </span>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Bulletin</span>
            </button>
          </div>
        </form>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bwin-card p-6 space-y-3 hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{post.author}</h3>
                    {post.isPinned && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-200">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{post.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.timeAgo}</span>
              </div>
            </div>

            {/* Post Match Reference Badge */}
            {post.matchRef && (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{post.matchRef}</span>
              </div>
            )}

            {/* Post Content */}
            <h4 className="text-base font-bold text-slate-900 pt-1">{post.title}</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{post.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-50 text-blue-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 hover:text-rose-600 transition-colors font-semibold"
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-mono tabular-nums">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-semibold">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-mono tabular-nums">{post.commentsCount} Comments</span>
                </button>
              </div>

              <button className="hover:text-slate-800 transition-colors flex items-center gap-1 font-semibold">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
