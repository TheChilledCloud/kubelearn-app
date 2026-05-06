'use client';
import { useLanguage } from '@/context/LanguageContext';
import styles from './languageSwitcher.module.css';

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.langBtn} ${language === 'en' ? styles.active : ''}`}
        onClick={() => switchLanguage('en')}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        className={`${styles.langBtn} ${language === 'de' ? styles.active : ''}`}
        onClick={() => switchLanguage('de')}
        aria-label="Auf Deutsch wechseln"
      >
        DE
      </button>
    </div>
  );
}
