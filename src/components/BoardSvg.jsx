import { memo, useMemo } from 'react';
import { SNAKES, LADDERS } from '../data/board.js';
import { cellCenter, snakeCenterline, taperedOutline, polyline, START_STRIP } from '../engine/BoardEngine.js';
import { COLORS } from '../theme.js';

const TILES = ['#fff3c4', '#cdeeff', '#ffd6e0', '#d3f5cc'];
const SLOT = [[-2.5, -2.4], [2.5, -2.4], [-2.5, 2.4], [2.5, 2.4]];

function Ladder({ from, to, active, ch }) {
  const a = cellCenter(from, ch);
  const b = cellCenter(to, ch);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy * 1.9;
  const ny = ux * 1.9;
  const rungs = [];
  for (let d = 3.5; d < len - 2; d += 4.6) {
    const cx = a.x + ux * d;
    const cy = a.y + uy * d;
    rungs.push(<line key={d} x1={cx + nx} y1={cy + ny} x2={cx - nx} y2={cy - ny} />);
  }
  const rails = (
    <>
      <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} />
      <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} />
    </>
  );
  return (
    <g className={active ? 'jump-active' : ''} strokeLinecap="round">
      <g stroke="rgba(0,0,0,.25)" strokeWidth="1.5" transform="translate(.5 .7)">{rails}</g>
      <g stroke="#7a4a1e" strokeWidth="1.3">{rails}</g>
      <g stroke="#d9a15b" strokeWidth=".75">{rails}</g>
      <g stroke="#7a4a1e" strokeWidth="1.1">{rungs}</g>
      <g stroke="#f0c27f" strokeWidth=".55">{rungs}</g>
    </g>
  );
}

function Snake({ from, to, color, active, ch }) {
  const { body, line, head, angle } = useMemo(() => {
    const pts = snakeCenterline(from, to, 56, ch);
    const p0 = pts[0];
    const p1 = pts[3];
    return {
      body: taperedOutline(pts),
      line: polyline(pts),
      head: p0,
      angle: (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI + 180
    };
  }, [from, to, ch]);
  return (
    <g className={`snake ${active ? 'jump-active' : ''}`} style={{ transformOrigin: `${head.x}px ${head.y}px` }}>
      <path d={body} fill="rgba(0,0,0,.25)" transform="translate(.5 .8)" />
      <path d={body} fill={color} stroke="rgba(0,0,0,.35)" strokeWidth=".35" strokeLinejoin="round" />
      <path d={line} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth=".9" strokeLinecap="round" strokeDasharray="1.1 1.7" />
      <path d={line} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth=".5" strokeLinecap="round" strokeDasharray=".4 3.2" />
      <g transform={`translate(${head.x} ${head.y}) rotate(${angle})`}>
        <path d="M2.2 0 L5 -.7 M2.2 0 L5 .7 M2.2 0 L4.2 0" stroke="#e53935" strokeWidth=".35" fill="none" strokeLinecap="round" className="tongue" />
        <ellipse cx="0" cy="0" rx="2.9" ry="2.3" fill={color} stroke="rgba(0,0,0,.4)" strokeWidth=".35" />
        <circle cx="-.2" cy="-1.1" r=".85" fill="#fff" />
        <circle cx="-.2" cy="1.1" r=".85" fill="#fff" />
        <circle cx="-.05" cy="-1.1" r=".42" fill="#111" />
        <circle cx="-.05" cy="1.1" r=".42" fill="#111" />
      </g>
    </g>
  );
}

function Token({ player, pos, hopKey, isCur, slot, shared, idx, ch }) {
  const isObj = typeof pos === 'object';
  const c = isObj ? pos : cellCenter(pos, ch);
  // Tokens waiting at START sit in a row inside the start strip; tokens sharing a cell sit side by side.
  const [ox, oy] = isObj ? [0, 0] : pos === 0 ? [idx * 7.5, 0] : shared ? SLOT[slot % 4] : [0, 0];
  const hex = COLORS[player.color].hex;
  return (
    <g style={{ transform: `translate(${c.x + ox}px, ${c.y + oy}px)`, transition: `transform ${isObj ? 0.09 : 0.24}s linear` }}>
      <ellipse cy="2.4" rx="2.7" ry="1" fill="rgba(0,0,0,.35)" />
      <g className={isObj ? 'token-slide' : 'hop'} key={hopKey}>
        {isCur && <circle r="4.1" fill="none" stroke="#fff" strokeWidth=".7" className="pulse" />}
        <circle r="3.1" fill={hex} stroke="#fff" strokeWidth=".7" />
        <circle r="3.1" fill="url(#shine)" />
        <text y="1.2" fontSize="3.4" textAnchor="middle">{player.avatar}</text>
      </g>
    </g>
  );
}

function BoardSvg({ players, shown, currentId, quizCells, activeJump, ch = 10 }) {
  const H = 10 * ch;

  const cells = useMemo(() => {
    const out = [];
    for (let n = 1; n <= 100; n++) {
      const { x, y, col, row } = cellCenter(n, ch);
      const top = y - ch / 2;
      out.push(
        <g key={n}>
          <rect x={x - 5} y={top} width="10" height={ch} fill={n === 100 ? 'url(#gold)' : TILES[(col + row * 3) % 4]} stroke="#fff" strokeWidth=".35" />
          <rect x={x - 5} y={top} width="10" height={ch} fill="url(#tileShade)" />
          <text x={x - 4.2} y={top + 2.6} fontSize="2.7" fill="#3b4d44" fontWeight="700" opacity=".85">{n}</text>
          {quizCells.includes(n) && (
            <g className="qbadge" style={{ transformOrigin: `${x + 2.6}px ${top + ch - 2.5}px` }}>
              <circle cx={x + 2.6} cy={top + ch - 2.5} r="2.1" fill="#2979ff" stroke="#fff" strokeWidth=".4" />
              <text x={x + 2.6} y={top + ch - 1.45} fontSize="3" fill="#fff" textAnchor="middle" fontWeight="800">?</text>
            </g>
          )}
          {n === 100 && <text x={x} y={y + 2} fontSize="5.6" textAnchor="middle">🏆</text>}
        </g>
      );
    }
    return out;
  }, [quizCells, ch]);

  const byCell = {};
  players.forEach((p) => {
    const c = shown[p.id] ?? p.position;
    if (typeof c === 'number') (byCell[c] = byCell[c] || []).push(p.id);
  });

  return (
    <svg viewBox={`-2 -2 104 ${H + START_STRIP + 4}`} className="board-svg" role="img" aria-label="Snake and ladder board">
      <defs>
        <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f8a63" /><stop offset="1" stopColor="#065a40" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2a8" /><stop offset="1" stopColor="#ffc93c" />
        </linearGradient>
        <linearGradient id="tileShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#000" stopOpacity=".06" />
        </linearGradient>
        <radialGradient id="shine" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" stopOpacity=".65" /><stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-2" y="-2" width="104" height={H + START_STRIP + 4} rx="4" fill="url(#frame)" />
      <rect x="-.4" y="-.4" width="100.8" height={H + 0.8} rx="1.2" fill="none" stroke="#f5d98a" strokeWidth=".6" />
      {cells}
      <text x="38" y={H + 4.9} fontSize="3.6" fill="#fff" fontWeight="800" letterSpacing=".4">START</text>
      <text x="97" y={H + 4.9} fontSize="3" fill="#bde8d4" textAnchor="end" fontWeight="700">AMRsense</text>
      {Object.entries(LADDERS).map(([f, l]) => <Ladder key={`l${f}`} from={+f} to={l.to} ch={ch} active={activeJump === +f} />)}
      {Object.entries(SNAKES).map(([f, s]) => <Snake key={`s${f}`} from={+f} to={s.to} ch={ch} color={s.color} active={activeJump === +f} />)}
      {players.map((p, idx) => {
        const pos = shown[p.id] ?? p.position;
        const grp = typeof pos === 'number' ? byCell[pos] : null;
        return (
          <Token
            key={p.id}
            player={p}
            pos={pos}
            ch={ch}
            hopKey={`${p.id}-${typeof pos === 'number' ? pos : 'slide'}`}
            isCur={p.id === currentId}
            shared={!!grp && grp.length > 1}
            slot={grp ? grp.indexOf(p.id) : 0}
            idx={idx}
          />
        );
      })}
    </svg>
  );
}

export default memo(BoardSvg);
