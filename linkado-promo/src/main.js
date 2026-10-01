import { createEngine } from './engine.js';
import * as kit from './kit.js';

const tl = await (await fetch('/timeline.json')).json();
const stage = document.getElementById('stage');
const E = createEngine(tl, stage);
E.kit = kit;

// Szenen-Module (jedes registriert seine Szenen selbst). Fehlende Module werden übersprungen.
const MODULES = ['./scenes/act1.js', './scenes/act2.js', './scenes/act2b.js', './scenes/finale.js'];
for (const m of MODULES) {
  try { (await import(m)).default(E); }
  catch (e) { console.warn('Szenenmodul nicht geladen:', m, e && e.message); }
}
await E.start();

// Vorschau im normalen Browser:  index.html?t=21.5  (Standbild)  |  ?play  (Echtzeit)  |  ?fit  (skaliert)  |  ?debug
const q = new URLSearchParams(location.search);
if (q.has('fit')) {
  const fit = () => { const s = Math.min(innerWidth / E.W, innerHeight / E.H); stage.style.transform = `scale(${s})`; };
  fit(); addEventListener('resize', fit);
}
if (q.has('t')) E.renderAt(parseFloat(q.get('t')));
else if (q.has('play')) {
  const t0 = performance.now();
  const loop = () => { E.renderAt(((performance.now() - t0) / 1000) % tl.meta.duration); requestAnimationFrame(loop); };
  loop();
} else E.renderAt(0);
