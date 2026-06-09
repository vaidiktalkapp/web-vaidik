'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Calendar, MapPin, ChevronRight, Moon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { moonSignStorage } from '@/lib/moonSignStorage';

export default function MoonSignHistoryPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    moonSignStorage.getHistory().then((data) => setHistory(data));
  }, []);

  const filteredHistory = history.filter((item) =>
  item.input?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.input?.place?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.moonSign?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: any) => {
    moonSignStorage.setLastViewed(item);
    router.push('/moon-signs');
  };

  return (
    <div className="min-h-screen ms-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .ms-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .ms-wrap h1, .ms-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                .ms-search::placeholder { color: #9ca3af; }
                .ms-search:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }

                .ms-card:hover .ms-card-arrow { transform: translateX(3px); color: #b8962e; }
                .ms-card:hover .ms-card-label { color: #b8962e; }
                .ms-card:hover { border-color: #b8962e !important; }
            ` }} />

            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-8">

                {/* ── Header ── */}
                <div className="pb-6 border-b border-[#d6c89a]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                <Moon className="w-3.5 h-3.5" />
                                <span className="serif">{t("history.moon_sign_analysis")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-1">
{t("history.moon_sign")}<span style={{ color: '#b8962e' }}>{t("history.history")}</span>
                            </h1>
                            <p className="text-gray-500 text-sm">
{t("history.revisit_your_past_lunar_analys")}
              </p>
                        </div>

                        <button
              onClick={() => router.push('/moon-signs')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all flex-shrink-0"
              style={{ background: '#b8962e' }}>
              
                            <Plus className="w-4 h-4" />
{t("history.new_reading")}
            </button>
                    </div>
                </div>

                {/* ── Search ── */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b8962e' }} />
                    <input
            type="text"
            placeholder="Search by name, place or sign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ms-search w-full pl-10 pr-4 py-3 rounded-lg border border-[#d6c89a] text-gray-900 text-[14px] transition-all"
            style={{ background: 'rgba(255,253,245,0.8)' }} />
          
                </div>

                {/* ── Cards Grid ── */}
                {filteredHistory.length > 0 ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredHistory.map((item, idx) =>
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(item)}
            className="ms-card cursor-pointer rounded-xl border border-[#d6c89a] overflow-hidden transition-all duration-200"
            style={{ background: '#fffdf5' }}>
            
                                {/* Card top strip */}
                                <div
              className="px-4 pt-4 pb-3 border-b border-[#e9ddb8]"
              style={{ background: 'rgba(184,150,46,0.07)' }}>
              
                                    <div className="flex items-center gap-3">
                                        {/* Avatar — symbol or first letter */}
                                        <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-semibold text-white flex-shrink-0"
                  style={{ background: '#b8962e' }}>
                  
                                            {item.symbol || item.moonSign?.charAt(0) || item.input?.name?.charAt(0)?.toUpperCase() || '☾'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
                                                {item.input?.name || 'Unknown'}
                                            </h3>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#b8962e' }}>
                                                {item.moonSign ? `${item.moonSign} Moon` : 'Lunar Reading'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="px-4 py-3 space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8962e' }} />
                                        <span className="text-[12px] font-medium">{item.input?.date || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8962e' }} />
                                        <span className="text-[12px] font-medium truncate">{item.input?.place || '—'}</span>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div className="px-4 py-2.5 border-t border-[#e9ddb8] flex items-center justify-between">
                                    <span className="ms-card-label text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors">
{t("history.view_analysis")}
              </span>
                                    <ChevronRight className="ms-card-arrow w-3.5 h-3.5 text-gray-300 transition-all" />
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
            
                            <History className="w-7 h-7 opacity-40" style={{ color: '#b8962e' }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No Matching Records' : 'No Lunar Records'}
                        </h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
                            {searchQuery ?
            "No results matched your search query. Try a different name, place or sign." :
            "You haven't explored your moon sign secrets yet. Start your journey today."}
                        </p>
                        {!searchQuery &&
          <button
            onClick={() => router.push('/moon-signs')}
            className="px-6 py-3 rounded-lg text-white text-[13px] font-semibold transition-all"
            style={{ background: '#b8962e' }}>
{t("history.calculate_my_moon_sign")}

          </button>
          }
                    </div>)
        }
            </div>
        </div>);

}