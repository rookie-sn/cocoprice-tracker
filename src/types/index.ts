export interface CommodityPrice {
  id: string; // e.g. "2026-10-23" or Supabase ID
  date: string; // YYYY-MM-DD
  formattedDateTa?: string; // e.g. "23 அக்டோபர் 2026"
  dayOfWeekTa?: string; // e.g. "வெள்ளிக்கிழமை"
  copraPrice: number; // தேங்காய் பருப்பு / கொப்பரை (₹/kg)
  shellPrice: number; // தேங்காய் சிரட்டை / ஓடு (₹/kg)
  marketLocation?: string; // சந்தை இடம் (காங்கேயம், பொள்ளாச்சி, etc.)
  notes?: string; // சந்தை குறிப்பு (எ.கா: விலை உயர்வு, மந்த நிலை)
  updatedAt: string; // ISO string
  updatedBy?: string; // Admin email or name
}

export interface AdminUser {
  email: string;
  uid?: string;
  role: 'admin';
}

export type BackendType = 'supabase' | 'local';

export interface PriceTrend {
  copraDiff: number;
  shellDiff: number;
}
