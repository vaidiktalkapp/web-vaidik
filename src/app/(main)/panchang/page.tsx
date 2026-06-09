'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Wind,
  Droplets,
  Sparkles,
  Navigation,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Sunrise,
  Sunset,
  MoonStar,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  CalendarDays,
  Timer,
  Eye,
  Download,
  Flame } from
'lucide-react';
import { downloadPanchangPDF } from '@/lib/panchangPdfGenerator';
import { toast } from 'react-hot-toast';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import dynamic from 'next/dynamic';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

interface KaranaDetail {
  name: string;
  end: string;
}

interface PanchangData {
  tithi: string;
  tithi_end: string;
  paksha: string;
  nakshatra: string;
  nakshatra_end: string;
  yoga: string;
  yoga_end?: string;
  karana: string;
  karana_details?: KaranaDetail[];
  vara: string;
  sun_sign: string;
  moon_sign: string;
  ritu: string;
  sun_rise: string;
  sun_set: string;
  moon_rise: string;
  moon_set: string;
  muhurats: {abhijit: string;rahu_kaal: string;};
  is_auspicious: boolean;
  is_inauspicious: boolean;
  status: string;
  is_kharmas?: boolean;
  is_venus_combust?: boolean;
  is_jupiter_combust?: boolean;
  is_sankranti?: boolean;
  planets?: Record<string, number>;
  date?: string;
  day?: number;
}

// ── Tithi descriptions removed, now handled by translation keys ──

// ── Nakshatra quick-reference ──
const NAKSHATRA_LORDS: Record<string, string> = {
  'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
  'Mrigashira': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
  'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
  'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
  'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
  'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
  'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
};

// ── Yoga nature nature labels are now translated ──
const YOGA_NATURE_KEY: Record<string, string> = {
  'Vishkumbha': 'inauspicious', 'Preeti': 'auspicious', 'Ayushman': 'auspicious',
  'Saubhagya': 'auspicious', 'Shobhana': 'auspicious', 'Atiganda': 'inauspicious',
  'Sukarma': 'auspicious', 'Dhriti': 'auspicious', 'Shoola': 'inauspicious',
  'Ganda': 'inauspicious', 'Vriddhi': 'auspicious', 'Dhruva': 'auspicious',
  'Vyaghata': 'inauspicious', 'Harshana': 'auspicious', 'Vajra': 'inauspicious',
  'Siddhi': 'auspicious', 'Vyatipata': 'inauspicious', 'Variyan': 'auspicious',
  'Parigha': 'inauspicious', 'Shiva': 'auspicious', 'Siddha': 'auspicious',
  'Sadhya': 'auspicious', 'Shubha': 'auspicious', 'Shukla': 'auspicious',
  'Brahma': 'auspicious', 'Indra': 'auspicious', 'Vaidhriti': 'inauspicious'
};

export default function PanchangPage() {
    const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, place: 'Delhi, India' });

  useEffect(() => {
    setIsMounted(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          place: t("panchang.current_location")
        }));
      }, () => {});
    }
  }, []);

  const fetchPanchang = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const tzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/astrology/today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: location.lat, lon: location.lon, tzone, date: dateStr })
      });
      const result = await response.json();
      if (result.success) {
        setPanchangData(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch Panchang data');
      }
    } catch (error) {
      console.error('Panchang fetch error:', error);
      toast.error('Could not connect to the astrology engine');
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon]);

  useEffect(() => {
    if (isMounted) {
      fetchPanchang(selectedDate);
    }
  }, [isMounted, selectedDate, fetchPanchang]);

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };
  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };
  const goToToday = () => setSelectedDate(new Date());

  const handleDownloadPDF = async () => {
    if (!panchangData) return;
    await downloadPanchangPDF({
      location: location.place,
      date: selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      panchang: {
        tithi: panchangData.tithi,
        nakshatra: panchangData.nakshatra,
        yoga: panchangData.yoga,
        karana: panchangData.karana,
        day: panchangData.vara,
        sunrise: panchangData.sun_rise,
        sunset: panchangData.sun_set,
        moonrise: panchangData.moon_rise,
        moonset: panchangData.moon_set,
      },
      auspicious: {
        abhijit: panchangData.muhurats.abhijit,
        amrit_kaal: '--', 
      },
      inauspicious: {
        rahu_kaal: panchangData.muhurats.rahu_kaal,
        gulika_kaal: '--',
        yamaganda: '--',
      }
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  if (!isMounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  // ── Helpers ──
  const formatTime12h = (timeStr: string) => {
    if (!timeStr || timeStr === '--:--') return '--:--';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  const tithiBaseName = panchangData?.tithi?.replace(/ \(K\)$/, '') || '';
  const tithiInfoText = t(`panchang.tithi.${tithiBaseName}`) || '';
  const [tithiDeity, tithiNature] = tithiInfoText.includes('|') ? tithiInfoText.split('|').map(s => s.trim()) : [tithiInfoText, ''];
  const nakshatraLord = NAKSHATRA_LORDS[panchangData?.nakshatra || ''] || '';
  const yogaNatureKey = YOGA_NATURE_KEY[panchangData?.yoga || ''] || 'neutral';
  const yogaNatureLabel = t(`panchang.${yogaNatureKey}`);

  // ── Card Component ──
  const PanchangCard = ({ icon: Icon, iconColor, label, value, subValue, badge, badgeColor, children


  }: {icon: any;iconColor: string;label: string;value: string;subValue?: string;badge?: string;badgeColor?: string;children?: React.ReactNode;}) =>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-[#d6c89a] overflow-hidden"
    style={{ background: '#fffdf5' }}>
    
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#d6c89a]"
          style={{ background: 'rgba(184,150,46,0.08)' }}>
                            <Icon className="w-5 h-5" style={{ color: iconColor }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">{label}</p>
                            <p className="text-lg font-semibold text-gray-900 leading-tight">{value}</p>
                        </div>
                    </div>
                    {badge &&
        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
        style={{
          background: badgeColor === 'green' ? 'rgba(34,197,94,0.1)' : badgeColor === 'red' ? 'rgba(239,68,68,0.08)' : 'rgba(184,150,46,0.1)',
          color: badgeColor === 'green' ? '#15803d' : badgeColor === 'red' ? '#b91c1c' : '#b8962e',
          border: `1px solid ${badgeColor === 'green' ? 'rgba(34,197,94,0.2)' : badgeColor === 'red' ? 'rgba(239,68,68,0.15)' : 'rgba(184,150,46,0.2)'}`
        }}>
                            {badge}
                        </span>
        }
                </div>
                {subValue &&
      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
                        <Clock className="w-3 h-3 text-[#b8962e]" />
                        <span>{t("panchang.ends_at")}<span className="font-semibold text-gray-700">{formatTime12h(subValue)}</span></span>
                    </div>
      }
                {children}
            </div>
        </motion.div>;


  return (
    <div className="min-h-screen panchang-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{
        __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

                .panchang-wrap { font-family: 'Inter', sans-serif !important; }
                .panchang-wrap h1, .panchang-wrap h2, .panchang-wrap .serif { font-family: 'Inter', sans-serif !important; }

                .panchang-geo > div, .panchang-geo .geoapify-container { width: 100% !important; }
                .panchang-geo .geoapify-autocomplete-input {
                    color: #111827 !important; font-weight: 400 !important; background: transparent !important;
                    border: 1px solid #d6c89a !important; border-radius: 8px !important;
                    padding: 10px 16px 10px 36px !important; font-size: 13px !important;
                    font-family: 'Inter', sans-serif !important; width: 100% !important;
                    box-sizing: border-box !important; line-height: 1.5 !important; box-shadow: none !important;
                }
                .panchang-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                .panchang-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important; box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important; outline: none !important;
                }
                .panchang-geo .geoapify-autocomplete-items {
                    background-color: #fffdf5 !important; color: #111827 !important;
                    border: 1px solid #d6c89a !important; border-radius: 10px !important;
                    z-index: 9999 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                    font-size: 12px !important; font-family: 'Inter', sans-serif !important;
                }
                .panchang-geo .geoapify-autocomplete-item { padding: 9px 14px !important; cursor: pointer !important; }
                .panchang-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }

                .glow-pulse {
                    animation: glowPulse 3s ease-in-out infinite;
                }
                @keyframes glowPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(184,150,46,0); }
                    50% { box-shadow: 0 0 20px 4px rgba(184,150,46,0.12); }
                }
            ` }} />

            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10">

                    {/* ═══════════════ PAGE HEADER ═══════════════ */}
                    <div className="mb-8 pb-6 border-b border-[#d6c89a]">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            <div>
                                <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{t("panchang.vedic_astronomical_almanac")}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-1">
{t("panchang.panchang")}
                </h1>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <Navigation className="w-3 h-3 text-[#b8962e]" />
                                    <span>{t("panchang.showing_for")}<span className="text-[#b8962e] font-semibold">{location.place}</span></span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                {/* Location Search */}
                                <div className="relative panchang-geo" style={{ width: '220px', flexShrink: 0 }}>
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-[#b8962e]" />
                                    <GeoapifyGeocoderAutocomplete
                    placeholder="Search city..."
                    value={location.place}
                    debounceDelay={300}
                    placeSelect={(value: any) => {
                      if (value && value.properties) {
                        setLocation({ place: value.properties.formatted, lat: value.properties.lat, lon: value.properties.lon });
                      }
                    }} />
                  
                                </div>

                                {/* Date Navigator */}
                                <div className="flex items-center gap-1 px-1 py-1 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}>
                                    <button onClick={goToPrevDay} className="p-1.5 rounded-md hover:bg-[#f5e9c8] transition-all text-gray-600 hover:text-[#7a6010] active:scale-95">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="px-4 text-center min-w-[140px]">
                                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#b8962e]">
                                            {selectedDate.toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' })}
                                        </div>
                                        <div className="text-base font-semibold text-gray-900 leading-none">
                                            {selectedDate.toLocaleDateString(t('common.locale_code') === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <button onClick={goToNextDay} className="p-1.5 rounded-md hover:bg-[#f5e9c8] transition-all text-gray-600 hover:text-[#7a6010] active:scale-95">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-6 mx-1" style={{ background: '#d6c89a' }} />
                                    <button
                    onClick={goToToday}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all active:scale-95 ${isToday ? 'text-white' : 'text-[#b8962e] hover:bg-[#f5e9c8]'}`}
                    style={isToday ? { background: '#b8962e' } : {}}>
{t("panchang.today")}

                  </button>
                                </div>

                                <PaidPDFButton 
                                    toolKey="panchang"
                                    reportName={`Panchang - ${selectedDate.toLocaleDateString()}`}
                                    downloadFn={handleDownloadPDF}
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════ LOADING STATE ═══════════════ */}
                    {loading &&
          <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[#d6c89a] glow-pulse" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#b8962e' }} />
                            </div>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#b8962e' }}>
{t("panchang.calculating_panchang")}
            </span>
                        </div>
          }

                    {/* ═══════════════ MAIN CONTENT ═══════════════ */}
                    {!loading && panchangData &&
          <AnimatePresence mode="wait">
                            <motion.div
              id="panchang-report"
              key={selectedDate.toISOString().split('T')[0]}
              className="bg-white p-4 md:p-8 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>
              
                                {/* ── Day Status Banner ── */}
                                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl flex items-center gap-4 border"
                style={{
                  background: panchangData.is_auspicious ?
                  'rgba(34,197,94,0.06)' :
                  panchangData.is_inauspicious ?
                  'rgba(239,68,68,0.05)' :
                  'rgba(184,150,46,0.05)',
                  borderColor: panchangData.is_auspicious ?
                  'rgba(34,197,94,0.2)' :
                  panchangData.is_inauspicious ?
                  'rgba(239,68,68,0.15)' :
                  '#d6c89a'
                }}>
                
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#d6c89a]"
                style={{ background: '#fffdf5' }}>
                                        {panchangData.is_auspicious ?
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                  panchangData.is_inauspicious ?
                  <AlertCircle className="w-5 h-5 text-red-600" /> :
                  <Info className="w-5 h-5 text-[#b8962e]" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-0.5">{t("panchang.day_summary")}</p>
                                        <p className="text-sm font-semibold"
                  style={{
                    color: panchangData.is_auspicious ? '#15803d' : panchangData.is_inauspicious ? '#b91c1c' : '#7a6010'
                  }}>
                                            {panchangData.is_auspicious ?
                    t("panchang.day_favorable") :
                    panchangData.is_inauspicious ?
                    t("panchang.day_unfavorable") :
                    t("panchang.day_regular")}
                                        </p>
                                    </div>
                                    {/* Alerts */}
                                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                                        {panchangData.is_sankranti &&
                  <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{t("panchang.sankranti")}</span>
                  }
                                        {panchangData.is_kharmas &&
                  <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{t("panchang.kharmas")}</span>
                  }
                                    </div>
                                </motion.div>

                                {/* ── 4 Core Panchang Cards ── */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                                    {/* TITHI */}
                                    <PanchangCard
                  icon={Moon}
                  iconColor="#8b5cf6"
                  label="Tithi"
                  value={panchangData.tithi}
                  subValue={panchangData.tithi_end}
                  badge={panchangData.paksha}
                  badgeColor={panchangData.paksha === 'Shukla' ? 'green' : 'gold'}>
                  
                                        {tithiInfoText &&
                  <div className="mt-2 p-3 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b8962e] mb-1">{t("panchang.ruling_deity")}</p>
                                                <p className="text-[12px] font-semibold text-gray-800">{tithiDeity}</p>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">{tithiNature}</p>
                                            </div>
                  }
                                    </PanchangCard>

                                    {/* NAKSHATRA */}
                                    <PanchangCard
                  icon={Star}
                  iconColor="#f59e0b"
                  label="Nakshatra"
                  value={panchangData.nakshatra}
                  subValue={panchangData.nakshatra_end}
                  badge={nakshatraLord ? `Lord: ${nakshatraLord}` : undefined}
                  badgeColor="gold">
                  
                                        <div className="mt-2 p-3 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b8962e] mb-1">{t("panchang.moon_sign")}</p>
                                            <p className="text-[12px] font-semibold text-gray-800">{panchangData.moon_sign}</p>
                                        </div>
                                    </PanchangCard>

                                    {/* YOGA */}
                                    <PanchangCard
                  icon={Wind}
                  iconColor="#3b82f6"
                  label="Yoga"
                  value={panchangData.yoga}
                  subValue={panchangData.yoga_end}
                  badge={yogaNatureLabel}
                  badgeColor={yogaNatureKey === 'auspicious' ? 'green' : yogaNatureKey === 'inauspicious' ? 'red' : 'gold'}>
                  
                                        <div className="mt-2 p-3 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b8962e] mb-1">{t("panchang.sun_sign")}</p>
                                            <p className="text-[12px] font-semibold text-gray-800">{panchangData.sun_sign}</p>
                                        </div>
                                    </PanchangCard>

                                    {/* KARANA */}
                                    <PanchangCard
                  icon={Droplets}
                  iconColor="#14b8a6"
                  label="Karana"
                  value={panchangData.karana_details?.[0]?.name || panchangData.karana}
                  subValue={panchangData.karana_details?.[0]?.end}>
                  
                                        {panchangData.karana_details && panchangData.karana_details.length > 1 &&
                  <div className="mt-2 p-3 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b8962e] mb-1">{t("panchang.2nd_karana")}</p>
                                                <p className="text-[12px] font-semibold text-gray-800">{panchangData.karana_details[1].name}</p>
                                                <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                                                    <Clock className="w-3 h-3 text-[#b8962e]" />
                                                    <span>{t("panchang.ends_at")}{formatTime12h(panchangData.karana_details[1].end)}</span>
                                                </div>
                                            </div>
                  }
                                    </PanchangCard>
                                </div>

                                {/* ── Bottom Grid: Sun/Moon & Key Timings ── */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                                    {/* Sun & Moon Times */}
                                    <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-[#d6c89a] overflow-hidden"
                  style={{ background: '#fffdf5' }}>
                  
                                        <div className="px-5 py-3.5 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                            <div className="flex items-center gap-2">
                                                <Sun className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[13px] font-semibold text-gray-800">{t("panchang.sun_moon")}</span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                      { label: t("panchang.sunrise"), value: panchangData.sun_rise, icon: Sunrise, color: '#f59e0b' },
                      { label: t("panchang.sunset"), value: panchangData.sun_set, icon: Sunset, color: '#ef4444' },
                      { label: t("panchang.moonrise"), value: panchangData.moon_rise, icon: MoonStar, color: '#6366f1' },
                      { label: t("panchang.moonset"), value: panchangData.moon_set, icon: Moon, color: '#8b5cf6' }].
                      map((item, i) =>
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.03)' }}>
                                                        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(184,150,46,0.08)', border: '1px solid #e9ddb8' }}>
                                                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                                                            <p className="text-[14px] font-semibold text-gray-900">{formatTime12h(item.value)}</p>
                                                        </div>
                                                    </div>
                      )}
                                            </div>

                                            {/* Day Duration */}
                                            <div className="mt-4 p-3 rounded-lg border border-[#e9ddb8] flex items-center justify-between" style={{ background: 'rgba(184,150,46,0.03)' }}>
                                                <div className="flex items-center gap-2">
                                                    <Timer className="w-3.5 h-3.5 text-[#b8962e]" />
                                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{t("panchang.day_length")}</span>
                                                </div>
                                                <span className="text-[13px] font-semibold text-gray-800">
                                                    {(() => {
                          if (!panchangData.sun_rise || !panchangData.sun_set || panchangData.sun_rise === '--:--') return '--';
                          const [rh, rm] = panchangData.sun_rise.split(':').map(Number);
                          const [sh, sm] = panchangData.sun_set.split(':').map(Number);
                          const diff = sh * 60 + sm - (rh * 60 + rm);
                          return `${Math.floor(diff / 60)}h ${diff % 60}m`;
                        })()}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Key Timings */}
                                    <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-[#d6c89a] overflow-hidden"
                  style={{ background: '#fffdf5' }}>
                  
                                        <div className="px-5 py-3.5 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[13px] font-semibold text-gray-800">{t("panchang.key_timings")}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            {/* Abhijit Muhurat */}
                                            <div className="p-4 rounded-lg border border-emerald-200" style={{ background: 'rgba(34,197,94,0.04)' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">{t("panchang.abhijit_muhurat")}</p>
                                                </div>
                                                <p className="text-[15px] font-semibold text-gray-900">{panchangData.muhurats?.abhijit || '--:--'}</p>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
{t("panchang.most_auspicious_time_of_the_da")}
                      </p>
                                            </div>

                                            {/* Rahu Kaal */}
                                            <div className="p-4 rounded-lg border border-red-200" style={{ background: 'rgba(239,68,68,0.03)' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">{t("panchang.rahu_kaal")}</p>
                                                </div>
                                                <p className="text-[15px] font-semibold text-gray-900">{panchangData.muhurats?.rahu_kaal || '--:--'}</p>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
{t("panchang.inauspicious_window_avoid_new")}
                      </p>
                                            </div>

                                            {/* Vara */}
                                            <div className="p-4 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CalendarDays className="w-3.5 h-3.5 text-[#b8962e]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b8962e]">{t("panchang.vara_day")}</p>
                                                </div>
                                                <p className="text-[15px] font-semibold text-gray-900">{panchangData.vara}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Additional Info */}
                                    <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border border-[#d6c89a] overflow-hidden"
                  style={{ background: '#fffdf5' }}>
                  
                                        <div className="px-5 py-3.5 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[13px] font-semibold text-gray-800">{t("panchang.additional_details")}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {[
                    { label: t("panchang.ritu_season"), value: panchangData.ritu, icon: Flame, color: '#f97316' },
                    { label: t("panchang.sun_sign_rashi"), value: panchangData.sun_sign, icon: Sun, color: '#f59e0b' },
                    { label: t("panchang.moon_sign_rashi"), value: panchangData.moon_sign, icon: Moon, color: '#6366f1' },
                    { label: t("panchang.paksha"), value: panchangData.paksha, icon: MoonStar, color: '#8b5cf6' }].
                    map((item, i) =>
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#e9ddb8]" style={{ background: 'rgba(184,150,46,0.03)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(184,150,46,0.08)', border: '1px solid #e9ddb8' }}>
                                                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                                        </div>
                                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{item.label}</span>
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-gray-900">{item.value}</span>
                                                </div>
                    )}

                                            {/* Special Alerts */}
                                            {(panchangData.is_venus_combust || panchangData.is_jupiter_combust || panchangData.is_kharmas || panchangData.is_sankranti) &&
                    <div className="mt-2 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b8962e] px-1">{t("panchang.alerts")}</p>
                                                    {panchangData.is_venus_combust &&
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 text-[11px] font-medium text-amber-800">
                                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{t("panchang.venus_combust_avoid_marriage_r")}
                      </div>
                      }
                                                    {panchangData.is_jupiter_combust &&
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 text-[11px] font-medium text-amber-800">
                                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{t("panchang.jupiter_combust_spiritual_prac")}
                      </div>
                      }
                                                    {panchangData.is_kharmas &&
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-red-200 bg-red-50/50 text-[11px] font-medium text-red-800">
                                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{t("panchang.kharmas_period_auspicious_cere")}
                      </div>
                      }
                                                    {panchangData.is_sankranti &&
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 text-[11px] font-medium text-blue-800">
                                                            <Info className="w-3.5 h-3.5 flex-shrink-0" />{t("panchang.sankranti_sun_is_changing_sign")}
                      </div>
                      }
                                                </div>
                    }
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
          }

                    {/* ── Empty State ── */}
                    {!loading && !panchangData &&
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.06)' }}>
                                <Moon className="w-7 h-7 text-[#b8962e] opacity-50" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-gray-700">{t("panchang.could_not_load_panchang")}</h3>
                            <p className="text-[13px] text-gray-400">{t("panchang.please_check_your_connection_a")}</p>
                            <button onClick={() => fetchPanchang(selectedDate)} className="mt-2 px-5 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ background: '#b8962e' }}>
{t("panchang.retry")}
            </button>
                        </div>
          }
                </div>
            </GeoapifyContext>
        </div>);

}