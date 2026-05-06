'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getModules } from '@/data/courseContent';
import styles from './quiz.module.css';
import uiStyles from '@/components/ui/styles.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { getUI } from '@/i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

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
  const [userAnswers, setUserAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const { language } = useLanguage();
  const t = getUI(language);
  const modules = getModules(language);

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
  }, [modules]);

  const toggleModule = (id) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => { setSelectedModules(modules.map(m => m.id)); };
  const deselectAll = () => { setSelectedModules([]); };

  const startQuiz = () => {
    const filtered = allQuizSteps.filter(q => selectedModules.includes(q.moduleId));
    if (filtered.length === 0) return;
    const shuffled = shuffleArray(filtered).map(q => {
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

  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentIdx, questions.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const q = questions[currentIdx];
        const selected = userAnswers[currentIdx];
        if (selected !== undefined && q && selected === q.answer) {
          nextQuestion();
        }
      }
    };
    if (quizStarted && !finished) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [quizStarted, finished, currentIdx, questions, userAnswers, nextQuestion]);

  const prevQuestion = () => {
    if (currentIdx > 0) { setCurrentIdx(prev => prev - 1); }
  };

  const exitQuiz = () => { setQuizStarted(false); setFinished(false); setCurrentIdx(0); setUserAnswers({}); };
  const restartQuiz = () => { setQuizStarted(false); setFinished(false); setCurrentIdx(0); setUserAnswers({}); };

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
            {t.backToDashboard}
          </button>
          <h1>{t.quizTitle}</h1>
          <LanguageSwitcher />
        </header>

        <main className={styles.selectionMain}>
          <div className={styles.selectionCard}>
            <h2>{t.quizSelectModules}</h2>
            <p className={styles.subtitle}>{t.quizSubtitle}</p>

            <div className={styles.selectActions}>
              <button onClick={selectAll} className={styles.selectActionBtn}>{t.btnSelectAll}</button>
              <button onClick={deselectAll} className={styles.selectActionBtn}>{t.btnDeselectAll}</button>
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
                    <span className={styles.questionCount}>{m.quizCount} {m.quizCount !== 1 ? t.questionPlural : t.questionSingular}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className={styles.startArea}>
              <p className={styles.totalQuestions}>
                {allQuizSteps.filter(q => selectedModules.includes(q.moduleId)).length} {t.questionsSelected}
              </p>
              <button
                onClick={startQuiz}
                className={`${uiStyles.btn} ${uiStyles.primary} ${styles.startBtn}`}
                disabled={selectedModules.length === 0}
              >
                {t.btnStartQuiz}
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
    if (pct >= 90) { grade = t.gradeExcellent; gradeClass = styles.gradeExcellent; }
    else if (pct >= 70) { grade = t.gradeGood; gradeClass = styles.gradeGood; }
    else if (pct >= 50) { grade = t.gradeOk; gradeClass = styles.gradeOk; }
    else { grade = t.gradeLow; gradeClass = styles.gradeLow; }

    return (
      <div className={styles.container}>
        <main className={styles.resultsMain}>
          <div className={`${styles.resultsCard} fade-in`}>
            <h1>{t.quizComplete}</h1>
            <div className={`${styles.gradeCircle} ${gradeClass}`}>
              <span className={styles.gradePercent}>{pct}%</span>
            </div>
            <p className={styles.gradeLabel}>{grade}</p>
            <p className={styles.scoreLine}>{score} / {questions.length} {t.quizCorrectOf}</p>
            <div className={styles.resultActions}>
              <button onClick={restartQuiz} className={`${uiStyles.btn} ${uiStyles.primary}`}>
                {t.btnTryAgain}
              </button>
              <button onClick={() => router.push('/dashboard')} className={`${uiStyles.btn} ${uiStyles.secondary}`}>
                {t.btnDashboard}
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
          {t.exitQuiz}
        </button>
        <div className={styles.quizProgress}>
          <span>{t.quizQuestion} {currentIdx + 1} / {questions.length}</span>
          <div className={styles.quizProgressBar}>
            <div className={styles.quizProgressFill} style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className={styles.scoreDisplay}>{t.quizScore}: {score} / {answered}</div>
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
                <strong>{isCorrect ? t.answerCorrect : t.answerIncorrect}</strong>
                {!isCorrect && <p>{t.correctAnswerIs} <strong>{q.options[q.answer]}</strong></p>}
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
              {t.btnPrevQuestion}
            </button>
            
            {(selected !== null || currentIdx + 1 < questions.length) && (
              <button
                onClick={nextQuestion}
                className={`${uiStyles.btn} ${uiStyles.primary} ${styles.nextBtn}`}
                disabled={selected === null && currentIdx + 1 >= questions.length}
              >
                {currentIdx + 1 >= questions.length ? t.btnSeeResults : t.btnNextQuestion}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
