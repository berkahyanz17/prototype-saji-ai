export type Cosmetics = { frame: string; background: string; skin: string };

export const DEFAULT_COSMETICS: Cosmetics = {
  frame: 'polos',
  background: 'hijau',
  skin: 'klasik',
};

export type Skin = {
  id: string;
  name: string;
  plus: boolean;
  hat: string;
  accent: string | null;
  outfit: 'none' | 'apron' | 'scarf';
};
export type Frame = { id: string; name: string; plus: boolean; rings: string[] };
export type Background = { id: string; name: string; plus: boolean; color: string };

export const SKINS: Skin[] = [
  { id: 'klasik', name: 'Klasik', plus: false, hat: '#ffffff', accent: null, outfit: 'none' },
  { id: 'matcha', name: 'Matcha', plus: false, hat: '#d0e588', accent: null, outfit: 'none' },
  { id: 'tomat', name: 'Tomat', plus: true, hat: '#f08a72', accent: '#e0634a', outfit: 'scarf' },
  { id: 'koki-biru', name: 'Koki Biru', plus: true, hat: '#a9c9ee', accent: '#6f9fd8', outfit: 'apron' },
  { id: 'emas', name: 'Emas', plus: true, hat: '#f6d572', accent: '#e0b23c', outfit: 'apron' },
];

// rings go from the outside to the inside
export const FRAMES: Frame[] = [
  { id: 'polos', name: 'Polos', plus: false, rings: [] },
  { id: 'cokelat', name: 'Cokelat', plus: false, rings: ['#462b0e'] },
  { id: 'daun', name: 'Daun', plus: false, rings: ['#8f9a6a', '#fff7eb', '#8f9a6a'] },
  { id: 'emas', name: 'Emas', plus: true, rings: ['#e0b23c', '#fff7eb', '#e0b23c'] },
  { id: 'tomat', name: 'Tomat', plus: true, rings: ['#e0634a', '#fbefc8', '#e0634a'] },
];

export const BACKGROUNDS: Background[] = [
  { id: 'hijau', name: 'Hijau', plus: false, color: '#d0e588' },
  { id: 'krem', name: 'Krem', plus: false, color: '#fbefc8' },
  { id: 'mint', name: 'Mint', plus: true, color: '#abe4c2' },
  { id: 'senja', name: 'Senja', plus: true, color: '#f8cdb0' },
  { id: 'langit', name: 'Langit', plus: true, color: '#cfe3f7' },
];

function pick<T extends { id: string; plus: boolean }>(list: T[], id: string, isPlus: boolean): T {
  const found = list.find((x) => x.id === id);
  return found && (isPlus || !found.plus) ? found : list[0];
}

// Plus-only items fall back to the default when Saji Plus is not active
export function effectiveCosmetics(c: Cosmetics, isPlus: boolean) {
  return {
    skin: pick(SKINS, c.skin, isPlus),
    frame: pick(FRAMES, c.frame, isPlus),
    background: pick(BACKGROUNDS, c.background, isPlus),
  };
}

export function sanitizeCosmetics(raw: unknown): Cosmetics {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<Cosmetics>;
  const has = (list: { id: string }[], id: unknown) => list.some((x) => x.id === id);
  return {
    frame: has(FRAMES, p.frame) ? (p.frame as string) : DEFAULT_COSMETICS.frame,
    background: has(BACKGROUNDS, p.background)
      ? (p.background as string)
      : DEFAULT_COSMETICS.background,
    skin: has(SKINS, p.skin) ? (p.skin as string) : DEFAULT_COSMETICS.skin,
  };
}