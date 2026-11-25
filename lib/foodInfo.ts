export type Category =
  | 'Sayur'
  | 'Buah'
  | 'Bumbu'
  | 'Produk susu'
  | 'Protein'
  | 'Karbo'
  | 'Lainnya';

export type Location = 'kulkas' | 'rak' | 'freezer';

export type Tone = 'urgent' | 'fresh' | 'far' | 'expired';

export const DAY_MS = 24 * 60 * 60 * 1000;

// Estimated shelf life in days, by category (used for items not in the database)
export const SHELF_LIFE_DAYS: Record<Category, number> = {
  Sayur: 5,
  Buah: 7,
  Bumbu: 60,
  'Produk susu': 7,
  Protein: 5,
  Karbo: 30,
  Lainnya: 14,
};

// Checked in this order; first match wins
const CATEGORY_KEYWORDS: [Category, string[]][] = [
  ['Produk susu', ['milk', 'susu', 'yogurt', 'yoghurt', 'cheese', 'keju', 'butter', 'mentega', 'cream', 'krim']],
  ['Bumbu', ['garlic', 'bawang', 'onion', 'ginger', 'jahe', 'chili', 'chilli', 'cabai', 'cabe', 'sauce', 'saus', 'kecap', 'salt', 'garam', 'pepper', 'merica', 'lada', 'sugar', 'gula', 'oil', 'minyak', 'spice', 'bumbu', 'seasoning', 'turmeric', 'kunyit']],
  ['Buah', ['banana', 'pisang', 'apple', 'apel', 'orange', 'jeruk', 'mango', 'mangga', 'watermelon', 'semangka', 'pineapple', 'nanas', 'grape', 'anggur', 'strawberry', 'stroberi', 'papaya', 'pepaya', 'melon', 'lemon', 'guava', 'jambu']],
  ['Sayur', ['tomato', 'tomat', 'spinach', 'bayam', 'carrot', 'wortel', 'cabbage', 'kol', 'kubis', 'cucumber', 'timun', 'lettuce', 'selada', 'potato', 'kentang', 'broccoli', 'brokoli', 'avocado', 'alpukat', 'eggplant', 'terong', 'corn', 'jagung', 'mushroom', 'jamur', 'kangkung', 'sawi', 'buncis', 'pumpkin', 'labu', 'vegetable', 'sayur']],
  ['Protein', ['egg', 'telur', 'chicken', 'ayam', 'beef', 'sapi', 'daging', 'meat', 'fish', 'ikan', 'shrimp', 'udang', 'tofu', 'tahu', 'tempe', 'tempeh', 'sausage', 'sosis', 'bacon', 'pork', 'lamb', 'kambing', 'squid', 'cumi', 'crab', 'kepiting']],
  ['Karbo', ['rice', 'nasi', 'beras', 'noodle', 'mie', 'bread', 'roti', 'pasta', 'spaghetti', 'flour', 'tepung', 'oat', 'cereal']],
];

export function guessCategory(name: string): Category {
  const lower = name.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => new RegExp('\\b' + kw).test(lower))) {
      return category;
    }
  }
  return 'Lainnya';
}

export function defaultLocation(category: Category): Location {
  return category === 'Sayur' || category === 'Produk susu' || category === 'Protein'
    ? 'kulkas'
    : 'rak';
}

const EMOJI: [string[], string][] = [
  [['eggplant', 'terong'], '🍆'],
  [['lemon', 'lime', 'nipis'], '🍋'],
  [['orange', 'jeruk'], '🍊'],
  [['banana', 'pisang'], '🍌'],
  [['apple', 'apel'], '🍎'],
  [['mango', 'mangga'], '🥭'],
  [['watermelon', 'semangka'], '🍉'],
  [['pineapple', 'nanas'], '🍍'],
  [['grape', 'anggur'], '🍇'],
  [['strawberry', 'stroberi'], '🍓'],
  [['melon'], '🍈'],
  [['kacang panjang', 'buncis', 'long bean', 'yardlong', 'green bean', 'polong', 'peas'], '🥬'],
  [['peanut', 'kacang'], '🥜'],
  [['honey', 'madu'], '🍯'],
  [['sweet potato', 'ubi', 'singkong'], '🍠'],
  [['sausage', 'sosis', 'bakso', 'meatball'], '🍢'],
  [['squid', 'cumi'], '🦑'],
  [['garlic', 'bawang putih'], '🧄'],
  [['onion', 'bawang'], '🧅'],
  [['egg', 'telur'], '🥚'],
  [['tomato', 'tomat'], '🍅'],
  [['avocado', 'alpukat'], '🥑'],
  [['spinach', 'bayam', 'lettuce', 'selada', 'cabbage', 'kol', 'kubis', 'kangkung', 'sawi'], '🥬'],
  [['cucumber', 'timun'], '🥒'],
  [['carrot', 'wortel'], '🥕'],
  [['potato', 'kentang'], '🥔'],
  [['broccoli', 'brokoli'], '🥦'],
  [['corn', 'jagung'], '🌽'],
  [['mushroom', 'jamur'], '🍄'],
  [['chili', 'chilli', 'cabai', 'cabe'], '🌶️'],
  [['milk', 'susu', 'yogurt', 'yoghurt'], '🥛'],
  [['cheese', 'keju'], '🧀'],
  [['butter', 'mentega'], '🧈'],
  [['chicken', 'ayam'], '🍗'],
  [['beef', 'sapi', 'daging', 'meat'], '🥩'],
  [['fish', 'ikan'], '🐟'],
  [['shrimp', 'udang'], '🦐'],
  [['noodle', 'mie'], '🍜'],
  [['rice', 'nasi', 'beras'], '🍚'],
  [['bread', 'roti'], '🍞'],
  [['salt', 'garam'], '🧂'],
  [['sauce', 'saus', 'kecap'], '🍶'],
];

const CATEGORY_EMOJI: Record<Category, string> = {
  Sayur: '🥬',
  Buah: '🍎',
  Bumbu: '🧂',
  'Produk susu': '🥛',
  Protein: '🍖',
  Karbo: '🍚',
  Lainnya: '🍽️',
};

export function emojiFor(name: string, category: Category): string {
  const lower = name.toLowerCase();
  for (const [keywords, emoji] of EMOJI) {
    if (keywords.some((kw) => new RegExp('\\b' + kw).test(lower))) return emoji;
  }
  return CATEGORY_EMOJI[category];
}

export function expiryStatus(expiresAt: number): { text: string; tone: Tone } {
  const diff = expiresAt - Date.now();
  if (diff < 0) return { text: 'Sudah\nkedaluwarsa', tone: 'expired' };
  const days = Math.max(1, Math.ceil(diff / DAY_MS));
  if (days <= 2) return { text: `Segera gunakan\ndalam ${days} hari`, tone: 'urgent' };
  if (days <= 14) return { text: `Segar untuk\n${days} hari kedepan`, tone: 'fresh' };
  return { text: `${days} hari sebelum\nkedaluwarsa`, tone: 'far' };
}