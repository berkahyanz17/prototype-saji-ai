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

// Replace with your laptop's IPv4 address from `ipconfig`
const SERVER_URL = 'http://10.85.77.139:3000';

export async function analyzePhoto(imageBase64: string): Promise<ScanResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${SERVER_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
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
      headers: { 'Content-Type': 'application/json' },
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