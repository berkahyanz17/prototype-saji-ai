import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DAY_MS,
  SHELF_LIFE_DAYS,
  defaultLocation,
  guessCategory,
  type Category,
  type Location,
} from './foodInfo';
import { DEFAULT_PREFS, sanitizePrefs, type Prefs } from './prefs';
import { RECIPES, type Recipe } from './recipes';

export type FridgeItem = {
  id: string;
  name: string;
  category: Category;
  location: Location;
  expiresAt: number;
  quantity?: number;
  unit?: string;
};

export type NewItem = {
  name: string;
  category: Category;
  location: Location;
  quantity?: number;
  unit?: string;
  expiresAt?: number;
};

// Monday = 0 ... Sunday = 6
export const todayIndex = () => (new Date().getDay() + 6) % 7;

const STORAGE_KEY = 'saji-state-v1';

// Identifies the current week, so the streak resets every Monday
const weekKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - todayIndex());
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

type AppState = {
  fridge: FridgeItem[];
  addToFridge: (names: string[]) => number;
  addItem: (item: NewItem) => boolean;
  removeFromFridge: (id: string) => void;
  clearFridge: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  cookedDays: boolean[];
  toggleCookedDay: (index: number) => void;
  cookRecipe: (recipeId: string, itemIds: string[]) => void;
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
          if (Array.isArray(saved.fridge)) setFridge(saved.fridge);
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
  const addToFridge = (names: string[]) => {
    const existing = new Set(fridge.map((i) => i.name));
    const now = Date.now();
    const toAdd: FridgeItem[] = [];

    names.forEach((raw, index) => {
      const name = raw.trim().toLowerCase();
      if (!name || existing.has(name)) return;
      existing.add(name);
      const category = guessCategory(name);
      toAdd.push({
        id: `${now}-${index}`,
        name,
        category,
        location: defaultLocation(category),
        expiresAt: now + SHELF_LIFE_DAYS[category] * DAY_MS,
      });
    });

    if (toAdd.length > 0) setFridge((prev) => [...prev, ...toAdd]);
    return toAdd.length;
  };

  // Adds one ingredient from the manual form. Returns false if it already exists
  const addItem = (item: NewItem) => {
    const name = item.name.trim().toLowerCase();
    if (!name || fridge.some((i) => i.name === name)) return false;
    const now = Date.now();
    setFridge((prev) => [
      ...prev,
      {
        id: `${now}-m`,
        name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        unit: item.unit,
        expiresAt: item.expiresAt ?? now + SHELF_LIFE_DAYS[item.category] * DAY_MS,
      },
    ]);
    return true;
  };

  const removeFromFridge = (id: string) =>
    setFridge((prev) => prev.filter((i) => i.id !== id));

  const clearFridge = () => setFridge([]);

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleCookedDay = (index: number) =>
    setCookedDays((prev) => prev.map((v, i) => (i === index ? !v : v)));

  // Marks today in the streak, uses up the given fridge items, counts the recipe
  const cookRecipe = (recipeId: string, itemIds: string[]) => {
    if (itemIds.length > 0) {
      setFridge((prev) => prev.filter((i) => !itemIds.includes(i.id)));
      setUsedCount((c) => c + itemIds.length);
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