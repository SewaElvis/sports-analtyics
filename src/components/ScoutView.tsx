/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Scout Talent Discovery Hub:
 * - Privacy Shield: Scouts only see athletes where scoutVisible=true AND scout is approved
 * - Filter by sport, position, and metrics
 * - Athlete Shortlisting
 * - Admin-Mediated Contact Request Modal (No direct student athlete contact)
 */

import React, { useState } from 'react';
import { Player, SportType, ScoutContactRequest } from '../types';
import { saveScoutRequest, logAuditEntry } from '../lib/storage';
import { 
  ShieldCheck, Lock, Search, Filter, Star, 
  Send, UserCheck, EyeOff, AlertCircle
} from 'lucide-react';

interface ScoutViewProps {
  players: Player[];
  isScoutApproved: boolean;
  onOpenAuditLogs: () => void;
}

export const ScoutView: React.FC<ScoutViewProps> = ({
  players,
  isScoutApproved,
  onOpenAuditLogs,
}) => {
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [activeRequestPlayer, setActiveRequestPlayer] = useState<Player | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  // CRITICAL FIREWALL: Filter only athletes who have given consent (scoutVisible == true)
  const consentingAthletes = players.filter(p => p.consents.scoutVisible);

  // Filter based on search and position
  const visibleAthletes = consentingAthletes.filter(p => {
    if (selectedSport !== 'all' && p.sportId !== selectedSport) return false;
    if (positionFilter !== 'all' && !p.position.toLowerCase().includes(positionFilter.toLowerCase())) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.position.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleShortlist = (playerId: string) => {
    if (shortlist.includes(playerId)) {
      setShortlist(shortlist.filter(id => id !== playerId));
    } else {
      setShortlist([...shortlist, playerId]);
    }
  };

  const handleSendContactRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestPlayer || !contactMessage.trim()) return;

    const request: ScoutContactRequest = {
      id: `req_${Date.now()}`,
      scoutId: 'usr_scout_kampala',
      scoutName: 'East Africa Basketball Federation Scout',
      scoutOrg: 'FUBA / CECAFA Talent Registry',
      playerId: activeRequestPlayer.id,
      playerDisplayRef: `${activeRequestPlayer.name} (#${activeRequestPlayer.shirtNumber})`,
      sport: activeRequestPlayer.sportId,
      message: contactMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveScoutRequest(request);
    logAuditEntry({
      actorUid: 'usr_scout_kampala',
      actorEmail: 'scout@talent-registry.org',
      actorRole: 'scout',
      action: 'SCOUT_CONTACT_REQUEST',
      targetCollection: 'scoutRequests',
      targetId: request.id,
      details: `Submitted formal contact inquiry for athlete ${request.playerDisplayRef} to UCU Sports Admin.`,
    });

    setSubmittedStatus('Inquiry submitted to UCU Sports Administration for vetting.');
    setTimeout(() => {
      setSubmittedStatus(null);
      setActiveRequestPlayer(null);
      setContactMessage('');
    }, 2500);
  };

  // If scout is not approved, show blocked firewall screen
  if (!isScoutApproved) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Scout Accreditation Pending Approval</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          In strict compliance with Uganda Christian University athletic privacy standards, student-athlete performance databases and video reels remain encrypted until a university sports administrator verifies and approves your professional scouting credentials.
        </p>
        <div className="pt-2 text-xs text-zinc-500 font-mono">
          Switch to <strong className="text-zinc-300">Admin view</strong> in the top navigation bar to toggle scout verification.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scout Discovery Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              Verified Scout Credentials
            </span>
            <span aria-hidden="true">·</span>
            <span>UCU Talent Exchange</span>
            <span aria-hidden="true">·</span>
            <span>Privacy Firewall Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Talent Discovery Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Displays only student-athletes who have explicitly consented to scout indexing. Direct contact info is redacted; all recruitment inquiries are mediated by UCU Sports Administration.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-850 text-right">
            <span className="text-[11px] text-zinc-500 block">Shortlisted</span>
            <span className="font-mono font-bold text-white tabular-nums text-sm">
              {shortlist.length} Athletes
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sport Selector */}
          <div className="inline-flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                selectedSport === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Sports
            </button>
            <button
              onClick={() => setSelectedSport('basketball')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                selectedSport === 'basketball' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Basketball
            </button>
            <button
              onClick={() => setSelectedSport('football')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                selectedSport === 'football' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Football
            </button>
          </div>

          {/* Position Selector */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-hidden"
          >
            <option value="all">All Positions</option>
            <option value="guard">Guards</option>
            <option value="forward">Forwards</option>
            <option value="center">Centers</option>
            <option value="striker">Strikers</option>
            <option value="defender">Defenders</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prospects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-zinc-600 text-xs"
          />
        </div>
      </div>

      {/* Athletes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAthletes.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
            <EyeOff className="w-10 h-10 mx-auto mb-2 stroke-1" />
            <p className="text-sm font-medium text-zinc-300">No Prospects Matching Filter Criteria</p>
            <p className="text-xs text-zinc-500 mt-1">
              Note: Athletes who have disabled scout directory visibility in their portal are withheld automatically.
            </p>
          </div>
        ) : (
          visibleAthletes.map((athlete) => {
            const isShortlisted = shortlist.includes(athlete.id);
            return (
              <div
                key={athlete.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="font-mono font-bold text-zinc-300">#{athlete.shirtNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{athlete.sportId}</span>
                        <span aria-hidden="true">·</span>
                        <span>Year {athlete.yearOfStudy}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1 group-hover:text-zinc-200">
                        {athlete.name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">{athlete.position}</p>
                    </div>

                    <button
                      onClick={() => toggleShortlist(athlete.id)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isShortlisted
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border-zinc-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                    {athlete.bio || `${athlete.position} competing for Uganda Christian University varsity athletics.`}
                  </p>

                  {/* Physical Dimensions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono tabular-nums bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase">Height</span>
                      <span className="text-zinc-200 font-semibold">{athlete.heightCm ? `${athlete.heightCm} cm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase">Weight</span>
                      <span className="text-zinc-200 font-semibold">{athlete.weightKg ? `${athlete.weightKg} kg` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Performance Averages */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                      Season Metrics
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {Object.entries(athlete.seasonStats).map(([key, val]) => (
                        <div key={key} className="bg-zinc-950 px-2 py-1 rounded border border-zinc-850 text-zinc-300">
                          <span className="uppercase text-zinc-500 text-[10px] mr-1">{key}:</span>
                          <strong className="text-white">{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-zinc-600" />
                    <span>PII Shielded</span>
                  </div>

                  <button
                    onClick={() => setActiveRequestPlayer(athlete)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Contact UCU Admin</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin-Mediated Contact Request Modal */}
      {activeRequestPlayer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Formal Recruitment Inquiry
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Target Prospect: <strong className="text-zinc-200">{activeRequestPlayer.name} (#{activeRequestPlayer.shirtNumber})</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveRequestPlayer(null)}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-1">
              <strong className="text-zinc-200 block font-semibold">Institutional Governance Notice:</strong>
              <p>
                Uganda Christian University enforces strict athlete safeguard guidelines. Your request is transmitted directly to the UCU Sports Department Director for review before athlete contact details or official meetings are authorized.
              </p>
            </div>

            {submittedStatus ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs text-center font-medium">
                ✓ {submittedStatus}
              </div>
            ) : (
              <form onSubmit={handleSendContactRequest} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">
                    Official Scouting Inquiry Details:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="State your organization, trial/scholarship opportunity, and requested film reel review..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-zinc-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveRequestPlayer(null)}
                    className="px-3.5 py-1.5 text-xs rounded-lg text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
