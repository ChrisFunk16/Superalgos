// ============================================================
// Nachbearbeitung für das 3D-Büro (three.js EffectComposer): HalfFloat + MSAA → Tilt-Shift (Tiefenunschärfe, horizontal) → Tilt-Shift vertikal + Grading
// (Belichtung, Tonwert-Kurve „Neutral“, Kontrast, leichte Farbtrennung, Vignette, Korn, sRGB).
// Zwei Vollbild-Durchgänge nach der Szene (Rechenzeit!). Glühen entsteht durch Glow-Sprites in der Szene, nicht durch einen Bloom-Pass.
// Alles deterministisch (kein zeitliches Rauschen außer dem vom Zeitstempel abhängigen Filmkorn).
// ============================================================
import * as THREE from '../../vendor/three.module.js';
import { EffectComposer } from '../../vendor/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../vendor/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../../vendor/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAPass } from '../../vendor/examples/jsm/postprocessing/FXAAPass.js';

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/** Gemeinsamer Teil: Tilt-Shift (variable Radien, getrennt in zwei Durchgängen); die vertikale Stufe hängt das Grading an */
const frag = (grade) => /* glsl */`
  uniform sampler2D tDiffuse; uniform vec2 texel, focus, dir; uniform float band, soft, maxR, aspect, tilt;
  uniform float exposure, contrast, sat, vig, vigR, grain, seed; uniform vec3 lift, gain; varying vec2 vUv;
  vec4 tap(vec2 uv){ vec4 c = texture2D(tDiffuse, uv); if (isnan(c.r) || isnan(c.g) || isnan(c.b)) return vec4(0.0, 0.0, 0.0, 1.0); c.rgb = min(c.rgb, vec3(24.0)); return c; }
  float coc(vec2 uv){
    vec2 d = uv - focus; d.x *= aspect;
    float c = cos(tilt), s = sin(tilt);
    float dist = abs(d.y * c - d.x * s);                    // Abstand zur (geneigten) Fokusachse
    float r = smoothstep(band, band + soft, dist);
    return r * r * (3.0 - 2.0 * r) * 0.35 + r * 0.65;
  }
  ${grade ? /* glsl */`
  vec3 neutral(vec3 color){                                   // Khronos PBR Neutral (wie three.js NeutralToneMapping)
    const float startCompression = 0.8 - 0.04, desaturation = 0.15;
    float x = min(color.r, min(color.g, color.b)); float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
    color -= offset; float peak = max(color.r, max(color.g, color.b));
    if (peak < startCompression) return color;
    float d = 1.0 - startCompression; float newPeak = 1.0 - d * d / (peak + d - startCompression);
    color *= newPeak / peak; float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return mix(color, vec3(newPeak), g);
  }
  vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21) + seed * 0.001); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  vec4 finish(vec4 col){
    vec3 c = col.rgb * exposure;
    c = c * gain + lift * (1.0 - c);
    c = neutral(c);
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, sat);
    c = toSRGB(clamp(c, 0.0, 1.0));
    c = (c - 0.5) * contrast + 0.5;
    vec2 d = (vUv - 0.5) * vec2(aspect, 1.0) * 1.1; float v = smoothstep(vigR * 0.5, vigR * 1.15, length(d)); c *= 1.0 - vig * v;
    float n = hash(vUv * vec2(1920.0, 1080.0) + seed) + hash(vUv * vec2(1920.0, 1080.0) * 1.7 + seed * 1.3) - 1.0;
    c += n * grain;
    return vec4(clamp(c, 0.0, 1.0), 1.0);
  }` : 'vec4 finish(vec4 c){ return c; }'}
  void main(){
    float r0 = coc(vUv) * maxR;
    if (r0 < 0.35) { gl_FragColor = finish(tap(vUv)); return; }
    vec4 sum = vec4(0.0); float wsum = 0.0;
    for (int i = -8; i <= 8; i++) {
      float f = float(i) / 8.0;
      vec2 uv = vUv + dir * texel * f * r0;
      float rr = coc(uv) * maxR;
      float w = exp(-f * f * 2.2) * smoothstep(0.0, 1.0, clamp(rr / max(abs(f) * r0, 1e-3) , 0.0, 1.0) * 0.6 + 0.4);
      sum += tap(uv) * w; wsum += w;
    }
    gl_FragColor = finish(sum / wsum);
  }`;

const uniforms = (dir) => ({ tDiffuse: { value: null }, texel: { value: new THREE.Vector2(1 / 1920, 1 / 1080) }, focus: { value: new THREE.Vector2(0.62, 0.5) }, band: { value: 0.18 }, soft: { value: 0.5 }, maxR: { value: 6 }, aspect: { value: 16 / 9 }, tilt: { value: 0 }, dir: { value: new THREE.Vector2(dir[0], dir[1]) },
  exposure: { value: 1.0 }, contrast: { value: 1.06 }, sat: { value: 1.05 }, vig: { value: 0.28 }, vigR: { value: 0.78 }, grain: { value: 0.012 }, seed: { value: 0 }, lift: { value: new THREE.Vector3(0.012, 0.016, 0.03) }, gain: { value: new THREE.Vector3(1.02, 1.0, 0.97) } });

export function createPost(renderer, scene, camera, W, H, pr, opt = {}) {
  const w = Math.round(W * pr), h = Math.round(H * pr);
  const samples = window.__SAMPLES ?? opt.samples ?? 4, useFxaa = window.__FXAA ?? opt.fxaa ?? false;
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples });
  const comp = new EffectComposer(renderer, rt); comp.setPixelRatio(1); comp.setSize(w, h);
  const rp = new RenderPass(scene, camera); comp.addPass(rp);
  const tsH = new ShaderPass({ uniforms: uniforms([1, 0]), vertexShader: VERT, fragmentShader: frag(false) });
  const tsV = new ShaderPass({ uniforms: uniforms([0, 1]), vertexShader: VERT, fragmentShader: frag(true) });
  comp.addPass(tsH); comp.addPass(tsV);
  if (useFxaa) { const fx = new FXAAPass(); comp.addPass(fx); fx.setSize(w, h); }
  for (const p of [tsH, tsV]) { p.uniforms.texel.value.set(1 / w, 1 / h); p.uniforms.aspect.value = W / H; }
  const api = {
    comp, tsH, tsV, rp, size: [w, h],
    /** focus: Bildschirmposition 0..1 (x,y; y nach oben), band: halbe Höhe des scharfen Bereichs, maxR: größter Unschärferadius in Pixeln (bezogen auf die Ausgabegröße) */
    set(o = {}) {
      for (const p of [tsH, tsV]) {
        const u = p.uniforms; if (o.focus) u.focus.value.set(o.focus[0], o.focus[1]);
        if (o.band != null) u.band.value = o.band; if (o.soft != null) u.soft.value = o.soft; if (o.maxR != null) u.maxR.value = o.maxR * pr; if (o.tilt != null) u.tilt.value = o.tilt;
      }
      const g = tsV.uniforms; for (const k of ['exposure', 'contrast', 'sat', 'vig', 'vigR', 'grain', 'seed']) if (o[k] != null) g[k].value = o[k];
    },
    render() { comp.render(); },
  };
  return api;
}
