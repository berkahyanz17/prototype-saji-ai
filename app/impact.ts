export type Impact = {
  since: number;
  cookCount: number;
  usedGrams: number; // stock cooked via "Selesai memasak"
  rescuedGrams: number; // part of that cooked 2 days or less before expiry (or after)
  rescuedItems: number;
  wastedGrams: number; // expired items thrown away
  wastedItems: number;
};

export const newImpact = (): Impact => ({
  since: Date.now(),
  cookCount: 0,
  usedGrams: 0,
  rescuedGrams: 0,
  rescuedItems: 0,
  wastedGrams: 0,
  wastedItems: 0,
});

const n = (v: unknown) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);

export function sanitizeImpact(raw: unknown): Impact {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<Impact>;
  return {
    since: typeof p.since === 'number' && p.since > 0 ? p.since : Date.now(),
    cookCount: n(p.cookCount),
    usedGrams: n(p.usedGrams),
    rescuedGrams: n(p.rescuedGrams),
    rescuedItems: n(p.rescuedItems),
    wastedGrams: n(p.wastedGrams),
    wastedItems: n(p.wastedItems),
  };
}

export function formatMass(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1).replace('.', ',')} kg`;
  return `${Math.round(grams)} g`;
}

// Thrown away, out of everything used or thrown away. Null until there is data.
export function wasteRate(i: Impact): number | null {
  const total = i.usedGrams + i.wastedGrams;
  return total > 0 ? Math.round((i.wastedGrams / total) * 100) : null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} · ${hh}:${mm}`;
};