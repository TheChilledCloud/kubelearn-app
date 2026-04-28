'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { modules } from '@/data/courseContent';
import styles from './quiz.module.css';
import uiStyles from '@/components/ui/styles.module.css';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [finished, setFinished] = useState(false);

  const score = Object.keys(userAnswers).filter(
    k => userAnswers[k] === questions[k].answer
  ).length;
  const answered = Object.keys(userAnswers).length;

  useEffect(() => {
    const savedUser = localStorage.getItem('k8s_user');
    if (!savedUser) { router.push('/'); return; }
    setUser(JSON.parse(savedUser));
  }, [router]);

  const allQuizSteps = useMemo(() => {
    return modules.flatMap(m =>
      m.steps
        .filter(s => s.type === 'quiz')
        .map(s => ({ ...s, moduleName: m.title, moduleId: m.id }))
    );
  }, []);

  const toggleModule = (id) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedModules(modules.map(m => m.id));
  };

  const deselectAll = () => {
    setSelectedModules([]);
  };

  const startQuiz = () => {
    const filtered = allQuizSteps.filter(q => selectedModules.includes(q.moduleId));
    if (filtered.length === 0) return;
    // Shuffle questions and also shuffle options within each question
    const shuffled = shuffleArray(filtered).map(q => {
      // Create index mapping for option shuffle
      const indices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      const shuffledOptions = shuffledIndices.map(i => q.options[i]);
      const newAnswer = shuffledIndices.indexOf(q.answer);
      return { ...q, options: shuffledOptions, answer: newAnswer };
    });
    setQuestions(shuffled);
    setCurrentIdx(0);
    setUserAnswers({});
    setFinished(false);
    setQuizStarted(true);
  };

  const handleAnswer = (idx) => {
    if (userAnswers[currentIdx] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [currentIdx]: idx }));
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const exitQuiz = () => {
    setQuizStarted(false);
    setFinished(false);
    setCurrentIdx(0);
    setUserAnswers({});
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setFinished(false);
    setCurrentIdx(0);
    setUserAnswers({});
  };

  if (!user) return null;

  // Selection screen
  if (!quizStarted) {
    const quizCountByModule = modules.map(m => ({
      ...m,
      quizCount: m.steps.filter(s => s.type === 'quiz').length
    }));

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
            ← Back to Dashboard
          </button>
          <h1>Practice Quiz</h1>
        </header>

        <main className={styles.selectionMain}>
          <div className={styles.selectionCard}>
            <h2>Select Modules to Quiz</h2>
            <p className={styles.subtitle}>Choose which modules you want to be tested on. Questions will be randomized.</p>

            <div className={styles.selectActions}>
              <button onClick={selectAll} className={styles.selectActionBtn}>Select All</button>
              <button onClick={deselectAll} className={styles.selectActionBtn}>Deselect All</button>
            </div>

            <div className={styles.moduleList}>
              {quizCountByModule.map(m => (
                <label key={m.id} className={`${styles.moduleOption} ${selectedModules.includes(m.id) ? styles.moduleSelected : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(m.id)}
                    onChange={() => toggleModule(m.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.moduleInfo}>
                    <span className={styles.moduleName}>{m.title}</span>
                    <span className={styles.questionCount}>{m.quizCount} question{m.quizCount !== 1 ? 's' : ''}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className={styles.startArea}>
              <p className={styles.totalQuestions}>
                {allQuizSteps.filter(q => selectedModules.includes(q.moduleId)).length} questions selected
              </p>
              <button
                onClick={startQuiz}
                className={`${uiStyles.btn} ${uiStyles.primary} ${styles.startBtn}`}
                disabled={selectedModules.length === 0}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    let grade, gradeClass;
    if (pct >= 90) { grade = 'Excellent!'; gradeClass = styles.gradeExcellent; }
    else if (pct >= 70) { grade = 'Good Job!'; gradeClass = styles.gradeGood; }
    else if (pct >= 50) { grade = 'Keep Practicing'; gradeClass = styles.gradeOk; }
    else { grade = 'Study More'; gradeClass = styles.gradeLow; }

    return (
      <div className={styles.container}>
        <main className={styles.resultsMain}>
          <div className={`${styles.resultsCard} fade-in`}>
            <h1>Quiz Complete!</h1>
            <div className={`${styles.gradeCircle} ${gradeClass}`}>
              <span className={styles.gradePercent}>{pct}%</span>
            </div>
            <p className={styles.gradeLabel}>{grade}</p>
            <p className={styles.scoreLine}>{score} / {questions.length} correct</p>
            <div className={styles.resultActions}>
              <button onClick={restartQuiz} className={`${uiStyles.btn} ${uiStyles.primary}`}>
                Try Again
              </button>
              <button onClick={() => router.push('/dashboard')} className={`${uiStyles.btn} ${uiStyles.secondary}`}>
                Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz question screen
  const q = questions[currentIdx];
  const selected = userAnswers[currentIdx] !== undefined ? userAnswers[currentIdx] : null;
  const isCorrect = selected !== null ? selected === q.answer : null;

  return (
    <div className={styles.container}>
      <header className={styles.quizHeader}>
        <button onClick={exitQuiz} className={styles.exitBtn}>
          ✕ Exit Quiz
        </button>
        <div className={styles.quizProgress}>
          <span>Question {currentIdx + 1} / {questions.length}</span>
          <div className={styles.quizProgressBar}>
            <div className={styles.quizProgressFill} style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className={styles.scoreDisplay}>Score: {score} / {answered}</div>
      </header>

      <main className={styles.quizMain}>
        <div className={`${styles.questionCard} fade-in`} key={q.id}>
          <span className={styles.moduleTag}>{q.moduleName}</span>
          <h2>{q.question}</h2>
          <div className={styles.qOptions}>
            {q.options.map((opt, i) => {
              let cls = styles.qOption;
              if (selected !== null) {
                if (i === q.answer) cls += ` ${styles.qCorrect}`;
                else if (i === selected && !isCorrect) cls += ` ${styles.qWrong}`;
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                  <span className={styles.qLetter}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className={`${styles.qExplanation} fade-in`}>
              <div className={isCorrect ? styles.qExpCorrect : styles.qExpWrong}>
                <strong>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
                {!isCorrect && <p>The correct answer is: <strong>{q.options[q.answer]}</strong></p>}
                {q.explanation && <p className={styles.qExpText}>{q.explanation}</p>}
              </div>
            </div>
          )}

          <div className={styles.quizNavButtons}>
            <button
              onClick={prevQuestion}
              className={`${uiStyles.btn} ${uiStyles.secondary} ${styles.prevBtn}`}
              disabled={currentIdx === 0}
            >
              ← Previous
            </button>
            
            {(selected !== null || currentIdx + 1 < questions.length) && (
              <button
                onClick={nextQuestion}
                className={`${uiStyles.btn} ${uiStyles.primary} ${styles.nextBtn}`}
                disabled={selected === null && currentIdx + 1 >= questions.length}
              >
                {currentIdx + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
