import { Screen } from '../components/Layout.jsx';
import { COLORS } from '../theme.js';
import { computeAchievements } from '../engine/achievements.js';

export default function GameResults({ results, onReplay, onHome }) {
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  const winner = results[0];
  return (
    <Screen
      title="Game over"
      subtitle={winner ? `${winner.avatar} ${winner.name} wins!` : ''}
      footer={
        <div className="two-btn">
          <button className="btn ghost-btn" onClick={onHome}>Home</button>
          <button className="btn primary" onClick={onReplay}>Play again</button>
        </div>
      }
    >
      {results.map((r) => {
        const badges = computeAchievements(r);
        return (
          <section key={r.id} className="card result" style={{ borderLeftColor: COLORS[r.color].hex }}>
            <div className="result-head">
              <span className="medal">{medals[r.rank - 1]}</span>
              <span className="token-preview" style={{ background: COLORS[r.color].hex }}>{r.avatar}</span>
              <div>
                <strong>{r.name}</strong>
                <small>{r.finished ? 'Reached 100' : `Stopped at ${r.position}`}</small>
              </div>
              <div className="pts"><strong>{r.points}</strong><small>pts</small></div>
            </div>
            <div className="knowledge">
              <span>🧠 Knowledge: {r.answered ? `${r.correct}/${r.answered} correct (${r.accuracy}%)` : 'No questions answered'}</span>
              <span>🪜 {r.ladders} · 🐍 {r.snakes}</span>
            </div>
            {badges.length > 0 && (
              <div className="badges">
                {badges.map((b) => <span key={b.id} className="badge-chip">{b.icon} {b.title}</span>)}
              </div>
            )}
          </section>
        );
      })}
      <p className="note">Game points are for fun. Knowledge accuracy shows how well each player answered AMR questions.</p>
    </Screen>
  );
}
