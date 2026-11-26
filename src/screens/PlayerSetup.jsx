import { Screen } from '../components/Layout.jsx';
import { AVATARS, BOT_AVATAR, COLORS, COLOR_KEYS, defaultName } from '../theme.js';

function Token({ color, avatar }) {
  return (
    <span className="token-preview" style={{ background: COLORS[color].hex }}>{avatar}</span>
  );
}

export default function PlayerSetup({ humans, count, onChange, onBack, onNext }) {
  const active = humans.slice(0, count);
  const usedColors = active.map((p) => p.color);
  const usedAvatars = active.map((p) => p.avatar);
  const botColor = COLOR_KEYS.find((c) => !usedColors.includes(c));

  const update = (i, patch) => onChange(humans.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  return (
    <Screen
      title="Player setup"
      subtitle="Each player picks a name, avatar and token colour"
      step="3/4"
      onBack={onBack}
      footer={<button className="btn primary big" onClick={onNext}>Continue to settings</button>}
    >
      {active.map((p, i) => {
        const free = COLOR_KEYS.filter((c) => c === p.color || !usedColors.includes(c));
        return (
          <section className="card player-card" key={i}>
            <div className="player-head">
              <Token color={p.color} avatar={p.avatar} />
              <input
                className="text-input"
                value={p.name}
                maxLength={15}
                placeholder={defaultName(i)}
                onChange={(e) => update(i, { name: e.target.value })}
                aria-label={`Player ${i + 1} name`}
              />
              <small className="count">{p.name.length}/15</small>
            </div>

            <div className="label">Token colour</div>
            <div className="chips">
              {COLOR_KEYS.map((c) => {
                const taken = !free.includes(c);
                return (
                  <button
                    key={c}
                    disabled={taken}
                    className={`swatch ${p.color === c ? 'on' : ''}`}
                    style={{ background: COLORS[c].hex }}
                    onClick={() => update(i, { color: c })}
                    aria-label={`${COLORS[c].name}${taken ? ' (taken)' : ''}`}
                  >
                    {taken ? '✕' : p.color === c ? '✔' : ''}
                  </button>
                );
              })}
            </div>
            <small className="hint">Free colours: {free.map((c) => COLORS[c].name).join(', ')}</small>

            <div className="label">Avatar</div>
            <div className="chips">
              {AVATARS.map((a) => {
                const taken = a !== p.avatar && usedAvatars.includes(a);
                return (
                  <button
                    key={a}
                    disabled={taken}
                    className={`avatar-btn ${p.avatar === a ? 'on' : ''}`}
                    onClick={() => update(i, { avatar: a })}
                  >{a}</button>
                );
              })}
            </div>
          </section>
        );
      })}

      {count === 1 && (
        <section className="card player-card bot">
          <div className="player-head">
            <Token color={botColor} avatar={BOT_AVATAR} />
            <strong>Computer</strong>
            <small className="count">{COLORS[botColor].name} token</small>
          </div>
          <small className="hint">Your opponent. Choose its skill level on the next screen.</small>
        </section>
      )}
    </Screen>
  );
}
