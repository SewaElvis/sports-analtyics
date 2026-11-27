/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Scout Recruitment & Institutional Messages Page
 * Mediated inquiry inbox connecting accredited talent scouts and UCU Sports Administration.
 */

import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock, ShieldCheck, CheckCircle2, Lock, FileText } from 'lucide-react';
import { ScoutContactRequest } from '../types';

interface MessageThread {
  id: string;
  sender: string;
  senderRole: string;
  avatar: string;
  subject: string;
  athleteRef: string;
  lastMessage: string;
  timeAgo: string;
  status: 'pending' | 'approved' | 'in_review';
  messages: Array<{
    sender: string;
    text: string;
    time: string;
    isStaff: boolean;
  }>;
}

export const MessagesPage: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>('m1');
  const [replyText, setReplyText] = useState('');

  const [threads, setThreads] = useState<MessageThread[]>([
    {
      id: 'm1',
      sender: 'David Ochieng',
      senderRole: 'Accredited Scout · East Africa Basketball Fed (FUBA)',
      avatar: '/src/assets/images/avatar_athlete_titus_1793973784097.jpg',
      subject: 'Recruitment Trial Inquiry: Titus Lual (#7 Center)',
      athleteRef: 'Titus Lual (#7)',
      lastMessage: 'We would like to request high-resolution film footage and formal clearance to attend next Saturday\'s varsity game.',
      timeAgo: '2 hours ago',
      status: 'pending',
      messages: [
        {
          sender: 'David Ochieng (Scout)',
          text: 'Greetings Director Sewa. Following our review of the Canons vs KIU match film, we are highly impressed with Titus Lual (#7)\'s defensive rebounding and shot-blocking instincts.',
          time: '14:32',
          isStaff: false,
        },
        {
          sender: 'David Ochieng (Scout)',
          text: 'We would like to request high-resolution film footage and formal clearance to attend next Saturday\'s varsity game with intent for the national U23 development trials.',
          time: '14:34',
          isStaff: false,
        },
      ],
    },
    {
      id: 'm2',
      sender: 'Coach Moses Basena',
      senderRole: 'Talent Assessor · CECAFA University Committee',
      avatar: '/src/assets/images/avatar_coach_nicholas_1793973783261.jpg',
      subject: 'Scholarship Scout Evaluation: Allan Okello (#9 Striker)',
      athleteRef: 'Allan Okello (#9)',
      lastMessage: 'Directorate has approved academic clearance for preliminary trial discussions.',
      timeAgo: 'Yesterday',
      status: 'approved',
      messages: [
        {
          sender: 'Moses Basena (CECAFA)',
          text: 'Dear UCU Sports Office, Allan Okello\'s goalscoring record (12 goals in UFL) matches the profile for our upcoming East African Inter-University All-Star roster.',
          time: 'Yesterday 10:15',
          isStaff: false,
        },
        {
          sender: 'Dr. Sewa Elvis (Director of Sports)',
          text: 'Thank you Coach Basena. We have reviewed Allan\'s academic standing (Faculty of Education) and verified his consent switches. Directorate has approved academic clearance for preliminary trial discussions.',
          time: 'Yesterday 14:20',
          isStaff: true,
        },
      ],
    },
  ]);

  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMessage: replyText.trim(),
          timeAgo: 'Just now',
          messages: [
            ...t.messages,
            {
              sender: 'Dr. Sewa Elvis (Director of Sports)',
              text: replyText.trim(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isStaff: true,
            },
          ],
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bwin-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Recruitment Gateway</span>
            <span>·</span>
            <span>Mediated Inquiries</span>
            <span>·</span>
            <span className="text-emerald-600">Student Safeguarding</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-['Barlow_Condensed'] uppercase tracking-tight">
            Scout Communications & Inquiries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional communication between regional scouts, UCU sports directorate, and coaching staff.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Direct athlete contact blocked · Admin mediated only</span>
        </div>
      </div>

      {/* 2-Column Split: Threads List & Active Thread View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Left: Threads List */}
        <div className="lg:col-span-5 bwin-card p-4 flex flex-col overflow-hidden">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inquiry Threads</span>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {threads.length} Messages
            </span>
          </div>

          <div className="overflow-y-auto space-y-2 mt-3 flex-1 pr-1">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThreadId(t.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                  t.id === activeThread.id
                    ? 'bg-blue-50/80 border-blue-200 shadow-2xs'
                    : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={t.avatar}
                      alt={t.sender}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h2 className="text-xs font-bold text-slate-900">{t.sender}</h2>
                      <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{t.senderRole}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{t.timeAgo}</span>
                </div>

                <div className="mt-2.5">
                  <span className="text-xs font-bold text-blue-700 block truncate">{t.subject}</span>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{t.lastMessage}</p>
                </div>

                <div className="mt-2 flex items-center justify-between pt-1 text-[10px]">
                  <span className="font-semibold text-slate-500">Athlete: {t.athleteRef}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    t.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Message Thread */}
        <div className="lg:col-span-7 bwin-card p-6 flex flex-col justify-between overflow-hidden">
          {/* Thread Header */}
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeThread.avatar}
                alt={activeThread.sender}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeThread.sender}</h3>
                <p className="text-xs text-slate-500">{activeThread.senderRole}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Athlete</span>
              <span className="font-mono text-xs font-bold text-blue-600">{activeThread.athleteRef}</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1">
            {activeThread.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.isStaff ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.isStaff
                      ? 'bg-[#2954ea] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  <span className="block text-[10px] opacity-75 font-semibold mb-1">{msg.sender}</span>
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Reply Input Bar */}
          <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type official directorate reply or trial instruction..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
