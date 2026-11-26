// Board geometry. SVG viewBox is 100 wide; cells are 10x10. Row 0 is the bottom row.
// Position 0 (not yet on board) sits in a "START" strip under the board.
export function cellCenter(n) {
  if (n <= 0) return { x: 6, y: 104 };
  const i = n - 1;
  const row = Math.floor(i / 10);
  let col = i % 10;
  if (row % 2 === 1) col = 9 - col; // snake-style zig-zag numbering
  return { x: col * 10 + 5, y: (9 - row) * 10 + 5, col, row };
}
