// ============================================================
// Große Büro-Figuren (erfundene, illustrierte Personen – aus den Porträts der Oberfläche, ui.js: PEOPLE)
// Oberkörper mit zwei Armen (je zwei Glieder, Hand als Kreis) – die Hände werden über ein Ziel gesetzt (Zwei-Knochen-IK), damit Posen
// (Hörer am Ohr, Hände im Haar, Kopf in den Händen, Schulterzucken) einfach zwischen Zielen überblendet werden können.
// Alles generisch und geometrisch (bewusst schlicht, gleiche Formensprache wie die Porträts); keine echten Personen.
// Koordinaten der Figur: Porträt-Szene 300 × 330 (Kopf-Mitte 150/106, Hals 150/150, Schultergelenke 74/206 und 226/206).
// ============================================================
import { portraitParts } from '../ui.js';

const SH = { L: [74, 206], R: [226, 206] };
const L1 = 80, L2 = 84;                                   // Oberarm, Unterarm

/** Zwei-Knochen-IK: Ellbogenposition für Schulter S, Ziel T; bend = ±1 (Seite, auf die der Ellbogen ausweicht) */
function ik(S, T, bend) {
  const dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy) || 1;
  const dm = Math.min(Math.max(d, Math.abs(L1 - L2) + 2), L1 + L2 - 1);
  const ux = dx / d, uy = dy / d, a = (L1 * L1 - L2 * L2 + dm * dm) / (2 * dm), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const W = [S[0] + ux * dm, S[1] + uy * dm];
  return { E: [S[0] + ux * a - uy * hh * bend, S[1] + uy * a + ux * hh * bend], W };
}

const BROWS = {
  neutral: (c) => `<path d="M124 94 Q134 89 144 93M156 93 Q166 89 176 94" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
  angry: (c) => `<path d="M123 90 Q134 92 146 100M177 90 Q166 92 154 100" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`,
  worried: (c) => `<path d="M123 98 Q134 92 146 88M177 98 Q166 92 154 88" stroke="${c}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`,
  raised: (c) => `<path d="M124 89 Q134 83 144 87M156 87 Q166 83 176 89" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
};
const MOUTHS = {
  smile: '<path d="M137 134 Q150 145 163 134" stroke="#A4524A" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
  flat: '<path d="M139 138 L161 138" stroke="#A4524A" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
  frown: '<path d="M138 143 Q150 132 162 143" stroke="#A4524A" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
  open: '<ellipse cx="150" cy="138" rx="8" ry="6" fill="#7A2E2E"/><path d="M143 134 Q150 136 157 134" stroke="#fff" stroke-width="2" fill="none"/>',
  wide: '<ellipse cx="150" cy="140" rx="11" ry="9" fill="#7A2E2E"/><path d="M141 133 Q150 136 159 133" stroke="#fff" stroke-width="2.2" fill="none"/>',
};

/** Baut eine Figur. o: { clothes? }  → { el, set(state) }
 *  state: { L:[x,y], R:[x,y] (Handziele), bendL, bendR (±1), head:{rot,dx,dy}, look:[dx,dy], brow, mouth, blink (0–1), shrug (px), lean (px), phone: 0|1, phoneAng } */
export function figure(E, key, o = {}) {
  const { h } = E;
  const P = portraitParts(key);
  const sk = P.sk, skd = P.skd, cl = o.clothes || P.P.clothes;
  const browCol = P.P.style === 'bald' ? '#6F6F75' : P.hr;
  let body = P.body; if (o.clothes) body = body.split(P.P.clothes).join(o.clothes);
  body = `<rect x="44" y="222" width="212" height="112" fill="${cl}"/>` + body;
  const features = `<g class="eyes" style="transform-origin:150px 106px"><ellipse cx="134" cy="106" rx="6" ry="4.2" fill="#fff"/><ellipse cx="166" cy="106" rx="6" ry="4.2" fill="#fff"/><g class="pup"><circle cx="134.6" cy="106.4" r="3.2" fill="#2B1B12"/><circle cx="166.6" cy="106.4" r="3.2" fill="#2B1B12"/></g></g>` +
    `<g class="brow"></g>` +
    `<path d="M150 108 Q145 122 148 126 Q152 128 156 126" stroke="${skd}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
    `<circle cx="126" cy="124" r="7" fill="#E57B6E" opacity=".22"/><circle cx="174" cy="124" r="7" fill="#E57B6E" opacity=".22"/>` +
    Object.entries(MOUTHS).map(([k, v]) => `<g class="mo-${k}" style="display:${k === 'smile' ? 'block' : 'none'}">${v}</g>`).join('');
  const arm = (side) => `<g class="arm-${side}"><line class="ua" stroke="${cl}" stroke-width="35" stroke-linecap="round"/><line class="fa" stroke="${cl}" stroke-width="31" stroke-linecap="round"/><line class="wr" stroke="${sk}" stroke-width="20" stroke-linecap="round"/><circle class="hd" r="15.5" fill="${sk}"/></g>`;
  const phone = '<g class="phone" style="display:none"><rect x="-13" y="-30" width="26" height="60" rx="7" fill="#10151F" stroke="#3A4358" stroke-width="2"/><rect x="-9" y="-25" width="18" height="48" rx="3" fill="#1D2840"/></g>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 330" width="100%" height="100%" style="display:block;overflow:visible">` +
    `<g class="hback">${P.back}</g>` +
    `<g class="torso">${body}${P.neck}</g>` +
    `<g class="head">${P.face}${P.front}${features}${P.beard}${P.glasses}</g>` +
    `${arm('L')}${arm('R')}${phone}</svg>`;
  const el = h('div', { class: 'abs', style: { width: 300, height: 330, transformOrigin: '0 0' } });
  el.innerHTML = svg;
  const q = (s) => el.querySelector(s);
  const refs = {
    hback: q('.hback'), torso: q('.torso'), head: q('.head'), eyes: q('.eyes'), pup: q('.pup'), brow: q('.brow'), phone: q('.phone'),
    arms: { L: { ua: q('.arm-L .ua'), fa: q('.arm-L .fa'), wr: q('.arm-L .wr'), hd: q('.arm-L .hd') }, R: { ua: q('.arm-R .ua'), fa: q('.arm-R .fa'), wr: q('.arm-R .wr'), hd: q('.arm-R .hd') } },
    mouths: Object.fromEntries(Object.keys(MOUTHS).map((k) => [k, q('.mo-' + k)])),
  };
  const last = {};
  const setAttr = (n, a, v) => { const s = v.toFixed(2); if (n.getAttribute(a) !== s) n.setAttribute(a, s); };
  function setArm(side, T, bend, dy) {
    const S = [SH[side][0], SH[side][1] + dy], A = refs.arms[side], { E: Ep, W } = ik(S, T, bend);
    setAttr(A.ua, 'x1', S[0]); setAttr(A.ua, 'y1', S[1]); setAttr(A.ua, 'x2', Ep[0]); setAttr(A.ua, 'y2', Ep[1]);
    const wx = Ep[0] + (W[0] - Ep[0]) * 0.74, wy = Ep[1] + (W[1] - Ep[1]) * 0.74;          // der Ärmel endet kurz vor dem Handgelenk
    setAttr(A.fa, 'x1', Ep[0]); setAttr(A.fa, 'y1', Ep[1]); setAttr(A.fa, 'x2', wx); setAttr(A.fa, 'y2', wy);
    setAttr(A.wr, 'x1', wx); setAttr(A.wr, 'y1', wy); setAttr(A.wr, 'x2', W[0]); setAttr(A.wr, 'y2', W[1]);
    setAttr(A.hd, 'cx', W[0]); setAttr(A.hd, 'cy', W[1]);
    return W;
  }
  function set(st) {
    const sh = st.shrug || 0, lean = st.lean || 0, hd = st.head || {};
    refs.torso.style.transform = `translate(${lean * 0.4}px,${-sh * 0.6}px)`;
    const ht = `translate(${(hd.dx || 0) + lean}px,${(hd.dy || 0) - sh * 0.4}px) rotate(${hd.rot || 0}deg)`;
    refs.head.style.transformOrigin = '150px 156px'; refs.head.style.transform = ht;
    refs.hback.style.transformOrigin = '150px 156px'; refs.hback.style.transform = ht;
    const lk = st.look || [0, 0];
    refs.pup.style.transform = `translate(${lk[0]}px,${lk[1]}px)`;
    refs.eyes.style.transform = `scaleY(${1 - 0.92 * (st.blink || 0)})`;
    const bk = st.brow || 'neutral'; if (last.brow !== bk) { refs.brow.innerHTML = BROWS[bk](browCol); last.brow = bk; }
    const mk = st.mouth || 'smile'; if (last.mouth !== mk) { Object.entries(refs.mouths).forEach(([k, n]) => { n.style.display = k === mk ? 'block' : 'none'; }); last.mouth = mk; }
    const dy = -sh * 0.6;
    setArm('L', st.L || [96, 268], st.bendL ?? 1, dy);
    const WR = setArm('R', st.R || [204, 268], st.bendR ?? -1, dy);
    refs.phone.style.display = st.phone ? 'block' : 'none';
    if (st.phone) refs.phone.setAttribute('transform', `translate(${(WR[0] + 6).toFixed(2)},${(WR[1] - 10).toFixed(2)}) rotate(${st.phoneAng ?? -10})`);
  }
  set({});
  return { el, set };
}

/** Posen als Handziele (Figur-Koordinaten); Überblendung: lerpPose(a, b, p) */
export const POSE = {
  rest:      { L: [112, 248], R: [188, 248], bendL: 1, bendR: -1 },
  typing:    { L: [122, 252], R: [182, 252], bendL: 1, bendR: -1 },
  phone:     { L: [118, 248], R: [212, 124], bendL: 1, bendR: -1, phone: 1, phoneAng: -8 },
  phoneGest: { L: [46, 224], R: [212, 124], bendL: 1, bendR: -1, phone: 1, phoneAng: -8 },
  hair:      { L: [108, 82], R: [192, 82], bendL: -1, bendR: 1 },
  hairPull:  { L: [104, 68], R: [196, 68], bendL: -1, bendR: 1 },
  temples:   { L: [114, 104], R: [186, 104], bendL: -1, bendR: 1 },
  faceHands: { L: [126, 138], R: [174, 138], bendL: 1, bendR: -1 },
  shrug:     { L: [34, 200], R: [266, 200], bendL: 1, bendR: -1 },
  chin:      { L: [112, 248], R: [168, 144], bendL: 1, bendR: -1 },
  mouse:     { L: [112, 248], R: [366, 252], bendL: 1, bendR: -1 },
};
const lerpArr = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
export function lerpPose(a, b, p) {
  const A = POSE[a] || a, B = POSE[b] || b, pick = (f) => (p < 0.5 ? A[f] : B[f]);
  return { L: lerpArr(A.L, B.L, p), R: lerpArr(A.R, B.R, p), bendL: pick('bendL'), bendR: pick('bendR'), phone: pick('phone') || 0, phoneAng: pick('phoneAng') };
}
