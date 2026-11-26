export function nextTurnIndex(players, current) {
  const n = players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (current + i) % n;
    if (players[idx].status === 'active') return idx;
  }
  return current;
}

// How many players must finish before the game ends.
export function finishTarget(settings, playerCount) {
  const max = Math.max(1, playerCount - 1);
  const t =
    settings.duration === 'quick' ? 1 : settings.duration === 'extended' ? playerCount - 1 : Math.ceil(playerCount / 2);
  return Math.min(Math.max(1, t), max);
}
