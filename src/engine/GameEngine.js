import { SNAKES, LADDERS, QUIZ_CELLS, LADDER_POINTS, QUIZ_POINTS, FINISH_BONUS } from '../data/board.js';
import { rollDie } from './DiceEngine.js';
import { computeMove } from './MovementEngine.js';
import { nextTurnIndex, finishTarget } from './TurnManager.js';
import { pickQuestion, shuffledOrder, QUESTION_LIMITS, getQuestion } from '../services/QuestionService.js';

/*
 * Pure engine: every function takes a state and returns a NEW state.
 * A roll commits the whole result (dice, position, points, pending event) at once.
 * The UI only animates what is already saved, so an interrupted animation can
 * never cause a second roll or a second move.
 *
 * phase: AWAIT_ROLL -> roll -> AWAIT_ROLL (next player) | AWAIT_ACK (event pending)
 *        AWAIT_ACK  -> answerQuiz / ackEvent -> AWAIT_ROLL | OVER
 */

export const DEFAULT_SETTINGS = {
  difficulty: 'normal',
  questionFrequency: 'standard',
  duration: 'standard',
  winningRule: 'exact_100',
  extraRollOnSix: false,
  language: 'en',
  sound: true,
  botLevel: 'medium'
};

const QUIZ_STEP = { light: 3, standard: 2, learning: 1 };

export function quizCellsFor(settings) {
  const step = QUIZ_STEP[settings.questionFrequency] || 2;
  return QUIZ_CELLS.filter((_, i) => i % step === 0);
}

export function createGame({ mode, settings, players, seen = [] }) {
  const now = Date.now();
  return {
    version: 1,
    id: `g${now}${Math.floor(Math.random() * 1e4)}`,
    mode,
    status: 'in_progress',
    settings: { ...DEFAULT_SETTINGS, ...settings },
    players: players.map((p, i) => ({
      id: `p${i + 1}`,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      isBot: !!p.isBot,
      position: 0,
      points: 0,
      status: 'active',
      rank: null,
      finalRank: null,
      answered: 0,
      correct: 0,
      snakes: 0,
      ladders: 0
    })),
    turn: 0,
    phase: 'AWAIT_ROLL',
    moveNo: 0,
    asked: 0,
    usedQ: [...seen],
    pending: null,
    lastMove: null,
    rankings: [],
    finalRanking: [],
    history: [],
    createdAt: now,
    updatedAt: now
  };
}

const clone = (s) => {
  const c = JSON.parse(JSON.stringify(s));
  c.updatedAt = Date.now();
  return c;
};

export const currentPlayer = (s) => s.players[s.turn];

function endGameIfNeeded(s) {
  const activeLeft = s.players.filter((p) => p.status === 'active').length;
  const target = finishTarget(s.settings, s.players.length);
  if (s.rankings.length >= target || activeLeft === 0) {
    s.status = 'completed';
    s.phase = 'OVER';
    s.pending = null;
    const finished = s.rankings.map((id) => s.players.find((p) => p.id === id));
    const rest = s.players
      .filter((p) => p.status === 'active')
      .sort((a, b) => b.position - a.position || b.points - a.points);
    s.finalRanking = [...finished, ...rest].map((p) => p.id);
    s.finalRanking.forEach((id, i) => {
      s.players.find((p) => p.id === id).finalRank = i + 1;
    });
    return true;
  }
  return false;
}

function advance(s) {
  if (endGameIfNeeded(s)) return;
  const mover = s.players.find((p) => p.id === s.lastMove?.playerId);
  const bonus = s.settings.extraRollOnSix && s.lastMove?.dice === 6 && mover && mover.status === 'active';
  if (!bonus) s.turn = nextTurnIndex(s.players, s.turn);
  s.phase = 'AWAIT_ROLL';
  s.pending = null;
}

export function roll(state, rng = Math.random, forcedDice) {
  if (state.status !== 'in_progress' || state.phase !== 'AWAIT_ROLL') return state;
  const s = clone(state);
  const p = s.players[s.turn];
  if (p.status !== 'active') return state;

  const dice = forcedDice ?? rollDie(rng);
  s.moveNo += 1;
  const id = `m${s.moveNo}`;
  const from = p.position;
  const mv = computeMove(from, dice, s.settings.winningRule);

  let to = mv.landing;
  let jump = null;
  let pending = null;

  if (!mv.blocked) {
    // Only ONE snake/ladder per move. Destinations never chain.
    const snake = SNAKES[mv.landing];
    const ladder = LADDERS[mv.landing];
    if (snake) {
      jump = 'snake';
      to = snake.to;
      p.snakes += 1;
      pending = { id, kind: 'snake', from: mv.landing, to, label: snake.label, title: snake.title, icon: snake.icon, fact: snake.fact, color: snake.color };
    } else if (ladder) {
      jump = 'ladder';
      to = ladder.to;
      p.ladders += 1;
      p.points += LADDER_POINTS;
      pending = { id, kind: 'ladder', from: mv.landing, to, label: ladder.label, title: ladder.title, icon: ladder.icon, fact: ladder.fact, points: LADDER_POINTS };
    } else if (
      quizCellsFor(s.settings).includes(mv.landing) &&
      s.asked < QUESTION_LIMITS[s.settings.questionFrequency]
    ) {
      const { question, reset } = pickQuestion(s.settings.difficulty, s.usedQ, rng);
      if (reset) s.usedQ = [];
      s.usedQ.push(question.id);
      s.asked += 1;
      pending = {
        id,
        kind: 'quiz',
        questionId: question.id,
        order: shuffledOrder(question.en.options.length, rng),
        answered: null
      };
    }
  }

  p.position = to;

  if (!mv.blocked && to === 100) {
    p.status = 'finished';
    s.rankings.push(p.id);
    p.rank = s.rankings.length;
    const bonus = FINISH_BONUS[p.rank - 1] ?? 0;
    p.points += bonus;
    pending = { id, kind: 'finish', rank: p.rank, bonus, via: jump };
  }

  s.lastMove = { id, playerId: p.id, dice, from, path: mv.path, landing: mv.landing, to, jump, blocked: mv.blocked };
  s.history.push({ ...s.lastMove, at: Date.now() });

  if (pending) {
    s.pending = pending;
    s.phase = 'AWAIT_ACK';
  } else {
    advance(s);
  }
  return s;
}

// Index (in displayed order) of the correct option.
export function correctIndex(pending, question) {
  return pending.order.indexOf(question.answer);
}

export function answerQuiz(state, choice) {
  const pend = state.pending;
  if (!pend || pend.kind !== 'quiz' || pend.answered || state.phase !== 'AWAIT_ACK') return state;
  const q = getQuestion(pend.questionId, state.settings.language);
  const s = clone(state);
  const p = s.players[s.turn];
  const correct = choice === correctIndex(pend, q);
  p.answered += 1;
  let points = 0;
  if (correct) {
    p.correct += 1;
    points = QUIZ_POINTS;
    p.points += points;
  }
  s.pending.answered = { choice, correct, points };
  return s;
}

export function ackEvent(state) {
  const pend = state.pending;
  if (!pend || state.phase !== 'AWAIT_ACK') return state;
  if (pend.kind === 'quiz' && !pend.answered) return state; // must answer first
  const s = clone(state);
  s.pending = null;
  advance(s);
  return s;
}

// Computer opponent's answer, as a displayed-order index.
export function botChoice(state, rng = Math.random) {
  const pend = state.pending;
  const q = getQuestion(pend.questionId, state.settings.language);
  const chance = { easy: 0.4, medium: 0.65, hard: 0.85 }[state.settings.botLevel] ?? 0.65;
  const right = correctIndex(pend, q);
  if (rng() < chance) return right;
  const wrong = pend.order.map((_, i) => i).filter((i) => i !== right);
  return wrong[Math.floor(rng() * wrong.length)];
}

export function buildResults(state) {
  return state.finalRanking.map((id) => {
    const p = state.players.find((x) => x.id === id);
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      isBot: p.isBot,
      rank: p.finalRank,
      finished: p.status === 'finished',
      position: p.position,
      points: p.points,
      answered: p.answered,
      correct: p.correct,
      accuracy: p.answered ? Math.round((p.correct / p.answered) * 100) : null,
      snakes: p.snakes,
      ladders: p.ladders
    };
  });
}
