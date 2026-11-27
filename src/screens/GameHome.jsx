const ORBS = [
  { e: '🦠', l: '6%', t: '9%', s: 1.1, d: '0s' },
  { e: '💊', l: '78%', t: '7%', s: 1, d: '1.2s' },
  { e: '🧼', l: '78%', t: '62%', s: .9, d: '.6s' },
  { e: '💉', l: '8%', t: '64%', s: .9, d: '2s' },
  { e: '🩺', l: '62%', t: '74%', s: .8, d: '1.6s' },
  { e: '🛡️', l: '24%', t: '75%', s: .8, d: '.9s' }
];

const FEATURES = [
  { i: '🧠', t: '200 AMR questions' },
  { i: '👨‍👩‍👧‍👦', t: '1–4 players' },
  { i: '📴', t: 'Works offline' }
];

export default function GameHome({ saved, onPlay, onResume, onDiscard }) {
  return (
    <div className="screen home">
      <div className="aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="sparkles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 70}%`, animationDelay: `${(i % 6) * 0.5}s` }} />
        ))}
      </div>
      {ORBS.map((o) => (
        <span key={o.e} className="orb" style={{ left: o.l, top: o.t, animationDelay: o.d, '--sc': o.s }} aria-hidden="true">{o.e}</span>
      ))}

      <div className="home-hero">
        <div className="emblem" aria-hidden="true">
          <div className="emblem-ring" />
          <div className="emblem-core">
            <span className="emblem-snake">🐍</span>
            <span className="emblem-ladder">🪜</span>
            <span className="emblem-dice">🎲</span>
          </div>
        </div>
        <p className="brand-kicker">AMRSENSE</p>
        <h1 className="brand-title">Awareness Game</h1>
        <p className="brand-sub">Snake &amp; Ladder · Play, Learn &amp; Stop AMR</p>
        <div className="feature-row">
          {FEATURES.map((f, i) => (
            <span key={f.t} className="feature" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
              <b>{f.i}</b>{f.t}
            </span>
          ))}
        </div>
      </div>

      <div className="home-actions">
        {saved && (
          <div className="resume-card">
            <div className="resume-avatars">
              {saved.players.map((p) => <span key={p.id}>{p.avatar}</span>)}
            </div>
            <div>
              <strong>Game in progress</strong>
              <small>{saved.players.length} players · {saved.players[saved.turn]?.name}'s turn</small>
            </div>
            <button className="btn primary" onClick={onResume}>▶ Resume game</button>
            <button className="link" onClick={onDiscard}>Discard saved game</button>
          </div>
        )}
        <button className="btn primary big play-btn" onClick={onPlay}>
          <span className="shine" aria-hidden="true" />
          {saved ? '✨ Start a new game' : '▶  Play now'}
        </button>
        <p className="small-note">You choose the players, avatars and colours</p>
      </div>
    </div>
  );
}
