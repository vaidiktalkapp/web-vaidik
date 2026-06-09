'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Loader2,
  Activity,
  Compass,
  Calendar as CalendarIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import dynamic from 'next/dynamic';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import PaidPDFButton from '@/components/shared/PaidPDFButton';
import { downloadRahuKaalPDF } from '@/lib/rahuKaalPdfGenerator';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

interface RahuData {
  date: string;
  day: string;
  rahu_kaal: string;
  is_today?: boolean;
}

interface LocationState {
  lat: number;
  lon: number;
  place: string;
}

export default function RahuKaalPage() {
    const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    lat: 28.6139,
    lon: 77.2090,
    place: 'New Delhi, India'
  });
  const [rahuToday, setRahuToday] = useState<string | null>(null);
  const [weeklyRahu, setWeeklyRahu] = useState<RahuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRahuNow, setIsRahuNow] = useState(false);
  const [timeToNext, setTimeToNext] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vaidik-server.onrender.com';
  const tzone = 5.5;

  useEffect(() => {
    setIsMounted(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          place: t("rahu_kaal.active_location")
        }));
      }, () => {});
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const resToday = await fetch(`${API_URL}/astrology/today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: location.lat, lon: location.lon, tzone, date: todayStr })
      });
      const dataToday = await resToday.json();
      if (dataToday.success) {
        setRahuToday(dataToday.data.muhurats.rahu_kaal);
      }

      const date = new Date();
      const resCal = await fetch(`${API_URL}/astrology/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          lat: location.lat,
          lon: location.lon,
          tzone
        })
      });
      const dataCal = await resCal.json();
      if (dataCal.success) {
        const todayIdx = date.getDate() - 1;
        let daysData = dataCal.data.slice(todayIdx, todayIdx + 7);

        if (daysData.length < 7) {
          const nextMonthDate = new Date(date);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          const resNextMonth = await fetch(`${API_URL}/astrology/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              year: nextMonthDate.getFullYear(),
              month: nextMonthDate.getMonth() + 1,
              lat: location.lat,
              lon: location.lon,
              tzone
            })
          });
          const dataNextMonth = await resNextMonth.json();
          if (dataNextMonth.success) {
            const needed = 7 - daysData.length;
            daysData = [...daysData, ...dataNextMonth.data.slice(0, needed)];
          }
        }

        const next7Days = daysData.map((d: any) => ({
          date: d.date,
          day: d.vara,
          rahu_kaal: d.muhurats.rahu_kaal,
          is_today: d.date === todayStr
        }));
        setWeeklyRahu(next7Days);
      }
    } catch (error) {
      console.error('Rahu Kaal fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) fetchData();
  }, [isMounted, location.lat, location.lon]);

  useEffect(() => {
    if (!rahuToday) return;
    const [startStr, endStr] = rahuToday.split(' - ');
    const now = currentTime;
    const parseTime = (timeStr: string) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      const d = new Date(now);
      d.setHours(h, m, s, 0);
      return d;
    };
    const startTime = parseTime(startStr);
    const endTime = parseTime(endStr);

    if (now >= startTime && now <= endTime) {
      setIsRahuNow(true);
      const diff = endTime.getTime() - now.getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor(diff % 60000 / 1000);
      setTimeToNext(`${mins}m ${secs}s ${t("rahu_kaal.left")}`);
    } else {
      setIsRahuNow(false);
      if (now < startTime) {
        const diff = startTime.getTime() - now.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor(diff % 3600000 / 60000);
        setTimeToNext(`${t("rahu_kaal.starts_in")} ${hrs}h ${mins}m`);
      } else {setTimeToNext(t("rahu_kaal.cycles_complete"));}
    }
  }, [rahuToday, currentTime]);

  if (!isMounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  return (
    <div className="min-h-screen pb-24 rk-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .rk-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .rk-wrap h1, .rk-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                /* Geocoder */
                .rk-geo > div, .rk-geo .geoapify-container { width: 100% !important; }
                .rk-geo .geoapify-autocomplete-input {
                    color: #111827 !important;
                    font-weight: 400 !important;
                    background: transparent !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 8px !important;
                    padding: 11px 16px 11px 38px !important;
                    font-size: 14px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    line-height: 1.5 !important;
                    box-shadow: none !important;
                }
                .rk-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                .rk-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }
                .rk-geo .geoapify-autocomplete-items {
                    background-color: #fffdf5 !important;
                    color: #111827 !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 10px !important;
                    z-index: 9999 !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                    font-size: 13px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                }
                .rk-geo .geoapify-autocomplete-item { padding: 10px 16px !important; cursor: pointer !important; }
                .rk-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }
            ` }} />

            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

                    {/* Page Header */}
                    <div className="mb-6 pb-6 border-b border-[#d6c89a]">
                        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="serif">{t("rahu_kaal.rahu_kaal")}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            {/* Title + location stacked */}
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900 leading-tight whitespace-nowrap">
{t("rahu_kaal.rahu_kaal_today")}
                </h1>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                                    <MapPin className="w-3 h-3 text-[#b8962e]" />
                                    <span>{location.place}</span>
                                </div>
                            </div>

                            {/* Location Selector — aligned to top of title */}
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="relative rk-geo" style={{ width: "256px" }}>
                                    <Compass className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-[#b8962e]" />
                                    <GeoapifyGeocoderAutocomplete
                                        placeholder={t("rahu_kaal.change_location")}
                                        value={location.place}
                                        debounceDelay={300}
                                        placeSelect={(value: any) => {
                                            if (value?.properties) {
                                                setLocation({ place: value.properties.formatted, lat: value.properties.lat, lon: value.properties.lon });
                                            }
                                        }} 
                                    />
                                </div>
                                
                                <PaidPDFButton 
                                    toolKey="rahu-kaal"
                                    reportName={`Rahu Kaal Report - ${location.place}`}
                                    downloadFn={async () => {
                                        await downloadRahuKaalPDF({
                                            location: location.place,
                                            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
                                            rahuToday: rahuToday || '--:-- to --:--',
                                            weeklyRahu: weeklyRahu
                                        });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Monitor Card */}
                    <div className="mb-8">
                        <div
              className="rounded-xl p-6 sm:p-8 transition-all duration-500"
              style={{
                background: '#ffffff',
                border: '1px solid #d6c89a'
              }}>
              
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                                {/* Left: Window info */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isRahuNow ? '#b8441e' : '#b8962e' }}>
                      
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-0.5"
                        style={{ color: '#b8962e' }}>
{t("rahu_kaal.inauspicious_window")}

                      </p>
                                            <p
                        className="text-xl sm:text-2xl font-semibold tracking-tight"
                        style={{ color: '#111827' }}>
                        
                                                {rahuToday || '--:-- to --:--'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span
                        className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                        style={{
                          background: isRahuNow ? '#b8441e' : 'rgba(34,197,94,0.12)',
                          color: isRahuNow ? '#fff' : '#15803d'
                        }}>
                        
                                                {isRahuNow ? t("rahu_kaal.active") : t("rahu_kaal.safe_zone")}
                                            </span>
                                            <span
                        className="text-xs font-medium"
                        style={{ color: '#6b7280' }}>
                        
                                                {timeToNext}
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div
                      className="h-1.5 w-full rounded-full overflow-hidden"
                      style={{ background: '#e9ddb8' }}>
                      
                                            <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isRahuNow ? '100%' : '30%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: isRahuNow ? '#b8441e' : '#b8962e' }} />
                      
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Clock */}
                                <div className="flex flex-col items-start md:items-end md:text-right">
                                    <p
                    className="text-[11px] font-semibold uppercase tracking-widest mb-1.5"
                    style={{ color: '#b8962e' }}>
{t("rahu_kaal.system_time")}

                  </p>
                                    <p
                    className="text-3xl sm:text-4xl font-semibold tracking-tight font-mono"
                    style={{ color: '#111827' }}>
                    
                                        {currentTime.toLocaleTimeString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        <span className="text-lg ml-1" style={{ opacity: 0.4, color: '#111827' }}>
                                            :{currentTime.getSeconds().toString().padStart(2, '0')}
                                        </span>
                                    </p>
                                    <div
                    className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: '#b8962e' }}>
                    
                                        <Activity className="w-3 h-3" />{t("rahu_kaal.astronomical_precision")}
                  </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7-Day Table */}
                    <div className="space-y-5">
                        {/* Section header */}
                        <div className="flex items-center gap-2 pb-3 border-b border-[#d6c89a]">
                            <CalendarIcon className="w-4 h-4 text-[#b8962e]" />
                            <span className="text-[15px] font-semibold text-gray-800">{t("rahu_kaal.7_day_timing_table")}</span>
                        </div>

                        {/* Table */}
                        <div className="rounded-xl overflow-hidden border border-[#d6c89a]">
                            {/* Table head */}
                            <div
                className="grid grid-cols-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#b8962e]"
                style={{ background: '#ffffff', borderBottom: '1px solid #d6c89a' }}>
                
                                <div>{t("rahu_kaal.calendar_entry")}</div>
                                <div className="text-right">{t("rahu_kaal.transit_window")}</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-[#e9ddb8]">
                                {loading ?
                <div className="p-12 flex flex-col items-center justify-center gap-3" style={{ background: '#ffffff' }}>
                                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#b8962e' }} />
                                        <span className="text-sm text-gray-500">{t("rahu_kaal.syncing_data")}</span>
                                    </div> :
                weeklyRahu.map((item, i) =>
                <div
                  key={i}
                  className="grid grid-cols-2 px-5 py-4 items-center transition-all"
                  style={{
                    background: '#ffffff',
                    borderLeft: item.is_today ? '3px solid #b8962e' : '3px solid transparent'
                  }}>
                  
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[15px] font-semibold text-gray-900">{item.date}</span>
                                            <span
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: item.is_today ? '#b8962e' : '#9ca3af' }}>
                      
                                                {t(`common.days.${item.day}`)}
                                                {item.is_today &&
                      <span className="ml-2 normal-case tracking-normal font-medium" style={{ color: '#b8962e' }}>
{t("rahu_kaal._today")}
                      </span>
                      }
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold"
                      style={{
                        background: item.is_today ? '#b8962e' : 'rgba(184,150,46,0.1)',
                        color: item.is_today ? '#fff' : '#111827'
                      }}>
                      
                                                <Clock className="w-3.5 h-3.5" />
                                                {item.rahu_kaal}
                                            </span>
                                        </div>
                                    </div>
                )}
                            </div>
                        </div>
                    </div>

                </div>
            </GeoapifyContext>
        </div>);

}