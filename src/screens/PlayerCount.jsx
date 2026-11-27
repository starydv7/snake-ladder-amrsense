import { Screen } from '../components/Layout.jsx';

const OPTIONS = [
  { n: 1, icon: '🤖', title: 'Me vs Computer', text: 'One player + computer' },
  { n: 2, icon: '👫', title: '2 Players', text: 'You and a friend' },
  { n: 3, icon: '👨‍👩‍👦', title: '3 Players', text: 'Three-way challenge' },
  { n: 4, icon: '👨‍👩‍👧‍👦', title: '4 Players', text: 'Full group game' }
];

export default function PlayerCount({ mode, count, onSelect, onBack, onNext }) {
  const options = mode === 'local' ? OPTIONS.filter((o) => o.n > 1) : OPTIONS;
  const modeLabel = { local: 'Friends & Family – same phone', challenge: 'AMR Learning Challenge' }[mode];
  return (
    <Screen
      title="Who is playing?"
      subtitle={modeLabel}
      step="2/4"
      onBack={onBack}
      footer={
        <button className="btn primary big" disabled={!count} onClick={onNext}>
          {count ? 'Continue to player setup' : 'Choose number of players'}
        </button>
      }
    >
      <div className="grid2">
        {options.map((o, i) => (
          <button
            key={o.n}
            className={`card tile ${count === o.n ? 'selected' : ''}`}
            style={{ animationDelay: `${i * 0.07}s` }}
            onClick={() => onSelect(o.n)}
            aria-pressed={count === o.n}
          >
            <span className="tile-icon">{o.icon}</span>
            <strong>{o.title}</strong>
            <small>{o.text}</small>
          </button>
        ))}
      </div>
      <p className="note">
        {count ? `${count === 1 ? 'You will play against the computer.' : `${count} players will share this phone.`} Each player chooses an avatar and colour next.` : 'Nothing is selected yet. Tap a card.'}
      </p>
    </Screen>
  );
}
