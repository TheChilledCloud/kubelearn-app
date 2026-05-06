'use client';
import { useState, useRef } from 'react';
import styles from './learning.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { getUI } from '@/i18n';

export function Flashcard({ front, back }) {
  const [flipped, setFlipped] = useState(false);
  const { language } = useLanguage();
  const t = getUI(language);

  return (
    <div 
      className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className={styles.flashcardInner}>
        <div className={styles.flashcardFront}>
          <p>{front}</p>
          <span className={styles.hint}>{t.clickToFlip}</span>
        </div>
        <div className={styles.flashcardBack}>
          <p>{back}</p>
        </div>
      </div>
    </div>
  );
}

export function QuizQuestion({ question, options, correctIndex, explanation, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const { language } = useLanguage();
  const t = getUI(language);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = onAnswer(idx);
    setIsCorrect(correct);
  };

  return (
    <div className={styles.quiz}>
      <h3>{question}</h3>
      <div className={styles.options}>
        {options.map((opt, i) => {
          let cls = styles.option;
          if (selected !== null) {
            if (i === correctIndex) cls += ` ${styles.correct}`;
            else if (i === selected && !isCorrect) cls += ` ${styles.wrong}`;
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)}>
              <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`${styles.explanation} fade-in`}>
          <div className={isCorrect ? styles.explanationCorrect : styles.explanationWrong}>
            <strong>{isCorrect ? t.answerCorrect : t.answerIncorrect}</strong>
            {!isCorrect && (
              <p>{t.correctAnswerIs} <strong>{options[correctIndex]}</strong></p>
            )}
            {explanation && <p className={styles.explanationText}>{explanation}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function TerminalTyping({ instruction, expected, hint, onComplete }) {
  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);
  const { language } = useLanguage();
  const t = getUI(language);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim() === expected.trim()) {
      setCompleted(true);
      onComplete();
    }
  };

  const handleHintClick = (e) => {
    e.preventDefault();
    setHintLevel(prev => prev + 1);
    // Refocus the input after hint button interaction
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  };

  const getHintContent = () => {
    if (hintLevel === 0) return null;
    if (hintLevel === 1 && hint) {
      return <p className={styles.hintText}>{t.labelHint} {hint}</p>;
    }
    if (hintLevel === 1 && !hint) {
      const words = expected.split(' ');
      const partial = words.map((w, i) => i === 0 ? w : w[0] + '___').join(' ');
      return <p className={styles.hintText}>{t.labelPartial} <code>{partial}</code></p>;
    }
    if (hintLevel === 2) {
      const words = expected.split(' ');
      const partial = words.map((w, i) => i === 0 ? w : w[0] + '___').join(' ');
      return <p className={styles.hintText}>{t.labelPartial} <code>{partial}</code></p>;
    }
    if (hintLevel >= 3) {
      return (
        <div className={styles.revealedAnswer}>
          <p>{t.labelAnswer}</p>
          <code className={styles.answerCode}>{expected}</code>
          <p className={styles.revealNote}>{t.labelTypeAbove}</p>
        </div>
      );
    }
    return null;
  };

  const maxHint = hint ? 3 : 2;
  const hintLabels = hint
    ? [t.btnShowHint, t.btnShowPartial, t.btnRevealAnswer]
    : [t.btnShowPartial, t.btnRevealAnswer];

  const getCharMatches = () => {
    if (!input || completed) return null;
    return (
      <div className={styles.charMatch}>
        {expected.split('').map((ch, i) => (
          <span key={i} className={
            i < input.length
              ? input[i] === ch ? styles.charCorrect : styles.charWrong
              : styles.charPending
          }>{i < input.length ? input[i] : '·'}</span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <div className={styles.dots}><span/><span/><span/></div>
        <span className={styles.title}>{t.terminalTitle}</span>
      </div>
      <div className={styles.terminalBody}>
        <p className={styles.instruction}># {instruction}</p>
        <div className={styles.promptLine}>
          <span className={styles.prompt}>$</span>
          <input 
            ref={inputRef}
            type="text"
            className={styles.terminalInput}
            value={input}
            onChange={handleChange}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        {getCharMatches()}
        {completed && <p className={styles.success}>{t.cmdCorrect}</p>}
        {!completed && (
          <div className={styles.hintArea}>
            {getHintContent()}
            {hintLevel < maxHint && (
              <button
                className={styles.hintBtn}
                onMouseDown={handleHintClick}
                tabIndex={-1}
              >
                {hintLabels[Math.min(hintLevel, hintLabels.length - 1)]}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DiagStepInput({ step, onComplete }) {
  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);
  const { language } = useLanguage();
  const t = getUI(language);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim() === step.command.trim()) {
      setCompleted(true);
      onComplete();
    }
  };

  const handleHintClick = (e) => {
    e.preventDefault();
    setHintLevel(prev => prev + 1);
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 0);
  };

  const getPartial = () => {
    const words = step.command.split(' ');
    return words.map((w, i) => i === 0 ? w : w[0] + '___').join(' ');
  };

  const getHintContent = () => {
    if (hintLevel === 0) return null;
    if (hintLevel === 1) {
      return <p className={styles.diagHint}>{t.labelHint} {step.hint}</p>;
    }
    if (hintLevel === 2) {
      return <p className={styles.diagHint}>{t.labelPartial} <code className={styles.diagHintCode}>{getPartial()}</code></p>;
    }
    if (hintLevel >= 3) {
      return (
        <div className={styles.diagReveal}>
          <p>{t.labelAnswer}</p>
          <code className={styles.answerCode}>{step.command}</code>
          <p className={styles.revealNote}>{t.labelTypeAbove}</p>
        </div>
      );
    }
    return null;
  };

  const hintLabels = [t.btnShowHint, t.btnShowPartial, t.btnRevealAnswer];

  if (completed) return null;

  return (
    <div className={styles.diagTerminal}>
      <div className={styles.diagPromptLine}>
        <span className={styles.prompt}>$</span>
        <input
          ref={inputRef}
          type="text"
          className={styles.terminalInput}
          value={input}
          onChange={handleChange}
          placeholder={t.placeholderTypeCmd}
          autoFocus
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      {/* Character match */}
      {input && (
        <div className={styles.charMatch}>
          {step.command.split('').map((ch, i) => (
            <span key={i} className={
              i < input.length
                ? input[i] === ch ? styles.charCorrect : styles.charWrong
                : styles.charPending
            }>{i < input.length ? input[i] : '·'}</span>
          ))}
        </div>
      )}
      <div className={styles.hintArea}>
        {getHintContent()}
        {hintLevel < 3 && (
          <button
            className={styles.hintBtn}
            onMouseDown={handleHintClick}
            tabIndex={-1}
          >
            {hintLabels[Math.min(hintLevel, 2)]}
          </button>
        )}
      </div>
    </div>
  );
}

export function ProblemScenario({ scenario, steps, solution, takeaways, onComplete }) {
  const [currentDiagStep, setCurrentDiagStep] = useState(0);
  const [diagCompleted, setDiagCompleted] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [finished, setFinished] = useState(false);
  const { language } = useLanguage();
  const t = getUI(language);

  const allDiagDone = steps && diagCompleted.size >= steps.length;

  const handleDiagComplete = (idx) => {
    const newCompleted = new Set(diagCompleted);
    newCompleted.add(idx);
    setDiagCompleted(newCompleted);
  };

  const goNextDiag = () => {
    if (currentDiagStep < steps.length - 1) {
      setCurrentDiagStep(prev => prev + 1);
    }
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
    if (!finished) {
      setFinished(true);
      onComplete();
    }
  };

  return (
    <div className={styles.problemContainer}>
      {/* Scenario description */}
      <div className={styles.scenarioBox}>
        <div className={styles.scenarioIcon}>🚨</div>
        <h3 className={styles.scenarioTitle}>{t.scenarioLabel}</h3>
        <p className={styles.scenarioText}>{scenario}</p>
      </div>

      {/* Diagnostic steps */}
      {steps && steps.length > 0 && (
        <div className={styles.diagSection}>
          <h3 className={styles.diagTitle}>{t.diagTitle}</h3>
          <p className={styles.diagSubtitle}>{t.diagSubtitle}</p>

          <div className={styles.diagSteps}>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`${styles.diagStep} ${i === currentDiagStep ? styles.diagStepActive : ''} ${diagCompleted.has(i) ? styles.diagStepDone : ''}`}
              >
                <div className={styles.diagStepHeader}>
                  <span className={styles.diagStepNum}>
                    {diagCompleted.has(i) ? '✓' : i + 1}
                  </span>
                  <span className={styles.diagStepLabel}>{step.label}</span>
                </div>

                {i === currentDiagStep && !diagCompleted.has(i) && (
                  <DiagStepInput
                    step={step}
                    onComplete={() => handleDiagComplete(i)}
                  />
                )}

                {diagCompleted.has(i) && (
                  <div className={styles.diagResult}>
                    <code className={styles.diagCommand}>$ {step.command}</code>
                    {step.expectedOutput && (
                      <pre className={styles.diagOutput}>{step.expectedOutput}</pre>
                    )}
                  </div>
                )}

                {diagCompleted.has(i) && i === currentDiagStep && i < steps.length - 1 && (
                  <button className={styles.diagNextBtn} onClick={goNextDiag}>
                    {t.diagNextStep}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution reveal */}
      {(allDiagDone || !steps || steps.length === 0) && !showSolution && (
        <button
          className={styles.revealSolutionBtn}
          onClick={handleRevealSolution}
        >
          {t.btnRevealSolution}
        </button>
      )}

      {showSolution && (
        <div className={`${styles.solutionBox} fade-in`}>
          <h3 className={styles.solutionTitle}>{t.solutionTitle}</h3>
          <div className={styles.solutionContent}>
            {solution.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {takeaways && takeaways.length > 0 && (
            <div className={styles.takeawaysBox}>
              <h4 className={styles.takeawaysTitle}>{t.takeawaysTitle}</h4>
              <ul className={styles.takeawaysList}>
                {takeaways.map((tw, i) => (
                  <li key={i}>{tw}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
