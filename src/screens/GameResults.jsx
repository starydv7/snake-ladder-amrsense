import { useMemo } from 'react';
import { Screen } from '../components/Layout.jsx';
import { COLORS } from '../theme.js';
import { computeAchievements } from '../engine/achievements.js';
import { levelInfo, MAX_LEVEL } from '../data/levels.js';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];

export default function GameResults({ results, level, onReplay, onNextLevel, onHome }) {
  const confetti = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      left: `${(i * 97) % 100}%`,
      bg: ['#d4a017', '#e85d5d', '#1fbf8a', '#2f6fd6', '#a45bd6'][i % 5],
      dur: `${2.4 + ((i * 13) % 17) / 10}s`,
      delay: `${((i * 7) % 15) / 10}s`
    })),
    []
  );
  const L = levelInfo(level);
  const hasNext = level < MAX_LEVEL;
  const next = hasNext ? levelInfo(level + 1) : null;
  const winner = results[0];

  return (
    <>
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span key={i} style={{ left: c.left, background: c.bg, animationDuration: c.dur, animationDelay: c.delay }} />
        ))}
      </div>
      <Screen
        title={`Level ${L.n} complete!`}
        subtitle={winner ? `${winner.avatar} ${winner.name} wins` : ''}
        footer={
          <div className="result-actions">
            {hasNext && (
              <button className="btn primary big" onClick={onNextLevel}>
                {next.icon} Next: Level {next.n} · {next.name}
              </button>
            )}
            <div className="two-btn">
              <button className="btn ghost-btn" onClick={onHome}>🏠 Home</button>
              <button className={`btn ${hasNext ? 'ghost-btn' : 'primary'}`} onClick={onReplay}>🔁 Replay level</button>
            </div>
          </div>
        }
      >
        <section className="level-banner" style={{ '--a': L.frame[0], '--b': L.frame[1] }}>
          <span className="level-banner-icon">{L.icon}</span>
          <div>
            <strong>Level {L.n} · {L.name}</strong>
            <small>
              {hasNext ? `Level ${next.n} · ${next.name} unlocked! Harder AMR questions, more points.` : 'You finished every level. You are an AMR Champion!'}
            </small>
          </div>
        </section>

        {results.map((r, i) => {
          const badges = computeAchievements(r);
          return (
            <section key={r.id} className="card result" style={{ borderLeftColor: COLORS[r.color].hex, animationDelay: `${0.15 + i * 0.1}s` }}>
              <div className="result-head">
                <span className="medal">{MEDALS[r.rank - 1]}</span>
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
    </>
  );
}
