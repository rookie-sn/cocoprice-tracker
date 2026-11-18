import React, { useState } from 'react';
import type { CommodityPrice, AdminUser } from '../types';
import { formatRupee, formatTamilTime } from '../utils/tamilDate';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Clock,
  MapPin,
  Share2,
  Check,
  Sparkles,
  Info
} from 'lucide-react';

interface CurrentPriceCardProps {
  currentPrice: CommodityPrice | null;
  yesterdayPrice: CommodityPrice | null;
  adminUser: AdminUser | null;
  onOpenEditModal: () => void;
}

export const CurrentPriceCard: React.FC<CurrentPriceCardProps> = ({
  currentPrice,
  yesterdayPrice,
  adminUser,
  onOpenEditModal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!currentPrice) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-card border border-slate-200 text-center">
        <p className="text-slate-500 font-tamil">விலை விபரங்கள் ஏற்றப்படுகின்றன...</p>
      </div>
    );
  }

  // Calculate trends
  const copraDiff = yesterdayPrice ? currentPrice.copraPrice - yesterdayPrice.copraPrice : 0;
  const shellDiff = yesterdayPrice ? currentPrice.shellPrice - yesterdayPrice.shellPrice : 0;

  const renderTrendBadge = (diff: number, unitLabel: string = '₹') => {
    if (Math.abs(diff) < 0.01) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          <Minus className="w-3 h-3" />
          <span>மாற்றமில்லை</span>
        </span>
      );
    }
    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <TrendingUp className="w-3 h-3" />
          <span>+{unitLabel}{Math.abs(diff).toFixed(2)}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
        <TrendingDown className="w-3 h-3" />
        <span>-{unitLabel}{Math.abs(diff).toFixed(2)}</span>
      </span>
    );
  };

  const handleShare = async () => {
    const text = `🌴 *தினசரி கொப்பரை & சிரட்டை விலை நிலவரம்* (${currentPrice.formattedDateTa})\n` +
      `---------------------------------\n` +
      `🥥 தேங்காய் பருப்பு / கொப்பரை: ${formatRupee(currentPrice.copraPrice)} / கிலோ\n` +
      `🥣 தேங்காய் சிரட்டை / ஓடு: ${formatRupee(currentPrice.shellPrice)} / கிலோ\n` +
      `📍 சந்தை: ${currentPrice.marketLocation || 'தமிழ்நாடு சந்தை'}\n` +
      `🌐 மேலும் விபரங்களுக்கு: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'தினசரி கொப்பரை & சிரட்டை விலை நிலவரம்',
          text,
          url: window.location.href,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Central Hero Card */}
      <div className="relative bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden transition-all hover:shadow-xl hover:border-slate-300">
        {/* Subtle decorative top accent bar */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600" />

        <div className="p-5 sm:p-8">
          {/* Header Row: Date & Market Rate Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              {/* Badge indicating "இன்றைய விலை நிலவரம்" */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  இன்றைய விலை நிலவரம்
                </span>
                {currentPrice.marketLocation && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {currentPrice.marketLocation}
                  </span>
                )}
              </div>

              {/* Large Tamil Date Display */}
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-tamil tracking-tight">
                  {currentPrice.formattedDateTa}
                </h2>
                {currentPrice.dayOfWeekTa && (
                  <span className="text-sm sm:text-base font-semibold text-slate-500 font-tamil">
                    ({currentPrice.dayOfWeekTa})
                  </span>
                )}
              </div>
            </div>

            {/* Timestamps & Action Buttons */}
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-tamil">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>கடைசியாக புதுப்பிக்கப்பட்டது:</span>
                <span className="font-semibold text-slate-700">
                  {formatTamilTime(currentPrice.updatedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  id="share-price-button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-all"
                  title="விலை விபரங்களை பகிரவும்"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">நகலெடுக்கப்பட்டது!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>பகிர்</span>
                    </>
                  )}
                </button>

                {/* Admin Update Button inside Central Card */}
                {adminUser && (
                  <button
                    onClick={onOpenEditModal}
                    id="admin-edit-price-button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-700/20 transition-all transform active:scale-95"
                    title="இன்றைய விலை திருத்து / புதுப்பி"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>விலை திருத்து / புதுப்பி</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Commodity Cards Grid: 2 Clean Balanced Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* 1. தேங்காய் பருப்பு / கொப்பரை (Copra) */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-amber-50/50 via-white to-amber-50/20 border border-amber-200/90 shadow-soft hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-900/80 uppercase tracking-wider bg-amber-100 px-2.5 py-1 rounded-md">
                  பருப்பு / கொப்பரை
                </span>
                {renderTrendBadge(copraDiff)}
              </div>

              <div className="mt-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-tamil leading-snug">
                  தேங்காய் பருப்பு
                </h3>
                <p className="text-xs text-slate-500 font-tamil mt-0.5">வெள்ளைக் கொப்பரை (Copra - Kangeyam Mandi)</p>
              </div>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {formatRupee(currentPrice.copraPrice)}
                </span>
                <span className="text-sm font-bold text-slate-500 font-tamil">/ கிலோ (₹/kg)</span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-amber-100 flex items-center justify-between text-xs text-slate-500">
                <span>நேற்றைய விலை:</span>
                <span className="font-mono font-bold text-slate-700">
                  {yesterdayPrice ? formatRupee(yesterdayPrice.copraPrice) : '—'}
                </span>
              </div>
            </div>

            {/* 2. தேங்காய் சிரட்டை / ஓடு (Coconut Shell) */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-stone-50/70 via-white to-stone-50/30 border border-stone-200/90 shadow-soft hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider bg-stone-200/80 px-2.5 py-1 rounded-md">
                  சிரட்டை / ஓடு
                </span>
                {renderTrendBadge(shellDiff)}
              </div>

              <div className="mt-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-tamil leading-snug">
                  தேங்காய் சிரட்டை
                </h3>
                <p className="text-xs text-slate-500 font-tamil mt-0.5">கரி தயாரிப்பு / ஆலை கொள்முதல் (Shell)</p>
              </div>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {formatRupee(currentPrice.shellPrice)}
                </span>
                <span className="text-sm font-bold text-slate-500 font-tamil">/ கிலோ (₹/kg)</span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
                <span>நேற்றைய விலை:</span>
                <span className="font-mono font-bold text-slate-700">
                  {yesterdayPrice ? formatRupee(yesterdayPrice.shellPrice) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Market Commentary / Notes Section */}
          {currentPrice.notes && (
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 font-tamil">
                <span className="font-bold text-slate-900">சந்தை நிலவரக் குறிப்பு: </span>
                {currentPrice.notes}
              </div>
            </div>
          )}

          {/* Admin Helper Banner when Admin is logged in */}
          {adminUser && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>
                  <strong>நிர்வாகி முறை செயலில் உள்ளது:</strong> இன்றைய விலையில் மாற்றங்கள் செய்ய &apos;விலை திருத்து / புதுப்பி&apos; பொத்தானைப் பயன்படுத்தவும்.
                </span>
              </div>
              <button
                onClick={onOpenEditModal}
                className="font-bold underline text-emerald-800 hover:text-emerald-950 shrink-0 ml-2"
              >
                இப்போதே திருத்து →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
