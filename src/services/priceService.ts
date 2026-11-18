import type { CommodityPrice, AdminUser, BackendType } from '../types';
import { INITIAL_PRICES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabase';
import { formatTamilDate, getTamilDayOfWeek } from '../utils/tamilDate';

const LOCAL_STORAGE_KEY = 'coco_commodity_prices_v1';
const LOCAL_ADMIN_KEY = 'coco_admin_user_v1';

export function getActiveBackend(): BackendType {
  return isSupabaseConfigured ? 'supabase' : 'local';
}

// ---------------- ROW MAPPERS (PostgreSQL snake_case <-> Frontend camelCase) ----------------

interface DbPriceRow {
  id?: string;
  date: string;
  copra_price?: number;
  copraPrice?: number;
  shell_price?: number;
  shellPrice?: number;
  market_location?: string;
  marketLocation?: string;
  notes?: string;
  formatted_date_ta?: string;
  formattedDateTa?: string;
  day_of_week_ta?: string;
  dayOfWeekTa?: string;
  updated_at?: string;
  updatedAt?: string;
  updated_by?: string;
  updatedBy?: string;
}

function rowToCommodityPrice(row: DbPriceRow): CommodityPrice {
  const date = row.date;
  const copraPrice = Number(row.copra_price ?? row.copraPrice ?? 0);
  const shellPrice = Number(row.shell_price ?? row.shellPrice ?? 0);
  const formattedDateTa = row.formatted_date_ta || row.formattedDateTa || formatTamilDate(date);
  const dayOfWeekTa = row.day_of_week_ta || row.dayOfWeekTa || getTamilDayOfWeek(date);
  const marketLocation = row.market_location || row.marketLocation || 'காங்கேயம் & பொள்ளாச்சி சந்தை';
  const notes = row.notes || '';
  const updatedAt = row.updated_at || row.updatedAt || new Date().toISOString();
  const updatedBy = row.updated_by || row.updatedBy || 'நிர்வாகி (Admin)';

  return {
    id: row.id || date,
    date,
    copraPrice,
    shellPrice,
    formattedDateTa,
    dayOfWeekTa,
    marketLocation,
    notes,
    updatedAt,
    updatedBy,
  };
}

function commodityPriceToDbRow(item: CommodityPrice): Record<string, unknown> {
  return {
    id: item.id || item.date,
    date: item.date,
    copra_price: item.copraPrice,
    shell_price: item.shellPrice,
    market_location: item.marketLocation,
    notes: item.notes,
    formatted_date_ta: item.formattedDateTa,
    day_of_week_ta: item.dayOfWeekTa,
    updated_at: item.updatedAt,
    updated_by: item.updatedBy,
  };
}

// ---------------- LOCAL STORAGE REPOSITORY (Fallback & Demo Mode) ----------------

function getLocalPrices(): CommodityPrice[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRICES));
      return INITIAL_PRICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRICES;
  } catch (err) {
    console.error('Error reading localStorage prices:', err);
    return INITIAL_PRICES;
  }
}

function saveLocalPrices(prices: CommodityPrice[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prices));
    window.dispatchEvent(new CustomEvent('coco-prices-changed', { detail: prices }));
  } catch (err) {
    console.error('Error saving localStorage prices:', err);
  }
}

// ---------------- PUBLIC PRICE API (SUPABASE ONLY) ----------------

/**
 * Fetch all commodity prices sorted descending by date
 */
export async function fetchPrices(): Promise<CommodityPrice[]> {
  const backend = getActiveBackend();

  if (backend === 'supabase' && supabase) {
    try {
      const { data, error } = await supabase
        .from('commodity_prices')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        return (data as DbPriceRow[]).map(rowToCommodityPrice);
      }

      // If Supabase table is empty, seed it with INITIAL_PRICES
      if (!error && data && data.length === 0) {
        try {
          const rowsToInsert = INITIAL_PRICES.map(commodityPriceToDbRow);
          await supabase.from('commodity_prices').insert(rowsToInsert);
          return INITIAL_PRICES;
        } catch {
          // If insert fails due to RLS, return initial seed
          return INITIAL_PRICES;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  // Fallback to local
  const local = getLocalPrices();
  return [...local].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Real-time subscription to prices using Supabase Realtime Channels
 */
export function subscribePrices(callback: (prices: CommodityPrice[]) => void): () => void {
  const backend = getActiveBackend();

  if (backend === 'supabase' && supabase) {
    // Initial fetch
    fetchPrices().then(callback);

    // Setup Supabase Realtime Subscription
    const channel = supabase
      .channel('public:commodity_prices')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commodity_prices' },
        async () => {
          const fresh = await fetchPrices();
          callback(fresh);
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }

  // Local storage listener
  const handler = () => {
    callback(getLocalPrices().sort((a, b) => b.date.localeCompare(a.date)));
  };
  window.addEventListener('coco-prices-changed', handler);
  window.addEventListener('storage', handler);

  // Initial call
  callback(getLocalPrices().sort((a, b) => b.date.localeCompare(a.date)));

  return () => {
    window.removeEventListener('coco-prices-changed', handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * Save or update commodity price:
 * - If record for that calendar date exists: updates it.
 * - If not: creates a new row.
 * - Always keeps chronological descending order.
 */
export async function saveOrUpdatePrice(
  input: {
    date: string; // YYYY-MM-DD
    copraPrice: number;
    shellPrice: number;
    marketLocation?: string;
    notes?: string;
  },
  adminUser: AdminUser
): Promise<CommodityPrice> {
  const backend = getActiveBackend();
  const nowIso = new Date().toISOString();

  const formattedDateTa = formatTamilDate(input.date);
  const dayOfWeekTa = getTamilDayOfWeek(input.date);

  const priceRecord: CommodityPrice = {
    id: input.date,
    date: input.date,
    formattedDateTa,
    dayOfWeekTa,
    copraPrice: Number(input.copraPrice),
    shellPrice: Number(input.shellPrice),
    marketLocation: input.marketLocation || 'காங்கேயம் & பொள்ளாச்சி சந்தை',
    notes: input.notes || '',
    updatedAt: nowIso,
    updatedBy: adminUser.email || 'நிர்வாகி (Admin)',
  };

  // 1. Supabase Postgres Upsert
  if (backend === 'supabase' && supabase) {
    const row = commodityPriceToDbRow(priceRecord);
    const { error } = await supabase
      .from('commodity_prices')
      .upsert(row, { onConflict: 'date' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(`Supabase சேமிப்பு பிழை: ${error.message}`);
    }
    return priceRecord;
  }

  // 2. Local Storage Rollover logic
  const currentPrices = getLocalPrices();
  const existingIndex = currentPrices.findIndex((p) => p.date === input.date);

  let updatedList: CommodityPrice[];
  if (existingIndex >= 0) {
    // Update existing calendar day's record
    updatedList = [...currentPrices];
    updatedList[existingIndex] = {
      ...updatedList[existingIndex],
      ...priceRecord,
    };
  } else {
    // New calendar day entry
    updatedList = [priceRecord, ...currentPrices];
  }

  // Sort strictly descending by date
  updatedList.sort((a, b) => b.date.localeCompare(a.date));
  saveLocalPrices(updatedList);

  return priceRecord;
}

/**
 * Delete a price record (Admin only)
 */
export async function deletePriceRecord(id: string): Promise<void> {
  const backend = getActiveBackend();

  if (backend === 'supabase' && supabase) {
    const { error } = await supabase
      .from('commodity_prices')
      .delete()
      .or(`id.eq.${id},date.eq.${id}`);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Supabase நீக்குதல் பிழை: ${error.message}`);
    }
    return;
  }

  const currentPrices = getLocalPrices();
  const filtered = currentPrices.filter((p) => p.id !== id && p.date !== id);
  saveLocalPrices(filtered);
}

// ---------------- ADMIN AUTHENTICATION (SUPABASE) ----------------

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const backend = getActiveBackend();

  // 1. Supabase Auth
  if (backend === 'supabase' && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('பயனர் தகவல் கிடைக்கவில்லை');

    return {
      email: data.user.email || email,
      uid: data.user.id,
      role: 'admin',
    };
  }

  // 2. Local Admin Mode (For preview/testing without external setup)
  if (password.length >= 6) {
    const adminUser: AdminUser = {
      email: email.trim().toLowerCase(),
      uid: 'admin-local-1',
      role: 'admin',
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminUser));
    return adminUser;
  } else {
    throw new Error('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும் (Password must be at least 6 characters)');
  }
}

export async function logoutAdmin(): Promise<void> {
  const backend = getActiveBackend();

  if (backend === 'supabase' && supabase) {
    await supabase.auth.signOut();
  }

  localStorage.removeItem(LOCAL_ADMIN_KEY);
}

export function getInitialAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function subscribeAuth(callback: (admin: AdminUser | null) => void): () => void {
  const backend = getActiveBackend();

  if (backend === 'supabase' && supabase) {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        callback({
          email: session.user.email || 'admin@supabase',
          uid: session.user.id,
          role: 'admin',
        });
      } else {
        callback(null);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          email: session.user.email || 'admin@supabase',
          uid: session.user.id,
          role: 'admin',
        });
      } else {
        callback(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }

  // Local storage session check
  const current = getInitialAdminSession();
  callback(current);
  return () => {};
}

/**
 * Reset local prices to initial seed data
 */
export function resetToSeedData() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRICES));
  window.dispatchEvent(new CustomEvent('coco-prices-changed', { detail: INITIAL_PRICES }));
}
