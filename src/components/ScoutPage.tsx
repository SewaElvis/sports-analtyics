/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dedicated Scout Discovery Page
 * Privacy-shielded talent matrix matching reference styling.
 */

import React, { useState } from 'react';
import { Player, SportType, ScoutContactRequest } from '../types';
import { saveScoutRequest, logAuditEntry } from '../lib/storage';
import { 
  ShieldCheck, Lock, Search, Star, 
  Send, UserCheck, EyeOff, AlertCircle
} from 'lucide-react';

interface ScoutPageProps {
  players: Player[];
  isScoutApproved: boolean;
  onOpenAudit: () => void;
}

export const ScoutPage: React.FC<ScoutPageProps> = ({
  players,
  isScoutApproved,
  onOpenAudit,
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

  if (!isScoutApproved) {
    return (
      <div className="bwin-card p-10 max-w-xl mx-auto text-center space-y-4 my-10">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Scout Accreditation Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          In strict compliance with Uganda Christian University athletic privacy standards, athlete databases are withheld until a university sports administrator approves your scouting credentials.
        </p>
        <p className="text-xs font-semibold text-blue-600 pt-2">
          Switch to Admin view in the navigation menu to toggle your accreditation status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              Verified Scout Credentials
            </span>
            <span>·</span>
            <span>UCU Talent Exchange</span>
            <span>·</span>
            <span className="text-blue-600">Privacy Firewall Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Talent Discovery Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Only prospects who granted scout visibility are shown. Personal phone numbers and emails are shielded.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Shortlist</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {shortlist.length} Athletes
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bwin-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sport Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSport === 'all' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sports
            </button>
            <button
              onClick={() => setSelectedSport('basketball')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSport === 'basketball' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Basketball
            </button>
            <button
              onClick={() => setSelectedSport('football')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSport === 'football' ? 'bg-[#2954ea] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Football
            </button>
          </div>

          {/* Position Selector */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden"
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
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prospects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-slate-800 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Prospect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleAthletes.length === 0 ? (
          <div className="col-span-full bwin-card p-12 text-center text-slate-400">
            <EyeOff className="w-12 h-12 mx-auto mb-2 stroke-1 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No Athletes Match Current Filters</p>
            <p className="text-xs text-slate-500 mt-1">
              Note: Athletes who have not authorized scout visibility in their portal are withheld.
            </p>
          </div>
        ) : (
          visibleAthletes.map((athlete) => {
            const isShortlisted = shortlist.includes(athlete.id);
            return (
              <div
                key={athlete.id}
                className="bwin-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <span className="font-mono font-bold text-blue-600">#{athlete.shirtNumber}</span>
                        <span>·</span>
                        <span className="capitalize">{athlete.sportId}</span>
                        <span>·</span>
                        <span>Year {athlete.yearOfStudy}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                        {athlete.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">{athlete.position}</p>
                    </div>

                    <button
                      onClick={() => toggleShortlist(athlete.id)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      className={`p-2 rounded-xl border transition-colors ${
                        isShortlisted
                          ? 'bg-amber-50 text-amber-500 border-amber-200'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-600 border-slate-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
                    {athlete.bio || `${athlete.position} playing for Uganda Christian University varsity athletics.`}
                  </p>

                  {/* Physical Dimensions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Height</span>
                      <span className="text-slate-800 font-bold">{athlete.heightCm ? `${athlete.heightCm} cm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Weight</span>
                      <span className="text-slate-800 font-bold">{athlete.weightKg ? `${athlete.weightKg} kg` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Performance Averages */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Season Metrics
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                      {Object.entries(athlete.seasonStats).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                          <span className="uppercase text-slate-400 text-[10px] mr-1">{key}:</span>
                          <strong className="text-slate-900">{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>PII Protected</span>
                  </div>

                  <button
                    onClick={() => setActiveRequestPlayer(athlete)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Inquire via Admin</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Contact Request Modal */}
      {activeRequestPlayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bwin-card max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Official Recruitment Inquiry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Athlete: <strong className="text-slate-900">{activeRequestPlayer.name} (#{activeRequestPlayer.shirtNumber})</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveRequestPlayer(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50 p-3.5 rounded-2xl border border-blue-100 space-y-1">
              <strong className="text-blue-900 block font-bold">Safeguarding Governance:</strong>
              <p>
                Uganda Christian University directs all scout contact requests through the Sports Director. Student contact details remain private until academic and athletic clearances are verified.
              </p>
            </div>

            {submittedStatus ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold">
                ✓ {submittedStatus}
              </div>
            ) : (
              <form onSubmit={handleSendContactRequest} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">
                    Inquiry Details & Proposed Opportunity:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="State your organization, trial/scholarship opportunity, and requested film review..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveRequestPlayer(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white transition-all shadow-xs flex items-center gap-1.5"
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
