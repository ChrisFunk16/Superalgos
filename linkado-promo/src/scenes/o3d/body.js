// ============================================================
// Körper der Figuren: EIN weicher, geskinnter Körper (Rumpf, Arme, Beine) aus Ringen, die entlang der Gelenke gezogen werden.
// Die Gelenke (Ellbogen, Knie, Taille) beugen sich stufenlos (Vertex-Gewichte), Schultern sind runde Kappen → keine sichtbaren Kugeln/Zylinder-Nähte mehr.
// Farben pro Vertex (Kleidung, Haut, Hose, Schuhe) → Ausschnitte, kurze Ärmel, Säume ohne zusätzliche Meshes.
// Bind-Pose (Wurzel-Koordinaten: Ursprung = Beckenmitte, +Y oben, +Z vorn): Arme hängen gerade nach unten, Beine sitzend (Oberschenkel vorwärts, Schienbein abwärts).
// ============================================================
import * as THREE from '../../vendor/three.module.js';

const V3 = THREE.Vector3;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

/** Maße (Meter) – die Skripte und die IK (figure.js) verwenden dieselben Werte */
export const DIM = {
  L1: 0.27, L2: 0.25,                                   // Oberarm, Unterarm (bis Handgelenk)
  shoulder: new V3(0.215, 0.515, 0.0),                  // Schultergelenk (x gespiegelt), Wurzel-Koordinaten
  hip: new V3(0.095, -0.02, 0.03), knee: new V3(0.105, 0.0, 0.45), ankle: new V3(0.11, -0.47, 0.50),
  chestY: 0.30, spineY: 0.06,
};

/** Rundung der Ringe: Superellipse (p = 2 → Ellipse) */
function ringPoint(a, rx, rz, p = 2.4) { const c = Math.cos(a), s = Math.sin(a); return [Math.sign(c) * Math.pow(Math.abs(c), 2 / p) * rx, Math.sign(s) * Math.pow(Math.abs(s), 2 / p) * rz]; }

/**
 * Röhren-Mesh aus Abschnitten. section: { c: V3, ex: V3, ez: V3, rx, rz, w: [[bone, weight] …], col: THREE.Color, p? }
 * Alle Abschnitte teilen die Ringzahl n; Kappen (cap0/cap1) schließen das Ende mit einem Mittelpunkt.
 */
class Builder {
  constructor() { this.pos = []; this.nrm = []; this.uv = []; this.col = []; this.si = []; this.sw = []; this.idx = []; }
  addTube(sections, n, { cap0 = false, cap1 = false, vscale = 1 } = {}) {
    const base = this.pos.length / 3; let v = 0;
    sections.forEach((s, k) => {
      if (k > 0) v += s.c.distanceTo(sections[k - 1].c) * vscale;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, [x, z] = ringPoint(a, s.rx, s.rz, s.p ?? 2.4);
        const p = s.c.clone().addScaledVector(s.ex, x).addScaledVector(s.ez, z);
        this.pos.push(p.x, p.y, p.z); this.nrm.push(0, 1, 0); this.uv.push(i / n * 3, v);
        const col = typeof s.col === 'function' ? s.col(a, p) : s.col;
        this.col.push(col.r, col.g, col.b);
        const w = s.w.slice().sort((q, r) => r[1] - q[1]).slice(0, 4); const sum = w.reduce((q, r) => q + r[1], 0) || 1;
        for (let m = 0; m < 4; m++) { this.si.push(w[m] ? w[m][0] : 0); this.sw.push(w[m] ? w[m][1] / sum : 0); }
      }
    });
    for (let k = 0; k < sections.length - 1; k++) for (let i = 0; i < n; i++) {
      const a = base + k * n + i, b = base + k * n + (i + 1) % n, c = base + (k + 1) * n + i, d = base + (k + 1) * n + (i + 1) % n;
      this.idx.push(a, c, b, b, c, d);
    }
    const cap = (k, flip) => {
      const s = sections[k], ci = this.pos.length / 3, c = s.c; this.pos.push(c.x, c.y, c.z); this.nrm.push(0, 1, 0); this.uv.push(0, 0);
      const col = typeof s.col === 'function' ? s.col(0, c) : s.col; this.col.push(col.r, col.g, col.b);
      const w = s.w.slice().sort((q, r) => r[1] - q[1]).slice(0, 4); const sum = w.reduce((q, r) => q + r[1], 0) || 1;
      for (let m = 0; m < 4; m++) { this.si.push(w[m] ? w[m][0] : 0); this.sw.push(w[m] ? w[m][1] / sum : 0); }
      for (let i = 0; i < n; i++) { const a = base + k * n + i, b = base + k * n + (i + 1) % n; this.idx.push(...(flip ? [ci, b, a] : [ci, a, b])); }
    };
    if (cap0) cap(0, false); if (cap1) cap(sections.length - 1, true);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    g.setIndex(this.idx); g.computeVertexNormals(); return g;
  }
}

/** Rumpf-Ringe (Wurzel-Koordinaten): [y, rx, rz, z-Mitte] – gemeinsam für das Mesh und für aufgesetzte Details (Ausschnitte, Knopfleisten) */
export function torsoRows(look) {
  const belly = look.belly || 0, shw = look.shoulders || 1;
  return [
    [-0.14, 0.150, 0.105, 0], [-0.07, 0.178, 0.125, 0], [0.02, 0.176, 0.122, 0.005], [0.10, 0.158 + belly * 0.35, 0.113 + belly, 0.01 + belly * 0.4], [0.20, 0.168, 0.117 + belly * 0.5, 0.008 + belly * 0.2],
    [0.31, 0.190 * shw, 0.124, 0.006], [0.41, 0.205 * shw, 0.117, 0.0], [0.47, 0.208 * shw, 0.104, -0.002], [0.50, 0.205 * shw, 0.097, -0.004], [0.525, 0.185, 0.088, -0.004], [0.545, 0.150, 0.078, -0.004], [0.555, 0.132, 0.074, -0.003], [0.565, 0.112, 0.07, -0.002],
    [0.574, 0.097, 0.067, -0.001], [0.583, 0.085, 0.065, 0.0], [0.592, 0.075, 0.061, 0.001], [0.60, 0.066, 0.058, 0.002], [0.606, 0.059, 0.055, 0.003], [0.612, 0.054, 0.052, 0.004],
  ];
}
/** Oberfläche des Rumpfes bei (x, y): z-Koordinate (vorn) – für Streifen-Details */
export function torsoSurfaceZ(rows, x, y) {
  let i = 0; while (i < rows.length - 2 && y > rows[i + 1][0]) i++;
  const [y0, rx0, rz0, z0] = rows[i], [y1, rx1, rz1, z1] = rows[i + 1], t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  const rx = lerp(rx0, rx1, t), rz = lerp(rz0, rz1, t), zc = lerp(z0, z1, t), p = y > 0.45 ? 2.2 : 2.5;
  const q = Math.max(0, 1 - Math.pow(Math.abs(x) / rx, p));
  return zc + rz * Math.pow(q, 1 / p);
}

/**
 * Körper-Geometrie für ein Aussehen. bones: Reihenfolge { pelvis:0, spine:1, chest:2, uaR:3, faR:4, uaL:5, faL:6, thR:7, shR:8, thL:9, shL:10 }
 * look: { clothes, pants, skin, outfit: 'sweater'|'hoodie'|'cardigan'|'shirt'|'tee'|'blouse', belly, shoulders, inner }
 */
export const BONE = { pelvis: 0, spine: 1, chest: 2, uaR: 3, faR: 4, uaL: 5, faL: 6, thR: 7, shR: 8, thL: 9, shL: 10 };

export function buildBodyGeometry(look) {
  const B = new Builder();
  const cl = new THREE.Color(look.clothes), pn = new THREE.Color(look.pants), sk = new THREE.Color(look.skin), inner = new THREE.Color(look.inner || '#F2EEE6'), shoe = new THREE.Color(look.shoe || '#151822');
  const belly = look.belly || 0, shw = look.shoulders || 1, outfit = look.outfit || 'sweater';
  const ex = new V3(1, 0, 0), ez = new V3(0, 0, 1), ey = new V3(0, 1, 0);

  /* ---------------- Rumpf ---------------- */
  const wTorso = (y) => { const wc = sstep(0.12, 0.40, y), ws = sstep(0.0, 0.18, y) * (1 - wc); return [[BONE.pelvis, Math.max(0.0, 1 - ws - wc)], [BONE.spine, ws], [BONE.chest, wc]]; };
  const secT = torsoRows(look);
  const torsoCol = (a, p) => {
    const y = p.y;
    if (y < 0.0) return pn;
    if (y < 0.05) return pn.clone().lerp(cl, sstep(-0.01, 0.05, y));
    return cl;
  };
  const secs = secT.map(([y, rx, rz, zc]) => ({ c: new V3(0, y, zc), ex, ez, rx, rz, p: y > 0.45 ? 2.2 : 2.5, w: wTorso(y), col: torsoCol }));
  B.addTube(secs, 44, { cap0: true, cap1: true, vscale: 2 });

  /* ---------------- Arme ---------------- */
  const sleeveEnd = outfit === 'tee' ? 0.15 : outfit === 'shirt' ? 0.235 : 9;                                    // Länge des Ärmels (Entfernung vom Ellbogen, Oberarm = −)
  [-1, 1].forEach((sgn, ai) => {
    const bU = ai === 0 ? BONE.uaR : BONE.uaL, bF = ai === 0 ? BONE.faR : BONE.faL;
    const S = new V3(sgn * DIM.shoulder.x, DIM.shoulder.y, DIM.shoulder.z), L1 = DIM.L1, L2 = DIM.L2;
    const secsA = [];
    const dir = new V3(0, -1, 0), nx = new V3(sgn, 0, 0), nz = new V3(0, 0, -1);
    const colAt = (s) => (a, p) => { const d = s - L1; return d > sleeveEnd ? sk : (outfit === 'tee' && s > 0.1 ? cl.clone().lerp(sk, 0) : cl); };
    const rUp = (s) => lerp(0.060 * 1.0, 0.049, sstep(0, L1, s)), rFo = (s) => lerp(0.048, 0.035, sstep(0, L2, s));
    // Schulterkappe (Halbkugel um das Gelenk, oben)
    const R0 = 0.061;
    for (const phi of [78, 56, 34, 14]) { const f = phi * Math.PI / 180; secsA.push({ c: S.clone().addScaledVector(ey, R0 * Math.sin(f)), ex: nx, ez: nz, rx: R0 * Math.cos(f) * 1.0, rz: R0 * Math.cos(f), w: [[bU, 1]], col: cl, p: 2 }); }
    const lens = [0, 0.05, 0.1, 0.15, 0.2, 0.25, L1 - 0.02, L1, L1 + 0.03, L1 + 0.07, L1 + 0.12, L1 + 0.17, L1 + 0.21, L1 + 0.24, L1 + L2 - 0.012, L1 + L2];
    for (const s of lens) {
      const c = S.clone().addScaledVector(dir, s), isF = s > L1; const wF = sstep(L1 - 0.05, L1 + 0.05, s);
      const r = s <= L1 ? rUp(s) : rFo(s - L1);
      const col = s - L1 > sleeveEnd ? sk : cl;
      secsA.push({ c, ex: nx, ez: nz, rx: r * (isF ? 1.0 : 1.0), rz: r * 0.96, w: [[bU, 1 - wF], [bF, wF]], col, p: 2 });
    }
    // Manschette (Rippenbund am Handgelenk), danach Endkappe
    const cuffC = S.clone().addScaledVector(dir, L1 + L2 + 0.004);
    secsA.push({ c: cuffC, ex: nx, ez: nz, rx: 0.0345, rz: 0.0335, w: [[bF, 1]], col: s_cuff(outfit, cl, sk), p: 2 });
    B.addTube(secsA, 16, { cap1: true, vscale: 2.2 });
  });

  /* ---------------- Beine ---------------- */
  [-1, 1].forEach((sgn, li) => {
    const bT = li === 0 ? BONE.thR : BONE.thL, bS = li === 0 ? BONE.shR : BONE.shL;
    const H = new V3(sgn * DIM.hip.x, DIM.hip.y, DIM.hip.z), K = new V3(sgn * DIM.knee.x, DIM.knee.y, DIM.knee.z), A = new V3(sgn * DIM.ankle.x, DIM.ankle.y, DIM.ankle.z);
    const curve = new THREE.CatmullRomCurve3([H.clone().add(new V3(0, 0, -0.05)), H, K.clone().lerp(H, 0.25), K, K.clone().lerp(A, 0.25), A], false, 'centripetal', 0.5);
    const len = curve.getLength(), kS = H.distanceTo(K) + 0.05, N = 22; const secsL = [];
    let n0 = new V3(1, 0, 0);
    for (let i = 0; i <= N; i++) {
      const u = i / N, c = curve.getPointAt(u), t = curve.getTangentAt(u), s = u * len;
      const bx = n0.clone().sub(t.clone().multiplyScalar(n0.dot(t))).normalize(), bz = new V3().crossVectors(bx, t).normalize(); n0 = bx;
      const r = s < kS ? lerp(0.074, 0.058, sstep(0, kS, s)) : lerp(0.056, 0.040, sstep(kS, len, s)), wS = sstep(kS - 0.06, kS + 0.06, s);
      const col = s > len - 0.05 ? pn.clone().lerp(shoe, sstep(len - 0.05, len - 0.012, s)) : pn;
      secsL.push({ c, ex: bx, ez: bz, rx: r, rz: r * 0.97, w: [[bT, 1 - wS], [bS, wS]], col, p: 2 });
    }
    B.addTube(secsL, 16, { cap0: true, cap1: true, vscale: 2 });
  });
  return B.build();
}
function s_cuff(outfit, cl, sk) { return outfit === 'tee' ? sk : cl.clone().multiplyScalar(0.82); }

/** Bind-Pose-Position/Ausrichtung der Knochen (Wurzel-Koordinaten) – damit Skeleton.calculateInverses stimmt */
export function bindFrames(sgnArm = 1) {
  const m = (x, y, z) => new THREE.Matrix4().makeBasis(x, y, z);
  return { m };
}
