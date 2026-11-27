// Level progression. Finishing a level unlocks the next one.
// Higher levels ask harder AMR questions and give more points per correct answer.
export const LEVELS = [
  { n: 1, name: 'Beginner', icon: '🌱', difficulty: 'easy', quizPoints: 20, frame: ['#13a173', '#06583f'], tagline: 'Basics of antibiotics, germs and hygiene' },
  { n: 2, name: 'Explorer', icon: '🧭', difficulty: 'normal', quizPoints: 25, frame: ['#2f6fd6', '#123a85'], tagline: 'Doctors, vaccines and everyday choices' },
  { n: 3, name: 'Expert', icon: '🔬', difficulty: 'hard', quizPoints: 30, frame: ['#8a3fd1', '#4a1784'], tagline: 'Resistance, One Health and the environment' },
  { n: 4, name: 'AMR Champion', icon: '🏆', difficulty: 'expert', quizPoints: 40, frame: ['#e0a21b', '#9a5d00'], tagline: 'The toughest AMR questions' }
];

export const MAX_LEVEL = LEVELS.length;

export const levelInfo = (n) => LEVELS[Math.min(Math.max(1, n || 1), MAX_LEVEL) - 1];

// Settings derived from the chosen level.
export function applyLevel(settings) {
  const L = levelInfo(settings.level);
  return { ...settings, level: L.n, difficulty: L.difficulty, quizPoints: L.quizPoints };
}
