// Erzeugt src/icons.js aus lucide-static (ISC-Lizenz). Aufruf: node tools/make-icons.mjs
import fs from 'node:fs'; import path from 'node:path';
const dir = new URL('../node_modules/lucide-static/icons/', import.meta.url).pathname;
const want = `folder folder-open file file-text file-spreadsheet presentation image calendar calendar-days calendar-check message-circle message-square messages-square mail users user contact search bell check circle-check x plus settings circle-help life-buoy headphones puzzle palette layers clock download upload share-2 link link-2 lock globe euro star trash-2 pencil layout-dashboard list-checks kanban sparkles shield-check server cloud refresh-cw wrench mouse-pointer-2 arrow-up-right arrow-right arrow-down chevron-down chevron-right ellipsis filter eye flag tag history circle-alert triangle-alert info video phone paperclip send smile building-2 chart-bar calculator notebook-pen clipboard-list book-open lightbulb rocket zap heart handshake blocks box package store shopping-bag layout-grid house menu toggle-right sliders-horizontal badge-check circle-user at-sign timer hourglass coffee target workflow network plug key-round fingerprint graduation-cap file-question list-todo square-check bot wand-sparkles hand-helping message-circle-question mouse-pointer-click pointer app-window columns-3 table-2 map-pin copy clipboard grip-vertical x-circle log-in user-plus shield-alert cloud-off bug unplug alert-octagon octagon-alert user-round laptop monitor smartphone inbox archive database hard-drive cloud-cog banknote coins receipt badge-euro shirt layout-template panels-top-left hammer arrow-left-right repeat scissors ruler maximize circle-x square-dashed cloud-upload globe-lock link-2-off timer-reset mouse-pointer-2 mouse-pointer-click`.split(/\s+/);
const out = {}; const missing = [];
for (const n of want) {
  const f = path.join(dir, n + '.svg');
  if (!fs.existsSync(f)) { missing.push(n); continue; }
  const s = fs.readFileSync(f, 'utf8');
  out[n] = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s+/g, ' ').trim();
}
fs.writeFileSync(new URL('../src/icons.js', import.meta.url),
`// Automatisch erzeugt (tools/make-icons.mjs) aus lucide-static, ISC-Lizenz. Nicht von Hand ändern.
const PATHS = ${JSON.stringify(out)};
export const hasIcon = n => n in PATHS;
export function icon(name, size = 24, color = 'currentColor', sw = 2) {
  const p = PATHS[name]; if (!p) throw new Error('Icon fehlt: ' + name);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
}
`);
console.log('icons:', Object.keys(out).length, 'missing:', missing.join(' ') || '-');
