import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { CommodityPrice, AdminUser } from '../types';
import { saveOrUpdatePrice } from '../services/priceService';
import { getTodayDateString, formatTamilDate, getTamilDayOfWeek } from '../utils/tamilDate';

interface PriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPrice: CommodityPrice) => void;
  adminUser: AdminUser | null;
  existingPriceToEdit?: CommodityPrice | null;
}

export const PriceUpdateModal: React.FC<PriceUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminUser,
  existingPriceToEdit,
}) => {
  const [date, setDate] = useState(getTodayDateString());
  const [copraPrice, setCopraPrice] = useState<string>('');
  const [shellPrice, setShellPrice] = useState<string>('');
  const [marketLocation, setMarketLocation] = useState<string>('காங்கேயம் & பொள்ளாச்சி சந்தை');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill when modal opens or existing item changes
  useEffect(() => {
    if (existingPriceToEdit) {
      setDate(existingPriceToEdit.date);
      setCopraPrice(String(existingPriceToEdit.copraPrice));
      setShellPrice(String(existingPriceToEdit.shellPrice));
      setMarketLocation(existingPriceToEdit.marketLocation || 'காங்கேயம் & பொள்ளாச்சி சந்தை');
      setNotes(existingPriceToEdit.notes || '');
    } else {
      // Default to today
      const today = getTodayDateString();
      setDate(today);
    }
  }, [existingPriceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminUser) {
      setErrorMsg('நிர்வாகியாக உள்நுழையவும்');
      return;
    }

    const copra = parseFloat(copraPrice);
    const shell = parseFloat(shellPrice);

    if (isNaN(copra) || isNaN(shell)) {
      setErrorMsg('தயவுசெய்து கொப்பரை மற்றும் சிரட்டை விலைகளை சரியாக உள்ளிடவும்');
      return;
    }

    if (copra <= 0 || shell <= 0) {
      setErrorMsg('விலை 0-ஐ விட அதிகமாக இருக்க வேண்டும்');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const saved = await saveOrUpdatePrice(
        {
          date,
          copraPrice: copra,
          shellPrice: shell,
          marketLocation,
          notes,
        },
        adminUser
      );

      setIsLoading(false);
      onSuccess(saved);
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'விலை சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.';
      setErrorMsg(msg);
    }
  };

  const isToday = date === getTodayDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 to-amber-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-tamil">
              விலை திருத்து / புதிய பதிவு (Update Market Price)
            </h3>
            <p className="text-xs text-slate-500 font-tamil mt-0.5">
              {isToday
                ? 'இன்றைய நாளுக்கான கொப்பரை & சிரட்டை விலையை மாற்றவும்'
                : `${formatTamilDate(date)} நாளுக்கான விலையை திருத்தவும்`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs font-tamil">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date Selector Row */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-800 font-tamil flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>தேதி (Date):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-emerald-800 font-tamil font-semibold">
              தேர்ந்தெடுக்கப்பட்ட நாள்: {formatTamilDate(date)} ({getTamilDayOfWeek(date)})
            </div>
          </div>

          {/* Commodity Inputs Grid: Copra & Shell */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. கொப்பரை விலை */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
              <label className="block font-bold text-slate-900 font-tamil mb-1">
                தேங்காய் பருப்பு / கொப்பரை
              </label>
              <span className="text-[11px] text-slate-500 font-tamil block mb-2">வெள்ளைக் கொப்பரை (₹ / கிலோ)</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.05"
                  required
                  placeholder="138.50"
                  value={copraPrice}
                  onChange={(e) => setCopraPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            {/* 2. சிரட்டை விலை */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <label className="block font-bold text-slate-900 font-tamil mb-1">
                தேங்காய் சிரட்டை / ஓடு
              </label>
              <span className="text-[11px] text-slate-500 font-tamil block mb-2">கரி ஆலை விலை (₹ / கிலோ)</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.05"
                  required
                  placeholder="17.20"
                  value={shellPrice}
                  onChange={(e) => setShellPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Market Location */}
          <div>
            <label className="block font-bold text-slate-800 font-tamil mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>சந்தை மையம் (Mandi / Location)</span>
            </label>
            <input
              type="text"
              value={marketLocation}
              onChange={(e) => setMarketLocation(e.target.value)}
              placeholder="எ.கா: காங்கேயம் & பொள்ளாச்சி சந்தை"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-tamil focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Market Commentary / Notes */}
          <div>
            <label className="block font-bold text-slate-800 font-tamil mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>சந்தை நிலவரக் குறிப்பு (Market Notes / Trend)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="எ.கா: வரத்து அதிகரிப்பு காரணமாக கொப்பரை விலை சீராக உள்ளது..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-tamil focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Rollover Rule Explanation Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-tamil flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>தானியங்கி மாற்றம் (Automatic Rollover):</strong> ஒரே நாளுக்கான புதிய திருத்தங்கள் அதே வரிசையில் புதுப்பிக்கப்படும்; வேறு நாளுக்கான பதிவு புதிய வரிசையாகத் தோன்றும்.
            </span>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold font-tamil transition-colors"
            >
              ரத்து செய்
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold font-tamil shadow-md shadow-emerald-700/20 flex items-center gap-2 disabled:opacity-70 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>சேமிக்கப்படுகிறது...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>சேமித்து புதுப்பி</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
