'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
  Youtube,
  AlertCircle,
  ExternalLink } from
'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function LessonDetailPage() {
    const { t } = useTranslation();

  const params = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchLesson(params.slug as string);
    }
  }, [params.slug]);

  const fetchLesson = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/astrology/learning/guides/${slug}`);
      const data = await res.json();
      if (data.success) {
        setLesson(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';

    // Super-robust regex for all YouTube variants (shorts, live, watch, youtu.be, embed)
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
                <div className="animate-pulse space-y-4 text-center">
                    <BookOpen className="w-12 h-12 text-[#b8962e] mx-auto opacity-20" />
                    <p className="text-[10px] font-black uppercase text-[#b8962e] tracking-widest">{t("_slug_.loading_lesson")}</p>
                </div>
            </div>);

  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 serif mb-2">{t("_slug_.lesson_not_found")}</h1>
                <p className="text-gray-600 mb-8 max-w-sm">{t("_slug_.this_lesson_might_have_been_ar")}</p>
                <Link href="/learn" className="bg-[#b8962e] text-white px-8 py-3 rounded-2xl font-bold text-sm">{t("_slug_.return_to_lessons")}</Link>
            </div>);

  }

  return (
    <div className="min-h-screen bg-[#fffdf5] selection:bg-[#b8962e]/20 overflow-x-hidden max-w-full">
            {/* Top Series Banner */}
            <div className="bg-gradient-to-r from-[#e8a020] to-[#d4912e] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                        <span className="leading-relaxed">{t("_slug_.this_is_part")}<strong>{lesson.partNumber}</strong>{t("_slug_.of_our_series_on_learning_indi")}<strong>{t("_slug_.vaidiktalk")}</strong>.</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {lesson.hindiVersionUrl &&
            <a href={lesson.hindiVersionUrl} className="text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                                हिन्दी में पढ़ें <ExternalLink className="w-3 h-3" />
                            </a>
            }
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 overflow-x-hidden">
                {/* Breadcrumb */}
                <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase text-gray-400 tracking-widest hover:text-[#b8962e] transition-colors mb-8">
          
                    <ArrowLeft className="w-3.5 h-3.5" />{t("_slug_.back_to_all_lessons")}
        </Link>

                {/* Title and Featured Image */}
                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 border-b border-[#e8dbb8]/30 pb-8">
          
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {lesson.featuredImage &&
            <div className="w-full md:w-[180px] aspect-[4/3] rounded-xl overflow-hidden border border-[#e8dbb8]/40 shadow-sm flex-shrink-0">
                                <img src={lesson.featuredImage} alt={lesson.title} className="w-full h-full object-cover" />
                            </div>
            }
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[#b8962e] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                <Sparkles className="w-3 h-3" />
                                <span>{lesson.seriesTitle || 'Astrology Series'}{t("_slug_._part")}{lesson.partNumber}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 serif leading-[1.2] mb-5 break-words">
                                {lesson.title}
                            </h1>
                            {lesson.shortDescription &&
              <p className="text-[17px] text-gray-500 serif leading-relaxed opacity-80">{lesson.shortDescription}</p>
              }
                        </div>
                    </div>
                </motion.div>

                {/* YouTube Embed */}
                {lesson.youtubeUrl &&
        <div className="mb-10 max-w-lg mx-auto space-y-4">
                        <div className="rounded-xl overflow-hidden border border-[#e8dbb8]/40 shadow-lg bg-black aspect-video">
                            <iframe
              width="100%"
              height="100%"
              src={getYoutubeEmbedUrl(lesson.youtubeUrl)}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full" />
            
                        </div>
                        <div className="flex justify-center">
                            <a
              href={lesson.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#b8962e] px-5 py-2.5 bg-[#b8962e]/5 rounded-xl hover:bg-[#b8962e]/10 transition-all active:scale-95 border border-[#b8962e]/10">
              
                                <Youtube className="w-3.5 h-3.5" />{t("_slug_.watch_on_youtube")}<ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
        }

                {/* Rich HTML Content */}
                <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lesson-content prose prose-sm md:prose-base lg:prose-lg max-w-none serif text-gray-800 leading-relaxed overflow-hidden break-words"
          dangerouslySetInnerHTML={{ __html: lesson.content }} />
        

                {/* Navigation Footer */}
                <div className="mt-16 pt-8 border-t border-[#e8dbb8]/50">
                    <div className="flex items-center justify-between gap-4">
                        {/* Previous Lesson */}
                        {lesson.previousLesson ?
            <Link
              href={`/learn/guides/${lesson.previousLesson.slug}`}
              className="group flex items-center gap-3 bg-white border border-[#e8dbb8]/50 rounded-2xl px-6 py-4 hover:shadow-lg hover:border-[#b8962e]/30 transition-all flex-1 max-w-xs">
              
                                <ChevronLeft className="w-5 h-5 text-[#b8962e] group-hover:-translate-x-1 transition-transform" />
                                <div>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">{t("_slug_._previous")}</span>
                                    <span className="text-sm font-bold text-gray-900 serif">{t("_slug_.part")}{lesson.previousLesson.partNumber}: {lesson.previousLesson.title}</span>
                                </div>
                            </Link> :

            <div />
            }

                        {/* Back to Index */}
                        <Link
              href="/learn"
              className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-[#b8962e] tracking-widest hover:underline">
              
                            <BookOpen className="w-4 h-4" />{t("_slug_.all_lessons")}
            </Link>

                        {/* Next Lesson */}
                        {lesson.nextLesson ?
            <Link
              href={`/learn/guides/${lesson.nextLesson.slug}`}
              className="group flex items-center gap-3 bg-white border border-[#e8dbb8]/50 rounded-2xl px-6 py-4 hover:shadow-lg hover:border-[#b8962e]/30 transition-all flex-1 max-w-xs text-right">
              
                                <div className="flex-1">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">{t("_slug_.next")}</span>
                                    <span className="text-sm font-bold text-gray-900 serif">{t("_slug_.part")}{lesson.nextLesson.partNumber}: {lesson.nextLesson.title}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#b8962e] group-hover:translate-x-1 transition-transform" />
                            </Link> :

            <Link
              href="/learn/planets"
              className="group flex items-center gap-3 bg-gradient-to-r from-[#b8962e] to-[#967a26] rounded-2xl px-6 py-4 text-white hover:shadow-lg transition-all">
              
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-80">{t("_slug_.series_complete")}</span>
                                    <span className="text-sm font-bold serif">{t("_slug_.explore_planet_library")}</span>
                                </div>
                                <Globe className="w-5 h-5 ml-2" />
                            </Link>
            }
                    </div>
                </div>
            </div>

            {/* Style for rich HTML content */}
            <style jsx global>{`
                .lesson-content { word-break: break-word; overflow-wrap: break-word; }
                .lesson-content h1 { font-size: 1.6rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #1a1a1a; line-height: 1.2; }
                .lesson-content h2 { font-size: 1.35rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #1a1a1a; border-bottom: 1px solid #e8dbb8; padding-bottom: 0.75rem; line-height: 1.3; }
                .lesson-content h3 { font-size: 1.15rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #333; line-height: 1.4; }
                @media (min-width: 768px) {
                    .lesson-content h1 { font-size: 2rem; }
                    .lesson-content h2 { font-size: 1.6rem; }
                    .lesson-content h3 { font-size: 1.3rem; }
                }
                .lesson-content p { margin-bottom: 1.5rem; line-height: 1.85; font-size: 17px; color: #374151; }
                .lesson-content ul, .lesson-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .lesson-content li { margin-bottom: 0.75rem; line-height: 1.75; font-size: 17px; color: #374151; }
                .lesson-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; border-radius: 12px; border: 1px solid #e8dbb8; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box; }
                .lesson-content th { background-color: #f5e6c8; padding: 14px 18px; text-align: left; font-weight: 700; font-size: 14px; color: #1a1a1a; border: 1px solid #e8dbb8; white-space: nowrap; }
                .lesson-content td { padding: 12px 18px; border: 1px solid #e8dbb8; font-size: 14px; color: #4b5563; }
                .lesson-content tr:nth-child(even) { background-color: #fdfaf0; }
                .lesson-content tr:hover { background-color: #fdf6e3; }
                .lesson-content blockquote { border-left: 4px solid #b8962e; padding: 1.25rem 1.75rem; margin: 2rem 0; background: #fdf6e3; border-radius: 0 12px 12px 0; font-style: normal; color: #4b5563; }
                .lesson-content a { color: #b8962e; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
                .lesson-content a:hover { color: #967a26; }
                .lesson-content strong { font-weight: 700; color: #111827; }
                .lesson-content img { max-width: 100% !important; height: auto !important; border-radius: 16px; margin: 2rem 0; border: 1px solid #e8dbb8; box-sizing: border-box; }
                .lesson-content iframe { max-width: 100%; border-radius: 16px; margin: 2rem 0; display: block; box-sizing: border-box; }
            `}</style>
        </div>);

}