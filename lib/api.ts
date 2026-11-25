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

// Set in myapp/.env (project root), e.g.
// EXPO_PUBLIC_API_URL=https://something-random.trycloudflare.com
// EXPO_PUBLIC_APP_KEY=same value as APP_KEY in backend/.env
const SERVER_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY ?? '';

async function post(path: string, body: unknown, timeoutMs: number): Promise<Response> {
  if (!SERVER_URL) throw new Error('EXPO_PUBLIC_API_URL is not set');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${SERVER_URL.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-app-key': APP_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzePhoto(imageBase64: string): Promise<ScanResult> {
  const res = await post('/analyze', { imageBase64, mimeType: 'image/jpeg' }, 60000);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return (await res.json()) as ScanResult;
}

export async function generateRecipes(
  ingredients: string[],
  prefs?: Prefs
): Promise<Recipe[]> {
  const res = await post('/recipes', { ingredients, prefs }, 90000);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Server error ${res.status}`);
  }
  const data = await res.json();
  return (data.recipes ?? []) as Recipe[];
}