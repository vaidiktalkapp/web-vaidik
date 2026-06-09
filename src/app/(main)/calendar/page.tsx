'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Star,
  Moon,
  Sun,
  Info,
  Sparkles,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin } from
'lucide-react';
import { toast } from 'react-hot-toast';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import dynamic from 'next/dynamic';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

interface CalendarDay {
  day: number;
  date: string;
  tithi: string;
  tithi_end: string;
  paksha: string;
  nakshatra: string;
  nakshatra_end: string;
  yoga: string;
  karana: string;
  vara: string;
  sun_sign: string;
  moon_sign: string;
  ritu: string;
  sun_rise: string;
  sun_set: string;
  moon_rise: string;
  moon_set: string;
  muhurats: {abhijit: string;rahu_kaal: string;};
  transitions: Array<{planet: string;from: string;to: string;}>;
  is_auspicious: boolean;
  is_inauspicious: boolean;
  status: string;
}

interface TodayPanchang extends CalendarDay {
  yoga_end?: string;
  karana_details?: Array<{name: string;end: string;}>;
}

export default function AstrologyCalendarPage() {
    const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [todayPanchang, setTodayPanchang] = useState<TodayPanchang | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, place: 'Delhi, India' });

  useEffect(() => {
    setIsMounted(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          place: t('common.current_location')
        }));
      }, () => {});
    }
  }, []);

  const fetchTodayPanchang = async () => {
    setTodayLoading(true);
    try {
      const tzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/astrology/today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: location.lat, lon: location.lon, tzone, date: todayStr })
      });
      const result = await response.json();
      if (result.success) setTodayPanchang(result.data);
    } catch (error) {
      console.error('Today Panchang fetch error:', error);
    } finally {
      setTodayLoading(false);
    }
  };

  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const tzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/astrology/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, lat: location.lat, lon: location.lon, tzone })
      });
      const result = await response.json();
      if (result.success) {
        setCalendarData(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch calendar data');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Could not connect to the astrology engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchCalendarData(currentDate);
      fetchTodayPanchang();
    }
  }, [isMounted, currentDate, location.lat]);

  useEffect(() => {
    if (calendarData.length > 0 && !selectedDay) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const today = calendarData.find((d) => d.date === todayStr);
      if (today) setSelectedDay(today);
    }
  }, [calendarData, selectedDay]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const todayStr = now.toLocaleDateString('en-CA');
    const today = calendarData.find((d) => d.date === todayStr);
    if (today) setSelectedDay(today);
  };

  if (!isMounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const blanksCount = firstDay;
  const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  const prevMonthDays = Array.from({ length: blanksCount }, (_, i) => prevMonthLastDate - blanksCount + i + 1);
  const totalCurrentDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const nextMonthBlanks = (7 - (blanksCount + totalCurrentDays) % 7) % 7;
  const nextMonthDays = Array.from({ length: nextMonthBlanks }, (_, i) => i + 1);

  // Panchang row component
  const PRow = ({ label, value, gold = false }: {label: string;value: string;gold?: boolean;}) =>
  <div className="flex items-start justify-between py-2.5 border-b border-[#e9ddb8] last:border-0 gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-wide shrink-0" style={{ color: gold ? '#b8962e' : '#6b7280', minWidth: '90px' }}>{label}</span>
            <span className="text-[13px] font-medium text-gray-900 text-right leading-snug">{value || '--'}</span>
        </div>;


  return (
    <div className="min-h-screen cal-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .cal-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .cal-wrap h1, .cal-wrap h2, .cal-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                /* Geocoder */
                .cal-geo > div, .cal-geo .geoapify-container { width: 100% !important; }
                .cal-geo .geoapify-autocomplete-input {
                    color: #111827 !important;
                    font-weight: 400 !important;
                    background: transparent !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 8px !important;
                    padding: 10px 16px 10px 36px !important;
                    font-size: 13px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    line-height: 1.5 !important;
                    box-shadow: none !important;
                }
                .cal-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                .cal-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }
                .cal-geo .geoapify-autocomplete-items {
                    background-color: #fffdf5 !important;
                    color: #111827 !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 10px !important;
                    z-index: 9999 !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                    font-size: 12px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                }
                .cal-geo .geoapify-autocomplete-item { padding: 9px 14px !important; cursor: pointer !important; }
                .cal-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }

                .cal-day-btn:hover { background: rgba(184,150,46,0.06) !important; }
            ` }} />

            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10">

                    {/* ── Page Header ── */}
                    <div className="mb-8 pb-6 border-b border-[#d6c89a]">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            <div>
                                <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span className="Roboto">{t("calendar.vedic_astronomical_insights")}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-1">
{t("calendar.astrology_calendar")}
                </h1>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <Navigation className="w-3 h-3 text-[#b8962e]" />
                                    <span>{t("calendar.showing_results_for")}<span className="text-[#b8962e] font-semibold">{location.place}</span></span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                {/* Location Search */}
                                <div className="relative cal-geo" style={{ width: '220px', flexShrink: 0 }}>
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-[#b8962e]" />
                                    <GeoapifyGeocoderAutocomplete
                    placeholder={t("common.search_city")}
                    value={location.place}
                    debounceDelay={300}
                    placeSelect={(value: any) => {
                      if (value && value.properties) {
                        setLocation({ place: value.properties.formatted, lat: value.properties.lat, lon: value.properties.lon });
                      }
                    }} />
                  
                                </div>

                                {/* Month Navigator */}
                                <div className="flex items-center gap-1 px-1 py-1 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}>
                                    <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-[#f5e9c8] transition-all text-gray-600 hover:text-[#7a6010] active:scale-95">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="px-4 text-center min-w-[110px]">
                                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#b8962e]">{year}</div>
                                        <div className="text-base font-semibold text-gray-900 leading-none">{monthName}</div>
                                    </div>
                                    <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-[#f5e9c8] transition-all text-gray-600 hover:text-[#7a6010] active:scale-95">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-6 mx-1" style={{ background: '#d6c89a' }} />
                                    <button
                    onClick={jumpToToday}
                    className="px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all active:scale-95 text-white"
                    style={{ background: '#b8962e' }}>
{t("calendar.today")}

                  </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 3-Column Dashboard ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                        {/* ── LEFT: Today's Panchang ── */}
                        <div className="xl:col-span-3">
                            <div className="rounded-xl overflow-hidden border border-[#d6c89a]">
                                {/* Panel header */}
                                <div className="px-5 py-4 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Sun className="w-4 h-4 text-[#b8962e]" />
                                        <span className="text-[13px] font-semibold text-gray-800">{t("calendar.panchang_for_today")}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        {new Date().toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                {todayLoading ?
                <div className="flex items-center justify-center py-16" style={{ background: '#fffdf5' }}>
                                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#b8962e' }} />
                                    </div> :
                todayPanchang ?
                <div className="p-4 space-y-4" style={{ background: '#fffdf5' }}>

                                        {/* Panchang Details */}
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#b8962e' }}>{t("calendar.panchang_details")}</p>
                                            <div className="space-y-0">
                                                <PRow label={t("calendar.tithi")} value={`${todayPanchang.tithi} ${t("common.upto")} ${todayPanchang.tithi_end}`} gold />
                                                <PRow label={t("calendar.paksha")} value={todayPanchang.paksha} />
                                                <PRow label={t("calendar.nakshatra")} value={`${todayPanchang.nakshatra} ${t("common.upto")} ${todayPanchang.nakshatra_end}`} gold />
                                                <PRow label={t("calendar.yoga")} value={`${todayPanchang.yoga}${todayPanchang.yoga_end ? ` ${t("common.upto")} ${todayPanchang.yoga_end}` : ''}`} gold />
                                                <PRow
                        label="Karana"
                        value={todayPanchang.karana_details ?
                        todayPanchang.karana_details.map((k) => `${k.name} upto ${k.end}`).join(', ') :
                        todayPanchang.karana}
                        gold />
                      
                                                <PRow label={t("common.day")} value={todayPanchang.vara} />
                                            </div>
                                        </div>

                                        <div className="border-t border-[#d6c89a]" />

                                        {/* Sun & Moon */}
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#b8962e' }}>{t("calendar.sun_moon")}</p>
                                            <div className="space-y-0">
                                                <PRow label={t("calendar.sun_rise")} value={todayPanchang.sun_rise} />
                                                <PRow label={t("calendar.sun_set")} value={todayPanchang.sun_set} />
                                                <PRow label={t("calendar.moon_rise")} value={todayPanchang.moon_rise} />
                                                <PRow label={t("calendar.moon_set")} value={todayPanchang.moon_set} />
                                                <PRow label={t("calendar.moon_sign")} value={todayPanchang.moon_sign} />
                                                <PRow label={t("calendar.ritu")} value={todayPanchang.ritu} />
                                            </div>
                                        </div>

                                        <div className="border-t border-[#d6c89a]" />

                                        {/* Key Timings */}
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#b8962e' }}>{t("calendar.key_timings")}</p>
                                            <div className="space-y-0">
                                                <PRow label={t("calendar.abhijit_muhurat")} value={todayPanchang.muhurats?.abhijit} gold />
                                                <PRow label={t("calendar.rahu_kaal")} value={todayPanchang.muhurats?.rahu_kaal} />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div
                    className="px-4 py-2.5 rounded-lg text-center text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      background: todayPanchang.is_auspicious ?
                      'rgba(34,197,94,0.1)' :
                      todayPanchang.is_inauspicious ?
                      'rgba(239,68,68,0.08)' :
                      'rgba(184,150,46,0.08)',
                      color: todayPanchang.is_auspicious ?
                      '#15803d' :
                      todayPanchang.is_inauspicious ?
                      '#b91c1c' :
                      '#b8962e',
                      border: `1px solid ${todayPanchang.is_auspicious ? 'rgba(34,197,94,0.2)' : todayPanchang.is_inauspicious ? 'rgba(239,68,68,0.2)' : '#d6c89a'}`
                    }}>
                    
                                            {todayPanchang.is_auspicious ? '✨ Auspicious Day' : todayPanchang.is_inauspicious ? '⚠ Inauspicious Day' : '○ Regular Day'}
                                        </div>
                                    </div> :

                <div className="p-8 text-center text-sm text-gray-400" style={{ background: '#fffdf5' }}>{t("calendar.could_not_load_today_s_panchan")}</div>
                }
                            </div>
                        </div>

                        {/* ── CENTER: Calendar Grid ── */}
                        <div className="xl:col-span-6 space-y-4">
                            <div className="rounded-xl overflow-hidden border border-[#d6c89a] relative" style={{ background: '#fffdf5' }}>
                                {loading && !calendarData.length &&
                <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'rgba(253,246,227,0.8)', backdropFilter: 'blur(4px)' }}>
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#b8962e' }} />
                                            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>{t("calendar.syncing_with_stars")}</span>
                                        </div>
                                    </div>
                }

                                {/* Days of week header */}
                                <div className="grid grid-cols-7 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) =>
                  <div key={d} className="py-3 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>
                                            {d}
                                        </div>
                  )}
                                </div>

                                {/* Calendar grid */}
                                <div className="grid grid-cols-7">
                                    {/* Prev month filler */}
                                    {prevMonthDays.map((day) =>
                  <div key={`prev-${day}`} className="aspect-square p-2 flex flex-col items-start border-r border-b border-[#e9ddb8] opacity-30" style={{ background: 'rgba(184,150,46,0.02)' }}>
                                            <span className="text-[10px] font-medium text-gray-400 self-end">{day}</span>
                                        </div>
                  )}

                                    {/* Current month days */}
                                    {calendarData.map((day) => {
                    const isToday = new Date().toDateString() === new Date(day.date).toDateString();
                    const isSelected = selectedDay?.date === day.date;
                    return (
                      <motion.button
                        key={day.date}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedDay(day)}
                        className="cal-day-btn relative aspect-square p-2 flex flex-col items-start justify-between border-r border-b border-[#e9ddb8] transition-all overflow-hidden text-left"
                        style={{
                          background: isSelected ?
                          'rgba(184,150,46,0.1)' :
                          isToday ?
                          'rgba(184,150,46,0.05)' :
                          'transparent',
                          boxShadow: isSelected ? 'inset 0 0 0 1.5px #b8962e' : undefined
                        }}>
                        
                                                {/* Date number */}
                                                <span
                          className="text-[13px] font-semibold self-end z-10"
                          style={{
                            color: isToday ? '#b8962e' : isSelected ? '#7a6010' : '#374151',
                            fontWeight: isToday ? 700 : undefined
                          }}>
                          
                                                    {day.day}
                                                </span>

                                                {/* Panchang snippet */}
                                                <div className="w-full z-10">
                                                    <div className="text-[9px] font-semibold truncate leading-tight" style={{ color: isSelected ? '#7a6010' : '#374151' }}>
                                                        {day.tithi}
                                                    </div>
                                                    <div className="text-[8px] font-medium truncate uppercase tracking-tight" style={{ color: isSelected ? '#b8962e' : '#7a6010' }}>
                                                        {day.nakshatra}
                                                    </div>
                                                </div>

                                                {/* Dot indicators */}
                                                <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-10">
                                                    {day.is_auspicious && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                                    {day.is_inauspicious && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                                    {day.transitions.length > 0 && <Star className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                                </div>
                                            </motion.button>);

                  })}

                                    {/* Next month filler */}
                                    {nextMonthDays.map((day) =>
                  <div key={`next-${day}`} className="aspect-square p-2 flex flex-col items-start border-r border-b border-[#e9ddb8] opacity-30" style={{ background: 'rgba(184,150,46,0.02)' }}>
                                            <span className="text-[10px] font-medium text-gray-400 self-end">{day}</span>
                                        </div>
                  )}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-5 py-3 px-5 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{t("calendar.auspicious")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{t("calendar.inauspicious")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{t("calendar.transit")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: '#b8962e' }} />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{t("calendar.today")}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Selected Day ── */}
                        <div className="xl:col-span-3">
                            <AnimatePresence mode="wait">
                                {selectedDay ?
                <motion.div
                  key={selectedDay.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl overflow-hidden border border-[#d6c89a]">
                  
                                        {/* Panel header */}
                                        <div className="px-5 py-4 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <CalendarIcon className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[13px] font-semibold text-gray-800">{t("calendar.day_insights")}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500">
                                                {new Date(selectedDay.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto" style={{ background: '#fffdf5' }}>

                                            {/* Panchang section */}
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Moon className="w-3.5 h-3.5 text-[#b8962e]" />
                                                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>{t("calendar.panchang")}</p>
                                                </div>
                                                <div className="space-y-0">
                                                    <PRow label="Tithi" value={`${selectedDay.tithi} upto ${selectedDay.tithi_end}`} gold />
                                                    <PRow label="Paksha" value={selectedDay.paksha} />
                                                    <PRow label="Nakshatra" value={`${selectedDay.nakshatra} upto ${selectedDay.nakshatra_end}`} gold />
                                                    <PRow label="Yoga" value={selectedDay.yoga} gold />
                                                    <PRow label="Karana" value={selectedDay.karana} gold />
                                                    <PRow label="Day" value={selectedDay.vara} />
                                                </div>
                                            </div>

                                            {/* Planetary Transits */}
                                            {selectedDay.transitions.length > 0 &&
                    <div>
                                                    <div className="border-t border-[#d6c89a] mb-4" />
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Star className="w-3.5 h-3.5 text-amber-500" />
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">{t("calendar.planetary_ingress")}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {selectedDay.transitions.map((t: any, idx: number) =>
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[#d6c89a]"
                          style={{ background: 'rgba(184,150,46,0.05)' }}>
                          
                                                                <div
                            className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{ background: '#b8962e', color: '#fff' }}>
                            
                                                                    {t.planet[0]}
                                                                </div>
                                                                <div>
                                                                    <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: '#b8962e' }}>{t.planet}</span>
                                                                    <span className="text-[12px] text-gray-700">
                                                                        {t.from} → <span className="font-semibold text-gray-900">{t.to}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                        )}
                                                    </div>
                                                </div>
                    }

                                            {/* Verdict */}
                                            <div className="border-t border-[#d6c89a]" />
                                            <div
                      className="p-3.5 rounded-lg flex items-center gap-3 border"
                      style={{
                        background: selectedDay.is_auspicious ?
                        'rgba(34,197,94,0.08)' :
                        selectedDay.is_inauspicious ?
                        'rgba(239,68,68,0.07)' :
                        'rgba(184,150,46,0.06)',
                        borderColor: selectedDay.is_auspicious ?
                        'rgba(34,197,94,0.2)' :
                        selectedDay.is_inauspicious ?
                        'rgba(239,68,68,0.2)' :
                        '#d6c89a'
                      }}>
                      
                                                <div
                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          background: '#fffdf5',
                          color: selectedDay.is_auspicious ? '#15803d' : selectedDay.is_inauspicious ? '#b91c1c' : '#b8962e',
                          border: '1px solid #d6c89a'
                        }}>
                        
                                                    {selectedDay.is_auspicious ?
                        <CheckCircle2 className="w-4 h-4" /> :
                        selectedDay.is_inauspicious ?
                        <AlertCircle className="w-4 h-4" /> :
                        <Info className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider block text-gray-400 mb-0.5">{t("calendar.note")}</span>
                                                    <span
                          className="text-[12px] font-semibold leading-tight block"
                          style={{ color: selectedDay.is_auspicious ? '#15803d' : selectedDay.is_inauspicious ? '#b91c1c' : '#7a6010' }}>
                          
                                                        {selectedDay.is_auspicious ?
                          'High cosmic resonance. Proceed with vital initiatives.' :
                          selectedDay.is_inauspicious ?
                          'Inauspicious alignments. Avoid major beginnings.' :
                          'Routine day. Focus on discipline.'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div> :

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl flex flex-col items-center justify-center p-10 text-center min-h-[400px] border border-dashed border-[#d6c89a]"
                  style={{ background: 'rgba(184,150,46,0.03)' }}>
                  
                                        <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border border-[#d6c89a]"
                    style={{ background: 'rgba(184,150,46,0.06)' }}>
                    
                                            <CalendarIcon className="w-6 h-6 text-[#b8962e] opacity-50" />
                                        </div>
                                        <h3 className="text-[15px] font-semibold text-gray-700 mb-1">{t("calendar.select_a_date")}</h3>
                                        <p className="text-[13px] text-gray-400">{t("calendar.click_any_day_to_view_detailed")}</p>
                                    </motion.div>
                }
                            </AnimatePresence>
                        </div>

                    </div>
                </div>
            </GeoapifyContext>
        </div>);

}