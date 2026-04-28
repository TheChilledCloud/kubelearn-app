'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { modules } from '@/data/courseContent';
import styles from './dashboard.module.css';
import uiStyles from '@/components/ui/styles.module.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const router = useRouter();

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
    const totalSteps = modules.find(m => m.id === moduleId).steps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>K8s</div>
          <h1>Learning Journey</h1>
        </div>
        <div className={styles.user}>
          <span>Welcome, <strong>{user.username}</strong></span>
          <button onClick={handleLogout} className={`${uiStyles.btn} ${uiStyles.secondary}`}>Logout</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.summary}>
          <div className={`${uiStyles.card} ${styles.statCard}`}>
            <h3>Modules Started</h3>
            <p className={styles.statNumber}>{progress.length}</p>
          </div>
          <div className={`${uiStyles.card} ${styles.statCard}`}>
            <h3>Total Score</h3>
            <p className={styles.statNumber}>
              {progress.reduce((acc, curr) => acc + curr.score, 0)}
            </p>
          </div>
          <div 
            className={`${uiStyles.card} ${styles.statCard} ${styles.quizCard}`}
            onClick={() => router.push('/quiz')}
            style={{ cursor: 'pointer' }}
          >
            <h3>Practice Quiz</h3>
            <p className={styles.statEmoji}>🧠</p>
            <span className={styles.quizLabel}>Test your knowledge →</span>
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
                  <span className={styles.badge}>{module.steps.length} Steps</span>
                </div>
                <p>{module.description}</p>
                
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>{completion}% Complete</span>
                </div>

                <button 
                  onClick={() => router.push(`/learn/${module.id}`)}
                  className={`${uiStyles.btn} ${uiStyles.primary} ${styles.startBtn}`}
                >
                  {completion > 0 ? 'Continue Learning' : 'Start Module'}
                </button>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
