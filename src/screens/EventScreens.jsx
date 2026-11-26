import { Sheet } from '../components/Layout.jsx';
import { getQuestion } from '../services/QuestionService.js';
import { correctIndex } from '../engine/GameEngine.js';

export function QuizScreen({ game, player, canAnswer, onAnswer, onContinue }) {
  const pend = game.pending;
  const q = getQuestion(pend.questionId, game.settings.language);
  const done = pend.answered;
  const right = correctIndex(pend, q);
  return (
    <Sheet tone="quiz">
      <div className="event-head">
        <span className="cat">{q.categoryInfo.icon} {q.categoryInfo.label}</span>
        <span className="who">{player.avatar} {player.name}</span>
      </div>
      <h2 className="question">{q.q}</h2>
      {game.settings.difficulty === 'easy' && !done && <p className="hint-box">💡 {q.hint}</p>}
      <div className="options">
        {pend.order.map((origIdx, i) => {
          let cls = 'option';
          if (done) {
            if (i === right) cls += ' correct';
            else if (i === done.choice) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} disabled={!canAnswer || !!done} onClick={() => onAnswer(i)}>
              <span className="letter">{'ABCD'[i]}</span>
              {q.options[origIdx]}
            </button>
          );
        })}
      </div>
      {!canAnswer && !done && <p className="note">Computer is thinking…</p>}
      {done && (
        <div className={`feedback ${done.correct ? 'ok' : 'bad'}`}>
          <strong>{done.correct ? `Correct! +${done.points} points` : 'Not quite. Keep learning!'}</strong>
          <p>{q.explanation}</p>
          {canAnswer && <button className="btn primary big" onClick={onContinue}>Continue</button>}
        </div>
      )}
    </Sheet>
  );
}

export function SnakeAlert({ pend, player, canContinue, onContinue }) {
  return (
    <Sheet tone="snake">
      <div className="event-badge bad" style={{ '--c': pend.color }}>
        <span className="event-emoji">{pend.icon}</span>
        <span className="event-snake">🐍</span>
      </div>
      <span className="chip bad">Snake alert · {pend.from} → {pend.to}</span>
      <h2>{pend.title}</h2>
      <p className="event-who">{player.avatar} {player.name} {pend.label.charAt(0).toLowerCase() + pend.label.slice(1)}</p>
      <div className="fact-box bad">
        <strong>AMR lesson</strong>
        <p>{pend.fact}</p>
      </div>
      {canContinue && <button className="btn danger big" onClick={onContinue}>Got it</button>}
    </Sheet>
  );
}

export function LadderReward({ pend, player, canContinue, onContinue }) {
  return (
    <Sheet tone="ladder">
      <div className="event-badge good">
        <span className="event-emoji">{pend.icon}</span>
        <span className="event-snake">🪜</span>
      </div>
      <span className="chip good">Health reward · {pend.from} → {pend.to}</span>
      <h2>{pend.title}</h2>
      <p className="event-who">{player.avatar} {player.name} {pend.label.charAt(0).toLowerCase() + pend.label.slice(1)}</p>
      <div className="fact-box good">
        <strong>AMR lesson · +{pend.points} points</strong>
        <p>{pend.fact}</p>
      </div>
      {canContinue && <button className="btn primary big" onClick={onContinue}>Awesome</button>}
    </Sheet>
  );
}

export function FinishModal({ pend, player, canContinue, onContinue }) {
  const medal = ['🥇', '🥈', '🥉'][pend.rank - 1] || '🏁';
  return (
    <Sheet tone="ladder">
      <div className="event-emoji">{medal}</div>
      <h2>{player.name} reached 100!</h2>
      <p>Finished in position <strong>{pend.rank}</strong>. Bonus <strong>+{pend.bonus}</strong> points.</p>
      {canContinue && <button className="btn primary big" onClick={onContinue}>Continue</button>}
    </Sheet>
  );
}
