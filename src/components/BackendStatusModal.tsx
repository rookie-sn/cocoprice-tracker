import React from 'react';
import { X, Database, ShieldCheck, RefreshCw, Check, Copy } from 'lucide-react';
import type { BackendType } from '../types';
import { resetToSeedData } from '../services/priceService';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendType: BackendType;
  onResetData: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose,
  backendType,
  onResetData,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const envSnippet = `# Supabase Configuration (.env)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm('மாதிரி தரவுகளை மீண்டும் துவக்க வேண்டுமா? (Reset to seed data?)')) {
      resetToSeedData();
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-emerald-700" />

        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-tamil">
                தரவுத்தள தகவல் & இணைப்பு முறை
              </h3>
              <p className="text-xs text-slate-500 font-tamil">
                Supabase (PostgreSQL + Row Level Security + Auth)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm font-tamil text-slate-700">
          {/* Current State */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">தற்போதைய சேமிப்பகம் (Active Storage):</span>
              <span className="font-bold text-base text-slate-900 capitalize">
                {backendType === 'supabase'
                  ? '⚡ Supabase (PostgreSQL + RLS)'
                  : '💾 உள்ளூர் நினைவகம் (Local Persistence + Seed Data)'}
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                backendType === 'supabase'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {backendType === 'supabase' ? 'நேரலை (Connected)' : 'டெமோ முறை (Local)'}
            </span>
          </div>

          {/* Security Rules Summary */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>பாதுகாப்பு & அனுமதி விதிகள் (PostgreSQL RLS Policies):</span>
            </div>
            <ul className="list-disc list-inside text-xs text-emerald-800 space-y-1 mt-1">
              <li><strong>பார்வை அனுமதி (Read):</strong> பொதுமக்களுக்கு முழுமையாக திறக்கப்பட்டுள்ளது (Public read / anon).</li>
              <li><strong>சேமிப்பு / திருத்தம் (Write/Update):</strong> நிர்வாகி உள்நுழைவு மூலம் மட்டுமே சாத்தியம் (Admin only write / authenticated).</li>
            </ul>
          </div>

          {/* Environment Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700">Supabase இணைக்க (.env கோப்பில் சேர்க்க):</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'நகலெடுக்கப்பட்டது!' : 'நகலெடு'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto custom-scrollbar">
              {envSnippet}
            </pre>
          </div>

          {/* SQL Schema Notice */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono">
            <span>SQL Schema & RLS: திட்டக் கோப்பில் உள்ள <strong>supabase_schema.sql</strong>-ஐ உங்கள் Supabase SQL Editor-ல் இயக்கலாம்.</span>
          </div>

          {/* Reset Seed Data Button */}
          {backendType === 'local' && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">மாதிரி தரவுகளை மீண்டும் மீட்டமைக்க:</span>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>மீட்டமை (Reset Seed)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
