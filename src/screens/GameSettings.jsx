import { Screen } from '../components/Layout.jsx';
import { LEVELS } from '../data/levels.js';

function Group({ label, value, options, onChange }) {
  return (
    <section className="card setting">
      <div className="label">{label}</div>
      <div className="seg">
        {options.map((o) => (
          <button
            key={o.id}
            disabled={o.disabled}
            className={`seg-btn ${value === o.id ? 'on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            <strong>{o.title}</strong>
            <small>{o.text}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function LevelPicker({ value, unlocked, onChange }) {
  return (
    <section className="card setting">
      <div className="label">Level</div>
      <div className="levels">
        {LEVELS.map((l) => {
          const locked = l.n > unlocked;
          return (
            <button
              key={l.n}
              disabled={locked}
              className={`level-btn ${value === l.n ? 'on' : ''} ${locked ? 'locked' : ''}`}
              style={{ '--a': l.frame[0], '--b': l.frame[1] }}
              onClick={() => onChange(l.n)}
            >
              <span className="level-icon">{locked ? '🔒' : l.icon}</span>
              <strong>Level {l.n}</strong>
              <small>{l.name}</small>
            </button>
          );
        })}
      </div>
      <small className="hint">
        {LEVELS[value - 1].tagline}. Finish a level to unlock the next one.
      </small>
    </section>
  );
}

export default function GameSettings({ settings, unlocked, hasBot, onChange, onBack, onStart }) {
  const set = (k) => (v) => onChange({ ...settings, [k]: v });
  return (
    <Screen
      title="Customise your game"
      subtitle="Choose a level and how you want to play"
      step="4/4"
      onBack={onBack}
      footer={<button className="btn primary big" onClick={onStart}>🚀 Start Level {settings.level}</button>}
    >
      <LevelPicker value={settings.level} unlocked={unlocked} onChange={set('level')} />

      {hasBot && (
        <Group label="Computer skill" value={settings.botLevel} onChange={set('botLevel')} options={[
          { id: 'easy', title: 'Easy', text: 'Often wrong' },
          { id: 'medium', title: 'Medium', text: 'Sometimes wrong' },
          { id: 'hard', title: 'Hard', text: 'Usually right' }
        ]} />
      )}

      <Group label="AMR question frequency" value={settings.questionFrequency} onChange={set('questionFrequency')} options={[
        { id: 'light', title: 'Light', text: '5 questions' },
        { id: 'standard', title: 'Standard', text: '10 questions' },
        { id: 'learning', title: 'Learning', text: '20 questions' }
      ]} />

      <Group label="Game duration" value={settings.duration} onChange={set('duration')} options={[
        { id: 'quick', title: 'Quick', text: 'First to 100 wins' },
        { id: 'standard', title: 'Standard', text: 'Half the players finish' },
        { id: 'extended', title: 'Extended', text: 'Full ranking' }
      ]} />

      <Group label="Winning rule" value={settings.winningRule} onChange={set('winningRule')} options={[
        { id: 'exact_100', title: 'Exact 100', text: 'Need exact roll to finish' },
        { id: 'bounce', title: 'Bounce back', text: 'Overshoot bounces back' }
      ]} />

      <Group label="Extra roll on six" value={settings.extraRollOnSix ? 'on' : 'off'} onChange={(v) => onChange({ ...settings, extraRollOnSix: v === 'on' })} options={[
        { id: 'off', title: 'Off', text: 'Simple' },
        { id: 'on', title: 'On', text: 'Traditional' }
      ]} />

      <Group label="Language" value={settings.language} onChange={set('language')} options={[
        { id: 'en', title: 'English', text: 'Available' },
        { id: 'hi', title: 'हिन्दी', text: 'Coming soon', disabled: true },
        { id: 'kn', title: 'ಕನ್ನಡ', text: 'Coming soon', disabled: true }
      ]} />

      <section className="card setting row">
        <div>
          <strong>Sound effects</strong>
          <small>Dice, snakes, ladders</small>
        </div>
        <button className={`toggle ${settings.sound ? 'on' : ''}`} onClick={() => onChange({ ...settings, sound: !settings.sound })} aria-pressed={settings.sound} aria-label="Sound effects">
          <span />
        </button>
      </section>
    </Screen>
  );
}
