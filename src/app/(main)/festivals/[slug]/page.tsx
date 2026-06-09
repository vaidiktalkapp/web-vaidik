'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { festivalService } from '@/lib/festivalService';
import { Festival } from '@/lib/mockFestivals';

export default function FestivalDetailPage() {
    const { t } = useTranslation();

  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestival = async () => {
      try {
        const data = await festivalService.getFestivalBySlug(slug);
        setFestival(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchFestival();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfaf3]">
                <Loader2 className="w-10 h-10 animate-spin text-[#b8962e]" />
            </div>);

  }

  if (!festival) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fdfaf3]">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("_slug_.festival_not_found")}</h1>
                <button onClick={() => router.push('/festivals')} className="text-[#b8962e] font-semibold hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />{t("_slug_.back_to_festivals")}
        </button>
            </div>);

  }

  const festDate = new Date(festival.date);
  const formattedDate = festDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen pb-20 bg-[#fdfaf3]">
            <style jsx global>{`
                .fest-detail { font-family: 'Inter', sans-serif !important; }
            `}</style>

            {/* Hero Header Area */}
            <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b overflow-hidden" style={{ borderColor: `${festival.color}30`, backgroundColor: `${festival.color}08` }}>
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-[2px]">
                    <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke={festival.color} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                
                <div className="max-w-4xl mx-auto relative z-10 fest-detail">
                    <button onClick={() => router.push('/festivals')} className="mb-8 flex items-center gap-2 text-sm font-semibold transition-colors opacity-70 hover:opacity-100" style={{ color: festival.color }}>
                        <ArrowLeft className="w-4 h-4" />{t("_slug_.back_to_calendar")}
          </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-sm" style={{ backgroundColor: festival.color }}>
                                    {festival.month}{t("_slug_.month")}
                </span>
                                {festival.isMajor &&
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: festival.color }}>
                                        <Sparkles className="w-3.5 h-3.5" />{t("_slug_.major_festival")}
                </span>
                }
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">{festival.name}</h1>
                            <p className="text-lg md:text-xl font-medium text-gray-700 opacity-90 mb-2">
{t("_slug_.honoring")}<span className="font-bold">{festival.deity}</span>
                            </p>
                        </div>

                        <div className="flex-shrink-0 bg-white/60 backdrop-blur-md rounded-2xl p-5 border shadow-sm w-full md:w-auto" style={{ borderColor: `${festival.color}20` }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: `${festival.color}15`, color: festival.color }}>
                                    {festDate.getDate()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("_slug_.date")}</p>
                                    <p className="text-sm font-bold text-gray-900">{formattedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: `${festival.color}15`, color: festival.color }}>
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("_slug_.muhurat")}</p>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{festival.muhurat.split(':')[0]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fest-detail">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    
                    {/* Left Column (Main description) */}
                    <div className="md:col-span-2 space-y-10">
                        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 serif flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-[#b8962e]" />{t("_slug_.significance")}
              </h2>
                            <div className="prose prose-lg text-gray-600 font-medium leading-relaxed">
                                <p>{festival.description}</p>
                                <p className="mt-4">
{t("_slug_.vedic_astrology_and_panchang_p")}{festival.deity}.
                                </p>
                            </div>
                        </motion.section>

                        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 serif flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-[#b8962e]" />{t("_slug_.rituals_practices")}
              </h2>
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                                <ul className="space-y-4">
                                    {festival.rituals.map((ritual, idx) =>
                  <li key={idx} className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-sm font-bold text-gray-500 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <p className="text-gray-700 font-medium pt-1">{ritual}</p>
                                        </li>
                  )}
                                </ul>
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column (Details box) */}
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                            <div className="p-4" style={{ backgroundColor: `${festival.color}10`, borderBottom: `1px solid ${festival.color}20` }}>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-center" style={{ color: festival.color }}>
{t("_slug_.key_details")}
                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t("_slug_.tithi_lunar_day")}</p>
                                    <p className="text-base font-bold text-gray-900">{festival.tithi}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t("_slug_.hindu_month")}</p>
                                    <p className="text-base font-bold text-gray-900">{festival.month}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t("_slug_.detailed_muhurat")}</p>
                                    <p className="text-sm font-semibold text-gray-700 leading-snug">{festival.muhurat}</p>
                                </div>
                                
                                {festival.endDate &&
                <div className="pt-4 border-t border-gray-100">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t("_slug_.concludes_on")}</p>
                                        <p className="text-sm font-semibold text-gray-700">{new Date(festival.endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                    </div>
                }
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>);

}