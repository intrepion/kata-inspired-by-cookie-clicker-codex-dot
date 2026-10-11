export const LIMIT = 1e100;
export const OFFLINE_MS = 4 * 60 * 60 * 1000;
export const TENDERS = [
  {
    name: "Firefly jar",
    icon: "✦",
    cost: 15,
    rate: 0.5,
    story: "A tiny night shift, paid in wonder.",
  },
  {
    name: "Moss cradle",
    icon: "❧",
    cost: 100,
    rate: 4,
    story: "Soft roots cradle the sleeping light.",
  },
  {
    name: "Lantern grove",
    icon: "♧",
    cost: 600,
    rate: 24,
    story: "Every branch carries a little sunrise.",
  },
  {
    name: "Moon mill",
    icon: "☾",
    cost: 3000,
    rate: 130,
    story: "Turn silver moonbeams into golden glow.",
  },
  {
    name: "Dawn conservatory",
    icon: "☼",
    cost: 15000,
    rate: 700,
    story: "Tomorrow is already blooming here.",
  },
] as const;
export const IMPROVEMENTS = [
  {
    name: "Copper wick",
    cost: 50,
    description: "Gather twice as much per tap.",
    click: 2,
    production: 1,
  },
  {
    name: "Dew lenses",
    cost: 200,
    description: "All tenders gather 50% more.",
    click: 1,
    production: 1.5,
  },
  {
    name: "Woven sunthread",
    cost: 750,
    description: "Gather four times as much per tap.",
    click: 4,
    production: 1,
  },
  {
    name: "Night choir",
    cost: 1800,
    description: "Double all tender production.",
    click: 1,
    production: 2,
  },
  {
    name: "Prismatic glass",
    cost: 6000,
    description: "Double taps and tender production.",
    click: 2,
    production: 2,
  },
  {
    name: "Pocket sunrise",
    cost: 20000,
    description: "Multiply taps by five; double production.",
    click: 5,
    production: 2,
  },
] as const;
export interface State {
  version: 1;
  glow: number;
  run: number;
  lifetime: number;
  clicks: number;
  tenders: number[];
  improvements: boolean[];
  embers: number;
  seasons: number;
  keepsakes: string[];
  savedAt: number;
}
export const fresh = (now = Date.now()): State => ({
  version: 1,
  glow: 0,
  run: 0,
  lifetime: 0,
  clicks: 0,
  tenders: TENDERS.map(() => 0),
  improvements: IMPROVEMENTS.map(() => false),
  embers: 0,
  seasons: 0,
  keepsakes: [],
  savedAt: now,
});
const bounded = (n: number) => Math.min(LIMIT, Math.max(0, n));
export function multiplier(s: State) {
  return 1 + s.embers * 0.1;
}
export function tapValue(s: State) {
  return bounded(
    s.improvements.reduce((n, b, i) => (b ? n * IMPROVEMENTS[i].click : n), 1) *
      multiplier(s),
  );
}
export function rate(s: State) {
  return bounded(
    s.improvements.reduce(
      (n, b, i) => (b ? n * IMPROVEMENTS[i].production : n),
      s.tenders.reduce((n, q, i) => n + q * TENDERS[i].rate, 0),
    ) * multiplier(s),
  );
}
export function tenderCost(s: State, i: number) {
  if (!TENDERS[i] || s.tenders[i] >= 1000) return Infinity;
  return Math.ceil(TENDERS[i].cost * 1.16 ** s.tenders[i]);
}
export function earn(s: State, amount: number) {
  if (!Number.isFinite(amount) || amount < 0) return;
  s.glow = bounded(s.glow + amount);
  s.run = bounded(s.run + amount);
  s.lifetime = bounded(s.lifetime + amount);
  achieve(s);
}
export function gather(s: State) {
  s.clicks = Math.min(1e9, s.clicks + 1);
  earn(s, tapValue(s));
}
export function buyTender(s: State, i: number) {
  const cost = tenderCost(s, i);
  if (s.glow < cost) return false;
  s.glow -= cost;
  s.tenders[i]++;
  achieve(s);
  return true;
}
export function buyImprovement(s: State, i: number) {
  const u = IMPROVEMENTS[i];
  if (!u || s.improvements[i] || s.glow < u.cost) return false;
  s.glow -= u.cost;
  s.improvements[i] = true;
  return true;
}
export const emberReward = (s: State) =>
  Math.min(1e6 - s.embers, Math.floor(Math.sqrt(s.run / 5000)));
export function rekindle(s: State, confirmed: boolean) {
  const reward = emberReward(s);
  if (!confirmed || reward < 1) return false;
  const next = fresh(s.savedAt);
  next.embers = s.embers + reward;
  next.lifetime = s.lifetime;
  next.clicks = s.clicks;
  next.seasons = Math.min(1e6, s.seasons + 1);
  next.keepsakes = [...s.keepsakes];
  Object.assign(s, next);
  achieve(s);
  return true;
}
export const KEEPSAKES = [
  {
    id: "first",
    name: "First light",
    hint: "Gather your first glow.",
    met: (s: State) => s.lifetime >= 1,
  },
  {
    id: "tap",
    name: "Warm hands",
    hint: "Tap the lantern 100 times.",
    met: (s: State) => s.clicks >= 100,
  },
  {
    id: "jar",
    name: "A little company",
    hint: "Welcome your first tender.",
    met: (s: State) => s.tenders.some((n) => n > 0),
  },
  {
    id: "thousand",
    name: "A thousand tiny suns",
    hint: "Gather 1,000 glow across seasons.",
    met: (s: State) => s.lifetime >= 1000,
  },
  {
    id: "grove",
    name: "An orchard of your own",
    hint: "Own 10 tenders at once.",
    met: (s: State) => s.tenders.reduce((a, b) => a + b, 0) >= 10,
  },
  {
    id: "ember",
    name: "Light remembers",
    hint: "Rekindle your first season.",
    met: (s: State) => s.seasons >= 1,
  },
  {
    id: "dawn",
    name: "Hello, tomorrow",
    hint: "Gather 100,000 lifetime glow.",
    met: (s: State) => s.lifetime >= 100000,
  },
];
function achieve(s: State) {
  for (const k of KEEPSAKES)
    if (k.met(s) && !s.keepsakes.includes(k.id)) s.keepsakes.push(k.id);
}
export function advance(s: State, now: number) {
  if (!Number.isFinite(now) || now < 0) return 0;
  const elapsed = Math.min(OFFLINE_MS, Math.max(0, now - s.savedAt));
  const amount = bounded((rate(s) * elapsed) / 1000);
  earn(s, amount);
  s.savedAt = Math.max(now, s.savedAt);
  return amount;
}
const numeric = (x: unknown, max = LIMIT): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= max;
const integer = (x: unknown, max: number): x is number =>
  numeric(x, max) && Number.isInteger(x);
export function decode(raw: string, now: number): State | null {
  try {
    const x: unknown = JSON.parse(raw);
    if (!x || typeof x !== "object") return null;
    const s = x as State;
    if (
      s.version !== 1 ||
      !numeric(s.glow) ||
      !numeric(s.run) ||
      !numeric(s.lifetime) ||
      s.glow > s.run ||
      s.run > s.lifetime ||
      !integer(s.clicks, 1e9) ||
      !integer(s.embers, 1e6) ||
      !integer(s.seasons, 1e6) ||
      !numeric(s.savedAt, 8.64e15)
    )
      return null;
    if (
      !Array.isArray(s.tenders) ||
      s.tenders.length !== TENDERS.length ||
      !s.tenders.every((n) => integer(n, 1000)) ||
      !Array.isArray(s.improvements) ||
      s.improvements.length !== IMPROVEMENTS.length ||
      !s.improvements.every((b) => typeof b === "boolean")
    )
      return null;
    if (
      !Array.isArray(s.keepsakes) ||
      s.keepsakes.length > KEEPSAKES.length ||
      !s.keepsakes.every((id) => KEEPSAKES.some((k) => k.id === id)) ||
      new Set(s.keepsakes).size !== s.keepsakes.length
    )
      return null;
    const clean: State = {
      version: 1,
      glow: s.glow,
      run: s.run,
      lifetime: s.lifetime,
      clicks: s.clicks,
      tenders: [...s.tenders],
      improvements: [...s.improvements],
      embers: s.embers,
      seasons: s.seasons,
      keepsakes: [...s.keepsakes],
      savedAt: s.savedAt,
    };
    advance(clean, now);
    return clean;
  } catch {
    return null;
  }
}
export function format(n: number) {
  if (!Number.isFinite(n)) return "Max";
  if (n >= 1e12) return n.toExponential(2);
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(1) + "k";
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: n < 10 ? 1 : 0,
  }).format(n);
}
