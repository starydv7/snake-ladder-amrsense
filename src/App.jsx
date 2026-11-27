import { useCallback, useEffect, useState } from 'react';
import GameHome from './screens/GameHome.jsx';
import GameMode from './screens/GameMode.jsx';
import PlayerCount from './screens/PlayerCount.jsx';
import PlayerSetup from './screens/PlayerSetup.jsx';
import GameSettings from './screens/GameSettings.jsx';
import GameBoard from './screens/GameBoard.jsx';
import GameResults from './screens/GameResults.jsx';
import { createGame, buildResults, DEFAULT_SETTINGS } from './engine/GameEngine.js';
import { loadGame, saveGame, clearGame, addResult, loadSeen, loadProgress, saveProgress } from './services/GameStorage.js';
import { setSoundEnabled } from './services/sound.js';
import { emptyPlayers, defaultName } from './theme.js';
import { applyLevel, MAX_LEVEL } from './data/levels.js';

// Builds the player list exactly from what the user chose. Nothing is assigned automatically
// except a default name ("Player 1") when the name box is left empty.
function buildPlayers(players, count, bot) {
  const list = players.slice(0, count).map((p, i) => ({
    name: p.name.trim() || defaultName(i),
    avatar: p.avatar,
    color: p.color
  }));
  const seen = {};
  list.forEach((p) => {
    const k = p.name.toLowerCase();
    seen[k] = (seen[k] || 0) + 1;
    if (seen[k] > 1) p.name = `${p.name.slice(0, 12)} (${seen[k]})`;
  });
  if (count === 1) list.push({ name: 'Computer', avatar: bot.avatar, color: bot.color, isBot: true });
  return list;
}

const emptyBot = () => ({ avatar: null, color: null });

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [mode, setMode] = useState(null);
  const [count, setCount] = useState(null);
  const [players, setPlayers] = useState(emptyPlayers);
  const [bot, setBot] = useState(emptyBot);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [game, setGame] = useState(null);
  const [saved, setSaved] = useState(null);
  const [results, setResults] = useState([]);
  const [unlocked, setUnlocked] = useState(1);

  useEffect(() => {
    Promise.all([loadGame(), loadProgress()]).then(([g, maxLevel]) => {
      if (g && g.status === 'in_progress') setSaved(g);
      setUnlocked(maxLevel);
      setScreen('home');
    });
  }, []);

  useEffect(() => { setSoundEnabled(settings.sound); }, [settings.sound]);

  // Every new game starts with nothing chosen.
  const startSetup = () => {
    setMode(null);
    setCount(null);
    setPlayers(emptyPlayers());
    setBot(emptyBot());
    setSettings({ ...DEFAULT_SETTINGS, level: unlocked });
    setScreen('mode');
  };

  const selectMode = (m) => {
    if (m === mode) return;
    setMode(m);
    setCount(m === 'single' ? 1 : null); // "Play vs Computer" means one player + computer
    setSettings((s) => ({ ...s, questionFrequency: m === 'challenge' ? 'learning' : DEFAULT_SETTINGS.questionFrequency }));
  };

  const afterMode = () => setScreen(mode === 'single' ? 'setup' : 'count');

  const startGame = useCallback(async () => {
    const seen = await loadSeen();
    const g = createGame({ mode, settings: applyLevel(settings), players: buildPlayers(players, count, bot), seen });
    await saveGame(g);
    setSaved(null);
    setGame(g);
    setScreen('board');
  }, [mode, settings, players, count, bot]);

  const finishGame = useCallback(async (g) => {
    const r = buildResults(g);
    setResults(r);
    setGame(g);
    await clearGame();
    // Finishing a level unlocks the next one.
    const nextLevel = Math.min(MAX_LEVEL, (g.settings.level || 1) + 1);
    setUnlocked((u) => {
      const v = Math.max(u, nextLevel);
      saveProgress(v);
      return v;
    });
    await addResult({ gameId: g.id, mode: g.mode, date: Date.now(), settings: g.settings, ranking: r });
    setScreen('results');
  }, []);

  const exitToHome = () => {
    loadGame().then((g) => setSaved(g && g.status === 'in_progress' ? g : null));
    setScreen('home');
  };

  const resume = () => { setGame(saved); setScreen('board'); };
  const discard = async () => { await clearGame(); setSaved(null); };

  // Replay or next level keeps the same players the user created.
  const playLevel = async (level) => {
    const same = game.players.map((p) => ({ name: p.name, avatar: p.avatar, color: p.color, isBot: p.isBot }));
    const seen = await loadSeen();
    const g = createGame({ mode: game.mode, settings: applyLevel({ ...game.settings, level }), players: same, seen });
    saveGame(g);
    setGame(g);
    setScreen('board');
  };
  const replay = () => playLevel(game.settings.level || 1);
  const nextLevel = () => playLevel(Math.min(MAX_LEVEL, (game.settings.level || 1) + 1));

  switch (screen) {
    case 'loading':
      return <div className="screen center">Loading…</div>;
    case 'home':
      return <GameHome saved={saved} onPlay={startSetup} onResume={resume} onDiscard={discard} />;
    case 'mode':
      return <GameMode value={mode} onSelect={selectMode} onBack={() => setScreen('home')} onNext={afterMode} />;
    case 'count':
      return <PlayerCount mode={mode} count={count} onSelect={setCount} onBack={() => setScreen('mode')} onNext={() => setScreen('setup')} />;
    case 'setup':
      return (
        <PlayerSetup
          players={players}
          count={count}
          bot={bot}
          onChange={setPlayers}
          onBotChange={setBot}
          onBack={() => setScreen(mode === 'single' ? 'mode' : 'count')}
          onNext={() => setScreen('settings')}
        />
      );
    case 'settings':
      return <GameSettings settings={settings} unlocked={unlocked} hasBot={count === 1} onChange={setSettings} onBack={() => setScreen('setup')} onStart={startGame} />;
    case 'board':
      return <GameBoard key={game.id} initial={game} onGameOver={finishGame} onExit={exitToHome} />;
    case 'results':
      return (
        <GameResults
          results={results}
          level={game.settings.level || 1}
          onReplay={replay}
          onNextLevel={nextLevel}
          onHome={() => { setSaved(null); setScreen('home'); }}
        />
      );
    default:
      return null;
  }
}
