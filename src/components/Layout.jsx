export function Screen({ title, subtitle, step, onBack, children, footer }) {
  return (
    <div className="screen">
      <header className="top">
        {onBack ? (
          <button className="icon-btn" onClick={onBack} aria-label="Back">←</button>
        ) : <span className="icon-btn ghost" />}
        <div className="top-title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {step ? <span className="step">{step}</span> : <span className="icon-btn ghost" />}
      </header>
      <main className="content">{children}</main>
      {footer && <footer className="foot">{footer}</footer>}
    </div>
  );
}

export function Dice({ value, rolling }) {
  const pips = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
  }[value || 1];
  return (
    <div className={`dice ${rolling ? 'rolling' : ''}`} aria-label={`Dice ${value || ''}`}>
      {Array.from({ length: 9 }, (_, i) => <span key={i} className={pips.includes(i) ? 'pip' : ''} />)}
    </div>
  );
}

export function Sheet({ tone = 'neutral', children }) {
  return (
    <div className="overlay">
      <div className={`sheet ${tone}`} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}
