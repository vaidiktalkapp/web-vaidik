'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, ChevronRight, Heart, Sparkles, Plus, Users, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { compatibilityStorage } from '@/lib/compatibilityStorage';

export default function CompatibilityHistoryPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'name' | 'love'>('all');

  useEffect(() => {
    compatibilityStorage.getAllHistory().then((data) => setHistory(data));
  }, []);

  const filteredHistory = history.filter((item) => {
    // Strict Type Filter: Only allow 'name' or 'love'
    if (item.type !== 'name' && item.type !== 'love') return false;
    
    // Tab Filter
    if (activeTab !== 'all' && item.type !== activeTab) return false;

    // Search Filter (Checking names)
    const q = searchQuery.toLowerCase();
    let matchStr = '';
    if (item.type === 'name') {
      matchStr = `${item.input?.nameA || ''} ${item.input?.nameB || ''}`.toLowerCase();
    } else if (item.type === 'love') {
      matchStr = `${item.input?.name1 || item.input?.sign1?.name || ''} ${item.input?.name2 || item.input?.sign2?.name || ''}`.toLowerCase();
    }
    return matchStr.includes(q);
  });

  const handleSelect = (item: any) => {
    const type = item.type || 'love'; // Fallback to love if missing, but should be filtered out anyway
    // Save the full item so input/result/report can all be restored
    compatibilityStorage.saveActiveData(item, type);
    // We set a flag in sessionStorage so the main page knows to load it
    sessionStorage.setItem('vaidiktalk_compat_load', type);
    router.push('/compatibility');
  };

  return (
    <div className="min-h-screen compat-hist-wrap" style={{ backgroundColor: '#fdf6e3' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .compat-hist-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .compat-hist-wrap h1, .compat-hist-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .ch-search::placeholder { color: #9ca3af; }
                .ch-search:focus { border-color: #b8962e !important; box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important; outline: none !important; }
                .ch-card:hover .ch-card-arrow { transform: translateX(3px); color: #b8962e; }
                .ch-card:hover .ch-card-label { color: #b8962e; }
                .ch-card:hover { border-color: #b8962e !important; }
            ` }} />

            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-8">
                {/* ── Header ── */}
                <div className="pb-6 border-b border-[#d6c89a]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                <Heart className="w-3.5 h-3.5" />
                                <span className="serif">{t("history.cosmic_connections")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-1">
{t("history.compatibility_history")}
              </h1>
                            <p className="text-gray-500 text-sm">
{t("history.revisit_your_past_name_and_lov")}
              </p>
                        </div>
                        <button onClick={() => router.push('/compatibility')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all flex-shrink-0" style={{ background: '#b8962e' }}>
                            <Plus className="w-4 h-4" />{t("history.new_match")}
            </button>
                    </div>
                </div>

                {/* ── Filters & Search ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center p-1 rounded-xl border border-[#d6c89a]" style={{ background: '#fffdf5' }}>
                        {[
            { id: 'all', label: t("history.all_matches") },
            { id: 'name', label: t("history.name_vibrations") },
            { id: 'love', label: t("history.love_zodiac") }].
            map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${activeTab === tab.id ? 'bg-[#b8962e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              
                                {tab.label}
                            </button>
            )}
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b8962e' }} />
                        <input type="text" placeholder={t("history.search_names_placeholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="ch-search w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#d6c89a] bg-transparent text-gray-900 text-[14px] transition-all" style={{ background: '#fffdf5' }} />
                    </div>
                </div>

                {/* ── Cards Grid ── */}
                {filteredHistory.length > 0 ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {filteredHistory.map((item, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleSelect(item)}
              className="ch-card cursor-pointer rounded-xl border border-[#d6c89a] overflow-hidden transition-all duration-200"
              style={{ background: '#fffdf5' }}>
              
                                    <div className="px-5 pt-5 pb-4 border-b border-[#e9ddb8]" style={{ background: item.type === 'name' ? 'linear-gradient(135deg, rgba(184,150,46,0.08), rgba(255,255,255,0))' : 'linear-gradient(135deg, rgba(45,26,110,0.06), rgba(255,255,255,0))' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: item.type === 'name' ? '#b8962e15' : '#2d1a6e15', color: item.type === 'name' ? '#b8962e' : '#2d1a6e' }}>
                                                {item.type === 'name' ? t("history.name_vibration") : t("history.love_compatibility")}
                                            </span>
                                            <span className="text-[12px] font-bold text-gray-800">{item.result?.result?.score || 0}{t("history._match")}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-sm z-10" style={{ background: item.type === 'name' ? '#b8962e' : '#2d1a6e' }}>
                                                    {(item.input.nameA || item.input.name1 || item.input.sign1?.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-sm z-0" style={{ background: item.type === 'name' ? '#8a701e' : '#7c1a4e' }}>
                                                    {(item.input.nameB || item.input.name2 || item.input.sign2?.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 text-[14px] truncate">{item.input.nameA || item.input.name1 || item.input.sign1?.name}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">&</p>
                                                <p className="font-semibold text-gray-900 text-[14px] truncate">{item.input.nameB || item.input.name2 || item.input.sign2?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-5 py-3 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" style={{ color: item.type === 'name' ? '#b8962e' : '#2d1a6e' }} />
                                            <span className="text-[12px] font-medium">{new Date(item.timestamp || item.createdAt).toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN')}</span>
                                        </div>
                                        <p className="text-[12px] text-gray-700 font-medium truncate" style={{ color: item.type === 'name' ? '#b8962e' : '#2d1a6e' }}>
{t("history.level")}{item.result?.result?.level || 'Unknown'}
                                        </p>
                                    </div>

                                    <div className="px-5 py-3 border-t border-[#e9ddb8] flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.5)' }}>
                                        <span className="ch-card-label text-[11px] font-bold uppercase tracking-wider text-gray-400">{t("history.view_full_cosmic_report")}</span>
                                        <ChevronRight className="ch-card-arrow w-4 h-4 text-gray-300" />
                                    </div>
                                </motion.div>
            )}
                        </AnimatePresence>
                    </div> : (

        /* ── Empty State ── */
        <div className="rounded-xl border border-dashed border-[#d6c89a] p-16 text-center" style={{ background: 'rgba(184,150,46,0.03)' }}>
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                            <History className="w-7 h-7 opacity-40" style={{ color: '#b8962e' }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{searchQuery ? t("history.no_matching_records") : t("history.no_cosmic_matches_yet")}</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
                            {searchQuery ? t("history.no_matching_names_desc") : t("history.no_compat_generated_desc")}
                        </p>
                        {!searchQuery &&
          <div className="flex justify-center gap-4">
                                <button onClick={() => router.push('/compatibility')} className="px-6 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-all" style={{ background: '#b8962e' }}>{t("history.start_comparing")}</button>
                            </div>
          }
                    </div>)
        }
            </div>
        </div>);

}