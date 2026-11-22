export type Prefs = {
  cuisine: string;
  maxMinutes: number; // 0 = no limit
  budget: number; // Rp per serving, 0 = no limit
  equipment: string[];
  notify: boolean;
  notifyDaysBefore: number;
  notifyHour: number;
};

export const DEFAULT_PREFS: Prefs = {
  cuisine: 'Masakan Indonesia',
  maxMinutes: 30,
  budget: 20000,
  equipment: ['Ricecooker', 'Wajan'],
  notify: false,
  notifyDaysBefore: 1,
  notifyHour: 8,
};

export const CUISINES = [
  'Masakan Indonesia',
  'Masakan Jawa',
  'Masakan Sunda',
  'Masakan Padang',
  'Masakan Chinese',
  'Masakan Jepang',
  'Masakan Korea',
  'Masakan Western',
  'Apa saja',
];

export const TIME_OPTIONS = [15, 30, 45, 60, 0];

export const EQUIPMENT = [
  'Kompor',
  'Wajan',
  'Panci',
  'Ricecooker',
  'Teflon',
  'Oven',
  'Air fryer',
  'Microwave',
  'Blender',
  'Kukusan',
];

export const REMIND_DAYS = [1, 2, 3];
export const REMIND_HOURS = [7, 8, 12, 18];

export const formatRp = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;
export const timeLabel = (m: number) => (m > 0 ? `<= ${m} menit` : 'Bebas');
export const budgetLabel = (b: number) => (b > 0 ? `<= Rp${formatRp(b)}` : 'Bebas');
export const equipmentLabel = (e: string[]) => (e.length > 0 ? e.join(', ') : 'Belum diatur');
export const reminderLabel = (p: Prefs) =>
  p.notify ? `${p.notifyDaysBefore} hari sebelum, ${hourLabel(p.notifyHour)}` : 'Mati';

// Makes sure data loaded from storage has the right shape
export function sanitizePrefs(raw: unknown): Prefs {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<Prefs>;
  return {
    cuisine: typeof p.cuisine === 'string' && p.cuisine ? p.cuisine : DEFAULT_PREFS.cuisine,
    maxMinutes:
      typeof p.maxMinutes === 'number' && p.maxMinutes >= 0
        ? p.maxMinutes
        : DEFAULT_PREFS.maxMinutes,
    budget:
      typeof p.budget === 'number' && p.budget >= 0 ? p.budget : DEFAULT_PREFS.budget,
    equipment: Array.isArray(p.equipment) ? p.equipment.map(String) : DEFAULT_PREFS.equipment,
    notify: typeof p.notify === 'boolean' ? p.notify : DEFAULT_PREFS.notify,
    notifyDaysBefore: REMIND_DAYS.includes(p.notifyDaysBefore as number)
      ? (p.notifyDaysBefore as number)
      : DEFAULT_PREFS.notifyDaysBefore,
    notifyHour:
      typeof p.notifyHour === 'number' &&
      Number.isInteger(p.notifyHour) &&
      p.notifyHour >= 0 &&
      p.notifyHour <= 23
        ? p.notifyHour
        : DEFAULT_PREFS.notifyHour,
  };
}