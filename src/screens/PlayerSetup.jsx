import { Screen } from '../components/Layout.jsx';
import { AVATAR_GROUPS, BOT_AVATARS, COLORS, COLOR_KEYS, defaultName } from '../theme.js';

function Token({ color, avatar }) {
  if (!avatar) return <span className="token-preview empty">?</span>;
  return (
    <span className="token-preview pop-in" key={`${avatar}${color}`} style={{ background: color ? COLORS[color].hex : '#cfd8d4' }}>
      {avatar}
    </span>
  );
}

function ColorPicker({ value, taken, onPick }) {
  return (
    <div className="reveal">
      <div className="label">Step 2 · Choose token colour</div>
      <div className="chips">
        {COLOR_KEYS.map((c) => {
          const isTaken = taken.includes(c);
          return (
            <button
              key={c}
              disabled={isTaken}
              className={`swatch ${value === c ? 'on' : ''}`}
              style={{ background: COLORS[c].hex }}
              onClick={() => onPick(c)}
              aria-label={`${COLORS[c].name}${isTaken ? ' (taken by another player)' : ''}`}
              title={COLORS[c].name}
            >
              {isTaken ? '✕' : value === c ? '✔' : ''}
            </button>
          );
        })}
      </div>
      {value ? (
        <small className="hint">Colour: {COLORS[value].name}</small>
      ) : (
        <small className="hint">Colours marked ✕ are taken by another player.</small>
      )}
    </div>
  );
}

function AvatarPicker({ groups, value, taken, onPick }) {
  return (
    <div>
      <div className="label">Step 1 · Choose avatar</div>
      {groups.map((g) => (
        <div key={g.id} className="avatar-group">
          {g.label && <small className="group-label">{g.label}</small>}
          <div className="chips">
            {g.items.map((a) => {
              const isTaken = a.e !== value && taken.includes(a.e);
              return (
                <button
                  key={a.e}
                  disabled={isTaken}
                  className={`avatar-btn ${value === a.e ? 'on' : ''}`}
                  onClick={() => onPick(a.e)}
                  aria-label={`${a.n}${isTaken ? ' (taken)' : ''}`}
                  title={a.n}
                >
                  {a.e}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlayerSetup({ players, count, bot, onChange, onBotChange, onBack, onNext }) {
  const active = players.slice(0, count);
  const hasBot = count === 1;
  const allColors = [...active.map((p) => p.color), hasBot ? bot.color : null].filter(Boolean);
  const allAvatars = [...active.map((p) => p.avatar), hasBot ? bot.avatar : null].filter(Boolean);

  const update = (i, patch) => onChange(players.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const ready = active.filter((p) => p.avatar && p.color).length + (hasBot && bot.avatar && bot.color ? 1 : 0);
  const total = count + (hasBot ? 1 : 0);
  const allReady = ready === total;

  return (
    <Screen
      title="Create your players"
      subtitle="Every player picks an avatar, then a colour"
      step="3/4"
      onBack={onBack}
      footer={
        <button className="btn primary big" disabled={!allReady} onClick={onNext}>
          {allReady ? 'Continue to settings' : `${ready} of ${total} ready · pick avatar & colour`}
        </button>
      }
    >
      {active.map((p, i) => {
        const done = p.avatar && p.color;
        return (
          <section className={`card player-card ${done ? 'is-ready' : ''}`} key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="player-head">
              <Token color={p.color} avatar={p.avatar} />
              <input
                className="text-input"
                value={p.name}
                maxLength={15}
                placeholder={`${defaultName(i)} (name optional)`}
                onChange={(e) => update(i, { name: e.target.value })}
                aria-label={`Player ${i + 1} name`}
              />
              <span className={`ready-chip ${done ? 'ok' : ''}`}>{done ? '✔ Ready' : `P${i + 1}`}</span>
            </div>

            <AvatarPicker
              groups={AVATAR_GROUPS}
              value={p.avatar}
              taken={allAvatars}
              onPick={(a) => update(i, { avatar: a })}
            />

            {p.avatar && (
              <ColorPicker
                value={p.color}
                taken={allColors.filter((c) => c !== p.color)}
                onPick={(c) => update(i, { color: c })}
              />
            )}
          </section>
        );
      })}

      {hasBot && (
        <section className={`card player-card bot ${bot.avatar && bot.color ? 'is-ready' : ''}`}>
          <div className="player-head">
            <Token color={bot.color} avatar={bot.avatar} />
            <div className="bot-title">
              <strong>Computer opponent</strong>
              <small>You choose its look too</small>
            </div>
            <span className={`ready-chip ${bot.avatar && bot.color ? 'ok' : ''}`}>{bot.avatar && bot.color ? '✔ Ready' : 'CPU'}</span>
          </div>
          <AvatarPicker
            groups={[{ id: 'bots', label: '', items: BOT_AVATARS }]}
            value={bot.avatar}
            taken={allAvatars}
            onPick={(a) => onBotChange({ ...bot, avatar: a })}
          />
          {bot.avatar && (
            <ColorPicker
              value={bot.color}
              taken={allColors.filter((c) => c !== bot.color)}
              onPick={(c) => onBotChange({ ...bot, color: c })}
            />
          )}
        </section>
      )}
    </Screen>
  );
}
