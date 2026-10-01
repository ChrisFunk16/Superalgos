// Linkado-Wortmarke als Vektor (aus den vom Auftraggeber gelieferten Logo-Abbildungen nachgezeichnet).
// Koordinaten = Pixelraster der 1080er-Vorlage; viewBox unten. Sobald das Original-SVG vorliegt:
// einfach die Pfade in LOGO.parts ersetzen (oder logo.svg einbinden) – Szenen greifen nur auf LOGO zu.
export const BRAND = {
  navy:   '#1F2532',
  orange: '#E67E22',
  cream:  '#FAF6EF',
  tagline: 'Der europäische digitale Arbeitsplatz',
};

export const LOGO = {
  viewBox: [141, 463, 799, 154],      // x, y, w, h  (Wortmarke inkl. A-Spitze und O-Überhang)
  capTop: 475, baseline: 612,
  // Teile in Zeichenreihenfolge (links → rechts). fill: 'navy' | 'orange' | 'grad'
  parts: [
    { id: 'L',      d: 'M141 475H166V590H236V612H141Z',                                         fill: 'navy' },
    { id: 'I',      d: 'M257 475H283V612H257Z',                                                 fill: 'orange' },
    { id: 'N',      d: 'M308 475H327L403 568V475H428V612H410L333 518V612H308Z',                 fill: 'navy' },
    { id: 'K',      d: 'M453 475H477V538L533 475H564L505 541L560 606L581 612H534L477 545V612H453Z', fill: 'navy' },
    { id: 'A-left', d: 'M623 465V518L581 612H557Z',                                             fill: 'navy' },
    { id: 'A-right',d: 'M623 465L684 612H661L623 518Z',                                         fill: 'grad' },
    { id: 'A-flag', d: 'M603 563H642V568L591 590Z',                                             fill: 'orange' },   // der „Link“-Steg
    { id: 'D',      d: 'M689 475H730.5A68.5 68.5 0 0 1 730.5 612H689ZM714 496V590H729A47 47 0 0 0 729 496Z', fill: 'orange', rule: 'evenodd' },
    { id: 'O',      d: 'M940 544A66 71 0 1 1 808 544A66 71 0 1 1 940 544ZM912 544.5A38.5 49.5 0 1 0 835 544.5A38.5 49.5 0 1 0 912 544.5Z', fill: 'navy', rule: 'evenodd' },
  ],
  // Verlauf im rechten A-Bein: Navy → Orange
  grad: { y1: 540, y2: 600 },
};

// App-Icon: oranges Quadrat mit navyfarbenem „L“
export const ICON = { viewBox: [0, 0, 400, 400], bg: 'M0 0H400V400H0Z', l: 'M139 100H176V270H277V300H139Z' };

/** Gibt die Wortmarke als SVG-String zurück. opts: {navy, orange, id} (id nötig, wenn mehrere Logos gleichzeitig im DOM sind) */
export function logoSVG(opts = {}) {
  const navy = opts.navy || BRAND.navy, orange = opts.orange || BRAND.orange, id = opts.id || 'lk';
  const col = { navy, orange, grad: `url(#${id}-g)` };
  const [x, y, w, h] = LOGO.viewBox;
  const paths = LOGO.parts.map(p => `<path data-part="${p.id}" d="${p.d}" fill="${col[p.fill]}"${p.rule ? ` fill-rule="${p.rule}"` : ''}/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">` +
    `<defs><linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="0" y1="${LOGO.grad.y1}" x2="0" y2="${LOGO.grad.y2}">` +
    `<stop offset="0" stop-color="${navy}"/><stop offset="1" stop-color="${orange}"/></linearGradient></defs>${paths}</svg>`;
}
export function iconSVG(opts = {}) {
  const navy = opts.navy || BRAND.navy, orange = opts.orange || BRAND.orange;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" rx="${opts.rx ?? 0}" fill="${orange}"/><path d="${ICON.l}" fill="${navy}"/></svg>`;
}
