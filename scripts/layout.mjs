// Searches for a snake/ladder layout with no crossing and good spacing.
function center(n) {
  const i = n - 1, row = Math.floor(i / 10);
  let col = i % 10; if (row % 2 === 1) col = 9 - col;
  return { x: col * 10 + 5, y: (9 - row) * 10 + 5, row };
}
const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
const cross = (a, b, c, d) => ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
function segDist(p, q, r, s) { // min of endpoint-to-segment distances (good enough)
  const d = (pt, a, b) => { const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2 || 1; let t = ((pt.x - a.x) * (b.x - a.x) + (pt.y - a.y) * (b.y - a.y)) / l2; t = Math.max(0, Math.min(1, t)); return Math.hypot(pt.x - (a.x + t * (b.x - a.x)), pt.y - (a.y + t * (b.y - a.y))); };
  return Math.min(d(p, r, s), d(q, r, s), d(r, p, q), d(s, p, q));
}
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));

let best = null, bestScore = -1;
for (let it = 0; it < 400000; it++) {
  const used = new Set(); const items = [];
  const NL = 8, NS = 8; let ok = true;
  for (let k = 0; k < NL + NS && ok; k++) {
    const ladder = k < NL;
    let tries = 0, placed = false;
    while (tries++ < 40 && !placed) {
      let a, b;
      if (ladder) { a = ri(2, 78); b = a + ri(18, 38); if (b > 99) continue; }
      else { b = ri(3, 72); a = b + ri(18, 40); if (a > 99 || a < 20) continue; }
      if (used.has(a) || used.has(b)) continue;
      const A = center(a), B = center(b);
      if (Math.abs(A.row - B.row) < 2) continue;
      let good = true;
      for (const o of items) {
        const P = center(o.a), Q = center(o.b);
        if (cross(A, B, P, Q) || segDist(A, B, P, Q) < 9) { good = false; break; }
      }
      if (!good) continue;
      items.push({ ladder, a, b }); used.add(a); used.add(b); placed = true;
    }
    if (!placed) ok = false;
  }
  if (!ok) continue;
  // prefer spread: variety of rows for starts
  const rows = new Set(items.map((i) => center(i.a).row)).size;
  const score = rows + rnd() * 0.5;
  if (score > bestScore) { bestScore = score; best = items; }
  if (it > 50000 && best) break;
}
console.log(JSON.stringify({ ladders: best.filter((i) => i.ladder).map((i) => [i.a, i.b]).sort((x, y) => x[0] - y[0]), snakes: best.filter((i) => !i.ladder).map((i) => [i.a, i.b]).sort((x, y) => x[0] - y[0]) }));
