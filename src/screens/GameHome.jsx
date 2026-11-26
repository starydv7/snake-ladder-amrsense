export default function GameHome({ saved, onPlay, onResume, onDiscard }) {
  return (
    <div className="screen home">
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
        <button className="btn primary big" onClick={onPlay}>{saved ? 'New Game' : 'Play'}</button>
        <p className="small-note">Works offline · 1 to 4 players on one phone</p>
      </div>
    </div>
  );
}
