const TAMIL_MONTHS = [
  'ஜனவரி',
  'பிப்ரவரி',
  'மார்ச்',
  'ஏப்ரல்',
  'மே',
  'ஜூன்',
  'ஜூலை',
  'ஆகஸ்ட்',
  'செப்டம்பர்',
  'அக்டோபர்',
  'நவம்பர்',
  'டிசம்பர்'
];

const TAMIL_DAYS = [
  'ஞாயிற்றுக்கிழமை',
  'திங்கட்கிழமை',
  'செவ்வாய்க்கிழமை',
  'புதன்கிழமை',
  'வியாழக்கிழமை',
  'வெள்ளிக்கிழமை',
  'சனிக்கிழமை'
];

/**
 * Returns today's date in YYYY-MM-DD local format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string (YYYY-MM-DD or ISO) into Tamil e.g. "23 அக்டோபர் 2026"
 */
export function formatTamilDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput + (dateInput.length === 10 ? 'T00:00:00' : '')) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const month = TAMIL_MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Returns day of week in Tamil e.g. "வெள்ளிக்கிழமை"
 */
export function getTamilDayOfWeek(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput + (dateInput.length === 10 ? 'T00:00:00' : '')) : dateInput;
  if (isNaN(d.getTime())) return '';
  return TAMIL_DAYS[d.getDay()];
}

/**
 * Formats time in Tamil (e.g. "காலை 09:30" or "பிற்பகல் 03:15")
 */
export function formatTamilTime(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours < 12 ? 'காலை' : hours < 16 ? 'பிற்பகல்' : hours < 20 ? 'மாலை' : 'இரவு';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${period} ${String(displayHours).padStart(2, '0')}:${minutes}`;
}

/**
 * Format currency with Indian Rupee symbol
 */
export function formatRupee(amount: number, decimals: number = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
