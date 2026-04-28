'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import uiStyles from '@/components/ui/styles.module.css';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('k8s_user');
    if (user) router.push('/dashboard');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('k8s_user', JSON.stringify(data));
        router.push('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className="fade-in">Master <span className={styles.accent}>Kubernetes</span></h1>
        <p className="fade-in" style={{ animationDelay: '0.1s' }}>
          Interactive learning for K8s and K9s mastery. 
          Quizzes, flashcards, and real terminal simulations.
        </p>

        <div className={`${uiStyles.card} ${styles.authCard} fade-in`} style={{ animationDelay: '0.2s' }}>
          <h2>Start Your Journey</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Username</label>
              <input 
                type="text" 
                className={uiStyles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input 
                type="password" 
                className={uiStyles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button 
              type="submit" 
              className={`${uiStyles.btn} ${uiStyles.primary} ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Login / Register'}
            </button>
          </form>
          <p className={styles.hint}>New here? Just enter a password to register.</p>
        </div>
      </div>
    </main>
  );
}
