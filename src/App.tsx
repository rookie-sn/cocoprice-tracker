import { useState, useEffect, useCallback } from 'react';
import type { CommodityPrice, AdminUser, BackendType } from './types';
import {
  subscribePrices,
  deletePriceRecord,
  subscribeAuth,
  logoutAdmin,
  getActiveBackend,
  fetchPrices
} from './services/priceService';
import { formatTamilDate } from './utils/tamilDate';
import { Header } from './components/Header';
import { CurrentPriceCard } from './components/CurrentPriceCard';
import { HistoricalTable } from './components/HistoricalTable';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PriceUpdateModal } from './components/PriceUpdateModal';
import { BackendStatusModal } from './components/BackendStatusModal';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export function App() {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [backendType, setBackendType] = useState<BackendType>('local');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPriceEditModalOpen, setIsPriceEditModalOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [priceToEdit, setPriceToEdit] = useState<CommodityPrice | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize data subscriptions and auth
  useEffect(() => {
    setBackendType(getActiveBackend());

    // 1. Subscribe to auth changes
    const unsubAuth = subscribeAuth((user) => {
      setAdminUser(user);
    });

    // 2. Subscribe to prices changes
    const unsubPrices = subscribePrices((updatedPrices) => {
      // Ensure strictly sorted descending by date
      const sorted = [...updatedPrices].sort((a, b) => b.date.localeCompare(a.date));
      setPrices(sorted);
      setIsLoading(false);
    });

    return () => {
      unsubAuth();
      unsubPrices();
    };
  }, []);

  // Handlers
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setAdminUser(null);
      showToast('வெற்றிகரமாக வெளியேறியது (Logged out)');
    } catch {
      showToast('வெளியேறுவதில் பிழை ஏற்பட்டது', 'error');
    }
  };

  const handleOpenEditToday = () => {
    // Today's entry or template
    const latest = prices.length > 0 ? prices[0] : null;
    setPriceToEdit(latest);
    setIsPriceEditModalOpen(true);
  };

  const handleEditSpecificPrice = (price: CommodityPrice) => {
    setPriceToEdit(price);
    setIsPriceEditModalOpen(true);
  };

  const handleDeletePrice = async (id: string, date: string) => {
    if (!confirm(`${formatTamilDate(date)} நாளுக்கான விலை பதிவை நீக்க விரும்புகிறீர்களா?`)) {
      return;
    }
    try {
      await deletePriceRecord(id);
      showToast('விலை பதிவு வெற்றிகரமாக நீக்கப்பட்டது');
    } catch {
      showToast('பதிவை நீக்க முடியவில்லை', 'error');
    }
  };

  const handlePriceSaveSuccess = (saved: CommodityPrice) => {
    showToast(`${saved.formattedDateTa || formatTamilDate(saved.date)} விலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது!`);
  };

  const reloadData = async () => {
    const list = await fetchPrices();
    setPrices(list);
    showToast('தரவு மீட்டமைக்கப்பட்டது');
  };

  // Derive current and yesterday prices
  const currentPrice = prices.length > 0 ? prices[0] : null;
  const yesterdayPrice = prices.length > 1 ? prices[1] : null;

  const todayTamilDate = currentPrice?.formattedDateTa || formatTamilDate(new Date());

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-slate-800 font-tamil selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-slate-900 text-white text-xs sm:text-sm font-tamil border border-slate-700">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        adminUser={adminUser}
        backendType={backendType}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenPriceEdit={handleOpenEditToday}
        onOpenBackendInfo={() => setIsBackendModalOpen(true)}
        todayTamilDate={todayTamilDate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Market Announcement / Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-4 sm:p-5 text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-tamil tracking-wide">
                தமிழ்நாடு தென்னை & கொப்பரை சந்தை விலை நிலவரம்
              </h2>
              <p className="text-xs text-emerald-100 font-tamil mt-0.5">
                விவசாயிகள் மற்றும் வியாபாரிகளுக்கான தினசரி நேரடி மண்டி விலை வழிகாட்டி
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] bg-white/15 px-3 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span>நேரடி புதுப்பிப்பு</span>
            </span>
          </div>
        </div>

        {/* Hero / Centered Card (Daily Current Price) */}
        {isLoading ? (
          <div className="w-full max-w-4xl mx-auto p-12 bg-white rounded-3xl shadow-card border border-slate-200 text-center">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-tamil text-sm">இன்றைய விலை நிலவரம் ஏற்றப்படுகிறது...</p>
          </div>
        ) : (
          <CurrentPriceCard
            currentPrice={currentPrice}
            yesterdayPrice={yesterdayPrice}
            adminUser={adminUser}
            onOpenEditModal={handleOpenEditToday}
          />
        )}

        {/* Historical Price Sheet (Excel/Spreadsheet Table View) */}
        <HistoricalTable
          prices={prices}
          adminUser={adminUser}
          onEditItem={handleEditSpecificPrice}
          onDeleteItem={handleDeletePrice}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 font-tamil">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-800">
              தினசரி தென்னை விலை நிலவரம் (Tamil Coconut Daily Price Portal)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              தரவுகள் காங்கேயம், பொள்ளாச்சி, வெள்ளக்கோவில் மற்றும் ஈரோடு சந்தைகளின் அடிப்படையில் தொகுக்கப்படுகின்றன.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="text-emerald-700 hover:underline font-semibold"
            >
              தரவுத்தளம் & விதிகள்
            </button>
            <span>•</span>
            <span className="text-slate-400">© 2026 தென்னை விலை</span>
          </div>
        </div>
      </footer>

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        backendType={backendType}
        onSuccess={(admin) => {
          setAdminUser(admin);
          showToast(`வணக்கம் ${admin.email}! நீங்கள் நிர்வாகியாக உள்நுழைந்துள்ளீர்கள்.`);
        }}
      />

      {/* Price Update / Rollover Modal */}
      <PriceUpdateModal
        isOpen={isPriceEditModalOpen}
        onClose={() => {
          setIsPriceEditModalOpen(false);
          setPriceToEdit(null);
        }}
        adminUser={adminUser}
        existingPriceToEdit={priceToEdit}
        onSuccess={handlePriceSaveSuccess}
      />

      {/* Backend & Security Rules Info Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        backendType={backendType}
        onResetData={reloadData}
      />
    </div>
  );
}

export default App;
