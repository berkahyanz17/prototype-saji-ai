export type RecipeIngredient = {
  name: string;
  amount: string;
  keywords: string[]; // matched against fridge item names
  staple?: boolean; // basic kitchen item, assumed available
};

export type Recipe = {
  id: string;
  name: string;
  emoji: string;
  minutes: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number; // mg  sodium:
  cost?: number; // estimated Rp per serving
  custom?: boolean; // created by the user
  draft?: boolean; // saved as a draft, not shown in recommendations
  photo?: string; // local photo of the dish (own recipes)
  ingredients: RecipeIngredient[];
  steps: string[];
};

const ing = (
  name: string,
  amount: string,
  keywords: string[],
  staple = false
): RecipeIngredient => ({ name, amount, keywords, staple });

export const RECIPES: Recipe[] = [
  {
    id: 'nasi-goreng-telur',
    name: 'Nasi goreng telur',
    emoji: '🍳',
    minutes: 20,
    servings: 1,
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 17,
    fiber: 2,
    sugar: 5,
    sodium: 750,
    ingredients: [
      ing('Nasi putih', '200 g', ['nasi', 'rice', 'beras']),
      ing('Telur', '2 butir', ['telur', 'egg']),
      ing('Bawang putih', '2 siung', ['bawang putih', 'garlic']),
      ing('Bawang merah', '2 siung', ['bawang merah', 'shallot', 'onion', 'bawang bombay']),
      ing('Kecap manis', '1 sdm', ['kecap', 'soy sauce']),
      ing('Garam', '½ sdt', ['garam', 'salt'], true),
      ing('Minyak goreng', '1 sdm', ['minyak', 'oil'], true),
    ],
    steps: [
      'Iris halus bawang putih dan bawang merah.',
      'Panaskan minyak, tumis bawang sampai harum.',
      'Masukkan telur, orak-arik sampai setengah matang.',
      'Masukkan nasi, aduk rata.',
      'Tambahkan kecap manis dan garam, masak 3–5 menit.',
      'Sajikan selagi hangat.',
    ],
  },
  {
    id: 'mie-goreng-telur',
    name: 'Mie goreng telur',
    emoji: '🍜',
    minutes: 15,
    servings: 1,
    calories: 520,
    protein: 14,
    carbs: 62,
    fat: 24,
    fiber: 2,
    sugar: 6,
    sodium: 1400,
    ingredients: [
      ing('Mie instan', '1 bungkus', ['mie', 'noodle']),
      ing('Telur', '1 butir', ['telur', 'egg']),
      ing('Bawang putih', '1 siung', ['bawang putih', 'garlic']),
      ing('Cabai', '2 buah', ['cabai', 'cabe', 'chili', 'chilli']),
      ing('Kecap manis', '1 sdm', ['kecap', 'soy sauce']),
      ing('Minyak goreng', '1 sdm', ['minyak', 'oil'], true),
    ],
    steps: [
      'Rebus mie sampai setengah matang, tiriskan.',
      'Tumis bawang putih dan cabai sampai harum.',
      'Masukkan telur, orak-arik.',
      'Masukkan mie, bumbu mie, dan kecap manis.',
      'Aduk rata sekitar 2 menit, lalu sajikan.',
    ],
  },
  {
    id: 'telur-dadar-tomat',
    name: 'Telur dadar tomat',
    emoji: '🍅',
    minutes: 10,
    servings: 1,
    calories: 240,
    protein: 13,
    carbs: 6,
    fat: 18,
    fiber: 1,
    sugar: 3,
    sodium: 380,
    ingredients: [
      ing('Telur', '2 butir', ['telur', 'egg']),
      ing('Tomat', '1 buah', ['tomat', 'tomato']),
      ing('Bawang merah', '1 siung', ['bawang merah', 'shallot', 'onion', 'bawang bombay']),
      ing('Garam', '¼ sdt', ['garam', 'salt'], true),
      ing('Minyak goreng', '1 sdm', ['minyak', 'oil'], true),
    ],
    steps: [
      'Kocok telur dengan garam.',
      'Cincang kecil tomat dan bawang merah, campurkan ke telur.',
      'Panaskan minyak, tuang adonan.',
      'Masak kedua sisi sampai matang keemasan.',
    ],
  },
  {
    id: 'telur-ceplok-kecap',
    name: 'Telur ceplok kecap',
    emoji: '🥚',
    minutes: 8,
    servings: 1,
    calories: 250,
    protein: 13,
    carbs: 8,
    fat: 18,
    fiber: 0,
    sugar: 6,
    sodium: 500,
    ingredients: [
      ing('Telur', '2 butir', ['telur', 'egg']),
      ing('Kecap manis', '1 sdm', ['kecap', 'soy sauce']),
      ing('Bawang merah', '1 siung', ['bawang merah', 'shallot', 'onion', 'bawang bombay']),
      ing('Minyak goreng', '1 sdm', ['minyak', 'oil'], true),
    ],
    steps: [
      'Iris tipis bawang merah.',
      'Panaskan minyak, goreng telur ceplok sampai matang.',
      'Tumis bawang merah sebentar, tuang kecap manis.',
      'Siram ke atas telur, sajikan.',
    ],
  },
  {
    id: 'tumis-bayam',
    name: 'Tumis bayam bawang putih',
    emoji: '🥬',
    minutes: 10,
    servings: 1,
    calories: 110,
    protein: 3,
    carbs: 6,
    fat: 8,
    fiber: 3,
    sugar: 1,
    sodium: 350,
    ingredients: [
      ing('Bayam', '100 g', ['bayam', 'spinach']),
      ing('Bawang putih', '2 siung', ['bawang putih', 'garlic']),
      ing('Bawang merah', '1 siung', ['bawang merah', 'shallot', 'onion', 'bawang bombay']),
      ing('Garam', '½ sdt', ['garam', 'salt'], true),
      ing('Minyak goreng', '1 sdm', ['minyak', 'oil'], true),
    ],
    steps: [
      'Petik dan cuci bersih bayam.',
      'Tumis bawang putih dan bawang merah sampai harum.',
      'Masukkan bayam dan garam.',
      'Aduk 2–3 menit sampai layu, sajikan segera.',
    ],
  },
  {
    id: 'mie-kuah-telur',
    name: 'Mie kuah telur',
    emoji: '🍲',
    minutes: 10,
    servings: 1,
    calories: 460,
    protein: 13,
    carbs: 60,
    fat: 18,
    fiber: 2,
    sugar: 3,
    sodium: 1500,
    ingredients: [
      ing('Mie instan', '1 bungkus', ['mie', 'noodle']),
      ing('Telur', '1 butir', ['telur', 'egg']),
      ing('Tomat', '½ buah', ['tomat', 'tomato']),
    ],
    steps: [
      'Didihkan air, masak mie sekitar 3 menit.',
      'Masukkan irisan tomat dan bumbu mie.',
      'Pecahkan telur ke dalam kuah, aduk pelan sampai matang.',
      'Sajikan panas.',
    ],
  },
];

export function getRecipe(id: string, list: Recipe[] = RECIPES) {
  return list.find((r) => r.id === id);
}

export function matchRecipe(recipe: Recipe, fridgeNames: string[]) {
  const items = recipe.ingredients.map((ingredient) => ({
    ingredient,
    ready:
      !!ingredient.staple ||
      fridgeNames.some((n) => ingredient.keywords.some((k) => n.includes(k))),
  }));
  return {
    items,
    readyCount: items.filter((i) => i.ready).length,
    total: items.length,
  };
}

// Recipes sorted by how many ingredients you already have
export function rankRecipes(fridgeNames: string[], list: Recipe[] = RECIPES) {
  return list.map((recipe) => ({ recipe, ...matchRecipe(recipe, fridgeNames) })).sort(
    (a, b) =>
      b.readyCount / b.total - a.readyCount / a.total ||
      a.recipe.minutes - b.recipe.minutes
  );
}

export const CALORIE_TARGET = 2000;

export type Nutrient = { label: string; value: number; target: number; unit: string };

// Targets are general daily reference values for a 2000 kcal diet
export function nutrientsOf(r: Recipe): Nutrient[] {
  return [
    { label: 'Protein', value: r.protein, target: 60, unit: 'g' },
    { label: 'Karbohidrat', value: r.carbs, target: 300, unit: 'g' },
    { label: 'Lemak', value: r.fat, target: 65, unit: 'g' },
    { label: 'Serat', value: r.fiber, target: 30, unit: 'g' },
    { label: 'Gula', value: r.sugar, target: 50, unit: 'g' },
    { label: 'Natrium', value: r.sodium, target: 2000, unit: 'mg' },
  ];
}