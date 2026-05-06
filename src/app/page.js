'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import uiStyles from '@/components/ui/styles.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { getUI } from '@/i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { language } = useLanguage();
  const t = getUI(language);

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
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.langSwitcherWrap}>
        <LanguageSwitcher />
      </div>
      <div className={styles.hero}>
        <h1 className="fade-in">{t.heroTitle} <span className={styles.accent}>{t.heroAccent}</span></h1>
        <p className="fade-in" style={{ animationDelay: '0.1s' }}>
          {t.heroSubtitle}
        </p>

        <div className={`${uiStyles.card} ${styles.authCard} fade-in`} style={{ animationDelay: '0.2s' }}>
          <h2>{t.authTitle}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>{t.labelUsername}</label>
              <input 
                type="text" 
                className={uiStyles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.placeholderUsername}
                required
              />
            </div>
            <div className={styles.field}>
              <label>{t.labelPassword}</label>
              <input 
                type="password" 
                className={uiStyles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.placeholderPassword}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button 
              type="submit" 
              className={`${uiStyles.btn} ${uiStyles.primary} ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? t.btnProcessing : t.btnLogin}
            </button>
          </form>
          <p className={styles.hint}>{t.hintRegister}</p>
        </div>
      </div>
    </main>
  );
}
