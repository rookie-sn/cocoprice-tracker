-- Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Agricultural Commodity Price Tracker (Copra & Coconut Shell)

-- 1. Create commodity_prices table
CREATE TABLE IF NOT EXISTS commodity_prices (
  id TEXT PRIMARY KEY, -- Date string YYYY-MM-DD
  date DATE NOT NULL UNIQUE,
  formatted_date_ta TEXT,
  day_of_week_ta TEXT,
  copra_price NUMERIC(10, 2) NOT NULL, -- தேங்காய் பருப்பு / கொப்பரை (₹/kg)
  shell_price NUMERIC(10, 2) NOT NULL, -- தேங்காய் சிரட்டை / ஓடு (₹/kg)
  market_location TEXT DEFAULT 'காங்கேயம் & பொள்ளாச்சி சந்தை',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- 2. Index for descending date queries
CREATE INDEX IF NOT EXISTS idx_commodity_prices_date_desc ON commodity_prices (date DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE commodity_prices ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Public Read Access (Anyone can view commodity rates)
CREATE POLICY "Public Read Access"
ON commodity_prices
FOR SELECT
TO public
USING (true);

-- 5. Policy: Admin Write/Insert/Update/Delete Access (authenticated users only)
CREATE POLICY "Admin All Access"
ON commodity_prices
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE commodity_prices;
