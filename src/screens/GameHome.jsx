const DECOS = [
  { e: '🐍', l: '8%', t: '8%', d: '0s' },
  { e: '🪜', l: '82%', t: '12%', d: '.8s' },
  { e: '💊', l: '14%', t: '38%', d: '1.4s' },
  { e: '🧼', l: '84%', t: '40%', d: '.4s' },
  { e: '💉', l: '50%', t: '3%', d: '2s' }
];

export default function GameHome({ saved, onPlay, onResume, onDiscard }) {
  return (
    <div className="screen home">
      {DECOS.map((d) => (
        <span key={d.e} className="deco" style={{ left: d.l, top: d.t, animationDelay: d.d }}>{d.e}</span>
      ))}
      <div className="home-hero">
        <div className="logo">🐍🪜</div>
        <h1>AMRsense<br />Snake &amp; Ladder</h1>
        <p className="tag">Play, Learn &amp; Stop AMR</p>
      </div>
      <div className="home-actions">
        {saved && (
          <div className="resume-card">
            <div>
              <strong>Game in progress</strong>
              <small>{saved.players.length} players · {saved.players[saved.turn]?.name}'s turn</small>
            </div>
            <button className="btn primary" onClick={onResume}>Resume</button>
            <button className="link" onClick={onDiscard}>Discard saved game</button>
          </div>
        )}
        <button className="btn primary big" onClick={onPlay}>{saved ? 'New Game' : '▶ Play'}</button>
        <p className="small-note">Works offline · 1 to 4 players on one phone</p>
      </div>
    </div>
  );
}
