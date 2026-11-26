import { Screen } from '../components/Layout.jsx';

const OPTIONS = [
  { n: 1, title: '1 Player', text: 'Play with computer' },
  { n: 2, title: '2 Players', text: 'You and a friend' },
  { n: 3, title: '3 Players', text: 'Three-way challenge' },
  { n: 4, title: '4 Players', text: 'Full group game' }
];

export default function PlayerCount({ mode, count, onSelect, onBack, onNext }) {
  const allowed = mode === 'local' ? [2, 3, 4] : [1, 2, 3, 4];
  const modeLabel = { single: 'Single player', local: 'Local multiplayer – same device', challenge: 'AMR Learning Challenge' }[mode];
  return (
    <Screen
      title="How many players are joining?"
      subtitle={`Game mode: ${modeLabel}`}
      step="2/4"
      onBack={onBack}
      footer={<button className="btn primary big" onClick={onNext}>Continue to player setup</button>}
    >
      <div className="grid2">
        {OPTIONS.map((o) => {
          const ok = allowed.includes(o.n);
          return (
            <button
              key={o.n}
              disabled={!ok}
              className={`card tile ${count === o.n ? 'selected' : ''}`}
              onClick={() => onSelect(o.n)}
            >
              <span className="big-num">{o.n}</span>
              <strong>{o.title}</strong>
              <small>{ok ? o.text : 'Not for this mode'}</small>
            </button>
          );
        })}
      </div>
      <p className="note">Players selected: <strong>{count}{count === 1 ? ' + computer' : ''}</strong>. You can customise each player on the next screen.</p>
    </Screen>
  );
}
