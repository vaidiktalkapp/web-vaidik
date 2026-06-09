'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Calendar, Clock, Sun, Moon,
  Star, ChevronDown, ChevronUp, Heart, Briefcase, Home, Loader2 } from
'lucide-react';
import { toast } from 'react-hot-toast';
import { muhuratStorage } from '@/lib/muhuratStorage';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const CATEGORY_META: Record<string, {label: string;icon: any;color: string;}> = {
  marriage: { label: 'Marriage Muhurat', icon: Heart, color: 'text-rose-500' },
  business: { label: 'Business Muhurat', icon: Briefcase, color: 'text-amber-600' },
  housewarming: { label: 'Housewarming Muhurat', icon: Home, color: 'text-emerald-600' }
};



function MuhuratCard({ date, index }: {date: any;index: number;}) {
    const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(date.date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const dayName = new Date(date.date).toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border border-[#e8dbb8]/50 rounded-[2.5rem] overflow-hidden bg-white/80 shadow-sm hover:shadow-xl hover:border-[#b8962e]/30 transition-all duration-300 group">
      
            <div className="p-8">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-[15px] text-[#b8962e] font-bold serif">{dayName}</p>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 serif leading-none">{formattedDate}</h3>
                    </div>
                </div>

                {/* Panchang Summary Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
          { label: 'Tithi', val: date.tithi, sub: `${date.paksha} Paksha` },
          { label: 'Nakshatra', val: date.nakshatra },
          { label: 'Yoga', val: date.yoga },
          { label: 'Karana', val: date.karana }].
          map((item, i) =>
          <div key={i} className="bg-white border border-[#e8dbb8]/40 rounded-3xl p-5 shadow-sm">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-2">{item.label}</p>
                            <p className="text-[14px] font-bold text-gray-800 leading-tight mb-1">{item.val}</p>
                            {item.sub && <p className="text-[11px] text-[#b8962e] font-semibold serif">{item.sub}</p>}
                        </div>
          )}
                </div>

                {/* Timing & AI Row */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap gap-6 text-[13px] text-gray-600 bg-white/50 border border-[#e8dbb8]/30 px-6 py-4 rounded-3xl">
                            <span className="flex items-center gap-2.5">
                                <Sun className="w-4 h-4 text-amber-500" />
{t("result.sunrise")}<strong className="text-gray-900">{date.sun_rise}</strong>
                            </span>
                            <div className="w-px h-4 bg-[#e8dbb8]/40 hidden sm:block" />
                            <span className="flex items-center gap-2.5">
                                <Sun className="w-4 h-4 text-orange-400 shadow-sm" />
{t("result.sunset")}<strong className="text-gray-900">{date.sun_set}</strong>
                            </span>
                            {date.abhijit_muhurat && !['None', 'N/A'].includes(date.abhijit_muhurat) &&
              <>
                                    <div className="w-px h-4 bg-[#e8dbb8]/40 hidden sm:block" />
                                    <span className="flex items-center gap-2.5">
                                        <Sparkles className="w-4 h-4 text-[#b8962e]" />
{t("result.abhijit_window")}<strong className="text-[#b8962e]">{date.abhijit_muhurat}</strong>
                                    </span>
                                </>
              }
                        </div>

                        {/* Divine AI Verdict */}
                        {date.aiVerdict &&
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50/50 via-white to-[#fdf6e3]/30 border border-indigo-100 shadow-sm relative overflow-hidden group/ai">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/ai:opacity-20 transition-opacity">
                                    <Sparkles className="w-16 h-16 text-indigo-400" />
                                </div>
                                
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.25em]">{t("result.refined_astrological_pulse")}</h4>
                                        <p className="text-gray-800 text-[14px] leading-relaxed font-medium">
                                            "{date.aiVerdict}"
                                        </p>
                                    </div>
                                </div>
                            </div>
            }
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-[#e8dbb8]/40 pt-6">
                    <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2.5 text-[13px] font-bold text-[#b8962e] hover:bg-[#b8962e]/5 px-5 py-2.5 rounded-full transition-all group/btn">
            
                        {expanded ?
            <ChevronUp className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" /> :

            <ChevronDown className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
            }
                        {expanded ? 'Hide Astrological Rationale' : 'Analyze Why This date is Auspicious'}
                    </button>
                    
                    {date.isFullDay &&
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                            <Sun className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t("result.full_day_auspiciousness")}</span>
                        </div>
          }
                </div>

                <AnimatePresence>
                    {expanded &&
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest pl-2">{t("result.positive_yoga")}</p>
                                    <div className="space-y-2">
                                        {date.reasons_good?.map((r: string, i: number) =>
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                                                    <span className="text-emerald-600 text-[10px] font-black leading-none">✓</span>
                                                </div>
                                                <span className="text-emerald-900 text-[13px] font-medium serif">{r}</span>
                                            </div>
                  )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-2">{t("result.cautions")}</p>
                                    <div className="space-y-2">
                                        {date.rahu_kaal && date.rahu_kaal !== 'N/A' &&
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
                                                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200 text-amber-600 text-[12px]">!</div>
                                                <div className="space-y-1">
                                                    <p className="text-amber-800 text-[13px] font-bold">{t("result.rahu_kaal_window")}</p>
                                                    <p className="text-amber-700/80 text-[12px] font-medium">{date.rahu_kaal}</p>
                                                    <p className="text-amber-900/60 text-[11px] leading-relaxed font-medium">{t("result.starting_ventures_during_this")}</p>
                                                </div>
                                            </div>
                  }
                                        {(!date.reasons_bad || date.reasons_bad.length === 0) &&
                  <div className="h-full flex items-center justify-center p-8 border border-dashed border-[#e8dbb8] rounded-3xl opacity-40">
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-[#b8962e]">{t("result.no_severe_afflictions")}</p>
                                            </div>
                  }
                                    </div>
                                </div>
                            </div>
                        </motion.div>
          }
                </AnimatePresence>
            </div>
    </motion.div>);

}

// Fixed Sub-component for a single month to handle background data fetching
function MuhuratMonthGrid({
  monthKey,
  allDates,
  location}: {monthKey: string;allDates: any[];location: {lat: number;lon: number;tzone: number;};}) {
  const [monthData, setMonthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [year, month] = monthKey.split('-').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const startDay = firstDayOfMonth.getDay();
  const monthLabel = firstDayOfMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => prevMonthLastDate - startDay + i + 1);

  const nextMonthBlanks = (7 - (startDay + lastDayOfMonth) % 7) % 7;
  const nextMonthDays = Array.from({ length: nextMonthBlanks }, (_, i) => i + 1);

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const fetchMonthPanchang = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/astrology/calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year,
            month,
            lat: location.lat,
            lon: location.lon,
            tzone: location.tzone
          })
        });
        const result = await response.json();
        if (result.success) setMonthData(result.data);
      } catch (error) {
        console.error('Failed to fetch background panchang:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthPanchang();
  }, [monthKey, location.lat, location.lon, location.tzone, month, year]);

  return (
    <div className="rounded-3xl overflow-hidden border border-[#d6c89a]/50 shadow-sm w-full bg-[#fffdf5]/50 backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-[#d6c89a]/30 flex justify-between items-center bg-[#b8962e]/5">
                <h3 className="text-[16px] font-bold text-gray-900 serif">{monthLabel}</h3>
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#b8962e] opacity-40" /> : <Calendar className="w-4 h-4 text-[#b8962e] opacity-40" />}
            </div>

            <div className="grid grid-cols-7 border-b border-[#d6c89a]/20 bg-[#b8962e]/[0.02]">
                {WEEKDAYS.map((wd) =>
        <div key={wd} className="py-2.5 text-center text-[10px] font-black text-[#b8962e]/70 uppercase tracking-widest">
                        {wd}
                    </div>
        )}
            </div>

            <div className="grid grid-cols-7">
                {prevMonthDays.map((d) =>
        <div key={`prev-${d}`} className="min-h-[90px] p-2 border-r border-b border-[#e9ddb8]/30 opacity-20 bg-[#b8962e]/[0.01] flex flex-col justify-between">
                        <span className="text-[11px] font-medium text-gray-400 self-end">{d}</span>
                    </div>
        )}

                {Array.from({ length: lastDayOfMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const searchInfo = allDates.find((d) => d.date.startsWith(dateStr));
          const baseInfo = monthData.find((d) => d.date === dateStr);
          const isAuspicious = !!searchInfo?.is_auspicious;

          return (
            <div
              key={dateStr}
              className="relative min-h-[90px] p-2 border-r border-b border-[#e9ddb8]/40 transition-all flex flex-col items-start justify-between group hover:bg-[#b8962e]/[0.03]"
              style={{ background: isAuspicious ? 'rgba(34,197,94,0.06)' : 'transparent' }}>
              
                            <span className="text-[13px] font-bold text-gray-700 self-end">
                                {day}
                            </span>

                            <div className="w-full leading-snug">
                                <div className="text-[10px] font-bold truncate text-gray-800">
                                    {(searchInfo?.tithi || baseInfo?.tithi || '').split('(')[0]}
                                </div>
                                <div className="text-[9px] font-semibold truncate uppercase tracking-tighter text-[#b8962e] opacity-80 serif">
                                    {searchInfo?.nakshatra || baseInfo?.nakshatra || ''}
                                </div>
                            </div>

                            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                {isAuspicious && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />}
                                {searchInfo?.aiVerdict && <Sparkles className="w-2.5 h-2.5 text-indigo-400" />}
                            </div>
                            
                            {isAuspicious &&
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500" />
              }
                        </div>);

        })}

                {nextMonthDays.map((d) =>
        <div key={`next-${d}`} className="min-h-[90px] p-2 border-r border-b border-[#e9ddb8]/30 opacity-20 bg-[#b8962e]/[0.01] flex flex-col justify-between">
                        <span className="text-[11px] font-medium text-gray-400 self-end">{d}</span>
                    </div>
        )}
            </div>
        </div>);

}

function MuhuratCalendar({ allDates, metadata }: {allDates: any[];metadata?: any;}) {
    const { t } = useTranslation();
  if (!allDates || allDates.length === 0) return null;

  const monthsSet = new Set<string>();
  allDates.forEach((d) => monthsSet.add(d.date.substring(0, 7)));
  const sortedMonths = Array.from(monthsSet).sort();

  const location = {
    lat: metadata?.location?.lat || 28.6139,
    lon: metadata?.location?.lon || 77.2090,
    tzone: metadata?.tzone || 5.5
  };

  return (
    <div className="space-y-10">
            <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-[#d6c89a]/40">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t("result.perfect_alignment")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t("result.regular_day")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t("result.divine_insight_available")}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {sortedMonths.map((monthKey) =>
        <MuhuratMonthGrid
          key={monthKey}
          monthKey={monthKey}
          allDates={allDates}
          location={location} />

        )}
            </div>
        </div>);

}

export default function MuhuratResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />}>
            <MuhuratResultContent />
        </Suspense>);

}

function MuhuratResultContent() {
    const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [input, setInput] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('muhurat_input');
    if (!stored) {
      router.push('/muhurat');
      return;
    }
    const parsed = JSON.parse(stored);
    setInput(parsed);

    fetch(`${API_BASE}/astrology/muhurat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: parsed.category,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        lat: parsed.lat,
        lon: parsed.lon,
        tzone: parsed.tzone
      })
    }).
    then((res) => res.json()).
    then((data) => {
      if (data.success) {
        setResult(data.data);
        muhuratStorage.saveHistory({
          category: parsed.category,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          lat: parsed.lat,
          lon: parsed.lon,
          tzone: parsed.tzone,
          place: parsed.place
        });
      } else {
        setError(data.message || 'Calculation failed');
        toast.error('Failed to calculate muhurat');
      }
    }).
    catch((err) => {
      setError(err.message || 'Network error');
      toast.error('Could not connect to server');
    }).
    finally(() => setLoading(false));
  }, [router]);

  const categoryMeta = CATEGORY_META[input?.category || 'marriage'];
  const CatIcon = categoryMeta?.icon || Sparkles;

  if (!mounted) return <div className="min-h-screen py-16 px-4 sm:px-6 relative" style={{ backgroundColor: '#fdf6e3' }} />;

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 relative" style={{ backgroundColor: '#fdf6e3' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .mr-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .mr-wrap h1, .mr-wrap h2, .mr-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .anim-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            ` }} />

            <div className="max-w-5xl mx-auto mr-wrap">
                <div className="flex flex-col items-center text-center gap-6 mb-16">
                    <button
            onClick={() => router.push('/muhurat')}
            className="inline-flex items-center gap-2 group text-[#b8962e] font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full border border-[#b8962e]/20 bg-[#b8962e]/5 hover:bg-[#b8962e]/10 transition-all active:scale-95">
            
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
{t("result.modify_search_criteria")}
          </button>
                    
                    <div className="max-w-3xl">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="h-px w-8 bg-[#e8dbb8]" />
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-bold uppercase tracking-widest">
                                <CatIcon className={`w-4 h-4 ${categoryMeta?.color}`} />
                                {categoryMeta?.label || 'Muhurat Results'} 2026
                            </div>
                            <div className="h-px w-8 bg-[#e8dbb8]" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 serif leading-tight">{t("result.auspicious_dates_found")}</h1>
                        {input?.place &&
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 border border-[#e8dbb8]/40 shadow-sm text-gray-600 text-sm font-medium">
                                <Sun className="w-4 h-4 text-orange-400" />
                                <span>{t("result.calculated_for_celestial_align")}<strong className="text-gray-900">{input.place}</strong></span>
                            </div>
            }
                    </div>
                </div>

                {loading &&
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 rounded-[3rem] border border-dashed border-[#e8dbb8] shadow-sm">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 blur-xl bg-[#b8962e]/20 animate-pulse rounded-full" />
                            <Loader2 className="w-12 h-12 text-[#b8962e] animate-spin relative" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 serif">{t("result.scanning_panchang_data")}</h3>
                        <p className="text-gray-500 font-medium anim-pulse uppercase tracking-[0.2em] text-[11px]">{t("result.identifying_auspicious_moments")}</p>
                    </div>
        }

                {error && !loading &&
        <div className="bg-rose-50 border border-rose-200 rounded-[2.5rem] p-10 text-center shadow-sm">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                            <Star className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-rose-900 mb-4 serif">{t("result.calculation_notice")}</h2>
                        <p className="text-rose-700 font-medium mb-8 max-w-md mx-auto">{error}</p>
                        <button
            onClick={() => router.push('/muhurat')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200 transition-all hover:bg-rose-700">
            
                            <ArrowLeft className="w-4 h-4" />{t("result.try_different_parameters")}
          </button>
                    </div>
        }

                {result && !loading &&
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-7 rounded-[2.5rem] bg-white/60 border border-[#e8dbb8]/40 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em]">{t("result.panchang_scan")}</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#b8962e]" />
                                        <span className="text-[15px] font-bold text-gray-900">
                                            {result.summary?.total_scanned || 0}{t("result.days_analyzed")}
                  </span>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-[#e8dbb8]/30" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-[0.25em]">{t("result.discovery")}</p>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[15px] font-bold text-emerald-600">
                                            {result.summary?.total_auspicious || 0}{t("result.auspicious_dates")}
                  </span>
                                    </div>
                                </div>
                            </div>

                            <div className="inline-flex items-center p-1.5 rounded-2xl border border-[#e8dbb8]/60 bg-[#fdf6e3]/50 shadow-inner">
                                <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-8 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
                viewMode === 'list' ? 'bg-[#b8962e] text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`
                }>
{t("result.list_view")}

              </button>
                                <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-8 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
                viewMode === 'calendar' ? 'bg-[#b8962e] text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`
                }>
{t("result.grid_view")}

              </button>
                            </div>
                        </div>

                        {viewMode === 'list' ?
          <div className="space-y-8">
                                {result.auspicious_dates?.length > 0 ?
            result.auspicious_dates.map((d: any, i: number) =>
            <MuhuratCard key={d.date} date={d} index={i} />
            ) :

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-[4rem] p-24 text-center shadow-sm">
                                        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                                            <Sparkles className="w-12 h-12 text-amber-500" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-amber-900 mb-3 serif">{t("result.celestial_silence")}</h3>
                                        <p className="text-amber-700/80 font-medium mb-10 max-w-sm mx-auto text-[15px] leading-relaxed">
{t("result.no_ideal_celestial_alignments")}
              </p>
                                        <button
                onClick={() => router.push('/muhurat')}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#b8962e] text-white font-bold text-[15px] shadow-2xl shadow-amber-200 transition-all hover:scale-[1.03] active:scale-95">
{t("result.adjust_search_parameters")}

              </button>
                                    </div>
            }
                            </div> :

          <div className="bg-white/80 border border-[#e8dbb8]/40 rounded-[3rem] p-10 shadow-sm backdrop-blur-sm">
                                <MuhuratCalendar allDates={result.all_dates || []} metadata={result.metadata} />
                            </div>
          }
                    </motion.div>
        }
            </div>
        </div>);

}