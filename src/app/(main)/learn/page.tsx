'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight, Globe, Youtube, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function LearnAstrologyHub() {
    const { t } = useTranslation();

  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/astrology/learning/lessons`);
      const data = await res.json();
      if (data.success) {
        setLessons(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  // Split lessons into columns for the table layout
  const col1 = lessons.filter((_, i) => i < Math.ceil(lessons.length / 2));
  const col2 = lessons.filter((_, i) => i >= Math.ceil(lessons.length / 2));

  return (
    <div className="min-h-screen bg-[#fffdf5] pb-20">
            {/* Hero Header */}
            <div className="relative pt-10 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-40 pointer-events-none" />
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-12">
            
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b8962e]/10 border border-[#b8962e]/20 text-[#b8962e] text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
{t("learn.free_learning_series")}
            </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 serif leading-tight">
{t("learn.how_to_learn_astrology")}
            </h1>
                        <p className="text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
{t("learn.available_in_hindi_english")}
            </p>
                    </motion.div>

                    {/* Introduction Paragraph */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#e8dbb8]/50 shadow-sm p-8 mb-10">
            
                        <p className="text-[15px] text-gray-700 leading-relaxed serif">
{t("learn.welcome_to_the_world_of")}<strong>{t("learn._no_cost_tutorial")}</strong>{t("learn.to_learn_astrology_it_means_yo")}
              <em>{t("learn._how_to_learn_astrology")}</em>{t("learn._is_a_question_in_minds_of_tho")}

            </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed serif mt-4">
{t("learn.here_you_can_learn_astrology_i")}


            </p>
                    </motion.div>

                    {/* Lessons Table */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10">
            
                        <h2 className="text-center text-xl font-bold text-gray-900 serif mb-6">
{t("learn._astrology_tutorials_by")}<span className="text-[#b8962e]">{t("learn.vaidiktalk")}</span>"
                        </h2>

                        {loading ?
            <div className="flex items-center justify-center py-16">
                                <div className="animate-pulse flex flex-col items-center gap-3">
                                    <BookOpen className="w-10 h-10 text-[#b8962e] opacity-20" />
                                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">{t("learn.loading_lessons")}</span>
                                </div>
                            </div> :

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#e8dbb8] rounded-2xl overflow-hidden bg-white">
                                {/* Column 1 */}
                                <div className="border-r border-[#e8dbb8]/50">
                                    {col1.map((lesson, idx) =>
                <Link
                  key={lesson._id}
                  href={`/learn/guides/${lesson.slug}`}
                  className={`flex items-center gap-3 px-6 py-4 hover:bg-[#fdf6e3] transition-colors group ${idx < col1.length - 1 ? 'border-b border-[#e8dbb8]/30' : ''}`}>
                  
                                            <span className="w-7 h-7 rounded-lg bg-[#b8962e]/10 text-[#b8962e] font-bold text-xs flex items-center justify-center shrink-0">
                                                {lesson.partNumber}
                                            </span>
                                            <span className="text-[14px] font-semibold text-[#b8962e] group-hover:text-[#967a26] transition-colors serif">
                                                {lesson.title}
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#b8962e] opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                                        </Link>
                )}
                                </div>
                                {/* Column 2 */}
                                <div>
                                    {col2.map((lesson, idx) =>
                <Link
                  key={lesson._id}
                  href={`/learn/guides/${lesson.slug}`}
                  className={`flex items-center gap-3 px-6 py-4 hover:bg-[#fdf6e3] transition-colors group ${idx < col2.length - 1 ? 'border-b border-[#e8dbb8]/30' : ''}`}>
                  
                                            <span className="w-7 h-7 rounded-lg bg-[#b8962e]/10 text-[#b8962e] font-bold text-xs flex items-center justify-center shrink-0">
                                                {lesson.partNumber}
                                            </span>
                                            <span className="text-[14px] font-semibold text-[#b8962e] group-hover:text-[#967a26] transition-colors serif">
                                                {lesson.title}
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
{t("learn.this_tutorial_is_only_for_the")}


            </p>
                        <p className="text-[14px] text-gray-600 leading-relaxed serif mt-4">
{t("learn.here_in_given_series_you_ll_kn")}
              <Link href="/learn/planets" className="text-[#b8962e] font-bold hover:underline">{t("learn.zodiac_signs")}</Link>{t("learn._houses_and_about_role_of_othe")}

            </p>
                    </motion.div>

                    {/* Planet Library Teaser */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}>
            
                        <Link
              href="/learn/planets"
              className="group flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-8 text-white hover:shadow-2xl transition-all">
              
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#b8962e]/20 flex items-center justify-center">
                                    <Globe className="w-7 h-7 text-[#b8962e]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold serif">{t("learn.explore_the_9_grahas")}</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1">{t("learn.detailed_profiles_of_all_nine")}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-[#b8962e] group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>);

}