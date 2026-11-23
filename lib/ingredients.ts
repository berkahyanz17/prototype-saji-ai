import { SHELF_LIFE_DAYS, type Category, type Location } from './foodInfo';
import type { FridgeItem } from './FridgeContext';
import type { Recipe } from './recipes';

export type Nutrients = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number; // mg
};

export type Ingredient = {
  id: string;
  name: string; // canonical Indonesian name
  aliases: string[];
  category: Category;
  location: Location; // default storage
  shelf: Partial<Record<Location, number>>; // shelf life in days per location
  unit: string; // default unit for stock
  qty: number; // typical purchase amount, used when the real amount is unknown
  units: Record<string, number>; // grams per unit
  density?: number; // grams per ml (liquids)
  per100: Nutrients; // per 100 g, approximate (USDA/TKPI style values)
};

// kcal, protein, carbs, fat, fiber, sugar (g), sodium (mg)
type N = [number, number, number, number, number, number, number];

const ing = (
  id: string,
  name: string,
  aliases: string[],
  category: Category,
  location: Location,
  shelf: Ingredient['shelf'],
  unit: string,
  qty: number,
  units: Record<string, number>,
  n: N,
  density?: number
): Ingredient => ({
  id,
  name,
  aliases,
  category,
  location,
  shelf,
  unit,
  qty,
  units,
  density,
  per100: {
    kcal: n[0],
    protein: n[1],
    carbs: n[2],
    fat: n[3],
    fiber: n[4],
    sugar: n[5],
    sodium: n[6],
  },
});

export const INGREDIENTS: Ingredient[] = [
  // Protein
  ing('telur', 'telur', ['egg', 'eggs', 'telur ayam', 'telor'], 'Protein', 'kulkas', { kulkas: 21, rak: 7 }, 'butir', 6, { butir: 50 }, [143, 12.6, 0.7, 9.5, 0, 0.4, 142]),
  ing('ayam', 'ayam', ['chicken', 'daging ayam', 'dada ayam', 'paha ayam'], 'Protein', 'kulkas', { kulkas: 2, freezer: 180 }, 'g', 500, { potong: 100 }, [120, 22.5, 0, 2.6, 0, 0, 45]),
  ing('sapi', 'daging sapi', ['beef', 'sapi', 'daging'], 'Protein', 'kulkas', { kulkas: 3, freezer: 120 }, 'g', 250, {}, [150, 21, 0, 6.5, 0, 0, 55]),
  ing('ikan', 'ikan', ['fish', 'lele', 'ikan lele', 'nila', 'ikan nila', 'tongkol', 'ikan tongkol', 'salmon'], 'Protein', 'kulkas', { kulkas: 2, freezer: 90 }, 'g', 300, { ekor: 250 }, [105, 20, 0, 2.5, 0, 0, 60]),
  ing('udang', 'udang', ['shrimp', 'prawn', 'prawns'], 'Protein', 'kulkas', { kulkas: 2, freezer: 90 }, 'g', 250, {}, [85, 20.1, 0, 0.5, 0, 0, 119]),
  ing('tahu', 'tahu', ['tofu', 'tahu putih'], 'Protein', 'kulkas', { kulkas: 4, rak: 1 }, 'potong', 4, { potong: 50 }, [76, 8.1, 1.9, 4.8, 0.3, 0.6, 7]),
  ing('tempe', 'tempe', ['tempeh'], 'Protein', 'kulkas', { kulkas: 5, rak: 2, freezer: 90 }, 'potong', 2, { potong: 100 }, [192, 20.3, 7.6, 10.8, 0, 0, 9]),

  // Karbo
  ing('nasi', 'nasi putih', ['nasi', 'cooked rice', 'steamed rice'], 'Karbo', 'kulkas', { kulkas: 3, rak: 1, freezer: 30 }, 'g', 400, { piring: 200, porsi: 200, mangkuk: 150 }, [130, 2.7, 28.2, 0.3, 0.4, 0, 1]),
  ing('beras', 'beras', ['rice', 'white rice', 'beras putih'], 'Karbo', 'rak', { rak: 180 }, 'g', 1000, {}, [365, 7.1, 80, 0.7, 1.3, 0.1, 5]),
  ing('mie', 'mie instan', ['instant noodle', 'instant noodles', 'mie', 'mi instan', 'noodle', 'noodles', 'indomie', 'mie sedaap', 'mie sedap'], 'Karbo', 'rak', { rak: 180 }, 'bungkus', 5, { bungkus: 80 }, [450, 9, 62, 18, 2, 2, 1800]),
  ing('roti', 'roti tawar', ['bread', 'roti', 'white bread'], 'Karbo', 'rak', { rak: 4, kulkas: 7, freezer: 30 }, 'lembar', 8, { lembar: 30 }, [265, 9, 49, 3.2, 2.7, 5, 491]),
  ing('pasta', 'pasta', ['spaghetti', 'spageti', 'macaroni', 'makaroni'], 'Karbo', 'rak', { rak: 365 }, 'g', 250, {}, [371, 13, 75, 1.5, 3.2, 2.7, 6]),
  ing('kentang', 'kentang', ['potato', 'potatoes'], 'Karbo', 'rak', { rak: 21, kulkas: 28 }, 'buah', 3, { buah: 150 }, [77, 2, 17, 0.1, 2.2, 0.8, 6]),
  ing('terigu', 'tepung terigu', ['flour', 'wheat flour', 'terigu', 'tepung'], 'Karbo', 'rak', { rak: 180 }, 'g', 1000, { sdm: 8 }, [364, 10.3, 76, 1, 2.7, 0.3, 2]),

  // Sayur
  ing('tomat', 'tomat', ['tomato', 'tomatoes'], 'Sayur', 'rak', { rak: 5, kulkas: 10 }, 'buah', 4, { buah: 120 }, [18, 0.9, 3.9, 0.2, 1.2, 2.6, 5]),
  ing('jagung', 'jagung', ['corn', 'sweet corn', 'jagung manis'], 'Sayur', 'kulkas', { kulkas: 5, rak: 2 }, 'buah', 2, { buah: 150 }, [86, 3.3, 19, 1.4, 2.7, 6.3, 15]),
  ing('wortel', 'wortel', ['carrot', 'carrots'], 'Sayur', 'kulkas', { kulkas: 21, rak: 5 }, 'buah', 3, { buah: 60 }, [41, 0.9, 9.6, 0.2, 2.8, 4.7, 69]),
  ing('kol', 'kol', ['kubis', 'cabbage'], 'Sayur', 'kulkas', { kulkas: 14, rak: 3 }, 'g', 500, {}, [25, 1.3, 5.8, 0.1, 2.5, 3.2, 18]),
  ing('bayam', 'bayam', ['spinach'], 'Sayur', 'kulkas', { kulkas: 4, rak: 1 }, 'ikat', 1, { ikat: 150 }, [23, 2.9, 3.6, 0.4, 2.2, 0.4, 79]),
  ing('kangkung', 'kangkung', ['water spinach'], 'Sayur', 'kulkas', { kulkas: 3, rak: 1 }, 'ikat', 1, { ikat: 200 }, [19, 2.6, 3.1, 0.2, 2.1, 0, 113]),
  ing('sawi', 'sawi hijau', ['sawi', 'mustard greens', 'pak choy', 'bok choy', 'caisim'], 'Sayur', 'kulkas', { kulkas: 5, rak: 1 }, 'ikat', 1, { ikat: 200 }, [27, 2.9, 4.7, 0.4, 3.2, 1.3, 25]),
  ing('brokoli', 'brokoli', ['broccoli'], 'Sayur', 'kulkas', { kulkas: 7, rak: 2 }, 'g', 300, {}, [34, 2.8, 6.6, 0.4, 2.6, 1.7, 33]),
  ing('timun', 'timun', ['cucumber'], 'Sayur', 'kulkas', { kulkas: 7, rak: 3 }, 'buah', 2, { buah: 200 }, [15, 0.7, 3.6, 0.1, 0.5, 1.7, 2]),
  ing('terong', 'terong', ['eggplant', 'aubergine'], 'Sayur', 'kulkas', { kulkas: 7, rak: 3 }, 'buah', 2, { buah: 150 }, [25, 1, 5.9, 0.2, 3, 3.5, 2]),
  ing('buncis', 'buncis', ['green beans', 'green bean', 'string beans'], 'Sayur', 'kulkas', { kulkas: 5, rak: 2 }, 'g', 250, {}, [31, 1.8, 7, 0.2, 3.4, 3.3, 6]),
  ing('kacang-panjang', 'kacang panjang', ['yardlong bean', 'long bean', 'long beans'], 'Sayur', 'kulkas', { kulkas: 5, rak: 2 }, 'ikat', 1, { ikat: 150 }, [47, 2.8, 8.4, 0.4, 3.2, 0, 4]),
  ing('jamur', 'jamur', ['mushroom', 'mushrooms', 'champignon'], 'Sayur', 'kulkas', { kulkas: 5, rak: 1 }, 'g', 200, {}, [22, 3.1, 3.3, 0.3, 1, 2, 5]),
  ing('alpukat', 'alpukat', ['avocado'], 'Sayur', 'rak', { rak: 4, kulkas: 7 }, 'buah', 2, { buah: 150 }, [160, 2, 8.5, 14.7, 6.7, 0.7, 7]),
  ing('paprika', 'paprika', ['bell pepper', 'capsicum'], 'Sayur', 'kulkas', { kulkas: 7, rak: 3 }, 'buah', 1, { buah: 150 }, [31, 1, 6, 0.3, 2.1, 4.2, 4]),
  ing('daun-bawang', 'daun bawang', ['spring onion', 'scallion', 'green onion'], 'Sayur', 'kulkas', { kulkas: 7, rak: 2 }, 'batang', 3, { batang: 15 }, [32, 1.8, 7.3, 0.2, 2.6, 2.3, 16]),

  // Bumbu
  ing('bawang-merah', 'bawang merah', ['bawang', 'shallot', 'shallots', 'red onion'], 'Bumbu', 'rak', { rak: 21, kulkas: 30 }, 'g', 250, { siung: 10 }, [72, 2.5, 16.8, 0.1, 3.2, 7.9, 12]),
  ing('bawang-putih', 'bawang putih', ['garlic'], 'Bumbu', 'rak', { rak: 30, kulkas: 60 }, 'siung', 10, { siung: 4 }, [149, 6.4, 33.1, 0.5, 2.1, 1, 17]),
  ing('bawang-bombay', 'bawang bombay', ['onion', 'onions', 'bawang bombai', 'yellow onion'], 'Bumbu', 'rak', { rak: 30, kulkas: 45 }, 'buah', 2, { buah: 150 }, [40, 1.1, 9.3, 0.1, 1.7, 4.2, 4]),
  ing('cabai', 'cabai', ['chili', 'chilli', 'chili pepper', 'cabe', 'cabai merah', 'cabai rawit', 'red chili'], 'Bumbu', 'kulkas', { kulkas: 10, rak: 4 }, 'g', 100, { buah: 5 }, [40, 1.9, 8.8, 0.4, 1.5, 5.3, 9]),
  ing('jahe', 'jahe', ['ginger'], 'Bumbu', 'rak', { rak: 14, kulkas: 28 }, 'g', 100, { ruas: 20 }, [80, 1.8, 17.8, 0.8, 2, 1.7, 13]),
  ing('garam', 'garam', ['salt'], 'Bumbu', 'rak', { rak: 1000 }, 'g', 250, { sdt: 6, sdm: 18 }, [0, 0, 0, 0, 0, 0, 38758]),
  ing('gula', 'gula', ['sugar', 'gula pasir'], 'Bumbu', 'rak', { rak: 730 }, 'g', 500, { sdt: 4, sdm: 12.5 }, [387, 0, 100, 0, 0, 100, 1]),
  ing('minyak', 'minyak goreng', ['cooking oil', 'oil', 'vegetable oil', 'minyak'], 'Bumbu', 'rak', { rak: 300 }, 'ml', 1000, {}, [884, 0, 0, 100, 0, 0, 0], 0.92),
  ing('kecap-manis', 'kecap manis', ['sweet soy sauce', 'sweet soy', 'kecap'], 'Bumbu', 'rak', { rak: 365 }, 'ml', 275, {}, [190, 2.5, 43, 0.1, 0, 38, 2200], 1.25),
  ing('kecap-asin', 'kecap asin', ['soy sauce', 'light soy sauce', 'salty soy sauce'], 'Bumbu', 'rak', { rak: 365 }, 'ml', 250, {}, [53, 8.1, 4.9, 0.6, 0.8, 0.4, 5493], 1.15),
  ing('saus-tomat', 'saus tomat', ['ketchup', 'tomato sauce', 'tomato ketchup'], 'Bumbu', 'rak', { rak: 180, kulkas: 270 }, 'ml', 275, {}, [101, 1, 27, 0.1, 0.3, 21, 907], 1.15),
  ing('merica', 'merica', ['pepper', 'black pepper', 'lada'], 'Bumbu', 'rak', { rak: 730 }, 'g', 50, { sdt: 2.3 }, [251, 10.4, 64, 3.3, 25.3, 0.6, 20]),
  ing('santan', 'santan', ['coconut milk'], 'Bumbu', 'rak', { rak: 180, kulkas: 3 }, 'ml', 200, {}, [197, 2, 2.8, 21.3, 0, 0, 13], 1),

  // Produk susu
  ing('susu', 'susu', ['milk', 'fresh milk', 'susu segar', 'susu uht', 'susu cair'], 'Produk susu', 'kulkas', { kulkas: 7, rak: 90 }, 'ml', 1000, {}, [61, 3.2, 4.8, 3.3, 0, 5.1, 43], 1.03),
  ing('yogurt', 'yogurt', ['yoghurt'], 'Produk susu', 'kulkas', { kulkas: 14 }, 'g', 400, {}, [61, 3.5, 4.7, 3.3, 0, 4.7, 46]),
  ing('keju', 'keju', ['cheese', 'cheddar'], 'Produk susu', 'kulkas', { kulkas: 30, freezer: 90 }, 'g', 165, { lembar: 20 }, [403, 24.9, 1.3, 33.1, 0, 0.5, 621]),
  ing('mentega', 'mentega', ['butter', 'margarin', 'margarine'], 'Produk susu', 'kulkas', { kulkas: 90, rak: 5, freezer: 180 }, 'g', 200, { sdm: 14 }, [717, 0.9, 0.1, 81.1, 0, 0.1, 643]),
];

const INGREDIENT_BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));
export const ingredientById = (id: string) => INGREDIENT_BY_ID.get(id);

// Every name and alias, longest first, so "sweet soy sauce" wins over "soy sauce"
const ALIASES = INGREDIENTS.flatMap((i) =>
  [i.name, ...i.aliases].map((alias) => ({
    alias: alias.toLowerCase(),
    re: new RegExp('(^|[^a-z])' + alias.toLowerCase()),
    ing: i,
  }))
).sort((a, b) => b.alias.length - a.alias.length);

export function findIngredient(name: string): Ingredient | undefined {
  const n = name.toLowerCase().trim();
  if (!n) return undefined;
  for (const a of ALIASES) if (a.alias === n) return a.ing;
  for (const a of ALIASES) if (a.re.test(n)) return a.ing;
  return undefined;
}

export const UNIT_OPTIONS = [
  'g', 'kg', 'ml', 'liter', 'butir', 'buah', 'siung',
  'ikat', 'bungkus', 'potong', 'lembar', 'batang', 'sdm', 'sdt',
];

// Grams in one unit of this ingredient, or null if unknown
export function gramsPer(db: Ingredient | undefined, unit: string): number | null {
  const u = unit.toLowerCase();
  if (u === 'g') return 1;
  if (u === 'kg') return 1000;
  const d = db?.density ?? 1;
  if (u === 'ml') return d;
  if (u === 'liter') return 1000 * d;
  const own = db?.units[u];
  if (own !== undefined) return own;
  if (u === 'sdm') return 15 * d;
  if (u === 'sdt') return 5 * d;
  return null;
}

// Converts an amount between two units of the same ingredient, or null if impossible
export function convertQty(
  db: Ingredient | undefined,
  qty: number,
  from: string,
  to: string
): number | null {
  if (from === to) return qty;
  const f = gramsPer(db, from);
  const t = gramsPer(db, to);
  if (f === null || t === null) return null;
  return (qty * f) / t;
}

export function shelfDaysFor(
  db: Ingredient | undefined,
  location: Location,
  category: Category
): number {
  if (db) return db.shelf[location] ?? db.shelf[db.location] ?? SHELF_LIFE_DAYS[category];
  return SHELF_LIFE_DAYS[category];
}

export const formatQty = (n?: number | null) =>
  n === undefined || n === null ? '?' : String(Math.round(n * 10) / 10);

// ---- Amount parsing ("2 butir", "½ sdt", "200 gram") ----

const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

const UNIT_ALIASES: Record<string, string> = {
  gram: 'g',
  gr: 'g',
  kilogram: 'kg',
  mililiter: 'ml',
  cc: 'ml',
  l: 'liter',
  biji: 'buah',
  pcs: 'buah',
};

export function normalizeUnit(raw: string): string {
  const u = raw.toLowerCase().replace(/[.,;()]/g, '').trim();
  return UNIT_ALIASES[u] ?? u;
}

export function parseAmount(text: string): { qty: number; unit: string } | null {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/sendok makan/g, 'sdm')
    .replace(/sendok teh/g, 'sdt');
  const m = s.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)?\s*([½¼¾⅓⅔])?\s*(.*)$/);
  if (!m) return null;

  let qty = 0;
  let found = false;
  if (m[1]) {
    found = true;
    if (m[1].includes('/')) {
      const [a, b] = m[1].split('/').map((x) => Number(x.replace(',', '.')));
      qty = b ? a / b : 0;
    } else {
      qty = Number(m[1].replace(',', '.'));
    }
  }
  if (m[2]) {
    found = true;
    qty += FRACTIONS[m[2]];
  }
  if (!found || !(qty > 0)) return null;

  const unit = normalizeUnit((m[3] ?? '').split(/\s+/)[0] ?? '');
  if (!unit) return null;
  return { qty, unit };
}

// ---- Nutrition computed from the ingredient database ----

export type NutritionResult = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  fromDb: boolean; // false = fell back to the recipe's own (AI/hand-written) numbers
  matched: number;
  total: number;
};

const r = (v: number) => (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10);

export function nutritionOf(recipe: Recipe): NutritionResult {
  const sum = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  let matched = 0;

  for (const ri of recipe.ingredients) {
    const db = findIngredient(ri.name);
    const parsed = parseAmount(ri.amount);
    if (!db || !parsed) continue;
    const per = gramsPer(db, parsed.unit);
    if (per === null) continue;

    const factor = (parsed.qty * per) / 100;
    sum.kcal += db.per100.kcal * factor;
    sum.protein += db.per100.protein * factor;
    sum.carbs += db.per100.carbs * factor;
    sum.fat += db.per100.fat * factor;
    sum.fiber += db.per100.fiber * factor;
    sum.sugar += db.per100.sugar * factor;
    sum.sodium += db.per100.sodium * factor;
    matched++;
  }

  const total = recipe.ingredients.length;
  const servings = recipe.servings || 1;

  if (total > 0 && matched >= Math.ceil(total * 0.7)) {
    return {
      calories: Math.round(sum.kcal / servings),
      protein: r(sum.protein / servings),
      carbs: r(sum.carbs / servings),
      fat: r(sum.fat / servings),
      fiber: r(sum.fiber / servings),
      sugar: r(sum.sugar / servings),
      sodium: Math.round(sum.sodium / servings),
      fromDb: true,
      matched,
      total,
    };
  }

  return {
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    fiber: recipe.fiber,
    sugar: recipe.sugar,
    sodium: recipe.sodium,
    fromDb: false,
    matched,
    total,
  };
}

// ---- Cooking: reduce stock by the recipe amounts ----

export type StockChange = {
  id: string;
  name: string;
  before?: number;
  after: number | null; // null = used up, remove from the fridge
  unit?: string;
};

export function planCooking(recipe: Recipe, fridge: FridgeItem[]): StockChange[] {
  const touched = new Map<string, StockChange>();

  for (const ri of recipe.ingredients) {
    const parsed = parseAmount(ri.amount);
    if (!parsed) continue;

    const recipeDb = findIngredient(ri.name);
    const matches = fridge
      .filter(
        (f) =>
          (recipeDb && f.ingredientId === recipeDb.id) ||
          ri.keywords.some((k) => f.name.includes(k))
      )
      .sort((a, b) => a.expiresAt - b.expiresAt); // use what expires first
    if (matches.length === 0) continue;

    const db =
      recipeDb ??
      (matches[0].ingredientId ? ingredientById(matches[0].ingredientId) : undefined);
    const needPerUnit = gramsPer(db, parsed.unit);
    const gramsMode = needPerUnit !== null;
    let remainingNeed = needPerUnit !== null ? parsed.qty * needPerUnit : parsed.qty;

    for (const item of matches) {
      if (remainingNeed <= 0) break;

      const prev = touched.get(item.id);
      const have = prev ? prev.after : item.quantity;
      if (have === null) continue; // already used up by an earlier ingredient

      if (have === undefined || !item.unit) {
        // amount unknown: assume this item covers the need and is used up
        touched.set(item.id, {
          id: item.id,
          name: item.name,
          before: item.quantity,
          after: null,
          unit: item.unit,
        });
        remainingNeed = 0;
        break;
      }

      const perStock = gramsMode
        ? gramsPer(db, item.unit)
        : item.unit === parsed.unit
          ? 1
          : null;
      if (perStock === null) continue;

      const haveBase = have * perStock;
      const take = Math.min(haveBase, remainingNeed);
      remainingNeed -= take;
      const left = Math.round(((haveBase - take) / perStock) * 10) / 10;

      touched.set(item.id, {
        id: item.id,
        name: item.name,
        before: prev ? prev.before : item.quantity,
        after: left < 0.1 ? null : left,
        unit: item.unit,
      });
    }
  }

  return Array.from(touched.values());
}