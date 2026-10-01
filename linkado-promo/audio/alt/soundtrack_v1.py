#!/usr/bin/env python3
"""
Linkado – Werbefilm: synthetischer Soundtrack (ruhiger, melodischer Techno), 60,000 s.

Dramaturgie (siehe timeline.json):  CHAOS  →  KLARHEIT  →  KRISTALLISATION
  Takte 1–10  (0–20 s)  drei Stimmen, die aneinander vorbeireden (verstimmt, polymetrisch, leise)
  Takt 10     (18–20 s) harter Schnitt, Atemzug, Pad schwillt an, Rückwärts-Hall saugt in den Drop
  Takte 11–26 (20–52 s) alles rastet ein (120 BPM, A-Moll), Schicht für Schicht entsteht der Groove
  Takte 27–30 (52–60 s) Aufbau, Halbtakt-Drop-out, bei 54.0 Aufhellung nach A-Dur, Ausklang

Alle Zeitpunkte der Bild-Akzente (hits) werden zur Laufzeit aus ../timeline.json gelesen.
Ausgabe: audio/soundtrack.wav (48 kHz / 16 Bit / Stereo / exakt 60,000 s), soundtrack.mp3, Analyse-Bilder.
Aufruf:  python3 audio/soundtrack.py           (rendert + analysiert)
         python3 audio/soundtrack.py --no-analysis
"""
import json, os, sys, time, subprocess
import numpy as np
from scipy import signal
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
BPM = 120.0
BEAT = 60.0 / BPM            # 0,5 s
BAR = 4 * BEAT               # 2,0 s
S16 = BEAT / 4               # 0,125 s
DUR = 60.0
N = int(round(DUR * SR))     # 2 880 000
rng = np.random.default_rng(20261001)
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json'), encoding='utf-8'))
HITS = TL['hits']

# ------------------------------------------------------------------ Mischpult (linear) – hier drehen
MIX = dict(
    kick=0.72, bass=0.46, hats=0.055, rim=0.26, pad=0.42, arp=0.36, arp2=0.20, stab=0.38, bell=0.34, fx=0.30, chaos=1.0, drone=0.5,
)
SEND_REV = dict(kick=0.00, bass=0.00, hats=0.07, rim=0.35, pad=0.38, arp=0.28, arp2=0.34, stab=0.55, bell=0.60, fx=0.45, chaos=0.34, drone=0.20)
SEND_DLY = dict(arp=0.38, arp2=0.42, stab=0.55, bell=0.22, chaos=0.10, hats=0.0)
DUCK = dict(pad=0.50, bass=0.55, arp=0.28, arp2=0.28, stab=0.35, bell=0.10, fx=0.20)    # Sidechain-Tiefe je Bus

def midi(n): return 440.0 * 2 ** ((n - 69) / 12.0)
def idx(t): return int(round(t * SR))
def hits(kind, voice=None):
    return [h for h in HITS if h['kind'] == kind and (voice is None or h.get('voice') == voice)]

# ------------------------------------------------------------------ Puffer / Hilfen
class Bus:
    def __init__(self): self.x = np.zeros((N, 2))
    def add(self, sig, t0, gain=1.0, pan=0.0):
        sig = np.asarray(sig)
        i = idx(t0)
        if i >= N or i + len(sig) <= 0: return
        a = max(0, -i); b = min(len(sig), N - i)
        th = (pan + 1) * np.pi / 4
        l, r = np.cos(th), np.sin(th)
        if sig.ndim == 1:
            self.x[i + a:i + b, 0] += sig[a:b] * gain * l; self.x[i + a:i + b, 1] += sig[a:b] * gain * r
        else:
            self.x[i + a:i + b] += sig[a:b] * gain

def fade_edges(x, a=0.004, r=0.006):
    n = len(x); fa = min(n // 2, int(a * SR)); fr = min(n // 2, int(r * SR))
    x = x.copy()
    ca = np.linspace(0, 1, fa) if fa else None; cr = np.linspace(1, 0, fr) if fr else None
    if x.ndim == 2:
        ca = ca[:, None] if fa else None; cr = cr[:, None] if fr else None
    if fa: x[:fa] *= ca
    if fr: x[-fr:] *= cr
    return x

# ------------------------------------------------------------------ Filter (RBJ-Biquad)
def biquad(kind, fc, q=0.707, gdb=0.0):
    fc = float(np.clip(fc, 20, SR * 0.45)); w0 = 2 * np.pi * fc / SR; c, s = np.cos(w0), np.sin(w0); al = s / (2 * q); A = 10 ** (gdb / 40)
    if kind == 'lp': b = [(1 - c) / 2, 1 - c, (1 - c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'hp': b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'bp': b = [al, 0, -al]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'peak': b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    elif kind == 'ls': sA = np.sqrt(A); b = [A * ((A + 1) - (A - 1) * c + 2 * sA * al), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - 2 * sA * al)]; a = [(A + 1) + (A - 1) * c + 2 * sA * al, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - 2 * sA * al]
    elif kind == 'hs': sA = np.sqrt(A); b = [A * ((A + 1) + (A - 1) * c + 2 * sA * al), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - 2 * sA * al)]; a = [(A + 1) - (A - 1) * c + 2 * sA * al, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - 2 * sA * al]
    else: raise ValueError(kind)
    b = np.array(b) / a[0]; a = np.array(a) / a[0]; return b, a
def filt(x, kind, fc, q=0.707, gdb=0.0, order=1):
    b, a = biquad(kind, fc, q, gdb)
    for _ in range(order): x = signal.lfilter(b, a, x, axis=0)
    return x
def sweep(x, kind, f0, f1, tau=None, q=0.9, block=128, order=2, mode='exp'):
    """zeitvariabler Filter, Grenzfrequenz läuft von f0 nach f1 (exp. mit tau oder linear über die Länge)"""
    n = len(x); out = np.empty(n); zis = [np.zeros(2) for _ in range(order)]
    for i in range(0, n, block):
        t = i / SR
        f = f1 + (f0 - f1) * np.exp(-t / tau) if (tau and mode == 'exp') else f0 + (f1 - f0) * (i / max(1, n - 1))
        b, a = biquad(kind, f, q); seg = x[i:i + block]
        for k in range(order): seg, zis[k] = signal.lfilter(b, a, seg, zi=zis[k])
        out[i:i + block] = seg
    return out

# ------------------------------------------------------------------ Oszillatoren (bandbegrenzt per PolyBLEP)
def _blep(t, dt):
    x = t / dt; y = np.where(t < dt, x + x - x * x - 1.0, 0.0)
    x2 = (t - 1.0) / dt; return np.where(t > 1.0 - dt, x2 * x2 + x2 + x2 + 1.0, y)
def _phase(freq, n, ph0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,)); dt = f / SR; return (ph0 + np.cumsum(dt)) % 1.0, dt
def osc_saw(freq, n, ph0=0.0):
    ph, dt = _phase(freq, n, ph0); return 2 * ph - 1 - _blep(ph, dt)
def osc_pulse(freq, n, duty=0.5, ph0=0.0):
    ph, dt = _phase(freq, n, ph0); y = np.where(ph < duty, 1.0, -1.0); y = y + _blep(ph, dt) - _blep((ph + 1 - duty) % 1.0, dt); return y
def osc_sine(freq, n, ph0=0.0):
    ph, _ = _phase(freq, n, ph0); return np.sin(2 * np.pi * ph)
def osc_tri(freq, n, ph0=0.0):
    ph, _ = _phase(freq, n, ph0); return 2 * np.abs(2 * ph - 1) - 1
def noise(n): return rng.standard_normal(n)
def expenv(n, tau, a=0.002):
    t = np.arange(n) / SR; e = np.exp(-t / tau); fa = max(1, int(a * SR)); e[:fa] *= np.linspace(0, 1, fa); return e

# ------------------------------------------------------------------ Hall / Delay / Sidechain
def make_ir(rt60, seed, predelay=0.02, damp=7000.0, bright_early=True):
    r = np.random.default_rng(seed); n = int(rt60 * 1.15 * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-6.91 * t / rt60)
    a = filt(ir, 'lp', damp, 0.6); b = filt(ir, 'lp', 1700.0, 0.6)
    mix = np.clip(t / (rt60 * 0.9), 0, 1); ir = a * (1 - mix) + b * mix                                  # Höhen sterben schneller
    ir = filt(ir, 'hp', 140.0, 0.6)
    pd = int(predelay * SR); ir = np.concatenate([np.zeros(pd), ir])
    return ir / np.sqrt(np.sum(ir ** 2)) * 0.9
IR_L = make_ir(2.9, 11); IR_R = make_ir(2.9, 12)
def reverb(x, ir_l=None, ir_r=None):
    ir_l = IR_L if ir_l is None else ir_l; ir_r = IR_R if ir_r is None else ir_r
    return np.stack([signal.fftconvolve(x[:, 0], ir_l)[:len(x)], signal.fftconvolve(x[:, 1], ir_r)[:len(x)]], axis=1)
def pingpong(x, delay=3 * S16, fb=0.46, taps=8, hc=4200.0):
    m = filt(x.mean(axis=1), 'lp', hc, 0.7); m = filt(m, 'hp', 220.0, 0.7); out = np.zeros((len(x), 2)); d = int(round(delay * SR))
    for k in range(1, taps + 1):
        sh = k * d
        if sh >= len(x): break
        g = fb ** k; ch = 0 if k % 2 else 1
        out[sh:, ch] += m[:len(x) - sh] * g; out[sh:, 1 - ch] += m[:len(x) - sh] * g * 0.25
    return out
def duck_curve(times_levels, depth, rel=0.19, atk=0.004):
    g = np.ones(N)
    for tk, lv in times_levels:
        i = idx(tk); L = int(rel * 5 * SR)
        if i >= N: continue
        L = min(L, N - i); k = np.arange(L) / SR
        env = 1 - depth * lv * np.exp(-k / rel) * np.minimum(1.0, k / atk + 0.0001); g[i:i + L] = np.minimum(g[i:i + L], env)
    return g

# ------------------------------------------------------------------ Instrumente
def kick(level=1.0, muffle=0.0, length=0.55, f0=135.0, f1=49.0, tau=0.042):
    n = int(length * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / tau); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * expenv(n, 0.24, 0.001)
    body = np.tanh(1.5 * body) / np.tanh(1.5)
    click = filt(noise(n) * np.exp(-t / 0.0035), 'bp', 2400, 0.8) * 0.18
    y = (body + click * (1 - muffle)) * level
    if muffle > 0: y = filt(y, 'lp', 190 - 70 * muffle, 0.7, order=2)
    return fade_edges(y, 0.001, 0.02)
def bass_note(freq, dur, vel=1.0, bright=0.4):
    n = int((dur + 0.05) * SR); t = np.arange(n) / SR
    s = osc_sine(freq, n) + 0.28 * osc_sine(freq * 2, n) * 0.6
    sa = np.tanh(2.2 * osc_sine(freq, n)) * 0.55                                  # Obertöne für Laptop-Lautsprecher
    sw = filt(osc_saw(freq, n), 'lp', 260 + 700 * bright, 0.9, order=2) * 0.30
    y = s * 0.6 + sa + sw
    e = np.minimum(1, t / 0.006) * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.02)); return fade_edges(y * e * vel, 0.002, 0.004)
def hat(open_=False, vel=1.0, bright=1.0):
    d = 0.22 if open_ else 0.045; n = int((d * 4) * SR); t = np.arange(n) / SR
    x = filt(noise(n), 'hp', 7000, 0.7, order=2); x = filt(x, 'bp', 9500, 0.6) * 1.6 + x * 0.4; x = filt(x, 'lp', 13500, 0.7)
    return fade_edges(x * np.exp(-t / d) * vel * (0.7 + 0.3 * bright), 0.0008, 0.01)
def rim(vel=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = filt(noise(n), 'bp', 1700, 1.2) * np.exp(-t / 0.045) * 0.8 + osc_sine(430, n) * np.exp(-t / 0.03) * 0.5
    return fade_edges(x * vel, 0.0008, 0.01)
def pad_chord(notes, dur, attack=0.9, release=1.4, cutoff=1500.0, voices=5, spread=0.55):
    n = int((dur + release) * SR); out = np.zeros((n, 2)); det = np.array([-12, -6, 0, 6, 12]) * 1.0
    for mnote in notes:
        for vi in range(voices):
            f = midi(mnote) * 2 ** (det[vi] / 1200); w = osc_saw(f, n, ph0=rng.random()); p = (vi / (voices - 1) * 2 - 1) * spread
            th = (p + 1) * np.pi / 4; out[:, 0] += w * np.cos(th); out[:, 1] += w * np.sin(th)
    out = filt(out, 'lp', cutoff, 0.8, order=2) / (len(notes) * voices) * 2.2
    t = np.arange(n) / SR; e = np.clip(t / attack, 0, 1) ** 2 * np.where(t < dur, 1.0, np.exp(-(t - dur) / (release / 4.5)))
    return out * e[:, None]
def pluck(freq, dur=0.30, vel=1.0, bright=1.0, tau=0.11):
    n = int(dur * SR); t = np.arange(n) / SR
    x = osc_saw(freq, n, rng.random()) * 0.55 + osc_saw(freq * 2 ** (9 / 1200), n, rng.random()) * 0.45
    c0 = float(np.clip(1500 + 5600 * bright * (0.45 + 0.55 * vel), 800, 11000)); c1 = 500 + 500 * bright
    y = sweep(x, 'lp', c0, c1, tau=tau, q=1.5, block=96, order=2)
    return fade_edges(y * np.exp(-t / 0.17) * vel, 0.003, 0.01)
def stab(notes, vel=1.0, dur=0.32, cutoff=1500.0):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for m in notes:
        for dt in (-9, 0, 9): out += osc_saw(midi(m) * 2 ** (dt / 1200), n, rng.random())
    out = sweep(out / (len(notes) * 3), 'lp', cutoff * 1.6, cutoff * 0.5, tau=0.1, q=1.2, block=96, order=2)
    return fade_edges(out * np.exp(-t / 0.13) * vel * 2.0, 0.004, 0.012)
def bell(freq, dur=3.2, vel=1.0, tail=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for r, a, d in ((1.0, 1.0, 1.9), (2.756, 0.45, 1.1), (5.404, 0.22, 0.55), (8.933, 0.10, 0.25), (0.5, 0.35, 2.4)):
        out += osc_sine(freq * r, n, rng.random()) * a * np.exp(-t / (d * tail))
    out *= np.minimum(1, t / 0.002)
    out += filt(noise(n) * np.exp(-t / 0.006), 'bp', 6000, 0.8) * 0.12
    return fade_edges(out * vel * 0.5, 0.001, 0.05)
def marimba(freq, vel=1.0, dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    out = osc_sine(freq, n) * np.exp(-t / 0.16) + osc_sine(freq * 3.98, n) * 0.35 * np.exp(-t / 0.03) + osc_sine(freq * 9.9, n) * 0.08 * np.exp(-t / 0.012)
    return fade_edges(out * vel * 0.6, 0.0015, 0.02)
def tick(freq=2300, vel=1.0):
    n = int(0.06 * SR); t = np.arange(n) / SR
    return fade_edges(filt(noise(n), 'bp', freq, 2.2) * np.exp(-t / 0.008) * vel * 1.4, 0.0005, 0.005)
def riser(dur, f0=300, f1=7000, vel=1.0, pitch=None):
    n = int(dur * SR); t = np.arange(n) / SR; x = noise(n); amp = (t / dur) ** 2.2
    y = sweep(x, 'bp', f0, f1, q=1.1, block=256, order=2, mode='lin') * amp * 1.8
    if pitch:
        f = pitch[0] * (pitch[1] / pitch[0]) ** (t / dur); y += np.sin(2 * np.pi * np.cumsum(f) / SR) * amp * 0.35
    return fade_edges(y * vel, 0.01, 0.03)
def sub_boom(freq=55.0, dur=1.6, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = freq + 40 * np.exp(-t / 0.05)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55); return fade_edges(np.tanh(1.3 * y) * vel, 0.002, 0.05)

# ------------------------------------------------------------------ Harmonie
CH = {
    'Am9':   dict(pad=[45, 48, 52, 55, 59], bass=33, arp=[57, 60, 64, 67, 71, 72, 76, 79], stab=[57, 60, 64, 67, 71]),
    'Fmaj7': dict(pad=[41, 45, 48, 52],     bass=41, arp=[53, 57, 60, 64, 65, 69, 72, 76], stab=[53, 57, 60, 64]),
    'Cmaj7': dict(pad=[48, 52, 55, 59],     bass=36, arp=[55, 59, 60, 64, 67, 71, 72, 76], stab=[52, 55, 59, 64]),
    'Gadd9': dict(pad=[43, 47, 50, 57],     bass=31, arp=[55, 59, 62, 64, 67, 71, 74, 79], stab=[55, 59, 62, 69]),
    'Amaj9': dict(pad=[45, 49, 52, 56, 59], bass=33, arp=[57, 61, 64, 68, 71, 73, 76, 80, 81], stab=[57, 61, 64, 68, 71]),
}
def chord_at(t):
    bar = int(t // BAR) + 1                                  # 1-basiert
    if bar >= 28: return 'Amaj9'
    if bar < 11: return 'Am9'
    seq = ['Am9', 'Fmaj7', 'Cmaj7', 'Gadd9']; return seq[((bar - 11) // 2) % 4]

def prog(t, a, b): return float(np.clip((t - a) / (b - a), 0, 1))
def bar_t(bar, beat=1): return (bar - 1) * BAR + (beat - 1) * BEAT
def R(x): return x

# ======================================================================================= ARRANGEMENT
def render():
    t0 = time.time()
    B = {k: Bus() for k in ['kick', 'bass', 'hats', 'rim', 'pad', 'arp', 'arp2', 'stab', 'bell', 'fx', 'chaos', 'drone']}
    kicks = []                                                # (Zeit, Pegel) für Sidechain
    hum = lambda s=0.003: rng.uniform(-s, s)                  # Mikro-Timing nur für Nicht-Kick-Elemente

    # ------------------------------------------------------------------ ACT I – Chaos (0–18 s)
    CUT = hits('cut')[0]['t']                                  # 18.0
    # Drone (A1) mit langsamem Schweben + Luft + Uhr-Ticks
    n = idx(CUT); t = np.arange(n) / SR
    dr = (np.sin(2 * np.pi * 55.0 * t) + 0.5 * np.sin(2 * np.pi * 55.37 * t + 1.0) + 0.18 * np.sin(2 * np.pi * 110.0 * t)) * (0.25 + 0.75 * np.clip(t / 6.0, 0, 1))
    dr *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * t)
    air = filt(noise(n), 'bp', 7500, 0.7) * 0.012 * (0.4 + 0.6 * np.clip(t / 10, 0, 1)) * (1 + 0.5 * np.sin(2 * np.pi * 0.2 * t))
    B['drone'].add(fade_edges(dr * 0.30, 0.3, 0.004), 0.0); B['drone'].add(air, 0.0, pan=0.0)
    for k in range(int(CUT / BEAT)):
        tt = k * BEAT
        if tt < 14.0: B['chaos'].add(tick(2300 if k % 2 == 0 else 1500, 0.30 if k % 4 == 0 else 0.18), tt, 0.5, pan=-0.2 if k % 2 else 0.2)
    # Stimme 1 (M365): steife Pulsplucks im 3/16-Raster, ≈ −35 Cent verstimmt
    notes1 = [440 * 2 ** (-35 / 1200), 523.25 * 2 ** (-20 / 1200), 440 * 2 ** (-35 / 1200), 659.25 * 2 ** (-45 / 1200), 349.23 * 2 ** (-30 / 1200)]
    def v1(f, vel=1.0):
        n = int(0.26 * SR); t = np.arange(n) / SR; fr = f * (1 + 0.035 * np.exp(-t / 0.02))
        y = osc_pulse(fr, n, 0.28) * np.exp(-t / 0.085); y = filt(y, 'lp', 2400, 1.0, order=2); return fade_edges(y * vel, 0.002, 0.01)
    k = 0; tt = 2.0
    while tt < CUT:
        lvl = 0.16 + 0.10 * prog(tt, 2, 14) + 0.10 * prog(tt, 14, 18); B['chaos'].add(v1(notes1[k % 5], 1.0), tt + hum(), lvl, pan=-0.35); tt += 3 * S16; k += 1
    # Stimme 2 (openDesk): metallische FM-Ticks im 5/16-Raster um Es5 (Tritonus zu A)
    notes2 = [622.25, 622.25, 739.99, 622.25, 466.16]
    def v2(f, vel=1.0):
        n = int(0.30 * SR); t = np.arange(n) / SR; idxm = 5.0 * np.exp(-t / 0.05); ph = 2 * np.pi * np.cumsum(np.full(n, f)) / SR
        y = np.sin(ph + idxm * np.sin(ph * 1.414)) * np.exp(-t / 0.11); return fade_edges(filt(y, 'hp', 300, 0.7) * vel, 0.001, 0.02)
    k = 0; tt = 6.0
    while tt < CUT:
        lvl = 0.12 + 0.08 * prog(tt, 6, 14) + 0.08 * prog(tt, 14, 18); B['chaos'].add(v2(notes2[k % 5]), tt + hum(), lvl, pan=0.38); tt += 5 * S16; k += 1
    # Stimme 3 (Nextcloud): hohle Dreieckstöne im 7/16-Raster um G
    notes3 = [392.0, 293.66, 392.0, 261.63]
    def v3(f, vel=1.0):
        n = int(0.55 * SR); t = np.arange(n) / SR; fr = f * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t)); y = osc_tri(fr, n) * np.minimum(1, t / 0.012) * np.exp(-t / 0.22)
        return fade_edges(filt(y, 'lp', 1900, 0.8, order=2) * vel, 0.002, 0.02)
    k = 0; tt = 10.0
    while tt < CUT:
        lvl = 0.20 + 0.10 * prog(tt, 10, 18); B['chaos'].add(v3(notes3[k % 4]), tt + hum(), lvl, pan=0.0); tt += 7 * S16; k += 1
        if 10.0 <= tt < 14.0 and k % 2 == 0: B['chaos'].add(hat(True, 0.6), tt + 0.31, 0.10, pan=0.5)
    # Herzschlag-Kick (nur Zählzeit 1) ab 6 s, dann ab 14 s vier Schläge je Takt, gedämpft
    for bar in range(4, 8):
        tk = bar_t(bar); B['kick'].add(kick(0.55, 0.85), tk, 0.45); kicks.append((tk, 0.25))
    for k in range(8):
        tk = 14.0 + k * BEAT; lv = 0.45 + 0.45 * prog(tk, 14, 18); B['kick'].add(kick(0.7, 0.6), tk, lv); kicks.append((tk, 0.3 * lv))
    # 16tel-Ticks, beschleunigend lauter
    for k in range(int((18.0 - 14.0) / S16)):
        tk = 14.0 + k * S16; B['chaos'].add(tick(3800, 0.4), tk, 0.05 + 0.20 * prog(tk, 14, 18), pan=(-1) ** k * 0.4)
    # Treffer aus der Timeline
    for h in hits('ping'):
        tt, v = h['t'], h.get('voice', 0)
        if tt >= CUT: continue
        if v == 1: B['chaos'].add(v1(880 * 2 ** (-35 / 1200), 1.0), tt, 0.20, pan=-0.3)
        elif v == 2: B['chaos'].add(v2(1244.5), tt, 0.14, pan=0.35)
        elif v == 3: B['chaos'].add(v3(587.33), tt, 0.26, pan=0.0)
        else: B['chaos'].add(marimba(1046.5 * 2 ** (-28 / 1200)), tt, 0.14, pan=(-1) ** int(tt * 2) * 0.4)
    for h in hits('card'):
        tt, v = h['t'], h['voice']
        th = sub_boom(70 - 5 * v, 0.5, 0.5); B['chaos'].add(th, tt, 0.45)
        B['chaos'].add({1: v1(440 * 2 ** (-35 / 1200)), 2: v2(622.25), 3: v3(392.0)}[v], tt, 0.30 + 0.0, pan=[0, -0.3, 0.35, 0.0][v])
        B['chaos'].add(filt(noise(int(0.3 * SR)) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.05), 'bp', 700, 0.9), tt, 0.10)
    for h in hits('shove'):
        tt = h['t']; n = int(0.45 * SR); t = np.arange(n) / SR; f = 700 * np.exp(-t / 0.25) + 150; y = filt(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2), 'lp', 1800, 0.7)
        B['chaos'].add(fade_edges(y, 0.003, 0.03), tt, 0.14, pan=0.0)
    for h in hits('text'):
        tt = h['t']
        if 14 <= tt < CUT:
            n = int(0.3 * SR); t = np.arange(n) / SR; y = np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.12) + filt(noise(n), 'bp', 950, 1.0) * np.exp(-t / 0.06) * 0.8
            B['chaos'].add(fade_edges(y, 0.002, 0.02), tt, 0.28 + 0.06 * (tt - 14))
    for h in hits('riser'):
        if h['t'] < 20:
            dur = h['end'] - h['t']; B['fx'].add(riser(dur, 300, 6500, 1.0, pitch=(220, 880)), h['t'], 0.5)
    # Gate: alles Trockene hört bei 18.0 abrupt auf (Hall-Schwanz bleibt)
    gate = np.ones(N); i = idx(CUT); gate[i:] = 0.0; gate[i - 120:i] = np.linspace(1, 0, 120)
    for k in ('chaos', 'drone', 'kick'): B[k].x *= gate[:, None]
    # Atemzug: tiefer Sub-Swell + Pad (Am9) ab 19.0, Rückwärts-Hall saugt in den Drop (20.0)
    n = idx(2.0); t = np.arange(n) / SR; sw = np.sin(2 * np.pi * 55.0 * t) * np.clip((t - 0.2) / 1.6, 0, 1) ** 2
    B['fx'].add(fade_edges(sw * 0.45, 0.01, 0.01), CUT, 1.0)
    ASK = [h['t'] for h in hits('text') if 18.5 < h['t'] < 19.5][0]
    DROP = hits('drop')[0]['t']                                                                                        # 20.0
    chord = pad_chord(CH['Am9']['stab'], 0.25, attack=0.01, release=0.2, cutoff=2400.0)
    suck = _suck_back(chord)
    B['fx'].add(suck, DROP - len(suck) / SR, 0.55)

    # ------------------------------------------------------------------ ACT II – Klarheit (20–52 s) + ACT III
    KICK_ON = [(DROP, 53.5), (54.0, 58.0)]
    cut_a, cut_b = hits('cut')[1]['t'], hits('cut')[1]['end']                 # 53.5 … 54.0
    CRY = hits('crystal')[0]['t']                                             # 54.0
    def kick_on(tt): return any(a - 1e-6 <= tt < b - 1e-6 for a, b in KICK_ON)
    nbeats = int(DUR / BEAT)
    for k in range(nbeats):
        tk = k * BEAT
        if tk >= DROP and kick_on(tk):
            lv = 0.82 + 0.18 * prog(tk, 20, 36)
            B['kick'].add(kick(1.0 * lv, 0.0), tk, 1.0); kicks.append((tk, lv))
    # Bass: Pedal auf Akkordgrund, 8tel auf den Offbeats; Sub-Teppich am Anfang
    def bass_active(tt):
        if tt < DROP or tt >= 58.0: return False
        if cut_a <= tt < cut_b: return False
        if 34.0 <= tt < 36.0: return False                                    # Variation: Takt 18 ohne Bass
        return True
    # liegender Sub in den ersten zwei Takten des Groove
    B['bass'].add(sub_boom(55.0, 3.8, 0.9), DROP, 0.42)
    for bar in range(11, 31):
        for e8 in range(8):
            tt = bar_t(bar) + e8 * (BEAT / 2)
            if bar < 13 or tt >= 58.0 or not bass_active(tt) or e8 % 2 == 0: continue
            ch = chord_at(tt); root = CH[ch]['bass']; pat = [0, 0, 12, 0, 0, 7, 0, 12]; semi = pat[e8]
            if bar % 2 == 0 and e8 == 7: semi = {'Am9': 10, 'Fmaj7': 7, 'Cmaj7': 7, 'Gadd9': 7, 'Amaj9': 7}[ch]      # Variation, immer akkordeigen
            B['bass'].add(bass_note(midi(root + semi), BEAT * 0.42, 0.9 + 0.1 * (e8 == 3), 0.25 + 0.5 * prog(tt, 24, 46)), tt, 0.9 * (0.75 + 0.25 * prog(tt, 24, 30)))
    # Hi-Hats
    for bar in range(13, 29):
        for s in range(16):
            tt = bar_t(bar) + s * S16
            if cut_a <= tt < cut_b or tt >= 58.0: continue
            if tt >= CRY and tt < 54.0: continue
            open_ = (s % 4 == 2)
            if open_:
                B['hats'].add(hat(True, 0.9), tt + hum(0.002), 0.9, pan=0.25)
            elif bar >= 15 and s % 2 == 1 or (bar >= 15 and s % 4 == 0 and s % 8 != 0):
                thin = 50.0 <= tt < 52.0 or bar >= 28
                B['hats'].add(hat(False, (0.55 + 0.35 * ((s * 5) % 3 == 0)) * (0.5 if thin else 1)), tt + hum(0.002), 0.7, pan=-0.2 if s % 4 == 1 else 0.3)
    # Rim / Clap auf 2 und 4
    for bar in range(13, 28):
        for beat in (2, 4):
            tt = bar_t(bar, beat)
            if cut_a <= tt < cut_b: continue
            B['rim'].add(rim(0.7 if beat == 2 else 0.9), tt, 0.9, pan=0.15)
    for bar in range(28, 30):
        for beat in (2, 4): B['rim'].add(rim(0.6), bar_t(bar, beat), 0.8, pan=0.1)
    # Pad: Akkordteppich, Filter öffnet sich über die Zeit
    segs = [(19.0, 24.0, 'Am9'), (24.0, 28.0, 'Fmaj7'), (28.0, 32.0, 'Cmaj7'), (32.0, 36.0, 'Gadd9'), (36.0, 40.0, 'Am9'), (40.0, 44.0, 'Fmaj7'), (44.0, 48.0, 'Cmaj7'), (48.0, 52.5, 'Gadd9')]
    for a, b, ch in segs:
        cut_f = 800 + 2600 * prog(a, 20, 48); first = a == 19.0
        pc = pad_chord(CH[ch]['pad'], b - a + (0.6 if not first else 0.0), attack=0.9 if first else 1.2, release=1.4, cutoff=cut_f)
        B['pad'].add(pc, a, 0.8 if first else 1.0)
    # Finale-Pad (A-Dur, hell) – setzt bei 54.0 ein und klingt bis zum Ende aus
    pc = pad_chord(CH['Amaj9']['pad'] + [69], 6.0, attack=0.25, release=2.6, cutoff=4200.0, spread=0.7); B['pad'].add(pc, CRY, 1.15)
    # Stabs (Dub-Akkord auf dem Offbeat der Zählzeit 2) – Takte 15–17 und 19–23 sowie 28–29
    def stab_bar(bar): return (15 <= bar <= 17) or (19 <= bar <= 23) or bar in (28, 29)
    for bar in range(11, 31):
        if not stab_bar(bar): continue
        tt = bar_t(bar, 2) + BEAT / 2 + hum(0.002); ch = chord_at(tt)
        if tt >= 58.0: continue
        B['stab'].add(stab(CH[ch]['stab'], 0.9, 0.34, 1400 + 800 * prog(tt, 28, 46)), tt, 0.9, pan=-0.25)
        if bar % 2 == 1 and bar < 28: B['stab'].add(stab([n + 12 for n in CH[ch]['stab'][:3]], 0.5, 0.25, 1800), bar_t(bar, 4) + hum(0.002), 0.5, pan=0.3)
    # Arpeggio (Hauptstimme) – 16tel; dünn in Takt 13/14, voll ab 15, dunkel in Takt 18, heller bis Takt 26
    P1 = [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 6, 7, 6, 4, 2]
    P2 = [4, 5, 7, 5, 6, 4, 5, 2, 4, 5, 7, 5, 6, 7, 5, 4]
    V = [1.0, 0.45, 0.7, 0.5, 0.9, 0.45, 0.7, 0.5, 1.0, 0.45, 0.7, 0.55, 0.85, 0.5, 0.7, 0.5]
    for bar in range(13, 31):
        for s in range(16):
            tt = bar_t(bar) + s * S16
            if tt >= 58.0 or (cut_a <= tt < cut_b): continue
            if bar < 15 and s % 2 == 1: continue
            if bar >= 27 and tt < CRY and tt >= 52.0 and s % 2 == 1: continue
            ch = chord_at(tt); notes = CH[ch]['arp']
            if bar >= 28:
                notes = CH['Amaj9']['arp']
            note = notes[P1[s] % len(notes)] + (12 if (bar >= 28 and s % 4 == 3) else 0)
            vel = V[s] * (0.7 + 0.3 * prog(tt, 28, 44)) * (0.85 if bar == 18 else 1.0)
            bright = (0.3 if bar == 18 else 0.55 + 0.45 * prog(tt, 28, 48)) + (0.25 if bar >= 28 else 0)
            B['arp'].add(pluck(midi(note), 0.30, vel, bright), tt + hum(0.0025), 0.9, pan=(-1) ** s * (0.3 + 0.2 * (s % 4 == 0)))
    # Zweite Stimme: eine Oktave höher, auf den Off-16teln, ab Takt 21
    for bar in range(21, 31):
        for s in range(16):
            tt = bar_t(bar) + s * S16
            if tt >= 58.0 or (cut_a <= tt < cut_b) or s % 4 != 3 and s % 8 != 6: continue
            if 47.0 <= tt < 50.0 and s % 8 != 6: continue
            ch = chord_at(tt); notes = CH[ch]['arp'] if bar < 28 else CH['Amaj9']['arp']
            B['arp2'].add(pluck(midi(notes[P2[s] % len(notes)] + 12), 0.34, 0.8, 0.95, tau=0.09), tt + hum(0.002), 0.9, pan=(-1) ** (s // 4) * 0.6)
    # Luftiges Schimmern (Rauschen, gefiltert) ab Takt 21 – Höhepunkt 24–26
    for a, b, lv in ((40.0, 46.0, 0.05), (46.0, 52.0, 0.09)):
        n = idx(b - a); x = noise(n); x = filt(x, 'bp', 9000, 0.8) * (np.linspace(0.3, 1, n)) * lv
        B['fx'].add(fade_edges(np.stack([x, np.roll(x, 300)], axis=1), 0.5, 0.8), a, 1.0)

    # ------------------------------------------------------------------ Akzente aus der Timeline (Act II / III)
    NOTES_P = [81, 84, 88, 79, 76, 91]              # A5 C6 E6 G5 E5 G6 (A-Moll-Pentatonik)
    pk = 0
    for h in HITS:
        tt, kd = h['t'], h['kind']
        if tt < DROP - 1e-6 or tt >= 60: continue
        if kd == 'drop':
            B['bell'].add(bell(midi(81), 3.4, 1.0), tt, 0.85); B['bell'].add(bell(midi(69), 3.4, 0.8), tt, 0.5)
        elif kd == 'whoosh':
            dur = h['end'] - tt; B['fx'].add(riser(dur, 500, 9000, 1.0, pitch=(660, 1320)), tt, 0.55); n = idx(dur); gl = np.sin(2 * np.pi * np.cumsum(1318 * (1 + 0.5 * np.linspace(0, 1, n))) / SR) * np.hanning(n) * 0.2
            B['fx'].add(gl, tt, 0.5)
        elif kd == 'snap':
            if 41 <= tt <= 43.1:
                nn = {41.0: 81, 42.0: 84, 43.0: 88}.get(round(tt, 2), 81); B['bell'].add(bell(midi(nn), 2.4, 1.0), tt, 0.75); B['bell'].add(tick(2600, 1.0), tt, 0.4)
            elif abs(tt - 54.5) < 0.01: B['bell'].add(bell(midi(88), 3.0, 1.0), tt, 0.7); B['bell'].add(bell(midi(93), 3.0, 0.7), tt + 0.06, 0.45)
            else: B['bell'].add(tick(3200, 1.0), tt, 0.5); B['bell'].add(marimba(midi(93), 0.7), tt, 0.25)
        elif kd == 'lock':
            B['bass'].add(sub_boom(55.0, 1.8, 1.0), tt, 0.5)
            for nn in (67, 71, 74, 79): B['bell'].add(bell(midi(nn), 3.0, 0.7), tt + 0.01 * (nn % 3), 0.4)
        elif kd == 'click':
            B['bell'].add(bell(midi(NOTES_P[pk % 6] + 12), 0.9, 0.8, tail=0.35), tt, 0.35); B['bell'].add(tick(3500, 0.8), tt, 0.35); pk += 1
        elif kd == 'ping' and h.get('voice', 0) == 0:
            B['bell'].add(marimba(midi(NOTES_P[pk % 6]), 1.0), tt, 0.50, pan=(-1) ** pk * 0.35); pk += 1
        elif kd == 'tagline':
            nn = {54.75: 88, 56.0: 90, 57.0: 93}.get(round(tt, 2), 88); B['bell'].add(bell(midi(nn), 3.6, 1.0, tail=1.3), tt, 0.7)
        elif kd == 'riser' and tt >= 52 and 'end' in h:
            B['fx'].add(riser(h['end'] - tt, 300, 10000, 1.0, pitch=(330, 1760)), tt, 0.60)
    # Aufbau-Fill vor dem Drop-out: 16tel-Snare-Rolle (Rim) von 52.0 bis 53.5
    for k in range(int((cut_a - 52.0) / S16)):
        tt = 52.0 + k * S16
        if k % 2 == 0 or k > 6: B['rim'].add(rim(0.25 + 0.55 * prog(tt, 52, 53.5)), tt, 0.5 * prog(tt, 52, 53.5) + 0.15)
    # Kristall bei 54.0: Sub-Boom, Glas-Kaskade (A-Dur), Becken-Schimmer
    B['bass'].add(sub_boom(55.0, 2.6, 1.0), CRY, 0.6)
    for k, nn in enumerate([69, 73, 76, 81, 85, 88, 93, 97, 100]):
        B['bell'].add(bell(midi(nn), 3.4, 0.9 - 0.04 * k, tail=1.2), CRY + 0.07 * k, 0.55)
    B['bell'].add(bell(midi(57), 4.0, 1.0, tail=1.6), CRY, 0.6)
    # Ausklang: letzte lange Glocke bei 58.0 (A5), klingt bis zum Ende
    B['bell'].add(bell(midi(81), 4.0, 1.0, tail=2.2), 58.0, 0.55); B['bell'].add(bell(midi(69), 4.0, 1.0, tail=2.2), 58.0, 0.45)

    print(f'  Ereignisse gerendert in {time.time() - t0:.1f} s')

    # ------------------------------------------------------------------ MISCHUNG
    kicks_sorted = sorted(kicks)
    out = np.zeros((N, 2)); wet_in = np.zeros((N, 2)); dly_in = np.zeros((N, 2))
    for name, bus in B.items():
        x = bus.x
        if name in DUCK:
            g = duck_curve([(tk, lv) for tk, lv in kicks_sorted if tk >= DROP - 0.01], DUCK[name]); x = x * g[:, None]
        if name == 'bass':                                   # Bass mono
            m = x.mean(axis=1, keepdims=True); x = np.repeat(m, 2, axis=1)
        if name in ('arp', 'arp2', 'pad', 'stab', 'bell', 'hats', 'chaos', 'rim'): x = filt(x, 'hp', 140.0, 0.7)
        if name in ('arp', 'arp2', 'stab'): x = filt(x, 'hs', 2600.0, 0.7, 5.0)
        if name == 'pad': x = filt(x, 'hs', 2200.0, 0.7, 3.5)
        if name == 'hats': x = filt(x, 'lp', 11000.0, 0.7)
        out += x * MIX[name]
        if SEND_REV.get(name, 0) > 0: wet_in += x * MIX[name] * SEND_REV[name]
        if SEND_DLY.get(name, 0) > 0: dly_in += x * MIX[name] * SEND_DLY[name]
    print(f'  Bus-Mix in {time.time() - t0:.1f} s'); wet = reverb(wet_in); print(f'  Hall in {time.time() - t0:.1f} s')
    dly = pingpong(dly_in); dly_rev = reverb(dly * 0.35)
    mix = out + wet * 0.85 + dly * 0.8 + dly_rev * 0.5
    # Master: Hochpass, sanfte Sättigung, Normalisierung
    mix = filt(mix, 'hp', 28.0, 0.7, order=2)
    mix = filt(mix, 'ls', 90.0, 0.7, 1.5)            # tiefen Kick/Bass leicht stützen
    mix = filt(mix, 'peak', 280.0, 0.9, -1.5)         # etwas Schlamm raus
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.85
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    # Anfang/Ende ohne Klick
    fi = int(0.02 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(0.7 * SR); mix[-fo:] *= (0.5 * (1 + np.cos(np.linspace(0, np.pi, fo))))[:, None]
    return mix

def _suck_back(chord):
    """Rückwärts-Hall: Akkord → Hall-Schwanz umdrehen, steigt in den Drop hinein."""
    pre = np.pad(chord, ((0, int(2.2 * SR)), (0, 0)))
    wet = np.stack([signal.fftconvolve(pre[:, 0], IR_L)[:len(pre)], signal.fftconvolve(pre[:, 1], IR_R)[:len(pre)]], axis=1)
    wet = wet[int(0.05 * SR):int(1.9 * SR)][::-1]
    env = (np.linspace(0, 1, len(wet)) ** 1.8)[:, None]
    wet = wet * env; wet[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]
    return wet / (np.abs(wet).max() + 1e-9) * 0.9

# ======================================================================================= ANALYSE
def analyse(y):
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    import pyloudnorm as pyln
    L = {}
    L['länge_samples'] = len(y); L['länge_s'] = len(y) / SR
    L['peak_dbfs'] = 20 * np.log10(np.abs(y).max() + 1e-12)
    meter = pyln.Meter(SR); L['lufs'] = meter.integrated_loudness(y)
    L['dc'] = float(np.abs(y.mean(axis=0)).max())
    L['max_sprung'] = float(np.abs(np.diff(y, axis=0)).max())
    c = np.corrcoef(y[:, 0], y[:, 1])[0, 1]; L['stereo_korr'] = float(c)
    bars = []
    for b in range(30):
        seg = y[int(b * BAR * SR):int((b + 1) * BAR * SR)]; bars.append((20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-12), 20 * np.log10(np.abs(seg).max() + 1e-12)))
    print('--- Kennzahlen ---')
    for k, v in L.items(): print(f'  {k}: {v:.4f}' if isinstance(v, float) else f'  {k}: {v}')
    print('--- Takt: RMS dBFS / Peak dBFS ---')
    for b, (r, p) in enumerate(bars, 1): print(f'  Takt {b:2d} ({(b-1)*2:2d}–{b*2:2d} s): RMS {r:6.1f}  Peak {p:6.1f}  ' + '#' * int(max(0, (r + 50)) * 1.2))
    # Kick-Raster prüfen: tiefpass-gefilterte Hüllkurve, Peaks auf dem 0,5-s-Raster
    lo = signal.sosfilt(signal.butter(4, 120, 'lp', fs=SR, output='sos'), y.mean(axis=1)); env = np.abs(signal.hilbert(lo))
    pk, _ = signal.find_peaks(env, height=env.max() * 0.35, distance=int(0.3 * SR))
    off = [(p / SR) % BEAT for p in pk]; off = [min(o, BEAT - o) for o in off]
    print(f'--- Kick-Onsets: {len(pk)} Peaks, mittlere Abweichung zum Beat-Raster: {1000*np.mean(off):.1f} ms (Hüllkurven-Maximum liegt systembedingt ~20 ms hinter dem Anschlag)')
    # Bilder
    f, tt, S = signal.spectrogram(y.mean(axis=1), SR, nperseg=4096, noverlap=3072)
    fig, ax = plt.subplots(2, 1, figsize=(18, 9), gridspec_kw={'height_ratios': [3, 1]})
    ax[0].pcolormesh(tt, f[1:], 10 * np.log10(S[1:] + 1e-14), shading='auto', cmap='magma', vmin=-110, vmax=-40); ax[0].set_yscale('log'); ax[0].set_ylim(30, 16000)
    for b in range(1, 31): ax[0].axvline((b - 1) * BAR, color='w', alpha=0.15, lw=0.6)
    for tm, lab in ((18, 'Schnitt'), (20, 'Drop'), (54, 'Kristall')): ax[0].axvline(tm, color='cyan', alpha=0.7); ax[0].text(tm + 0.1, 20000, lab, color='cyan', fontsize=9)
    ax[0].set_title('Linkado-Soundtrack – Spektrogramm (log. Frequenz), weiße Linien = Takte'); ax[0].set_ylabel('Hz')
    ax[1].bar(np.arange(30) * BAR + BAR / 2, [b[0] for b in bars], width=BAR * 0.9, color='#E67E22'); ax[1].set_ylabel('RMS dBFS'); ax[1].set_xlim(0, 60); ax[1].set_ylim(-45, -10); ax[1].set_xlabel('s')
    plt.tight_layout(); plt.savefig(os.path.join(HERE, 'spektrogramm.png'), dpi=70); plt.close()
    return L

def main():
    t0 = time.time(); print('Rendere Soundtrack …')
    y = render()
    # Lautheit auf ca. −14 LUFS (Web/Social), Spitzen ≤ −1 dBFS
    import pyloudnorm as pyln
    meter = pyln.Meter(SR); lufs = meter.integrated_loudness(y); gain = 10 ** ((-14.0 - lufs) / 20); y = y * gain
    pk = np.abs(y).max(); lim = 10 ** (-1.0 / 20)
    if pk > lim:
        # weicher Limiter, danach exakt auf −1 dBFS
        y = np.tanh(y / lim * 0.92) / np.tanh(0.92) * lim; y *= lim / np.abs(y).max()
    assert len(y) == N, (len(y), N)
    wav = os.path.join(HERE, 'soundtrack.wav'); sf.write(wav, y, SR, subtype='PCM_16')
    try: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '192k', os.path.join(HERE, 'soundtrack.mp3')], check=True)
    except Exception as e: print('mp3 übersprungen:', e)
    print(f'Fertig in {time.time() - t0:.1f} s → {wav}')
    if '--no-analysis' not in sys.argv: analyse(sf.read(wav)[0])

if __name__ == '__main__':
    main()
