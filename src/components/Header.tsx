import React from 'react';
import { Lock, LogOut, ShieldCheck, Database, Calendar, Edit3 } from 'lucide-react';
import type { AdminUser, BackendType } from '../types';

interface HeaderProps {
  adminUser: AdminUser | null;
  backendType: BackendType;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenPriceEdit: () => void;
  onOpenBackendInfo: () => void;
  todayTamilDate: string;
}

export const Header: React.FC<HeaderProps> = ({
  adminUser,
  backendType,
  onOpenLogin,
  onLogout,
  onOpenPriceEdit,
  onOpenBackendInfo,
  todayTamilDate,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            {/* Coconut / Tree Leaf stylized SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9z" />
              <path d="M12 2v20" stroke="#fbf8f5" strokeWidth="1.5" />
              <path d="M16 8c-2.5 1-5.5 1-8 0" stroke="#fbf8f5" strokeWidth="1.5" />
              <path d="M17 14c-3 1.5-7 1.5-10 0" stroke="#fbf8f5" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none font-tamil">
                தென்னை விலை நிலவரம்
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                தினசரி நேரலை
              </span>
            </div>
            <p className="text-xs text-slate-500 font-tamil mt-0.5 hidden xs:block">
              காங்கேயம் • பொள்ளாச்சி • வெள்ளக்கோவில் சந்தை விகிதங்கள்
            </p>
          </div>
        </div>

        {/* Right Side: Date & Admin Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Date Display */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{todayTamilDate}</span>
          </div>

          {/* Backend Info Badge */}
          <button
            onClick={onOpenBackendInfo}
            title="தரவுத்தள தகவல் (Database Status)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">
              {backendType === 'supabase' ? 'Supabase' : 'உள்ளூர் (Local)'}
            </span>
            <span className={`w-2 h-2 rounded-full ${backendType === 'local' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
          </button>

          {/* Admin Controls */}
          {adminUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[140px] font-mono">{adminUser.email}</span>
              </div>

              {/* Quick Update Button in Header */}
              <button
                onClick={onOpenPriceEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                title="இன்றைய விலையை திருத்து / புதுப்பி"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">விலை புதுப்பி</span>
                <span className="sm:hidden">திருத்து</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-medium transition-colors"
                title="நிர்வாகியிலிருந்து வெளியேறு"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">வெளியேறு</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              id="admin-login-button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              title="நிர்வாகி உள்நுழைவு (Admin Login)"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>நிர்வாகி</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
