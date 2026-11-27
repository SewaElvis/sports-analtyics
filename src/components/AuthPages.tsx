/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UCU Sports Authentication Pages - Professional Blue & White Theme
 * Featuring Quick Demo Login Accounts (Short passwords: "123") and Guest Access Mode.
 */

import React, { useState } from 'react';
import { UserRole, SportType } from '../types';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

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
  const [email, setEmail] = useState('coach@ucu.ac.ug');
  const [password, setPassword] = useState('123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('coach');
  const [sport, setSport] = useState<SportType>('basketball');
  const [noticeMessage, setNoticeMessage] = useState('');

  // Quick Demo Accounts with short password "123"
  const demoAccounts = [
    { label: 'Coach Demo', role: 'coach' as UserRole, email: 'coach@ucu.ac.ug', sport: 'basketball' as SportType },
    { label: 'Admin Demo', role: 'admin' as UserRole, email: 'admin@ucu.ac.ug', sport: 'basketball' as SportType },
    { label: 'Player Demo', role: 'player' as UserRole, email: 'player@ucu.ac.ug', sport: 'basketball' as SportType },
    { label: 'Scout Demo', role: 'scout' as UserRole, email: 'scout@ucu.ac.ug', sport: 'basketball' as SportType },
    { label: 'Guest Observer', role: 'guest' as UserRole, email: 'guest@ucu.ac.ug', sport: 'basketball' as SportType },
  ];

  const handleDemoLogin = (demoRole: UserRole, demoSport: SportType, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123');
    setRole(demoRole);
    setSport(demoSport);
    onLoginSuccess(demoRole, demoSport);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setNoticeMessage('Password reset instructions have been dispatched to your institutional email.');
      setTimeout(() => setNoticeMessage(''), 4000);
      return;
    }

    if (mode === 'register') {
      setNoticeMessage('Account registration submitted. New signups require Coach creation and Admin approval.');
      setTimeout(() => {
        onLoginSuccess(role, sport);
      }, 2000);
      return;
    }

    // Login with strict role
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
          <button onClick={() => onLoginSuccess('guest', 'basketball')} className="hover:text-[#2954ea] transition-colors flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Guest Preview</span>
          </button>
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
              {mode === 'register' && 'Request Account Creation'}
              {mode === 'forgot' && 'Password Recovery'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login' && 'Sign in with your strict institutional role credentials'}
              {mode === 'register' && 'Accounts are created by the Coach and approved by Admin'}
              {mode === 'forgot' && 'Enter your institutional email address'}
            </p>
          </div>

          {/* Quick Demo Accounts Bar */}
          {mode === 'login' && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#2954ea] tracking-wider block text-center">
                Quick Demo Accounts (Password: 123)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemoLogin(acc.role, acc.sport, acc.email)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold border border-blue-200 transition-all shadow-xs"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">Password (Demo: 123)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-11 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2954ea] transition-colors"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-600">Strict Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2954ea] font-bold text-[#2954ea]"
                  >
                    <option value="coach">Coach (Overseer)</option>
                    <option value="admin">Admin (Directorate)</option>
                    <option value="player">Player (Portal)</option>
                    <option value="scout">Scout (External)</option>
                    <option value="guest">Guest (Read-Only)</option>
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

            {mode === 'register' && (
              <p className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                Institutional Policy: Accounts are created by the Coach and approved by the Admin directorate.
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
              <span>{mode === 'register' && 'Request Account Creation'}</span>
              <span>{mode === 'forgot' && 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-between">
            {mode === 'login' ? (
              <>
                <button
                  onClick={() => onLoginSuccess('guest', 'basketball')}
                  className="text-slate-600 font-bold hover:text-[#2954ea] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview as Guest</span>
                </button>
                <button
                  onClick={() => setMode('register')}
                  className="text-[#2954ea] font-bold hover:underline"
                >
                  Request Account
                </button>
              </>
            ) : (
              <p className="w-full text-center">
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
