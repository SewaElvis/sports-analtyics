/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UCU Sports Authentication Pages - Professional Blue & White Theme
 * Supporting role-based account creation (Player registration requires coach approval).
 */

import React, { useState } from 'react';
import { UserRole, SportType } from '../types';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onLoginSuccess: (role: UserRole, sport: SportType) => void;
  onNavigateHome: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('coach.nicholas@ucu.ac.ug');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Nicholas Natuhereza');
  const [role, setRole] = useState<UserRole>('coach');
  const [sport, setSport] = useState<SportType>('basketball');
  const [noticeMessage, setNoticeMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setNoticeMessage('Password reset instructions have been dispatched to your institutional email.');
      setTimeout(() => setNoticeMessage(''), 4000);
      return;
    }

    if (mode === 'register' && role === 'player') {
      setNoticeMessage('Player registration submitted! Awaiting approval from the Head Coach.');
      setTimeout(() => {
        onLoginSuccess('player', sport);
      }, 2000);
      return;
    }

    // Successful authentication
    onLoginSuccess(role, sport);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {/* Top Professional Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-9 h-9 rounded-xl bg-[#2954ea] text-white flex items-center justify-center font-black text-xs shadow-md">
            UCU
          </div>
          <span className="font-bold tracking-wider text-sm uppercase font-['Barlow_Condensed'] text-slate-900">
            UCU Sports Directorate
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
          <button onClick={onNavigateHome} className="hover:text-[#2954ea] transition-colors">Home</button>
          <button onClick={() => alert('UCU Sports Department: sports@ucu.ac.ug | Mukono')} className="hover:text-[#2954ea] transition-colors">Support</button>
          <button onClick={() => setMode('login')} className={`hover:text-[#2954ea] transition-colors ${mode === 'login' ? 'text-[#2954ea] border-b-2 border-[#2954ea] pb-0.5' : ''}`}>Sign In</button>
        </nav>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#2954ea] text-white flex items-center justify-center font-black text-lg shadow-md mb-1">
              UCU
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider font-['Barlow_Condensed'] text-slate-900">
              {mode === 'login' && 'Institutional Sign In'}
              {mode === 'register' && 'Create UCU Account'}
              {mode === 'forgot' && 'Password Recovery'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login' && 'Access the UCU sports intelligence and analytics system'}
              {mode === 'register' && 'Register your role credentials (Player accounts require coach approval)'}
              {mode === 'forgot' && 'Enter your registered email address'}
            </p>
          </div>

          {noticeMessage && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#2954ea]" />
              <span>{noticeMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-11 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2954ea] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">Institutional Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ucu.ac.ug"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-11 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2954ea] transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-11 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2954ea] transition-colors"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-600">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2954ea] font-bold text-[#2954ea]"
                  >
                    <option value="coach">Coach (Overseer)</option>
                    <option value="admin">Admin (Directorate)</option>
                    <option value="player">Player (Requires Approval)</option>
                    <option value="scout">Scout (External)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-600">Sport Category</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value as SportType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2954ea]"
                  >
                    <option value="basketball">Basketball</option>
                    <option value="football">Football</option>
                    <option value="netball">Netball</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'register' && role === 'player' && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Note: New player accounts must be verified and approved by the Head Coach prior to dashboard access.
              </p>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2954ea]" />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[#2954ea] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#2954ea] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{mode === 'login' && 'Sign In'}</span>
              <span>{mode === 'register' && 'Submit Registration'}</span>
              <span>{mode === 'forgot' && 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-[#2954ea] font-bold hover:underline"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#2954ea] font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>© 2026 Uganda Christian University Sports Directorate</p>
      </footer>
    </div>
  );
};
