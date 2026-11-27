import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BoardSvg from '../components/BoardSvg.jsx';
import { Dice, Sheet } from '../components/Layout.jsx';
import { QuizScreen, SnakeAlert, LadderReward, FinishModal } from './EventScreens.jsx';
import { roll, ackEvent, answerQuiz, botChoice, quizCellsFor, skipTurn } from '../engine/GameEngine.js';
import { snakeSlidePoints, ladderClimbPoints, fitCellHeight } from '../engine/BoardEngine.js';
import { QUESTION_LIMITS } from '../services/QuestionService.js';
import { saveGame, saveSeen } from '../services/GameStorage.js';
import { sfx, setSoundEnabled } from '../services/sound.js';
import { levelInfo } from '../data/levels.js';
import { COLORS } from '../theme.js';

// Each player has this many seconds to tap the dice. If time runs out the
// turn is lost: the token stays where it is and the next player goes.
export const TURN_SECONDS = 15;

function PlayerChip({ p, pos, isCur, timer, side }) {
  return (
    <div className={`pchip ${side} ${isCur ? 'cur' : ''} ${p.status === 'finished' ? 'done' : ''}`} style={{ '--c': COLORS[p.color].hex }}>
      <span className="pchip-av">
        {p.avatar}
        {timer && (
          <svg className={`ring ${timer.warn ? 'warn' : ''}`} viewBox="0 0 40 40" aria-hidden="true">
            <circle className="bg" cx="20" cy="20" r="18" pathLength="100" />
            <circle className="fg" cx="20" cy="20" r="18" pathLength="100" strokeDasharray={`${(timer.left / TURN_SECONDS) * 100} 100`} />
          </svg>
        )}
      </span>
      <span className="pchip-text">
        <strong>{p.name}</strong>
        <small>{p.status === 'finished' ? `🏁 #${p.rank}` : `Sq ${pos}`} · {p.points}pts</small>
      </span>
    </div>
  );
}

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
  const [toast, setToast] = useState(null);
  const [pop, setPop] = useState(null);
  const [fx, setFx] = useState(null);
  const [activeJump, setActiveJump] = useState(null);

  // Board sizing: fill the free space between the top bar and the bottom dock.
  const fitRef = useRef(null);
  const [ch, setCh] = useState(10);
  const chRef = useRef(10);
  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return undefined;
    const update = () => {
      const v = fitCellHeight(el.clientWidth, el.clientHeight);
      chRef.current = v;
      setCh(v);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pausedRef = useRef(false);
  const aliveRef = useRef(true);
  const busyRef = useRef(false);
  const overRef = useRef(false);
  const toastTimer = useRef(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { setSoundEnabled(soundOn); }, [soundOn]);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; clearTimeout(toastTimer.current); };
  }, []);

  const showToast = useCallback((text, tone = 'info', ms = 1800) => {
    clearTimeout(toastTimer.current);
    setToast({ text, tone, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), ms);
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

  const commit = useCallback((next) => {
    gRef.current = next;
    setG(next);
    saveGame(next);
    saveSeen(next.usedQ);
  }, []);

  const wait = useCallback(async (ms) => {
    await new Promise((r) => setTimeout(r, ms));
    while (pausedRef.current && aliveRef.current) await new Promise((r) => setTimeout(r, 150));
  }, []);

  const doRoll = useCallback(async () => {
    const cur = gRef.current;
    if (busyRef.current || pausedRef.current || cur.phase !== 'AWAIT_ROLL' || cur.status !== 'in_progress') return;
    busyRef.current = true;
    const next = roll(cur); // result is committed immediately; the animation below only displays it
    if (next === cur) { busyRef.current = false; return; }
    commit(next);
    const m = next.lastMove;
    setEventVisible(false);
    setRolling(true);
    sfx.dice();
    await wait(1000);
    if (!aliveRef.current) return;
    setDiceVal(m.dice);
    setRolling(false);
    setPop({ n: m.dice, key: m.id });
    setMoving(true);
    await wait(900);
    if (!aliveRef.current) return;
    setPop(null);
    if (m.blocked) showToast('Need an exact roll to reach 100');
    for (const c of m.path) {
      if (!aliveRef.current) return;
      setShown((s) => ({ ...s, [m.playerId]: c }));
      sfx.step();
      await wait(260);
    }
    if (m.jump) {
      await wait(400);
      if (!aliveRef.current) return;
      setActiveJump(m.landing);
      setFx(m.jump);
      m.jump === 'ladder' ? sfx.ladder() : sfx.snake();
      await wait(450);
      const pts = m.jump === 'snake'
        ? snakeSlidePoints(m.landing, m.to, chRef.current)
        : ladderClimbPoints(m.landing, m.to, 10, chRef.current);
      for (const pt of pts) {
        if (!aliveRef.current) return;
        setShown((s) => ({ ...s, [m.playerId]: pt }));
        await wait(m.jump === 'snake' ? 60 : 85);
      }
      await wait(250);
      setFx(null);
      setActiveJump(null);
    }
    if (!aliveRef.current) return;
    setShown((s) => ({ ...s, [m.playerId]: m.to }));
    await wait(200);
    setMoving(false);
    setEventVisible(true);
    busyRef.current = false;
  }, [commit, wait, showToast]);

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
    if (g.phase === 'AWAIT_ROLL') t = setTimeout(doRoll, 1100);
    else if (g.phase === 'AWAIT_ACK' && eventVisible) {
      if (g.pending.kind === 'quiz' && !g.pending.answered) t = setTimeout(() => answer(botChoice(gRef.current)), 2500);
      else t = setTimeout(ack, 2500);
    }
    return () => clearTimeout(t);
  }, [g, paused, moving, rolling, eventVisible, doRoll, ack, answer]);

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
  const L = levelInfo(g.settings.level);
  const busy = moving || rolling;
  const turnPlayer = busy && g.lastMove ? g.players.find((p) => p.id === g.lastMove.playerId) : g.players[g.turn];
  const cur = g.players[g.turn];
  const humanTurn = !cur.isBot;
  const canRoll = !busy && !paused && g.phase === 'AWAIT_ROLL' && humanTurn && g.status === 'in_progress';
  const showEvent = g.phase === 'AWAIT_ACK' && eventVisible && !busy && g.pending;
  const limit = QUESTION_LIMITS[g.settings.questionFrequency];

  // ---- 15-second turn timer ----
  // The timer belongs to one turn (turnKey). It freezes while paused and,
  // when it reaches 0, the player loses the turn.
  const turnKey = `${g.moveNo}-${g.turn}`;
  const turnKeyRef = useRef(turnKey);
  turnKeyRef.current = turnKey;
  const [timer, setTimer] = useState({ key: turnKey, left: TURN_SECONDS });
  const timeLeft = timer.key === turnKey ? timer.left : TURN_SECONDS;

  useEffect(() => {
    if (!canRoll) return undefined;
    const t = setInterval(() => {
      setTimer((prev) => {
        const k = turnKeyRef.current;
        const left = prev.key === k ? prev.left : TURN_SECONDS;
        return { key: k, left: Math.max(0, left - 1) };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [canRoll, turnKey]);

  useEffect(() => {
    if (!canRoll || timer.key !== turnKey || timer.left !== 0) return;
    const missed = gRef.current.players[gRef.current.turn];
    const n = skipTurn(gRef.current);
    if (n === gRef.current) return;
    commit(n);
    sfx.wrong();
    showToast(`⏰ Time up! ${missed.name} missed this turn`, 'bad', 2200);
  }, [timer, turnKey, canRoll, commit, showToast]);

  useEffect(() => {
    if (canRoll && timeLeft > 0 && timeLeft <= 5) sfx.step();
  }, [timeLeft, canRoll]);

  const timerOn = humanTurn && g.phase === 'AWAIT_ROLL' && !busy && g.status === 'in_progress';
  const warn = timeLeft <= 5;

  let status = `${turnPlayer.name}'s turn`;
  if (rolling) status = `${turnPlayer.name} is rolling…`;
  else if (busy) status = `${turnPlayer.name} rolled ${g.lastMove?.dice}`;
  else if (turnPlayer.isBot) status = 'Computer is playing…';
  else if (g.phase === 'AWAIT_ROLL') status = `${turnPlayer.name}, tap the dice!`;

  // Players sit on both sides of the dice: P1, P3 on the left; P2, P4 on the right.
  const left = g.players.filter((_, i) => i % 2 === 0);
  const right = g.players.filter((_, i) => i % 2 === 1);
  const chip = (p, side) => {
    const pos = shown[p.id] ?? p.position;
    const isCur = p.id === turnPlayer.id;
    return (
      <PlayerChip
        key={p.id}
        p={p}
        side={side}
        pos={typeof pos === 'number' ? pos : p.position}
        isCur={isCur}
        timer={isCur && timerOn && p.id === cur.id ? { left: timeLeft, warn } : null}
      />
    );
  };

  return (
    <div className="screen board-screen">
      <header className="game-bar">
        <button className="round-btn" onClick={() => setPaused(true)} aria-label="Pause">⏸</button>
        <div className="level-pill" style={{ '--a': L.frame[0], '--b': L.frame[1] }}>
          <span>{L.icon}</span>
          <strong>Level {L.n}</strong>
          <small>{L.name} · ❓ {g.asked}/{limit}</small>
        </div>
        <button className="round-btn" onClick={() => setSoundOn((v) => !v)} aria-label="Sound">{soundOn ? '🔊' : '🔇'}</button>
      </header>

      <div className={`board-wrap ${fx ? `fx-${fx}` : ''}`}>
        <div className="board-fit" ref={fitRef}>
          <BoardSvg players={g.players} shown={shown} currentId={turnPlayer.id} quizCells={quizCells} activeJump={activeJump} ch={ch} frame={L.frame} />
        </div>
        {pop && (
          <div className="roll-pop" key={pop.key} style={{ '--c': COLORS[turnPlayer.color].hex }}>
            <span className="roll-pop-n">{pop.n}</span>
            <span className="roll-pop-t">{turnPlayer.name} rolled</span>
          </div>
        )}
        {fx === 'snake' && <div className="fx-text bad">🐍 Snake bite!</div>}
        {fx === 'ladder' && <div className="fx-text good">🪜 Climb up!</div>}
        {toast && <div className={`toast ${toast.tone}`} key={toast.key}>{toast.text}</div>}
      </div>

      <section className="dock">
        <p className="dock-status" key={status} style={{ '--c': COLORS[turnPlayer.color].hex }}>
          <span className="dot" />{status}
        </p>
        <div className="dock-row">
          <div className="side left">{left.map((p) => chip(p, 'left'))}</div>

          <button
            className={`dice-btn ${canRoll ? 'ready' : ''} ${warn && canRoll ? 'warn' : ''}`}
            disabled={!canRoll}
            onClick={doRoll}
            aria-label={canRoll ? `Tap to roll the dice, ${timeLeft} seconds left` : 'Dice'}
            style={{ '--c': COLORS[turnPlayer.color].hex }}
          >
            {timerOn && (
              <svg className="dice-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="bg" cx="50" cy="50" r="46" pathLength="100" />
                <circle className="fg" cx="50" cy="50" r="46" pathLength="100" strokeDasharray={`${(timeLeft / TURN_SECONDS) * 100} 100`} />
              </svg>
            )}
            <Dice value={diceVal} rolling={rolling} size={54} />
            <span className="dice-label">
              {canRoll ? `TAP · ${timeLeft}s` : rolling ? 'Rolling…' : busy ? 'Moving…' : turnPlayer.isBot ? 'CPU…' : paused ? 'Paused' : 'Wait'}
            </span>
          </button>

          <div className="side right">{right.map((p) => chip(p, 'right'))}</div>
        </div>
      </section>

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
          <div className="event-emoji">⏸️</div>
          <h2>Game paused</h2>
          <p>Your game is saved. The turn timer is stopped.</p>
          <button className="btn primary big" onClick={() => setPaused(false)}>▶ Resume</button>
          <button className="btn ghost-btn big" onClick={() => setSoundOn((v) => !v)}>{soundOn ? '🔊 Sound on' : '🔇 Sound off'}</button>
          <button className="btn ghost-btn big" onClick={onExit}>💾 Save &amp; exit</button>
        </Sheet>
      )}
    </div>
  );
}
