'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

import { Sparkles, Book, Info, Crown } from 'lucide-react';

import LalKitabForm from '@/components/lal-kitab/LalKitabForm';
import LalKitabResult from '@/components/lal-kitab/LalKitabResult';
import LalKitabLanding from '@/components/lal-kitab/LalKitabLanding';

import { astrologyService, AstrologyCalculationRequest } from '@/lib/astrologyService';
import { lalKitabStorage } from '@/lib/lalKitabStorage';
import { toast } from 'react-hot-toast';

const LalKitabContent = () => {
    const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const isNewRequest = searchParams.get('new') === '1';

    if (isNewRequest) {
      lalKitabStorage.clearLastViewed();
      setResult(null);
      router.replace('/lal-kitab');
    } else if (!result) {
      // Auto-load last viewed report on refresh
      const savedData = lalKitabStorage.getData();
      if (savedData) {
        setResult(savedData);
      }
    }
    setHasAttemptedLoad(true);
  }, [searchParams, router, result]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = async (formData: any) => {
    // ... same as before
    try {
      setLoading(true);

      const request: AstrologyCalculationRequest = {
        name: formData.name,
        date: formData.date,
        time: formData.time,
        lat: String(formData.lat),
        lon: String(formData.lon),
        place: formData.place,
        tzone: formData.tzone || 5.5
      };

      const response = await astrologyService.calculateLalKitab(request);

      if (response.success) {
        const finalData = {
          ...response.data,
          input: {
            name: formData.name,
            date: formData.date,
            time: formData.time,
            place: formData.place,
            lat: formData.lat,
            lon: formData.lon
          }
        };
        setResult(finalData);
        lalKitabStorage.saveData(finalData);
        toast.success('Lal Kitab wisdom has been synthesized!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(response.message || 'Consultation failed. The stars are silent.');
      }
    } catch (err: any) {
      console.error('Lal Kitab Error:', err);
      toast.error('Could not connect to the Red Book server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full">
            <AnimatePresence mode="wait">
                {!result ?
        <motion.div
          key="intro-phase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full">
          
                        {/* Landing Section */}
                        <LalKitabLanding onStart={scrollToForm} />

                        {/* Form Section Header (Kundli Style) */}
                        <div ref={formRef} className="scroll-mt-10 pt-2 max-w-3xl mx-auto px-4">
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
                                <Crown className="w-4 h-4" />
                                <span className="serif uppercase tracking-wider">{t("lal_kitab.ancient_red_book_wisdom")}</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4 serif">
{t("lal_kitab.generate_your")}<span className="text-[#b8962e]">{t("lal_kitab.lal_kitab")}</span>{t("lal_kitab.report")}
            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
{t("lal_kitab.enter_your_birth_details_below")}
            </p>

                            <div className="mt-12 pt-10 border-t border-[#d6c89a]/30">
                                <LalKitabForm
                onSubmit={handleGenerate}
                loading={loading} />
              
                            </div>
                        </div>
                    </motion.div> :

        <motion.div
          key="result-phase"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="w-full">
          
                        <LalKitabResult
            data={result}
            onBack={() => {
              setResult(null);
              lalKitabStorage.clearLastViewed();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNew={() => {
              setResult(null);
              lalKitabStorage.clearLastViewed();
              setTimeout(scrollToForm, 100);
            }} />
          
                    </motion.div>
        }
            </AnimatePresence>
        </div>);

};

const LalKitabPage = () => {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#fdf6e3' }}>
            {/* Ambient Background (Mirroring Kundli's sacred feel) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_rgba(184,150,46,0.1)_0%,_transparent_70%)] rounded-full blur-[140px]" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-amber-100/20 rounded-full blur-[140px]" />
            </div>

            <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
      }>
                <LalKitabContent />
            </Suspense>
        </div>);

};

export default LalKitabPage;