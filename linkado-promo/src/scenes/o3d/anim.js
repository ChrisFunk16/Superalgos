// ============================================================
// Animations-Werkzeuge für das 3D-Büro: Easing, Keyframe-Spuren, deterministische Nebenbewegung (Atmen, Blinzeln, Blickwechsel, Sprechen).
// Alles ist eine reine Funktion der Zeit t (keine Zufallszahlen ohne Seed, kein Zustand).
// ============================================================
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => (b === a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));

/** Easings: Eingang p in 0..1 */
export const ez = {
  lin: (p) => p,
  in2: (p) => p * p, out2: (p) => 1 - (1 - p) ** 2, out3: (p) => 1 - (1 - p) ** 3,
  io2: (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
  io3: (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2),
  smooth: (p) => p * p * (3 - 2 * p),
  /** weiches Überschwingen (Nachschwingen der Arme) */
  back: (p, s = 1.2) => { const c = s + 1; return 1 + c * (p - 1) ** 3 + s * (p - 1) ** 2; },
  /** schnell hinein, kleines Federn */
  spring: (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.exp(-7.5 * p) * Math.cos(9.5 * p)),
};

/** Spur aus Schlüsselbildern: keys = [[t, wert, easing?], …]; Wert = Zahl oder Array; das Easing gilt für das Segment, das bei diesem Schlüssel BEGINNT. */
export function track(keys) {
  const isArr = Array.isArray(keys[0][1]);
  return (t) => {
    if (t <= keys[0][0]) return isArr ? keys[0][1].slice() : keys[0][1];
    const n = keys.length;
    if (t >= keys[n - 1][0]) return isArr ? keys[n - 1][1].slice() : keys[n - 1][1];
    let i = 0; while (i < n - 2 && t >= keys[i + 1][0]) i++;
    const [t0, v0, e0] = keys[i], [t1, v1] = keys[i + 1];
    const p = (e0 || ez.io2)(prog(t, t0, t1));
    return isArr ? v0.map((x, k) => lerp(x, v1[k], p)) : lerp(v0, v1, p);
  };
}

/** Hash → 0..1 */
export function hash(i, seed = 0) { let x = Math.imul(i + 1, 374761393) ^ Math.imul(seed + 7, 668265263); x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; }
/** weiches Wertrauschen −1..1 (Frequenz in Hz) */
export function noise(t, seed = 0, f = 1) {
  const x = t * f, i = Math.floor(x), p = ez.smooth(x - i);
  return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, p);
}

/** Blinzeln 0..1 (1 = Auge zu): alle 2,4–5,2 s, manchmal doppelt; Dauer ≈ 0,16 s */
export function blink(t, seed = 0) {
  let acc = hash(0, seed) * 2.2, k = 0;
  while (acc < t + 6 && k < 400) {
    const gap = 2.4 + hash(k + 1, seed) * 2.8, dbl = hash(k + 50, seed) > 0.78;
    const d = t - acc;
    if (d >= 0 && d < 0.17) return Math.sin(Math.PI * d / 0.17) ** 0.8;
    if (dbl && d >= 0.3 && d < 0.47) return Math.sin(Math.PI * (d - 0.3) / 0.17) ** 0.8;
    if (d < 0) break;
    acc += gap; k++;
  }
  return 0;
}

/** Blickwechsel: kleine Sakkaden (alle 0,7–1,9 s ein neuer Punkt, in 70 ms überblendet), Ergebnis in −1..1 (x, y) */
export function saccade(t, seed = 0, amp = 0.35) {
  let acc = 0, k = 0, px = 0, py = 0;
  const pt = (n) => [(hash(n, seed + 3) * 2 - 1) * amp, (hash(n, seed + 9) * 2 - 1) * amp * 0.6];
  let cur = pt(0);
  while (k < 600) {
    const gap = 0.7 + hash(k + 11, seed) * 1.2, next = pt(k + 1);
    if (t < acc + gap) return [cur[0], cur[1]];
    if (t < acc + gap + 0.07) { const p = ez.smooth((t - acc - gap) / 0.07); return [lerp(cur[0], next[0], p), lerp(cur[1], next[1], p)]; }
    acc += gap + 0.07; cur = next; k++;
  }
  return [px, py];
}

/** Sprechen: Silbenfolge (0,13–0,3 s) mit Pausen; liefert Mundöffnung 0..1 und Nick-Impuls −1..1 im Zeitfenster [t0, t1]; calm = ruhiger (weniger Öffnung, längere Silben) */
export function talk(t, t0, t1, seed = 0, calm = false) {
  if (t < t0 || t > t1) return { open: 0, nod: 0, emph: 0 };
  let u = t0, k = 0;
  while (u < t1 && k < 500) {
    const len = (calm ? 0.2 : 0.14) + hash(k, seed) * (calm ? 0.2 : 0.16), amp = 0.35 + hash(k + 20, seed) * 0.65;
    const pause = hash(k + 40, seed) > 0.8 ? 0.18 + hash(k + 60, seed) * 0.32 : 0.02;
    if (t < u + len) { const ph = (t - u) / len; return { open: amp * Math.sin(Math.PI * ph) ** 0.7 * (calm ? 0.7 : 1), nod: (amp > 0.85 ? Math.sin(Math.PI * ph) : 0.25 * Math.sin(Math.PI * ph)), emph: amp > 0.85 ? 1 : 0 }; }
    u += len; if (t < u + pause) return { open: 0, nod: 0, emph: 0 };
    u += pause; k++;
  }
  return { open: 0, nod: 0, emph: 0 };
}

/** Kritisch gedämpfte Verzögerung eines Signals: f(t) wird über ein Fenster geglättet (für Nachschwingen von Haaren); f muss eine reine Funktion sein */
export function lag(f, t, tau = 0.14, n = 6) {
  let s = 0, w = 0;
  for (let i = 0; i < n; i++) { const d = (i / (n - 1)) * tau * 2.2, wi = Math.exp(-d / tau); s += f(t - d) * wi; w += wi; }
  return s / w;
}

/** Wert aus Liste von Schlüsselbild-Gruppen pro Beat: nützlich für Gewichte (0..1) */
export function pulse(t, a, b, c, d, e1 = ez.io2, e2 = ez.io2) { return e1(prog(t, a, b)) * (1 - e2(prog(t, c, d))); }
