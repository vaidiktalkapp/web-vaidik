'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function PlanetLibrary() {
    const { t } = useTranslation();

  const [planets, setPlanets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanets();
  }, []);

  const fetchPlanets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/astrology/learning/planets`);
      const data = await res.json();
      if (data.success) {
        // Sort by order field
        const sorted = data.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setPlanets(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch planets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Split planets into columns for the table layout
  const col1 = planets.filter((_, i) => i < Math.ceil(planets.length / 2));
  const col2 = planets.filter((_, i) => i >= Math.ceil(planets.length / 2));

  return (
    <div className="min-h-screen bg-[#fffdf5] pb-20 selection:bg-[#b8962e]/20">
            {/* Hero Header */}
            <div className="relative pt-10 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-40 pointer-events-none" />
                
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-12">
            
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b8962e]/10 border border-[#b8962e]/20 text-[#b8962e] text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
{t("planets.graha_knowledge_center")}
            </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 serif leading-tight">
{t("planets.the_celestial_library")}
            </h1>
                        <p className="text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
{t("planets._the_nine_planets_are_the_admi")}
            </p>
                    </motion.div>

                    {/* Introduction Paragraph */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#e8dbb8]/50 shadow-sm p-8 mb-10 text-left">
            
                        <p className="text-[15px] text-gray-700 leading-relaxed serif">
{t("planets.in_vedic_astrology_the_nine_pl")}<strong>{t("planets._navagrahas")}</strong>{t("planets.are_not_just_celestial_bodies")}

            </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed serif mt-4">
{t("planets.understanding_these_planets_is")}

            </p>
                    </motion.div>

                    {/* Planets Table */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10">
            
                        <h2 className="text-center text-xl font-bold text-gray-900 serif mb-6">
{t("planets._nine_pillars_of")}<span className="text-[#b8962e]">{t("planets.vedic_astrology")}</span>"
                        </h2>

                        {loading ?
            <div className="flex items-center justify-center py-16">
                                <div className="animate-pulse flex flex-col items-center gap-3">
                                    <Globe className="w-10 h-10 text-[#b8962e] opacity-20" />
                                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">{t("planets.summoning_cosmic_data")}</span>
                                </div>
                            </div> :

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#e8dbb8] rounded-2xl overflow-hidden bg-white">
                                {/* Column 1 */}
                                <div className="border-r border-[#e8dbb8]/50">
                                    {col1.map((planet, idx) =>
                <Link
                  key={planet._id}
                  href={`/learn/planets/${planet.slug}`}
                  className={`flex items-center gap-3 px-6 py-4 hover:bg-[#fdf6e3] transition-colors group ${idx < col1.length - 1 ? 'border-b border-[#e8dbb8]/30' : ''}`}>
                  
                                            <span className="w-7 h-7 rounded-lg bg-[#b8962e]/10 text-[#b8962e] font-bold text-xs flex items-center justify-center shrink-0">
                                                {planet.order || idx + 1}
                                            </span>
                                            <span className="text-[14px] font-semibold text-[#b8962e] group-hover:text-[#967a26] transition-colors serif">
                                                {planet.name}
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#b8962e] opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                                        </Link>
                )}
                                </div>
                                {/* Column 2 */}
                                <div>
                                    {col2.map((planet, idx) =>
                <Link
                  key={planet._id}
                  href={`/learn/planets/${planet.slug}`}
                  className={`flex items-center gap-3 px-6 py-4 hover:bg-[#fdf6e3] transition-colors group ${idx < col2.length - 1 ? 'border-b border-[#e8dbb8]/30' : ''}`}>
                  
                                            <span className="w-7 h-7 rounded-lg bg-[#b8962e]/10 text-[#b8962e] font-bold text-xs flex items-center justify-center shrink-0">
                                                {planet.order || col1.length + idx + 1}
                                            </span>
                                            <span className="text-[14px] font-semibold text-[#b8962e] group-hover:text-[#967a26] transition-colors serif">
                                                {planet.name}
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#b8962e] opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                                        </Link>
                )}
                                </div>
                            </div>
            }
                    </motion.div>

                    {/* Bottom Description */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-[#e8dbb8]/50 shadow-sm p-8 mb-10">
            
                        <p className="text-[14px] text-gray-600 leading-relaxed serif">
{t("planets.in_vedic_astrology_the_nine_pl")}<strong>{t("planets._navagrahas")}</strong>{t("planets.are_not_just_celestial_bodies")}

            </p>
                        <p className="text-[14px] text-gray-600 leading-relaxed serif mt-4">
{t("planets.understanding_the_planets_is_t")}

            </p>
                    </motion.div>

                    {/* Back to Lessons Teaser */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}>
            
                        <Link
              href="/learn"
              className="group flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-8 text-white hover:shadow-2xl transition-all">
              
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#b8962e]/20 flex items-center justify-center">
                                    <BookOpen className="w-7 h-7 text-[#b8962e]" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold serif">{t("planets.back_to_astrology_lessons")}</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">{t("planets.continue_your_sequential_learn")}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-[#b8962e] group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>);

}