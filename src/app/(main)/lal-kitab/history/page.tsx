'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Calendar, MapPin, ChevronRight, Sparkles, Plus, Crown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { lalKitabStorage } from '@/lib/lalKitabStorage';
import LalKitabResult from '@/components/lal-kitab/LalKitabResult';

export default function LalKitabHistoryPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lalKitabStorage.getAllHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });

    // Auto-load last viewed report on refresh
    const lastViewed = lalKitabStorage.getData();
    if (lastViewed) {
      setSelectedItem(lastViewed);
    }
  }, []);

  const filteredHistory = history.filter((item) =>
  item.input?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.input?.place?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: any) => {
    lalKitabStorage.setLastViewed(item);
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
                <div className="w-8 h-8 border-4 border-[#b8962e] border-t-transparent rounded-full animate-spin" />
            </div>);

  }

  // Detail View Overlay
  if (selectedItem) {
    return (
      <div className="min-h-screen kh-wrap py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fdf6e3' }}>
                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                    .kh-wrap * { font-family: 'Source Sans 3', sans-serif; }
                    .kh-wrap h1, .kh-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                ` }} />
                
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b8962e]/10 rounded-full text-[#b8962e] text-[10px] font-black uppercase tracking-widest mb-1">
                            <History className="w-3.5 h-3.5" />{t("history.previous_session")}
            </div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
{t("history.lal_kitab")}<span className="text-[#b8962e]">{t("history.report")}</span>
                        </h1>
                    </div>

                    <LalKitabResult
            data={selectedItem}
            onBack={() => {
              lalKitabStorage.clearLastViewed();
              setSelectedItem(null);
            }}
            onHistoryClick={() => {
              lalKitabStorage.clearLastViewed();
              setSelectedItem(null);
            }}
            onNew={() => {
              lalKitabStorage.clearLastViewed();
              router.push('/lal-kitab?new=1');
            }} />
          
                </div>
            </div>);

  }

  return (
    <div className="min-h-screen kh-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .kh-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .kh-wrap h1, .kh-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                .kh-search::placeholder { color: #9ca3af; }
                .kh-search:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }

                .kh-card:hover .kh-card-arrow { transform: translateX(3px); color: #b8962e; }
                .kh-card:hover .kh-card-label { color: #b8962e; }
                .kh-card:hover { border-color: #b8962e !important; }
            ` }} />

            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-8">

                {/* ── Header ── */}
                <div className="pb-6 border-b border-[#d6c89a]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="text-left">
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                <Crown className="w-3.5 h-3.5" />
                                <span className="serif">{t("history.lal_kitab_records")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-1 text-left">
{t("history.saved_calculations")}
              </h1>
                            <p className="text-gray-500 text-sm text-left">
{t("history.access_your_previously_generat")}
              </p>
                        </div>

                        <button
              onClick={() => router.push('/lal-kitab?new=1')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all flex-shrink-0"
              style={{ background: '#b8962e' }}>
              
                            <Plus className="w-4 h-4" />
{t("history.new_calculation")}
            </button>
                    </div>
                </div>

                {/* ── Search ── */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b8962e' }} />
                    <input
            type="text"
            placeholder="Search seeker name or birth place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="kh-search w-full pl-10 pr-4 py-3 rounded-lg border border-[#d6c89a] bg-transparent text-gray-900 text-[14px] transition-all"
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
            className="kh-card cursor-pointer rounded-xl border border-[#d6c89a] overflow-hidden transition-all duration-200"
            style={{ background: '#fffdf5' }}>
            
                                {/* Card top strip */}
                                <div
              className="px-4 pt-4 pb-3 border-b border-[#e9ddb8]"
              style={{ background: 'rgba(184,150,46,0.07)' }}>
              
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-semibold text-white flex-shrink-0"
                  style={{ background: '#b8962e' }}>
                  
                                            {(item.input?.name || 'S').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1 text-left">
                                            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
                                                {item.input?.name || 'Seeker'}
                                            </h3>
                                            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#b8962e' }}>
{t("history.lal_kitab_record")}
                  </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="px-4 py-3 space-y-2 text-left">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8962e' }} />
                                        <span className="text-[12px] font-medium">
                                            {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Unknown Date'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8962e' }} />
                                        <span className="text-[12px] font-medium truncate">
                                            {item.input?.place || 'Unknown Place'}
                                        </span>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div className="px-4 py-2.5 border-t border-[#e9ddb8] flex items-center justify-between">
                                    <span className="kh-card-label text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors">
{t("history.view_result")}
              </span>
                                    <ChevronRight className="kh-card-arrow w-3.5 h-3.5 text-gray-300 transition-all" />
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
                            {searchQuery ? 'No Matching Records' : 'No Records Yet'}
                        </h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-7 leading-relaxed font-sans">
                            {searchQuery ?
            "No records found matching your search term. Try another name." :
            "You haven't generated any Lal Kitab reports yet. Explore ancient remedies starting with your first calculation."}
                        </p>
                        {!searchQuery &&
          <button
            onClick={() => router.push('/lal-kitab?new=1')}
            className="px-6 py-3 rounded-lg text-white text-[13px] font-semibold transition-all"
            style={{ background: '#b8962e' }}>
{t("history.start_first_calculation")}

          </button>
          }
                    </div>)
        }
            </div>
        </div>);

}