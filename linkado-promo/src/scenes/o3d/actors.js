// ============================================================
// Darsteller*innen: Spielanweisungen (Skripte) für Tom, Lena und Anna – jede Aktion hängt an den hits der timeline.json.
// Jedes Skript ist eine reine Funktion der Zeit t und liefert Zielwerte (Körper, Kopf, Blick, Mimik, Handziele); der Actor mischt Nebenbewegungen dazu
// (Atmen, Blinzeln, Blickwechsel, Sprechen, Nachschwingen der Haare) und löst die Arme per IK.
// Prinzipien: Vorbereitung (kurzes Zurückziehen vor der Aktion), weiche Übergänge mit leichtem Überschwingen, Hände fahren Bögen, der Blick eilt dem Kopf voraus,
// Mimik wechselt in 0,25–0,4 s, nichts bleibt starr.
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { track, ez, prog, lerp, clamp, blink, saccade, talk, noise } from './anim.js';
import { deskLayout, DESK_H, SEAT_H, MON } from './world.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Q = THREE.Quaternion;

/* ---------------------------------------------------------------- Mimik */
export const EXPR = {
  neutral:    { raise: 0.0,  angle: 0.0,  asym: 0.0, smile: 0.14,  open: 0.0,  width: 1.0,  squint: 0.0,  cheeks: 0 },
  focus:      { raise: -0.1, angle: 0.25, asym: 0.0, smile: 0.04,  open: 0.0,  width: 0.95, squint: 0.15, cheeks: 0 },
  hopeful:    { raise: 0.25, angle: -0.1, asym: 0.0, smile: 0.35,  open: 0.0,  width: 1.05, squint: 0.0,  cheeks: 0.2 },
  surprised:  { raise: 1.0,  angle: -0.2, asym: 0.0, smile: -0.05, open: 0.42, width: 0.8,  squint: 0.0,  cheeks: 0 },
  angry:      { raise: -0.3, angle: 1.0,  asym: 0.0, smile: -0.7,  open: 0.0,  width: 1.1,  squint: 0.25, cheeks: 0 },
  annoyed:    { raise: -0.1, angle: 0.65, asym: 0.2, smile: -0.4,  open: 0.0,  width: 1.0,  squint: 0.2,  cheeks: 0 },
  worried:    { raise: 0.5,  angle: -0.9, asym: 0.0, smile: -0.35, open: 0.0,  width: 0.95, squint: 0.0,  cheeks: 0 },
  confused:   { raise: 0.3,  angle: -0.4, asym: 0.7, smile: -0.15, open: 0.06, width: 0.9,  squint: 0.1,  cheeks: 0 },
  sad:        { raise: 0.2,  angle: -1.0, asym: 0.0, smile: -0.8,  open: 0.0,  width: 0.9,  squint: 0.25, cheeks: 0 },
  happy:      { raise: 0.45, angle: -0.05, asym: 0.0, smile: 1.0,  open: 0.28, width: 1.2,  squint: 0.28, cheeks: 1 },
  relieved:   { raise: 0.3,  angle: -0.2, asym: 0.0, smile: 0.55,  open: 0.1,  width: 1.1,  squint: 0.22, cheeks: 0.6 },
  determined: { raise: -0.2, angle: 0.45, asym: 0.0, smile: 0.02,  open: 0.0,  width: 0.95, squint: 0.1,  cheeks: 0 },
};
/** Mimik-Spur: keys = [[t, name, dauer?], …]; Übergang beginnt bei t */
export function exprAt(keys, t, defDur = 0.3) {
  let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const [t0, name, d = defDur] = keys[i], cur = EXPR[name];
  if (i === 0 || t >= t0 + d) return { ...cur };
  const prev = EXPR[keys[i - 1][1]], p = ez.io2((t - t0) / d), o = {};
  for (const k in cur) o[k] = lerp(prev[k], cur[k], p);
  return o;
}

/** Handziele mischen: modes = [{w, pos, pole, roll}] – Gewichte werden normiert; beim Übergang hebt sich die Hand auf einem Bogen */
function blendHand(modes, arc = 0.05) {
  let sw = 0; modes.forEach((m) => { sw += m.w; });
  if (sw < 1e-5) sw = 1;
  const pos = V(), pole = V(); let roll = 0, s2 = 0, curl = 0, type = 0, splay = 0, thumb = 0;
  modes.forEach((m) => { const w = m.w / sw; pos.addScaledVector(m.pos, w); pole.addScaledVector(m.pole, w); roll += (m.roll || 0) * w; s2 += w * w; curl += (m.curl ?? 0.3) * w; type += (m.type || 0) * w; splay += (m.splay ?? 0.1) * w; thumb += (m.thumb ?? 0.3) * w; });
  pos.y += arc * 2 * (1 - s2);
  return { pos, pole, roll, curl, type, splay, thumb };
}

/* ---------------------------------------------------------------- Körper-Raum */
const fwd = (yaw) => V(Math.sin(yaw), 0, Math.cos(yaw));
const lat = (yaw) => V(Math.cos(yaw), 0, -Math.sin(yaw));       // zur linken Seite der Person
const polePt = (yaw, side, out = 0.8, down = 0.7, fw = -0.1) => lat(yaw).multiplyScalar(side * out).add(V(0, -down, 0)).addScaledVector(fwd(yaw), fw);   // side +1 = linker Arm (lokal +x), −1 = rechter Arm

export class Actor {
  constructor(key, fig, script, opt = {}) {
    this.key = key; this.fig = fig; this.script = script; this.L = deskLayout(key); this.seed = opt.seed ?? 1; this.opt = opt;
    this.pelvis = V(this.L.seat.x, SEAT_H + 0.1, this.L.seat.z);
    this.screenC = this.L.mon.clone().setY(DESK_H + MON.standH + MON.h / 2 + 0.02);
    this.fig.group.visible = true;
  }
  /** desk-space → Welt */
  dp(x, y, z) { return this.L.toW(x, y, z); }
  /** Körper-Raum (Becken, Blickrichtung yaw) → Welt */
  rp(yaw, x, y, z) { return this.pelvis.clone().addScaledVector(lat(yaw), x).addScaledVector(fwd(yaw), z).add(V(0, y, 0)); }
  typingHand(t, side, amp = 1) {
    const L = this.L, yaw = L.kbdYaw, ph = side > 0 ? 0.3 : 1.7, seed = this.seed + (side > 0 ? 3 : 8);
    const bob = Math.max(0, Math.sin(t * (10.5 + side * 1.6) + ph)) * 0.011 * amp, bob2 = Math.max(0, Math.sin(t * 7.3 + ph * 2)) * 0.006 * amp;
    return L.kbd.clone().addScaledVector(lat(yaw), side * 0.085 + noise(t, seed, 3) * 0.022 * amp).addScaledVector(fwd(yaw), noise(t, seed + 9, 2.5) * 0.018 * amp + 0.005).setY(DESK_H + 0.047 + bob + bob2);
  }
  update(t, ctx) {
    const A = this, fig = this.fig, key = this.key;
    const run = (real) => {
      ctx.hp = real ? (x, y, z) => fig.headPoint(x, y, z) : (x, y, z) => A.pelvis.clone().add(V(x, 0.62 + y, z)).addScaledVector(fwd(A.L.seatYaw), 0.15);
      const c = A.script(t, A, ctx);
      const ex = c.expr || EXPR.neutral, tk = c.talk || { open: 0, nod: 0, emph: 0 };
      const sac = saccade(t, A.seed, c.sacc ?? 0.35), br = (Math.sin((2 * Math.PI * t) / 3.9 + A.seed) * 0.5 + 0.5);
      const yaw = c.yaw ?? A.L.seatYaw;
      const head = { yaw: ((c.head && c.head.yaw) || 0) + noise(t, A.seed + 1, 0.35) * 0.04 + tk.nod * 0.015, pitch: ((c.head && c.head.pitch) || 0) + noise(t, A.seed + 2, 0.3) * 0.03 + tk.nod * 0.07 * (1 - 0.5 * (c.calm || 0)), roll: ((c.head && c.head.roll) || 0) + noise(t, A.seed + 4, 0.28) * 0.025 };
      const st = {
        pos: A.pelvis.clone().add(V(0, (c.dy || 0) + br * 0.004, 0)).addScaledVector(fwd(yaw), (c.dz || 0)), yaw, lean: (c.lean || 0) + noise(t, A.seed + 6, 0.22) * 0.015, side: (c.side || 0) + noise(t, A.seed + 7, 0.2) * 0.012, twist: c.twist || 0,
        shrug: c.shrug || 0, breath: br * (c.breath ?? 1), head, aim: c.aim, headW: c.headW ?? 0.7, eyeX: sac[0] * (c.sacc ?? 1) * 0.6, eyeY: sac[1] * (c.sacc ?? 1) * 0.6,
        blink: c.blink ?? blink(t, A.seed), squint: ex.squint + (c.squint || 0),
        brow: { raise: ex.raise + tk.emph * 0.25 + (c.browRaise || 0), angle: ex.angle, asym: ex.asym }, mouth: { smile: ex.smile + (c.smileAdd || 0), open: clamp(ex.open + tk.open * (c.talkOpen ?? 0.75)), width: ex.width * (1 - tk.open * 0.08) },
        RH: blendHand(c.RH || [], c.arc ?? 0.05), LH: blendHand(c.LH || [], c.arc ?? 0.05), foot: c.foot || 0, time: t,
      };
      // Tippen erkennen: Hand dicht über der Tastatur → Finger tippen (Amplitude), leicht gekrümmt
      [st.RH, st.LH].forEach((hnd) => { const d = Math.hypot(hnd.pos.x - A.L.kbd.x, hnd.pos.z - A.L.kbd.z), h = hnd.pos.y - (DESK_H + 0.047); const k = clamp(1 - d / 0.26) * clamp(1 - Math.abs(h) / 0.06); if (k > 0.01 && !(hnd.type > 0)) { hnd.type = k; hnd.curl = lerp(hnd.curl, 0.4, k); } });
      // Haare: Nachschwingen aus der Bewegung der letzten 0,09 s
      if (c.hairLag !== false && (fig.look.style === 'long' || fig.look.style === 'curly' || fig.look.style === 'bun')) {
        const p = A.script(t - 0.09, A, { ...ctx, hp: ctx.hp }); const ph = p.head || {}, ch = c.head || {};
        const dy = (c.yaw ?? A.L.seatYaw) - (p.yaw ?? A.L.seatYaw) + ((ch.yaw || 0) - (ph.yaw || 0)), dp = ((c.lean || 0) - (p.lean || 0)) + ((ch.pitch || 0) - (ph.pitch || 0)), dr = (ch.roll || 0) - (ph.roll || 0);
        st.hair = { yaw: clamp(-dy * 1.1, -0.3, 0.3), pitch: clamp(-dp * 0.9 + 0.02, -0.3, 0.3), roll: clamp(-dr * 1.0 - dy * 0.3, -0.3, 0.3) };
      }
      fig.set(st);
      return { st, c };
    };
    run(false); const { st, c } = run(true); this.yawNow = st.yaw;
    if (c.phone) { const ph = c.phone(fig, A); fig.phone.visible = true; fig.phone.position.copy(ph.pos); fig.phone.quaternion.copy(ph.quat); } else fig.phone.visible = false;
    return c;
  }
}

/** Handy-Pose: liegend (Tisch) oder in der Hand (Handgelenk + Unterarmrichtung); screenUp = Richtung, in die der Bildschirm zeigt */
export function phoneInHand(fig, handIdx, toHead, gripW = 1, rest = null) {
  const a = fig.arms[handIdx], dir = a.W.clone().sub(a.E).normalize();
  const pos = a.W.clone().addScaledVector(dir, 0.07);
  const zp = dir.clone(), yp = toHead.clone().sub(zp.clone().multiplyScalar(toHead.dot(zp))).normalize(), xp = new THREE.Vector3().crossVectors(yp, zp).normalize();
  const m = new THREE.Matrix4().makeBasis(xp, yp, zp), q = new Q().setFromRotationMatrix(m);
  if (rest && gripW < 1) { pos.lerpVectors(rest.pos, pos, gripW); q.copy(rest.quat).slerp(q, gripW); }
  return { pos, quat: q };
}
export const phoneRest = (pos, yaw) => ({ pos: pos.clone(), quat: new Q().setFromEuler(new THREE.Euler(0, yaw, 0)) });

/* ================================================================ TOM – „Der Allrounder“ (4,0–8,5; Pings 4,75 · 5,375 · 6,0) */
export function scriptTom(t, A, ctx) {
  const P = [4.75, 5.375, 6.0], L = A.L, base = L.seatYaw;
  const a = ez.io2(prog(t, 4.96, 5.3)), b = ez.io2(prog(t, 5.4, 6.0)), g = ez.io2(prog(t, 5.26, 5.4));            // a: weg von der Tastatur · b: Hörer ans Ohr · g: Griff
  const yaw = base - 0.5 * ez.io2(prog(t, 5.3, 6.3)) + 0.04 * Math.sin(t * 0.9);
  const startle = (ez.out3(prog(t, 4.82, 4.92)) * (1 - ez.io2(prog(t, 4.92, 5.3)))) * 0.1;
  const sit = ez.io2(prog(t, 4.8, 4.97)) * 0.1 - 0.03 * ez.io2(prog(t, 4.97, 5.25)), call = ez.io2(prog(t, 5.9, 6.4));
  const lean = 0.2 - 0.3 * startle * 10 - 0.0 + 0.1 * ez.io2(prog(t, 5.0, 5.25)) - 0.2 * call;
  const tk = talk(t, 5.55, 8.4, 7, false);
  const gest = ez.io2(prog(t, 5.9, 6.3));
  // Blick: Bildschirm → (Telefon) geradeaus/oben → Kamera → Bildschirm
  const wCam = ez.io2(prog(t, 6.7, 7.0)) * (1 - ez.io2(prog(t, 7.6, 7.9))), wFwd = ez.io2(prog(t, 5.55, 5.9)) * (1 - ez.io2(prog(t, 6.7, 6.9))) * (1 - wCam) + 0.0;
  const aim = A.screenC.clone().lerp(ctx.camPos, wCam).lerp(A.rp(yaw, -0.2, 0.9, 1.4), wFwd * 0.6);
  const expr = exprAt([[0, 'focus'], [4.84, 'surprised', 0.16], [5.1, 'annoyed', 0.35], [5.9, 'angry', 0.45], [7.1, 'annoyed', 0.7], [7.9, 'angry', 0.6]], t);
  // Handziele
  const ear = ctx.hp(-0.2, -0.1, -0.025);
  const deskPh = L.phone.clone().add(V(0, 0.06, 0));
  const RHm = [
    { w: 1 - a, pos: A.typingHand(t, -1).add(V(0, startle, 0)), pole: polePt(base, -1) },
    { w: a * (1 - b), pos: deskPh, pole: polePt(base, -1, 0.7, 0.8), roll: 0.3 },
    { w: a * b, pos: ear, pole: polePt(yaw, -1, 0.9, 0.6, 0.0), roll: -0.4 },
  ];
  const gx = Math.sin(t * 3.1) * 0.06, gy = Math.sin(t * 2.2 + 1) * 0.045 - tk.nod * 0.07;
  const LHm = [
    { w: 1 - a, pos: A.typingHand(t, 1).add(V(0, startle, 0)), pole: polePt(base, 1) },
    { w: a * (1 - gest), pos: A.rp(yaw, 0.2, 0.19, 0.3), pole: polePt(yaw, 1), roll: 0 },
    { w: a * gest, pos: A.rp(yaw, 0.3 + gx, 0.5 + gy, 0.4), pole: polePt(yaw, 1, 1.0, 0.4, 0.1), roll: Math.PI * 0.55 },
  ];
  const rest = phoneRest(deskPh.clone().setY(DESK_H + 0.006), base);
  return {
    yaw, lean: Math.max(-0.05, lean), dy: 0, head: { yaw: Math.sin(t * 4.6) * 0.05 * tk.emph * call, pitch: -0.08 * call, roll: -0.04 * call + 0.1 * tk.nod * Math.sin(t * 5) }, aim, headW: 0.7, expr, talk: tk,
    shrug: 0.25 * call * (1 - tk.open), RH: RHm, LH: LHm, foot: call * Math.max(0, Math.sin(t * 8.5)), arc: 0.07,
    phone: (fig) => {
      const hand = phoneInHand(fig, 0, ctx.hp(0, 0, 0).sub(fig.arms[0].W), g * 1, rest), lock = ez.io2(prog(t, 5.8, 6.0));
      if (lock <= 0) return hand;
      // am Ohr: senkrecht, Bildschirm zum Kopf
      const o = ctx.hp(0, 0, 0), pos = ctx.hp(-0.163, -0.012, 0.004), zp = ctx.hp(0, 0.93, 0.36).sub(o).normalize(), yp0 = ctx.hp(1, 0, 0).sub(o);
      const yp = yp0.sub(zp.clone().multiplyScalar(yp0.dot(zp))).normalize(), xp = new THREE.Vector3().crossVectors(yp, zp).normalize();
      const q = new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xp, yp, zp));
      return { pos: hand.pos.clone().lerp(pos, lock), quat: hand.quat.clone().slerp(q, lock) };
    },
  };
}

/* ================================================================ LENA – „Das fertige Portal“ (8,5–13,0; Pings 9,25 · 9,875 · 10,5) */
export function scriptLena(t, A, ctx) {
  const L = A.L, base = L.seatYaw, m = L.m;
  const open = ez.io2(prog(t, 9.25, 9.5)), startle = ez.out3(prog(t, 9.27, 9.38)) * (1 - ez.io2(prog(t, 9.38, 9.8))) * 0.1;
  const shr = ez.back(prog(t, 9.875, 10.4), 1.3), relax = ez.io2(prog(t, 11.3, 12.1)), sigh = Math.sin(Math.PI * prog(t, 11.7, 12.5)) ** 1.5;
  const turn = ez.io2(prog(t, 9.95, 10.85));                                        // dreht den Stuhl zur Kamera (die Kamera sitzt hinter ihr)
  const camYaw = Math.atan2(ctx.camPos.x - A.pelvis.x, ctx.camPos.z - A.pelvis.z), dTurn = Math.atan2(Math.sin(camYaw - base), Math.cos(camYaw - base));
  const yaw = base + dTurn * 0.9 * turn + 0.03 * Math.sin(t * 0.8);
  const lean = 0.2 - 0.2 * open + 0.04 * sigh;
  // Blick: Bildschirm → (Fenster überfliegen) → Kamera (Blickkontakt) → hoch zu den schwebenden Fenstern → Kamera
  const wCam = ez.io2(prog(t, 10.05, 10.35)) * (1 - ez.io2(prog(t, 10.9, 11.2))) + ez.io2(prog(t, 12.0, 12.3)) * 0.8;
  const wUp = ez.io2(prog(t, 10.9, 11.2)) * (1 - ez.io2(prog(t, 11.9, 12.2)));
  const aim = A.screenC.clone().add(V(Math.sin(t * 2.3) * 0.25 * ez.io2(prog(t, 9.3, 9.6)) * (1 - turn), Math.sin(t * 1.7) * 0.1, 0)).lerp(ctx.camPos, wCam).lerp(A.screenC.clone().add(V(0.0, 0.7, 0.35)), wUp * 0.8);
  const expr = exprAt([[0, 'hopeful'], [9.27, 'surprised', 0.14], [9.55, 'confused', 0.3], [10.4, 'worried', 0.4], [11.2, 'confused', 0.5], [12.2, 'sad', 0.6]], t);
  const tk = talk(t, 10.1, 11.0, 21, true);                                         // murmelt „Hm?“ (nur Mundbewegung, kein Ton)
  const typ = 1 - ez.io2(prog(t, 9.2, 9.34));
  const spread = shr * (1 - relax);
  const palm = Math.PI * 0.8;
  const RHm = [
    { w: typ, pos: A.typingHand(t, -1, 0.6).add(V(0, startle, 0)), pole: polePt(base, -1) },
    { w: (1 - typ) * (1 - spread) * (1 - relax * 0 ), pos: A.rp(yaw, -0.2, 0.2, 0.3), pole: polePt(yaw, -1) },
    { w: (1 - typ) * spread, pos: A.rp(yaw, -0.44 - 0.02 * Math.sin(t * 2.2), 0.46 + 0.02 * Math.sin(t * 1.7), 0.3), pole: polePt(yaw, -1, 1.0, 0.3, 0.1), roll: palm },
  ];
  const LHm = [
    { w: typ, pos: A.typingHand(t, 1, 0.6).add(V(0, startle, 0)), pole: polePt(base, 1) },
    { w: (1 - typ) * (1 - spread), pos: A.rp(yaw, 0.2, 0.2, 0.3), pole: polePt(yaw, 1) },
    { w: (1 - typ) * spread, pos: A.rp(yaw, 0.44 + 0.02 * Math.sin(t * 2.0 + 1), 0.46 + 0.02 * Math.sin(t * 1.9), 0.3), pole: polePt(yaw, 1, 1.0, 0.3, 0.1), roll: palm },
  ];
  return {
    yaw, lean, head: { roll: m * 0.2 * shr * (1 - relax) - 0.05 * sigh, pitch: -0.05 * shr + 0.1 * sigh, yaw: 0 }, aim, headW: 0.75, expr, talk: tk, talkOpen: 0.4, calm: 1,
    shrug: shr * (1 - relax * 0.9) * 1.0, RH: RHm, LH: LHm, arc: 0.06, sacc: lerp(1, 2.2, ez.io2(prog(t, 9.3, 9.5)) * (1 - turn)),
    breath: 1 + 1.4 * sigh, dy: -0.01 * sigh,
  };
}

/* ================================================================ ANNA – „Die offene Basis“ (13,0–17,5; Pings 13,75 · 14,375 · 15,0) + Nacht-Übergang (22,5–30,0) */
export function scriptAnna(t, A, ctx) {
  const L = A.L, base = L.seatYaw;
  const night = t >= 17.8;
  // --- Akt I: Tab-Flut, Haareraufen, Zusammensinken ---
  const wHair = ez.back(prog(t, 14.375, 14.95), 1.1) * (1 - ez.io2(prog(t, 17.8, 18.6)));
  const tug = Math.sin(Math.PI * prog(t, 15.0, 15.45)) ** 1.2 * (t < 15.6 ? 1 : 0);
  const sink = ez.io2(prog(t, 15.7, 16.9));
  const faceW = ez.io2(prog(t, 17.8, 18.6));                      // später: Kopf in den Händen
  // --- Übergang: Kopf heben, Maus, Klick, Staunen, Lächeln ---
  const lift = ez.io2(prog(t, 23.6, 24.5)), mouseW = ez.io2(prog(t, 24.1, 24.85)), clickDip = Math.sin(Math.PI * prog(t, 24.98, 25.14)) * (t >= 24.98 && t < 25.14 ? 1 : 0);
  const happy = ez.io2(prog(t, 27.6, 28.4)), relief = ez.io2(prog(t, 27.9, 28.5)) * (1 - ez.io2(prog(t, 29.0, 29.5)));
  const lookPhone = ez.io2(prog(t, 28.55, 28.85)) * (1 - ez.io2(prog(t, 29.15, 29.45)));
  const dive = ez.io2(prog(t, 29.3, 30.0));
  const joy = ez.io2(prog(t, 27.45, 27.9)) * (1 - ez.io2(prog(t, 28.95, 29.35)));                // „Wow“: beide Hände an die Wangen
  let yaw = base, lean, headPitch = 0, headRoll = 0;
  if (!night) {
    lean = 0.2 + 0.12 * ez.io2(prog(t, 13.7, 14.4)) + 0.1 * sink; headPitch = 0.05 * sink; yaw = base;
  } else {
    lean = lerp(0.62, 0.2, lift) - 0.1 * happy * relief - 0.12 * joy + 0.1 * dive - 0.35 * 0; headPitch = lerp(0.2, 0.0, lift);
    headRoll = lerp(-0.08, 0, lift);
    yaw = base - 0.1 * lift;
  }
  const squint = night ? 0 : 0.55 * ez.io2(prog(t, 13.75, 14.3)) * (1 - ez.io2(prog(t, 14.3, 14.6)));
  const aimScreen = A.screenC.clone();
  const phoneAt = A.dp(L.kbX + 0.62, DESK_H + 0.06, -0.12);
  let aim = aimScreen.clone().lerp(phoneAt, lookPhone);
  if (!night) aim = aimScreen.clone().lerp(A.dp(L.kbX, DESK_H + 0.1, -0.2), ez.io2(prog(t, 16.2, 16.9)) * 0.9);
  const eyesClosed = !night ? ez.io2(prog(t, 16.2, 16.7)) : (1 - lift) * 0.9;
  const expr = night
    ? exprAt([[17.8, 'sad'], [23.6, 'worried', 0.5], [24.3, 'focus', 0.5], [24.98, 'determined', 0.2], [25.3, 'surprised', 0.3], [26.0, 'focus', 0.5], [27.3, 'surprised', 0.35], [27.9, 'hopeful', 0.5], [28.3, 'happy', 0.5], [29.3, 'hopeful', 0.5], [29.7, 'surprised', 0.3]], t)
    : exprAt([[0, 'focus'], [13.7, 'worried', 0.5], [14.35, 'sad', 0.3], [15.0, 'angry', 0.3], [15.6, 'sad', 0.6]], t);
  const tk = (!night && t > 14.4 && t < 15.9) ? talk(t, 14.5, 15.8, 31, false) : { open: 0, nod: 0, emph: 0 };
  // Hände
  const hairR = ctx.hp(-0.15 - 0.02 * tug, 0.05 + 0.045 * tug, -0.005), hairL = ctx.hp(0.15 + 0.02 * tug, 0.05 + 0.045 * tug, -0.005);
  const faceR = ctx.hp(-0.085, -0.075, 0.1), faceL = ctx.hp(0.085, -0.075, 0.1);
  const tWpre = night ? 0 : 1 - ez.io2(prog(t, 14.3, 14.85));                  // vor dem Haareraufen: tippen
  const wType = night ? 0 : tWpre;
  const rest = (s) => A.rp(yaw, s * 0.2, 0.2, 0.3);
  const kbdSide = A.typingHand(t, 1, 0.5);
  const cheekR = ctx.hp(-0.115, -0.045, 0.075), cheekL = ctx.hp(0.115, -0.045, 0.075);
  const RHm = night ? [
    { w: faceW > 0.5 ? (1 - lift) : (1 - lift) * 0, pos: faceR, pole: polePt(yaw, -1, 0.9, 1.0, 0.3) },
    { w: (1 - lift) * 0 + 0, pos: faceR, pole: polePt(yaw, -1) },
    { w: lift * (1 - mouseW) * (1 - joy), pos: rest(-1), pole: polePt(yaw, -1) },
    { w: lift * mouseW * (1 - joy), pos: L.mouse.clone().add(V(0, 0.04 - 0.009 * clickDip, 0)), pole: polePt(yaw, -1, 0.8, 0.8, 0.0), roll: 0.1 },
    { w: joy, pos: cheekR, pole: polePt(yaw, -1, 1.0, 0.2, 0.2), roll: 0.9, curl: 0.15 },
  ] : [
    { w: wType, pos: A.typingHand(t, -1, 1), pole: polePt(base, -1) },
    { w: (1 - wType) * (1 - wHair), pos: A.typingHand(t, -1, 0.3), pole: polePt(base, -1) },
    { w: wHair * (1 - faceW), pos: hairR, pole: polePt(yaw, -1, 1.2, -0.45, -0.1), roll: 0.5 },
    { w: faceW, pos: faceR, pole: polePt(yaw, -1, 0.9, 1.0, 0.3) },
  ];
  const LHm = night ? [
    { w: 1 - lift, pos: faceL, pole: polePt(yaw, 1, 0.9, 1.0, 0.3) },
    { w: lift * (1 - joy), pos: A.typingHand(t, 1, lift > 0.99 && t > 24.5 ? 0.3 : 0), pole: polePt(yaw, 1) },
    { w: joy, pos: cheekL, pole: polePt(yaw, 1, 1.0, 0.2, 0.2), roll: -0.9, curl: 0.15 },
  ] : [
    { w: wType, pos: A.typingHand(t, 1, 1), pole: polePt(base, 1) },
    { w: (1 - wType) * (1 - wHair), pos: kbdSide, pole: polePt(base, 1) },
    { w: wHair * (1 - faceW), pos: hairL, pole: polePt(yaw, 1, 1.2, -0.45, -0.1), roll: -0.5 },
    { w: faceW, pos: faceL, pole: polePt(yaw, 1, 0.9, 1.0, 0.3) },
  ];
  const standPh = phoneRest(phoneAt.clone().setY(DESK_H + 0.03), 0.12 * L.m);                    // liegt links neben der Tastatur, Oberkante zeigt von der Person weg (nach Norden) und ist angelehnt
  standPh.quat.premultiply(new Q().setFromAxisAngle(V(1, 0, 0), 0.5));
  return {
    yaw, lean, head: { pitch: headPitch, roll: headRoll }, aim, headW: 0.75, expr, talk: tk, squint, blink: eyesClosed > 0.01 ? Math.max(eyesClosed, 0) : undefined,
    RH: RHm, LH: LHm, arc: 0.06, sacc: night ? (lift > 0.9 ? 0.5 : 0.1) : 0.5,
    shrug: night ? 0.45 * (1 - lift) * 0 + 0.7 * happy * relief * 0 : 0, breath: night ? (1 + 0.9 * (1 - lift) + 1.2 * relief) : 1,
    dy: 0,
    phone: night ? () => ({ pos: standPh.pos, quat: standPh.quat }) : null,
  };
}

/* ================================================================ Statisten im Hintergrund: tippen still, schauen manchmal auf, trinken Kaffee */
export function scriptIdle(t, A, ctx) {
  const L = A.L, base = L.seatYaw, seed = A.seed, sip = A.opt.sip;
  const glance = ez.smooth(clamp((noise(t, seed + 3, 0.16) - 0.25) * 3));            // neugieriger Blick (zur Kamera/Seite)
  const per = 9.5, ph = (((t + (A.opt.off || 0)) % per) + per) % per, cup = sip ? Math.sin(Math.PI * clamp((ph - 6.2) / 2.4)) ** 0.8 : 0, toMouth = sip ? ez.io2(prog(ph, 6.9, 7.5)) * (1 - ez.io2(prog(ph, 7.9, 8.4))) : 0;
  const aim = A.screenC.clone().lerp(ctx.camPos, glance * 0.8).lerp(A.dp(0, 1.2, 0.5), toMouth * 0.3);
  const expr = exprAt([[0, 'neutral'], [3 + seed % 3, 'focus', 0.8], [8 + seed % 4, 'neutral', 0.8], [14, 'focus', 0.8], [20, 'neutral', 0.8]], t % 26);
  const RHm = [
    { w: 1 - cup, pos: A.typingHand(t, -1, 0.9), pole: polePt(base, -1) },
    { w: cup * (1 - toMouth), pos: L.mug.clone().add(V(0, 0.1, 0)), pole: polePt(base, -1, 0.7, 0.8), roll: 0.3 },
    { w: cup * toMouth, pos: ctx.hp(-0.02, -0.075, 0.12), pole: polePt(base, -1, 0.9, 0.6, 0.1), roll: -0.3 },
  ];
  const LHm = [{ w: 1, pos: A.typingHand(t, 1, 0.8), pole: polePt(base, 1) }];
  return { yaw: base, lean: 0.2 + 0.04 * toMouth * -1, head: { pitch: -0.05 * toMouth }, aim, headW: 0.7, expr, RH: RHm, LH: LHm, arc: 0.06, sacc: 0.35, hairLag: false };
}
