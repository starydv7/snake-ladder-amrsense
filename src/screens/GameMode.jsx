import { Screen } from '../components/Layout.jsx';

const MODES = [
  { id: 'single', icon: '🤖', title: 'Single Player', badge: 'Recommended', text: 'Play against the computer. Choose an easy, medium or challenging opponent.' },
  { id: 'local', icon: '👨‍👩‍👧‍👦', title: 'Local Multiplayer', text: 'Play with family, friends or colleagues on one phone. Supports 2–4 players.' },
  { id: 'challenge', icon: '🎓', title: 'AMR Learning Challenge', text: 'Knowledge-focused game with more AMR questions and educational rewards.' }
];

export default function GameMode({ value, onSelect, onBack, onNext }) {
  return (
    <Screen
      title="How would you like to play?"
      step="1/4"
      onBack={onBack}
      footer={<button className="btn primary big" onClick={onNext}>Continue</button>}
    >
      <div className="cards">
        {MODES.map((m) => (
          <button key={m.id} className={`card choice ${value === m.id ? 'selected' : ''}`} onClick={() => onSelect(m.id)}>
            <span className="emoji">{m.icon}</span>
            <span className="choice-body">
              <strong>{m.title} {m.badge && <em className="badge">{m.badge}</em>}</strong>
              <small>{m.text}</small>
            </span>
            <span className="tick">{value === m.id ? '✔' : ''}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
