'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  Globe,
  CheckCircle2,
  Activity,
  Star,
  Zap,
  MoveRight,
  ExternalLink } from
'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function PlanetDetailPage() {
    const { t } = useTranslation();

  const params = useParams();
  const [planet, setPlanet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchPlanet(params.slug as string);
    }
  }, [params.slug]);

  const fetchPlanet = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/astrology/learning/planets/${slug}`);
      const data = await res.json();
      if (data.success) {
        setPlanet(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch planet:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
                <div className="animate-pulse space-y-4 text-center">
                    <Globe className="w-12 h-12 text-[#b8962e] mx-auto opacity-20" />
                    <p className="text-[10px] font-black uppercase text-[#b8962e] tracking-widest">{t("_slug_.consulting_the_astral_planes")}</p>
                </div>
            </div>);

  }

  if (!planet) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900 serif mb-2">{t("_slug_.planet_not_found")}</h1>
                <Link href="/learn/planets" className="bg-[#b8962e] text-white px-8 py-3 rounded-2xl font-bold text-sm">{t("_slug_.return_to_library")}</Link>
            </div>);

  }

  return (
    <div className="min-h-screen bg-[#fffdf5] selection:bg-[#b8962e]/20">
            {/* Top Library Banner */}
            <div className="bg-gradient-to-r from-[#e8a020] to-[#d4912e] text-white">
                <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest">
                        <Star className="w-3.5 h-3.5" />
                        <span>{t("_slug_.planet_library")}<strong>{t("_slug_.vaidiktalk")}</strong></span>
                    </div>
                    <Link href="/learn" className="text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
{t("_slug_.view_lessons")}<MoveRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Breadcrumb */}
                <Link
          href="/learn/planets"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase text-gray-400 tracking-widest hover:text-[#b8962e] transition-colors mb-8">
          
                    <ArrowLeft className="w-3.5 h-3.5" />{t("_slug_.back_to_library")}
        </Link>

                {/* Hero Header */}
                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-[#e8dbb8]/50 pb-10">
          
                    <div className="flex items-center gap-6 mb-4">
                        {planet.imageUrl &&
            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg border border-[#e8dbb8]/50 bg-white">
                                <img src={planet.imageUrl} alt={planet.name} className="w-full h-full object-cover" />
                            </div>
            }
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[#b8962e] text-3xl font-bold serif">{planet.symbol}</span>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 serif leading-tight">
                                    {planet.name}
                                </h1>
                            </div>
                            <p className="text-lg text-[#b8962e] font-semibold serif">{planet.sanskritName}</p>
                        </div>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="px-4 py-2 bg-white border border-[#e8dbb8]/40 rounded-xl shadow-sm">
                            <span className="text-[9px] font-black text-gray-400 uppercase block leading-none mb-1">{t("_slug_.element")}</span>
                            <span className="text-sm font-bold text-gray-800">{planet.element}</span>
                        </div>
                        <div className="px-4 py-2 bg-white border border-[#e8dbb8]/40 rounded-xl shadow-sm">
                            <span className="text-[9px] font-black text-gray-400 uppercase block leading-none mb-1">{t("_slug_.significance")}</span>
                            <span className="text-sm font-bold text-gray-800">{planet.significance}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Rich HTML Description */}
                <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lesson-content prose prose-lg max-w-none serif text-gray-800 leading-relaxed mb-10"
          dangerouslySetInnerHTML={{ __html: planet.description }} />
        

                {/* Expanded Details Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Positive Traits */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-emerald-900 serif flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />{t("_slug_.positive_traits")}
            </h3>
                        <div className="space-y-2">
                            {planet.positiveTraits?.map((trait: string, idx: number) =>
              <div key={idx} className="flex items-center gap-2 text-[12px] font-medium text-emerald-700">
                                    <Zap className="w-3 h-3 text-emerald-400 fill-emerald-200" /> {trait}
                                </div>
              )}
                        </div>
                    </div>

                    {/* Negative Traits */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-rose-900 serif flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-rose-500" />{t("_slug_.negative_traits")}
            </h3>
                        <div className="space-y-2">
                            {planet.negativeTraits?.map((trait: string, idx: number) =>
              <div key={idx} className="flex items-center gap-2 text-[12px] font-medium text-rose-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300" /> {trait}
                                </div>
              )}
                        </div>
                    </div>
                </div>

                {/* Remedies Section */}
                <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-[#e8dbb8]/60 shadow-sm relative overflow-hidden mb-12">
          
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Sparkles className="w-16 h-16 text-[#b8962e]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 serif flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-[#b8962e]" />{t("_slug_.spiritual_remedies_upayas")}
          </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {planet.remedies?.map((remedy: string, idx: number) =>
            <div key={idx} className="flex gap-3 items-start group">
                                <div className="w-7 h-7 rounded-lg bg-[#fdf6e3] text-[#b8962e] border border-[#e8dbb8]/50 flex items-center justify-center shrink-0 font-bold text-[11px] shadow-sm group-hover:bg-[#b8962e] group-hover:text-white transition-all">
                                    {idx + 1}
                                </div>
                                <p className="text-xs font-medium text-gray-700 leading-relaxed pt-0.5">{remedy}</p>
                            </div>
            )}
                    </div>
                </motion.section>

                {/* Action Footer */}
                <div className="pt-8 border-t border-[#e8dbb8]/30">
                    <Link
            href="/learn"
            className="group flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-8 text-white hover:shadow-2xl transition-all">
            
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#b8962e]/20 flex items-center justify-center">
                                <Star className="w-7 h-7 text-[#b8962e]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold serif">{t("_slug_.deepen_your_knowledge")}</h3>
                                <p className="text-sm text-gray-400 font-medium mt-1">{t("_slug_.start_our_sequential_learning")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#b8962e] font-bold text-xs uppercase tracking-widest">
{t("_slug_.go_to_part_1")}<MoveRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Same premium global styles as LessonDetailPage */}
            <style jsx global>{`
                .lesson-content h1 { font-size: 2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #1a1a1a; }
                .lesson-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; color: #1a1a1a; border-bottom: 2px solid #e8dbb8; padding-bottom: 0.5rem; }
                .lesson-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #333; }
                .lesson-content p { margin-bottom: 1rem; line-height: 1.8; }
                .lesson-content ul, .lesson-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                .lesson-content li { margin-bottom: 0.5rem; line-height: 1.7; }
                .lesson-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border-radius: 12px; overflow: hidden; border: 1px solid #e8dbb8; }
                .lesson-content th { background-color: #f5e6c8; padding: 12px 16px; text-align: left; font-weight: 700; font-size: 14px; color: #333; border: 1px solid #e8dbb8; }
                .lesson-content td { padding: 10px 16px; border: 1px solid #e8dbb8; font-size: 14px; }
                .lesson-content tr:nth-child(even) { background-color: #fdfaf0; }
                .lesson-content tr:hover { background-color: #fdf6e3; }
                .lesson-content blockquote { border-left: 4px solid #b8962e; padding: 1rem 1.5rem; margin: 1.5rem 0; background: #fdf6e3; border-radius: 0 12px 12px 0; font-style: normal; color: #666; }
                .lesson-content a { color: #b8962e; font-weight: 600; text-decoration: underline; }
                .lesson-content a:hover { color: #967a26; }
                .lesson-content strong { font-weight: 700; color: #1a1a1a; }
                .lesson-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #e8dbb8; }
            `}</style>
        </div>);

}