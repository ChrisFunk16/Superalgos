// ============================================================
// Kopf der Figuren: ein weich modellierter Schädel (Ellipsoid + Gauß-Beulen für Nase, Wangen, Brauen, Kinn …), Augen mit Iris-Textur und Lidern,
// Brauen, verformbarer Mund (Lippenbänder), Ohren, Brille, Bart und Haare als Schalen mit Strähnen-Textur, die dieselbe Kopfform (deformDir) nutzen.
// Koordinaten: Ursprung = Schädelmitte, +Y oben, +Z vorn, Maße in Metern.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp } from './anim.js';
import { mulberry, vnoise, fbm, pixCanvas, toTex, drawTex } from './gfx.js';

const V3 = THREE.Vector3;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const HEAD_R = 0.122;
const SK = [0.99, 1.09, 1.04];

/** Beulen: [x, y, z, sigma, amp] */
const BUMPS = [
  [0, -0.013, 0.137, 0.0155, 0.021], [0, 0.017, 0.128, 0.012, 0.011], [0.016, -0.022, 0.123, 0.009, 0.008], [-0.016, -0.022, 0.123, 0.009, 0.008],
  [0.072, -0.046, 0.086, 0.032, 0.010], [-0.072, -0.046, 0.086, 0.032, 0.010],
  [0.046, 0.057, 0.118, 0.022, 0.006], [-0.046, 0.057, 0.118, 0.022, 0.006],
  [0.046, 0.021, 0.123, 0.017, -0.0065], [-0.046, 0.021, 0.123, 0.017, -0.0065],
  [0, -0.106, 0.086, 0.027, 0.013], [0, -0.058, 0.112, 0.032, 0.007],
];
/** Richtung (dx,dy,dz; Einheitsvektor) → Punkt auf der Kopfoberfläche (+ extra Dicke); bumpK skaliert die Gesichtsbeulen (Haare/Bart folgen weniger) */
export function deformDir(dx, dy, dz, extra = 0, bumpK = 1, out = new V3()) {
  let x = dx * HEAD_R * SK[0], y = dy * HEAD_R * SK[1], z = dz * HEAD_R * SK[2];
  const jt = sstep(-0.02, -0.112, y); x *= 1 - 0.2 * jt; z *= 1 - 0.035 * jt;
  let b = 0; for (const [cx, cy, cz, sg, am] of BUMPS) { const d2 = (x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2; b += am * Math.exp(-d2 / (2 * sg * sg)); }
  b *= bumpK; const tot = b + extra;
  return out.set(x + dx * tot, y + dy * tot, z + dz * tot);
}
/** z der Gesichtsfläche bei (x, y) – für Augen, Brauen, Mund, Brille */
export function faceZ(x, y, extra = 0) {
  const R = HEAD_R, rx = R * SK[0] * (1 - 0.2 * sstep(-0.02, -0.112, y)), ry = R * SK[1], rz = R * SK[2] * (1 - 0.035 * sstep(-0.02, -0.112, y));
  const q = 1 - (x / rx) ** 2 - (y / ry) ** 2; const z0 = rz * Math.sqrt(Math.max(1e-6, q));
  let b = 0; for (const [cx, cy, cz, sg, am] of BUMPS) { const d2 = (x - cx) ** 2 + (y - cy) ** 2 + (z0 - cz) ** 2; b += am * Math.exp(-d2 / (2 * sg * sg)); }
  return z0 + b * Math.max(0.6, z0 / rz) + extra;
}

/** Haar-Texturen: Strähnen längs der Meridiane (u = Umfang, v = Scheitel → Rand) */
export function hairTextures(color, seed = 1) {
  const base = new THREE.Color(color), r = mulberry(seed * 7 + 3), W = 512, H = 256; const hs = new Float32Array(W * H);
  const map = pixCanvas(W, H, (u, v, x, y) => {
    const str = fbm(u * 90, v * 3, 3, 90, 0, seed), clump = fbm(u * 22, v * 2, 3, 22, 0, seed + 4), tip = 1 - sstep(0.7, 1.0, v) * 0.15;
    const k = 0.72 + str * 0.5 + (clump - 0.5) * 0.55; hs[y * W + x] = str * 0.8 + clump * 0.4;
    const c = base.clone().multiplyScalar(k * tip); return [clamp(Math.pow(c.r, 1 / 2.2), 0, 1) * 255, clamp(Math.pow(c.g, 1 / 2.2), 0, 1) * 255, clamp(Math.pow(c.b, 1 / 2.2), 0, 1) * 255];
  });
  const bump = pixCanvas(W, H, (u, v, x, y) => { const k = clamp(hs[y * W + x]) * 255; return [k, k, k]; });
  const t1 = toTex(map, { repeat: [3, 1] }), t2 = toTex(bump, { repeat: [3, 1], srgb: false }); return { map: t1, bump: t2 };
}

/** Iris-Textur */
function irisTexture(color = '#6B4A2B') {
  return drawTex(128, 128, (g, w, h) => {
    const c = new THREE.Color(color);
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, '#0A0706'); gr.addColorStop(0.28, '#0A0706'); gr.addColorStop(0.32, '#' + c.clone().multiplyScalar(0.55).getHexString()); gr.addColorStop(0.7, '#' + c.getHexString()); gr.addColorStop(0.92, '#' + c.clone().multiplyScalar(0.45).getHexString()); gr.addColorStop(1, '#1A1210');
    g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1.2; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; g.beginPath(); g.moveTo(64 + Math.cos(a) * 24, 64 + Math.sin(a) * 24); g.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); g.stroke(); }
  }, { aniso: 2 });
}

/** Meridian-Schale: für jeden Azimut φ (0 = vorn, π = hinten) von θa(φ) bis θb(φ) (θ vom Scheitel, rad) – beliebige Haarlinien/Bartgrenzen */
function shell({ nPhi = 64, nTheta = 28, a, b, extra = 0.008, bumpK = 0.35, ridge = 0, ridgeN = 26, seed = 1, phiRange = [0, Math.PI * 2], shaper = null, volume = null }) {
  const pos = [], uv = [], idx = [], vt = new V3(); const r = mulberry(seed * 13 + 1);
  const rn = []; for (let i = 0; i <= nPhi; i++) rn.push(r());
  for (let i = 0; i <= nPhi; i++) {
    const u = i / nPhi, phi = phiRange[0] + (phiRange[1] - phiRange[0]) * u, ta = a(phi), tb = b(phi);
    for (let j = 0; j <= nTheta; j++) {
      const v = j / nTheta, th = lerp(ta, tb, v), st = Math.sin(th), dx = st * Math.sin(phi), dy = Math.cos(th), dz = st * Math.cos(phi);
      let ex = extra; if (ridge) ex += ridge * (Math.sin(phi * ridgeN + vnoise(phi * 3, th * 4, 0, 0, seed) * 6) * 0.5 + 0.5) * (0.5 + 0.5 * Math.sin(th * 5 + phi * 3));
      if (volume) ex += volume(phi, th);
      deformDir(dx, dy, dz, ex, bumpK, vt); if (shaper) shaper(vt, phi, th, v);
      pos.push(vt.x, vt.y, vt.z); uv.push(u, 1 - v);
    }
  }
  const row = nTheta + 1; for (let i = 0; i < nPhi; i++) for (let j = 0; j < nTheta; j++) { const A = i * row + j, B = (i + 1) * row + j, C = A + 1, D = B + 1; idx.push(A, C, B, B, C, D); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const wrapPhi = (p) => { p = ((p % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return p > Math.PI ? p - Math.PI * 2 : p; };   // −π..π
const pw = (pts) => (phi) => { const p = Math.abs(wrapPhi(phi)); for (let i = 0; i < pts.length - 1; i++) if (p <= pts[i + 1][0]) { const t = (p - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return lerp(pts[i][1], pts[i + 1][1], t * t * (3 - 2 * t)); } return pts[pts.length - 1][1]; };
const D2 = Math.PI / 180;

/**
 * Kopf bauen. mats: Materialien aus figure.js (skin, lip, cav, white, pupil, brow, hair, blush …), look: Aussehen, hi: hohe Auflösung
 * Rückgabe: { hc, hair, eyes, brows, setMouth(m), ears }
 */
export function buildHead(look, mats, hi = true) {
  const hc = new THREE.Group();
  const add = (parent, geo, mat, px = 0, py = 0, pz = 0, sx = 1, sy = 1, sz = 1, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const seed = look.seed || 1;
  /* ---- Schädel ---- */
  const sph = (nPhi, nTh, extra = 0, bumpK = 1) => shell({ nPhi, nTheta: nTh, a: () => 0, b: () => Math.PI, extra, bumpK, seed });
  add(hc, sph(hi ? 72 : 44, hi ? 48 : 30), mats.skin);
  // Ohren
  const ears = [-1, 1].map((sd) => { const g = new THREE.Group(); g.position.set(sd * 0.1225, -0.004, -0.006); g.rotation.y = sd * 0.25; hc.add(g);
    add(g, new THREE.SphereGeometry(0.03, 16, 12), mats.skin, 0, 0, 0, 0.42, 1.0, 0.75); add(g, new THREE.SphereGeometry(0.02, 12, 10), mats.skinDark, sd * 0.004, 0.0, 0.004, 0.3, 0.8, 0.55, false); return g; });
  /* ---- Augen ---- */
  const iris = irisTexture(look.iris || '#6B4A2B'), mIris = new THREE.MeshStandardMaterial({ map: iris, roughness: 0.3 }), mHL = new THREE.MeshBasicMaterial({ color: '#fff', toneMapped: false });
  const eyes = [-1, 1].map((sd) => {
    const g = new THREE.Group(), ex = sd * 0.046, ey = 0.021, ez = faceZ(ex, ey) - 0.013; g.position.set(ex, ey, ez); hc.add(g);
    const sc = add(g, new THREE.SphereGeometry(0.0238, 24, 16), mats.white, 0, 0, 0, 1, 1, 0.72, false);
    const pu = new THREE.Mesh(new THREE.CircleGeometry(0.0128, 24), mIris); pu.position.set(0, 0, 0.0172); g.add(pu);
    const hl = add(pu, new THREE.CircleGeometry(0.0036, 10), mHL, 0.0045, 0.0048, 0.0004, 1, 1, 1, false);
    // Oberlid: feste Halbschale in Hautfarbe (gibt dem Auge eine Kontur, schützt vor „Kugelaugen“)
    const lidU = add(g, new THREE.SphereGeometry(0.0252, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.34), mats.skin, 0, 0.0005, 0, 1, 1, 0.74, false); lidU.rotation.x = -0.12;
    const lidL = add(g, new THREE.SphereGeometry(0.0249, 24, 8, 0, Math.PI * 2, Math.PI * 0.84, Math.PI * 0.16), mats.skin, 0, -0.0005, 0, 1, 1, 0.74, false);
    return { g, sc, pu, hl, base: g.position.clone(), lidU, lidL };
  });
  /* ---- Brauen ---- */
  const brows = [-1, 1].map((sd) => { const g = new THREE.Group(), by = 0.066; g.position.set(sd * 0.047, by, faceZ(sd * 0.047, by) + 0.003); hc.add(g);
    const m = add(g, new THREE.CapsuleGeometry(0.0066, 0.05, 4, 10), mats.brow, 0, 0, 0, 1, 0.85, 0.7, false); m.rotation.z = Math.PI / 2;
    const m2 = add(g, new THREE.CapsuleGeometry(0.0052, 0.02, 4, 8), mats.brow, sd * 0.021, -0.0035, 0.0, 1, 0.85, 0.7, false); m2.rotation.z = Math.PI / 2 - sd * 0.45; return { g, sd }; });
  // Wangen (weiche Röte als Decal)
  [-1, 1].forEach((sd) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), mats.blush); const x = sd * 0.076, y = -0.032; m.position.set(x, y, faceZ(x, y) + 0.0012); m.rotation.y = sd * 0.62; m.scale.y = 0.8; hc.add(m); });
  // Nasenlöcher
  [-1, 1].forEach((sd) => add(hc, new THREE.SphereGeometry(0.0048, 8, 6), mats.nostril, sd * 0.0085, -0.0285, faceZ(sd * 0.0085, -0.0285) - 0.001, 1, 0.6, 0.7, false));
  /* ---- Mund (zwei verformbare Lippenbänder + Mundhöhle + Zähne) ---- */
  const NM = 16, beard = !!look.beard;
  const mkRibbon = (mat) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NM * 2 * 3), 3)); const idx = []; for (let i = 0; i < NM - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); } geo.setIndex(idx); const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.frustumCulled = false; hc.add(m); return m; };
  const lipU = mkRibbon(mats.lip), lipL = mkRibbon(mats.lipL || mats.lip); lipU.material.side = lipL.material.side = THREE.DoubleSide;
  const cav = new THREE.Mesh(new THREE.CircleGeometry(1, 24), mats.cav); hc.add(cav); const teeth = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mats.white); hc.add(teeth);
  const MOUTH_Y = -0.056;
  function setMouth(m) {
    const w = 0.056 * (m.width ?? 1), c = m.smile ?? 0.2, op = clamp(m.open ?? 0), th = 0.0072;
    const wr = (mesh, off, sgnOpen) => { const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < NM; i++) { const u = (i / (NM - 1)) * 2 - 1, x = u * w, yc = MOUTH_Y + c * 0.022 * (u * u - 0.35) + off;
        for (let k = 0; k < 2; k++) { const y = yc + (k ? -th : th) * 0.5 + sgnOpen * op * 0.015 * (1 - u * u) * (1 + (c > 0 ? 0.2 : 0)); pos.setXYZ(i * 2 + k, x, y, faceZ(x, y) + (beard ? 0.0095 : 0.0028) - 0.0016 * (u * u)); } }
      pos.needsUpdate = true; };
    wr(lipU, 0.0, 1), wr(lipL, 0.0, -1.7);
    const cy = MOUTH_Y + (c * 0.022 * (-0.35)) - op * 0.0035, cw = w * 0.82 * (0.55 + 0.45 * Math.min(1, op * 1.8)), ch = 0.0008 + op * 0.0195;
    cav.visible = op > 0.04; cav.scale.set(cw, ch, 1); cav.position.set(0, cy, faceZ(0, cy) + (beard ? 0.0085 : 0.002));
    teeth.visible = op > 0.1 && c > -0.1; teeth.scale.set(cw * 0.78, Math.min(ch * 0.4, 0.006), 1); teeth.position.set(0, cy + ch * 0.62, faceZ(0, cy) + (beard ? 0.009 : 0.0024));
  }
  /* ---- Brille ---- */
  if (look.glasses) {
    const mG = new THREE.MeshStandardMaterial({ color: '#15171E', roughness: 0.3, metalness: 0.4 }), lens = new THREE.MeshPhysicalMaterial({ color: '#CFE0FF', roughness: 0.05, transparent: true, opacity: 0.1, depthWrite: false });
    [-1, 1].forEach((sd) => { const x = sd * 0.046, y = 0.021, z = faceZ(x, y) + 0.011; const t = add(hc, new THREE.TorusGeometry(0.0375, 0.0042, 10, 32), mG, x, y, z, 1, 0.92, 1, false); const l = new THREE.Mesh(new THREE.CircleGeometry(0.037, 24), lens); l.position.set(x, y, z - 0.001); hc.add(l); });
    add(hc, new THREE.CylinderGeometry(0.0034, 0.0034, 0.02, 6), mG, 0, 0.025, faceZ(0, 0.025) + 0.012, 1, 1, 1, false).rotation.z = Math.PI / 2;
    [-1, 1].forEach((sd) => { const t = add(hc, new THREE.CylinderGeometry(0.003, 0.003, 0.11, 6), mG, sd * 0.1, 0.021, 0.063, 1, 1, 1, false); t.rotation.x = Math.PI / 2; t.rotation.z = sd * 0.06; });
  }
  /* ---- Bart ---- */
  if (beard) {
    const g = shell({ nPhi: hi ? 64 : 40, nTheta: hi ? 22 : 14, seed: seed + 2, bumpK: 0.7, extra: 0.0055, ridge: 0.0014, ridgeN: 60, phiRange: [-125 * D2, 125 * D2],
      a: (phi) => lerp(1.64, 1.48, sstep(20 * D2, 110 * D2, Math.abs(wrapPhi(phi)))) , b: (phi) => lerp(2.3, 1.95, sstep(40 * D2, 125 * D2, Math.abs(wrapPhi(phi)))) });
    add(hc, g, mats.hair);
    add(hc, new THREE.SphereGeometry(0.03, 18, 10), mats.hair, 0, -0.04, faceZ(0, -0.04) + 0.006, 1.9, 0.36, 0.8, false);
  }
  /* ---- Haare ---- */
  const hair = new THREE.Group(); hc.add(hair);
  const st = look.style, tex = mats.hairTex;
  const cap = (opts) => add(hair, shell({ seed: seed + 5, ridge: 0.0028, ridgeN: 34, ...opts }), mats.hair);
  if (st === 'bald') {
    cap({ nPhi: 40, nTheta: 12, extra: 0.006, bumpK: 0.2, a: pw([[0, 2.2], [60 * D2, 1.7], [100 * D2, 1.34], [180 * D2, 1.55]]), b: pw([[0, 2.2], [60 * D2, 1.95], [100 * D2, 1.9], [180 * D2, 2.0]]) });
    // Seitenränder um die Ohren: der Kranz
    [-1, 1].forEach((sd) => add(hair, new THREE.SphereGeometry(0.036, 14, 10), mats.hair, sd * 0.112, -0.012, -0.03, 0.7, 1.4, 1.05));
  } else if (st === 'long') {
    cap({ nPhi: hi ? 72 : 44, nTheta: 30, extra: 0.0125, bumpK: 0.25, a: () => 0, b: pw([[0, 1.1], [20 * D2, 1.16], [60 * D2, 1.3], [100 * D2, 1.78], [140 * D2, 2.0], [180 * D2, 2.2]]), volume: (phi, th) => 0.006 * Math.sin(th * 2.6) });
    // Vorhang nach hinten/seitlich bis über die Schultern (nur |φ| ≥ 75°, das Gesicht bleibt frei)
    const cur = (() => { const nP = hi ? 64 : 40, nL = 16, pos = [], uv = [], idx = [], rr = mulberry(seed * 5 + 9), vt = new V3(); const lenN = []; for (let i = 0; i <= nP; i++) lenN.push(rr());
      const edge = pw([[0, 1.1], [20 * D2, 1.16], [60 * D2, 1.3], [100 * D2, 1.78], [140 * D2, 2.0], [180 * D2, 2.2]]);
      for (let i = 0; i <= nP; i++) { const u = i / nP, phi = lerp(78 * D2, 282 * D2, u), ap = Math.abs(wrapPhi(phi)), th0 = edge(phi);
        const Lh = lerp(0.1, 0.27, sstep(78 * D2, 150 * D2, ap)) * (0.86 + lenN[i] * 0.28);
        for (let j = 0; j <= nL; j++) { const v = j / nL; deformDir(Math.sin(th0) * Math.sin(phi), Math.cos(th0), Math.sin(th0) * Math.cos(phi), 0.0125, 0.0, vt);
          const out = new V3(Math.sin(phi), 0, Math.cos(phi)); vt.addScaledVector(out, 0.01 * v + 0.045 * Math.pow(v, 1.6)); vt.y -= Lh * v; pos.push(vt.x, vt.y, vt.z); uv.push(u * 0.7, 1 - v * 0.9); } }
      const row = nL + 1; for (let i = 0; i < nP; i++) for (let j = 0; j < nL; j++) { const A = i * row + j, B = (i + 1) * row + j, C = A + 1, D = B + 1; idx.push(A, C, B, B, C, D); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
    const cm = mats.hair.clone(); cm.side = THREE.DoubleSide; add(hair, cur, cm);
  } else if (st === 'curly') {
    cap({ nPhi: 48, nTheta: 20, extra: 0.02, bumpK: 0.2, a: () => 0, b: pw([[0, 1.1], [60 * D2, 1.3], [100 * D2, 1.65], [180 * D2, 2.0]]) });
    const r = mulberry(seed * 77 + 5), n = hi ? 120 : 60, geo = new THREE.SphereGeometry(1, 12, 9);
    const im = new THREE.InstancedMesh(geo, mats.hair, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), vt = new V3();
    for (let i = 0; i < n; i++) { const phi = r() * Math.PI * 2, th = Math.acos(1 - r() * 1.55), lim = pw([[0, 1.0], [60 * D2, 1.15], [100 * D2, 1.45], [180 * D2, 1.8]])(phi); if (th > lim) { const t2 = th * 0.55; vt.set(Math.sin(t2) * Math.sin(phi), Math.cos(t2), Math.sin(t2) * Math.cos(phi)); } else vt.set(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi));
      deformDir(vt.x, vt.y, vt.z, 0.022 + r() * 0.012, 0, vt); const s = 0.03 + r() * 0.02; m4.compose(vt, q, new V3(s, s, s)); im.setMatrixAt(i, m4); }
    im.castShadow = true; im.receiveShadow = true; hair.add(im);
  } else if (st === 'bun') {
    cap({ nPhi: 56, nTheta: 24, extra: 0.0115, bumpK: 0.25, a: () => 0, b: pw([[0, 1.0], [30 * D2, 1.06], [70 * D2, 1.4], [110 * D2, 1.75], [180 * D2, 1.95]]) });
    const bun = add(hair, new THREE.SphereGeometry(0.054, 22, 14), mats.hair, 0, 0.13, -0.075); bun.scale.set(1, 0.85, 1);
    add(hair, new THREE.TorusGeometry(0.052, 0.009, 8, 22), mats.hairBand || mats.hair, 0, 0.098, -0.07).rotation.x = Math.PI / 2 - 0.5;
    [-1, 1].forEach((sd) => add(hair, new THREE.SphereGeometry(0.04, 14, 10), mats.hair, sd * 0.118, -0.02, -0.03, 0.6, 1.5, 0.9));
  } else if (st === 'short') {
    cap({ nPhi: 56, nTheta: 24, extra: 0.0125, bumpK: 0.25, a: () => 0, b: pw([[0, 1.02], [30 * D2, 1.08], [70 * D2, 1.42], [110 * D2, 1.62], [180 * D2, 1.9]]), volume: (phi, th) => 0.012 * Math.exp(-((th - 0.55) ** 2) / 0.12) * (Math.abs(wrapPhi(phi)) < 1.3 ? 1 : 0) });
    [-1, 1].forEach((sd) => add(hair, new THREE.SphereGeometry(0.04, 14, 10), mats.hair, sd * 0.114, 0.0, -0.032, 0.6, 1.3, 0.9));
  } else if (st === 'buzz') {
    cap({ nPhi: 48, nTheta: 20, extra: 0.0055, bumpK: 0.2, ridge: 0.0006, a: () => 0, b: pw([[0, 1.02], [30 * D2, 1.06], [70 * D2, 1.4], [110 * D2, 1.58], [180 * D2, 1.85]]) });
  }
  return { hc, hair, eyes, brows, setMouth, ears };
}
