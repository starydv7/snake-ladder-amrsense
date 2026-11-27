import { Screen } from '../components/Layout.jsx';

const MODES = [
  { id: 'single', icon: '🤖', title: 'Play vs Computer', badge: 'Solo', text: 'You against a computer opponent. You choose how strong it is.' },
  { id: 'local', icon: '👨‍👩‍👧‍👦', title: 'Play with Friends & Family', badge: '2–4', text: 'Take turns on this one phone. You choose 2, 3 or 4 players.' },
  { id: 'challenge', icon: '🎓', title: 'AMR Learning Challenge', badge: 'Learn', text: 'More AMR questions. Play alone vs computer or with up to 4 players.' }
];

export default function GameMode({ value, onSelect, onBack, onNext }) {
  return (
    <Screen
      title="How do you want to play?"
      subtitle="Tap one option"
      step="1/4"
      onBack={onBack}
      footer={
        <button className="btn primary big" disabled={!value} onClick={onNext}>
          {value ? 'Continue' : 'Choose how to play'}
        </button>
      }
    >
      <div className="cards">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            className={`card choice ${value === m.id ? 'selected' : ''}`}
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => onSelect(m.id)}
            aria-pressed={value === m.id}
          >
            <span className="emoji">{m.icon}</span>
            <span className="choice-body">
              <strong>{m.title} <em className="badge">{m.badge}</em></strong>
              <small>{m.text}</small>
            </span>
            <span className="tick">{value === m.id ? '✔' : ''}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
