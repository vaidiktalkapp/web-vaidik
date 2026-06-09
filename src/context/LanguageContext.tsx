'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../dictionaries/en.json';
import hi from '../dictionaries/hi.json';
import mr from '../dictionaries/mr.json';
import gu from '../dictionaries/gu.json';
import bn from '../dictionaries/bn.json';
import ta from '../dictionaries/ta.json';
import te from '../dictionaries/te.json';
import kn from '../dictionaries/kn.json';
import pa from '../dictionaries/pa.json';
import ml from '../dictionaries/ml.json';

type Locale = 'en' | 'hi' /* | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn' | 'pa' | 'ml' */;

const dictionaries = { en, hi /*, mr, gu, bn, ta, te, kn, pa, ml */ };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Detect language from localStorage or browser
    const savedLocale = localStorage.getItem('vaidik_locale') as Locale;
    const validLocales = Object.keys(dictionaries);
    
    if (savedLocale && validLocales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (validLocales.includes(browserLang)) {
        setLocaleState(browserLang as Locale);
      }
    }
    setIsReady(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('vaidik_locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = dictionaries[locale];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        // Fallback to English if key missing in current locale
        let fallback: any = dictionaries['en'];
        for (const fk of keys) {
            if (fallback && fallback[fk]) fallback = fallback[fk];
            else return key; 
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof result === 'string' ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {/* Optionally hide children until hydration is complete to prevent mismatch */}
      {isReady ? children : <div className="invisible">{children}</div>}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
