// TEMPORARY dev preview (deleted after visual check).
import { createRoot } from 'react-dom/client';
import '../src/styles.css';
import GameHome from '../src/screens/GameHome.jsx';
import GameMode from '../src/screens/GameMode.jsx';
import GameSettings from '../src/screens/GameSettings.jsx';
import GameBoard from '../src/screens/GameBoard.jsx';
import GameResults from '../src/screens/GameResults.jsx';
import { createGame, DEFAULT_SETTINGS, buildResults } from '../src/engine/GameEngine.js';
import { applyLevel } from '../src/data/levels.js';

const q = new URLSearchParams(location.search);
const s = q.get('s');
const n = Number(q.get('n') || 4);
const lvl = Number(q.get('l') || 2);
const people = [
  { name: 'Asha', avatar: '👧', color: 'pink' },
  { name: 'Ravi', avatar: '👨‍🌾', color: 'blue' },
  { name: 'Dr Meena', avatar: '👩‍⚕️', color: 'green' },
  { name: 'Tiger', avatar: '🐯', color: 'orange' }
];
const g = createGame({ mode: 'local', settings: applyLevel({ ...DEFAULT_SETTINGS, level: lvl }), players: people.slice(0, n) });
[34, 57, 12, 0].forEach((pos, i) => { if (g.players[i]) g.players[i].position = pos; });
const noop = () => {};
let el;
if (s === 'mode') el = <GameMode value="local" onSelect={noop} onBack={noop} onNext={noop} />;
else if (s === 'settings') el = <GameSettings settings={applyLevel({ ...DEFAULT_SETTINGS, level: 2 })} unlocked={2} hasBot={false} onChange={noop} onBack={noop} onStart={noop} />;
else if (s === 'board') el = <GameBoard initial={g} onGameOver={noop} onExit={noop} />;
else if (s === 'results') {
  g.status = 'completed'; g.finalRanking = g.players.map((p) => p.id); g.players.forEach((p, i) => { p.finalRank = i + 1; });
  el = <GameResults results={buildResults(g)} level={lvl} onReplay={noop} onNextLevel={noop} onHome={noop} />;
} else el = <GameHome saved={null} onPlay={noop} onResume={noop} onDiscard={noop} />;
createRoot(document.getElementById('root')).render(el);
