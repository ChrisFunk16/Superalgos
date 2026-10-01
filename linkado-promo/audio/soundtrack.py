#!/usr/bin/env python3
"""
Linkado – Werbefilm: synthetischer Soundtrack (ruhiger, melodischer Techno), 64,000 s.

Dramaturgie (siehe timeline.json):  CHAOS  →  KLARHEIT  →  KRISTALLISATION
  Takte 1–10  (0–20 s)  drei Stimmen, die aneinander vorbeireden (verstimmt, polymetrisch, leise)
  Takt 10     (18–20 s) harter Schnitt, Atemzug, Pad schwillt an, Rückwärts-Hall saugt in den Drop
  Takte 11–26 (20–52 s) alles rastet ein (120 BPM, A-Moll), Schicht für Schicht entsteht der Groove
  Takte 28–32 (54–64 s) Aufbau, Halbtakt-Drop-out, bei 56.0 Aufhellung nach A-Dur, Ausklang (Endbild 59–64 s)

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
DUR = float(json.load(open(os.path.join(HERE, '..', 'timeline.json'), encoding='utf-8'))['meta']['duration'])   # 64,0 s
N = int(round(DUR * SR))     # 2 880 000
rng = np.random.default_rng(20261001)
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json'), encoding='utf-8'))
HITS = TL['hits']

# ------------------------------------------------------------------ Mischpult (linear) – hier drehen
MIX = dict(
    kick=0.72, bass=0.46, hats=0.055, rim=0.26, pad=0.42, arp=0.36, arp2=0.20, stab=0.38, bell=0.34, fx=0.30, chaos=1.0, drone=0.5, a1=0.40, a1v=0.55, ui=0.34,
)
SEND_REV = dict(kick=0.00, bass=0.00, hats=0.07, rim=0.35, pad=0.38, arp=0.28, arp2=0.34, stab=0.55, bell=0.60, fx=0.45, chaos=0.34, drone=0.20, a1=0.26, a1v=0.34, ui=0.24)
SEND_DLY = dict(arp=0.38, arp2=0.42, stab=0.55, bell=0.22, chaos=0.10, hats=0.0, a1v=0.30, ui=0.08)
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

def crash(vel=1.0):
    n = int(3.2 * SR); t = np.arange(n) / SR
    x = filt(noise(n), 'hp', 3200, 0.7, order=2); x = filt(x, 'bp', 7500, 0.5) * 1.3 + x * 0.6
    e = np.exp(-t / 0.9) * np.minimum(1, t / 0.002)
    return fade_edges(np.stack([x * e, np.roll(x, 97) * e], axis=1) * vel, 0.001, 0.08)

# ------------------------------------------------------------------ UI-Klänge (sparsam, tonal in A-Moll/A-Dur)
def ui_tap(vel=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR; f = 700 * np.exp(-t / 0.015) + 220
    click = filt(noise(n) * np.exp(-t / 0.006), 'bp', 3000, 1.2) * 0.9
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.02) * 0.55
    return fade_edges((click + body) * vel, 0.0005, 0.01)
def ui_blip(freq, dur=0.09, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; return fade_edges(np.sin(2 * np.pi * freq * t) * np.hanning(n) * vel, 0.002, 0.01)
def ui_swipe(dur=0.42, vel=1.0):
    n = int(dur * SR); x = sweep(noise(n), 'bp', 600, 3800, q=0.9, block=128, order=2, mode='lin') * np.hanning(n) ** 1.4 * 0.55 * vel
    p = np.linspace(-0.5, 0.5, n); return fade_edges(np.stack([x * (1 - (p + 0.5)) ** 0.5, x * (p + 0.5) ** 0.5], axis=1), 0.005, 0.02)
def ui_fly(dur=0.78, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    x = sweep(noise(n), 'bp', 500, 2600, q=1.0, block=128, order=2, mode='lin') * u ** 1.4 * 0.30
    g = np.sin(2 * np.pi * np.cumsum(500 + 900 * u ** 1.5) / SR) * 0.10 * u
    return fade_edges((x + g) * np.hanning(n) ** 0.5 * vel, 0.01, 0.05)

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
    if bar >= 29: return 'Amaj9'                             # ab dem Kristall (56.0 s)
    if bar < 11: return 'Am9'
    seq = ['Am9', 'Fmaj7', 'Cmaj7', 'Gadd9']; return seq[((bar - 11) // 2) % 4]

def prog(t, a, b): return float(np.clip((t - a) / (b - a), 0, 1))
def bar_t(bar, beat=1): return (bar - 1) * BAR + (beat - 1) * BEAT
def R(x): return x

# ======================================================================================= ARRANGEMENT
def render():
    t0 = time.time()
    B = {k: Bus() for k in ['kick', 'bass', 'hats', 'rim', 'pad', 'arp', 'arp2', 'stab', 'bell', 'fx', 'chaos', 'drone', 'a1', 'a1v', 'ui']}
    kicks = []                                                # (Zeit, Pegel) für Sidechain
    hum = lambda s=0.003: rng.uniform(-s, s)                  # Mikro-Timing nur für Nicht-Kick-Elemente

    # ------------------------------------------------------------------ ACT I – Chaos (0–18 s) · v3 „Spannungsaufbau in A-Moll“
    # Bewusst klassisch und gut hörbar: weich pulsierender Kick (Filter öffnet sich), Uhr-Ticks, Achtel-Hats, Bass auf den Offbeats, Pad.
    # Die drei Insellösungen bringen je EINEN Ton des A-Moll-Dreiklangs (M365 = A, openDesk = C, Nextcloud = E) – erst zusammen ergeben sie einen Akkord.
    # Überforderung (14–18 s): Akkord-Stabs auf den fünf Blickwinkeln (Am – F – C – G – Am), 16tel-Arpeggio, Rim-Wirbel, Riser. Kein Clash, kein Polymeter.
    CUT = hits('cut')[0]['t']                                  # 18.0
    A1, A1V = B['a1'], B['a1v']                                # a1 = Rhythmus/Fx, a1v = Töne/Stimmen (werden vom Kick geduckt)
    def soft_kick(level, cutoff): return filt(kick(1.0, 0.0, 0.5), 'lp', cutoff, 0.7, order=2) * level
    # Drone: reine Quinte A2 + E3 (hohl und ruhig, kein Sub), Filter öffnet sich über die ganzen 18 s
    n = idx(CUT); t = np.arange(n) / SR
    dy = osc_tri(110.0, n) + osc_tri(110.0 * 1.002, n, 0.3) + osc_tri(164.81, n, 0.6) + osc_tri(164.81 * 0.998, n, 0.9)      # Dreieck: kaum Terz-Obertöne (kein C♯ gegen das C)
    dy = sweep(dy, 'lp', 380, 1100, q=0.8, block=256, order=2, mode='lin') * 1.4 * (0.30 + 0.70 * np.clip(t / 14.0, 0, 1) ** 1.3) * (0.88 + 0.12 * np.sin(2 * np.pi * 0.13 * t))
    air = filt(noise(n), 'bp', 7500, 0.7) * 0.012 * (0.4 + 0.6 * np.clip(t / 10, 0, 1)) * (1 + 0.5 * np.sin(2 * np.pi * 0.2 * t))
    B['drone'].add(fade_edges(dy * 0.085, 0.8, 0.01), 0.0); B['drone'].add(air, 0.0, pan=0.0)
    for k in range(int(10.0 / BEAT)):                           # Uhr-Ticks (Zählzeiten)
        tt = k * BEAT; A1.add(tick(2300 if k % 2 == 0 else 1500, 0.30 if k % 4 == 0 else 0.18), tt, 0.5, pan=-0.2 if k % 2 else 0.2)
    # Puls: ab 2 s gedämpfter Kick (halbe Zeit), ab 6 s auf jeder Zählzeit, Filter öffnet sich bis 18 s
    for k in range(int(CUT / BEAT)):
        tk = k * BEAT
        if tk < 6.0 and k % 2: continue
        co = 105 + 1100 * prog(tk, 6, 18) ** 1.6 + 30 * prog(tk, 0, 6); lv = 0.30 + 0.55 * prog(tk, 0, 18)
        A1.add(soft_kick(lv, co), tk, 1.0); kicks.append((tk, 0.30 * (0.5 + prog(tk, 0, 18))))
    # Hats: ab 6 s gedämpfte Achtel, ab 10 s offene Hats auf dem Offbeat
    for k in range(int((CUT - 6.0) / (BEAT / 2))):
        tt = 6.0 + k * BEAT / 2
        A1.add(filt(hat(False, 0.5 + 0.4 * prog(tt, 6, 18)), 'lp', 7500, 0.7), tt + hum(0.002), 0.30 + 0.25 * prog(tt, 6, 18), pan=(-1) ** k * 0.35)
        if tt >= 10.0 and k % 2 == 1: A1.add(filt(hat(True, 0.6), 'lp', 8500, 0.7), tt + hum(0.002), 0.22 + 0.18 * prog(tt, 10, 18), pan=0.45)
    # Bass-Puls ab 10 s: Offbeat-Achtel auf A – C – E (Am-Dreiklang), tief genug zum Tragen, aber noch kein Sub
    for k in range(int((CUT - 10.0) / (BEAT / 2))):
        tt = 10.0 + k * BEAT / 2
        if k % 2 == 0: continue
        nn = [45, 45, 48, 52][(k // 2) % 4]
        A1.add(filt(bass_note(midi(nn), BEAT * 0.38, 0.9, 0.6), 'hp', 70, 0.7), tt, 0.30 + 0.25 * prog(tt, 10, 18), pan=0.0)
    # Drei Stimmen, im 16tel-Raster verzahnt: zusammen ergeben sie die Figur A – C – E – A – E – C (A-Moll-Arpeggio)
    #   Stimme 1 (M365, Zupfton A4) ab 2 s · Stimme 2 (openDesk, Marimba C5) ab 6 s · Stimme 3 (Nextcloud, Glocke E5) ab 10 s
    def v1(f, vel=1.0): return pluck(f, 0.30, vel, 0.25, tau=0.08)
    def v2(f, vel=1.0): return marimba(f, vel, 0.45)
    def v3(f, vel=1.0): return bell(f, 1.3, vel, tail=0.25)
    VOICES = [(2.0, [3, 11], 69, v1, 0.20, -0.35), (6.0, [6, 14], 72, v2, 0.20, 0.35), (10.0, [9, 13], 76, v3, 0.17, 0.0)]
    for t_on, steps, nn, fn, lv0, pan_ in VOICES:
        for bar in range(int(t_on // BAR) + 1, int(CUT // BAR) + 1):
            for st in steps:
                tt = bar_t(bar) + st * S16
                if tt < t_on or tt >= CUT - 0.05: continue
                A1V.add(fn(midi(nn), 1.0), tt + hum(0.002), lv0 + 0.16 * prog(tt, t_on, 17), pan=pan_)
    # Überforderung: 16tel-Ticks und Rim-Wirbel, beschleunigend lauter/dichter
    for k in range(int((CUT - 14.0) / S16)):
        tk = 14.0 + k * S16; A1.add(tick(3800, 0.4), tk, 0.05 + 0.22 * prog(tk, 14, 18), pan=(-1) ** k * 0.4)
    tt = 16.0
    while tt < CUT - 0.05:
        step = BEAT / 2 if tt < 17.0 else (S16 if tt < 17.6 else S16 / 2)
        A1.add(rim(0.35 + 0.55 * prog(tt, 16, 18)), tt, 0.35 + 0.45 * prog(tt, 16, 18), pan=0.1); tt += step
    # Fünf Blickwinkel = fünf Akkord-Stabs (Am – F – C – G – Am) im 0,75-s-Raster, darunter ein 16tel-Arpeggio über dem jeweiligen Akkord
    BT = [h['t'] for h in hits('text') if 14 <= h['t'] < CUT]                     # 14.0 · 14.75 · 15.5 · 16.25 · 17.0
    ACH = ['Am9', 'Fmaj7', 'Cmaj7', 'Gadd9', 'Am9']
    for (a, b), ch in zip(zip(BT, BT[1:] + [CUT]), ACH):
        A1V.add(stab(CH[ch]['stab'], 0.9, 0.36, 1100 + 800 * prog(a, 14, 18)), a, 0.34 + 0.12 * prog(a, 14, 18), pan=-0.1)
        n = int(0.35 * SR); t = np.arange(n) / SR; imp = np.sin(2 * np.pi * np.cumsum(95 * np.exp(-t / 0.04) + 55) / SR) * np.exp(-t / 0.12)
        A1.add(fade_edges(imp + filt(noise(n), 'bp', 900, 1.0) * np.exp(-t / 0.05) * 0.5, 0.002, 0.02), a, 0.26 + 0.08 * (a - 14))
        k = 0; tt = a
        while tt < b - 1e-6:
            note = CH[ch]['arp'][[0, 2, 4, 2, 5, 4, 2, 4][k % 8]]
            A1V.add(pluck(midi(note), 0.26, 0.8, 0.30, tau=0.08), tt + hum(0.002), 0.10 + 0.22 * prog(tt, 14, 18), pan=(-1) ** k * 0.3); tt += S16; k += 1
    # Hook (0–2 s): aufsteigender Moll-Dreiklang A – C – E auf „funktioniert. / Nur nicht / dazwischen.“ – bleibt offen, die Auflösung kommt erst im Finale
    for hk_, nn in zip([h for h in hits('ping') if h['t'] < 2.0], [69, 72, 76]):
        A1V.add(marimba(midi(nn), 1.0), hk_['t'], 0.20, pan=(-1) ** int(hk_['t'] * 2) * 0.3)
    # Kartenschläge: Grundton A / C / E (Sub-Impuls + gezupfte Note), danach je Lücke ein heller Ton derselben Stimme
    for h in hits('card'):
        tt, v = h['t'], h['voice']; f0 = {1: 110.0, 2: 130.81, 3: 164.81}[v]
        A1.add(sub_boom(f0, 0.45, 0.5), tt, 0.26)
        A1V.add({1: v1, 2: v2, 3: v3}[v](midi({1: 57, 2: 60, 3: 64}[v]), 1.0), tt, 0.30, pan=[0, -0.3, 0.35, 0.0][v])
        A1.add(filt(noise(int(0.3 * SR)) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.05), 'bp', 700, 0.9), tt, 0.10)
    for h in hits('ping'):
        tt, v = h['t'], h.get('voice', 0)
        if tt >= CUT or v == 0: continue
        A1V.add({1: v1, 2: v2, 3: v3}[v](midi({1: 81, 2: 84, 3: 88}[v]), 1.0), tt, 0.18, pan=[0, -0.3, 0.35, 0.0][v])
    for h in hits('shove'):
        tt = h['t']; n = int(0.45 * SR); t = np.arange(n) / SR; f = 700 * np.exp(-t / 0.25) + 150; y = filt(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2), 'lp', 1800, 0.7)
        A1V.add(fade_edges(y, 0.003, 0.03), tt, 0.12, pan=0.0)
    for h in hits('riser'):
        if h['t'] < 20:
            dur = h['end'] - h['t']; B['fx'].add(riser(dur, 300, 7500, 1.0, pitch=(220, 880)), h['t'], 0.5)
    # Tape-Stop: in den letzten 0,6 s „fällt“ die Welt zusammen (Tonhöhe + Höhen sacken ab), danach harter Schnitt
    def tape_stop(x, t0, dur, depth=0.88):
        i0 = idx(t0); n = idx(dur); seg = x[i0:i0 + n].copy(); u = np.arange(len(seg)) / max(1, len(seg))
        pos = np.cumsum(1 - depth * u ** 1.5); pos = np.clip(pos, 0, len(seg) - 1)
        out = np.stack([np.interp(pos, np.arange(len(seg)), seg[:, c]) for c in (0, 1)], axis=1)
        out = filt(out, 'lp', 2600, 0.7) * ((1 - u) ** 0.7)[:, None]; x[i0:i0 + len(seg)] = out
    for bus_ in (A1, A1V, B['drone']): tape_stop(bus_.x, CUT - 0.6, 0.6)
    gate = np.ones(N); i = idx(CUT); gate[i:] = 0.0; gate[i - 120:i] = np.linspace(1, 0, 120)
    for k in ('a1', 'a1v', 'drone'): B[k].x *= gate[:, None]
    # ---- Übergang „Es geht auch anders“ → Drop (18–20 s): trägt Act I weiter, statt zu verstummen
    #      Herzschlag-Kick (wird lauter), A–C–E-Motiv der drei Inseln (zum ersten Mal zusammen, steigend und offen), Rim-Wirbel, Riser; danach 80 ms Vakuum
    for tt, lv, co in [(18.5, 0.22, 260), (19.0, 0.32, 340), (19.5, 0.46, 520), (19.75, 0.55, 700), (19.875, 0.60, 900)]:
        A1.add(filt(kick(1.0, 0.0, 0.5), 'lp', co, 0.7, order=2) * lv, tt, 1.0)
    for tt, nn, lv in [(19.0, 69, 0.26), (19.25, 72, 0.30), (19.5, 76, 0.34)]:
        A1V.add(marimba(midi(nn), 1.0), tt, lv, pan=(-1) ** int(tt * 4) * 0.3)
    A1V.add(bell(midi(76), 1.4, 0.8, tail=0.5), 19.5, 0.22)
    tt = 19.25
    while tt < 19.9:
        A1.add(rim(0.3 + 0.5 * prog(tt, 19.25, 19.9)), tt, 0.28 + 0.40 * prog(tt, 19.25, 19.9), pan=0.1); tt += 0.125 if tt < 19.6 else 0.0625
    B['fx'].add(riser(0.92, 400, 9000, 1.0, pitch=(330, 1320)), 19.0, 0.55)
    # Atemzug: Sub-Swell (erstes Mal Tiefbass!) + Rückwärts-Becken, Pad (Am9) ab 19.0 löst das B♭ auf, Rückwärts-Hall saugt in den Drop (20.0)
    n = idx(2.0); t = np.arange(n) / SR; sw = np.sin(2 * np.pi * 55.0 * t) * np.clip((t - 0.4) / 1.5, 0, 1) ** 2
    B['fx'].add(fade_edges(sw * 0.45, 0.01, 0.01), CUT, 1.0)
    nr = idx(1.3); rc = filt(noise(nr), 'hp', 3800, 0.7, order=2) * np.linspace(0, 1, nr) ** 2.4; B['fx'].add(fade_edges(np.stack([rc, np.roll(rc, 150)], axis=1) * 0.55, 0.01, 0.002), 20.0 - 1.3, 1.0)
    ASK = [h['t'] for h in hits('text') if 18.5 < h['t'] < 19.5][0]
    DROP = hits('drop')[0]['t']                                                                                        # 20.0
    chord = pad_chord(CH['Am9']['stab'], 0.25, attack=0.01, release=0.2, cutoff=2400.0)
    suck = _suck_back(chord)
    B['fx'].add(suck, DROP - len(suck) / SR, 0.55)

    # ------------------------------------------------------------------ ACT II – Klarheit (20–52 s) + ACT III
    cut_a, cut_b = hits('cut')[1]['t'], hits('cut')[1]['end']                 # 53.5 … 54.0
    CRY = hits('crystal')[0]['t']                                             # 56.0
    END_GROOVE = CRY + 4.0                                                    # 60.0: danach nur noch Glocken und Pad (Endbild)
    KICK_ON = [(DROP, cut_a), (CRY, END_GROOVE)]
    def kick_on(tt): return any(a - 1e-6 <= tt < b - 1e-6 for a, b in KICK_ON)
    nbeats = int(DUR / BEAT)
    for k in range(nbeats):
        tk = k * BEAT
        if tk >= DROP and kick_on(tk):
            lv = 0.82 + 0.18 * prog(tk, 20, 36)
            B['kick'].add(kick(1.0 * lv, 0.0), tk, 1.0); kicks.append((tk, lv))
    # Bass: Pedal auf Akkordgrund, 8tel auf den Offbeats; Sub-Teppich am Anfang
    def bass_active(tt):
        if tt < DROP or tt >= END_GROOVE: return False
        if cut_a <= tt < cut_b: return False
        if 34.0 <= tt < 36.0: return False                                    # Variation: Takt 18 ohne Bass
        return True
    # liegender Sub in den ersten zwei Takten des Groove
    B['bass'].add(sub_boom(55.0, 2.6, 0.9), DROP, 0.38)
    for bar in range(11, 31):
        for e8 in range(8):
            tt = bar_t(bar) + e8 * (BEAT / 2)
            if bar < 11 or tt >= END_GROOVE or not bass_active(tt) or e8 % 2 == 0: continue
            ch = chord_at(tt); root = CH[ch]['bass']; pat = [0, 0, 12, 0, 0, 7, 0, 12]; semi = pat[e8]
            if bar % 2 == 0 and e8 == 7: semi = {'Am9': 10, 'Fmaj7': 7, 'Cmaj7': 7, 'Gadd9': 7, 'Amaj9': 7}[ch]      # Variation, immer akkordeigen
            B['bass'].add(bass_note(midi(root + semi), BEAT * 0.42, 0.9 + 0.1 * (e8 == 3), 0.25 + 0.5 * prog(tt, 24, 46)), tt, 0.9 * (0.75 + 0.25 * prog(tt, 24, 30)))
    # Hi-Hats
    for bar in range(11, 30):
        for s in range(16):
            tt = bar_t(bar) + s * S16
            if cut_a <= tt < cut_b or tt >= END_GROOVE: continue
            if tt >= CRY and tt < 54.0: continue
            open_ = (s % 4 == 2)
            if open_:
                B['hats'].add(hat(True, 0.9), tt + hum(0.002), 0.9, pan=0.25)
            elif bar >= 15 and s % 2 == 1 or (bar >= 15 and s % 4 == 0 and s % 8 != 0):
                thin = (cut_a - 3.5) <= tt < (cut_a - 1.5) or bar >= 29
                B['hats'].add(hat(False, (0.55 + 0.35 * ((s * 5) % 3 == 0)) * (0.5 if thin else 1)), tt + hum(0.002), 0.7, pan=-0.2 if s % 4 == 1 else 0.3)
    # Rim / Clap auf 2 und 4
    for bar in range(11, 29):
        for beat in (2, 4):
            tt = bar_t(bar, beat)
            if cut_a <= tt < cut_b: continue
            B['rim'].add(rim(0.7 if beat == 2 else 0.9), tt, 0.9, pan=0.15)
    for bar in range(29, 31):
        for beat in (2, 4): B['rim'].add(rim(0.6), bar_t(bar, beat), 0.8, pan=0.1)
    # Pad: Akkordteppich, Filter öffnet sich über die Zeit
    segs = [(18.5, 24.0, 'Am9'), (24.0, 28.0, 'Fmaj7'), (28.0, 32.0, 'Cmaj7'), (32.0, 36.0, 'Gadd9'), (36.0, 40.0, 'Am9'), (40.0, 44.0, 'Fmaj7'), (44.0, 48.0, 'Cmaj7'), (48.0, 52.0, 'Gadd9'), (52.0, 54.6, 'Am9')]
    for a, b, ch in segs:
        cut_f = 800 + 2600 * prog(a, 20, 48); first = a == 18.5
        pc = pad_chord(CH[ch]['pad'], b - a + (0.6 if not first else 0.0), attack=1.4 if first else 1.2, release=1.4, cutoff=cut_f)
        B['pad'].add(pc, a, 0.8 if first else 1.0)
    # Finale-Pad (A-Dur, hell) – setzt beim Kristall ein und klingt bis zum Ende aus
    pc = pad_chord(CH['Amaj9']['pad'] + [69], 8.0, attack=0.25, release=2.6, cutoff=4200.0, spread=0.7); B['pad'].add(pc, CRY, 1.15)
    # Stabs (Dub-Akkord auf dem Offbeat der Zählzeit 2) – Takte 15–17 und 19–23 sowie 28–29
    def stab_bar(bar): return (15 <= bar <= 17) or (19 <= bar <= 23) or bar in (29, 30)
    for bar in range(11, 31):
        if not stab_bar(bar): continue
        tt = bar_t(bar, 2) + BEAT / 2 + hum(0.002); ch = chord_at(tt)
        if tt >= END_GROOVE: continue
        B['stab'].add(stab(CH[ch]['stab'], 0.9, 0.34, 1400 + 800 * prog(tt, 28, 46)), tt, 0.9, pan=-0.25)
        if bar % 2 == 1 and bar < 29: B['stab'].add(stab([n + 12 for n in CH[ch]['stab'][:3]], 0.5, 0.25, 1800), bar_t(bar, 4) + hum(0.002), 0.5, pan=0.3)
    # Arpeggio (Hauptstimme) – 16tel; dünn in Takt 13/14, voll ab 15, dunkel in Takt 18, heller bis Takt 26
    P1 = [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 6, 7, 6, 4, 2]
    P2 = [4, 5, 7, 5, 6, 4, 5, 2, 4, 5, 7, 5, 6, 7, 5, 4]
    V = [1.0, 0.45, 0.7, 0.5, 0.9, 0.45, 0.7, 0.5, 1.0, 0.45, 0.7, 0.55, 0.85, 0.5, 0.7, 0.5]
    for bar in range(12, 31):
        for s in range(16):
            tt = bar_t(bar) + s * S16
            if tt >= END_GROOVE or (cut_a <= tt < cut_b): continue
            if bar == 12 and s % 4 != 0: continue
            if bar < 15 and s % 2 == 1: continue
            if bar >= 28 and tt < CRY and tt >= cut_a - 1.5 and s % 2 == 1: continue
            ch = chord_at(tt); notes = CH[ch]['arp']
            if bar >= 29:
                notes = CH['Amaj9']['arp']
            note = notes[P1[s] % len(notes)] + (12 if (bar >= 29 and s % 4 == 3) else 0)
            vel = V[s] * (0.7 + 0.3 * prog(tt, 28, 44)) * (0.85 if bar == 18 else 1.0)
            bright = (0.3 if bar == 18 else 0.55 + 0.45 * prog(tt, 28, 48)) + (0.25 if bar >= 29 else 0)
            B['arp'].add(pluck(midi(note), 0.30, vel, bright), tt + hum(0.0025), 0.9, pan=(-1) ** s * (0.3 + 0.2 * (s % 4 == 0)))
    # Zweite Stimme: eine Oktave höher, auf den Off-16teln, ab Takt 21
    for bar in range(21, 31):
        for s in range(16):
            tt = bar_t(bar) + s * S16
            if tt >= END_GROOVE or (cut_a <= tt < cut_b) or s % 4 != 3 and s % 8 != 6: continue
            if 47.0 <= tt < 50.0 and s % 8 != 6: continue
            ch = chord_at(tt); notes = CH[ch]['arp'] if bar < 29 else CH['Amaj9']['arp']
            B['arp2'].add(pluck(midi(notes[P2[s] % len(notes)] + 12), 0.34, 0.8, 0.95, tau=0.09), tt + hum(0.002), 0.9, pan=(-1) ** (s // 4) * 0.6)
    # Luftiges Schimmern (Rauschen, gefiltert) ab Takt 21 – Höhepunkt 24–26
    for a, b, lv in ((40.0, 46.0, 0.05), (46.0, 54.0, 0.09)):
        n = idx(b - a); x = noise(n); x = filt(x, 'bp', 9000, 0.8) * (np.linspace(0.3, 1, n)) * lv
        B['fx'].add(fade_edges(np.stack([x, np.roll(x, 300)], axis=1), 0.5, 0.8), a, 1.0)

    # ------------------------------------------------------------------ Akzente aus der Timeline (Act II / III)
    NOTES_P = [81, 84, 88, 79, 76, 91]              # A5 C6 E6 G5 E5 G6 (A-Moll-Pentatonik)
    pk = 0
    for h in HITS:
        tt, kd = h['t'], h['kind']
        if tt < DROP - 1e-6 or tt >= 60: continue
        if kd == 'drop':
            # Sonic Logo, erste Aussage in Moll: A – C – E – A (die drei Töne der Insellösungen finden sich, der letzte hält)
            for k_, nn in enumerate([81, 84, 88, 93]):
                B['bell'].add(bell(midi(nn), 3.4 if k_ == 3 else 1.6, 1.0, tail=1.0 if k_ == 3 else 0.6), tt + 0.25 * k_, 0.70 if k_ < 3 else 0.80)
            B['bell'].add(bell(midi(69), 3.4, 0.8), tt, 0.50)
            B['fx'].add(crash(1.0), tt, 0.42)                                                                   # Crash: der Schlag
            B['stab'].add(stab(CH['Am9']['stab'] + [n + 12 for n in CH['Am9']['stab'][:3]], 1.0, 0.6, 2600), tt, 0.9, pan=0.0)   # breiter Akkord
            n_ = idx(1.4); dl = sweep(noise(n_), 'bp', 9000, 500, q=0.9, block=128, order=2, mode='lin') * np.hanning(n_) ** 0.8 * 0.25
            B['fx'].add(fade_edges(np.stack([dl, np.roll(dl, 200)], axis=1), 0.01, 0.1), tt, 0.5)             # Downlifter
        elif kd == 'whoosh':
            dur = h['end'] - tt; B['fx'].add(riser(dur, 500, 9000, 1.0, pitch=(660, 1320)), tt, 0.55); n = idx(dur); gl = np.sin(2 * np.pi * np.cumsum(1318 * (1 + 0.5 * np.linspace(0, 1, n))) / SR) * np.hanning(n) * 0.2
            B['fx'].add(gl, tt, 0.5)
        elif kd == 'snap':
            if 41 <= tt <= 43.1:
                nn = {41.0: 81, 42.0: 84, 43.0: 88}.get(round(tt, 2), 81); B['bell'].add(bell(midi(nn), 2.4, 1.0), tt, 0.75); B['bell'].add(tick(2600, 1.0), tt, 0.4)
            elif abs(tt - (CRY + 0.5)) < 0.01: B['bell'].add(bell(midi(88), 3.0, 1.0), tt, 0.80)
            else: B['bell'].add(tick(3200, 1.0), tt, 0.5); B['bell'].add(marimba(midi(93), 0.7), tt, 0.25)
        elif kd == 'lock':
            B['bass'].add(sub_boom(55.0, 1.8, 1.0), tt, 0.5)
            for nn in (67, 71, 74, 79): B['bell'].add(bell(midi(nn), 3.0, 0.7), tt + 0.01 * (nn % 3), 0.4)
        elif kd == 'click':
            var = h.get('variant', 'tap'); B['ui'].add(ui_tap(1.0 if var != 'nav' else 0.8), tt, 0.8)
            if var == 'add':    B['ui'].add(marimba(midi(76), 0.8, 0.30), tt + 0.03, 0.5); B['ui'].add(marimba(midi(81), 1.0, 0.40), tt + 0.10, 0.6)
            if var == 'toggle': B['ui'].add(ui_blip(midi(81), 0.08), tt + 0.04, 0.35); B['ui'].add(ui_blip(midi(88), 0.10), tt + 0.11, 0.35)
        elif kd == 'swipe':  B['ui'].add(ui_swipe(0.42), tt - 0.05, 0.5)
        elif kd == 'fly':    B['ui'].add(ui_fly(h['end'] - tt), tt, 0.6)
        elif kd == 'land':   B['ui'].add(marimba(midi(93), 0.7, 0.35), tt, 0.5, pan=-0.3); B['ui'].add(ui_tap(0.5), tt, 0.4)
        elif kd == 'chime':  B['ui'].add(bell(midi(88), 1.2, 0.8, tail=0.25), tt, 0.55); B['ui'].add(bell(midi(93), 1.6, 0.9, tail=0.3), tt + 0.13, 0.55)
        elif kd == 'type':
            for q_ in range(h['n']): B['ui'].add(tick(float(rng.uniform(1900, 2900)), float(rng.uniform(0.25, 0.45))), tt + (h['end'] - tt) * q_ / h['n'], 0.55, pan=float(rng.uniform(-0.2, 0.2)))
        elif kd == 'ping' and h.get('voice', 0) == 0:
            B['bell'].add(marimba(midi(NOTES_P[pk % 6]), 1.0), tt, 0.50, pan=(-1) ** pk * 0.35); pk += 1
        elif kd == 'tagline':
            if abs(tt - hits('tagline')[2]['t']) < 0.01:      # Sonic Logo als Signatur: A – C♯ – E – A (Dur)
                for k_, nn in enumerate([81, 85, 88, 93]): B['bell'].add(bell(midi(nn), 3.0 if k_ == 3 else 1.4, 1.0, tail=1.2 if k_ == 3 else 0.5), tt + 0.25 * k_, 0.72 if k_ < 3 else 0.82)
            else:
                tl_ = [x['t'] for x in hits('tagline')]; nn = {tl_[0]: 93, tl_[1]: 90}.get(tt, 88); B['bell'].add(bell(midi(nn), 3.6, 1.0, tail=1.3), tt, 0.7)
        elif kd == 'riser' and tt >= 52 and 'end' in h:   # Aufbau vor dem Kristall (54–56 s)
            B['fx'].add(riser(h['end'] - tt, 300, 10000, 1.0, pitch=(330, 1760)), tt, 0.60)
    # Aufbau-Fill vor dem Drop-out: 16tel-Snare-Rolle (Rim) in den 1,5 s vor dem Drop-out
    for k in range(int(1.5 / S16)):
        tt = cut_a - 1.5 + k * S16
        if k % 2 == 0 or k > 6: B['rim'].add(rim(0.25 + 0.55 * prog(tt, cut_a - 1.5, cut_a)), tt, 0.5 * prog(tt, cut_a - 1.5, cut_a) + 0.15)
    # Kristall (56.0 s): Sub-Boom, Glas-Kaskade (A-Dur), Becken-Schimmer
    B['bass'].add(sub_boom(55.0, 2.6, 1.0), CRY, 0.6)
    for k, nn in enumerate([69, 73, 76, 81, 85, 88, 93, 97, 100]):
        B['bell'].add(bell(midi(nn), 3.4, 0.9 - 0.04 * k, tail=1.2), CRY + 0.07 * k, 0.38)
    B['bell'].add(bell(midi(81), 3.4, 1.0, tail=1.2), CRY, 0.75); B['bell'].add(bell(midi(85), 3.0, 1.0, tail=1.0), CRY + 0.25, 0.75)       # Sonic Logo: A5 · C♯6 (· E6 bei 54.5 · A6 bei 54.75)
    B['bell'].add(bell(midi(57), 4.0, 1.0, tail=1.6), CRY, 0.6)
    # Ausklang: letzte lange Glocke bei 60.0 (A5), klingt bis zum Ende
    B['bell'].add(bell(midi(81), 4.0, 1.0, tail=2.2), END_GROOVE, 0.55); B['bell'].add(bell(midi(69), 4.0, 1.0, tail=2.2), END_GROOVE, 0.45)

    # Vakuum: 80 ms Stille direkt vor dem Drop (Pad, Perkussion, Fx), der Schlag danach wirkt dadurch größer
    V0 = (hits('vacuum') or [{'t': 19.92}])[0]['t']; vg = np.ones(N); i0, i1 = idx(V0), idx(DROP); vg[i0:i1] = 0.0; vg[i0 - 144:i0] = np.linspace(1, 0, 144)
    for k in ('a1', 'a1v', 'pad', 'fx', 'drone', 'rim', 'hats', 'stab', 'arp', 'arp2'): B[k].x *= vg[:, None]
    print(f'  Ereignisse gerendert in {time.time() - t0:.1f} s')

    # ------------------------------------------------------------------ MISCHUNG (in Gruppen → Stems; Hall/Delay je Gruppe, damit Stems für sich stehen)
    GROUPS = {'drums': ['kick', 'hats', 'rim', 'a1'], 'bass': ['bass'], 'pad': ['pad', 'drone'], 'music': ['arp', 'arp2', 'stab', 'a1v'], 'bells': ['bell', 'ui'], 'fx': ['fx', 'chaos']}
    OF = {b: g for g, bs in GROUPS.items() for b in bs}
    WIDTH = dict(pad=1.5, arp=1.15, arp2=1.4, stab=1.3, bell=1.3, ui=1.2, fx=1.4)         # Seitenanteil oberhalb 200 Hz (Breite)
    kicks_sorted = sorted(kicks)
    G = {g: dict(dry=np.zeros((N, 2)), wet=np.zeros((N, 2)), dly=np.zeros((N, 2))) for g in GROUPS}
    for name, bus in B.items():
        x = bus.x
        if name == 'a1v':
            g = duck_curve([(tk, lv) for tk, lv in kicks_sorted if tk < 18.0], 0.34, rel=0.15); x = x * g[:, None]
        if name in ('a1', 'a1v'): x = filt(x, 'hp', 55.0, 0.7)
        if name in DUCK:
            g = duck_curve([(tk, lv) for tk, lv in kicks_sorted if tk >= DROP - 0.01], DUCK[name]); x = x * g[:, None]
        if name == 'bass':                                   # Bass mono
            m = x.mean(axis=1, keepdims=True); x = np.repeat(m, 2, axis=1)
        if name in ('arp', 'arp2', 'pad', 'stab', 'bell', 'hats', 'chaos', 'rim', 'ui'): x = filt(x, 'hp', 140.0, 0.7)
        if name in ('arp', 'arp2', 'stab'): x = filt(x, 'hs', 2600.0, 0.7, 5.0)
        if name == 'pad': x = filt(x, 'hs', 2200.0, 0.7, 3.5)
        if name == 'hats': x = filt(x, 'lp', 11000.0, 0.7)
        if name in WIDTH: x = widen(x, WIDTH[name])
        g = G[OF[name]]; g['dry'] += x * MIX[name]
        if SEND_REV.get(name, 0) > 0: g['wet'] += x * MIX[name] * SEND_REV[name]
        if SEND_DLY.get(name, 0) > 0: g['dly'] += x * MIX[name] * SEND_DLY[name]
    print(f'  Bus-Mix in {time.time() - t0:.1f} s')
    def chain(x):                                              # linearer Teil der Master-Kette
        x = filt(x, 'hp', 28.0, 0.7, order=2); x = filt(x, 'ls', 90.0, 0.7, 1.5); return filt(x, 'peak', 280.0, 0.9, -1.5)
    stems = {}
    for gname, g in G.items():
        wet = reverb(g['wet']); dly = pingpong(g['dly']); dly_rev = reverb(dly * 0.35)
        vgw = np.ones(N); vgw[idx(V0):idx(DROP)] = 0.18; vgw[idx(V0) - 144:idx(V0)] = np.linspace(1, 0.18, 144)   # auch der Hall-Schwanz „atmet ein“
        stems[gname] = chain(g['dry'] + (wet * 0.85 + dly * 0.8 + dly_rev * 0.5) * vgw[:, None])
    print(f'  Hall/Delay in {time.time() - t0:.1f} s')
    mix = sum(stems.values())
    norm = 0.85 / (np.abs(mix).max() + 1e-9)
    mix = np.tanh(mix * norm * 1.15) / np.tanh(1.15)            # sanfte Sättigung
    fi = int(0.02 * SR); fo = int(0.7 * SR)
    env = np.ones(N); env[:fi] = np.linspace(0, 1, fi); env[-fo:] = 0.5 * (1 + np.cos(np.linspace(0, np.pi, fo)))   # Anfang/Ende ohne Klick
    mix = mix * env[:, None]
    stems = {k: v * norm * 1.2 * env[:, None] for k, v in stems.items()}
    return mix, stems

def widen(x, amt, fc=200.0):
    """Mid/Side-Verbreiterung: nur der Seitenanteil oberhalb fc wird angehoben (Bass/Kick bleiben mittig)."""
    m = (x[:, 0] + x[:, 1]) / 2; sd = (x[:, 0] - x[:, 1]) / 2; sd = sd + (amt - 1) * filt(sd, 'hp', fc, 0.7)
    return np.stack([m + sd, m - sd], axis=1)

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
    NB = int(round(DUR / BAR))
    for b in range(NB):
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
    for b in range(1, NB + 1): ax[0].axvline((b - 1) * BAR, color='w', alpha=0.15, lw=0.6)
    for tm, lab in ((18, 'Schnitt'), (20, 'Drop'), (56, 'Kristall')): ax[0].axvline(tm, color='cyan', alpha=0.7); ax[0].text(tm + 0.1, 20000, lab, color='cyan', fontsize=9)
    ax[0].set_title('Linkado-Soundtrack – Spektrogramm (log. Frequenz), weiße Linien = Takte'); ax[0].set_ylabel('Hz')
    ax[1].bar(np.arange(NB) * BAR + BAR / 2, [b[0] for b in bars], width=BAR * 0.9, color='#E67E22'); ax[1].set_ylabel('RMS dBFS'); ax[1].set_xlim(0, DUR); ax[1].set_ylim(-45, -10); ax[1].set_xlabel('s')
    plt.tight_layout(); plt.savefig(os.path.join(HERE, 'spektrogramm.png'), dpi=70); plt.close()
    return L

def main():
    t0 = time.time(); print('Rendere Soundtrack …')
    y, stems = render()
    import pyloudnorm as pyln
    meter = pyln.Meter(SR); lufs = meter.integrated_loudness(y)
    def finish(sig, target, gain=None):
        g = 10 ** ((target - lufs) / 20) if gain is None else gain
        out = sig * g; pk = np.abs(out).max(); lim = 10 ** (-1.0 / 20)
        if pk > lim: out = np.tanh(out / lim * 0.92) / np.tanh(0.92) * lim; out *= lim / np.abs(out).max()          # weicher Limiter, exakt −1 dBFS
        return out
    master = finish(y, -14.0)                                   # Web/Social
    leise = finish(y, -20.0)                                    # Messe/Empfang/Hintergrund
    assert len(master) == N, (len(master), N)
    wav = os.path.join(HERE, 'soundtrack.wav'); sf.write(wav, master, SR, subtype='PCM_16')
    sf.write(os.path.join(HERE, 'soundtrack-leise.wav'), leise, SR, subtype='PCM_16')
    sd = os.path.join(HERE, 'stems'); os.makedirs(sd, exist_ok=True)
    g14 = 10 ** ((-14.0 - lufs) / 20); mx = max(np.abs(v).max() for v in stems.values()) * g14; sc = min(1.0, 0.98 / mx) * g14
    for k, v in stems.items(): sf.write(os.path.join(sd, f'stem_{k}.wav'), v * sc, SR, subtype='PCM_24')
    try:
        for nm in ('soundtrack', 'soundtrack-leise'):
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(HERE, nm + '.wav'), '-codec:a', 'libmp3lame', '-b:a', '192k', os.path.join(HERE, nm + '.mp3')], check=True)
    except Exception as e: print('mp3 übersprungen:', e)
    print(f'Fertig in {time.time() - t0:.1f} s → {wav} (+ leise, + {len(stems)} Stems)')
    if '--no-analysis' not in sys.argv: analyse(sf.read(wav)[0])

if __name__ == '__main__':
    main()
