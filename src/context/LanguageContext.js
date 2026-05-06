'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  // Load saved language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('k8s_language');
    if (saved && (saved === 'en' || saved === 'de')) {
      setLanguage(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  // Persist language choice and update <html lang="...">
  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('k8s_language', lang);
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
