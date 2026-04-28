'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { modules } from '@/data/courseContent';
import { Flashcard, QuizQuestion, TerminalTyping, ProblemScenario } from '@/components/learning';
import styles from './learn.module.css';
import uiStyles from '@/components/ui/styles.module.css';

export default function LearnPage() {
  const router = useRouter();
  const { moduleId } = useParams();
  const [user, setUser] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [moduleProgress, setModuleProgress] = useState(null);

  const module = modules.find(m => m.id === moduleId);

  useEffect(() => {
    if (!module) { router.push('/dashboard'); return; }
    const savedUser = localStorage.getItem('k8s_user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);

    fetch(`/api/progress?userId=${userData.id}`)
      .then(res => res.json())
      .then(data => {
        const p = data.find(item => item.module_id === moduleId);
        if (p) {
          setModuleProgress(p);
          const saved = JSON.parse(p.completed_steps);
          setCompletedSteps(new Set(saved));
          setCurrentStepIdx(saved.length >= module.steps.length ? 0 : saved.length);
        }
      });
  }, [router, moduleId, module]);

  const stepCompleted = completedSteps.has(module?.steps[currentStepIdx]?.id);

  const handleStepComplete = async (scoreDelta = 0) => {
    const currentStep = module.steps[currentStepIdx];
    if (completedSteps.has(currentStep.id)) return; // Already done

    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep.id);
    setCompletedSteps(newCompleted);

    const isLastStep = currentStepIdx === module.steps.length - 1;
    const newScore = (moduleProgress?.score || 0) + scoreDelta;

    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        moduleId: module.id,
        stepId: currentStep.id,
        score: newScore,
        totalScore: module.steps.length * 10,
        completed: isLastStep
      }),
    });
  };

  const goToStep = useCallback((idx) => {
    if (idx < 0 || idx >= module.steps.length) return;
    setCurrentStepIdx(idx);
  }, [module]);

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const nextStep = () => {
    const isLastStep = currentStepIdx === module.steps.length - 1;
    if (isLastStep) {
      router.push('/dashboard');
    } else {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'ArrowRight' && stepCompleted) nextStep();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!module || !user) return null;

  const currentStep = module.steps[currentStepIdx];
  const isLastStep = currentStepIdx === module.steps.length - 1;
  const isFirstStep = currentStepIdx === 0;
  const progressPct = ((completedSteps.size) / module.steps.length) * 100;

  const getBadgeClass = (type) => {
    switch (type) {
      case 'concept': return styles.badgeConcept;
      case 'quiz': return styles.badgeQuiz;
      case 'typing': return styles.badgeTyping;
      case 'problem': return styles.badgeProblem;
      default: return '';
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case 'concept': return '📖 Concept';
      case 'quiz': return '❓ Quiz';
      case 'typing': return '⌨️ Practice';
      case 'problem': return '🔧 Problem';
      default: return type;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <div className={styles.progressHeader}>
          <h2>{module.title}</h2>
          <div className={styles.stepIndicator}>
            Step {currentStepIdx + 1} of {module.steps.length}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className={styles.progressBarWrap}>
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Step dots */}
      <div className={styles.stepDots}>
        {module.steps.map((step, i) => {
          let dotClass = styles.stepDot;
          if (i === currentStepIdx) dotClass += ` ${styles.stepDotActive}`;
          else if (completedSteps.has(step.id)) dotClass += ` ${styles.stepDotCompleted}`;
          return (
            <button
              key={step.id}
              className={dotClass}
              onClick={() => goToStep(i)}
              title={`${i + 1}. ${step.title}`}
              aria-label={`Go to step ${i + 1}: ${step.title}`}
            />
          );
        })}
      </div>

      <main className={styles.content}>
        <div className={`${styles.stepCard} fade-in`} key={currentStep.id}>
          <div style={{ textAlign: 'center' }}>
            <span className={`${styles.stepTypeBadge} ${getBadgeClass(currentStep.type)}`}>
              {getBadgeLabel(currentStep.type)}
            </span>
          </div>
          <h1>{currentStep.title}</h1>

          {currentStep.type === 'concept' && (
            <div className={styles.conceptWrapper}>
              <div className={styles.conceptText}>
                {currentStep.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {currentStep.flashcards && (
                <div className={styles.flashcardsGrid}>
                  {currentStep.flashcards.map((fc, i) => (
                    <Flashcard key={i} front={fc.front} back={fc.back} />
                  ))}
                </div>
              )}
              {!stepCompleted && (
                <button
                  onClick={() => handleStepComplete(10)}
                  className={`${uiStyles.btn} ${uiStyles.primary} ${styles.actionBtn}`}
                >
                  I've read and understood
                </button>
              )}
            </div>
          )}

          {currentStep.type === 'quiz' && (
            <QuizQuestion
              key={currentStep.id}
              question={currentStep.question}
              options={currentStep.options}
              correctIndex={currentStep.answer}
              explanation={currentStep.explanation}
              onAnswer={(idx) => {
                const correct = idx === currentStep.answer;
                if (correct) handleStepComplete(20);
                else handleStepComplete(0);
                return correct;
              }}
            />
          )}

          {currentStep.type === 'typing' && (
            <TerminalTyping
              key={currentStep.id}
              instruction={currentStep.instruction}
              expected={currentStep.command}
              hint={currentStep.hint}
              onComplete={() => handleStepComplete(30)}
            />
          )}

          {currentStep.type === 'problem' && (
            <ProblemScenario
              key={currentStep.id}
              scenario={currentStep.scenario}
              steps={currentStep.diagnosticSteps}
              solution={currentStep.solution}
              takeaways={currentStep.takeaways}
              onComplete={() => handleStepComplete(25)}
            />
          )}

          {stepCompleted && (
            <div className={`${styles.footer} fade-in`}>
              <div className={styles.successMsg}>
                {isLastStep ? '🎉 Module Completed!' : '✨ Great job! Ready for the next step?'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom navigation bar */}
      <nav className={styles.navBar}>
        <button
          className={styles.navBtn}
          onClick={prevStep}
          disabled={isFirstStep}
        >
          ← Previous
        </button>
        <span className={styles.navCenter}>
          {currentStepIdx + 1} / {module.steps.length}
        </span>
        <button
          className={`${styles.navBtn} ${stepCompleted ? styles.navBtnPrimary : ''}`}
          onClick={nextStep}
          disabled={!stepCompleted}
        >
          {isLastStep ? '✓ Finish' : 'Next →'}
        </button>
      </nav>
    </div>
  );
}
