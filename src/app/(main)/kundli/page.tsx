'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Star, Compass, Calendar, MapPin, Clock, Shield, Award, User, Crown } from 'lucide-react';
import KundliResult from '@/components/kundli/KundliResult';

import { astrologyService, AstrologyCalculationRequest } from '@/lib/astrologyService';
import { kundliStorage } from '@/lib/kundliStorage';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { useAuth } from '@/context/AuthContext';
import { birthDetailsStore } from '@/lib/birthDetailsStore';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

const KUNDLI_HOUSES = [
{ house: '1st House (Lagna)', rules: 'Self, personality, physical body, overall life direction' },
{ house: '2nd House', rules: 'Wealth, family, speech, accumulated assets' },
{ house: '3rd House', rules: 'Courage, siblings, communication, short journeys' },
{ house: '4th House', rules: 'Mother, home, happiness, property, emotional roots' },
{ house: '5th House', rules: 'Intelligence, children, creativity, past life merit' },
{ house: '6th House', rules: 'Enemies, health, debts, daily service and routine' },
{ house: '7th House', rules: 'Marriage, partnerships, business relationships' },
{ house: '8th House', rules: 'Longevity, transformation, inheritance, hidden matters' },
{ house: '9th House', rules: 'Dharma, fortune, father, higher learning, spirituality' },
{ house: '10th House', rules: 'Career, status, public life, authority and reputation' },
{ house: '11th House', rules: 'Gains, desires, friends, elder siblings, income' },
{ house: '12th House', rules: 'Losses, liberation, foreign lands, spiritual retreat' }];


const NAVAGRAHAS = [
{ planet: 'Sun (Surya)', rules: 'Soul, authority, father, health, government' },
{ planet: 'Moon (Chandra)', rules: 'Mind, emotions, mother, comfort, intuition' },
{ planet: 'Mars (Mangal)', rules: 'Energy, courage, property, siblings, conflict' },
{ planet: 'Mercury (Budha)', rules: 'Intelligence, communication, business, education' },
{ planet: 'Jupiter (Guru)', rules: 'Wisdom, fortune, children, spirituality, expansion' },
{ planet: 'Venus (Shukra)', rules: 'Love, beauty, luxury, marriage, arts and pleasure' },
{ planet: 'Saturn (Shani)', rules: 'Discipline, karma, delay, service, longevity' },
{ planet: 'Rahu', rules: 'Ambition, illusion, foreign matters, unconventional paths' },
{ planet: 'Ketu', rules: 'Detachment, spirituality, past life, liberation' }];


const KundliPage = () => {
    const { t } = useTranslation();
    const { isAuthenticated, getProfileBirthDetails } = useAuth();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    place: '',
    lat: '',
    lon: '',
    tzone: 5.5
  });

  useEffect(() => {
    setMounted(true);
    setFormData((prev) => ({
      ...prev,
      tzone: parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1))
    }));

    // Check Global Store First
    const globalStored = birthDetailsStore.get();
    if (globalStored) {
      setFormData({
        name: globalStored.name,
        date: globalStored.date,
        time: globalStored.time,
        place: globalStored.place,
        lat: String(globalStored.lat),
        lon: String(globalStored.lon),
        tzone: globalStored.tzone
      });
    }

    const savedData = kundliStorage.getData();
    if (savedData) {
      const input = savedData.isLightweight ? savedData.input : savedData.input;
      const lat = input?.lat;
      const lon = input?.lon;
      const isValid = lat !== undefined && lat !== null && lat !== '' &&
      String(lat) !== 'undefined' && String(lat) !== 'null' &&
      lon !== undefined && lon !== null && lon !== '' &&
      String(lon) !== 'undefined' && String(lon) !== 'null';

      if (isValid && savedData.isLightweight) {
        handleGenerate(savedData.input, true, true);
      } else if (isValid && !savedData.isLightweight) {
        setResult(savedData);
      } else {
        console.warn('Cleared corrupted kundli data with invalid coordinates.');
        kundliStorage.clearData();
      }
    }
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = async (data: any, isSilent: boolean = false, isFromHistory: boolean = false) => {
    try {
      setLoading(true);

      const dateParts = data.date.split('-');
      const year = parseInt(dateParts[0]);
      if (year > 2100 || year < 1800) {
        toast.error(`Invalid year: ${year}. Please enter a year between 1800 and 2100.`);
        setLoading(false);
        return;
      }

      const cleanCoord = (val: any) => {
        const s = String(val);
        if (!val || s === 'undefined' || s === 'null' || s.trim() === '') return null;
        const n = parseFloat(s);
        return isNaN(n) ? null : String(n);
      };

      const cleanLat = cleanCoord(data.lat);
      const cleanLon = cleanCoord(data.lon);

      if (!cleanLat || !cleanLon) {
        toast.error('Invalid coordinates. Please search and select your birth city again.');
        kundliStorage.clearData();
        setLoading(false);
        return;
      }

      const request: AstrologyCalculationRequest = {
        name: data.name,
        date: data.date,
        time: data.time,
        lat: cleanLat,
        lon: cleanLon,
        place: data.place,
        tzone: data.tzone && data.tzone !== 'undefined' ? data.tzone : 5.5
      };

      const response = await astrologyService.calculateKundli(request);

        if (response.success) {
        setResult(response.data);
        kundliStorage.saveData(response.data, isFromHistory);
        
        // Save to Global Store for other tools
        birthDetailsStore.save({
          name: data.name,
          date: data.date,
          time: data.time,
          place: data.place,
          lat: data.lat,
          lon: data.lon,
          tzone: data.tzone
        });

        if (!isSilent) {
          toast.success('Your birth chart has been calculated divinefully!');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(response.message || 'Calculation failed. Please check your details.');
      }
    } catch (err: any) {
      console.error('Kundli Error:', err);
      toast.error(err.response?.data?.message || 'Failed to connect to celestial bridge.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillFromProfile = () => {
    const profile = getProfileBirthDetails();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        date: profile.date || prev.date,
        time: profile.time || prev.time,
        place: profile.place || prev.place,
      }));
      toast.success('Details loaded from profile');
    }
  };

  if (!mounted) return <div className="min-h-screen" style={{ backgroundColor: '#fdf6e3' }} />;

  const inputClass = `
        w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

  return (
    <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
            <div className="min-h-screen py-12 px-4 sm:px-6 z-10 relative" style={{ backgroundColor: '#fdf6e3' }} suppressHydrationWarning>

                <style dangerouslySetInnerHTML={{
          __html: `
                    .kundli-wrap { font-family: 'Inter', sans-serif !important; }
                    .kundli-geo, .kundli-geo > div, .kundli-geo .geoapify-container { width: 100% !important; }
                    .kundli-geo .geoapify-autocomplete-input {
                        color: #111827 !important;
                        font-weight: 400;
                        background: transparent !important;
                        border: 1px solid #d6c89a !important;
                        border-radius: 8px !important;
                        padding: 14px 16px 14px 16px !important;
                        font-size: 15px !important;
                        font-family: 'Inter', sans-serif !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        line-height: 1.5 !important;
                        box-shadow: none !important;
                    }
                    .kundli-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                    .kundli-geo .geoapify-autocomplete-input:focus {
                        border-color: #b8962e !important;
                        box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                        outline: none !important;
                    }
                    .kundli-geo .geoapify-autocomplete-items {
                        background-color: #fffdf5 !important;
                        color: #111827 !important;
                        border: 1px solid #d6c89a !important;
                        border-radius: 10px !important;
                        z-index: 9999 !important;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                        font-size: 14px !important;
                        font-family: 'Inter', sans-serif !important;
                    }
                    .kundli-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }
                    select option { background-color: #fffdf5; color: #111827; }
                ` }} />

                <div className="mx-auto kundli-wrap">
                    <AnimatePresence mode="wait">

                        {/* Full Page Loader */}
                        {loading && !result &&
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-[#fdf6e3]/80 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
              
                                <div className="w-16 h-16 border-4 border-orange-100 border-t-[#b8962e] rounded-full animate-spin mb-6" />
                                <h1 className="text-3xl font-semibold text-gray-900 mb-2">{t("kundli.synchronizing_with_stars")}</h1>
                                <p className="text-gray-500 font-medium max-w-sm">{t("kundli.re_aligning_the_celestial_coor")}</p>
                            </motion.div>
            }

                        {!result ?
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}>
              
                                {/* ── Page Header ── */}
                                <div className="mb-10 text-center relative pt-12 pb-4">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(184,150,46,0.1)_0%,_transparent_70%)] pointer-events-none -z-10" />
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.04] pointer-events-none -z-10 overflow-hidden">
                                        <div className="w-[500px] h-[500px] border-[40px] border-double border-[#b8962e] rounded-full animate-[spin_180s_linear_infinite]" />
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-[#b8962e] text-sm font-semibold mb-5 tracking-widest uppercase">
                                        <Crown className="w-4 h-4" />
                                        <span>{t("kundli.divine_chart_calculation")}</span>
                                        <Crown className="w-4 h-4" />
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
{t("kundli.janam_kundli")}<span className="text-[#b8962e]">{t("kundli.generator")}</span>
                                    </h1>
                                    <p className="text-gray-600 text-[17px] leading-relaxed max-w-xl mx-auto mb-8 font-medium">
{t("kundli.unlock_the_secrets_of_your_lif")}
                </p>

                                    {/* Trust Indicators */}
                                    <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-white/40 border border-white/60 shadow-sm backdrop-blur-sm max-w-fit mx-auto mb-8">
                                        <div className="flex items-center gap-2 text-[13px] text-gray-700 font-semibold">
                                            <Shield className="w-4 h-4 text-[#b8962e]" />
                                            <span>{t("kundli.secure")}</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                                        <div className="flex items-center gap-2 text-[13px] text-gray-700 font-semibold">
                                            <Award className="w-4 h-4 text-[#b8962e]" />
                                            <span>{t("kundli.accurate")}</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                                        <div className="flex items-center gap-2 text-[13px] text-gray-700 font-semibold">
                                            <Sparkles className="w-4 h-4 text-[#b8962e]" />
                                            <span>{t("kundli.instant")}</span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <motion.button
                  onClick={scrollToForm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all"
                  style={{ background: '#b8962e' }}>
                  
                                        <Sparkles className="w-4 h-4" />
{t("kundli.generate_your_kundli")}
                </motion.button>
                                </div>

                                {/* ── SEO Content Sections ── */}
                                <div className="space-y-12 mt-10 mb-14">

                                    {/* What is Janam Kundli */}
                                    <section className="border-t border-[#d6c89a]/50 pt-10">
                                        <h2 className="text-3xl font-semibold text-gray-900 mb-4">{t("kundli.what_is_a_janam_kundli")}</h2>
                                        <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
                                            <p>
{t("kundli.a_janam_kundli_also_known_as_a")}
                    </p>
                                            <p>
{t("kundli.the_word_kundli_is_derived_fro")}
                    </p>
                                            <p>
{t("kundli.for_centuries_the_janam_kundli")}
                    </p>
                                        </div>
                                    </section>

                                    {/* The 12 Houses */}
                                    <section className="border-t border-[#d6c89a]/50 pt-10">
                                        <h2 className="text-3xl font-semibold text-gray-900 mb-4">{t("kundli.the_12_houses_of_the_kundli")}</h2>
                                        <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] mb-6">
                                            <p>
{t("kundli.the_kundli_is_divided_into_12")}
                    </p>
                                        </div>
                                        <div className="overflow-x-auto rounded-2xl border border-[#d6c89a]/60">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-[#d6c89a]/60 bg-[#fdf6e3]/40">
                                                        <th className="p-4 text-[12px] font-black text-gray-400 uppercase tracking-wider">{t("kundli.house")}</th>
                                                        <th className="p-4 text-[12px] font-black text-gray-400 uppercase tracking-wider">{t("kundli.area_of_life")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#d6c89a]/30">
                                                    {KUNDLI_HOUSES.map((h, i) =>
                        <tr key={i} className="hover:bg-[#fdf6e3]/30 transition-colors">
                                                            <td className="p-4 font-semibold text-gray-800 text-[14px] whitespace-nowrap">{h.house}</td>
                                                            <td className="p-4 text-[13px] text-gray-600 leading-relaxed">{h.rules}</td>
                                                        </tr>
                        )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* The 9 Planets */}
                                    <section className="border-t border-[#d6c89a]/50 pt-10">
                                        <h2 className="text-3xl font-semibold text-gray-900 mb-4">{t("kundli.the_navagrahas_nine_planets_in")}</h2>
                                        <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] mb-6">
                                            <p>
{t("kundli.vedic_astrology_recognises_nin")}
                    </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {NAVAGRAHAS.map((g, i) =>
                    <div key={i} className="p-5 rounded-2xl border border-[#d6c89a]/60">
                                                    <p className="font-bold text-[#b8962e] text-[14px] mb-1.5">{g.planet}</p>
                                                    <p className="text-[13px] text-gray-600 leading-relaxed">{g.rules}</p>
                                                </div>
                    )}
                                        </div>
                                    </section>

                                    {/* How to Read Your Kundli */}
                                    <section className="border-t border-[#d6c89a]/50 pt-10">
                                        <h2 className="text-3xl font-semibold text-gray-900 mb-4">{t("kundli.how_to_read_your_janam_kundli")}</h2>
                                        <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] mb-6">
                                            <p>
{t("kundli.reading_a_kundli_involves_unde")}
                    </p>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                    {
                      title: 'Identify your Lagna (Ascendant)',
                      desc: 'The Lagna is the zodiac sign rising on the eastern horizon at your birth moment. It sets the layout of all 12 houses and is the single most important point in your Kundli, shaping your overall personality and physical appearance.'
                    },
                    {
                      title: 'Locate your Rashi (Moon Sign)',
                      desc: 'The Rashi is the sign occupied by the Moon in your chart. It represents your emotional nature, mental tendencies, and inner world. In Vedic astrology, the Rashi is used more commonly than the Sun sign for predictions.'
                    },
                    {
                      title: 'Study the Dasha system',
                      desc: 'The Vimshottari Dasha is a planetary period system unique to Vedic astrology. Each planet rules a period of your life for a fixed number of years, and the timing of events is largely read through the active Dasha and sub-Dasha periods.'
                    },
                    {
                      title: 'Examine planetary strengths and aspects',
                      desc: 'Planets in their own sign, exaltation, or in a friendly house are considered strong and deliver positive results. Planets in debilitation or in enemy signs may create challenges. Planetary aspects (Drishti) show the areas of life one planet influences another.'
                    }].
                    map((tip, i) =>
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-[#d6c89a]/40">
                                                    <div className="w-7 h-7 rounded-full border border-[#b8962e] text-[#b8962e] text-[13px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-[14px] mb-1">{tip.title}</p>
                                                        <p className="text-[13px] text-gray-600 leading-relaxed">{tip.desc}</p>
                                                    </div>
                                                </div>
                    )}
                                        </div>
                                    </section>

                                </div>

                                {/* ── Form (scroll target) ── */}
                                <div ref={formRef} className="scroll-mt-8 border-t border-[#d6c89a]/50 pt-10">
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                            <Crown className="w-4 h-4" />
                                            <span>{t("kundli.birth_chart_calculator")}</span>
                                        </div>
                                        <h2 className="text-3xl font-semibold text-gray-900 mb-2">{t("kundli.generate_your_janam_kundli")}</h2>
                                        <p className="text-gray-600 text-[15px] leading-relaxed">
{t("kundli.enter_your_birth_details_below")}
                  </p>
                                    </div>

                                    <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const isInvalidCoord = !formData.lat || !formData.lon ||
                    formData.lat === 'undefined' || formData.lon === 'undefined';
                    if (isInvalidCoord || !formData.place) {
                      toast.error('Please search and select your birth city from the list.');
                      return;
                    }
                    handleGenerate(formData);
                  }}
                  className="space-y-6">
                  
                                        {/* Section Header */}
                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#d6c89a]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#b8962e]" />
                                            <span className="text-[15px] font-semibold text-gray-800">{t("kundli.enter_birth_details")}</span>
                                        </div>
                                        {isAuthenticated && (
                                            <button 
                                                type="button" 
                                                onClick={handleFillFromProfile}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf6e3] text-[#b8962e] text-[11px] font-bold hover:bg-[#b8962e]/10 transition-all border border-[#d6c89a]/30"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" /> {t("common.use_profile") || "Use My Profile"}
                                            </button>
                                        )}
                                    </div>

                                        {/* Name */}
                                        <div>
                                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">{t("kundli.full_name")}</label>
                                            <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className={inputClass}
                      suppressHydrationWarning />
                    
                                        </div>

                                        {/* Date & Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />{t("kundli.birth_date")}
                      </label>
                                                <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={inputClass}
                        suppressHydrationWarning />
                      
                                            </div>
                                            <div>
                                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#b8962e]" />{t("kundli.birth_time")}
                      </label>
                                                <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className={inputClass}
                        suppressHydrationWarning />
                      
                                            </div>
                                        </div>

                                        {/* Birth Place */}
                                        <div>
                                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-[#b8962e]" />{t("kundli.birth_place")}
                    </label>
                                            <div className="relative kundli-geo z-[100]">
                                                <GeoapifyGeocoderAutocomplete
                        placeholder="Search city e.g. Mumbai"
                        value={formData.place}
                        limit={10}
                        placeSelect={(value: any) => {
                          if (value && value.properties) {
                            let selectedTzone = formData.tzone;
                            if (value.properties.timezone && value.properties.timezone.offset_STD_seconds !== undefined) {
                              selectedTzone = value.properties.timezone.offset_STD_seconds / 3600;
                            }
                            setFormData({
                              ...formData,
                              place: value.properties.formatted,
                              lat: value.properties.lat,
                              lon: value.properties.lon,
                              tzone: selectedTzone
                            });
                          } else {
                            setFormData({ ...formData, place: '', lat: '', lon: '' });
                          }
                        }} />
                      
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="pt-2">
                                            <motion.button
                      whileHover={!formData.lat || loading ? {} : { scale: 1.005 }}
                      whileTap={!formData.lat || loading ? {} : { scale: 0.995 }}
                      type="submit"
                      disabled={loading || !formData.lat}
                      suppressHydrationWarning
                      className="w-full py-4 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: '#b8962e' }}>
                      
                                                {loading ?
                      <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
{t("kundli.generating")}
                      </> :

                      <>
                                                        <Sparkles className="w-4 h-4" />
{t("kundli.generate_kundli")}
                      </>
                      }
                                            </motion.button>

                                            {!formData.lat && !loading &&
                    <p className="text-[10px] text-orange-600/60 text-center mt-3 font-bold uppercase tracking-widest">
{t("kundli.please_select_a_city_from_the")}
                    </p>
                    }
                                        </div>
                                    </form>

                                    {/* Info Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-10 border-t border-[#d6c89a]">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Moon className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[14px] font-semibold text-gray-800">{t("kundli.janam_kundli")}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-500 leading-relaxed">{t("kundli.complete_birth_chart_with_all")}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Star className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[14px] font-semibold text-gray-800">{t("kundli.planetary_positions")}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-500 leading-relaxed">{t("kundli.graha_positions_dashas_and_tra")}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Compass className="w-4 h-4 text-[#b8962e]" />
                                                <span className="text-[14px] font-semibold text-gray-800">{t("kundli.ascendant_nakshatra")}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-500 leading-relaxed">{t("kundli.lagna_birth_star_and_rashi_det")}</p>
                                        </div>
                                    </div>

                                    {/* Footer Note */}
                                    <p className="text-center text-xs text-gray-400 mt-10">
{t("kundli._your_kundli_is_calculated_usi")}
                </p>
                                </div>

                            </motion.div> :

            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}>
              
                                <Suspense fallback={<div className="flex items-center justify-center p-10"><div className="w-10 h-10 border-4 border-orange-100 border-t-[#b8962e] rounded-full animate-spin" /></div>}>
                                    <KundliResult
                  data={result}
                  onBack={() => {
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onNew={() => {
                    kundliStorage.clearData();
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} />
                
                                </Suspense>
                            </motion.div>
            }
                    </AnimatePresence>
                </div>
            </div>
        </GeoapifyContext>);

};

export default KundliPage;