// Standard screen: a slim top bar (Back on the left, step progress on the right),
// then a left-aligned title, scrolling content and a sticky footer.
export function Screen({ title, subtitle, step, onBack, children, footer }) {
  const [cur, total] = step ? step.split('/').map(Number) : [0, 0];
  return (
    <div className="screen">
      <header className="top">
        <div className="top-bar">
          {onBack ? (
            <button className="back-btn" onClick={onBack} aria-label="Back">
              <span className="back-arrow">‹</span> Back
            </button>
          ) : <span />}
          {step && (
            <div className="steps" aria-label={`Step ${cur} of ${total}`}>
              {Array.from({ length: total }, (_, i) => (
                <i key={i} className={i < cur ? (i === cur - 1 ? 'now' : 'done') : ''} />
              ))}
              <span>Step {cur}/{total}</span>
            </div>
          )}
        </div>
        <h1 className="title-pop" key={title}>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </header>
      <main className="content">{children}</main>
      {footer && <footer className="foot">{footer}</footer>}
    </div>
  );
}

const PIPS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
};
// Face placement on the cube: front 1, right 2, top 3, bottom 4, left 5, back 6.
const FACE_CLASS = { 1: 'f-front', 2: 'f-right', 3: 'f-top', 4: 'f-bottom', 5: 'f-left', 6: 'f-back' };
// Rotation that brings each face to the front.
const SHOW = {
  1: 'rotateX(-18deg) rotateY(24deg)',
  2: 'rotateX(-18deg) rotateY(-66deg)',
  3: 'rotateX(-108deg) rotateY(24deg)',
  4: 'rotateX(72deg) rotateY(24deg)',
  5: 'rotateX(-18deg) rotateY(114deg)',
  6: 'rotateX(-18deg) rotateY(204deg)'
};

export function Dice({ value, rolling, size = 64 }) {
  return (
    <div className="dice-scene" style={{ '--s': `${size}px` }} aria-label={`Dice ${value || ''}`}>
      <div className={`cube ${rolling ? 'tumble' : ''}`} style={rolling ? undefined : { transform: SHOW[value || 1] }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className={`face ${FACE_CLASS[n]}`}>
            {Array.from({ length: 9 }, (_, i) => <span key={i} className={PIPS[n].includes(i) ? 'pip' : ''} />)}
          </div>
        ))}
      </div>
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
