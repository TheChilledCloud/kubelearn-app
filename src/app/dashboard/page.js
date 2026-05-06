'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getModules } from '@/data/courseContent';
import styles from './dashboard.module.css';
import uiStyles from '@/components/ui/styles.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { getUI } from '@/i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const router = useRouter();
  const { language } = useLanguage();
  const t = getUI(language);
  const modules = getModules(language);

  useEffect(() => {
    const savedUser = localStorage.getItem('k8s_user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);

    fetch(`/api/progress?userId=${userData.id}`)
      .then(res => res.json())
      .then(data => setProgress(data));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('k8s_user');
    router.push('/');
  };

  const getModuleProgress = (moduleId) => {
    const p = progress.find(item => item.module_id === moduleId);
    if (!p) return 0;
    const completedSteps = JSON.parse(p.completed_steps).length;
    const totalSteps = modules.find(m => m.id === moduleId)?.steps.length || 1;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>K8s</div>
          <h1>{t.dashTitle}</h1>
        </div>
        <div className={styles.user}>
          <LanguageSwitcher />
          <span>{t.dashWelcome} <strong>{user.username}</strong></span>
          <button onClick={handleLogout} className={`${uiStyles.btn} ${uiStyles.secondary}`}>{t.btnLogout}</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.summary}>
          <div className={`${uiStyles.card} ${styles.statCard}`}>
            <h3>{t.statModulesStarted}</h3>
            <p className={styles.statNumber}>{progress.length}</p>
          </div>
          <div className={`${uiStyles.card} ${styles.statCard}`}>
            <h3>{t.statTotalScore}</h3>
            <p className={styles.statNumber}>
              {progress.reduce((acc, curr) => acc + curr.score, 0)}
            </p>
          </div>
          <div 
            className={`${uiStyles.card} ${styles.statCard} ${styles.quizCard}`}
            onClick={() => router.push('/quiz')}
            style={{ cursor: 'pointer' }}
          >
            <h3>{t.statPracticeQuiz}</h3>
            <p className={styles.statEmoji}>🧠</p>
            <span className={styles.quizLabel}>{t.statTestKnowledge}</span>
          </div>
        </section>

        <section className={styles.moduleGrid}>
          {modules.map((module, i) => {
            const completion = getModuleProgress(module.id);
            return (
              <div 
                key={module.id} 
                className={`${uiStyles.card} ${styles.moduleCard} fade-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={styles.moduleHeader}>
                  <h2>{module.title}</h2>
                  <span className={styles.badge}>{module.steps.length} {t.stepsLabel}</span>
                </div>
                <p>{module.description}</p>
                
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>{completion}{t.percentComplete}</span>
                </div>

                <button 
                  onClick={() => router.push(`/learn/${module.id}`)}
                  className={`${uiStyles.btn} ${uiStyles.primary} ${styles.startBtn}`}
                >
                  {completion > 0 ? t.btnContinue : t.btnStartModule}
                </button>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
