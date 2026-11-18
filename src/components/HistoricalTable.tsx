import React, { useState, useMemo } from 'react';
import type { CommodityPrice, AdminUser } from '../types';
import { formatRupee, formatTamilDate } from '../utils/tamilDate';
import {
  Download,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ArrowUpDown,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface HistoricalTableProps {
  prices: CommodityPrice[];
  adminUser: AdminUser | null;
  onEditItem: (price: CommodityPrice) => void;
  onDeleteItem: (id: string, date: string) => void;
}

export const HistoricalTable: React.FC<HistoricalTableProps> = ({
  prices,
  adminUser,
  onEditItem,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [daysFilter, setDaysFilter] = useState<'all' | '7' | '30'>('all');

  // Strictly ensure descending order by date (Chronological rule: latest topmost)
  const sortedPrices = useMemo(() => {
    const list = [...prices].sort((a, b) => b.date.localeCompare(a.date));

    // Filter by days
    const filteredByDays = daysFilter === 'all'
      ? list
      : list.slice(0, Number(daysFilter));

    // Filter by search query
    if (!searchTerm.trim()) return filteredByDays;

    const term = searchTerm.toLowerCase();
    return filteredByDays.filter((p) => {
      const formattedDate = (p.formattedDateTa || formatTamilDate(p.date)).toLowerCase();
      const rawDate = p.date.toLowerCase();
      const notes = (p.notes || '').toLowerCase();
      const loc = (p.marketLocation || '').toLowerCase();
      return (
        formattedDate.includes(term) ||
        rawDate.includes(term) ||
        notes.includes(term) ||
        loc.includes(term)
      );
    });
  }, [prices, daysFilter, searchTerm]);

  // Statistics calculation for summary bar
  const stats = useMemo(() => {
    if (prices.length === 0) return { avgCopra: 0, maxCopra: 0, minCopra: 0, avgShell: 0 };
    const copraValues = prices.map((p) => p.copraPrice);
    const shellValues = prices.map((p) => p.shellPrice);
    const sumCopra = copraValues.reduce((a, b) => a + b, 0);
    const sumShell = shellValues.reduce((a, b) => a + b, 0);
    return {
      avgCopra: sumCopra / copraValues.length,
      maxCopra: Math.max(...copraValues),
      minCopra: Math.min(...copraValues),
      avgShell: sumShell / shellValues.length,
    };
  }, [prices]);

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    if (sortedPrices.length === 0) return;

    const headers = [
      'வரிசை எண் (Sl No)',
      'தேதி (Date)',
      'தமிழ் தேதி (Tamil Date)',
      'கிழமை (Day)',
      'கொப்பரை விலை (Copra Rs/kg)',
      'சிரட்டை விலை (Shell Rs/kg)',
      'சந்தை இடம் (Location)',
      'குறிப்புகள் (Notes)'
    ];

    const rows = sortedPrices.map((p, idx) => [
      idx + 1,
      p.date,
      `"${p.formattedDateTa || formatTamilDate(p.date)}"`,
      `"${p.dayOfWeekTa || ''}"`,
      p.copraPrice.toFixed(2),
      p.shellPrice.toFixed(2),
      `"${p.marketLocation || ''}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    // UTF-8 BOM so Excel opens Tamil characters correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thendhai_copra_vilai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      {/* Section Header & Spreadsheet Bar */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        {/* Spreadsheet Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-tamil tracking-tight">
                  முந்தைய விலை விவரங்கள்
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {prices.length} பதிவுகள்
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-tamil mt-1">
                கடந்த நாட்களின் கொப்பரை மற்றும் சிரட்டை சந்தை பதிவேடு (Excel/Spreadsheet View)
              </p>
            </div>

            {/* Quick Action Tools: Search, Filter, Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative flex-1 sm:flex-initial min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="தேதி அல்லது குறிப்பு தேடு..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* Days Filter */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
                <button
                  onClick={() => setDaysFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    daysFilter === 'all' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  அனைத்தும்
                </button>
                <button
                  onClick={() => setDaysFilter('7')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    daysFilter === '7' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 நாட்கள்
                </button>
                <button
                  onClick={() => setDaysFilter('30')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    daysFilter === '30' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30 நாட்கள்
                </button>
              </div>

              {/* Excel / CSV Export Button */}
              <button
                onClick={handleExportCSV}
                title="எக்செல் வடிவத்தில் பதிவிறக்கு (Download CSV)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV பதிவிறக்கம்</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                title="அச்சிடு / PDF"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-slate-500">சராசரி கொப்பரை:</span>
              <span className="font-mono font-bold text-slate-900">{formatRupee(stats.avgCopra)} /கிலோ</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-slate-500">அதிகபட்ச கொப்பரை:</span>
              <span className="font-mono font-bold text-emerald-700">{formatRupee(stats.maxCopra)} /கிலோ</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-slate-500">சராசரி சிரட்டை:</span>
              <span className="font-mono font-bold text-slate-700">{formatRupee(stats.avgShell)} /கிலோ</span>
            </div>
          </div>
        </div>

        {/* Spreadsheet Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            {/* Table Header with Excel style styling */}
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-300 font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 w-12 text-center text-slate-400 font-mono">
                  #
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 whitespace-nowrap min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>தேதி (Date)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 text-right whitespace-nowrap min-w-[150px] bg-amber-50/50 text-amber-900">
                  தேங்காய் பருப்பு / கொப்பரை (₹/kg)
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 text-right whitespace-nowrap min-w-[140px] bg-stone-50/50 text-stone-900">
                  சிரட்டை / ஓடு (₹/kg)
                </th>
                <th className="py-3 px-3 sm:px-4 border-r border-slate-200 min-w-[220px]">
                  சந்தை மையம் & குறிப்பு
                </th>
                {adminUser && (
                  <th className="py-3 px-3 sm:px-4 text-center whitespace-nowrap w-24 bg-slate-100">
                    நிர்வாகம்
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 font-tamil">
              {sortedPrices.length === 0 ? (
                <tr>
                  <td
                    colSpan={adminUser ? 6 : 5}
                    className="py-12 text-center text-slate-400 font-tamil"
                  >
                    பதிவுகள் எதுவும் கிடைக்கவில்லை (No price records found)
                  </td>
                </tr>
              ) : (
                sortedPrices.map((item, index) => {
                  const isTopRow = index === 0;

                  return (
                    <tr
                      key={item.id || item.date}
                      className={`transition-colors hover:bg-emerald-50/40 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-3 px-3 sm:px-4 text-center border-r border-slate-200/80 font-mono text-slate-400 text-xs">
                        {index + 1}
                      </td>

                      {/* Date Column */}
                      <td className="py-3 px-3 sm:px-4 border-r border-slate-200/80 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-tamil">
                            {item.formattedDateTa || formatTamilDate(item.date)}
                          </span>
                          {isTopRow && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              இன்று
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <span>{item.date}</span>
                          {item.dayOfWeekTa && <span>• {item.dayOfWeekTa}</span>}
                        </div>
                      </td>

                      {/* Copra Price (₹/kg) */}
                      <td className="py-3 px-3 sm:px-4 border-r border-slate-200/80 text-right whitespace-nowrap font-mono font-bold text-slate-900 bg-amber-50/30">
                        <span className="text-sm">
                          {formatRupee(item.copraPrice)}
                        </span>
                      </td>

                      {/* Shell Price (₹/kg) */}
                      <td className="py-3 px-3 sm:px-4 border-r border-slate-200/80 text-right whitespace-nowrap font-mono font-semibold text-slate-800 bg-stone-50/30">
                        <span className="text-sm">
                          {formatRupee(item.shellPrice)}
                        </span>
                      </td>

                      {/* Location & Notes */}
                      <td className="py-3 px-3 sm:px-4 border-r border-slate-200/80 text-slate-600 text-xs">
                        <div className="font-medium text-slate-800 truncate max-w-sm">
                          {item.marketLocation || 'பொது சந்தை'}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-500 italic truncate max-w-sm">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Admin Actions (if authenticated) */}
                      {adminUser && (
                        <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="இந்த நாளின் விலையை திருத்து"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id, item.date)}
                              className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                              title="பதிவை நீக்கு"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>விலைகள் அனைத்தும் தமிழ்நாடு நேரப்படி (IST) கிலோ கணக்கில் (₹/kg) பதிவு செய்யப்படுகின்றன.</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            வரிசைப்படுத்தல்: தேதி இறங்குமுகம் (Date DESC) • மேல்வரிசை: இன்றைய விலை
          </div>
        </div>
      </div>
    </div>
  );
};
