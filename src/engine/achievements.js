// Badges derived from final stats. Game points are NOT a measure of knowledge;
// use accuracy / answered for learning outcomes.
export function computeAchievements(r) {
  const list = [];
  if (r.rank === 1) list.push({ id: 'champion', icon: '🏆', title: 'Game Champion' });
  if (r.ladders >= 1) list.push({ id: 'ladder', icon: '🪜', title: 'Ladder Climber' });
  if (r.finished && r.snakes >= 2) list.push({ id: 'survivor', icon: '🐍', title: 'Snake Survivor' });
  if (r.answered >= 1) list.push({ id: 'learner', icon: '📘', title: 'Curious Learner' });
  if (r.answered >= 3 && r.accuracy >= 80) list.push({ id: 'master', icon: '🧠', title: 'AMR Quiz Master' });
  if (r.answered >= 3 && r.correct === r.answered) list.push({ id: 'perfect', icon: '⭐', title: 'Perfect Score' });
  return list;
}
