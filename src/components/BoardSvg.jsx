import { memo } from 'react';
import { SNAKES, LADDERS } from '../data/board.js';
import { cellCenter } from '../engine/BoardEngine.js';
import { COLORS } from '../theme.js';

const SNAKE_COLORS = ['#2e7d32', '#6a1b9a', '#c62828', '#ef6c00', '#00838f', '#ad1457', '#4e342e', '#283593', '#558b2f', '#37474f'];

function Ladder({ from, to }) {
  const a = cellCenter(from);
  const b = cellCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy * 1.7;
  const ny = ux * 1.7;
  const rungs = [];
  for (let d = 3; d < len - 1; d += 4.2) {
    const cx = a.x + ux * d;
    const cy = a.y + uy * d;
    rungs.push(<line key={d} x1={cx + nx} y1={cy + ny} x2={cx - nx} y2={cy - ny} />);
  }
  return (
    <g stroke="#8d5a2b" strokeWidth="0.7" strokeLinecap="round" opacity="0.95">
      <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} />
      <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} />
      <g strokeWidth="0.6" stroke="#b9803f">{rungs}</g>
    </g>
  );
}

function Snake({ from, to, color, flip }) {
  const a = cellCenter(from); // head
  const b = cellCenter(to); // tail
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 7 * (flip ? -1 : 1);
  const ny = (dx / len) * 7 * (flip ? -1 : 1);
  const c1 = { x: a.x + dx * 0.33 + nx, y: a.y + dy * 0.33 + ny };
  const c2 = { x: a.x + dx * 0.66 - nx, y: a.y + dy * 0.66 - ny };
  const d = `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
  return (
    <g opacity="0.92" strokeLinecap="round" fill="none">
      <path d={d} stroke={color} strokeWidth="2.6" />
      <path d={d} stroke="#fff" strokeWidth="0.7" strokeDasharray="1.2 2.2" opacity="0.7" />
      <circle cx={a.x} cy={a.y} r="2.3" fill={color} />
      <circle cx={a.x - 0.8} cy={a.y - 0.7} r="0.55" fill="#fff" />
      <circle cx={a.x + 0.8} cy={a.y - 0.7} r="0.55" fill="#fff" />
      <circle cx={b.x} cy={b.y} r="0.9" fill={color} />
    </g>
  );
}

const OFFSETS = [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]];

function BoardSvg({ players, shown, currentId, quizCells }) {
  const cells = [];
  for (let n = 1; n <= 100; n++) {
    const { x, y, col, row } = cellCenter(n);
    const dark = (col + row) % 2 === 0;
    cells.push(
      <g key={n}>
        <rect
          x={x - 5} y={y - 5} width="10" height="10"
          fill={n === 100 ? '#ffe082' : dark ? '#e8f5e9' : '#c8e6c9'}
          stroke="#a5d6a7" strokeWidth="0.2"
        />
        <text x={x - 4.3} y={y - 2.8} fontSize="2.6" fill="#4a6b55" fontWeight="600">{n}</text>
        {quizCells.includes(n) && (
          <g>
            <circle cx={x + 2.6} cy={y + 2.6} r="1.9" fill="#1e88e5" />
            <text x={x + 2.6} y={y + 3.55} fontSize="2.6" fill="#fff" textAnchor="middle" fontWeight="700">?</text>
          </g>
        )}
        {n === 100 && <text x={x} y={y + 3} fontSize="5" textAnchor="middle">🏆</text>}
      </g>
    );
  }

  // Group tokens by shown cell so shared cells show side-by-side.
  const byCell = {};
  players.forEach((p) => {
    const c = shown[p.id] ?? p.position;
    (byCell[c] = byCell[c] || []).push(p.id);
  });

  return (
    <svg viewBox="0 0 100 108" className="board-svg" role="img" aria-label="Snake and ladder board">
      <rect x="0" y="0" width="100" height="108" rx="2" fill="#0b6e4f" />
      {cells}
      <rect x="0" y="100" width="100" height="8" fill="#0b6e4f" />
      <text x="16" y="105.2" fontSize="3.6" fill="#fff" fontWeight="700">START</text>
      {Object.entries(LADDERS).map(([f, l]) => <Ladder key={`l${f}`} from={+f} to={l.to} />)}
      {Object.entries(SNAKES).map(([f, s], i) => (
        <Snake key={`s${f}`} from={+f} to={s.to} color={SNAKE_COLORS[i % SNAKE_COLORS.length]} flip={i % 2 === 0} />
      ))}
      {players.map((p, idx) => {
        const cell = shown[p.id] ?? p.position;
        const { x, y } = cellCenter(cell);
        const shared = byCell[cell].length > 1;
        const slot = byCell[cell].indexOf(p.id);
        const [ox, oy] = shared ? OFFSETS[slot % 4] : cell === 0 ? [idx * 6.5, 0] : [0, 0];
        const isCur = p.id === currentId;
        return (
          <g
            key={p.id}
            style={{ transform: `translate(${x + ox}px, ${y + oy}px)`, transition: 'transform 0.26s ease-out' }}
          >
            {isCur && <circle r="3.8" fill="none" stroke="#fff" strokeWidth="0.6" className="pulse" />}
            <circle r="2.7" fill={COLORS[p.color].hex} stroke="#fff" strokeWidth="0.6" />
            <text y="1.1" fontSize="3.1" textAnchor="middle">{p.avatar}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default memo(BoardSvg);
