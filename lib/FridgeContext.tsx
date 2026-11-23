import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DAY_MS,
  defaultLocation,
  guessCategory,
  type Category,
  type Location,
} from './foodInfo';
import {
  convertQty,
  findIngredient,
  ingredientById,
  normalizeUnit,
  shelfDaysFor,
  type Ingredient,
  type StockChange,
} from './ingredients';
import { DEFAULT_PREFS, sanitizePrefs, type Prefs } from './prefs';
import { RECIPES, type Recipe } from './recipes';

export type FridgeItem = {
  id: string;
  name: string;
  ingredientId?: string; // link to the ingredient database
  category: Category;
  location: Location;
  expiresAt: number;
  quantity?: number;
  unit?: string;
  estimated?: boolean; // quantity is a typical default, not a real measurement
};

export type NewItem = {
  name: string;
  category: Category;
  location: Location;
  quantity?: number;
  unit?: string;
  expiresAt?: number;
};

export type ScannedItem = { name: string; count?: number };

export type MergeChange = { name: string; before?: number; after?: number; unit?: string };
export type AddOutcome = { added: string[]; merged: MergeChange[] };
export type AddResult = 'added' | 'merged' | 'unchanged';

// Monday = 0 ... Sunday = 6
export const todayIndex = () => (new Date().getDay() + 6) % 7;

const STORAGE_KEY = 'saji-state-v1';

// Identifies the current week, so the streak resets every Monday
const weekKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - todayIndex());
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Cleans up items saved by older versions: normal units, ingredient link, starting quantity
const migrate = (raw: FridgeItem): FridgeItem => {
  const item = raw.unit ? { ...raw, unit: normalizeUnit(raw.unit) } : raw;
  if (item.ingredientId) return item;
  const db = findIngredient(item.name);
  if (!db) return item;
  return {
    ...item,
    ingredientId: db.id,
    quantity: item.quantity ?? db.qty,
    unit: item.quantity !== undefined ? item.unit : db.unit,
    estimated: item.quantity === undefined ? true : item.estimated,
  };
};

// Adds `qty unit` to the matching fridge entry. Returns null when no entry can take it.
function tryMerge(
  list: FridgeItem[],
  match: (i: FridgeItem) => boolean,
  qty: number | undefined,
  unit: string | undefined,
  estimated: boolean,
  expiresAt: number,
  db: Ingredient | undefined
): { list: FridgeItem[]; change: MergeChange } | null {
  const idx = list.findIndex((i) => {
    if (!match(i)) return false;
    if (qty === undefined || !unit) return true; // nothing to add: same item
    if (i.quantity === undefined || !i.unit) return true; // existing amount unknown
    return convertQty(db, qty, unit, i.unit) !== null; // units can be converted
  });
  if (idx === -1) return null;

  const item = list[idx];
  let quantity = item.quantity;
  let itemUnit = item.unit;

  if (qty !== undefined && unit) {
    if (item.quantity === undefined || !item.unit) {
      quantity = qty;
      itemUnit = unit;
    } else {
      const converted = convertQty(db, qty, unit, item.unit) ?? 0;
      quantity = Math.round((item.quantity + converted) * 10) / 10;
    }
  }

  const now = Date.now();
  const merged: FridgeItem = {
    ...item,
    quantity,
    unit: itemUnit,
    estimated: qty !== undefined ? !!(item.estimated || estimated) : item.estimated,
    // keep the earliest expiry so reminders aren't missed, unless the old stock already expired
    expiresAt: item.expiresAt < now ? expiresAt : Math.min(item.expiresAt, expiresAt),
  };

  const next = [...list];
  next[idx] = merged;
  return {
    list: next,
    change: { name: item.name, before: item.quantity, after: quantity, unit: itemUnit },
  };
}

type AppState = {
  fridge: FridgeItem[];
  addToFridge: (items: ScannedItem[]) => AddOutcome;
  addItem: (item: NewItem) => AddResult;
  updateItem: (
    id: string,
    patch: { quantity?: number; unit?: string; location?: Location }
  ) => void;
  removeFromFridge: (id: string) => void;
  clearFridge: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  cookedDays: boolean[];
  toggleCookedDay: (index: number) => void;
  cookRecipe: (recipeId: string, changes: StockChange[]) => void;
  usedCount: number;
  cookedRecipeIds: string[];
  aiRecipes: Recipe[];
  setAiRecipes: (recipes: Recipe[]) => void;
  recipes: Recipe[]; // AI recipes first, then the built-in ones
  prefs: Prefs;
  setPrefs: (prefs: Prefs) => void;
};

const AppContext = createContext<AppState | null>(null);

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [usedCount, setUsedCount] = useState(0);
  const [cookedRecipeIds, setCookedRecipeIds] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [cookedDays, setCookedDays] = useState<boolean[]>(
    new Array<boolean>(7).fill(false)
  );

  // Load saved data once on startup
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved.fridge)) setFridge(saved.fridge.map(migrate));
          if (Array.isArray(saved.favorites)) setFavorites(saved.favorites);
          if (Array.isArray(saved.aiRecipes)) setAiRecipes(saved.aiRecipes);
          if (typeof saved.usedCount === 'number') setUsedCount(saved.usedCount);
          if (Array.isArray(saved.cookedRecipeIds)) setCookedRecipeIds(saved.cookedRecipeIds);
          if (saved.prefs) setPrefs(sanitizePrefs(saved.prefs));
          if (
            saved.weekKey === weekKey() &&
            Array.isArray(saved.cookedDays) &&
            saved.cookedDays.length === 7
          ) {
            setCookedDays(saved.cookedDays);
          }
        }
      } catch {
        // ignore corrupted data and start fresh
      }
      setLoaded(true);
    })();
  }, []);

  // Save whenever anything changes (only after the first load finished)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fridge,
        favorites,
        cookedDays,
        aiRecipes,
        usedCount,
        cookedRecipeIds,
        prefs,
        weekKey: weekKey(),
      })
    ).catch(() => {});
  }, [loaded, fridge, favorites, cookedDays, aiRecipes, usedCount, cookedRecipeIds, prefs]);

  // Adds scanned ingredients. Existing ones are merged: a counted amount (e.g. 3 eggs
  // visible in the photo) is added to the stock; an uncounted one leaves the stock as is.
  const addToFridge = (items: ScannedItem[]): AddOutcome => {
    const outcome: AddOutcome = { added: [], merged: [] };
    let working = fridge;
    const now = Date.now();

    items.forEach((item, index) => {
      const raw = item.name.trim().toLowerCase();
      if (!raw) return;

      const db = findIngredient(raw);
      const name = db ? db.name : raw;
      const category = db ? db.category : guessCategory(raw);
      const location = db ? db.location : defaultLocation(category);
      const expiresAt = now + shelfDaysFor(db, location, category) * DAY_MS;
      // A visible count is a real measurement for countable units (butir, buah, ...)
      const counted =
        !!db &&
        item.count !== undefined &&
        item.count > 0 &&
        db.unit !== 'g' &&
        db.unit !== 'ml';

      const merged = tryMerge(
        working,
        (i) => i.name === name || (!!db && i.ingredientId === db.id),
        counted ? item.count : undefined,
        counted ? db?.unit : undefined,
        false,
        expiresAt,
        db
      );
      if (merged) {
        working = merged.list;
        outcome.merged.push(merged.change);
        return;
      }

      working = [
        ...working,
        {
          id: `${now}-${index}`,
          name,
          ingredientId: db?.id,
          category,
          location,
          expiresAt,
          quantity: counted ? item.count : db?.qty,
          unit: db?.unit,
          estimated: db ? !counted : undefined,
        },
      ];
      outcome.added.push(name);
    });

    if (working !== fridge) setFridge(working);
    return outcome;
  };

  // Adds one ingredient from the manual form. If it already exists and an amount is
  // given, the amount is added to the stock.
  const addItem = (item: NewItem): AddResult => {
    const raw = item.name.trim().toLowerCase();
    if (!raw) return 'unchanged';

    const db = findIngredient(raw);
    const name = db ? db.name : raw;
    const now = Date.now();
    const hasQty = item.quantity !== undefined && !!item.unit;
    const unit = hasQty ? normalizeUnit(item.unit as string) : undefined;
    const expiresAt =
      item.expiresAt ?? now + shelfDaysFor(db, item.location, item.category) * DAY_MS;

    const merged = tryMerge(
      fridge,
      (i) => i.name === name || (!!db && i.ingredientId === db.id),
      hasQty ? item.quantity : undefined,
      unit,
      false,
      expiresAt,
      db
    );
    if (merged) {
      setFridge(merged.list);
      return merged.change.before !== merged.change.after ? 'merged' : 'unchanged';
    }

    setFridge([
      ...fridge,
      {
        id: `${now}-m`,
        name,
        ingredientId: db?.id,
        category: item.category,
        location: item.location,
        expiresAt,
        quantity: hasQty ? item.quantity : db?.qty,
        unit: hasQty ? unit : db?.unit,
        estimated: !hasQty && !!db ? true : undefined,
      },
    ]);
    return 'added';
  };

  const updateItem = (
    id: string,
    patch: { quantity?: number; unit?: string; location?: Location }
  ) =>
    setFridge((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next: FridgeItem = { ...i, ...patch };
        if (patch.quantity !== undefined) next.estimated = false;
        if (patch.location && patch.location !== i.location) {
          const db = i.ingredientId ? ingredientById(i.ingredientId) : undefined;
          next.expiresAt = Date.now() + shelfDaysFor(db, patch.location, i.category) * DAY_MS;
        }
        return next;
      })
    );

  const removeFromFridge = (id: string) =>
    setFridge((prev) => prev.filter((i) => i.id !== id));

  const clearFridge = () => setFridge([]);

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleCookedDay = (index: number) =>
    setCookedDays((prev) => prev.map((v, i) => (i === index ? !v : v)));

  // Applies the stock changes, marks today in the streak, counts the recipe
  const cookRecipe = (recipeId: string, changes: StockChange[]) => {
    if (changes.length > 0) {
      setFridge((prev) =>
        prev.flatMap((i) => {
          const c = changes.find((x) => x.id === i.id);
          if (!c) return [i];
          if (c.after === null) return [];
          return [{ ...i, quantity: c.after }];
        })
      );
      setUsedCount((c) => c + changes.length);
    }
    setCookedRecipeIds((prev) => (prev.includes(recipeId) ? prev : [...prev, recipeId]));
    setCookedDays((prev) => prev.map((v, i) => (i === todayIndex() ? true : v)));
  };

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        fridge,
        addToFridge,
        addItem,
        updateItem,
        removeFromFridge,
        clearFridge,
        favorites,
        toggleFavorite,
        cookedDays,
        toggleCookedDay,
        cookRecipe,
        usedCount,
        cookedRecipeIds,
        aiRecipes,
        setAiRecipes,
        recipes: [...aiRecipes, ...RECIPES],
        prefs,
        setPrefs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useFridge() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useFridge must be used inside FridgeProvider');
  return ctx;
}