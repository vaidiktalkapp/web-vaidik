'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Calendar, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { horoscopeMatchingStorage } from '@/lib/horoscopeMatchingStorage';

export default function MatchingHistoryPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    horoscopeMatchingStorage.getHistory().then(setHistory);
  }, []);

  if (!isMounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  const filteredHistory = history.filter((item) => {
    const bName = item.boy?.name || '';
    const gName = item.girl?.name || '';
    return bName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelect = (item: any) => {
    localStorage.setItem('horoscope_match_input', JSON.stringify(item));
    router.push('/horoscope-matching/result');
  };

  return (
    <div className="min-h-screen mh-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .mh-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .mh-wrap h1, .mh-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                .mh-search::placeholder { color: #9ca3af; }
                .mh-search:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }

                .mh-card:hover { border-color: #b8962e !important; }
                .mh-card:hover .mh-card-footer-label { color: #b8962e; }
                .mh-card:hover .mh-card-arrow { transform: translateX(3px); color: #b8962e; }
            ` }} />

            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-8">

                {/* ── Header ── */}
                <div className="pb-6 border-b border-[#d6c89a]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                <Heart className="w-3.5 h-3.5" />
                                <span className="serif">{t("history.horoscope_matching")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-1">
{t("history.matching_results")}
              </h1>
                            <p className="text-gray-500 text-sm">
{t("history.history_of_compatibility_calcu")}
              </p>
                        </div>

                        <button
              onClick={() => router.push('/horoscope-matching')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all flex-shrink-0"
              style={{ background: '#b8962e' }}>
              
                            <Plus className="w-4 h-4" />
{t("history.new_matching")}
            </button>
                    </div>
                </div>

                {/* ── Search ── */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b8962e' }} />
                    <input
            type="text"
            placeholder={t("history.search_matching_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mh-search w-full pl-10 pr-4 py-3 rounded-lg border border-[#d6c89a] text-gray-900 text-[14px] transition-all"
            style={{ background: 'rgba(255,253,245,0.8)' }} />
          
                </div>

                {/* ── Cards Grid ── */}
                {filteredHistory.length > 0 ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredHistory.map((item, idx) =>
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(item)}
            className="mh-card cursor-pointer rounded-xl border border-[#d6c89a] overflow-hidden transition-all duration-200"
            style={{ background: '#fffdf5' }}>
            
                                {/* Card top strip — system badge + date */}
                                <div
              className="flex items-center justify-between px-4 py-3 border-b border-[#e9ddb8]"
              style={{ background: 'rgba(184,150,46,0.07)' }}>
              
                                    <span
                className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#d6c89a]"
                style={{ color: '#b8962e', background: 'rgba(184,150,46,0.1)' }}>
                
                                        {item.system === 'south_indian' ? t("history.south_indian") : t("history.north_indian")}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN') : t("history.recent")}
                                    </span>
                                </div>

                                {/* Card body — couple names */}
                                <div className="px-4 py-4">
                                    <div className="flex items-center justify-between gap-3">

                                        {/* Boy */}
                                        <div className="flex-1 min-w-0 text-center">
                                            <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white mx-auto mb-1.5"
                    style={{ background: '#6b9fd4' }}>
                    
                                                {(item.boy?.name || 'G').charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-[13px] font-semibold text-gray-900 truncate">{item.boy?.name || t("history.groom")}</p>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5 text-blue-400">{t("history.groom")}</p>
                                        </div>

                                        {/* Heart divider */}
                                        <div className="flex-shrink-0">
                                            <Heart className="w-4 h-4 fill-current" style={{ color: '#b8962e' }} />
                                        </div>

                                        {/* Girl */}
                                        <div className="flex-1 min-w-0 text-center">
                                            <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white mx-auto mb-1.5"
                    style={{ background: '#d4769a' }}>
                    
                                                {(item.girl?.name || 'B').charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-[13px] font-semibold text-gray-900 truncate">{item.girl?.name || t("history.bride")}</p>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#d4769a' }}>{t("history.bride")}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div className="px-4 py-2.5 border-t border-[#e9ddb8] flex items-center justify-between">
                                    <span className="mh-card-footer-label text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors">
{t("history.view_analysis")}
              </span>
                                    <ChevronRight className="mh-card-arrow w-3.5 h-3.5 text-gray-300 transition-all" />
                                </div>
                            </motion.div>
          )}
                    </div> : (

        /* ── Empty State ── */
        <div
          className="rounded-xl border border-dashed border-[#d6c89a] p-16 text-center"
          style={{ background: 'rgba(184,150,46,0.03)' }}>
          
                        <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 border border-[#d6c89a]"
            style={{ background: 'rgba(184,150,46,0.08)' }}>
            
                            <Heart className="w-7 h-7 opacity-40" style={{ color: '#b8962e' }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("history.no_matching_history")}</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
{t("history.you_haven_t_performed_any_horo")}
          </p>
                        <button
            onClick={() => router.push('/horoscope-matching')}
            className="px-6 py-3 rounded-lg text-white text-[13px] font-semibold transition-all"
            style={{ background: '#b8962e' }}>
{t("history.start_new_matching")}

          </button>
                    </div>)
        }
            </div>
        </div>);

}