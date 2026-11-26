// Headless engine check: plays many full games and asserts the rules from the design.
import assert from 'node:assert/strict';
import { createGame, roll, ackEvent, answerQuiz, botChoice, buildResults, DEFAULT_SETTINGS } from '../src/engine/GameEngine.js';
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
for (const q of QUESTIONS) assert.equal(q.en.options.length, 4, q.id);

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
  let g = base(); g.players[0].position = 10;
  g = roll(g, Math.random, 6); // 16 -> 6
  assert.equal(g.players[0].position, 6); assert.equal(g.pending.kind, 'snake');
  g = ackEvent(g); assert.equal(g.turn, 1);
  g = roll(g, Math.random, 1); // 1 -> ladder 38
  assert.equal(g.players[1].position, 38); assert.equal(g.players[1].points, 10);
}
{ // two tokens on the same square is allowed
  let g = base(); g.players[0].position = 10; g.players[1].position = 12;
  g = roll(g, Math.random, 2); g = ackEvent(g.pending ? g : g);
  assert.equal(g.players[0].position, 12);
}
{ // resume: a saved state restores exactly (JSON round trip mid-event)
  let g = base(); g.players[0].position = 10;
  g = roll(g, Math.random, 6);
  const restored = JSON.parse(JSON.stringify(g));
  assert.deepEqual(restored, g);
  assert.equal(ackEvent(restored).turn, 1);
}
{ // extra roll on six when enabled
  let g = createGame({ mode: 'local', settings: { ...DEFAULT_SETTINGS, extraRollOnSix: true }, players: mk(2) });
  g.players[0].position = 50;
  g = roll(g, Math.random, 6); // 56 -> snake; ack gives bonus roll
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

console.log(`OK: ${games} full games + rule checks passed`);
