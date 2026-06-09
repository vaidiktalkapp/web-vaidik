'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Clock, Shield, Gem, Zap, Trash2, Search,
  Sparkles, Calendar, User, MapPin, ChevronRight, AlertTriangle,
  RotateCcw } from
'lucide-react';
import { getUnifiedHistory, deleteReportFromHistory, clearReportHistory, ReportHistoryEntry } from '@/lib/reportHistory';
import { historyApiService } from '@/lib/historyApiService';

const REPORT_META: Record<string, {labelKey: string;icon: React.ReactNode;color: string;bgColor: string;href: string;}> = {
  'kaal-sarp': {
    labelKey: "history.kaal_sarp_report",
    icon: <Shield className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    href: '/free-reports/kaal-sarp'
  },
  'gemstone': {
    labelKey: "history.gemstone_report",
    icon: <Gem className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/free-reports/gemstone'
  },
  'sade-sati': {
    labelKey: "history.sade_sati_analysis",
    icon: <Zap className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    href: '/free-reports/sade-sati'
  }
};

type FilterType = 'all' | 'sade-sati' | 'kaal-sarp' | 'gemstone';

export default function ReportHistoryPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchHistory = async () => {
      setSyncing(true);
      const data = await getUnifiedHistory();
      setHistory(data);
      setSyncing(false);
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteReportFromHistory(id);
    const data = await getUnifiedHistory();
    setHistory(data);
  };

  const handleClearAll = async () => {
    await clearReportHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const filtered = history.filter((entry) => {
    const matchesFilter = filter === 'all' || entry.type === filter;
    const matchesSearch = !searchQuery ||
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.place?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("history.just_now");
    if (diffMins < 60) return `${diffMins}${t("history.m_ago")}`;
    if (diffHours < 24) return `${diffHours}${t("history.h_ago")}`;
    if (diffDays < 7) return `${diffDays}${t("history.d_ago")}`;
    return d.toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Count per type
  const counts = {
    all: history.length,
    'sade-sati': history.filter((e) => e.type === 'sade-sati').length,
    'kaal-sarp': history.filter((e) => e.type === 'kaal-sarp').length,
    'gemstone': history.filter((e) => e.type === 'gemstone').length
  };

  return (
    <div className="min-h-screen pt-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .hist-wrap { font-family: 'Source Sans 3', sans-serif; }
                .hist-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
            `}</style>

            <div className="max-w-5xl mx-auto px-6 hist-wrap">
                {/* Header */}
                <div className="mb-10">
                    <Link href="/free-reports" className="text-[#b8962e] hover:text-[#7a6010] font-bold flex items-center gap-2 mb-4 text-sm">
                        <ChevronLeft className="w-4 h-4" />{t("history.back_to_reports")}
          </Link>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#b8962e] text-[10px] font-black uppercase tracking-widest mb-3 border border-[#d6c89a]/30">
                                <Clock className="w-3.5 h-3.5" />{t("history.report_history")}
              </div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-semibold text-gray-900 serif">
{t("history.your")}<span className="text-[#b8962e]">{t("history.reports")}</span>
                                </h1>
                                {syncing &&
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-sky-50 text-sky-600 text-[10px] font-bold animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
{t("history.syncing_cloud")}
                </div>
                }
                            </div>
                            <p className="text-gray-500 text-[15px] mt-2">{t("history.all_your_previously_generated")}</p>
                        </div>
                        {history.length > 0 &&
            <div className="flex gap-2">
                                {!showClearConfirm ?
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 text-rose-600 text-[13px] font-bold hover:bg-rose-50 transition-all">
                
                                        <Trash2 className="w-3.5 h-3.5" />{t("history.clear_all")}
              </button> :

              <div className="flex items-center gap-2">
                                        <span className="text-[12px] text-rose-600 font-medium">{t("history.delete_all_reports")}</span>
                                        <button onClick={handleClearAll} className="px-3 py-2 rounded-lg bg-rose-500 text-white text-[12px] font-bold hover:bg-rose-600 transition-all">
{t("history.yes_delete")}
                </button>
                                        <button onClick={() => setShowClearConfirm(false)} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-bold hover:bg-gray-50 transition-all">
{t("history.cancel")}
                </button>
                                    </div>
              }
                            </div>
            }
                    </div>
                </div>

                {/* Filters & Search */}
                {history.length > 0 &&
        <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Type Filters */}
                        <div className="flex gap-2 flex-wrap">
                            {([
            { key: 'all', label: t("history.all_reports") },
            { key: 'sade-sati', label: t("history.sade_sati_analysis") },
            { key: 'kaal-sarp', label: t("history.kaal_sarp_report") },
            { key: 'gemstone', label: t("history.gemstone_report") }] as
            {key: FilterType;label: string;}[]).map((f) =>
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all border ${
              filter === f.key ?
              'bg-[#b8962e] text-white border-[#b8962e]' :
              'bg-white text-gray-600 border-[#d6c89a] hover:border-[#b8962e]'}`
              }>
              
                                    {f.label}
                                    <span className={`ml-1.5 text-[11px] ${filter === f.key ? 'text-white/70' : 'text-gray-400'}`}>
                                        {counts[f.key]}
                                    </span>
                                </button>
            )}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:max-w-xs md:ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
              type="text"
              placeholder={t("history.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#d6c89a] bg-white text-gray-900 text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15 transition-all" />
            
                        </div>
                    </div>
        }

                {/* Content */}
                {!mounted ?
        <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-[#b8962e]/30 border-t-[#b8962e] rounded-full animate-spin" />
                    </div> :
        history.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-16 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[#fdf6e3] flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-[#d6c89a]" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 serif mb-3">{t("history.no_reports_yet")}</h2>
                        <p className="text-gray-500 text-[15px] mb-8 max-w-md mx-auto">
{t("history.generate_your_first_free_astro")}
          </p>
                        <Link
            href="/free-reports"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#b8962e] text-white font-bold rounded-xl hover:bg-[#7a6010] transition-all shadow-md">
            
                            <Sparkles className="w-4 h-4" />{t("history.generate_a_report")}
          </Link>
                    </div>) :
        filtered.length === 0 ? (
        /* No results for current filter */
        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-12 text-center">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("history.no_matching_reports")}</h3>
                        <p className="text-gray-500 text-[14px]">{t("history.try_a_different_filter_or_sear")}</p>
                        <button
            onClick={() => {setFilter('all');setSearchQuery('');}}
            className="mt-4 inline-flex items-center gap-2 text-[#b8962e] font-bold text-[13px] hover:text-[#7a6010] transition-colors">
            
                            <RotateCcw className="w-3.5 h-3.5" />{t("history.reset_filters")}
          </button>
                    </div>) : (

        /* Report Cards */
        <div className="space-y-3">
                        {filtered.map((entry) => {
            const meta = REPORT_META[entry.type];
            return (
              <div
                key={entry.id}
                onClick={() => {
                  // Save stored report data to sessionStorage so the report page picks it up
                  const storageKey = `freereport_${entry.type.replace('-', '')}`;
                  try {sessionStorage.setItem(storageKey, JSON.stringify(entry.data));} catch {}
                  router.push(meta.href);
                }}
                className="group bg-white rounded-xl border border-[#d6c89a] hover:border-[#b8962e] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl ${meta.bgColor} ${meta.color} flex items-center justify-center flex-shrink-0`}>
                                            {meta.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>
                                                    {t(meta.labelKey)}
                                                </span>
                                                <span className="text-[10px] text-gray-300">•</span>
                                                <span className="text-[10px] text-gray-400 font-medium" title={formatFullDate(entry.timestamp)} suppressHydrationWarning>
                                                    {formatDate(entry.timestamp)}
                                                </span>
                                            </div>
                                            <h3 className="text-[15px] font-bold text-gray-900 truncate">{entry.summary}</h3>
                                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                                <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                                    <User className="w-3 h-3" /> {entry.name}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                                    <Calendar className="w-3 h-3" /> {entry.date}
                                                </span>
                                                {entry.place &&
                      <span className="flex items-center gap-1.5 text-[12px] text-gray-500 truncate max-w-[200px]">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" /> {entry.place}
                                                    </span>
                      }
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#fdf6e3] text-[#b8962e] text-[12px] font-bold border border-[#d6c89a]/50 group-hover:bg-[#b8962e] group-hover:text-white transition-all">
{t("history.view_report")}
                      <ChevronRight className="w-3 h-3" />
                                            </span>
                                            <button
                      onClick={(e) => {e.stopPropagation();handleDelete(entry.id);}}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      title="Delete report">
                      
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>);

          })}
                    </div>)
        }

                {/* Bottom CTA */}
                {history.length > 0 &&
        <div className="mt-12 p-8 bg-white rounded-2xl border border-[#d6c89a] shadow-sm text-center">
                        <p className="text-gray-500 text-[14px] mb-4">{t("history.want_deeper_insights_our_exper")}</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link href="/free-reports" className="px-6 py-3 bg-[#b8962e] text-white font-bold rounded-xl hover:bg-[#7a6010] transition-all text-[14px] flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />{t("history.new_report")}
            </Link>
                            <Link href="/astrologers-chat" className="px-6 py-3 bg-white text-gray-900 border border-[#d6c89a] font-bold rounded-xl hover:bg-gray-50 transition-all text-[14px]">
{t("history.consult_an_expert")}
            </Link>
                        </div>
                    </div>
        }
            </div>
        </div>);

}