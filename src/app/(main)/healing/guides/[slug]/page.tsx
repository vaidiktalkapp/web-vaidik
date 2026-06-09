'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Wind,
  Flower2,
  Gem,
  AlertCircle } from
'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function HealingGuideDetail() {
    const { t } = useTranslation();

  const params = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchItem(params.slug as string);
    }
  }, [params.slug]);

  const fetchItem = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/healing/item/${slug}`);
      const data = await res.json();
      if (data.success) {
        setItem(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
                <div className="animate-pulse space-y-4 text-center">
                    <BookOpen className="w-12 h-12 text-[#b8962e] mx-auto opacity-20" />
                    <p className="text-[10px] font-black uppercase text-[#b8962e] tracking-widest">{t("_slug_.loading_guide")}</p>
                </div>
            </div>);

  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 serif mb-2">{t("_slug_.guide_not_found")}</h1>
                <p className="text-gray-600 mb-8 max-w-sm">{t("_slug_.this_guide_might_have_been_arc")}</p>
                <Link href="/healing" className="bg-[#b8962e] text-white px-8 py-3 rounded-2xl font-bold text-sm">{t("_slug_.return_to_healing_hub")}</Link>
            </div>);

  }

  const m = item.metadata || {};
  const typeLabel = item.type === 'meditation' ? 'Meditation' : item.type === 'yoga' ? 'Yoga Asana' : 'Crystal Healing';
  const TypeIcon = item.type === 'meditation' ? Wind : item.type === 'yoga' ? Flower2 : Gem;

  return (
    <div className="min-h-screen bg-[#fffdf5] selection:bg-[#b8962e]/20 overflow-x-hidden max-w-full">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-[#e8a020] to-[#d4912e] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                        <TypeIcon className="w-4 h-4" />
                        <span className="leading-relaxed">
                            <strong>{typeLabel}</strong>{t("_slug_.guide_from")}<strong>{t("_slug_.vaidiktalk")}</strong>{t("_slug_.healing_wellness_series")}
            </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {m.duration &&
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                                {m.duration}
                            </span>
            }
                        {m.difficulty &&
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                                {m.difficulty}
                            </span>
            }
                        {m.chakra &&
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                                {m.chakra}{t("_slug_.chakra")}
            </span>
            }
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 overflow-x-hidden">
                {/* Breadcrumb */}
                <Link
          href="/healing"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase text-gray-400 tracking-widest hover:text-[#b8962e] transition-colors mb-8">
          
                    <ArrowLeft className="w-3.5 h-3.5" />{t("_slug_.back_to_healing_hub")}
        </Link>

                {/* Title and Featured Image */}
                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 border-b border-[#e8dbb8]/30 pb-8">
          
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {item.featuredImage &&
            <div className="w-full md:w-[180px] aspect-[4/3] rounded-xl overflow-hidden border border-[#e8dbb8]/40 shadow-sm flex-shrink-0">
                                <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover" />
                            </div>
            }
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[#b8962e] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                <Sparkles className="w-3 h-3" />
                                <span>{typeLabel} {m.sanskritName ? `• ${m.sanskritName}` : ''}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 serif leading-[1.2] mb-5 break-words">
                                {item.title}
                            </h1>
                            {item.shortDescription &&
              <p className="text-[17px] text-gray-500 serif leading-relaxed opacity-80">{item.shortDescription}</p>
              }
                        </div>
                    </div>
                </motion.div>

                {/* Metadata Pills */}
                {(m.benefits?.length > 0 || m.element || m.color) &&
        <div className="flex flex-wrap gap-2 mb-10">
                        {m.element &&
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8962e] bg-[#b8962e]/5 px-4 py-2 rounded-xl border border-[#b8962e]/10">
                                {m.element}{t("_slug_.element")}
          </span>
          }
                        {m.color &&
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8962e] bg-[#b8962e]/5 px-4 py-2 rounded-xl border border-[#b8962e]/10">
                                {m.color}
                            </span>
          }
                        {m.focus &&
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8962e] bg-[#b8962e]/5 px-4 py-2 rounded-xl border border-[#b8962e]/10">
{t("_slug_.focus")}{m.focus}
                            </span>
          }
                    </div>
        }

                {/* Rich HTML Content */}
                <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="healing-content prose prose-sm md:prose-base lg:prose-lg max-w-none serif text-gray-800 leading-relaxed overflow-hidden break-words"
          dangerouslySetInnerHTML={{ __html: item.content }} />
        

                {/* Benefits Section */}
                {m.benefits && m.benefits.length > 0 &&
        <div className="mt-12 p-8 rounded-2xl bg-[#fdf6e3] border border-[#e8dbb8]/50">
                        <h3 className="text-lg font-bold text-gray-900 serif mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#b8962e]" />
{t("_slug_.key_benefits")}
          </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {m.benefits.map((benefit: string, idx: number) =>
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#e8dbb8]/30">
                                    <div className="w-2 h-2 rounded-full bg-[#b8962e]" />
                                    <span className="text-sm font-medium text-gray-700 serif">{benefit}</span>
                                </div>
            )}
                        </div>
                    </div>
        }

                {/* Navigation Footer */}
                <div className="mt-16 pt-8 border-t border-[#e8dbb8]/50">
                    <div className="flex items-center justify-center">
                        <Link
              href="/healing"
              className="group flex items-center gap-3 bg-gradient-to-r from-[#b8962e] to-[#967a26] rounded-2xl px-8 py-4 text-white hover:shadow-lg transition-all">
              
                            <BookOpen className="w-5 h-5" />
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest block opacity-80">{t("_slug_.browse_all_guides")}</span>
                                <span className="text-sm font-bold serif">{t("_slug_.return_to_healing_hub")}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Style for rich HTML content - matches learn astrology */}
            <style jsx global>{`
                .healing-content { word-break: break-word; overflow-wrap: break-word; }
                .healing-content h1 { font-size: 1.6rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #1a1a1a; line-height: 1.2; }
                .healing-content h2 { font-size: 1.35rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #1a1a1a; border-bottom: 1px solid #e8dbb8; padding-bottom: 0.75rem; line-height: 1.3; }
                .healing-content h3 { font-size: 1.15rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #333; line-height: 1.4; }
                @media (min-width: 768px) {
                    .healing-content h1 { font-size: 2rem; }
                    .healing-content h2 { font-size: 1.6rem; }
                    .healing-content h3 { font-size: 1.3rem; }
                }
                .healing-content p { margin-bottom: 1.5rem; line-height: 1.85; font-size: 17px; color: #374151; }
                .healing-content ul, .healing-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .healing-content li { margin-bottom: 0.75rem; line-height: 1.75; font-size: 17px; color: #374151; }
                .healing-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; border-radius: 12px; border: 1px solid #e8dbb8; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box; }
                .healing-content th { background-color: #f5e6c8; padding: 14px 18px; text-align: left; font-weight: 700; font-size: 14px; color: #1a1a1a; border: 1px solid #e8dbb8; white-space: nowrap; }
                .healing-content td { padding: 12px 18px; border: 1px solid #e8dbb8; font-size: 14px; color: #4b5563; }
                .healing-content tr:nth-child(even) { background-color: #fdfaf0; }
                .healing-content tr:hover { background-color: #fdf6e3; }
                .healing-content blockquote { border-left: 4px solid #b8962e; padding: 1.25rem 1.75rem; margin: 2rem 0; background: #fdf6e3; border-radius: 0 12px 12px 0; font-style: normal; color: #4b5563; }
                .healing-content a { color: #b8962e; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
                .healing-content a:hover { color: #967a26; }
                .healing-content strong { font-weight: 700; color: #111827; }
                .healing-content img { max-width: 100% !important; height: auto !important; border-radius: 16px; margin: 2rem 0; border: 1px solid #e8dbb8; box-sizing: border-box; }
                .healing-content iframe { max-width: 100%; border-radius: 16px; margin: 2rem 0; display: block; box-sizing: border-box; }
            `}</style>
        </div>);

}