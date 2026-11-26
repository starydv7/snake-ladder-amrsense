import { QUESTIONS, CATEGORIES } from '../data/questions.js';

export const QUESTION_LIMITS = { light: 5, standard: 10, learning: 20 };

const DIFFICULTY_RANGE = { easy: [1, 1], normal: [1, 2], hard: [2, 3] };

export function getQuestion(id, language = 'en') {
  const raw = QUESTIONS.find((q) => q.id === id);
  if (!raw) return null;
  const t = raw[language] || raw.en;
  return {
    id: raw.id,
    category: raw.category,
    categoryInfo: CATEGORIES[raw.category],
    difficulty: raw.difficulty,
    answer: raw.answer,
    q: t.q,
    options: t.options,
    explanation: t.explanation,
    hint: t.hint
  };
}

// Picks an unused question for the chosen difficulty. When the pool is exhausted
// the used list is reset, so the game never runs out of questions.
export function pickQuestion(difficulty, usedIds, rng = Math.random) {
  const [lo, hi] = DIFFICULTY_RANGE[difficulty] || DIFFICULTY_RANGE.normal;
  const pool = QUESTIONS.filter((q) => q.difficulty >= lo && q.difficulty <= hi);
  let candidates = pool.filter((q) => !usedIds.includes(q.id));
  let reset = false;
  if (candidates.length === 0) {
    candidates = pool.length ? pool : QUESTIONS;
    reset = true;
  }
  return { question: candidates[Math.floor(rng() * candidates.length)], reset };
}

export function shuffledOrder(length, rng = Math.random) {
  const a = Array.from({ length }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
