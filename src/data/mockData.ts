import type { CommodityPrice } from '../types';
import { formatTamilDate, getTamilDayOfWeek } from '../utils/tamilDate';

export const INITIAL_PRICES: CommodityPrice[] = [
  {
    id: '2026-10-23',
    date: '2026-10-23',
    formattedDateTa: formatTamilDate('2026-10-23'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-23'),
    copraPrice: 138.50,
    shellPrice: 17.20,
    marketLocation: 'காங்கேயம் & பொள்ளாச்சி சந்தை',
    notes: 'தீபாவளிக்கு பிந்தைய வரத்து அதிகரிப்பால் சீரான விலை',
    updatedAt: '2026-10-23T09:30:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-22',
    date: '2026-10-22',
    formattedDateTa: formatTamilDate('2026-10-22'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-22'),
    copraPrice: 136.00,
    shellPrice: 17.00,
    marketLocation: 'வெள்ளக்கோவில் சந்தை',
    notes: 'கொப்பரை தேவை சீராக உள்ளது',
    updatedAt: '2026-10-22T10:15:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-21',
    date: '2026-10-21',
    formattedDateTa: formatTamilDate('2026-10-21'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-21'),
    copraPrice: 135.00,
    shellPrice: 16.80,
    marketLocation: 'பொள்ளாச்சி சந்தை',
    notes: 'எண்ணெய் ஆலைகளின் நேரடி கொள்முதல்',
    updatedAt: '2026-10-21T09:45:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-20',
    date: '2026-10-20',
    formattedDateTa: formatTamilDate('2026-10-20'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-20'),
    copraPrice: 134.50,
    shellPrice: 16.50,
    marketLocation: 'உடுமலைப்பேட்டை',
    notes: 'சந்தை வழக்கம் போல் இயங்கியது',
    updatedAt: '2026-10-20T10:00:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-19',
    date: '2026-10-19',
    formattedDateTa: formatTamilDate('2026-10-19'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-19'),
    copraPrice: 133.00,
    shellPrice: 16.20,
    marketLocation: 'காங்கேயம் சந்தை',
    notes: 'கொப்பரை வரத்து சற்று குறைவு',
    updatedAt: '2026-10-19T09:15:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-18',
    date: '2026-10-18',
    formattedDateTa: formatTamilDate('2026-10-18'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-18'),
    copraPrice: 132.50,
    shellPrice: 16.00,
    marketLocation: 'பொள்ளாச்சி சந்தை',
    notes: 'ஞாயிறு சிறப்பு ஏலம்',
    updatedAt: '2026-10-18T11:00:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-17',
    date: '2026-10-17',
    formattedDateTa: formatTamilDate('2026-10-17'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-17'),
    copraPrice: 131.00,
    shellPrice: 15.80,
    marketLocation: 'தாராபுரம் சந்தை',
    notes: 'சிரட்டை விலை சீராக உள்ளது',
    updatedAt: '2026-10-17T09:30:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-16',
    date: '2026-10-16',
    formattedDateTa: formatTamilDate('2026-10-16'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-16'),
    copraPrice: 130.00,
    shellPrice: 15.50,
    marketLocation: 'காங்கேயம் சந்தை',
    notes: 'பண்டிகை கால தேவை துவக்கம்',
    updatedAt: '2026-10-16T10:00:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-15',
    date: '2026-10-15',
    formattedDateTa: formatTamilDate('2026-10-15'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-15'),
    copraPrice: 129.50,
    shellPrice: 15.20,
    marketLocation: 'வெள்ளக்கோவில் சந்தை',
    notes: 'சந்தை நிலைத்தன்மை',
    updatedAt: '2026-10-15T09:30:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  },
  {
    id: '2026-10-14',
    date: '2026-10-14',
    formattedDateTa: formatTamilDate('2026-10-14'),
    dayOfWeekTa: getTamilDayOfWeek('2026-10-14'),
    copraPrice: 128.00,
    shellPrice: 15.00,
    marketLocation: 'பொள்ளாச்சி சந்தை',
    notes: 'மழை காரணமாக வரத்து தாமதம்',
    updatedAt: '2026-10-14T09:00:00.000Z',
    updatedBy: 'நிர்வாகி (Admin)'
  }
];
