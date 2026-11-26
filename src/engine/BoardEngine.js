// Board geometry. SVG units: the board is 100 wide, each cell is 10 wide and
// `ch` tall. ch grows on tall phone screens so the board fills the screen
// without stretching tokens or text. Row 0 is the bottom row.
// Position 0 (not yet on board) sits in a "START" strip under the board.
export const START_STRIP = 7;

export function cellCenter(n, ch = 10) {
  if (n <= 0) return { x: 6, y: 10 * ch + START_STRIP / 2, col: 0, row: -1 };
  const i = n - 1;
  const row = Math.floor(i / 10);
  let col = i % 10;
  if (row % 2 === 1) col = 9 - col; // zig-zag numbering
  return { x: col * 10 + 5, y: (9 - row) * ch + ch / 2, col, row };
}

// Wavy centre line of a snake. Head is at the `from` cell, tail at the `to` cell.
export function snakeCenterline(from, to, n = 48, ch = 10) {
  const a = cellCenter(from, ch);
  const b = cellCenter(to, ch);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const waves = Math.max(1.5, len / 22);
  const amp = 3.6;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t) ** 0.8;
    const off = amp * env * Math.sin(2 * Math.PI * waves * t);
    pts.push({ x: a.x + dx * t + nx * off, y: a.y + dy * t + ny * off });
  }
  return pts;
}

// Tapered polygon around a centre line (wide at the head, thin at the tail).
export function taperedOutline(pts, w0 = 2.1, w1 = 0.45) {
  const left = [];
  const right = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[Math.min(i + 1, pts.length - 1)];
    const r = pts[Math.max(i - 1, 0)];
    const tx = q.x - r.x;
    const ty = q.y - r.y;
    const l = Math.hypot(tx, ty) || 1;
    const w = w0 + (w1 - w0) * (i / (pts.length - 1)) ** 0.8;
    left.push(`${(p.x - (ty / l) * w).toFixed(2)} ${(p.y + (tx / l) * w).toFixed(2)}`);
    right.push(`${(p.x + (ty / l) * w).toFixed(2)} ${(p.y - (tx / l) * w).toFixed(2)}`);
  }
  return `M${left.join('L')}L${right.reverse().join('L')}Z`;
}

export const polyline = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('');

// Points a token follows when it slides down a snake.
export function snakeSlidePoints(from, to, ch = 10) {
  const pts = snakeCenterline(from, to, 48, ch);
  return pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1);
}

// Points a token follows when it climbs a ladder.
export function ladderClimbPoints(from, to, steps = 10, ch = 10) {
  const a = cellCenter(from, ch);
  const b = cellCenter(to, ch);
  return Array.from({ length: steps }, (_, i) => {
    const t = (i + 1) / steps;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  });
}

// Cell height that makes the board exactly fill a box of the given size.
export function fitCellHeight(width, height) {
  if (!width || !height) return 10;
  const v = ((104 * height) / width - START_STRIP - 4) / 10;
  return Math.round(Math.min(24, Math.max(10, v)) * 10) / 10;
}
