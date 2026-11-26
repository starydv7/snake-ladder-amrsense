import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BoardSvg from '../components/BoardSvg.jsx';
import { Dice, Sheet } from '../components/Layout.jsx';
import { QuizScreen, SnakeAlert, LadderReward, FinishModal } from './EventScreens.jsx';
import { roll, ackEvent, answerQuiz, botChoice, quizCellsFor } from '../engine/GameEngine.js';
import { QUESTION_LIMITS } from '../services/QuestionService.js';
import { saveGame } from '../services/GameStorage.js';
import { sfx, setSoundEnabled } from '../services/sound.js';
import { COLORS } from '../theme.js';

export default function GameBoard({ initial, onGameOver, onExit }) {
  const [g, setG] = useState(initial);
  const gRef = useRef(initial);
  const [shown, setShown] = useState(() => Object.fromEntries(initial.players.map((p) => [p.id, p.position])));
  const [diceVal, setDiceVal] = useState(initial.lastMove?.dice || 1);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [eventVisible, setEventVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(initial.settings.sound);
  const [toast, setToast] = useState('');

  const pausedRef = useRef(false);
  const aliveRef = useRef(true);
  const busyRef = useRef(false);
  const rollingRef = useRef(false);
  const overRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { setSoundEnabled(soundOn); }, [soundOn]);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  // Auto-pause when the app goes to the background (incoming call, home button).
  useEffect(() => {
    const onVis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onVis);
    };
  }, []);

  // Dice face flicker while rolling (visual only).
  useEffect(() => {
    if (!rolling) return undefined;
    const t = setInterval(() => {
      if (rollingRef.current) setDiceVal(1 + Math.floor(Math.random() * 6));
    }, 90);
    return () => clearInterval(t);
  }, [rolling]);

  const commit = useCallback((next) => {
    gRef.current = next;
    setG(next);
    saveGame(next);
  }, []);

  const wait = useCallback(async (ms) => {
    await new Promise((r) => setTimeout(r, ms));
    while (pausedRef.current && aliveRef.current) await new Promise((r) => setTimeout(r, 150));
  }, []);

  const doRoll = useCallback(async () => {
    const cur = gRef.current;
    if (busyRef.current || pausedRef.current || cur.phase !== 'AWAIT_ROLL' || cur.status !== 'in_progress') return;
    busyRef.current = true;
    const next = roll(cur); // result is committed immediately; animation below only displays it
    if (next === cur) { busyRef.current = false; return; }
    commit(next);
    const m = next.lastMove;
    setEventVisible(false);
    rollingRef.current = true;
    setRolling(true);
    sfx.dice();
    await wait(700);
    if (!aliveRef.current) return;
    rollingRef.current = false;
    setDiceVal(m.dice);
    setRolling(false);
    setMoving(true);
    if (m.blocked) setToast(`Need an exact roll to reach 100`);
    await wait(300);
    for (const c of m.path) {
      if (!aliveRef.current) return;
      setShown((s) => ({ ...s, [m.playerId]: c }));
      sfx.step();
      await wait(240);
    }
    if (m.jump) {
      await wait(350);
      if (!aliveRef.current) return;
      m.jump === 'ladder' ? sfx.ladder() : sfx.snake();
      setShown((s) => ({ ...s, [m.playerId]: m.to }));
      await wait(700);
    }
    if (!aliveRef.current) return;
    setShown((s) => ({ ...s, [m.playerId]: m.to }));
    setMoving(false);
    setEventVisible(true);
    busyRef.current = false;
    if (m.blocked) setTimeout(() => setToast(''), 1600);
  }, [commit, wait]);

  const ack = useCallback(() => {
    const n = ackEvent(gRef.current);
    if (n === gRef.current) return;
    commit(n);
    setEventVisible(true);
  }, [commit]);

  const answer = useCallback((i) => {
    const n = answerQuiz(gRef.current, i);
    if (n === gRef.current) return;
    commit(n);
    n.pending.answered.correct ? sfx.correct() : sfx.wrong();
  }, [commit]);

  // Computer player automation.
  useEffect(() => {
    if (paused || moving || rolling || g.status !== 'in_progress') return undefined;
    const cur = g.players[g.turn];
    if (!cur.isBot) return undefined;
    let t;
    if (g.phase === 'AWAIT_ROLL') t = setTimeout(doRoll, 1000);
    else if (g.phase === 'AWAIT_ACK' && eventVisible) {
      if (g.pending.kind === 'quiz' && !g.pending.answered) t = setTimeout(() => answer(botChoice(gRef.current)), 2200);
      else t = setTimeout(ack, 2200);
    }
    return () => clearTimeout(t);
  }, [g, paused, moving, rolling, eventVisible, doRoll, ack, answer]);

  // Event sounds.
  useEffect(() => {
    if (!eventVisible || moving || rolling || !g.pending) return;
    if (g.pending.kind === 'finish') sfx.win();
  }, [g.pending, eventVisible, moving, rolling]);

  // Game finished -> hand over to results (once).
  useEffect(() => {
    if (g.status === 'completed' && !moving && !rolling && !g.pending && !overRef.current) {
      overRef.current = true;
      onGameOver(g);
    }
  }, [g, moving, rolling, onGameOver]);

  const quizCells = useMemo(() => quizCellsFor(g.settings), [g.settings]);
  const busy = moving || rolling;
  const turnPlayer = busy && g.lastMove ? g.players.find((p) => p.id === g.lastMove.playerId) : g.players[g.turn];
  const cur = g.players[g.turn];
  const humanTurn = !cur.isBot;
  const canRoll = !busy && !paused && g.phase === 'AWAIT_ROLL' && humanTurn && g.status === 'in_progress';
  const showEvent = g.phase === 'AWAIT_ACK' && eventVisible && !busy && g.pending;
  const limit = QUESTION_LIMITS[g.settings.questionFrequency];

  let status = `${turnPlayer.name}'s turn`;
  if (busy) status = `${turnPlayer.name} rolled ${g.lastMove.dice}`;
  else if (turnPlayer.isBot) status = 'Computer is playing…';

  return (
    <div className="screen board-screen">
      <header className="board-top">
        <button className="icon-btn" onClick={() => setPaused(true)} aria-label="Pause">⏸</button>
        <div className="turn-banner" style={{ borderColor: COLORS[turnPlayer.color].hex }}>
          <span className="turn-avatar" style={{ background: COLORS[turnPlayer.color].hex }}>{turnPlayer.avatar}</span>
          <strong>{status}</strong>
        </div>
        <button className="icon-btn" onClick={() => setSoundOn((v) => !v)} aria-label="Sound">{soundOn ? '🔊' : '🔇'}</button>
      </header>

      <div className="board-wrap">
        <BoardSvg players={g.players} shown={shown} currentId={turnPlayer.id} quizCells={quizCells} />
        {toast && <div className="toast">{toast}</div>}
      </div>

      <div className="players-strip">
        {g.players.map((p) => (
          <div key={p.id} className={`pcard ${p.id === turnPlayer.id ? 'cur' : ''} ${p.status === 'finished' ? 'done' : ''}`} style={{ '--c': COLORS[p.color].hex }}>
            <span className="pavatar">{p.avatar}</span>
            <strong>{p.name}</strong>
            <small>{p.status === 'finished' ? `🏁 #${p.rank}` : `Sq ${shown[p.id] ?? p.position}`} · {p.points} pts</small>
          </div>
        ))}
      </div>

      <footer className="roll-bar">
        <Dice value={diceVal} rolling={rolling} />
        <button className="btn primary roll-btn" disabled={!canRoll} onClick={doRoll}>
          {canRoll ? 'Roll the dice' : busy ? 'Moving…' : humanTurn ? 'Please wait…' : 'Computer’s turn'}
        </button>
        <span className="qcount" title="AMR questions asked">❓ {g.asked}/{limit}</span>
      </footer>

      {showEvent && g.pending.kind === 'quiz' && (
        <QuizScreen game={g} player={cur} canAnswer={humanTurn} onAnswer={answer} onContinue={ack} />
      )}
      {showEvent && g.pending.kind === 'snake' && (
        <SnakeAlert pend={g.pending} player={cur} canContinue={humanTurn} onContinue={ack} />
      )}
      {showEvent && g.pending.kind === 'ladder' && (
        <LadderReward pend={g.pending} player={cur} canContinue={humanTurn} onContinue={ack} />
      )}
      {showEvent && g.pending.kind === 'finish' && (
        <FinishModal pend={g.pending} player={cur} canContinue={humanTurn} onContinue={ack} />
      )}

      {paused && (
        <Sheet>
          <h2>Game paused</h2>
          <p>Your game is saved automatically.</p>
          <button className="btn primary big" onClick={() => setPaused(false)}>Resume</button>
          <button className="btn ghost-btn big" onClick={() => setSoundOn((v) => !v)}>{soundOn ? '🔊 Sound on' : '🔇 Sound off'}</button>
          <button className="btn ghost-btn big" onClick={onExit}>Save &amp; exit</button>
        </Sheet>
      )}
    </div>
  );
}
