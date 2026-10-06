// ============================================================
// 3D-Figuren für das Büro (erfundene, stilisierte Personen, keine Echtpersonen) – weiche „Designer-Spielfiguren“:
// ein geskinnter Körper (body.js), ein modellierter Kopf mit Haaren/Gesicht (head.js), Hände mit Fingern (hand.js).
// Rig: Becken → Taille → Brust → Hals → Kopf; zwei Arme mit Zwei-Knochen-IK (Handziele in Weltkoordinaten, Pol-Vektor für den Ellbogen),
// Mimik über stufenlose Parameter (Brauen, Augen, Mund als verformbares Band, Wangen), Blick über Iris + Kopfdrehung, Haare mit Nachschwingen.
// Koordinaten der Figur: Ursprung = Beckenmitte, +Z nach vorn (Blickrichtung), +Y nach oben, Maße in Metern.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { clamp, lerp } from './anim.js';
import { buildBodyGeometry, BONE, DIM, torsoRows, torsoSurfaceZ } from './body.js';
import { buildHead, hairTextures } from './head.js';
import { buildHand } from './hand.js';
import { weaveBump, fixNormals } from './gfx.js';

const V3 = THREE.Vector3, Q = THREE.Quaternion;
const Z = new V3(0, 0, 1);

/** Aussehen (Farben aus den Porträts der Oberfläche, ui.js PEOPLE) */
export const LOOKS = {
  tom:   { skin: '#F6D5BD', hair: '#8F9098', style: 'bald',  clothes: '#4673C9', pants: '#20283F', glasses: true,  beard: true,  shoe: '#1B1F2C', brow: '#7A7A80', outfit: 'sweater', inner: '#F2EEE6', belly: 0.028, iris: '#5C7C9C' },
  lena:  { skin: '#8D5A3B', hair: '#17110E', style: 'curly', clothes: '#2F7D6B', pants: '#232B40', glasses: false, beard: false, shoe: '#1B1F2C', brow: '#15110E', outfit: 'cardigan', inner: '#EFE8D8', iris: '#3A2418' },
  anna:  { skin: '#F0C4A0', hair: '#5A3219', style: 'long',  clothes: '#7F73E6', pants: '#232A40', glasses: false, beard: false, shoe: '#1B1F2C', brow: '#3B2312', outfit: 'hoodie',  inner: '#F2EEE6', iris: '#4A7A5A', shoulders: 0.97 },
  mira:  { skin: '#DDA37A', hair: '#1D1511', style: 'bun',   clothes: '#D9803A', pants: '#232A40', glasses: false, beard: false, shoe: '#1B1F2C', brow: '#1D1511', outfit: 'sweater', inner: '#F2EEE6', iris: '#3A2418', shoulders: 0.97 },
  jonas: { skin: '#F3CDB0', hair: '#B5651D', style: 'short', clothes: '#2A3550', pants: '#232A40', glasses: true,  beard: true,  shoe: '#1B1F2C', brow: '#9A5517', outfit: 'shirt',   inner: '#EDEFF4', iris: '#5C7C9C' },
  ben:   { skin: '#D9A07A', hair: '#2B1D14', style: 'buzz',  clothes: '#4A5470', pants: '#20283F', glasses: false, beard: false, shoe: '#1B1F2C', brow: '#2B1D14', outfit: 'tee',     inner: '#F2EEE6', iris: '#3A2418', shoulders: 1.03 },
  aylin: { skin: '#E6B08A', hair: '#2A1A12', style: 'long',  clothes: '#D1497A', pants: '#232A40', glasses: false, beard: false, shoe: '#1B1F2C', brow: '#2A1A12', outfit: 'blouse',  inner: '#F2EEE6', iris: '#3A2418', shoulders: 0.96 },
  sven:  { skin: '#EBC3A2', hair: '#C9A15A', style: 'short', clothes: '#3E7C6F', pants: '#232A40', glasses: false, beard: true,  shoe: '#1B1F2C', brow: '#A8803F', outfit: 'tee',     inner: '#F2EEE6', iris: '#5C7C9C', shoulders: 1.02 },
  nora:  { skin: '#C98E68', hair: '#3A2418', style: 'bun',   clothes: '#7A5AA8', pants: '#232A40', glasses: true,  beard: false, shoe: '#1B1F2C', brow: '#3A2418', outfit: 'cardigan', inner: '#EFE8D8', iris: '#3A2418', shoulders: 0.97 },
  kai:   { skin: '#8A5B3E', hair: '#16110E', style: 'buzz',  clothes: '#C9923A', pants: '#20283F', glasses: false, beard: true,  shoe: '#1B1F2C', brow: '#16110E', outfit: 'hoodie',  inner: '#F2EEE6', iris: '#2A1A12', shoulders: 1.04 },
  lea:   { skin: '#F2CBB0', hair: '#7A3B1F', style: 'long',  clothes: '#3A6FA8', pants: '#232A40', glasses: false, beard: false, shoe: '#1B1F2C', brow: '#6A3318', outfit: 'shirt',   inner: '#EDEFF4', iris: '#4A7A5A', shoulders: 0.97 },
};

const L1 = DIM.L1, L2 = DIM.L2;

/** Zwei-Knochen-IK: Ellbogenposition für Schulter S, Ziel T, Pol-Richtung P (Weltrichtung, in die der Ellbogen ausweicht); out: { E, W, pn } */
function ik(S, T, P, out) {
  const d0 = T.clone().sub(S); const d = d0.length();
  const dm = clamp(d, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.004);
  const u = d0.clone().multiplyScalar(1 / Math.max(d, 1e-6));
  const a = (L1 * L1 - L2 * L2 + dm * dm) / (2 * dm), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pn = P.clone().sub(u.clone().multiplyScalar(P.dot(u)));
  if (pn.lengthSq() < 1e-8) pn.set(0, -1, 0).sub(u.clone().multiplyScalar(-u.y));
  pn.normalize();
  out.E.copy(S).addScaledVector(u, a).addScaledVector(pn, hh);
  out.W.copy(S).addScaledVector(u, dm); out.pn.copy(pn);
  return d > L1 + L2 - 0.004;                // true = Ziel außer Reichweite
}

const lighten = (c, k) => new THREE.Color(c).lerp(new THREE.Color('#ffffff'), k);
const darken = (c, k) => new THREE.Color(c).multiplyScalar(k);
let _weave = null;
const figWeave = () => _weave || (_weave = weaveBump({ w: 256, h: 256, cells: 40, repeat: [1.2, 3] }));
const SIMPLE = ['jonas', 'mira', 'ben', 'aylin', 'sven', 'nora', 'kai', 'lea'];

export function buildFigure(key, opt = {}) {
  const lk = { ...LOOKS[key], ...(opt.look || {}), seed: (key.length * 7 + key.charCodeAt(0)) % 17 + 1 };
  const hi = opt.hi ?? !SIMPLE.includes(key);
  const phys = (c, r = 0.7, m = 0, extra = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, ...extra });
  const std = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const skinC = new THREE.Color(lk.skin);
  const mats = {
    skin: phys(lk.skin, 0.52, 0, { sheen: 0.45, sheenColor: lighten(skinC, 0.1), sheenRoughness: 0.55 }),
    skinDark: std(darken(lk.skin, 0.8), 0.6),
    lip: std(new THREE.Color(lk.skin).lerp(new THREE.Color('#B04A4A'), 0.62), 0.42), white: std('#F7F5F0', 0.28), cav: std('#4A1620', 0.8), brow: std(lk.brow || lk.hair, 0.6), nostril: std(darken(lk.skin, 0.4), 0.8),
    blush: new THREE.MeshBasicMaterial({ color: '#E57B6E', transparent: true, opacity: 0.18, depthWrite: false }),
  };
  mats.lipL = mats.lip;
  const hairBase = new THREE.Color(lk.hair), ht = hairTextures(lk.hair, lk.seed);
  mats.hair = phys('#ffffff', 0.5, 0, { map: ht.map, bumpMap: ht.bump, bumpScale: 1.6, sheen: 0.9, sheenColor: lighten(hairBase, 0.35), sheenRoughness: 0.4, clearcoat: 0.12, clearcoatRoughness: 0.5 });
  mats.hairBand = std('#E5565B', 0.6);
  mats.body = phys('#ffffff', 0.82, 0, { vertexColors: true, sheen: 0.55, sheenColor: lighten(new THREE.Color(lk.clothes), 0.25), sheenRoughness: 0.55, bumpMap: figWeave(), bumpScale: 0.7 });

  const group = new THREE.Group();            // Identität: Weltkoordinaten der Glieder
  /* ---- Knochen ---- */
  const root = new THREE.Bone(), spine = new THREE.Bone(), chest = new THREE.Bone();
  root.add(spine); spine.position.set(0, DIM.spineY, 0); spine.add(chest); chest.position.set(0, DIM.chestY - DIM.spineY, 0);
  const uaR = new THREE.Bone(), faR = new THREE.Bone(), uaL = new THREE.Bone(), faL = new THREE.Bone(), thR = new THREE.Bone(), shR = new THREE.Bone(), thL = new THREE.Bone(), shL = new THREE.Bone();
  group.add(root); [uaR, faR, uaL, faL, thR, shR, thL, shL].forEach((b) => group.add(b));
  const mbasis = new THREE.Matrix4();
  const setBone = (bone, pos, x, y, z) => { bone.position.copy(pos); mbasis.makeBasis(x, y, z); bone.quaternion.setFromRotationMatrix(mbasis); };
  // Bind-Pose: Arme hängen gerade, Beine sitzend (Oberschenkel vorwärts, Schienbein abwärts)
  const bx = new V3(1, 0, 0), bdn = new V3(0, -1, 0), bfw = new V3(0, 0, 1), bbk = new V3(0, 0, -1);
  [[-1, uaR, faR], [1, uaL, faL]].forEach(([sg, ua, fa]) => { const S = new V3(sg * DIM.shoulder.x, DIM.shoulder.y, DIM.shoulder.z); setBone(ua, S, bx, bdn, bbk); setBone(fa, S.clone().add(new V3(0, -L1, 0)), bx, bdn, bbk); });
  [[-1, thR, shR], [1, thL, shL]].forEach(([sg, th, sh]) => { setBone(th, new V3(sg * DIM.hip.x, DIM.hip.y, DIM.hip.z), bx, bfw, bdn); setBone(sh, new V3(sg * DIM.knee.x, DIM.knee.y, DIM.knee.z), bx, bdn, bbk); });
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton([root, spine, chest, uaR, faR, uaL, faL, thR, shR, thL, shL]);       // Reihenfolge = BONE-Indizes
  const body = new THREE.SkinnedMesh(buildBodyGeometry(lk), mats.body); body.frustumCulled = false; body.castShadow = true; body.receiveShadow = true; group.add(body); body.bind(skeleton, new THREE.Matrix4());

  const add = (parent, geo, mat, px = 0, py = 0, pz = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  /* ---- Hals, Kopf ---- */
  const neck = new THREE.Group(); neck.position.set(0, 0.612 - DIM.chestY, 0.004); chest.add(neck);
  add(neck, new THREE.CylinderGeometry(0.043, 0.05, 0.11, 18), mats.skin, 0, 0.032, 0.002);
  const head = new THREE.Group(); head.position.set(0, 0.075, 0.012); neck.add(head);
  const H = buildHead(lk, mats, hi);
  head.add(H.hc); H.hc.position.set(0, 0.115, 0);
  const { hc, hair, eyes, brows, setMouth } = H;

  /* ---- Kragen, Kapuze, Details ---- */
  const outfit = lk.outfit, clothC = new THREE.Color(lk.clothes);
  if (outfit === 'sweater' || outfit === 'shirt') { const c = add(chest, new THREE.TorusGeometry(0.066, 0.0125, 10, 30), std(lk.inner, 0.8), 0, 0.309, 0.004); c.rotation.x = Math.PI / 2 - 0.12; }
  if (outfit === 'tee' || outfit === 'blouse' || outfit === 'cardigan') { const c = add(chest, new THREE.TorusGeometry(0.064, 0.011, 10, 30), std(darken(lk.clothes, 0.9), 0.85), 0, 0.306, 0.004); c.rotation.x = Math.PI / 2 - 0.1; }
  if (outfit === 'hoodie') {
    const hm = phys(lk.clothes, 0.82, 0, { sheen: 0.55, sheenColor: lighten(clothC, 0.25), sheenRoughness: 0.55, bumpMap: figWeave(), bumpScale: 0.7 });
    const c = add(chest, new THREE.TorusGeometry(0.07, 0.025, 12, 32), hm, 0, 0.296, -0.006); c.rotation.x = Math.PI / 2 - 0.35;
    add(chest, new THREE.SphereGeometry(0.075, 18, 12), hm, 0, 0.272, -0.082, 1.2, 0.5, 0.9);
    [-1, 1].forEach((sd) => { add(chest, new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 6), std('#F2EEE6', 0.7), sd * 0.035, 0.205, 0.118); add(chest, new THREE.SphereGeometry(0.0075, 8, 6), std('#F2EEE6', 0.5), sd * 0.035, 0.14, 0.119); });
    add(chest, new THREE.BoxGeometry(0.17, 0.09, 0.012), std(darken(lk.clothes, 0.93), 0.9), 0, -0.07, 0.113).rotation.x = -0.1;      // Känguru-Tasche
  }
  if (outfit === 'shirt') { for (let i = 0; i < 4; i++) add(chest, new THREE.SphereGeometry(0.0055, 8, 6), std('#DDE0E8', 0.4), 0, 0.2 - i * 0.07, 0.123, 1, 1, 0.5); }

  /* ---- aufgesetzte Streifen: Ausschnitt, offene Strickjacke, Knopfleiste (scharfe Kanten statt Vertexfarben) ---- */
  const rows = torsoRows(lk);
  const strip = (y0, y1, hw, color, off = 0.0016, n = 14, mat = null) => {
    const pos = [], idx = [], cols = 7, o = new V3();
    for (let k = 0; k <= n; k++) { const y = y0 + (y1 - y0) * k / n, w = hw(y); for (let c = 0; c < cols; c++) { const x = -w + 2 * w * c / (cols - 1); pos.push(x, y - DIM.chestY, torsoSurfaceZ(rows, x, y) + off); } }
    for (let k = 0; k < n; k++) for (let c = 0; c < cols - 1; c++) { const a = k * cols + c, b = a + 1, d = a + cols, e = d + 1; idx.push(a, b, d, b, e, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat || new THREE.MeshStandardMaterial({ color, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.castShadow = false; m.receiveShadow = true; chest.add(m); return m;
  };
  const sk2 = lk.skin;
  if (outfit === 'sweater') strip(0.5, 0.612, (y) => (y - 0.5) * 0.62, lk.inner);
  if (outfit === 'cardigan') strip(0.33, 0.612, (y) => 0.012 + (y - 0.33) * 0.19, lk.inner);
  if (outfit === 'shirt') strip(0.2, 0.612, () => 0.012, lk.inner);
  if (outfit === 'blouse') strip(0.545, 0.612, (y) => 0.075 * Math.sqrt(Math.max(0, 1 - ((y - 0.612) / 0.075) ** 2)), sk2, 0.002);
  if (outfit === 'tee') strip(0.56, 0.612, (y) => 0.05 + (y - 0.56) * 0.3, sk2, 0.002);

  /* ---- Hände ---- */
  const limbs = new THREE.Group(); group.add(limbs);
  const hands = [buildHand(0, mats.skin, hi), buildHand(1, mats.skin, hi)];
  hands.forEach((h) => limbs.add(h.group));
  const arms = [0, 1].map((i) => ({ hand: hands[i], E: new V3(), W: new V3(), sh: new V3(), pn: new V3(0, -1, 0) }));

  /* ---- Schuhe ---- */
  const shoeM = std(lk.shoe, 0.55), soleM = std('#EDEAE4', 0.6);
  const shoes = [0, 1].map(() => { const g = new THREE.Group(); limbs.add(g);
    add(g, new THREE.SphereGeometry(0.05, 18, 12), shoeM, 0, 0.034, 0.05, 0.95, 0.62, 2.1); add(g, new THREE.BoxGeometry(0.098, 0.016, 0.255), soleM, 0, 0.008, 0.045);
    add(g, new THREE.SphereGeometry(0.03, 12, 8), shoeM, 0, 0.026, 0.135, 1.3, 0.7, 1.2); return { g }; });

  /* ---- Handy-Prop (an der rechten Hand oder auf dem Tisch) ---- */
  const phone = new THREE.Group(); group.add(phone); phone.visible = false;
  phone.scale.setScalar(1.28); add(phone, new THREE.BoxGeometry(0.074, 0.0095, 0.15), phys('#D9D6D0', 0.35, 0.3));
  add(phone, new THREE.BoxGeometry(0.064, 0.002, 0.138), new THREE.MeshStandardMaterial({ color: '#1D2840', roughness: 0.25, emissive: '#2A3F70', emissiveIntensity: 0.55 }), 0, 0.0052, 0);

  /* ---- Zustand → Bild ---- */
  const qa = new Q(), qb = new Q(), mtmp = new THREE.Matrix4(), tv = new V3(), lat = new V3();
  const API = {
    group, root, spine, chest, neck, head, hc, phone, arms, look: lk, skeleton,
    /** Weltposition eines Punktes im Kopf-Raum (für Ohr, Haare, Gesicht) */
    headPoint(x, y, z, out = new V3()) { hc.updateWorldMatrix(true, false); return out.set(x, y, z).applyMatrix4(hc.matrixWorld); },
    spinePoint(x, y, z, out = new V3()) { chest.updateWorldMatrix(true, false); return out.set(x, y - (DIM.chestY - DIM.spineY), z).applyMatrix4(chest.matrixWorld); },
    rootPoint(x, y, z, out = new V3()) { root.updateWorldMatrix(true, false); return out.set(x, y, z).applyMatrix4(root.matrixWorld); },
    /**
     * s: { pos:V3 (Becken), yaw, lean, side, twist, shrug, breath, time,
     *      head:{yaw,pitch,roll} (zusätzlich zum Zielblick), aim:V3|null (Blickziel in Welt), headW (0..1: Anteil der Kopfdrehung am Blick), eyeX, eyeY (zusätzlich),
     *      blink 0..1, squint 0..1, brow:{raise,angle,asym}, mouth:{smile,open,width}, cheeks,
     *      RH:{pos:V3, pole:V3, roll, curl, type, splay, thumb} (lokal −x), LH:{…} (lokal +x), phone:{pos:V3, quat:Q}|null, hair:{yaw,pitch,roll}, foot }
     */
    set(s) {
      root.position.copy(s.pos); root.rotation.set(0, s.yaw || 0, 0);
      const br = s.breath || 0, ln = ((s.lean || 0) + br * 0.012) * 1.12, tw = s.twist || 0, sd = s.side || 0, shrug = s.shrug || 0;
      spine.rotation.set(ln * 0.45, tw * 0.4, sd * 0.5); chest.rotation.set(ln * 0.55, tw * 0.6, sd * 0.5);
      chest.scale.set(1 + br * 0.012, 1 + br * 0.008, 1 + br * 0.02);
      root.updateMatrixWorld(true);
      // Kopf
      let hy = (s.head && s.head.yaw) || 0, hp = (s.head && s.head.pitch) || 0, hr = (s.head && s.head.roll) || 0;
      let ex = s.eyeX || 0, ey = s.eyeY || 0;
      neck.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
      if (s.aim) {
        neck.updateWorldMatrix(true, false);
        const inv = mtmp.copy(neck.matrixWorld).invert();
        tv.copy(s.aim).applyMatrix4(inv); tv.y -= 0.19;                         // vom Hals aus zum Ziel
        const dyaw = Math.atan2(tv.x, tv.z), dpit = Math.atan2(-tv.y, Math.hypot(tv.x, tv.z));
        const w = s.headW ?? 0.65, cy = clamp(dyaw, -1.25, 1.25), cp = clamp(dpit, -0.6, 0.7);
        hy += cy * w; hp += cp * w;
        ex += clamp((dyaw - hy) / 0.55, -1, 1); ey += clamp((dpit - hp) / 0.45, -1, 1);
      }
      neck.rotation.set(hp * 0.35, hy * 0.45, hr * 0.3); head.rotation.set(hp * 0.65, hy * 0.55, hr * 0.7);
      // Mimik
      const bl = clamp((s.blink || 0) + (s.squint || 0) * 0.55);
      eyes.forEach((e) => { e.g.scale.set(1, Math.max(0.08, 1 - 0.92 * bl), 1); e.pu.position.set(clamp(ex, -1, 1) * 0.0108, clamp(ey, -1, 1) * -0.0078, 0.0172); });
      const b = s.brow || {};
      brows.forEach((o, i) => { const asym = (i ? 1 : -1) * (b.asym || 0); o.g.position.y = 0.066 + ((b.raise || 0) + asym * 0.4) * 0.016 - bl * 0.004; o.g.rotation.z = o.sd * -(b.angle || 0) * 0.5 + (asym ? asym * 0.2 : 0); });
      setMouth(s.mouth || {});
      const h = s.hair || {}; hair.rotation.set(h.pitch || 0, h.yaw || 0, h.roll || 0);
      // Arme
      root.updateMatrixWorld(true);
      [s.RH, s.LH].forEach((t, i) => {            // Arm 0 = Schulter bei lokal −x (anatomisch: rechte Hand), Arm 1 = lokal +x (linke Hand)
        const A = arms[i], sg = i ? 1 : -1;
        A.sh.set(sg * (DIM.shoulder.x - shrug * 0.012), DIM.shoulder.y - DIM.chestY + shrug * 0.045, 0); chest.localToWorld(A.sh);
        if (!t) t = { pos: A.sh.clone().add(new V3(0, -0.5, 0.1)), pole: new V3(0, -1, 0) };
        ik(A.sh, t.pos, t.pole || new V3(sg * 0.6, -0.8, -0.3), A);
        // Knochen: x = Beuge-Achse (senkrecht zur Ebene Schulter–Ellbogen–Handgelenk), y = Gliedrichtung
        const uU = A.E.clone().sub(A.sh).normalize(), uF = A.W.clone().sub(A.E).normalize(), n = new V3().crossVectors(uU, A.pn);
        if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize();
        setBone(i ? uaL : uaR, A.sh, n, uU, new V3().crossVectors(n, uU)); setBone(i ? faL : faR, A.E, n, uF, new V3().crossVectors(n, uF));
        // Hand
        A.hand.group.position.copy(A.W); qa.setFromUnitVectors(Z, uF); A.hand.group.quaternion.copy(qa);
        qb.setFromAxisAngle(Z, (t.roll || 0) * (i ? 1 : -1)); A.hand.group.quaternion.multiply(qb);
        A.hand.set({ curl: t.curl ?? 0.3, splay: t.splay ?? 0.1, thumb: t.thumb ?? 0.3, type: t.type ?? 0, t: s.time || 0, seed: i * 5 + 2 });
      });
      // Beine: Becken-Hüfte → Knie → Fuß (sitzend, Füße auf dem Boden)
      lat.setFromMatrixColumn(root.matrixWorld, 0).normalize();
      [[-1, thR, shR, 0], [1, thL, shL, 1]].forEach(([sg, th, sh, li]) => {
        const hip = new V3(sg * DIM.hip.x, DIM.hip.y, DIM.hip.z).applyMatrix4(root.matrixWorld);
        const knee = new V3(sg * DIM.knee.x, DIM.knee.y, DIM.knee.z).applyMatrix4(root.matrixWorld);
        const foot = new V3(sg * 0.11, 0, 0.52).applyMatrix4(root.matrixWorld);
        foot.y = 0.05 + (sg > 0 ? (s.foot || 0) * 0.025 : 0);
        knee.y = Math.max(knee.y, foot.y + 0.44);
        const ankle = new V3(foot.x, foot.y + 0.04, foot.z - 0.02);
        const yT = knee.clone().sub(hip).normalize(), xT = lat.clone().sub(yT.clone().multiplyScalar(lat.dot(yT))).normalize();
        setBone(th, hip, xT, yT, new V3().crossVectors(xT, yT));
        const yS = ankle.clone().sub(knee).normalize(), xS = lat.clone().sub(yS.clone().multiplyScalar(lat.dot(yS))).normalize();
        setBone(sh, knee, xS, yS, new V3().crossVectors(xS, yS));
        const shoe = shoes[li]; shoe.g.position.set(foot.x, foot.y - 0.05, foot.z - 0.07); shoe.g.rotation.set(0, (s.yaw || 0) + (li ? -0.08 : 0.08), 0);
      });
      if (s.phone) { phone.visible = true; phone.position.copy(s.phone.pos); phone.quaternion.copy(s.phone.quat); } else phone.visible = false;
    },
    dispose() { group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); },
  };
  fixNormals(group);
  return API;
}
