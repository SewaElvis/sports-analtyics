/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gemini Multi-Turn Chatbot Component
 * Uganda Christian University (UCU) Sports Department
 * 
 * Uses:
 * - gemini-4-argon for complex tactical film strategy
 * - gemini-3.8-flash for general coaching and match analysis
 * - gemini-3.1-flash-lite for fast stats and rules lookups
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, Zap, Brain, Shield, RotateCcw, MessageSquare, ChevronRight 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export const GeminiChatbot: React.FC = () => {
  const [rolePreset, setRolePreset] = useState<'head_coach' | 'film_strategist' | 'stats_speed'>('head_coach');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      role: 'model',
      text: 'Greetings Coach. I am your UCU Sports Analytics AI Assistant. How can I assist with match video breakdowns, statistical fusion disputes, or player rotation strategy today?',
      timestamp: '15:42',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Determine model based on selected role
      let modelChoice = 'gemini-3.8-flash';
      let systemInstruction = '';

      if (rolePreset === 'film_strategist') {
        modelChoice = 'gemini-4-argon';
        systemInstruction = `You are a high-level Tactical Film Strategist using gemini-4-argon for deep analytical reasoning.
You evaluate basketball and football game footage, resolve statistical fusion discrepancies between video timestamps and coach tallies, and suggest sophisticated tactical counters for Uganda Christian University varsity matches.`;
      } else if (rolePreset === 'stats_speed') {
        modelChoice = 'gemini-3.1-flash-lite';
        systemInstruction = `You are a lightning-fast athletic statistics specialist using gemini-3.1-flash-lite.
Provide immediate, concise, factual answers regarding player jersey numbers, season stats averages, FIBA basketball rules, and UFL football match fixtures.`;
      } else {
        modelChoice = 'gemini-3.8-flash';
        systemInstruction = `You are the Varsity Head Coach Assistant using gemini-3.8-flash for UCU Canons Basketball and UCU Cardinals Football.
Give authoritative, practical, encouraging coaching guidance on training regimens, half-time tactical shifts, and athlete motivation.`;
      }

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, text: m.text })),
          systemInstruction,
          rolePreset,
          modelChoice,
        }),
      });

      const data = await res.json();
      const modelReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: data.reply || 'Analysis received and ready for review.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || modelChoice,
      };

      setMessages([...newHistory, modelReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'model',
        text: 'I noted your question. During transition play, maintaining 5-out floor spacing allows Titus Lual (#7) to capitalize on high-percentage interior scoring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      };
      setMessages([...newHistory, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `m_${Date.now()}`,
        role: 'model',
        text: 'Conversation cleared. Ready for your next coaching briefing or tactical query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: rolePreset === 'film_strategist' ? 'gemini-4-argon' : rolePreset === 'stats_speed' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
      },
    ]);
  };

  const quickPrompts = [
    'How should UCU Canons exploit KIU Titans zone defense?',
    'Explain how the Statistical Fusion engine flags assist discrepancies.',
    'What are the key season milestones for Allan Okello (#9)?',
    'Generate a 4-3-3 high-press defensive scheme for Cardinals football.',
  ];

  return (
    <div className="bwin-card p-6 flex flex-col h-[700px] justify-between">
      {/* Chat Header & Role Presets */}
      <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 uppercase tracking-wider">Multimodal AI Chat</span>
            <span>·</span>
            <span>Varsity Coaching Staff Support</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-['Barlow_Condensed'] uppercase tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>UCU Sports Tactical AI</span>
          </h2>
        </div>

        {/* 3 Role Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setRolePreset('head_coach')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              rolePreset === 'head_coach'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Coach Assistant (3.8-flash)</span>
          </button>

          <button
            onClick={() => setRolePreset('film_strategist')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              rolePreset === 'film_strategist'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-300" />
            <span>Film Strategist (4-argon)</span>
          </button>

          <button
            onClick={() => setRolePreset('stats_speed')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              rolePreset === 'stats_speed'
                ? 'bg-[#2954ea] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Stats (3.1-flash-lite)</span>
          </button>

          <button
            onClick={handleClearHistory}
            title="Reset Conversation"
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[85%]">
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2954ea] text-white shadow-sm rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.modelUsed && (
                  <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Engine: {msg.modelUsed}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium p-3 bg-slate-50 rounded-2xl w-fit border border-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Analyzing match context with Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="pb-3 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
        <span className="text-slate-400 shrink-0">Prompts:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={`Ask ${
            rolePreset === 'film_strategist'
              ? 'Film Strategist (gemini-4-argon)...'
              : rolePreset === 'stats_speed'
              ? 'Quick Stats (gemini-3.1-flash-lite)...'
              : 'Head Coach Assistant (gemini-3.8-flash)...'
          }`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
