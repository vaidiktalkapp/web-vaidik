'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Loader2,
  Activity,
  Compass,
  Star,
  Navigation,
  Info,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2 } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import dynamic from 'next/dynamic';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import PaidPDFButton from '@/components/shared/PaidPDFButton';
import { downloadPlanetsPDF } from '@/lib/planetsPdfGenerator';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

import { historyApiService } from '@/lib/historyApiService';

interface Transit {
  planet: string;
  from: string;
  to: string;
  date: string;
}

interface PlanetPosition {
  name: string;
  sign: string;
  degree: string;
  house: number;
  is_retrograde: boolean;
}

interface LocationState {
  lat: number;
  lon: number;
  place: string;
}

export default function PlanetsPage() {
    const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    lat: 28.6139,
    lon: 77.2090,
    place: 'New Delhi, India'
  });
  const [positions, setPositions] = useState<PlanetPosition[]>([]);
  const [transits, setTransits] = useState<Transit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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
          place: 'Active Location'
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
      const resToday = await fetch(`${API_URL}/astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: String(location.lat), 
          lon: String(location.lon), 
          tzone, 
          date: todayStr,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          name: 'Transit Monitor'
        })
      });
      const dataToday = await resToday.json();

      let currentPositions: PlanetPosition[] = [];
      if (dataToday.success && dataToday.data?.planets) {
        const p = dataToday.data.planets;
        currentPositions = [
          { name: 'Sun', sign: p.Sun?.sign || '...', degree: p.Sun?.longitude_dms || '...', house: p.Sun?.house || 1, is_retrograde: false },
          { name: 'Moon', sign: p.Moon?.sign || '...', degree: p.Moon?.longitude_dms || '...', house: p.Moon?.house || 1, is_retrograde: false },
          { name: 'Mars', sign: p.Mars?.sign || '...', degree: p.Mars?.longitude_dms || '...', house: p.Mars?.house || 1, is_retrograde: p.Mars?.is_retrograde },
          { name: 'Mercury', sign: p.Mercury?.sign || '...', degree: p.Mercury?.longitude_dms || '...', house: p.Mercury?.house || 1, is_retrograde: p.Mercury?.is_retrograde },
          { name: 'Jupiter', sign: p.Jupiter?.sign || '...', degree: p.Jupiter?.longitude_dms || '...', house: p.Jupiter?.house || 1, is_retrograde: p.Jupiter?.is_retrograde },
          { name: 'Venus', sign: p.Venus?.sign || '...', degree: p.Venus?.longitude_dms || '...', house: p.Venus?.house || 1, is_retrograde: p.Venus?.is_retrograde },
          { name: 'Saturn', sign: p.Saturn?.sign || '...', degree: p.Saturn?.longitude_dms || '...', house: p.Saturn?.house || 1, is_retrograde: p.Saturn?.is_retrograde },
          { name: 'Rahu', sign: p.Rahu?.sign || '...', degree: p.Rahu?.longitude_dms || '...', house: p.Rahu?.house || 1, is_retrograde: true },
          { name: 'Ketu', sign: p.Ketu?.sign || '...', degree: p.Ketu?.longitude_dms || '...', house: p.Ketu?.house || 1, is_retrograde: true }
        ];
        setPositions(currentPositions);
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
        const allTransits: Transit[] = [];
        dataCal.data.forEach((day: any) => {
          day.transitions.forEach((t: any) => {
            allTransits.push({ ...t, date: day.date });
          });
        });
        setTransits(allTransits.slice(0, 8));
      }

      // Save planetary snapshot to history
      if (historyApiService.isAuthenticated() && currentPositions.length > 0) {
        await historyApiService.saveHistory('planets', {
          place: location.place,
          lat: location.lat,
          lon: location.lon,
          positions: currentPositions.map((p) => ({ name: p.name, sign: p.sign, degree: p.degree })),
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Planets fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) fetchData();
  }, [isMounted, location.lat, location.lon]);

  if (!isMounted) return <div className="min-h-screen bg-stone-50" />;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24">
            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 border-b border-stone-200 pb-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">{t("planets.planetary_transit_monitor")}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">{t("planets.planetary_positions")}</h1>
                            <div className="flex items-center gap-2 pt-1.5">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                <span className="text-xs font-medium text-stone-500">{location.place}</span>
                            </div>
                        </div>

                        {/* Location Control */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-3 bg-white p-2 border border-stone-200 rounded-xl w-full lg:w-72 shadow-sm">
                                <div className="relative w-full">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-stone-400">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <GeoapifyGeocoderAutocomplete
                                        placeholder="Search location for ingress..."
                                        value={location.place}
                                        debounceDelay={300}
                                        placeSelect={(value: any) => {
                                            if (value?.properties) {
                                                setLocation({ place: value.properties.formatted, lat: value.properties.lat, lon: value.properties.lon });
                                            }
                                        }} 
                                    />
                                </div>
                            </div>

                            <PaidPDFButton 
                                toolKey="planets"
                                reportName={`Planetary Transit - ${location.place}`}
                                downloadFn={async () => {
                                    await downloadPlanetsPDF({
                                        location: location.place,
                                        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
                                        positions,
                                        transits
                                    });
                                }}
                                variant="outline"
                                size="sm"
                                className="px-6 h-[44px] w-full sm:w-auto"
                            />
                        </div>
                    </div>

                    {loading ?
          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-stone-300 animate-spin" />
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t("planets.intercepting_signal")}</p>
                        </div> :

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Current Positions Grid */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {positions.map((planet, i) =>
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
                  
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-stone-900 tracking-tight">{planet.name}</h3>
                                                </div>
                                                {planet.is_retrograde &&
                    <div title="Retrograde" className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                                        <Activity className="w-3 h-3 text-red-500" />
                                                    </div>
                    }
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{t("planets.sign")}</span>
                                                    <span className="text-xs font-semibold text-stone-900">{planet.sign}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{t("planets.degree")}</span>
                                                    <span className="text-xs font-mono font-medium text-blue-600">{planet.degree}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{t("planets.house")}</span>
                                                    <span className="text-xs font-semibold text-stone-700">{planet.house}H</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-50">
                                                <div className="h-1 w-full bg-stone-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-stone-200 w-[45%]" />
                                                </div>
                                            </div>
                                        </motion.div>
                )}
                                </div>

                                {/* Zodiac Summary */}
                                <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Navigation className="w-5 h-5 text-stone-400" />
                                        <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">{t("planets.transit_intelligence")}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                                <p className="text-xs leading-relaxed text-stone-600 font-medium">
                                                    <span className="text-stone-950 font-bold block mb-1 uppercase tracking-wider text-[10px]">{t("planets.benefic_alignment")}</span>
{t("planets.jupiter_in_taurus_is_creating")}
                      </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                                <p className="text-xs leading-relaxed text-stone-600 font-medium">
                                                    <span className="text-stone-950 font-bold block mb-1 uppercase tracking-wider text-[10px]">{t("planets.retrograde_warning")}</span>
{t("planets.mercury_in_aquarius_retrograde")}
                      </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transit Feed Column */}
                            <div className="lg:col-span-4 space-y-6">
                                
                                {/* Live Transition Feed */}
                                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden sticky top-8">
                                    <div className="p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                                        <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-stone-400" />{t("planets.transit_log")}
                  </h3>
                                        <span className="text-[8px] font-bold text-stone-400 uppercase bg-white px-2 py-1 rounded-full border border-stone-100">{t("planets.live")}</span>
                                    </div>
                                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                                        <AnimatePresence>
                                            {transits.map((transit, i) =>
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4">
                      
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                            <Star className="w-4 h-4" />
                                                        </div>
                                                        {i < transits.length - 1 && <div className="w-px h-12 bg-stone-100 mt-2" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{transit.planet}{t("planets.ingress")}</span>
                                                            <span className="text-[8px] font-bold text-stone-300 uppercase shrink-0">{transit.date}</span>
                                                        </div>
                                                        <p className="text-xs font-semibold text-stone-900">
                                                            <span className="text-stone-400 font-medium">{transit.from}</span> → <span className="text-blue-600">{transit.to}</span>
                                                        </p>
                                                        <p className="text-[9px] text-stone-400 font-medium leading-relaxed pt-1">{t("planets.major_shift_in_collective_ener")}</p>
                                                    </div>
                                                </motion.div>
                    )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="p-4 bg-stone-900 text-white/50 text-[10px] text-center font-bold uppercase tracking-widest">
{t("planets.system_updated")}{currentTime.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-4 h-4 opacity-50" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t("planets.monitoring_note")}</span>
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed opacity-90">
{t("planets.plantary_transits_are_calculat")}
                </p>
                                </div>
                            </div>
                        </div>
          }
                </div>
            </GeoapifyContext>

            <style dangerouslySetInnerHTML={{ __html: `
                .geoapify-autocomplete-input {
                    color: #1c1917 !important;
                    font-weight: 500 !important;
                    width: 100% !important;
                    padding: 0.625rem 1rem 0.625rem 2.5rem !important;
                    border-radius: 0.5rem !important;
                    border: 1px solid #e7e5e4 !important;
                    outline: none !important;
                    transition: all 0.2s ease !important;
                    font-size: 13px !important;
                    background: transparent !important;
                }
                .geoapify-autocomplete-input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                }
                .geoapify-autocomplete-items {
                    background-color: #ffffff !important;
                    color: #1c1917 !important;
                    border: 1px solid #e7e5e4 !important;
                    border-top: none !important;
                    border-radius: 0 0 0.5rem 0.5rem !important;
                    overflow: hidden !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
                    z-index: 100 !important;
                }
                .geoapify-autocomplete-item {
                    padding: 10px 16px !important;
                    font-size: 13px !important;
                }
            ` }} />
        </div>);

}