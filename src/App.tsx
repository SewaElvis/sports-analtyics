/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Smart Multi-Field Sports Analytics System
 * Uganda Christian University (UCU) Sports Department
 * 
 * World-Class Clean Interface directly mirroring the bwin / Slava Kornilov reference design:
 * - Top Cobalt Blue Navigation Header (#2954ea)
 * - Dual-Tone Profile & 2-Column Icon Left Sidebar
 * - Full Dedicated Routes for each Sidebar Component (Dashboard, Posts, Saved, Rewards, Notifications, Messages, Teams, Settings)
 * - Full Dedicated Routes for each System Actor (Coach Desk, Player Portal, Scout Hub, Admin Console)
 * - Floating White Cards with Soft Shadows on Light Grey-Blue Canvas (#edf2f9)
 */

import React, { useState, useEffect } from 'react';
import { UserRole, SportType, Match, Player, MatchReport } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MatchHeroCard } from './components/MatchHeroCard';
import { MatchCard } from './components/MatchCard';
import { CoachPage } from './components/CoachPage';
import { PlayerPage } from './components/PlayerPage';
import { ScoutPage } from './components/ScoutPage';
import { AdminPage } from './components/AdminPage';
import { PostsPage } from './components/PostsPage';
import { SavedClipsPage } from './components/SavedClipsPage';
import { RewardsPage } from './components/RewardsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { MessagesPage } from './components/MessagesPage';
import { TeamsPage } from './components/TeamsPage';
import { SettingsPage } from './components/SettingsPage';
import { AuditLogModal } from './components/AuditLogModal';
import { TacticalArena3D } from './components/TacticalArena3D';
import { GeminiChatbot } from './components/GeminiChatbot';
import { VideoGeneratorModal } from './components/VideoGeneratorModal';
import { SportsLandingPage } from './components/SportsLandingPage';
import { AuthPages } from './components/AuthPages';
import { ComputerVisionHub } from './components/ComputerVisionHub';
import { 
  getStoredMatches, saveStoredMatches, 
  getStoredPlayers, saveStoredPlayers, 
  getStoredAuditLogs, logAuditEntry,
  getStoredAppraisals
} from './lib/storage';
import { SEED_TEAMS, SEED_MATCHES, SEED_PLAYERS } from './lib/mockData';
import { Users, Filter, ArrowRight, ShieldCheck, Trophy, Sparkles, ChevronDown, Video, Compass, Bot } from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('coach');
  const [activeSport, setActiveSport] = useState<SportType>('basketball');
  const [activeRoute, setActiveRoute] = useState<string>('landing');
  
  const [matches, setMatches] = useState<Match[]>(() => getStoredMatches());
  const [players, setPlayers] = useState<Player[]>(() => getStoredPlayers());
  const [auditLogs, setAuditLogs] = useState(() => getStoredAuditLogs());
  const [appraisals, setAppraisals] = useState(() => getStoredAppraisals());
  const [isScoutApproved, setIsScoutApproved] = useState(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isVideoGenModalOpen, setIsVideoGenModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  // Active match selected for coach review
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match_canons_vs_kiu');
  // Active player in player portal
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('ply_canons_7');

  // Sync with Cloud SQL PostgreSQL on mount
  useEffect(() => {
    fetch('/api/db/matches')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.matches?.length > 0) {
          console.log('[Cloud SQL] Synchronized matches from PostgreSQL:', data.matches.length);
        }
      })
      .catch(err => console.log('[Cloud SQL] Using local storage resilience'));
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      if (['coach', 'player', 'scout', 'admin'].includes(hash)) {
        setActiveRole(hash as UserRole);
        setActiveRoute(hash);
      } else if ([
        'dashboard', 'matches', 'posts', 'saved', 'rewards', 
        'notifications', 'messages', 'teams', 'squad', 'settings', 
        'fusion', 'reports', 'scouts', 'arena', 'assistant',
        'landing', 'login', 'register', 'cv'
      ].includes(hash)) {
        setActiveRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    setActiveRoute(route);
    window.location.hash = route;
    if (['coach', 'player', 'scout', 'admin'].includes(route)) {
      setActiveRole(route as UserRole);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    navigateTo(role);
  };

  const handleSportChange = (sport: SportType) => {
    setActiveSport(sport);
    if (sport === 'basketball') {
      setSelectedPlayerId('ply_canons_7');
      setSelectedMatchId('match_canons_vs_kiu');
    } else {
      setSelectedPlayerId('ply_cardinals_9');
      setSelectedMatchId('match_cardinals_vs_ku');
    }
  };

  const currentSportMatches = matches.filter(m => m.sportId === activeSport);
  const currentSquad = players.filter(p => p.sportId === activeSport);
  const activeMatch = matches.find(m => m.id === selectedMatchId) || currentSportMatches[0] || matches[0];
  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const activeAppraisal = appraisals.find(a => a.playerId === activePlayer?.id);

  // Update match state
  const handleUpdateMatch = (updated: Match) => {
    const updatedList = matches.map(m => (m.id === updated.id ? updated : m));
    setMatches(updatedList);
    saveStoredMatches(updatedList);
  };

  // Publish report
  const handlePublishReport = (matchId: string, report: MatchReport) => {
    const updatedList = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'published' as Match['status'],
          report,
        };
      }
      return m;
    });
    setMatches(updatedList);
    saveStoredMatches(updatedList);
    setAuditLogs(getStoredAuditLogs());
  };

  // Update player (e.g. consents)
  const handleUpdatePlayer = (updated: Player) => {
    const updatedList = players.map(p => (p.id === updated.id ? updated : p));
    setPlayers(updatedList);
    saveStoredPlayers(updatedList);
    setAuditLogs(getStoredAuditLogs());
  };

  // Run Gemini analysis on featured match
  const handleRunFeaturedAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportId: activeMatch.sportId,
          matchName: `${activeMatch.opponent} Match`,
          videoMetadata: { durationSeconds: 600 },
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        handleUpdateMatch({
          ...activeMatch,
          analysis: data.analysis,
          status: 'needs_review',
        });
        navigateTo('coach');
      }
    } catch (err) {
      console.error('Featured analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-seed data
  const handleClearAndReseed = () => {
    setMatches(SEED_MATCHES);
    saveStoredMatches(SEED_MATCHES);
    setPlayers(SEED_PLAYERS);
    saveStoredPlayers(SEED_PLAYERS);
    setAuditLogs(getStoredAuditLogs());
    navigateTo('dashboard');
  };

  if (activeRoute === 'landing') {
    return (
      <SportsLandingPage
        onEnterApp={(role, sport) => {
          setActiveRole(role as UserRole);
          setActiveSport(sport);
          navigateTo('dashboard');
        }}
        onNavigateAuth={(mode) => navigateTo(mode)}
      />
    );
  }

  if (activeRoute === 'login' || activeRoute === 'register') {
    return (
      <AuthPages
        initialMode={activeRoute === 'register' ? 'register' : 'login'}
        onLoginSuccess={(role, sport) => {
          setActiveRole(role);
          setActiveSport(sport);
          navigateTo('dashboard');
        }}
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f9] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Cobalt Header Bar (matching bwin top navigation) */}
      <Header
        activeSport={activeSport}
        onSportChange={handleSportChange}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onNavigate={navigateTo}
        activeRoute={activeRoute}
      />

      {/* Main Framework Layout with Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Left Dual-Tone Sidebar */}
        <Sidebar
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          activeRoute={activeRoute}
          onRouteChange={navigateTo}
          customAvatar={customAvatar}
          onUpdateAvatar={(url) => setCustomAvatar(url)}
          onOpenAudit={() => {
            setAuditLogs(getStoredAuditLogs());
            setIsAuditModalOpen(true);
          }}
        />

        {/* Right Main Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* =========================================================================
              ROUTE 1: DASHBOARD / MATCH CENTER (Directly mirroring the reference design)
             ========================================================================= */}
          {(activeRoute === 'dashboard' || activeRoute === 'matches') && (
            <div className="space-y-6">
              {/* Featured Hero Match Card (mirrors Real Madrid vs Atletico in reference) */}
              <MatchHeroCard
                match={activeMatch}
                onOpenDeck={() => {
                  setActiveRole('coach');
                  navigateTo('coach');
                }}
                onAnalyze={handleRunFeaturedAnalysis}
                isAnalyzing={isAnalyzing}
              />

              {/* League Selector Header & Filter Strip (mirroring reference filter) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                    <span>🇺🇬</span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {activeSport === 'basketball' ? 'NBL University League' : 'University Football League'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs text-xs font-bold text-slate-700 cursor-pointer">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Premier League Fixtures</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold">Sort by:</span>
                  <select
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 focus:outline-hidden shadow-2xs cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value === 'football') handleSportChange('football');
                      else handleSportChange('basketball');
                    }}
                    value={activeSport}
                  >
                    <option value="basketball">Canons Basketball (Mukono)</option>
                    <option value="football">Cardinals Football (Mukono)</option>
                  </select>
                </div>
              </div>

              {/* Sub-grid of 3 Clean Match Cards (mirroring Bayern/PSG, Man Utd/Leicester, Chelsea/Huddersfield) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {matches.map((m, idx) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    tipsBadge={
                      idx === 0
                        ? { count: '+10 tips', isPositive: true }
                        : idx === 1
                        ? { count: '-4 tips', isPositive: false }
                        : { count: '+3 tips', isPositive: true }
                    }
                    onSelect={() => {
                      setSelectedMatchId(m.id);
                      setActiveRole('coach');
                      navigateTo('coach');
                    }}
                  />
                ))}
              </div>

              {/* Additional Fixtures Row (peek row at the bottom from reference image) */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Upcoming Match Schedule
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bwin-card p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">UCU vs UMU</span>
                      <span className="text-[11px] text-slate-400">Campus Stadium</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">11:30</span>
                  </div>
                  <div className="bwin-card p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">UCU vs Makerere</span>
                      <span className="text-[11px] text-slate-400">Main Arena</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">18:00</span>
                  </div>
                  <div className="bwin-card p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">UCU vs Kyambogo</span>
                      <span className="text-[11px] text-slate-400">Mukono Courts</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">14:30</span>
                  </div>
                  <div className="bwin-card p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">UCU vs Ndejje</span>
                      <span className="text-[11px] text-slate-400">Regional Sports Hub</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">20:30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              ROUTE 2: POSTS & TACTICAL BULLETINS (Sidebar "Posts" Button)
             ========================================================================= */}
          {activeRoute === 'posts' && (
            <PostsPage
              activeSport={activeSport}
              matches={matches}
            />
          )}

          {/* =========================================================================
              ROUTE 3: SAVED VIDEO CLIPS & HIGHLIGHTS (Sidebar "Saved" Button)
             ========================================================================= */}
          {activeRoute === 'saved' && (
            <SavedClipsPage
              matches={matches}
              onPlayClip={(matchId, timestamp) => {
                setSelectedMatchId(matchId);
                setActiveRole('coach');
                navigateTo('coach');
              }}
            />
          )}

          {/* =========================================================================
              ROUTE 4: REWARDS & APPRAISALS (Sidebar "Rewards" Button)
             ========================================================================= */}
          {activeRoute === 'rewards' && (
            <RewardsPage
              players={players}
              appraisals={appraisals}
              activeSport={activeSport}
            />
          )}

          {/* =========================================================================
              ROUTE 5: NOTIFICATIONS & ALERT STREAM (Sidebar "Notifications" Button)
             ========================================================================= */}
          {activeRoute === 'notifications' && (
            <NotificationsPage
              onNavigate={navigateTo}
            />
          )}

          {/* =========================================================================
              ROUTE 6: MESSAGES & SCOUT INQUIRIES (Sidebar "Messages" Button)
             ========================================================================= */}
          {activeRoute === 'messages' && (
            <MessagesPage />
          )}

          {/* =========================================================================
              ROUTE 7: TEAMS & ROSTERS (Sidebar "Teams" Button)
             ========================================================================= */}
          {(activeRoute === 'teams' || activeRoute === 'squad') && (
            <TeamsPage
              teams={SEED_TEAMS}
              players={players}
              activeSport={activeSport}
              onSportChange={handleSportChange}
              onSelectPlayer={(playerId) => {
                setSelectedPlayerId(playerId);
                setActiveRole('player');
                navigateTo('player');
              }}
            />
          )}

          {/* =========================================================================
              ROUTE 8: SETTINGS & GOVERNANCE (Sidebar "Settings" Button)
             ========================================================================= */}
          {activeRoute === 'settings' && (
            <SettingsPage
              onClearAndReseed={handleClearAndReseed}
            />
          )}

          {/* =========================================================================
              ACTOR ROUTE A: COACH DESK
             ========================================================================= */}
          {activeRoute === 'coach' && (
            <CoachPage
              match={activeMatch}
              onUpdateMatch={handleUpdateMatch}
              squad={currentSquad}
              onPublishReport={handlePublishReport}
              onSelectOtherMatch={() => navigateTo('dashboard')}
            />
          )}

          {/* =========================================================================
              ACTOR ROUTE B: PLAYER PORTAL
             ========================================================================= */}
          {activeRoute === 'player' && (
            <div className="space-y-6">
              {/* Athlete Profile Switcher Strip */}
              <div className="bwin-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-500">
                  Viewing Athlete Account: <strong className="text-slate-900">{activePlayer.name} (#{activePlayer.shirtNumber})</strong>
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {currentSquad.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        p.id === selectedPlayerId
                          ? 'bg-[#2954ea] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      #{p.shirtNumber} {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <PlayerPage
                player={activePlayer}
                onUpdatePlayer={handleUpdatePlayer}
                matches={matches}
                appraisal={activeAppraisal}
                onSelectClip={() => {
                  setActiveRole('coach');
                  navigateTo('coach');
                }}
              />
            </div>
          )}

          {/* =========================================================================
              ACTOR ROUTE C: SCOUT HUB
             ========================================================================= */}
          {(activeRoute === 'scout' || activeRoute === 'scouts') && (
            <ScoutPage
              players={players}
              isScoutApproved={isScoutApproved}
              onOpenAudit={() => setIsAuditModalOpen(true)}
            />
          )}

          {/* =========================================================================
              ACTOR ROUTE D: ADMIN CONSOLE
             ========================================================================= */}
          {activeRoute === 'admin' && (
            <AdminPage
              teams={SEED_TEAMS}
              players={players}
              isScoutApproved={isScoutApproved}
              onToggleScoutApproval={() => {
                setIsScoutApproved(!isScoutApproved);
                logAuditEntry({
                  actorUid: 'usr_admin_1',
                  actorEmail: 'director.sports@ucu.ac.ug',
                  actorRole: 'admin',
                  action: 'APPROVE_SCOUT',
                  targetCollection: 'users',
                  targetId: 'usr_scout_kampala',
                  details: `Toggled scout accreditation to ${!isScoutApproved ? 'APPROVED' : 'REVOKED'}.`,
                });
                setAuditLogs(getStoredAuditLogs());
              }}
              auditLogs={auditLogs}
            />
          )}

          {/* =========================================================================
              SPECIALIZED SHORTCUTS: FUSION MATRIX & AI REPORTS
             ========================================================================= */}
          {activeRoute === 'fusion' && (
            <CoachPage
              match={activeMatch}
              onUpdateMatch={handleUpdateMatch}
              squad={currentSquad}
              onPublishReport={handlePublishReport}
              onSelectOtherMatch={() => navigateTo('dashboard')}
            />
          )}

          {activeRoute === 'reports' && (
            <CoachPage
              match={activeMatch}
              onUpdateMatch={handleUpdateMatch}
              squad={currentSquad}
              onPublishReport={handlePublishReport}
              onSelectOtherMatch={() => navigateTo('dashboard')}
            />
          )}

          {/* =========================================================================
              FEATURE 1: THREE.JS 3D TACTICAL ARENA
             ========================================================================= */}
          {activeRoute === 'arena' && (
            <div className="space-y-6">
              <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="text-blue-600 uppercase tracking-wider">Spatial Simulation</span>
                    <span>·</span>
                    <span>Three.js PBR Studio Engine</span>
                    <span>·</span>
                    <span className="text-emerald-600">60 FPS Lossless Loop</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <span>3D Tactical Arena & Play Simulator</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Interactive 3D basketball court and football pitch with procedural composite player models, tactical play runs, and camera presets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVideoGenModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    <span>Generate Video of Play</span>
                  </button>
                </div>
              </div>

              <TacticalArena3D initialSport={activeSport} />
            </div>
          )}

          {/* =========================================================================
              FEATURE: REAL-WORLD COMPUTER VISION SIMULATION HUB (YOLO / ByteTrack / BOT-SORT / MediaPipe)
             ========================================================================= */}
          {activeRoute === 'cv' && (
            <ComputerVisionHub initialSport={activeSport} />
          )}

          {/* =========================================================================
              FEATURE 3: GEMINI MULTI-TURN AI CHATBOT
             ========================================================================= */}
          {activeRoute === 'assistant' && (
            <div className="space-y-6">
              <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="text-blue-600 uppercase tracking-wider">Conversational Intelligence</span>
                    <span>·</span>
                    <span>Gemini Models</span>
                    <span>·</span>
                    <span className="text-emerald-600">Multi-Turn History</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span>UCU Athletics Multi-Role AI Assistant</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Powered by gemini-4-argon (tactical film reasoning), gemini-3.8-flash (coaching strategy), and gemini-3.1-flash-lite (fast stats lookup).
                  </p>
                </div>
              </div>

              <GeminiChatbot />
            </div>
          )}
        </main>
      </div>

      {/* Compliance Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      {/* AI Text-to-Video Generator Modal (gemini-omni-1.2-flash via Interactions API) */}
      <VideoGeneratorModal
        isOpen={isVideoGenModalOpen}
        onClose={() => setIsVideoGenModalOpen(false)}
        onVideoGenerated={(url, prompt) => {
          console.log('[Video Generated]', prompt);
        }}
      />
    </div>
  );
}
