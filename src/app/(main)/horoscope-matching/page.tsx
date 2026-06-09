'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, User, Heart, Star, BookOpen, Shield, Moon, CheckCircle, Sparkles } from 'lucide-react';
import { horoscopeMatchingStorage } from '@/lib/horoscopeMatchingStorage';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import dynamic from 'next/dynamic';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { birthDetailsStore } from '@/lib/birthDetailsStore';

const GeoapifyGeocoderAutocomplete = dynamic(
  () => import('@geoapify/react-geocoder-autocomplete').then((mod) => mod.GeoapifyGeocoderAutocomplete),
  { ssr: false }
);

export default function HoroscopeMatchingPage() {
    const { t } = useTranslation();
    const { isAuthenticated, getProfileBirthDetails } = useAuth();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [boyData, setBoyData] = useState({
    name: '',
    date: '',
    time: '',
    place: '',
    lat: '',
    lon: '',
    tzone: 5.5
  });

  const [girlData, setGirlData] = useState({
    name: '',
    date: '',
    time: '',
    place: '',
    lat: '',
    lon: '',
    tzone: 5.5
  });

    useEffect(() => {
        setIsMounted(true);
        const tz = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setBoyData((prev) => ({ ...prev, tzone: tz }));
        setGirlData((prev) => ({ ...prev, tzone: tz }));

        // Load from Global Store for Boy section if empty
        const stored = birthDetailsStore.get();
        if (stored) {
            setBoyData({
                name: stored.name,
                date: stored.date,
                time: stored.time,
                place: stored.place,
                lat: String(stored.lat),
                lon: String(stored.lon),
                tzone: stored.tzone || tz
            });
        }
    }, []);

  const handleFillFromProfile = (target: 'boy' | 'girl') => {
    const profile = getProfileBirthDetails();
    if (profile) {
      const updateData = {
        name: profile.name || '',
        date: profile.date || '',
        time: profile.time || '',
        place: profile.place || '',
        lat: profile.lat || '',
        lon: profile.lon || '',
        tzone: profile.tzone || 5.5
      };
      if (target === 'boy') setBoyData(updateData);
      else setGirlData(updateData);
      toast.success(`Filled ${target}'s details from profile`);
    }
  };

  const [matchSystem, setMatchSystem] = useState('north_indian');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boyData.lat || !girlData.lat) {
      toast.error('Please properly search and select the birth cities for both partners.');
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const matchRecord = { boy: boyData, girl: girlData, system: matchSystem, timestamp: new Date().toISOString(), isLightweight: true };
        localStorage.setItem('horoscope_match_input', JSON.stringify(matchRecord));

        await horoscopeMatchingStorage.saveData(matchRecord);
        
        // Save Boy details to global store (most common use case)
        birthDetailsStore.save(boyData);
      } catch (e) {
        console.warn('LocalStorage quota exceeded for horoscope matching.');
      }
    }

    router.push('/horoscope-matching/result');
  };

  const inputClass = `
        w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

  const features = [
  {
    icon: Star,
    title: 'Ashtakoot Guna Milan',
    desc: 'The 8-factor North Indian system scoring Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi — totalling up to 36 gunas.'
  },
  {
    icon: Shield,
    title: 'Manglik Dosha Analysis',
    desc: 'Detailed examination of Mars placement across all 12 houses with effective Vedic remedies to neutralise malefic effects on married life.'
  },
  {
    icon: Moon,
    title: 'Dashakoot Porutham',
    desc: 'South Indian 10-point matching covering Dina, Gana, Mahendra, Stree Deergha, Yoni, Rasi, Rajju, Vedha, Vashya and Graha Maitri.'
  },
  {
    icon: BookOpen,
    title: 'Vedic Remedies',
    desc: 'Personalised puja recommendations, gemstone guidance, and mantra prescriptions to overcome any identified doshas.'
  }];


  return (
    <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
            <div className="min-h-screen z-10 relative" style={{ backgroundColor: '#fdf6e3' }}>

                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                    .hm-wrap * { font-family: 'Source Sans 3', sans-serif; }
                    .hm-wrap h1, .hm-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                    /* Boy geocoder */
                    .boy-geo, .boy-geo > div, .boy-geo .geoapify-container { width: 100% !important; }
                    .boy-geo .geoapify-autocomplete-input {
                        color: #111827 !important; font-weight: 400;
                        background: transparent !important;
                        border: 1px solid #d6c89a !important;
                        border-radius: 8px !important;
                        padding: 14px 16px !important;
                        font-size: 15px !important;
                        font-family: 'Source Sans 3', sans-serif !important;
                        width: 100% !important; box-sizing: border-box !important;
                        line-height: 1.5 !important; box-shadow: none !important;
                    }
                    .boy-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                    .boy-geo .geoapify-autocomplete-input:focus {
                        border-color: #b8962e !important;
                        box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                        outline: none !important;
                    }
                    .boy-geo .geoapify-autocomplete-items {
                        background-color: #fffdf5 !important; color: #111827 !important;
                        border: 1px solid #d6c89a !important; border-radius: 10px !important;
                        z-index: 9999 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                        font-size: 14px !important; font-family: 'Source Sans 3', sans-serif !important;
                    }
                    .boy-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }

                    /* Girl geocoder */
                    .girl-geo, .girl-geo > div, .girl-geo .geoapify-container { width: 100% !important; }
                    .girl-geo .geoapify-autocomplete-input {
                        color: #111827 !important; font-weight: 400;
                        background: transparent !important;
                        border: 1px solid #d6c89a !important;
                        border-radius: 8px !important;
                        padding: 14px 16px !important;
                        font-size: 15px !important;
                        font-family: 'Source Sans 3', sans-serif !important;
                        width: 100% !important; box-sizing: border-box !important;
                        line-height: 1.5 !important; box-shadow: none !important;
                    }
                    .girl-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                    .girl-geo .geoapify-autocomplete-input:focus {
                        border-color: #b8962e !important;
                        box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                        outline: none !important;
                    }
                    .girl-geo .geoapify-autocomplete-items {
                        background-color: #fffdf5 !important; color: #111827 !important;
                        border: 1px solid #d6c89a !important; border-radius: 10px !important;
                        z-index: 9998 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                        font-size: 14px !important; font-family: 'Source Sans 3', sans-serif !important;
                    }
                    .girl-geo .geoapify-autocomplete-item:hover { background-color: #f5e9c8 !important; color: #7a6010 !important; }

                    select option { background-color: #fffdf5; color: #111827; }

                    /* Feature cards */
                    .feature-card {
                        background: transparent;
                        border: 1px solid #e8d99a;
                        border-radius: 14px;
                        padding: 28px;
                        transition: box-shadow 0.2s, transform 0.2s;
                    }
                    .feature-card:hover {
                        box-shadow: 0 6px 24px rgba(184,150,46,0.12);
                        transform: translateY(-2px);
                        background: rgba(253,246,227,0.6);
                    }

                    /* Stats strip */
                    .stat-item {
                        text-align: center;
                        padding: 28px 20px;
                        border-right: 1px solid #e8d99a;
                    }
                    .stat-item:last-child { border-right: none; }

                    /* Info section */
                    .info-section {
                        background: transparent;
                        border-top: 1px solid #e8d99a;
                        border-bottom: 1px solid #e8d99a;
                    }

                    /* Divider ornament */
                    .gold-divider {
                        display: flex; align-items: center; gap: 12px;
                        color: #b8962e;
                    }
                    .gold-divider::before, .gold-divider::after {
                        content: ''; flex: 1; height: 1px;
                        background: linear-gradient(to right, transparent, #d6c89a);
                    }
                    .gold-divider::after { background: linear-gradient(to left, transparent, #d6c89a); }

                    @media (max-width: 640px) {
                        .stats-grid { grid-template-columns: 1fr 1fr !important; }
                        .stat-item { border-right: none; border-bottom: 1px solid #e8d99a; }
                        .stat-item:last-child { border-bottom: none; }
                        .features-grid { grid-template-columns: 1fr !important; }
                    }
                ` }} />

                <div className="hm-wrap">

                    {/* ── HERO / HEADER ── */}
                    <div className="py-16 px-4 sm:px-8 relative overflow-hidden text-center" style={{ borderBottom: '1px solid #e8d99a' }}>
                        {/* Decorative Background Patterns */}
                        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
                            <div className="w-[1200px] h-[1200px] rounded-full border-[60px] border-[#b8962e] animate-[spin_120s_linear_infinite]" />
                        </div>
                        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(184,150,46,0.06)_0%,_transparent_70%)] pointer-events-none" />

                        <div className="max-w-5xl mx-auto relative z-10">
                            {/* Badge */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Heart className="w-4 h-4" style={{ color: '#b8962e' }} />
                                <span className="serif text-sm font-semibold tracking-wide uppercase" style={{ color: '#b8962e' }}>{t("horoscope_matching.vedic_astrology")}</span>
                                <Heart className="w-4 h-4" style={{ color: '#b8962e' }} />
                            </div>

                            {/* Title */}
                            <h1 className="serif font-semibold leading-tight mb-6"
              style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#1a1209' }}>
{t("horoscope_matching.kundli_matching")}<br />
                                <span style={{ color: '#b8962e', fontStyle: 'normal' }}>{t("horoscope_matching.horoscope_compatibility")}</span>
                            </h1>

                            {/* Description */}
                            <div className="flex flex-col items-center">
                                <p style={{ fontSize: 18, color: '#4b3f2a', lineHeight: 1.8, maxWidth: 800, marginBottom: 16 }}>
{t("horoscope_matching.hindu_scriptures_consider_marr")}
                </p>
                                <p style={{ fontSize: 16, color: '#7a6542', lineHeight: 1.8, maxWidth: 740, marginBottom: 40 }}>
{t("horoscope_matching.where_marriage_is_the_most_sac")}
                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                                <a href="#match-form"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #b8962e 0%, #a07c1e 100%)', textDecoration: 'none', boxShadow: '0 8px 24px rgba(184,150,46,0.25)' }}>
                                    <Heart className="w-4 h-4" />{t("horoscope_matching.match_horoscope_now")}
                </a>
                                <a href="/kundli"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base transition-all hover:bg-[#b8962e]/5 hover:scale-105 active:scale-95"
                style={{ border: '2px solid #d6c89a', color: '#b8962e', textDecoration: 'none', background: 'transparent' }}>
                                    <BookOpen className="w-4 h-4" />{t("horoscope_matching.create_kundli")}
                </a>
                            </div>
                        </div>
                    </div>

                    {/* ── STATS STRIP ── */}
                    <div style={{ background: '#fff9ee', borderBottom: '1px solid #e8d99a' }}>
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#e8d99a] border-x border-[#e8d99a] sm:border-x-0">
                                {[
                { n: '36', label: 'Gunas, Ashtakoot', note: 'North Indian max score' },
                { n: '10', label: 'Factors, Dashakoot', note: 'South Indian system' },
                { n: '12', label: 'Houses Analysed', note: 'Full birth chart' },
                { n: '8+', label: 'Doshas Detected', note: 'Including Manglik' }].
                map((s, i) =>
                <motion.div key={i} className="stat-item border-b lg:border-b-0 border-[#e8d99a]"
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                                        <div className="serif text-[#b8962e] font-bold leading-none" style={{ fontSize: 40 }}>{s.n}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2d2310', marginTop: 8 }}>{s.label}</div>
                                        <div style={{ fontSize: 11, color: '#9a7d52', marginTop: 3 }}>{s.note}</div>
                                    </motion.div>
                )}
                            </div>
                        </div>
                    </div>

                    {/* ── WHY KUNDLI MATCHING ── */}
                    <div className="info-section py-16 px-4 sm:px-8">
                        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
                            <div className="mb-12">
                                <div className="gold-divider mb-6 mx-auto" style={{ maxWidth: 200 }}><span>✦</span></div>
                                <h2 className="serif font-semibold mb-4" style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', color: '#1a1209' }}>
{t("horoscope_matching.why_kundli_matching_matters")}
                </h2>
                                <p style={{ fontSize: 17, color: '#5a4a2e', lineHeight: 1.8, maxWidth: 700 }}>
{t("horoscope_matching.in_hinduism_the_horoscopes_of")}
                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:text-left">
                                {features.map((f, i) =>
                <motion.div key={i} className="feature-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                                        <div className="flex items-start gap-3.5 mb-3">
                                            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(184,150,46,0.08)', border: '1px solid #e8d99a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <f.icon style={{ width: 18, height: 18, color: '#b8962e' }} />
                                            </div>
                                            <h3 className="serif font-semibold" style={{ fontSize: 19, color: '#1a1209', paddingTop: 8 }}>{f.title}</h3>
                                        </div>
                                        <p style={{ fontSize: 14, color: '#6b5535', lineHeight: 1.8, paddingLeft: 0 }}>{f.desc}</p>
                                    </motion.div>
                )}
                            </div>
                        </div>
                    </div>



                    {/* ── FORM ── */}
                    <div id="match-form" className="py-12 px-4 sm:px-8">
                        <div className="max-w-5xl mx-auto">

                            {/* Section header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Heart className="w-4 h-4" style={{ color: '#b8962e' }} />
                                    <span className="serif text-sm font-semibold" style={{ color: '#b8962e' }}>{t("horoscope_matching.horoscope_matching")}</span>
                                </div>
                                <h2 className="serif font-semibold mb-2" style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#1a1209' }}>
{t("horoscope_matching.enter_birth_details")}
                </h2>
                                <p style={{ fontSize: 15, color: '#7a6b52', lineHeight: 1.7, maxWidth: 500 }}>
{t("horoscope_matching.check_marriage_compatibility_u")}
                </p>
                            </div>

                            {/* System Toggle — unchanged */}
                            <div className="mb-8">
                                <div className="inline-flex items-center p-1.5 rounded-xl border border-[#d6c89a]" style={{ backgroundColor: 'rgba(184,150,46,0.06)' }}>
                                    <button
                    type="button"
                    onClick={() => setMatchSystem('north_indian')}
                    suppressHydrationWarning
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                    matchSystem === 'north_indian' ?
                    'bg-[#b8962e] text-white shadow-sm' :
                    'text-gray-500 hover:text-gray-700'}`
                    }>
{t("horoscope_matching.north_indian_ashtakoot")}

                  </button>
                                    <button
                    type="button"
                    onClick={() => setMatchSystem('south_indian')}
                    suppressHydrationWarning
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                    matchSystem === 'south_indian' ?
                    'bg-[#b8962e] text-white shadow-sm' :
                    'text-gray-500 hover:text-gray-700'}`
                    }>
{t("horoscope_matching.south_indian_dashakoot")}

                  </button>
                                </div>
                            </div>

                            {/* Form — exactly the original */}
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

                                    {/* BOY */}
                                    <div className="space-y-6">
                                     <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#d6c89a]">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#b8962e]" />
                                            <span className="text-[15px] font-semibold text-gray-800">{t("horoscope_matching.boy_s_details")}</span>
                                        </div>
                                        {isAuthenticated && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleFillFromProfile('boy')}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf6e3] text-[#b8962e] text-[11px] font-bold hover:bg-[#b8962e]/10 transition-all border border-[#d6c89a]/30"
                                            >
                                                <Sparkles className="w-3 h-3" /> Use My Profile
                                            </button>
                                        )}
                                    </div>
                                        <div>
                                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">{t("horoscope_matching.name")}</label>
                                            <input type="text" required value={boyData.name}
                      onChange={(e) => setBoyData({ ...boyData, name: e.target.value })}
                      placeholder="Boy's Full Name" className={inputClass} suppressHydrationWarning />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />{t("horoscope_matching.date")}
                        </label>
                                                <input type="date" required value={boyData.date}
                        onChange={(e) => setBoyData({ ...boyData, date: e.target.value })}
                        className={inputClass} suppressHydrationWarning />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#b8962e]" />{t("horoscope_matching.time")}
                        </label>
                                                <input type="time" required value={boyData.time}
                        onChange={(e) => setBoyData({ ...boyData, time: e.target.value })}
                        className={inputClass} suppressHydrationWarning />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-[#b8962e]" />{t("horoscope_matching.birth_city")}
                      </label>
                                            <div className="relative boy-geo z-[100]">
                                                <GeoapifyGeocoderAutocomplete
                          placeholder="Search city e.g. Mumbai"
                          value={boyData.place}
                          placeSelect={(value: any) => {
                            if (value && value.properties) {
                              setBoyData({ ...boyData, place: value.properties.formatted, lat: value.properties.lat, lon: value.properties.lon });
                            } else {
                              setBoyData({ ...boyData, place: '', lat: '', lon: '' });
                            }
                          }}
                          debounceDelay={300} />
                        
                                            </div>
                                        </div>
                                    </div>

                                    {/* GIRL */}
                                    <div className="space-y-6">
                                     <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#d6c89a]">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#b8962e]" />
                                            <span className="text-[15px] font-semibold text-gray-800">{t("horoscope_matching.girl_s_details")}</span>
                                        </div>
                                        {isAuthenticated && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleFillFromProfile('girl')}
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf6e3] text-[#b8962e] text-[11px] font-bold hover:bg-[#b8962e]/10 transition-all border border-[#d6c89a]/30"
                                            >
                                                <Sparkles className="w-3 h-3" /> Use My Profile
                                            </button>
                                        )}
                                    </div>
                                        <div>
                                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">{t("horoscope_matching.name")}</label>
                                            <input type="text" required value={girlData.name}
                      onChange={(e) => setGirlData({ ...girlData, name: e.target.value })}
                      placeholder="Girl's Full Name" className={inputClass} suppressHydrationWarning />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />{t("horoscope_matching.date")}
                        </label>
                                                <input type="date" required value={girlData.date}
                        onChange={(e) => setGirlData({ ...girlData, date: e.target.value })}
                        className={inputClass} suppressHydrationWarning />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#b8962e]" />{t("horoscope_matching.time")}
                        </label>
                                                <input type="time" required value={girlData.time}
                        onChange={(e) => setGirlData({ ...girlData, time: e.target.value })}
                        className={inputClass} suppressHydrationWarning />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-[#b8962e]" />{t("horoscope_matching.birth_city")}
                      </label>
                                            <div className="relative girl-geo z-[90]">
                                                <GeoapifyGeocoderAutocomplete
                          placeholder="Search city e.g. Delhi"
                          value={girlData.place}
                          placeSelect={(value: any) => {
                            if (value && value.properties) {
                              setGirlData({ ...girlData, place: value.properties.formatted, lat: value.properties.lat, lon: value.properties.lon });
                            } else {
                              setGirlData({ ...girlData, place: '', lat: '', lon: '' });
                            }
                          }}
                          debounceDelay={300} />
                        
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit — exactly the original */}
                                <div className="pt-2 flex flex-wrap gap-3">
                                    <motion.button
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    type="submit"
                    suppressHydrationWarning
                    className="flex-1 py-4 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: '#b8962e', minWidth: 200 }}>
                    
                                        <Heart className="w-4 h-4" />
{t("horoscope_matching.calculate_compatibility")}
                  </motion.button>
                                    <a href="/kundli"
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-lg font-semibold text-[15px]"
                  style={{ border: '1.5px solid #d6c89a', color: '#b8962e', textDecoration: 'none', background: 'transparent' }}>
                                        <BookOpen className="w-4 h-4" />
{t("horoscope_matching.create_kundli")}
                  </a>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </GeoapifyContext>);

}