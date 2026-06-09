'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Heart, Briefcase, Home,
  Trash2, ExternalLink, Sparkles, Clock, ChevronRight,
  Search } from
'lucide-react';
import { muhuratStorage, MuhuratHistoryItem } from '@/lib/muhuratStorage';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const CATEGORY_META: Record<string, {label: string;icon: any;color: string;bg: string;border: string;}> = {
  marriage: {
    label: 'Marriage Muhurat',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100'
  },
  business: {
    label: 'Business Muhurat',
    icon: Briefcase,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100'
  },
  housewarming: {
    label: 'Housewarming Muhurat',
    icon: Home,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  }
};

export default function MuhuratHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />}>
            <MuhuratHistoryContent />
        </Suspense>);

}

function MuhuratHistoryContent() {
    const { t } = useTranslation();
  const router = useRouter();
  const [history, setHistory] = useState<MuhuratHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    muhuratStorage.getHistory().then((data) => setHistory(data));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await muhuratStorage.deleteItem(id);
    const data = await muhuratStorage.getHistory();
    setHistory(data);
    toast.success('History item removed');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all Muhurat history?')) {
      muhuratStorage.clearHistory();
      setHistory([]);
      toast.success('History cleared');
    }
  };

  const handleView = (item: MuhuratHistoryItem) => {
    // Hydrate the input localStorage that the result page expects
    const muhuratInput = {
      category: item.category,
      startDate: item.startDate,
      endDate: item.endDate,
      lat: item.lat,
      lon: item.lon,
      tzone: item.tzone,
      place: item.place,
      timestamp: new Date().toISOString() // Fresh timestamp for this viewing
    };
    localStorage.setItem('muhurat_input', JSON.stringify(muhuratInput));
    router.push('/muhurat/result');
  };

  if (!mounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 z-10 relative" style={{ backgroundColor: '#fdf6e3' }}>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .mh-history * { font-family: 'Source Sans 3', sans-serif; }
                .mh-history h1, .mh-history .serif { font-family: 'Playfair Display', Georgia, serif; }
            ` }} />

            <div className="max-w-4xl mx-auto mh-history">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <button
              onClick={() => router.push('/muhurat')}
              className="flex items-center gap-2 text-[#b8962e] font-semibold text-sm mb-4 hover:underline">
              
                            <ArrowLeft className="w-4 h-4" />{t("history.back_to_calculator")}
            </button>
                        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="serif">{t("history.past_calculations")}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
{t("history.muhurat_history")}
            </h1>
                        <p className="text-gray-500 text-base mt-2">
{t("history.review_your_previously_scanned")}
            </p>
                    </div>

                    {history.length > 0 &&
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors">
            
                            <Trash2 className="w-4 h-4" />{t("history.clear_all_history")}
          </button>
          }
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {history.length > 0 ?
            history.map((item, idx) => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.marriage;
              const Icon = meta.icon;
              const dateStr = new Date(item.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleView(item)}
                  className="group relative bg-white/70 backdrop-blur-sm border border-[#e8dbb8]/60 rounded-2xl p-5 hover:shadow-md hover:border-[#d6c89a] transition-all cursor-pointer overflow-hidden">
                  
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.bg} ${meta.border} border`}>
                                                    <Icon className={`w-6 h-6 ${meta.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                        {meta.label}
                                                        <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {dateStr}
                                                        </span>
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-[13px] text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-[#b8962e]" /> {item.place?.split(',')[0] || 'Unknown'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-[#b8962e]" /> {item.startDate} to {item.endDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove from history">
                        
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#b8962e] bg-[#fdf6e3] group-hover:bg-[#b8962e] group-hover:text-white transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>);

            }) :

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/40 border-2 border-dashed border-[#e8dbb8] rounded-3xl p-16 text-center">
              
                                <div className="w-16 h-16 bg-[#fdf6e3] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-[#d6c89a]" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900 serif mb-2">{t("history.no_history_yet")}</h2>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8">
{t("history.your_scanned_muhurat_results_w")}
              </p>
                                <button
                onClick={() => router.push('/muhurat')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#b8962e] text-white rounded-xl font-bold hover:shadow-lg transition-all">
                
                                    <Sparkles className="w-4 h-4" />{t("history.start_first_scan")}
              </button>
                            </motion.div>
            }
                    </AnimatePresence>
                </div>

                {/* Footer Tip */}
                <p className="text-center text-xs text-gray-400 mt-12">
{t("history._history_is_stored_locally_in")}
        </p>
            </div>
        </div>);

}