export const FREE_DAILY = 5; // free AI credits per day (set to 1 to test the paywall quickly)
export const AD_REWARD = 2; // credits for watching one ad
export const MAX_ADS = 3; // ads that give credits per day

export type PlanId = 'bulanan' | 'tahunan';

// Example prices only
export const PLANS: { id: PlanId; title: string; price: number; note: string }[] = [
  { id: 'bulanan', title: 'Bulanan', price: 19000, note: 'per bulan' },
  { id: 'tahunan', title: 'Tahunan', price: 149000, note: 'per tahun · hemat 35%' },
];

export const BENEFITS = [
  'Scan dan resep AI tanpa batas kredit harian',
  'Tanpa iklan',
  'Kustomisasi profil (segera hadir)',
];