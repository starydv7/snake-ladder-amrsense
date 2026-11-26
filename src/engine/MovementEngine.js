// Calculates the squares a token passes through. Pure function, no side effects.
// rule: 'exact_100' (overshoot = stay put) | 'bounce' (overshoot bounces back)
export function computeMove(position, dice, rule) {
  const raw = position + dice;
  if (raw <= 100) {
    const path = [];
    for (let c = position + 1; c <= raw; c++) path.push(c);
    return { path, landing: raw, blocked: false };
  }
  if (rule === 'bounce') {
    const path = [];
    for (let c = position + 1; c <= 100; c++) path.push(c);
    const landing = 200 - raw;
    for (let c = 99; c >= landing; c--) path.push(c);
    return { path, landing, blocked: false };
  }
  return { path: [], landing: position, blocked: true };
}
