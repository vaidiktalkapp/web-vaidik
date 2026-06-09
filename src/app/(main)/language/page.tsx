'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { Globe, Check, Star, Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LanguagePage() {
  const { locale, setLocale, t } = useTranslation();
  const router = useRouter();

  const langs = [
  { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { id: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { id: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }];


  const handleSelect = (id: any) => {
    setLocale(id);
    const selected = langs.find((l) => l.id === id);
    toast.success(`${t('common.save') || 'Saved'}: ${selected?.native}`);
    // Redirect after a short delay
    setTimeout(() => {
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center">
        
        <div className="w-20 h-20 bg-[#b8962e]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#b8962e]/20">
          <Languages className="w-10 h-10 text-[#b8962e]" />
        </div>
        
        <h1 className="serif text-4xl font-semibold text-gray-900 mb-3">{t('language.select_title')}</h1>
        <p className="text-gray-500 text-lg mb-12 max-w-md mx-auto">{t('language.select_desc')}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {langs.map((l) =>
          <motion.button
            key={l.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSelect(l.id)}
            className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-center text-center h-full ${
            locale === l.id ?
            'border-[#b8962e] bg-[#fffdf5] shadow-xl shadow-[#b8962e]/10' :
            'border-gray-100 bg-white hover:border-[#d6c89a]'}`
            }>
            
              {locale === l.id &&
            <div className="absolute top-3 right-3 bg-[#b8962e] rounded-full p-1 text-white">
                  <Check className="w-3 h-3" />
                </div>
            }
              
              <span className="text-2xl mb-3 block" role="img">{l.flag}</span>
              <h3 className="text-[17px] font-bold text-gray-900 mb-0.5">{l.native}</h3>
              <p className="text-[13px] font-medium text-[#b8962e]">{l.name}</p>
            </motion.button>
          )}
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
          <p>{t("language.more_languages_coming_soon")}</p>
        </div>
      </motion.div>
    </div>);

}