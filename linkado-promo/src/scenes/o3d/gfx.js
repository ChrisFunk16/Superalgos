// ============================================================
// Grafik-Werkzeuge für das 3D-Büro: deterministische Rauschfunktionen, prozedurale Texturen (Holz, Teppich, Beton, Stoff, Stadt bei Nacht …),
// Material-Fabrik und der „Höhenfeld-AO“-Shader (weiche Kontaktschatten aus einer Draufsicht-Höhenkarte, eine Handvoll Texturabrufe pro Pixel).
// Alles ohne Zufall (Seeds) → jedes Bild ist reproduzierbar.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { RoundedBoxGeometry } from '../../vendor/examples/jsm/geometries/RoundedBoxGeometry.js';

export const V3 = THREE.Vector3;
const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);

/* ---------------------------------------------------------------- Zufall & Rauschen */
export function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function ihash(x, y, s) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/** Wertrauschen 0..1; px/py = Periode in Gitterzellen (0 = nicht kachelbar) */
export function vnoise(x, y, px = 0, py = 0, seed = 0) {
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const w = (i, p) => (p ? ((i % p) + p) % p : i);
  const a = ihash(w(x0, px), w(y0, py), seed), b = ihash(w(x0 + 1, px), w(y0, py), seed), c = ihash(w(x0, px), w(y0 + 1, py), seed), d = ihash(w(x0 + 1, px), w(y0 + 1, py), seed);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x, y, oct = 4, px = 0, py = 0, seed = 0, gain = 0.5) {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let o = 0; o < oct; o++) { s += a * vnoise(x * f, y * f, px * f, py * f, seed + o * 17); n += a; a *= gain; f *= 2; }
  return s / n;
}
export const hex = (c) => { const t = new THREE.Color(c); return [t.r * 255, t.g * 255, t.b * 255]; };   // sRGB-Bytes
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* ---------------------------------------------------------------- Texturen */
/** Pixel-Texturen: fn(u,v,x,y) → [r,g,b] (0..255); liefert Canvas */
export function pixCanvas(w, h, fn) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); const im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x / w, y / h, x, y), i = (y * w + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = c[3] ?? 255; }
  g.putImageData(im, 0, 0); return cv;
}
export function toTex(cv, { repeat, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(cv); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = aniso; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
export function drawTex(w, h, draw, opt) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); return toTex(cv, opt); }

/** Holz (längs x gemasert): helle/dunkle Farbe, Maserung, Poren → { map, bump } */
export function woodTextures({ light = '#D9B98E', dark = '#B98F5E', seed = 3, w = 1024, h = 512, rings = 9, repeat } = {}) {
  const L = hex(light), D = hex(dark); const hh = new Float32Array(w * h);
  const map = pixCanvas(w, h, (u, v, x, y) => {
    const warp = fbm(u * 3, v * 5, 3, 3, 5, seed) * 2.4;
    const ring = Math.sin((v * rings + warp) * Math.PI * 2) * 0.5 + 0.5;
    const streak = fbm(u * 2.0, v * 60, 3, 2, 60, seed + 5);
    const pores = vnoise(u * 220, v * 26, 220, 26, seed + 9);
    let t = 0.25 + ring * 0.28 + streak * 0.45 + (pores > 0.82 ? 0.14 : 0);
    hh[y * w + x] = streak * 0.6 + (pores > 0.82 ? 0.5 : 0) + ring * 0.2;
    return mix3(L, D, clamp(t));
  });
  const bump = pixCanvas(w, h, (u, v, x, y) => { const k = clamp(hh[y * w + x]) * 255; return [k, k, k]; });
  return { map: toTex(map, { repeat }), bump: toTex(bump, { repeat, srgb: false }) };
}
/** Teppichfliese: Faser-Rauschen + feine Fugen alle 0,5 m (die Textur deckt 1 m ab, 2 × 2 Fliesen) */
export function carpetTextures({ color = '#4A5068', seed = 7, w = 512, h = 512, repeat, seam = 0.55, fiber = 0.17, tiles = 2 } = {}) {
  const C = hex(color);
  const bumpData = new Float32Array(w * h);
  const map = pixCanvas(w, h, (u, v, x, y) => {
    const n = vnoise(u * 180, v * 180, 180, 180, seed), m = fbm(u * 6, v * 6, 3, 6, 6, seed + 3);
    const tx = (u * tiles) % 1, ty = (v * tiles) % 1, e = Math.min(tx, 1 - tx, ty, 1 - ty), sm = e < 0.012 ? seam : 1;
    const tint = 0.9 + (m - 0.5) * 0.28 + (n - 0.5) * fiber * 2;
    bumpData[y * w + x] = n * 0.7 + (e < 0.012 ? -0.4 : 0);
    return [C[0] * tint * sm, C[1] * tint * sm, C[2] * tint * sm];
  });
  const bump = pixCanvas(w, h, (u, v, x, y) => { const k = clamp(bumpData[y * w + x] * 0.8 + 0.2) * 255; return [k, k, k]; });
  return { map: toTex(map, { repeat }), bump: toTex(bump, { repeat, srgb: false }) };
}
/** Beton / Estrich: weiche Wolken + Körnung */
export function concreteTextures({ color = '#8A8F9E', seed = 11, w = 512, h = 512, repeat, contrast = 0.2 } = {}) {
  const C = hex(color); const bd = new Float32Array(w * h);
  const map = pixCanvas(w, h, (u, v, x, y) => {
    const a = fbm(u * 4, v * 4, 5, 4, 4, seed), g = vnoise(u * 300, v * 300, 300, 300, seed + 2), s = vnoise(u * 90, v * 90, 90, 90, seed + 4);
    const t = 1 + (a - 0.5) * contrast * 2 + (g - 0.5) * 0.06 + (s > 0.93 ? -0.1 : 0);
    bd[y * w + x] = a * 0.4 + g * 0.5;
    return [C[0] * t, C[1] * t, C[2] * t];
  });
  const bump = pixCanvas(w, h, (u, v, x, y) => { const k = clamp(bd[y * w + x]) * 255; return [k, k, k]; });
  return { map: toTex(map, { repeat }), bump: toTex(bump, { repeat, srgb: false }) };
}
/** Parkett (Fischgrät-ähnlich, einfache Dielen mit Versatz) */
export function plankTextures({ light = '#C99A66', dark = '#A47445', seed = 21, w = 1024, h = 1024, repeat, planks = 8 } = {}) {
  const L = hex(light), D = hex(dark); const bd = new Float32Array(w * h);
  const map = pixCanvas(w, h, (u, v, x, y) => {
    const row = Math.floor(v * planks), off = ihash(row, 0, seed) , lu = (u * 2 + off) % 1, seg = Math.floor(u * 2 + off);
    const idv = ihash(row, seg, seed + 1), fy = (v * planks) % 1;
    const grain = fbm(lu * 3 + idv * 9, v * planks * 40, 3, 0, 0, seed + 7), edge = Math.min(fy, 1 - fy) < 0.02 || Math.min(lu, 1 - lu) < 0.004;
    const t = clamp(0.2 + idv * 0.55 + grain * 0.35);
    bd[y * w + x] = edge ? 0 : 0.5 + grain * 0.4;
    const c = mix3(L, D, t); const k = edge ? 0.45 : 1; return [c[0] * k, c[1] * k, c[2] * k];
  });
  const bump = pixCanvas(w, h, (u, v, x, y) => { const k = clamp(bd[y * w + x]) * 255; return [k, k, k]; });
  return { map: toTex(map, { repeat }), bump: toTex(bump, { repeat, srgb: false }) };
}
/** Strick-/Webmuster (Bump) für Stoffe: kachelbar */
export function weaveBump({ w = 256, h = 256, cells = 48, repeat } = {}) {
  const cv = pixCanvas(w, h, (u, v) => { const a = Math.sin(u * cells * Math.PI * 2) * 0.5 + 0.5, b = Math.sin(v * cells * Math.PI * 2) * 0.5 + 0.5, k = (Math.abs(a - b) * 0.55 + vnoise(u * 120, v * 120, 120, 120, 3) * 0.45) * 255; return [k, k, k]; });
  return toTex(cv, { repeat, srgb: false });
}

/** Wolken-Maske (weich, kachelbar) für Teppich-Aufhellungen u. a. */
export function cloudTexture({ w = 256, h = 256, seed = 5, freq = 3, repeat } = {}) { return toTex(pixCanvas(w, h, (u, v) => { const k = fbm(u * freq, v * freq, 4, freq, freq, seed) * 255; return [k, k, k]; }), { repeat, srgb: false }); }

/** Weiche Flecken (Kontaktschatten, Lichtpfützen): radialer Verlauf */
export function blobTexture(size = 128, inner = 0.0, power = 2.0) {
  return toTex(pixCanvas(size, size, (u, v) => { const d = Math.hypot(u - 0.5, v - 0.5) * 2, k = clamp(1 - (d - inner) / (1 - inner)); const a = Math.pow(k, power) * 255; return [0, 0, 0, a]; }), { srgb: true });
}

/** Stadt bei Nacht (Fensterband): Verlauf, Skyline in drei Ebenen, beleuchtete Fenster, Straßenlichter als Bokeh-Punkte */
export function cityTexture({ w = 2048, h = 512, seed = 5 } = {}) {
  const r = mulberry(seed), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0B1330'); gr.addColorStop(0.55, '#243366'); gr.addColorStop(0.85, '#5C5F96'); gr.addColorStop(1, '#8A7FA8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.5})`; g.fillRect(r() * w, r() * h * 0.45, 1.5 + r() * 1.5, 1.5 + r() * 1.5); }
  const layers = [['#1B2450', 0.55, 40, 130, 0.35], ['#141C42', 0.72, 50, 170, 0.5], ['#0E1535', 0.9, 60, 230, 0.7]];
  for (const [col, base, wMin, hMax, lit] of layers) {
    let x = -20; while (x < w) {
      const bw = wMin + r() * 70, bh = 60 + r() * hMax, y0 = h * base + (1 - base) * 0 - bh * 0 + 0; const top = h * 0.98 - bh * (0.7 + base * 0.6);
      g.fillStyle = col; g.fillRect(x, top, bw, h - top);
      for (let wy = top + 8; wy < h - 10; wy += 13) for (let wx = x + 6; wx < x + bw - 9; wx += 12) if (r() < lit * 0.5) { g.fillStyle = r() < 0.7 ? 'rgba(255,214,140,.88)' : 'rgba(170,205,255,.8)'; g.fillRect(wx, wy, 5.5, 7); }
      x += bw + 3 + r() * 10;
    }
  }
  for (let i = 0; i < 90; i++) { const x = r() * w, y = h * (0.78 + r() * 0.2); const rad = 3 + r() * 9; const gg = g.createRadialGradient(x, y, 0, x, y, rad); const c = r() < 0.6 ? '255,196,120' : '255,120,110'; gg.addColorStop(0, `rgba(${c},.9)`); gg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
  return toTex(cv, { aniso: 4 });
}

/** Whiteboard / Papier / Haftnotizen / Tastatur usw. – kleine gemalte Texturen */
export const paperTex = (lines = 9, color = '#F7F4EC', ink = 'rgba(40,50,80,.35)') => drawTex(256, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); g.strokeStyle = ink; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < lines; i++) { g.beginPath(); g.moveTo(22, 32 + i * 22); g.lineTo(22 + 120 + ((i * 53) % 100), 32 + i * 22); g.stroke(); } });
export const noteTex = (col) => drawTex(64, 64, (g) => { g.fillStyle = col; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(10, 16 + i * 11); g.lineTo(10 + 30 + (i % 2) * 12, 16 + i * 11); g.stroke(); } });
export function keyboardTex(base = '#2B3042', cap = '#E9ECF2', letters = true) {
  const tex = drawTex(512, 192, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const rows = [14, 14, 13, 12, 8]; let y = 14; const kh = 28;
    rows.forEach((n, ri) => { const off = [0, 8, 14, 20, 60][ri] ; const kw = (w - 28 - off) / n; for (let i = 0; i < n; i++) { const kk = ri === 4 && i === 3 ? kw * 3.6 : kw; const x = 14 + off + i * kw; if (ri === 4 && i > 3) break; g.fillStyle = cap; g.beginPath(); g.roundRect(x + 1.5, y, kk - 3, kh - 3, 5); g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.roundRect(x + 4, y + 3, kk - 9, kh - 11, 3); g.fill(); } y += kh + 4; });
  });
  return tex;
}

/* ---------------------------------------------------------------- Geometrie-Helfer */
export const rbox = (w, h, d, r = 0.01, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
/** Mesh anlegen und zur Elterngruppe hinzufügen */
export function put(parent, geo, mat, x = 0, y = 0, z = 0, cast = true, recv = true) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m; }

/* ---------------------------------------------------------------- Material-Fabrik */
export const std = (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
export const phys = (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, ...extra });
/** günstiges, mattes Material (nur diffus) für große Flächen: Boden, Wände, Teppiche, Polster */
export const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
/** weißer, weicher Leuchtfleck (additiv verwenden) */
export function glowTexture(size = 128, power = 2.0) { return toTex(pixCanvas(size, size, (u, v) => { const d = Math.hypot(u - 0.5, v - 0.5) * 2, k = Math.pow(Math.max(0, 1 - d), power); return [255, 255, 255, k * 255]; }), { srgb: true, aniso: 1 }); }

/* ---------------------------------------------------------------- Höhenfeld-AO */
/** gemeinsame Uniform-Objekte (werden von allen Materialien geteilt) */
export const AO = {
  uHF: { value: null }, uHFRect: { value: new THREE.Vector4(0, 0, 1, 1) }, uHFInfo: { value: new THREE.Vector2(1, 1) }, uAOk: { value: 1.0 }, uAOon: { value: 1.0 },
};
const AO_GLSL = /* glsl */`
  uniform sampler2D uHF; uniform vec4 uHFRect; uniform vec2 uHFInfo; uniform float uAOk; uniform float uAOon;
  varying vec3 vHWP; varying vec3 vHWN;
  float hfAO(vec3 P, vec3 N){
    // Höhenkarte (Draufsicht, Meter): mittlere Höhe der Umgebung bei wachsenden Radien → verdeckt = Umgebung höher als dieser Punkt
    float occ = 0.0;
    float radii[4]; radii[0] = 0.07; radii[1] = 0.2; radii[2] = 0.55; radii[3] = 1.4;
    float wts[4];   wts[0] = 0.5;  wts[1] = 0.8; wts[2] = 0.7; wts[3] = 0.5;
    float up = clamp(N.y * 0.5 + 0.5, 0.0, 1.0);
    for (int i = 0; i < 4; i++) {
      float r = radii[i];
      vec2 pxz = P.xz + N.xz * r * 0.9;
      vec2 uv = vec2((pxz.x - uHFRect.x) * uHFRect.z, 1.0 - (pxz.y - uHFRect.y) * uHFRect.w);
      float lod = log2(max(r * uHFInfo.x, 1.0)) ;               // Texel pro Meter in x
      float H = textureLod(uHF, uv, lod).r;
      float d = max(H - (P.y + 0.015), 0.0);
      occ += wts[i] * (1.0 - exp(-d / (r * 0.9 + 0.1)));
    }
    return clamp(1.0 - occ * 0.42 * uAOk, 0.0, 1.0);
  }
`;
/** Material um Höhenfeld-AO erweitern (nur für statische Weltmaterialien) */
export function withHeightAO(mat) {
  if (mat.userData.hao) return mat; mat.userData.hao = true;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    Object.assign(sh.uniforms, AO);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vHWP; varying vec3 vHWN;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        { vec4 hwp = vec4(transformed, 1.0); vec3 hn = objectNormal;
          #ifdef USE_INSTANCING
            hwp = instanceMatrix * hwp; hn = mat3(instanceMatrix) * hn;
          #endif
          vHWP = (modelMatrix * hwp).xyz; vHWN = normalize(mat3(modelMatrix) * hn); }`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + AO_GLSL)
      .replace('#include <aomap_fragment>', `#include <aomap_fragment>
        { float hao = mix(1.0, hfAO(vHWP, normalize(vHWN)), uAOon);
          reflectedLight.indirectDiffuse *= hao; reflectedLight.indirectSpecular *= mix(1.0, hao, 0.7); reflectedLight.directDiffuse *= mix(1.0, hao, 0.45); }`);
  };
  mat.customProgramCacheKey = () => 'hao1';
  return mat;
}

/** Normalen reparieren: exakte Nullvektoren (entartete Dreiecke, Lathe-Enden, Blattspitzen) → NaN im Licht → Bloom-Explosion. Alle Normalen werden normalisiert. */
export function fixNormals(root) {
  const seen = new Set(); let fixed = 0;
  root.traverse((o) => {
    if (!o.isMesh) return; const g = o.geometry; if (seen.has(g.uuid)) return; seen.add(g.uuid);
    const n = g.attributes.normal; if (!n) return;
    for (let i = 0; i < n.count; i++) { let x = n.getX(i), y = n.getY(i), z = n.getZ(i); const l = Math.hypot(x, y, z); if (!(l > 1e-6) || !Number.isFinite(l)) { n.setXYZ(i, 0, 1, 0); fixed++; } else if (Math.abs(l - 1) > 0.002) n.setXYZ(i, x / l, y / l, z / l); }
    n.needsUpdate = true;
  });
  return fixed;
}
