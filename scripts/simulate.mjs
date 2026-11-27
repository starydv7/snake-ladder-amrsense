// Headless engine check: plays many full games and asserts the rules from the design.
import assert from 'node:assert/strict';
import { createGame, roll, ackEvent, answerQuiz, botChoice, buildResults, skipTurn, correctIndex, DEFAULT_SETTINGS } from '../src/engine/GameEngine.js';
import { applyLevel, LEVELS } from '../src/data/levels.js';
import { getQuestion } from '../src/services/QuestionService.js';
import { SNAKES, LADDERS } from '../src/data/board.js';
import { QUESTIONS } from '../src/data/questions.js';

const colors = ['red', 'blue', 'yellow', 'green'];
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}`, avatar: 'x', color: colors[i], isBot: false }));

function lcg(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

function playOut(state, rng) {
  let guard = 0;
  while (state.status === 'in_progress') {
    assert.ok(++guard < 20000, 'game did not terminate');
    if (state.phase === 'AWAIT_ROLL') {
      const before = state;
      state = roll(state, rng);
      assert.notEqual(state, before);
    } else {
      if (state.pending.kind === 'quiz' && !state.pending.answered) {
        assert.equal(ackEvent(state), state, 'cannot skip an unanswered quiz');
        state = answerQuiz(state, botChoice(state, rng));
        assert.equal(answerQuiz(state, 0), state, 'cannot answer twice (no duplicate points)');
      }
      state = ackEvent(state);
    }
    state.players.forEach((p) => assert.ok(p.position >= 0 && p.position <= 100));
  }
  return state;
}

// 1. static board sanity
for (const [f, s] of Object.entries(SNAKES)) assert.ok(s.to < +f && !SNAKES[s.to] && !LADDERS[s.to], `snake ${f}`);
for (const [f, l] of Object.entries(LADDERS)) assert.ok(l.to > +f && !SNAKES[l.to] && !LADDERS[l.to], `ladder ${f}`);
assert.ok(QUESTIONS.length >= 200, 'need 200+ questions, have ' + QUESTIONS.length);
assert.equal(new Set(QUESTIONS.map((q) => q.en.q)).size, QUESTIONS.length, 'duplicate question text');
for (const q of QUESTIONS) { assert.equal(q.en.options.length, 4, q.id); assert.equal(new Set(q.en.options).size, 4, 'duplicate option ' + q.id); assert.ok(q.en.explanation, q.id); }
for (const d of [1, 2, 3]) assert.ok(QUESTIONS.filter((q) => q.difficulty === d).length >= 30, 'difficulty ' + d);
for (const [f, s] of Object.entries(SNAKES)) assert.ok(s.title && s.fact && s.label, 'snake text ' + f);
assert.equal(new Set(Object.values(SNAKES).map((s) => s.label)).size, Object.keys(SNAKES).length, 'each snake has its own message');

// 2. full games for 2/3/4 players, every rule combination
let games = 0;
for (const n of [2, 3, 4]) {
  for (const winningRule of ['exact_100', 'bounce']) {
    for (const duration of ['quick', 'standard', 'extended']) {
      for (const extraRollOnSix of [false, true]) {
        for (let seed = 1; seed <= 15; seed++) {
          const rng = lcg(seed * 7919 + n);
          let g = createGame({ mode: 'local', settings: { ...DEFAULT_SETTINGS, winningRule, duration, extraRollOnSix, questionFrequency: 'learning', difficulty: 'hard' }, players: mk(n) });
          g = playOut(g, rng);
          assert.equal(g.status, 'completed');
          assert.equal(new Set(g.finalRanking).size, n, 'everyone ranked once');
          const res = buildResults(g);
          assert.deepEqual(res.map((r) => r.rank), res.map((_, i) => i + 1));
          assert.ok(g.asked <= 20);
          games++;
        }
      }
    }
  }
}

// 3. single player + computer
{
  const g = playOut(createGame({ mode: 'single', settings: DEFAULT_SETTINGS, players: [{ name: 'A', avatar: 'x', color: 'red' }, { name: 'Computer', avatar: 'b', color: 'blue', isBot: true }] }), lcg(5));
  assert.equal(g.status, 'completed');
}

// 4. specific rules
const base = (rule = 'exact_100') => createGame({ mode: 'local', settings: { ...DEFAULT_SETTINGS, winningRule: rule }, players: mk(2) });
{ // exact: overshoot stays put and turn passes
  let g = base(); g.players[0].position = 97;
  g = roll(g, Math.random, 6);
  assert.equal(g.players[0].position, 97); assert.equal(g.turn, 1); assert.equal(g.lastMove.blocked, true);
}
{ // bounce: 98 + 6 = 104 -> bounces back to 96
  let g = base('bounce'); g.players[0].position = 98;
  g = roll(g, Math.random, 6);
  assert.equal(g.players[0].position, 96);
}
{ // exact 100 wins, gets a finish event, and is not moved again
  let g = base(); g.players[0].position = 96;
  g = roll(g, Math.random, 4);
  assert.equal(g.players[0].position, 100); assert.equal(g.pending.kind, 'finish');
  assert.equal(roll(g, Math.random, 3), g, 'no rolling while an event is pending (no double roll)');
  g = ackEvent(g);
  assert.equal(g.status, 'completed'); assert.equal(g.finalRanking[0], 'p1');
}
{ // snake: exactly one jump, no chaining; ladder awards points once
  let g = base(); g.players[0].position = 24;
  g = roll(g, Math.random, 6); // 30 -> 10
  assert.equal(g.players[0].position, 10); assert.equal(g.pending.kind, 'snake');
  g = ackEvent(g); assert.equal(g.turn, 1);
  g.players[1].position = 3;
  g = roll(g, Math.random, 1); // 4 -> ladder 26
  assert.equal(g.players[1].position, 26); assert.equal(g.players[1].points, 10);
}
{ // two tokens on the same square is allowed
  let g = base(); g.players[0].position = 14; g.players[1].position = 16;
  g = roll(g, Math.random, 2);
  assert.equal(g.players[0].position, 16); assert.equal(g.players[1].position, 16);
}
{ // resume: a saved state restores exactly (JSON round trip mid-event)
  let g = base(); g.players[0].position = 24;
  g = roll(g, Math.random, 6);
  const restored = JSON.parse(JSON.stringify(g));
  assert.deepEqual(restored, g);
  assert.equal(ackEvent(restored).turn, 1);
}
{ // extra roll on six when enabled
  let g = createGame({ mode: 'local', settings: { ...DEFAULT_SETTINGS, extraRollOnSix: true }, players: mk(2) });
  g.players[0].position = 24;
  g = roll(g, Math.random, 6); // 30 -> snake; ack gives bonus roll
  g = ackEvent(g);
  assert.equal(g.turn, 0);
}
{ // questions never run out
  let g = createGame({ mode: 'local', settings: { ...DEFAULT_SETTINGS, questionFrequency: 'learning', difficulty: 'easy' }, players: mk(2) });
  g.usedQ = QUESTIONS.filter((q) => q.difficulty === 1).map((q) => q.id);
  g.players[0].position = 2;
  g = roll(g, Math.random, 3); // lands on 5 (quiz)
  assert.equal(g.pending.kind, 'quiz');
}

{ // missed turn: token stays, next player goes, cannot skip during an event
  let g = createGame({ mode: 'local', settings: DEFAULT_SETTINGS, players: mk(3) });
  g.players[0].position = 40;
  g = skipTurn(g);
  assert.equal(g.turn, 1); assert.equal(g.players[0].position, 40); assert.equal(g.players[0].missed, 1);
  g = skipTurn(g); assert.equal(g.turn, 2);
  g = skipTurn(g); assert.equal(g.turn, 0, 'rotation wraps');
  g.players[0].position = 24; g = roll(g, Math.random, 6);
  assert.equal(skipTurn(g), g, 'no skip while an event is pending');
}
{ // levels: harder questions and more points per correct answer
  for (const L of LEVELS) {
    let g = createGame({ mode: 'local', settings: applyLevel({ ...DEFAULT_SETTINGS, level: L.n, questionFrequency: 'learning' }), players: mk(2) });
    g.players[0].position = 2; g = roll(g, Math.random, 3);
    assert.equal(g.pending.kind, 'quiz');
    const q = getQuestion(g.pending.questionId);
    if (L.difficulty === 'expert') assert.equal(q.difficulty, 3);
    if (L.difficulty === 'easy') assert.equal(q.difficulty, 1);
    g = answerQuiz(g, correctIndex(g.pending, q));
    assert.equal(g.players[0].points, L.quizPoints);
  }
}

console.log(`OK: ${games} full games + rule checks passed`);
