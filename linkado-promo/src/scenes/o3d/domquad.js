// ============================================================
// DOM auf einer 3D-Fläche: ein HTML-Element wird per CSS matrix3d so verzerrt, dass seine Ecken genau auf vier projizierten 3D-Punkten liegen
// (Homographie, Heckbert). Damit sitzt die Oberfläche (Fenster, Browser-Leiste, Handy) pixelgenau auf dem 3D-Bildschirm – und beim Zoom stimmt die Landung exakt.
// ============================================================
/** Homographie, die die vier Punkte s[i] auf d[i] abbildet; Rückgabe [a,b,c,d,e,f,g,h] (i = 1) */
export function homography(s, d) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = s[i], [u, v] = d[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    const dv = A[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++) { const f = A[r][c] / dv; if (!f) continue; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let sum = b[r]; for (let k = r + 1; k < n; k++) sum -= A[r][k] * x[k]; x[r] = sum / (A[r][r] || 1e-12); }
  return x;
}
export function cssMatrix(h) {
  const [a, b, c, d, e, f, g, hh] = h, n = (v) => (Math.abs(v) < 1e-12 ? '0' : v.toPrecision(10));
  return `matrix3d(${n(a)},${n(d)},0,${n(g)},${n(b)},${n(e)},0,${n(hh)},0,0,1,0,${n(c)},${n(f)},0,1)`;
}
/** Quelle (Rechteck x0,y0,w,h im Element-Raum) → Ziel (4 Punkte: oben links, oben rechts, unten rechts, unten links) */
export function matrixFor(x0, y0, w, h, dst) { return cssMatrix(homography([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], dst)); }
