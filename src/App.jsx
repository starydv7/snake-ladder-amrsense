import { useCallback, useEffect, useState } from 'react';
import GameHome from './screens/GameHome.jsx';
import GameMode from './screens/GameMode.jsx';
import PlayerCount from './screens/PlayerCount.jsx';
import PlayerSetup from './screens/PlayerSetup.jsx';
import GameSettings from './screens/GameSettings.jsx';
import GameBoard from './screens/GameBoard.jsx';
import GameResults from './screens/GameResults.jsx';
import { createGame, buildResults, DEFAULT_SETTINGS } from './engine/GameEngine.js';
import { loadGame, saveGame, clearGame, loadPrefs, savePrefs, addResult, loadSeen } from './services/GameStorage.js';
import { setSoundEnabled } from './services/sound.js';
import { BOT_AVATAR, COLOR_KEYS, defaultHumans, defaultName } from './theme.js';

function buildPlayers(humans, count) {
  const list = humans.slice(0, count).map((h, i) => ({
    name: h.name.trim() || defaultName(i),
    avatar: h.avatar,
    color: h.color
  }));
  // Duplicate names get a number so players are never confused.
  const seen = {};
  list.forEach((p) => {
    const k = p.name.toLowerCase();
    seen[k] = (seen[k] || 0) + 1;
    if (seen[k] > 1) p.name = `${p.name.slice(0, 12)} (${seen[k]})`;
  });
  if (count === 1) {
    const color = COLOR_KEYS.find((c) => !list.some((p) => p.color === c));
    list.push({ name: 'Computer', avatar: BOT_AVATAR, color, isBot: true });
  }
  return list;
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [mode, setMode] = useState('single');
  const [count, setCount] = useState(1);
  const [humans, setHumans] = useState(defaultHumans());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [game, setGame] = useState(null);
  const [saved, setSaved] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const [g, prefs] = await Promise.all([loadGame(), loadPrefs()]);
      if (prefs) {
        if (prefs.humans) setHumans(prefs.humans);
        if (prefs.settings) setSettings({ ...DEFAULT_SETTINGS, ...prefs.settings });
      }
      if (g && g.status === 'in_progress') setSaved(g);
      setScreen('home');
    })();
  }, []);

  useEffect(() => { setSoundEnabled(settings.sound); }, [settings.sound]);

  const selectMode = (m) => {
    setMode(m);
    if (m === 'single') setCount(1);
    else if (m === 'local') setCount((c) => (c < 2 ? 2 : c));
    setSettings((s) => ({ ...s, questionFrequency: m === 'challenge' ? 'learning' : s.questionFrequency === 'learning' && mode === 'challenge' ? 'standard' : s.questionFrequency }));
  };

  const afterMode = () => (mode === 'single' ? setScreen('setup') : setScreen('count'));

  const startGame = useCallback(async () => {
    const seen = await loadSeen();
    const g = createGame({ mode, settings, players: buildPlayers(humans, count), seen });
    await saveGame(g);
    savePrefs({ humans, settings });
    setSaved(null);
    setGame(g);
    setScreen('board');
  }, [mode, settings, humans, count]);

  const finishGame = useCallback(async (g) => {
    const r = buildResults(g);
    setResults(r);
    setGame(g);
    await clearGame();
    await addResult({ gameId: g.id, mode: g.mode, date: Date.now(), settings: g.settings, ranking: r });
    setScreen('results');
  }, []);

  const exitToHome = () => {
    // Game state is already saved on every move; reload it for the Resume button.
    loadGame().then((g) => setSaved(g && g.status === 'in_progress' ? g : null));
    setScreen('home');
  };

  const resume = () => { setGame(saved); setScreen('board'); };
  const discard = async () => { await clearGame(); setSaved(null); };

  const replay = async () => {
    const players = game.players.map((p) => ({ name: p.name, avatar: p.avatar, color: p.color, isBot: p.isBot }));
    const seen = await loadSeen();
    const g = createGame({ mode: game.mode, settings: game.settings, players, seen });
    saveGame(g);
    setGame(g);
    setScreen('board');
  };

  switch (screen) {
    case 'loading':
      return <div className="screen center">Loading…</div>;
    case 'home':
      return <GameHome saved={saved} onPlay={() => setScreen('mode')} onResume={resume} onDiscard={discard} />;
    case 'mode':
      return <GameMode value={mode} onSelect={selectMode} onBack={() => setScreen('home')} onNext={afterMode} />;
    case 'count':
      return (
        <PlayerCount mode={mode} count={count} onSelect={setCount} onBack={() => setScreen('mode')} onNext={() => setScreen('setup')} />
      );
    case 'setup':
      return (
        <PlayerSetup
          humans={humans}
          count={count}
          onChange={setHumans}
          onBack={() => setScreen(mode === 'single' ? 'mode' : 'count')}
          onNext={() => setScreen('settings')}
        />
      );
    case 'settings':
      return (
        <GameSettings settings={settings} hasBot={count === 1} onChange={setSettings} onBack={() => setScreen('setup')} onStart={startGame} />
      );
    case 'board':
      return <GameBoard key={game.id} initial={game} onGameOver={finishGame} onExit={exitToHome} />;
    case 'results':
      return <GameResults results={results} onReplay={replay} onHome={() => { setSaved(null); setScreen('home'); }} />;
    default:
      return null;
  }
}
