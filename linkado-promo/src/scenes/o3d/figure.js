// ============================================================
// 3D-Figuren für das Büro (erfundene, stilisierte Personen – „Vinyl-Spielfiguren“ aus Kugeln und Zylindern, keine Echtpersonen).
// Rig: Becken → Wirbelsäule (Neigung/Drehung/Seite) → Hals → Kopf; zwei Arme mit Zwei-Knochen-IK (Handziele in Weltkoordinaten),
// Mimik über stufenlose Parameter (Brauen, Augen, Mund als verformbares Band, Wangen), Blick über Pupillen + Kopfdrehung, Haare mit Nachschwingen.
// Koordinaten der Figur: Ursprung = Beckenmitte, +Z nach vorn (Blickrichtung), +Y nach oben, Maße in Metern.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp } from './anim.js';

const V3 = THREE.Vector3, Q = THREE.Quaternion;
const Y = new V3(0, 1, 0), Z = new V3(0, 0, 1);

/** Aussehen (Farben aus den Porträts der Oberfläche, ui.js PEOPLE) */
export const LOOKS = {
  tom:   { skin: '#F6D5BD', hair: '#8A8A90', style: 'bald',  clothes: '#4673C9', pants: '#20283F', glasses: true,  beard: true,  shoe: '#151822', brow: '#7A7A80' },
  lena:  { skin: '#8D5A3B', hair: '#15110E', style: 'curly', clothes: '#2F7D6B', pants: '#232B40', glasses: false, beard: false, shoe: '#151822', brow: '#15110E' },
  anna:  { skin: '#F0C4A0', hair: '#4A2C17', style: 'long',  clothes: '#7F73E6', pants: '#232A40', glasses: false, beard: false, shoe: '#151822', brow: '#3B2312' },
  mira:  { skin: '#DDA37A', hair: '#1D1511', style: 'bun',   clothes: '#D9803A', pants: '#232A40', glasses: false, beard: false, shoe: '#151822', brow: '#1D1511' },
  jonas: { skin: '#F3CDB0', hair: '#B5651D', style: 'short', clothes: '#2A3550', pants: '#232A40', glasses: true,  beard: true,  shoe: '#151822', brow: '#9A5517' },
  ben:   { skin: '#D9A07A', hair: '#2B1D14', style: 'buzz',  clothes: '#4A5470', pants: '#20283F', glasses: false, beard: false, shoe: '#151822', brow: '#2B1D14' },
  aylin: { skin: '#E6B08A', hair: '#2A1A12', style: 'long',  clothes: '#D1497A', pants: '#232A40', glasses: false, beard: false, shoe: '#151822', brow: '#2A1A12' },
};

const L1 = 0.27, L2 = 0.25;                 // Oberarm, Unterarm (bis Handgelenk)
const HEAD_R = 0.125;
const SKULL_S = [1.0, 1.08, 1.04];            // Schädel-Ellipsoid
const faceZ = (x, y, r = HEAD_R) => SKULL_S[2] * Math.sqrt(Math.max(1e-6, r * r - x * x - (y / SKULL_S[1]) ** 2));

/** Zwei-Knochen-IK: Ellbogenposition für Schulter S, Ziel T, Pol-Richtung P (Weltrichtung, in die der Ellbogen ausweicht) */
function ik(S, T, P, out) {
  const d0 = T.clone().sub(S); let d = d0.length();
  const dm = clamp(d, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.004);
  const u = d0.clone().multiplyScalar(1 / Math.max(d, 1e-6));
  const a = (L1 * L1 - L2 * L2 + dm * dm) / (2 * dm), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pn = P.clone().sub(u.clone().multiplyScalar(P.dot(u)));
  if (pn.lengthSq() < 1e-8) pn.set(0, -1, 0).sub(u.clone().multiplyScalar(-u.y));
  pn.normalize();
  out.E.copy(S).addScaledVector(u, a).addScaledVector(pn, hh);
  out.W.copy(S).addScaledVector(u, dm);
  return d > L1 + L2 - 0.004;                // true = Ziel außer Reichweite
}

export function buildFigure(key, opt = {}) {
  const lk = { ...LOOKS[key], ...(opt.look || {}) };
  const std = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const mSkin = std(lk.skin, 0.58), mCloth = std(lk.clothes, 0.88), mPants = std(lk.pants, 0.9), mShoe = std(lk.shoe, 0.6), mHair = std(lk.hair, 0.5);
  const mWhite = std('#F7F5F0', 0.35), mPupil = std('#1A1210', 0.25), mLip = std('#A4524A', 0.55), mCav = std('#4A1620', 0.8), mBrow = std(lk.brow || lk.hair, 0.6);
  const mBlush = new THREE.MeshBasicMaterial({ color: '#E57B6E', transparent: true, opacity: 0.2, depthWrite: false });
  const add = (parent, geo, mat, px = 0, py = 0, pz = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const SPH = (r, w = 28, h = 18) => new THREE.SphereGeometry(r, w, h);

  const group = new THREE.Group();            // Identität: Weltkoordinaten der Glieder
  const root = new THREE.Group(); group.add(root);
  const limbs = new THREE.Group(); group.add(limbs);

  /* ---- Becken, Beine ---- */
  add(root, SPH(0.1), mPants, 0, -0.01, 0.01, 1.85, 0.95, 1.55);
  const legs = [-1, 1].map((sd) => {
    const th = add(limbs, new THREE.CylinderGeometry(0.062, 0.056, 1, 14), mPants), kn = add(limbs, SPH(0.058), mPants), sh = add(limbs, new THREE.CylinderGeometry(0.052, 0.045, 1, 14), mPants);
    const ft = add(limbs, new THREE.BoxGeometry(0.095, 0.055, 0.215), mShoe); ft.geometry.translate(0, 0, 0.045);
    return { sd, th, kn, sh, ft };
  });

  /* ---- Rumpf ---- */
  const spine = new THREE.Group(); spine.position.set(0, 0.06, 0); root.add(spine);
  add(spine, SPH(0.2, 32, 20), mCloth, 0, 0.27, 0.0, 1.05, 1.5, 0.78);                 // Brustkorb
  add(spine, SPH(0.17, 28, 16), mCloth, 0, 0.09, 0.01, 1.12, 0.95, 0.9);               // Bauch
  add(spine, new THREE.TorusGeometry(0.07, 0.016, 10, 28), std(opt.collar || '#F2EEE6', 0.8), 0, 0.535, 0.01).rotation.x = Math.PI / 2 - 0.15;   // Kragen
  const shoulders = [new V3(-0.215, 0.455, 0.0), new V3(0.215, 0.455, 0.0)];
  const shJ = shoulders.map((p) => add(spine, SPH(0.057), mCloth, p.x, p.y, p.z));
  const neck = new THREE.Group(); neck.position.set(0, 0.545, 0.01); spine.add(neck);
  add(neck, new THREE.CylinderGeometry(0.043, 0.05, 0.1, 14), mSkin, 0, 0.03, 0);
  const head = new THREE.Group(); head.position.set(0, 0.075, 0.012); neck.add(head);
  const hc = new THREE.Group(); hc.position.set(0, 0.115, 0.0); head.add(hc);             // Kopfmitte

  /* ---- Kopf ---- */
  add(hc, SPH(HEAD_R, 40, 28), mSkin, 0, 0, 0, ...SKULL_S);
  add(hc, SPH(0.07, 24, 16), mSkin, 0, -0.083, 0.036, 1.18, 0.9, 0.95);                  // Kinn/Kiefer (liegt unterhalb des Mundes, damit die Lippen auf dem Schädel sitzen)
  [-1, 1].forEach((sd) => { add(hc, SPH(0.031, 16, 12), mSkin, sd * 0.126, -0.004, -0.008, 0.5, 1.0, 0.8); });
  add(hc, SPH(0.018, 16, 12), mSkin, 0, -0.016, faceZ(0, -0.016) + 0.006, 1, 1.1, 1.2);   // Nase
  // Augen
  const eyes = [-1, 1].map((sd) => {
    const g = new THREE.Group(), ex = sd * 0.046, ey = 0.02; g.position.set(ex, ey, faceZ(ex, ey) - 0.012); hc.add(g);
    const sc = add(g, SPH(0.0235, 20, 14), mWhite, 0, 0, 0, 1, 1, 0.7), pu = add(g, SPH(0.0125, 14, 10), mPupil, 0, 0, 0.0115, 1, 1, 0.5);
    const hl = add(pu, SPH(0.0035, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), 0.004, 0.004, 0.0055);
    return { g, sc, pu, hl, base: g.position.clone() };
  });
  // Brauen
  const brows = [-1, 1].map((sd) => { const g = new THREE.Group(), by = 0.066; g.position.set(sd * 0.047, by, faceZ(sd * 0.047, by) + 0.002); hc.add(g); const m = add(g, new THREE.CapsuleGeometry(0.0062, 0.05, 4, 8), mBrow); m.rotation.z = Math.PI / 2; return { g, sd }; });
  // Wangen
  [-1, 1].forEach((sd) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), mBlush); const x = sd * 0.075, y = -0.03; m.position.set(x, y, faceZ(x, y) + 0.001); m.rotation.y = sd * 0.62; m.scale.y = 0.8; hc.add(m); });
  // Mund: zwei Lippenbänder (verformbar) + Mundhöhle + Zähne
  const NM = 14;
  const mkRibbon = (mat) => {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NM * 2 * 3), 3));
    const idx = []; for (let i = 0; i < NM - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); }
    geo.setIndex(idx); const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.frustumCulled = false; m.material.side = THREE.DoubleSide; hc.add(m); return m;
  };
  const lipU = mkRibbon(mLip), lipL = mkRibbon(mLip);
  const cav = new THREE.Mesh(new THREE.CircleGeometry(1, 24), mCav); hc.add(cav);
  const teeth = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mWhite); hc.add(teeth);
  const MOUTH_Y = -0.056;
  function setMouth(m) {
    const w = 0.056 * (m.width ?? 1), c = m.smile ?? 0.2, op = clamp(m.open ?? 0), th = 0.0062;
    const writeRibbon = (mesh, off, sgnOpen) => {
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < NM; i++) {
        const u = (i / (NM - 1)) * 2 - 1, x = u * w;
        const yc = MOUTH_Y + c * 0.022 * (u * u - 0.35) * (c >= 0 ? 1 : 1) + off;
        const pin = 1 - (1 - Math.abs(u)) * 0.0;
        for (let k = 0; k < 2; k++) { const y = yc + (k ? -th : th) * 0.5 + sgnOpen * op * 0.015 * (1 - u * u) * (1 + (c > 0 ? 0.2 : 0)); pos.setXYZ(i * 2 + k, x, y, faceZ(x, y) + (lk.beard ? 0.0095 : 0.0025)); }
      }
      pos.needsUpdate = true;
    };
    writeRibbon(lipU, 0.0, 1), writeRibbon(lipL, 0.0, -1.7);
    const cy = MOUTH_Y + (c * 0.022 * (-0.35)) - op * 0.0035, cw = w * 0.82 * (0.55 + 0.45 * Math.min(1, op * 1.8)), ch = 0.0008 + op * 0.0195;
    cav.visible = op > 0.04; cav.scale.set(cw, ch, 1); cav.position.set(0, cy, faceZ(0, cy) + (lk.beard ? 0.0085 : 0.0018));
    teeth.visible = op > 0.1 && c > -0.1; teeth.scale.set(cw * 0.78, Math.min(ch * 0.4, 0.006), 1); teeth.position.set(0, cy + ch * 0.62, faceZ(0, cy) + (lk.beard ? 0.009 : 0.0022));
  }
  // Brille, Bart
  if (lk.glasses) {
    const mG = std('#16181F', 0.35, 0.3);
    [-1, 1].forEach((sd) => { const x = sd * 0.046, y = 0.02; const t = add(hc, new THREE.TorusGeometry(0.037, 0.0042, 8, 28), mG, x, y, faceZ(x, y) + 0.009); t.castShadow = false; });
    add(hc, new THREE.CylinderGeometry(0.0035, 0.0035, 0.02, 6), mG, 0, 0.024, faceZ(0, 0.024) + 0.011).rotation.z = Math.PI / 2;
    [-1, 1].forEach((sd) => { const t = add(hc, new THREE.CylinderGeometry(0.003, 0.003, 0.1, 6), mG, sd * 0.1, 0.02, 0.07); t.rotation.x = Math.PI / 2; t.rotation.z = sd * 0.1; });
  }
  if (lk.beard) {
    const bg = new THREE.SphereGeometry(HEAD_R + 0.0045, 36, 20, 0, Math.PI, 1.92, 1.0);
    add(hc, bg, mHair, 0, 0, 0, ...SKULL_S);
    add(hc, SPH(0.03, 18, 10), mHair, 0, -0.037, faceZ(0, -0.037) + 0.006, 1.9, 0.38, 0.8);                      // Oberlippenbart
  }

  /* ---- Haare (eigene Gruppe: schwingt mit Verzögerung nach) ---- */
  const hair = new THREE.Group(); hc.add(hair);
  const hairBits = [];
  const cap = (r = 0.0105, from = 0, len = 1.85, sy = 1.08) => { const g = new THREE.SphereGeometry(HEAD_R + r, 36, 22, 0, Math.PI * 2, from, len); const m = add(hair, g, mHair, 0, 0.003, -0.004, 1.0, sy, 1.04); return m; };
  const st = lk.style;
  if (st === 'bald') {
    [-1, 1].forEach((sd) => { add(hair, SPH(0.04, 14, 10), mHair, sd * 0.112, 0.012, -0.012, 0.7, 1.5, 1.1); add(hair, SPH(0.036, 14, 10), mHair, sd * 0.098, -0.03, -0.045, 0.7, 1.4, 1.1); });
  } else if (st === 'long') {
    cap(0.011, 0, 0.92, 1.09).position.z = -0.012;                                                                              // Oberkopf (Haaransatz hoch über den Brauen)
    add(hair, SPH(0.145, 28, 18), mHair, 0, -0.07, -0.065, 0.97, 1.5, 0.72);                                                   // Hinterkopf bis auf die Schultern
    [-1, 1].forEach((sd) => { add(hair, SPH(0.05, 16, 12), mHair, sd * 0.124, -0.05, -0.035, 0.62, 2.0, 0.85); });          // Seitensträhnen hinter den Ohren (Gesicht bleibt frei)
    [[-0.06, 0.1], [0.0, 0.0], [0.062, -0.1]].forEach(([x, r]) => { const m = add(hair, SPH(0.036, 14, 10), mHair, x, 0.108 - Math.abs(x) * 0.1, faceZ(x, 0.1) * 0.96, 1.4, 0.55, 0.7); m.rotation.z = r + 0.1; });   // Pony: kurze Strähnen am Haaransatz
  } else if (st === 'curly') {
    const n = 34; for (let i = 0; i < n; i++) { const a = i * 2.399963, rr = 0.108 + 0.026 * ((i * 7) % 5) / 4, th = Math.acos(1 - (i + 0.5) / n * 1.18) * 0.98; const x = Math.sin(th) * Math.cos(a) * rr, zz = Math.sin(th) * Math.sin(a) * rr, yy = Math.cos(th) * rr + 0.02; if (zz > 0.07 && yy < 0.07) continue; add(hair, SPH(0.047 + 0.006 * ((i * 3) % 3), 12, 10), mHair, x, yy, zz - 0.012); }
    add(hair, SPH(0.13, 24, 16), mHair, 0, 0.035, -0.035, 1.04, 0.95, 0.95);
  } else if (st === 'bun') {
    cap(0.011, 0, 1.0, 1.09).position.z = -0.012; add(hair, SPH(0.052, 18, 12), mHair, 0, 0.145, -0.07);
    [-1, 1].forEach((sd) => add(hair, SPH(0.04, 14, 10), mHair, sd * 0.118, -0.02, -0.03, 0.7, 1.6, 0.9));
  } else if (st === 'short') {
    cap(0.012, 0, 1.0, 1.09).position.z = -0.01; add(hair, SPH(0.06, 14, 10), mHair, 0, 0.09, 0.07, 1.4, 0.7, 0.7);
    [-1, 1].forEach((sd) => add(hair, SPH(0.042, 14, 10), mHair, sd * 0.115, 0.0, -0.03, 0.7, 1.4, 0.9));
  } else if (st === 'buzz') {
    cap(0.006, 0, 1.1, 1.08).position.z = -0.01;
    [-1, 1].forEach((sd) => add(hair, SPH(0.04, 14, 10), mHair, sd * 0.116, 0.0, -0.028, 0.6, 1.3, 0.9));
  }

  /* ---- Arme (Weltkoordinaten) ---- */
  const arms = [0, 1].map((i) => {
    const ua = add(limbs, new THREE.CylinderGeometry(0.054, 0.048, 1, 16), mCloth), el = add(limbs, SPH(0.05), mCloth), fa = add(limbs, new THREE.CylinderGeometry(0.047, 0.042, 1, 16), mCloth);
    const wr = add(limbs, new THREE.CylinderGeometry(0.032, 0.034, 1, 12), mSkin), cuff = add(limbs, new THREE.TorusGeometry(0.043, 0.0085, 8, 18), mCloth);
    const hand = new THREE.Group(); limbs.add(hand);
    add(hand, SPH(0.043, 20, 14), mSkin, 0, 0, 0.02, 1.0, 0.55, 1.25);
    add(hand, SPH(0.03, 16, 12), mSkin, 0, -0.002, 0.062, 1.12, 0.5, 1.2);
    const thumb = add(hand, SPH(0.017, 12, 10), mSkin, (i ? 1 : -1) * 0.04, 0.003, 0.03, 1, 0.9, 1.7); thumb.rotation.y = (i ? -1 : 1) * 0.5;
    return { ua, el, fa, wr, cuff, hand, thumb, E: new V3(), W: new V3(), sh: new V3() };
  });
  const seg = (m, A, B, scale = 1) => { const d = B.clone().sub(A), len = d.length(); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.multiplyScalar(1 / Math.max(len, 1e-6))); m.scale.set(1, len * scale, 1); };

  /* ---- Handy-Prop (an der rechten Hand oder auf dem Tisch) ---- */
  const phone = new THREE.Group(); group.add(phone); phone.visible = false;
  phone.scale.setScalar(1.28); add(phone, new THREE.BoxGeometry(0.074, 0.0095, 0.15), std('#D9D6D0', 0.4, 0.15));
  add(phone, new THREE.BoxGeometry(0.064, 0.002, 0.138), new THREE.MeshStandardMaterial({ color: '#1D2840', roughness: 0.25, emissive: '#2A3F70', emissiveIntensity: 0.4 }), 0, 0.0052, 0);

  /* ---- Zustand → Bild ---- */
  const tmp = { E: new V3(), W: new V3() }, qa = new Q(), qb = new Q(), wp = new V3(), wq = new Q(), eul = new THREE.Euler();
  const headWorld = new V3(), tv = new V3();
  const API = {
    group, root, spine, neck, head, hc, phone, arms, look: lk,
    /** Weltposition eines Punktes im Kopf-Raum (für Ohr, Haare, Gesicht) */
    headPoint(x, y, z, out = new V3()) { hc.updateWorldMatrix(true, false); return out.set(x, y, z).applyMatrix4(hc.matrixWorld); },
    spinePoint(x, y, z, out = new V3()) { spine.updateWorldMatrix(true, false); return out.set(x, y, z).applyMatrix4(spine.matrixWorld); },
    rootPoint(x, y, z, out = new V3()) { root.updateWorldMatrix(true, false); return out.set(x, y, z).applyMatrix4(root.matrixWorld); },
    /**
     * s: { pos:V3 (Becken), yaw, lean, side, twist, shrug, breath,
     *      head:{yaw,pitch,roll} (zusätzlich zum Zielblick), aim:V3|null (Blickziel in Welt), headW (0..1: Anteil der Kopfdrehung am Blick), eyeX, eyeY (zusätzlich),
     *      blink 0..1, squint 0..1, brow:{raise,angle,asym}, mouth:{smile,open,width}, cheeks,
     *      RH:{pos:V3, pole:V3, roll} (lokal −x), LH:{…} (lokal +x), phone:{pos:V3, quat:Q}|null, hair:{yaw,pitch,roll}, foot }
     */
    set(s) {
      root.position.copy(s.pos); root.rotation.set(0, s.yaw || 0, 0);
      const br = s.breath || 0;
      spine.rotation.set((s.lean || 0) + br * 0.012, s.twist || 0, s.side || 0);
      spine.scale.set(1 + br * 0.012, 1 + br * 0.008, 1 + br * 0.02);
      shJ[0].position.y = shoulders[0].y + (s.shrug || 0) * 0.045 * (1 - 0 * br); shJ[1].position.y = shoulders[1].y + (s.shrug || 0) * 0.045;
      shJ[0].position.x = shoulders[0].x + (s.shrug || 0) * 0.012; shJ[1].position.x = shoulders[1].x - (s.shrug || 0) * 0.012;
      root.updateMatrixWorld(true);
      // Kopf
      let hy = (s.head && s.head.yaw) || 0, hp = (s.head && s.head.pitch) || 0, hr = (s.head && s.head.roll) || 0;
      let ex = s.eyeX || 0, ey = s.eyeY || 0;
      neck.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
      if (s.aim) {
        neck.updateWorldMatrix(true, false);
        const inv = new THREE.Matrix4().copy(neck.matrixWorld).invert();
        tv.copy(s.aim).applyMatrix4(inv); tv.y -= 0.19;                         // vom Hals aus zum Ziel
        const dyaw = Math.atan2(tv.x, tv.z), dpit = Math.atan2(-tv.y, Math.hypot(tv.x, tv.z));
        const w = s.headW ?? 0.65, cy = clamp(dyaw, -1.25, 1.25), cp = clamp(dpit, -0.6, 0.7);
        hy += cy * w; hp += cp * w;
        ex += clamp((dyaw - hy) / 0.55, -1, 1); ey += clamp((dpit - hp) / 0.45, -1, 1);
      }
      neck.rotation.set(hp * 0.35, hy * 0.45, hr * 0.3); head.rotation.set(hp * 0.65, hy * 0.55, hr * 0.7);
      // Mimik
      const bl = clamp((s.blink || 0) + (s.squint || 0) * 0.55);
      eyes.forEach((e, i) => {
        e.g.scale.set(1, Math.max(0.08, 1 - 0.92 * bl), 1);
        e.pu.position.set(clamp(ex, -1, 1) * 0.0105, clamp(ey, -1, 1) * -0.0075, 0.0115);
      });
      const b = s.brow || {};
      brows.forEach((o, i) => {
        const asym = (i ? 1 : -1) * (b.asym || 0);
        o.g.position.y = 0.066 + ((b.raise || 0) + asym * 0.4) * 0.016 - bl * 0.004;
        o.g.rotation.z = o.sd * -(b.angle || 0) * 0.5 + (asym ? asym * 0.2 : 0);   // + = wütend (Innenseite unten), − = besorgt (Innenseite oben)
      });
      setMouth(s.mouth || {});
      // Haare: Nachschwingen
      const h = s.hair || {}; hair.rotation.set(h.pitch || 0, h.yaw || 0, h.roll || 0);
      // Arme
      root.updateMatrixWorld(true);
      [s.RH, s.LH].forEach((t, i) => {            // Arm 0 = Schulter bei lokal −x (anatomisch: rechte Hand), Arm 1 = lokal +x (linke Hand)
        const A = arms[i];
        spine.updateWorldMatrix(true, false);
        A.sh.copy(shJ[i].position).applyMatrix4(spine.matrixWorld);
        if (!t) t = { pos: A.sh.clone().add(new V3(0, -0.5, 0.1)), pole: new V3(0, -1, 0) };
        ik(A.sh, t.pos, t.pole || new V3((i ? 1 : -1) * 0.6, -0.8, -0.3), A);
        // Glieder
        const dirFA = A.W.clone().sub(A.E).normalize();
        seg(A.ua, A.sh, A.E); A.el.position.copy(A.E);
        const wristStart = A.E.clone().addScaledVector(dirFA, L2 * 0.8);
        seg(A.fa, A.E, wristStart); seg(A.wr, wristStart, A.W);
        A.cuff.position.copy(wristStart); A.cuff.quaternion.setFromUnitVectors(Z, dirFA);
        A.hand.position.copy(A.W); qa.setFromUnitVectors(Z, dirFA); A.hand.quaternion.copy(qa);
        // Handrolle um die Unterarmachse (0 = Handfläche nach unten)
        qb.setFromAxisAngle(Z, (t.roll || 0) * (i ? 1 : -1)); A.hand.quaternion.multiply(qb);
      });
      // Bein: Becken-Hüfte → Knie → Fuß (sitzend, Füße auf dem Boden)
      legs.forEach((lg) => {
        const hip = new V3(lg.sd * 0.095, -0.02, 0.03).applyMatrix4(root.matrixWorld);
        const knee = new V3(lg.sd * 0.105, 0.0, 0.45).applyMatrix4(root.matrixWorld);
        const foot = new V3(lg.sd * 0.11, -(s.pos.y - 0.0) + 0.04 + (lg.sd > 0 ? (s.foot || 0) * 0.02 : 0), 0.52).applyMatrix4(root.matrixWorld);
        foot.y = 0.05 + (lg.sd > 0 ? (s.foot || 0) * 0.025 : 0);
        knee.y = Math.max(knee.y, foot.y + 0.44);
        seg(lg.th, hip, knee); lg.kn.position.copy(knee); seg(lg.sh, knee, new V3(foot.x, foot.y + 0.04, foot.z - 0.02));
        lg.ft.position.set(foot.x, foot.y, foot.z - 0.05); lg.ft.rotation.set(0, (s.yaw || 0), 0);
      });
      if (s.phone) { phone.visible = true; phone.position.copy(s.phone.pos); phone.quaternion.copy(s.phone.quat); } else phone.visible = false;
    },
    dispose() { group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); },
  };
  return API;
}
