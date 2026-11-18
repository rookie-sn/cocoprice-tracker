import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, AlertCircle, Loader2, ShieldCheck, Info } from 'lucide-react';
import { loginAdmin } from '../services/priceService';
import type { AdminUser, BackendType } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (admin: AdminUser) => void;
  backendType: BackendType;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  backendType,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const admin = await loginAdmin(email, password);
      setIsLoading(false);
      onSuccess(admin);
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'உள்நுழைவு தோல்வியடைந்தது. தகவல்களை சரிபார்க்கவும்.';
      setErrorMsg(message);
    }
  };

  // Quick fill helper for review and testing
  const handleFillDemo = () => {
    setEmail('admin@cocoprice.com');
    setPassword('admin123456');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-modal border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Accent */}
        <div className="h-1.5 w-full bg-emerald-700" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-tamil">
                நிர்வாகி உள்நுழைவு
              </h3>
              <p className="text-xs text-slate-500 font-tamil">
                விலை விபரங்களை திருத்த / புதுப்பிக்க ({backendType === 'supabase' ? 'Supabase Auth' : 'டெமோ முறை'})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs font-tamil">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 font-tamil mb-1.5">
              மின்னஞ்சல் முகவரி (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cocoprice.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-tamil mb-1.5">
              கடவுச்சொல் (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-tamil">சோதனை செய்ய டெமோ விபரம்:</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/60 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
            >
              தானாக நிரப்பு
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm font-tamil shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>சரிபார்க்கப்படுகிறது...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>உள்நுழைக (Sign In)</span>
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="text-[11px] text-center text-slate-400 font-tamil pt-2">
            பாதுகாப்பு: விலை திருத்தங்கள் தரவுத்தளத்தில் உடனடியாகப் பதிவு செய்யப்படும்.
          </div>
        </form>
      </div>
    </div>
  );
};
