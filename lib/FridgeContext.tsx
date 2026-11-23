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
  findIngredient,
  ingredientById,
  shelfDaysFor,
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

// Monday = 0 ... Sunday = 6
export const todayIndex = () => (new Date().getDay() + 6) % 7;

const STORAGE_KEY = 'saji-state-v1';

// Identifies the current week, so the streak resets every Monday
const weekKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - todayIndex());
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// Gives items saved by older versions an ingredient link and a starting quantity
const migrate = (item: FridgeItem): FridgeItem => {
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

type AppState = {
  fridge: FridgeItem[];
  addToFridge: (items: ScannedItem[]) => number;
  addItem: (item: NewItem) => boolean;
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

  // Adds scanned ingredients, skips duplicates, returns how many were added
  const addToFridge = (items: ScannedItem[]) => {
    const names = new Set(fridge.map((i) => i.name));
    const ids = new Set(
      fridge.map((i) => i.ingredientId).filter((x): x is string => !!x)
    );
    const now = Date.now();
    const toAdd: FridgeItem[] = [];

    items.forEach((item, index) => {
      const raw = item.name.trim().toLowerCase();
      if (!raw) return;

      const db = findIngredient(raw);
      const name = db ? db.name : raw;
      if (names.has(name) || (db && ids.has(db.id))) return;
      names.add(name);
      if (db) ids.add(db.id);

      const category = db ? db.category : guessCategory(raw);
      const location = db ? db.location : defaultLocation(category);
      // A visible count is a real measurement for countable units (butir, buah, ...)
      const counted =
        !!db &&
        item.count !== undefined &&
        item.count > 0 &&
        db.unit !== 'g' &&
        db.unit !== 'ml';

      toAdd.push({
        id: `${now}-${index}`,
        name,
        ingredientId: db?.id,
        category,
        location,
        expiresAt: now + shelfDaysFor(db, location, category) * DAY_MS,
        quantity: counted ? item.count : db?.qty,
        unit: db?.unit,
        estimated: db ? !counted : undefined,
      });
    });

    if (toAdd.length > 0) setFridge((prev) => [...prev, ...toAdd]);
    return toAdd.length;
  };

  // Adds one ingredient from the manual form. Returns false if it already exists
  const addItem = (item: NewItem) => {
    const raw = item.name.trim().toLowerCase();
    if (!raw) return false;
    const db = findIngredient(raw);
    const name = db ? db.name : raw;
    if (fridge.some((i) => i.name === name || (db && i.ingredientId === db.id))) return false;

    const now = Date.now();
    const hasQty = item.quantity !== undefined;
    setFridge((prev) => [
      ...prev,
      {
        id: `${now}-m`,
        name,
        ingredientId: db?.id,
        category: item.category,
        location: item.location,
        quantity: hasQty ? item.quantity : db?.qty,
        unit: hasQty ? item.unit : db?.unit,
        estimated: !hasQty && !!db ? true : undefined,
        expiresAt:
          item.expiresAt ?? now + shelfDaysFor(db, item.location, item.category) * DAY_MS,
      },
    ]);
    return true;
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