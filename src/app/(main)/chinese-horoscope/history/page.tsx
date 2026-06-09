'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Calendar, ChevronRight, Star, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chineseZodiacStorage } from '@/lib/chineseZodiacStorage';

export default function ChineseHoroscopeHistoryPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    chineseZodiacStorage.getHistory().then((data) => setHistory(data));
  }, []);

  const filteredHistory = history.filter((item) =>
  item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.animalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: any) => {
    chineseZodiacStorage.setLastViewed(item);
    router.push('/chinese-horoscope');
  };

  return (
    <div className="min-h-screen ch-history-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

                .ch-history-wrap * { font-family: 'Outfit', sans-serif; }
                .ch-history-wrap h1, .ch-history-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                .ch-search::placeholder { color: #9ca3af; }
                .ch-search:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 4px rgba(184,150,46,0.1) !important;
                    outline: none !important;
                }

                .ch-card:hover .ch-card-arrow { transform: translateX(3px); color: #b8962e; }
                .ch-card:hover .ch-card-label { color: #b8962e; }
                .ch-card:hover { border-color: #b8962e !important; box-shadow: 0 10px 25px rgba(184,150,46,0.05); }
            ` }} />

            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-8">

                {/* ── Header ── */}
                <div className="pb-8 border-b border-[#d6c89a]/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-bold mb-3 tracking-widest uppercase">
                                <Star className="w-4 h-4 fill-[#b8962e]/20" />
                                <span className="serif normal-case tracking-normal">{t("history.lunar_destiny_archive")}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-2 serif">
{t("history.chinese_zodiac")}<span className="text-[#b8962e]">{t("history.history")}</span>
                            </h1>
                            <p className="text-gray-500 text-base">
{t("history.revisit_the_ancient_wisdom_rev")}
              </p>
                        </div>

                        <button
              onClick={() => router.push('/chinese-horoscope')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all flex-shrink-0 shadow-lg shadow-amber-900/10"
              style={{ background: 'linear-gradient(135deg, #b8962e 0%, #8b6b1a 100%)' }}>
              
                            <Plus className="w-4 h-4" />
{t("history.new_discovery")}
            </button>
                    </div>
                </div>

                {/* ── Search ── */}
                <div className="relative max-w-2xl mx-auto md:mx-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8962e]" />
                    <input
            type="text"
            placeholder="Search by name or animal sign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ch-search w-full pl-11 pr-4 py-4 rounded-2xl border border-[#d6c89a] text-gray-900 text-[15px] font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.6)' }} />
          
                </div>

                {/* ── Cards Grid ── */}
                {filteredHistory.length > 0 ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredHistory.map((item, idx) =>
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => handleSelect(item)}
            className="ch-card cursor-pointer rounded-xl border border-[#d6c89a] overflow-hidden transition-all duration-200"
            style={{ background: '#fffdf5' }}>
            
                                {/* Card top strip */}
                                <div
              className="px-4 pt-4 pb-3 border-b border-[#e9ddb8]"
              style={{ background: 'rgba(184,150,46,0.07)' }}>
              
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-semibold text-amber-600 bg-white shadow-sm flex-shrink-0">
                  
                                            {item.icon || '✨'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
                                                {item.userName || item.name || 'Personal Reading'}
                                            </h3>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#b8962e' }}>
{t("history.year_of_the")}{item.sign || item.name || item.animalName || 'LUNAR SIGN'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="px-4 py-3 space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8962e' }} />
                                        <span className="text-[12px] font-medium">{item.date || new Date().toISOString().split('T')[0]}</span>
                                    </div>
                                    {item.element &&
              <div className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full border border-amber-100/60 bg-amber-50 text-[11px] font-bold text-[#b8962e]">
                                            {item.element}{t("history.element")}
              </div>
              }
                                </div>

                                {/* Card footer */}
                                <div className="px-4 py-2.5 border-t border-[#e9ddb8] flex items-center justify-between">
                                    <span className="ch-card-label text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors">
{t("history.reveal_destiny")}
              </span>
                                    <ChevronRight className="ch-card-arrow w-3.5 h-3.5 text-gray-300 transition-all" />
                                </div>
                            </motion.div>
          )}
                    </div> : (

        /* ── Empty State ── */
        <div className="rounded-[2.5rem] border-2 border-dashed border-[#d6c89a]/40 p-20 text-center bg-white/20 backdrop-blur-sm">
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#d6c89a]/40 bg-white/50 shadow-sm">
                            <History className="w-9 h-9 opacity-30 text-[#b8962e]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 serif">
                            {searchQuery ? 'No Echoes Found' : 'Archive is Silent'}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed font-medium">
                            {searchQuery ?
            "No records matched your search. Try adjusting the name or animal sign." :
            "You haven't archived any lunar destinies yet. Begin your first discovery to start your archive."}
                        </p>
                        {!searchQuery &&
          <button
            onClick={() => router.push('/chinese-horoscope')}
            className="px-8 py-3.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg shadow-amber-900/10"
            style={{ background: 'linear-gradient(135deg, #b8962e 0%, #8b6b1a 100%)' }}>
{t("history.start_first_discovery")}

          </button>
          }
                    </div>)
        }
            </div>
        </div>);

}