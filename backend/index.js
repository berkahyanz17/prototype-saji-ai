const express = require('express');

const app = express();

app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '15mb' }));

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const APP_KEY = process.env.APP_KEY; // optional shared secret between the app and this backend
const PORT = Number(process.env.PORT) || 3000;

console.log('Model:', MODEL);
console.log('API key loaded:', KEY ? `yes (${KEY.length} chars)` : 'NO - check backend/.env');
console.log('App key protection:', APP_KEY ? 'ON (x-app-key header required)' : 'OFF');

// If APP_KEY is set, every protected route needs the header "x-app-key: <APP_KEY>"
function requireKey(req, res, next) {
  if (!APP_KEY) return next();
  if (req.get('x-app-key') === APP_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

async function askGemini(parts, timeoutMs, temperature) {
  const started = Date.now();
  const generationConfig = { responseMimeType: 'application/json' };
  if (temperature !== undefined) generationConfig.temperature = temperature;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({ contents: [{ parts }], generationConfig }),
    }
  );
  console.log(`-> Gemini answered: HTTP ${response.status} after ${Date.now() - started} ms`);

  if (!response.ok) {
    console.error('-> Gemini error body:', await response.text());
    const err = new Error('AI request failed');
    err.status = 502;
    throw err;
  }

  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? '')
    .join('');
  console.log('-> Gemini text:', text.slice(0, 200));
  return JSON.parse(text || '{}');
}

const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const UNITS = [
  'g', 'kg', 'ml', 'liter', 'butir', 'siung', 'buah', 'lembar',
  'potong', 'batang', 'ikat', 'bungkus', 'sdm', 'sdt', 'ruas',
];

function cleanPrefs(p) {
  const prefs = p && typeof p === 'object' ? p : {};
  return {
    cuisine: typeof prefs.cuisine === 'string' ? prefs.cuisine.trim().slice(0, 60) : '',
    maxMinutes: num(prefs.maxMinutes),
    budget: num(prefs.budget),
    equipment: Array.isArray(prefs.equipment)
      ? prefs.equipment
          .map((e) => String(e).trim().slice(0, 30))
          .filter(Boolean)
          .slice(0, 12)
      : [],
  };
}

const ANALYZE_PROMPT = `You are the ingredient detector of an Indonesian cooking app. Look at the photo.
1. "authenticity": "real" if the photo shows real physical food items; "screen" if it shows a computer or phone screen or monitor (visible pixels, bezels, interface elements, moire); "print" if it shows a printed picture, poster, magazine page or drawing; "unclear" if you cannot tell or the photo is too dark or blurry.
2. "items": list ONLY food items you can clearly see that are usable as cooking ingredients: raw ingredients, or packaged food used in cooking (instant noodles, sauces, cooking oil, flour). Use common Indonesian names in lowercase (telur, tomat, bawang merah, kecap manis, mie instan). Ignore drinks, bottled water, coffee or tea sachets, empty packaging, cutlery, containers, and anything you cannot identify with confidence. NEVER guess hidden items. "count" is the number of whole items visible for countable items (eggs, tomatoes, onions), otherwise null.
Respond ONLY with JSON in exactly this shape: {"authenticity":"real","items":[{"name":"telur","count":2}]}
If no food is visible, return an empty items array.`;

const recipePrompt = (list, prefs) => {
  const cuisine =
    prefs.cuisine && prefs.cuisine !== 'Apa saja'
      ? prefs.cuisine
      : 'bebas (masakan rumahan apa saja)';
  const lines = [
    `- Gaya masakan: ${cuisine}`,
    prefs.maxMinutes
      ? `- Waktu memasak maksimal: ${prefs.maxMinutes} menit`
      : '- Waktu memasak: bebas',
    prefs.budget
      ? `- Anggaran maksimal: Rp${prefs.budget} per porsi (total biaya semua bahan, termasuk yang sudah dimiliki)`
      : '- Anggaran: bebas',
    prefs.equipment.length
      ? `- Peralatan yang dimiliki: ${prefs.equipment.join(', ')}. Hanya gunakan peralatan ini, jangan butuh alat lain.`
      : '- Peralatan: bebas',
  ];

  return `Kamu adalah asisten masak rumahan Indonesia. Bahan yang dimiliki pengguna:
${list.join(', ')}

Preferensi pengguna (wajib dipatuhi):
${lines.join('\n')}

Buat 5 resep masakan rumahan yang NYATA dan sudah umum dimasak orang, memakai sebanyak mungkin bahan di atas. Boleh menambah bahan lain, tapi maksimal 4 bahan tambahan (selain bumbu dapur dasar) per resep. Jangan mengarang masakan atau bahan fiktif. Urutkan dari yang paling cocok dengan bahan pengguna. Tulis semua dalam bahasa Indonesia, untuk 1 porsi.
Aturan:
- "fromFridge": isi dengan TEPAT SALAH SATU nama dari daftar bahan di atas jika bahan itu berasal dari situ; jika tidak, isi null.
- "staple": true hanya untuk bahan dapur dasar (garam, minyak goreng, gula, air, merica); selain itu false.
- "qty": angka lebih dari 0. "unit": HARUS salah satu dari: g, kg, ml, liter, butir, siung, buah, lembar, potong, batang, ikat, bungkus, sdm, sdt. Jangan pakai "secukupnya".
- Nilai gizi adalah perkiraan per porsi: kalori (kkal), protein, karbohidrat, lemak, serat, gula (gram), natrium (mg).
- "cost": perkiraan total biaya bahan per porsi dalam rupiah (angka saja).
- 4 sampai 7 langkah memasak yang singkat dan jelas.
Balas HANYA dengan JSON persis berbentuk:
{"recipes":[{"name":"","emoji":"","minutes":0,"servings":1,"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"sodium":0,"cost":0,"ingredients":[{"name":"","qty":0,"unit":"","fromFridge":null,"staple":false}],"steps":[""]}]}`;
};

function normalizeRecipes(parsed, ingredientList) {
  const allowed = new Set(ingredientList.map((n) => n.toLowerCase()));
  const seen = new Set();
  const list = Array.isArray(parsed?.recipes) ? parsed.recipes : [];

  return list
    .map((r, i) => {
      const name = String(r?.name ?? '').trim();
      if (!name) return null;

      const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : [])
        .map((x) => {
          const from = x?.fromFridge ? String(x.fromFridge).toLowerCase().trim() : '';
          const qty = Math.round(Number(x?.qty) * 100) / 100;
          const unit = String(x?.unit ?? '').toLowerCase().trim();
          return {
            name: String(x?.name ?? '').trim(),
            amount: qty > 0 && UNITS.includes(unit) ? `${qty} ${unit}` : 'secukupnya',
            keywords: from && allowed.has(from) ? [from] : [],
            staple: Boolean(x?.staple),
          };
        })
        .filter((x) => x.name);

      const steps = (Array.isArray(r.steps) ? r.steps : [])
        .map((s) => String(s).trim())
        .filter(Boolean);

      if (ingredients.length === 0 || steps.length === 0) return null;

      // Guardrails: the recipe must really use the fridge, with few extra ingredients
      const fromFridgeCount = ingredients.filter((x) => x.keywords.length > 0).length;
      const missing = ingredients.filter((x) => x.keywords.length === 0 && !x.staple).length;
      if (fromFridgeCount === 0 || missing > 4) return null;

      const id = `ai-${slug(name) || i}`;
      if (seen.has(id)) return null;
      seen.add(id);

      const emoji = String(r.emoji ?? '').trim();
      return {
        id,
        name,
        emoji: emoji && emoji.length <= 8 ? emoji : '🍽️',
        minutes: num(r.minutes) || 15,
        servings: num(r.servings) || 1,
        calories: num(r.calories),
        protein: num(r.protein),
        carbs: num(r.carbs),
        fat: num(r.fat),
        fiber: num(r.fiber),
        sugar: num(r.sugar),
        sodium: num(r.sodium),
        cost: num(r.cost) || undefined,
        ingredients,
        steps,
      };
    })
    .filter(Boolean);
}

// Health check (public, no key needed)
app.get('/', (_req, res) => res.send('ok'));

app.get('/models', requireKey, async (_req, res) => {
  try {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',
      { headers: { 'x-goog-api-key': KEY } }
    );
    const data = await r.json();
    const names = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => m.name.replace('models/', ''));
    res.json(names);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/analyze', requireKey, async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
    if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });

    console.log(`-> image received: ${Math.round(imageBase64.length / 1024)} KB`);
    const parsed = await askGemini(
      [{ text: ANALYZE_PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }],
      45000,
      0.2
    );

    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const seen = new Set();
    const ingredients = [];
    const counts = {};
    for (const it of items.slice(0, 30)) {
      const name = String(it?.name ?? '').trim().toLowerCase().slice(0, 40);
      if (!name || seen.has(name)) continue;
      seen.add(name);
      ingredients.push(name);
      const c = Math.round(Number(it?.count));
      if (Number.isFinite(c) && c >= 1 && c <= 99) counts[name] = c;
    }
    const authenticity = ['real', 'screen', 'print', 'unclear'].includes(parsed.authenticity)
      ? parsed.authenticity
      : 'unclear';

    console.log(`-> done: ${ingredients.length} ingredients, authenticity=${authenticity}`);
    res.json({ ingredients, counts, authenticity, dishes: [] });
  } catch (err) {
    console.error('-> ERROR:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

app.post('/recipes', requireKey, async (req, res) => {
  try {
    const raw = Array.isArray(req.body?.ingredients) ? req.body.ingredients : [];
    const ingredients = raw.map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
    if (ingredients.length === 0) {
      return res.status(400).json({ error: 'ingredients is required' });
    }
    if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });

    const prefs = cleanPrefs(req.body?.prefs);
    console.log(`-> recipes for: ${ingredients.join(', ')}`);
    console.log('-> preferences:', JSON.stringify(prefs));

    const parsed = await askGemini([{ text: recipePrompt(ingredients, prefs) }], 60000);
    let recipes = normalizeRecipes(parsed, ingredients);

    // Keep only recipes within the time and budget limits (if any recipe fits)
    const matching = recipes.filter(
      (r) =>
        (!prefs.maxMinutes || r.minutes <= prefs.maxMinutes) &&
        (!prefs.budget || !r.cost || r.cost <= prefs.budget)
    );
    if (matching.length > 0) recipes = matching;

    console.log(`-> done: ${recipes.length} recipes (${matching.length} match preferences)`);
    res.json({ recipes });
  } catch (err) {
    console.error('-> ERROR:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// Catches errors like "payload too large" before the routes run
app.use((err, _req, res, _next) => {
  console.error('-> MIDDLEWARE ERROR:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));