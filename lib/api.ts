import type { Prefs } from './prefs';
import type { Recipe } from './recipes';

export type Dish = {
  id: string;
  name: string;
  minutes: number;
  calories: number;
  uses: string[];
};

export type ScanResult = {
  ingredients: string[];
  counts?: Record<string, number>;
  authenticity?: 'real' | 'screen' | 'print' | 'unclear';
  dishes: Dish[];
};

const SERVER_URL = 'https://api.healthsync.biz.id';
// Must match APP_TOKEN in backend/.env. It deters casual abuse, but anyone can extract it from the app.
const APP_TOKEN = '3705f85fb743718966d2505bb06e95fdb71141204a4d1fae';

const headers = {
  'Content-Type': 'application/json',
  'x-app-token': APP_TOKEN,
};

export async function analyzePhoto(imageBase64: string): Promise<ScanResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${SERVER_URL}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? `Server error ${res.status}`);
    }
    return (await res.json()) as ScanResult;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateRecipes(
  ingredients: string[],
  prefs?: Prefs
): Promise<Recipe[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const res = await fetch(`${SERVER_URL}/recipes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ingredients, prefs }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? `Server error ${res.status}`);
    }
    const data = await res.json();
    return (data.recipes ?? []) as Recipe[];
  } finally {
    clearTimeout(timer);
  }
}