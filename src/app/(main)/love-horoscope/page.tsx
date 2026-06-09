'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, History, User, Grid, ChevronLeft, Calendar, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import ZodiacGrid from '@/components/love-horoscope/ZodiacGrid';
import ZodiacResult from '@/components/love-horoscope/ZodiacResult';
import PersonalLoveForm from '@/components/love-horoscope/PersonalLoveForm';
import PersonalResult from '@/components/love-horoscope/PersonalResult';

import { astrologyService, AstrologyCalculationRequest } from '@/lib/astrologyService';
import { loveHoroscopeStorage } from '@/lib/loveHoroscopeStorage';

interface ZodiacResultData {
  sign: string;
  period: string;
  todayDate: string;
  vibeScore: string;
  vibeName: string;
  sections: any[];
  relationshipAdvice?: {title: string;content: string;};
  luckyElements?: {color: string;time: string;number: string;};
}

function LoveHoroscopeContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'zodiac'; // 'zodiac' | 'personal' | 'history'

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [view, setView] = useState<'selection' | 'result'>('selection');
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [dynamicProfiles, setDynamicProfiles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const loadProfiles = async () => {
      try {
        const res = await astrologyService.getZodiacProfiles();
        if (res.success && Array.isArray(res.data)) {
          setDynamicProfiles(res.data);
        }
      } catch (err) {
        console.log("Error loading zodiac profiles");
      }
    };
    loadProfiles();
  }, []);

  // Handle initial state and mode changes
  useEffect(() => {
    const saved = loveHoroscopeStorage.getData();
    if (saved && !result) {
      setResult(saved);
      setView('result');
    }
  }, [result]);

  useEffect(() => {
    if (mode === 'history') {
      loveHoroscopeStorage.getHistory().then(setHistory);
    }
  }, [mode]);

  // Also handle URL mode changes to reset view if needed
  useEffect(() => {
    if (mode === 'personal' && view === 'result' && !result?.input) {
      setView('selection');
    }
  }, [mode, view, result]);

  const handleZodiacSelect = async (sign: string, period: string = 'daily') => {
    try {
      setLoading(true);
      const response = await astrologyService.calculateZodiacLove(sign, period);
      if (response.success) {
        setResult(response.data);
        setView('result');
        loveHoroscopeStorage.saveData(response.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(response.message || 'Failed to fetch zodiac insights.');
      }
    } catch (err) {
      toast.error('The cosmic alignment was interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSubmit = async (formData: any) => {
    try {
      setLoading(true);
      const response = await astrologyService.calculateLoveHoroscope(formData);
      if (response.success) {
        const dataWithInput = { ...response.data, input: formData };
        setResult(dataWithInput);
        setView('result');
        loveHoroscopeStorage.saveData(dataWithInput);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(response.message || 'Failed to analyze your chart.');
      }
    } catch (err) {
      toast.error('Divine connection could not be established.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen love-page-content">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .love-page-content * { font-family: 'Source Sans 3', sans-serif; }
                .love-page-content .serif { font-family: 'Playfair Display', Georgia, serif; }
            ` }} />

            {/* 
           NOT sticky — just a normal top bar that scrolls with the page.
           This avoids conflicts with the site navbar entirely.
        */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-center px-4">
                <div
          className="inline-flex p-1 rounded-xl border border-[#d6c89a]"
          style={{ backgroundColor: 'rgba(253,246,227,0.95)' }}>
          
                    <button
            onClick={() => {router.push('/love-horoscope?mode=zodiac');setView('selection');setResult(null);}}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === 'zodiac' ? 'bg-[#b8962e] text-white shadow-sm' : 'text-gray-500 hover:text-[#b8962e]'}`
            }>
            
                        <Grid className="w-3.5 h-3.5" />{t("love_horoscope.zodiac")}
          </button>
                    <button
            onClick={() => {router.push('/love-horoscope?mode=personal');setView('selection');setResult(null);}}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === 'personal' ? 'bg-[#b8962e] text-white shadow-sm' : 'text-gray-500 hover:text-[#b8962e]'}`
            }>
            
                        <User className="w-3.5 h-3.5" />{t("love_horoscope.reading")}
          </button>
                    <button
            onClick={() => {router.push('/love-horoscope?mode=history');setView('selection');}}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            mode === 'history' ? 'bg-[#b8962e] text-white shadow-sm' : 'text-gray-500 hover:text-[#b8962e]'}`
            }>
            
                        <History className="w-3.5 h-3.5" />{t("love_horoscope.history")}
          </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ?
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-24">
          
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <Heart className="w-16 h-16 text-rose-200" />
                            <Loader2 className="w-7 h-7 text-[#b8962e] animate-spin absolute" />
                        </div>
                        <h3 className="mt-6 text-lg font-semibold text-gray-900 serif">{t("love_horoscope.consulting_the_cosmic_lovers")}</h3>
                        <p className="text-gray-400 text-xs mt-2 tracking-widest uppercase"></p>
                    </motion.div> :
        view === 'selection' ?
        <motion.div
          key="selection"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="w-full">
          
                        {mode === 'zodiac' && <ZodiacGrid onSelect={handleZodiacSelect} />}
                        {mode === 'personal' && <PersonalLoveForm onSubmit={handlePersonalSubmit} loading={loading} />}
                        {mounted && mode === 'history' &&
          <div className="max-w-4xl mx-auto px-4">
                                {/* History Header */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
                                        <History className="w-4 h-4" />
                                        <span className="serif">{t("love_horoscope.past_readings")}</span>
                                    </div>
                                    <h2 className="text-3xl font-semibold text-gray-900 serif mb-2">
{t("love_horoscope.your_romantic_history")}
              </h2>
                                    <div className="w-10 h-[1px] bg-[#d6c89a]" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {history.length === 0 ?
              <div className="col-span-full py-16 rounded-2xl border border-[#d6c89a] border-dashed text-center bg-transparent">
                                            <Heart className="w-10 h-10 text-[#d6c89a] mx-auto mb-3" />
                                            <p className="text-gray-400 text-sm uppercase tracking-widest">{t("love_horoscope.no_entries_found_in_the_divine")}</p>
                                        </div> :

              history.map((item: any, idx: number) =>
              <motion.button
                key={idx}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePersonalSubmit(item.input)}
                className="p-4 rounded-xl border border-[#d6c89a] bg-transparent hover:border-[#b8962e] text-left flex items-center justify-between group transition-all">
                
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border border-[#d6c89a] flex items-center justify-center text-[#b8962e] group-hover:bg-[#b8962e] group-hover:text-white group-hover:border-[#b8962e] transition-all flex-shrink-0 bg-transparent">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-[14px]">{item.name}</h4>
                                                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(item.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-[#b8962e] rotate-180 transition-colors" />
                                            </motion.button>
              )
              }
                                </div>
                            </div>
          }
                    </motion.div> :

        <motion.div
          key="result"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.4 }}
          className="w-full">
          
                        {result?.input ?
          <PersonalResult
            data={result}
            onBack={() => {setView('selection');window.scrollTo({ top: 0, behavior: 'smooth' });}}
            onReset={() => {loveHoroscopeStorage.clearData();setView('selection');setResult(null);}} /> :


          <ZodiacResult
            data={{
              ...result,
              profile: dynamicProfiles.find((p) => p.sign && result.sign && p.sign.toLowerCase() === result.sign.toLowerCase())
            }}
            onPeriodChange={(newPeriod) => handleZodiacSelect(result.sign, newPeriod)}
            onBack={() => {
              loveHoroscopeStorage.clearData();
              setResult(null);
              setView('selection');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />

          }
                    </motion.div>
        }
            </AnimatePresence>
        </div>);

}

export default function LoveHoroscopePage() {
    const { t } = useTranslation();

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fdf6e3' }}>
            <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
                    <Loader2 className="animate-spin text-[#b8962e] w-7 h-7" />
                </div>
      }>
                <LoveHoroscopeContent />
            </Suspense>
        </div>);

}