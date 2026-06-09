'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Clock, Heart, Briefcase, Home, Sparkles,
  ArrowRight, ChevronDown, ChevronUp, Star, Baby, Car,
  Building2, Hammer, Scissors, GraduationCap, Utensils } from
'lucide-react';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { historyApiService } from '@/lib/historyApiService';
import { toast } from 'react-hot-toast';
import { muhuratStorage } from '@/lib/muhuratStorage';
import { birthDetailsStore } from '@/lib/birthDetailsStore';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const DEFAULT_CATEGORIES = [
{
  id: 'marriage',
  label: 'Marriage Muhurat',
  subtitle: 'Vivah Muhurat',
  icon: Heart,
  description: 'Find the most auspicious dates for your wedding ceremony based on Vedic Panchang.',
  gradient: 'from-rose-500/10 to-pink-500/10',
  iconColor: 'text-rose-500',
  borderColor: 'border-rose-200',
  activeBg: 'bg-rose-50'
},
{
  id: 'business',
  label: 'Business Muhurat',
  subtitle: 'Vyapar Muhurat',
  icon: Briefcase,
  description: 'Launch your business or sign important deals on the most favorable dates.',
  gradient: 'from-amber-500/10 to-orange-500/10',
  iconColor: 'text-amber-600',
  borderColor: 'border-amber-200',
  activeBg: 'bg-amber-50'
},
{
  id: 'housewarming',
  label: 'Housewarming Muhurat',
  subtitle: 'Griha Pravesh',
  icon: Home,
  description: 'Enter your new home at the perfect moment for prosperity and happiness.',
  gradient: 'from-emerald-500/10 to-teal-500/10',
  iconColor: 'text-emerald-600',
  borderColor: 'border-emerald-200',
  activeBg: 'bg-emerald-50'
}];


import { Suspense } from 'react';

function MuhuratForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('marriage');
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    place: '',
    lat: '',
    lon: '',
    tzone: 5.5
  });

  // Default: next 30 days
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(thirtyDaysLater);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/astrology/muhurat/categories`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const mapped = data.data.map((c: any, index: number) => {
            let IconComp = Calendar;
            const slug = c.slug.toLowerCase();
            if (slug.includes('marriage')) IconComp = Heart;else
            if (slug.includes('business')) IconComp = Briefcase;else
            if (slug.includes('housewarming')) IconComp = Home;else
            if (slug.includes('naming') || slug.includes('namkaran')) IconComp = Baby;else
            if (slug.includes('vehicle')) IconComp = Car;else
            if (slug.includes('property')) IconComp = Building2;else
            if (slug.includes('engagement')) IconComp = Star;else
            if (slug.includes('foundation')) IconComp = Hammer;else
            if (slug.includes('tonsure') || slug.includes('mundan')) IconComp = Scissors;else
            if (slug.includes('education')) IconComp = GraduationCap;else
            if (slug.includes('food') || slug.includes('annaprashan')) IconComp = Utensils;

            const colorSets = [
            { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-500/10 to-orange-500/10' },
            { text: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', gradient: 'from-rose-500/10 to-pink-500/10' },
            { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-500/10 to-teal-500/10' },
            { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', gradient: 'from-indigo-500/10 to-purple-500/10' },
            { text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', gradient: 'from-sky-500/10 to-blue-500/10' },
            { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', gradient: 'from-violet-500/10 to-fuchsia-500/10' }];


            const colorSet = colorSets[index % colorSets.length];

            return {
              id: c.slug,
              label: c.name,
              subtitle: c.subtitle || c.name,
              icon: IconComp,
              description: c.description || 'Find the most auspicious dates for this event based on Vedic timings.',
              gradient: colorSet.gradient,
              iconColor: colorSet.text,
              borderColor: colorSet.border,
              activeBg: colorSet.bg
            };
          });
          setCategories(mapped);

          // Only change if not manual selection
          if (!searchParams.get('cat') && !mapped.find((m: any) => m.id === selectedCategory)) {
            setSelectedCategory(mapped[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();

    // Handle pre-selection from URL
    const catFromUrl = searchParams.get('cat');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
      const scrollElement = document.getElementById('muhurat-form');
      if (scrollElement) {
        setTimeout(() => scrollElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
      }
    }

    const tz = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
    setFormData((prev) => ({ ...prev, tzone: tz }));

    // Load location from global store
    const stored = birthDetailsStore.get();
    if (stored && stored.place) {
      setFormData(prev => ({
        ...prev,
        place: stored.place,
        lat: String(stored.lat),
        lon: String(stored.lon),
        tzone: stored.tzone || tz
      }));
    }
  }, [searchParams, selectedCategory]);

  const scrollToForm = () => {

    const element = document.getElementById('muhurat-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lat) {
      toast.error('Please search and select a city for accurate results.');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select a date range.');
      return;
    }

    // Store data in localStorage
    const muhuratInput = {
      category: selectedCategory,
      startDate,
      endDate,
      lat: formData.lat,
      lon: formData.lon,
      tzone: formData.tzone,
      place: formData.place,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('muhurat_input', JSON.stringify(muhuratInput));
    await muhuratStorage.saveHistory(muhuratInput);
    
    // Sync location to global store
    birthDetailsStore.save({
      place: formData.place,
      lat: formData.lat,
      lon: formData.lon,
      tzone: formData.tzone
    });

    router.push('/muhurat/result');
  };

  const inputClass = `
        w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

  return (
    <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
            <div className="min-h-screen py-12 px-4 sm:px-6 z-10 relative" style={{ backgroundColor: '#fdf6e3' }}>

                <style dangerouslySetInnerHTML={{
          __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    .mh-wrap * { font-family: 'Inter', sans-serif; }
                    .mh-wrap h1, .mh-wrap .serif { font-family: 'Inter', sans-serif; }

                    .mh-geo, .mh-geo > div, .mh-geo .geoapify-container { width: 100% !important; }
                    .mh-geo .geoapify-autocomplete-input {
                        color: #111827 !important; font-weight: 400;
                        background: transparent !important;
                        border: 1px solid #d6c89a !important; border-radius: 8px !important;
                        padding: 14px 16px !important; font-size: 15px !important;
                        font-family: 'Source Sans 3', sans-serif !important;
                        width: 100% !important; box-sizing: border-box !important;
                        line-height: 1.5 !important; box-shadow: none !important;
                    }
                    .mh-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                    .mh-geo .geoapify-autocomplete-input:focus {
                        border-color: #b8962e !important;
                        box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                        outline: none !important;
                    }
                    .mh-geo .geoapify-autocomplete-items {
                        background-color: #fffdf5 !important; color: #111827 !important;
                        border: 1px solid #d6c89a !important; border-radius: 10px !important;
                        z-index: 9999 !important;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                        font-size: 14px !important; font-family: 'Source Sans 3', sans-serif !important;
                    }
                    .mh-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }
                    select option { background-color: #fffdf5; color: #111827; }
                ` }} />

                <div className="max-w-5xl mx-auto mh-wrap">

                    {/* Page Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
                            <Sparkles className="w-4 h-4" />
                            <span className="serif">{t("muhurat.vedic_muhurat_calculator")}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight serif">
{t("muhurat.auspicious_moment_finder")}
            </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl serif">
{t("muhurat._timing_is_everything_ensure_s")}
              </p>
                            <div className="flex flex-wrap gap-3 mt-2">
                                <button
                  onClick={() => router.push('/muhurat/history')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#d6c89a] text-[13px] font-bold text-[#b8962e] hover:bg-white transition-all whitespace-nowrap shadow-sm shadow-black/[0.02]">
                  
                                    <Clock className="w-4 h-4" />{t("muhurat.view_history")}
                </button>
                                <button
                  onClick={() => router.push('/muhurat/directory')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#b8962e] text-[13px] font-bold text-white hover:shadow-lg transition-all whitespace-nowrap">
                  
                                    <Sparkles className="w-4 h-4" />{t("muhurat.2026_directory")}
                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="mb-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {(isExpanded ? categories : categories.slice(0, 8)).map((cat) => {
                const isActive = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      scrollToForm();
                    }}
                    className={`relative flex items-start gap-3.5 text-left p-3.5 rounded-xl border transition-all duration-200 ${isActive ?
                    `${cat.borderColor} ${cat.activeBg} shadow-sm ring-1 ring-offset-0 ring-[#b8962e]/30` :
                    'border-[#e8dbb8]/60 hover:border-[#d6c89a] bg-white/60'}`
                    }>
                    
                                        <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat.gradient}`}>
                                            <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-5">
                                            <h3 className="font-bold text-gray-900 text-[13px] leading-tight mb-0.5 truncate">{cat.label}</h3>
                                            <p className="text-[10px] font-semibold text-[#b8962e] uppercase tracking-wider mb-1 truncate">{cat.subtitle}</p>
                                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{cat.description}</p>
                                        </div>
                                        {isActive &&
                    <motion.div
                      layoutId="category-check"
                      className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#b8962e] flex items-center justify-center">
                      
                                                <Sparkles className="w-2.5 h-2.5 text-white" />
                                            </motion.div>
                    }
                                    </motion.button>);

              })}
                        </div>
                        
                        {categories.length > 8 &&
            <div className="mt-6 flex justify-center">
                                <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-[#d6c89a] bg-white/60 text-[13px] font-bold text-[#b8962e] hover:bg-white hover:shadow-md transition-all shadow-sm group">
                
                                    {isExpanded ?
                <>{t("muhurat.show_less")}<ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /></> :

                <>{t("muhurat.view_all")}{categories.length - 8}{t("muhurat.more_categories")}<ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /></>
                }
                                </button>
                            </div>
            }
                    </div>

                    {/* Form */}
                    <form id="muhurat-form" onSubmit={handleSubmit} className="space-y-8 scroll-mt-24">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-3 border-b border-[#d6c89a]">
                                <Calendar className="w-4 h-4 text-[#b8962e]" />
                                <span className="text-[15px] font-semibold text-gray-800">{t("muhurat.date_range_location")}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />{t("muhurat.start_date")}
                  </label>
                                    <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                    suppressHydrationWarning />
                  
                                </div>
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />{t("muhurat.end_date")}
                  </label>
                                    <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                    suppressHydrationWarning />
                  
                                </div>
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#b8962e]" />{t("muhurat.your_city")}
                </label>
                                <div className="relative mh-geo z-[100]">
                                    <GeoapifyGeocoderAutocomplete
                    placeholder="Search city e.g. Mumbai"
                    value={formData.place}
                    placeSelect={(value: any) => {
                      if (value && value.properties) {
                        setFormData({
                          ...formData,
                          place: value.properties.formatted,
                          lat: value.properties.lat,
                          lon: value.properties.lon
                        });
                      } else {
                        setFormData({ ...formData, place: '', lat: '', lon: '' });
                      }
                    }}
                    debounceDelay={300} />
                  
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <motion.button
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                type="submit"
                suppressHydrationWarning
                className="w-full py-4 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#b8962e' }}>
                
                                <Sparkles className="w-4 h-4" />
{t("muhurat.find_auspicious_dates")}
                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </form>
                </div>
            </div>
        </GeoapifyContext>);

}

export default function MuhuratPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
    <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Sparkles className="w-12 h-12 text-[#b8962e] opacity-20" />
                    <span className="text-[10px] font-black uppercase text-[#b8962e] tracking-widest">{t("muhurat.waking_the_stars")}</span>
                </div>
            </div>
    }>
            <MuhuratForm />
        </Suspense>);

}