'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  RotateCcw,
  Zap,
  Crown,
  Download, 
  Loader2 } from
'lucide-react';
import { downloadNumerologyPDF } from '@/lib/numerologyPdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';
import { useAuth } from '@/context/AuthContext';
import { birthDetailsStore } from '@/lib/birthDetailsStore';
import { toast } from 'react-hot-toast';

const CHALDEAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1, j: 1, k: 2, l: 3, m: 4, n: 5, o: 7, p: 8, q: 1, r: 2, s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface NumerologyData {
  radical: string;
  description: string;
  sign: string;
  alphabets: string;
  gemstone: string;
  days: string;
  numbers: string;
  direction: string;
  colour: string;
  planet: string;
  deity: string;
  fast: string;
  dates: string;
}

const NUM_DATA: Record<number, NumerologyData> = {
  1: {
    radical: 'Radical Number 1',
    description: 'You are an ambitious leader with strong willpower and original ideas. You possess natural authority and independence.',
    sign: 'Leo, Aries, Sagittarius',
    alphabets: 'A, I, J, Q, Y', // Fixed: S removed (S=3), added I, Q, Y
    gemstone: 'Ruby (Manik)',
    days: 'Sunday, Monday, Thursday',
    numbers: '1, 2, 3, 5, 9',
    direction: 'East',
    colour: 'Orange, Gold, Yellow',
    planet: 'Sun',
    deity: 'Lord Rama / Surya',
    fast: 'Sunday',
    dates: '1st, 10th, 19th, 28th, 2nd, 11th, 20th, 29th, 3rd, 12th, 21st, 30th'
  },
  2: {
    radical: 'Radical Number 2',
    description: 'You are highly imaginative, sensitive, and harmonious. You value peace and artistic expression deeply.',
    sign: 'Cancer, Leo',
    alphabets: 'B, K, R', // Fixed: T removed (T=4), added R
    gemstone: 'Pearl (Moti)',
    days: 'Monday, Sunday',
    numbers: '1, 2, 7',
    direction: 'North-West',
    colour: 'White, Silver',
    planet: 'Moon',
    deity: 'Lord Krishna / Shiva',
    fast: 'Monday',
    dates: '2nd, 11th, 20th, 29th, 1st, 10th, 19th, 28th, 7th, 16th, 25th'
  },
  3: {
    radical: 'Radical Number 3',
    description: 'You are optimistic, creative, and communicative. You have a natural talent for teaching and self-expression.',
    sign: 'Sagittarius, Pisces',
    alphabets: 'C, G, L, S', // Fixed: U removed (U=6), added G, S
    gemstone: 'Yellow Sapphire (Pukhraj)', // Fixed: was Blue Sapphire/Cat's Eye — those belong to 8 and 7
    days: 'Thursday, Tuesday, Friday',
    numbers: '3, 6, 9', // Fixed: added 3 itself
    direction: 'North-East',
    colour: 'Yellow, Gold',
    planet: 'Jupiter',
    deity: 'Lord Vishnu / Brahma',
    fast: 'Thursday',
    dates: '3rd, 12th, 21st, 30th, 6th, 15th, 24th, 9th, 18th, 27th'
  },
  4: {
    radical: 'Radical Number 4',
    description: 'You are unconventional, practical, and hardworking. You often view the world from a unique perspective.',
    sign: 'Aquarius, Leo',
    alphabets: 'D, M, T', // Fixed: V removed (V=6), added T
    gemstone: 'Hessonite (Gomed)',
    days: 'Wednesday, Saturday, Monday',
    numbers: '1, 4, 7, 8',
    direction: 'South-West',
    colour: 'Blue, Grey',
    planet: "Rahu (Dragon's Head)",
    deity: 'Goddess Durga',
    fast: 'Saturday',
    dates: '4th, 13th, 22nd, 31st, 1st, 10th, 19th, 28th, 7th, 16th, 25th, 8th, 17th, 26th'
  },
  5: {
    radical: 'Radical Number 5',
    description: 'You are versatile, witty, and highly adaptable. You thrive on change and intellectual stimulation.',
    sign: 'Gemini, Virgo',
    alphabets: 'E, H, N, X', // Fixed: W removed (W=6), added H, X
    gemstone: 'Emerald (Panna)',
    days: 'Wednesday, Friday',
    numbers: '1, 5',
    direction: 'North',
    colour: 'Green, Turquoise',
    planet: 'Mercury',
    deity: 'Lord Vishnu / Ganesha',
    fast: 'Wednesday',
    dates: '5th, 14th, 23rd, 1st, 10th, 19th, 28th'
  },
  6: {
    radical: 'Radical Number 6',
    description: 'You are charismatic, artistic, and responsible. You find fulfillment in beauty, harmony, and family life.',
    sign: 'Taurus, Libra',
    alphabets: 'U, V, W', // Fixed: was F, O, X — those are 8, 7, 5. U/V/W = 6
    gemstone: 'Diamond (Heera / Zircon)',
    days: 'Friday, Tuesday, Thursday',
    numbers: '3, 6, 9',
    direction: 'South-East',
    colour: 'White, Light Blue, Pink',
    planet: 'Venus',
    deity: 'Goddess Durga / Lakshmi',
    fast: 'Friday',
    dates: '6th, 15th, 24th, 3rd, 12th, 21st, 30th, 9th, 18th, 27th'
  },
  7: {
    radical: 'Radical Number 7',
    description: 'You are spiritual, intuitive, and analytical. You are a seeker of truth and prefer depth over superficiality.',
    sign: 'Pisces, Cancer',
    alphabets: 'O, Z', // Fixed: was P, R, T — those are 8, 2, 4. O/Z = 7
    gemstone: "Cat's Eye (Lahsuniya)",
    days: 'Sunday, Monday',
    numbers: '1, 2, 4, 7',
    direction: 'North-East',
    colour: 'Multicolored, Sea Green',
    planet: "Ketu (Dragon's Tail)",
    deity: 'Lord Ganesha',
    fast: 'Thursday', // Fixed: Ketu fasting is Thursday, not Tuesday (Tuesday = Mars)
    dates: '7th, 16th, 25th, 1st, 10th, 19th, 28th, 2nd, 11th, 20th, 29th, 4th, 13th, 22nd, 31st'
  },
  8: {
    radical: 'Radical Number 8',
    description: 'You are disciplined, ambitious, and resilient. You understand the value of hard work and long-term planning.',
    sign: 'Capricorn, Aquarius',
    alphabets: 'F, P', // Fixed: was H, Q, Z — those are 5, 1, 7. F/P = 8
    gemstone: 'Blue Sapphire (Neelam)',
    days: 'Saturday, Friday',
    numbers: '4, 8',
    direction: 'West',
    colour: 'Black, Dark Blue',
    planet: 'Saturn',
    deity: 'Lord Shani / Hanuman',
    fast: 'Saturday',
    dates: '8th, 17th, 26th, 4th, 13th, 22nd, 31st'
  },
  9: {
    radical: 'Radical Number 9',
    description: 'You are courageous, energetic, and humanitarian. You have a strong fighting spirit and a desire to help others.',
    sign: 'Aries, Scorpio',
    alphabets: 'I, R', // Note: In strict Chaldean, no letters map to 9 (9 is sacred).
    // I=1 and R=2 per CHALDEAN_MAP. This field is kept for
    // Indian Vedic numerology compatibility only.
    gemstone: 'Red Coral (Moonga)',
    days: 'Tuesday, Sunday, Thursday',
    numbers: '1, 3, 9',
    direction: 'South',
    colour: 'Red, Maroon',
    planet: 'Mars',
    deity: 'Lord Hanuman / Kartikeya',
    fast: 'Tuesday',
    dates: '9th, 18th, 27th, 1st, 10th, 19th, 28th, 3rd, 12th, 21st, 30th'
  }
};

const reduceToSingle = (num: number, master: boolean = true): number => {
  if (master && (num === 11 || num === 22 || num === 33)) return num;
  while (num > 9) {
    num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return num;
};

export default function NumerologyPage() {
    const { t } = useTranslation();
    const { user, isAuthenticated, getProfileBirthDetails } = useAuth();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    namaank: number;
    bhagyaank: number;
    moolaank: number;
    inputName: string;
    inputDob: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  React.useEffect(() => {
    // Load from Global Store on mount
    const stored = birthDetailsStore.get();
    if (stored) {
      if (stored.name) setName(stored.name);
      if (stored.date) setDob(stored.date);
    }
  }, []);

  const handleFillFromProfile = () => {
    const profile = getProfileBirthDetails();
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.date) setDob(profile.date);
      toast.success('Details loaded from profile');
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    try {
        setIsDownloading(true);
        const m = result.moolaank;
        const b = result.bhagyaank;
        const n = result.namaank;
        
        const docData = {
            ...result,
            attributeData: {
                ...NUM_DATA[m],
                descriptionMoolaank: NUM_DATA[m]?.description,
                descriptionBhagyaank: NUM_DATA[b]?.description,
                descriptionNamaank: NUM_DATA[n]?.description,
            }
        };
        await downloadNumerologyPDF(docData);
    } catch (error) {
        console.error('PDF error:', error);
    } finally {
        setIsDownloading(false);
    }
  };

  const calculate = async () => {
    if (!name || !dob) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/astrology/numerology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dateOfBirth: dob })
      });
      const data = await res.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error('API failed, retreating to local calculation');
      }
    } catch (err) {
      console.log('Calculating locally...', err);
      // Fallback (Local Calculation)
      const nameSum = name.toLowerCase().replace(/[^a-z]/g, '').split('').reduce((acc, ch) => acc + (CHALDEAN_MAP[ch] || 0), 0);
      const namaank = reduceToSingle(nameSum, false);

      const dateNumbers = dob.replace(/[^0-9]/g, '').split('').map(Number);
      const bhagyaank = reduceToSingle(dateNumbers.reduce((a, b) => a + b, 0), false);

      const dayParts = dob.split('-')[2];
      const moolaank = dayParts ? reduceToSingle(parseInt(dayParts), false) : 0;

      setResult({ namaank, bhagyaank, moolaank, inputName: name, inputDob: dob });
    } finally {
      // Save entry to global store
      birthDetailsStore.save({
        name,
        date: dob
      });
      setLoading(false);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fdfaf3' }}>

            <style jsx global>{`
                .num-wrap { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="max-w-5xl mx-auto pt-12 md:pt-20 num-wrap">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-[#b8962e] text-sm font-semibold mb-4 tracking-widest uppercase">
                        <Crown className="w-4 h-4" />
                        <span>{t("numerology.sacred_chaldean_vedic_standard")}</span>
                        <Crown className="w-4 h-4" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("numerology.numerology_calculator")}</h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto font-medium leading-relaxed">{t("numerology.discover_the_vibrational_secre")}</p>
                </div>

                {/* Input Form */}
                <div className="bg-white/60 border border-[#d6c89a]/30 rounded-3xl p-8 md:p-10 mb-16 shadow-sm backdrop-blur-sm max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-[13px] font-bold text-[#b8962e] uppercase tracking-widest">
                                    <User className="w-4 h-4" />{t("numerology.full_name")}
                                </label>
                                {isAuthenticated && (
                                    <button 
                                        type="button" 
                                        onClick={handleFillFromProfile}
                                        className="text-[11px] font-bold text-[#b8962e] hover:text-[#7A1F01] transition-colors"
                                    >
                                        <Zap className="inline w-3 h-3 mr-1" /> Use Profile
                                    </button>
                                )}
                            </div>
                            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Visha Yadav"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#b8962e]/20 focus:border-[#b8962e] outline-none transition-all text-gray-900 text-lg font-medium"
                suppressHydrationWarning />
              
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[13px] font-bold text-[#b8962e] uppercase tracking-widest">
                                <Calendar className="w-4 h-4" />{t("numerology.date_of_birth")}
              </label>
                            <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#b8962e]/20 focus:border-[#b8962e] outline-none transition-all text-gray-900 text-lg font-medium"
                suppressHydrationWarning />
              
                        </div>
                    </div>
                    <button
            onClick={calculate}
            disabled={!name || !dob || loading}
            className="w-full py-4 rounded-xl bg-[#7A1F01] hover:bg-[#5a1701] text-white font-bold text-lg transition-all shadow-sm active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-3"
            suppressHydrationWarning>
            
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Zap className="w-5 h-5" />}
                        {loading ? 'Calculating...' : 'Reveal My Numbers'}
                    </button>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {result &&
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            
                            <div className="flex justify-end mb-4 no-print">
                                <PaidPDFButton 
                                    toolKey="numerology"
                                    reportName={`${result?.inputName || 'My'} Numerology Report`}
                                    downloadFn={handleDownloadPDF}
                                    variant="primary"
                                    className="!text-sm"
                                />
                            </div>

                            <div id="numerology-report" className="space-y-10 bg-white p-4 md:p-10 rounded-3xl border border-[#d6c89a]/30">
                            
                            {/* ── SUMMARY BOXES ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
              { num: result.moolaank, title: 'Radical Number', color: '#b8962e' },
              { num: result.bhagyaank, title: 'Destiny Number', color: '#7A1F01' },
              { num: result.namaank, title: 'Name Number', color: '#2563eb' }].
              map((box, i) =>
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: box.color }} />
                                        <div className="text-5xl font-bold mb-2" style={{ color: box.color }}>{box.num}</div>
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{box.title}</div>
                                    </div>
              )}
                            </div>

                            {/* ── ATTRIBUTE GRID ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-3xl overflow-hidden shadow-xl">
                                {[
              { label: 'Name', value: result.inputName, color: 'text-gray-900' },
              { label: 'Date Of Birth', value: result.inputDob.split('-').reverse().join('-'), color: 'text-gray-900' },
              { label: 'Favourable Sign', value: NUM_DATA[result.moolaank]?.sign, color: 'text-orange-600' },
              { label: 'Favourable Alphabets', value: NUM_DATA[result.moolaank]?.alphabets, color: 'text-orange-600' },
              { label: 'Gemstone', value: NUM_DATA[result.moolaank]?.gemstone, color: 'text-[#2563eb]' },
              { label: 'Favourable Day(s)', value: NUM_DATA[result.moolaank]?.days, color: 'text-[#2563eb]' },
              { label: 'Favourable Number', value: NUM_DATA[result.moolaank]?.numbers, color: 'text-gray-900' },
              { label: 'Direction', value: NUM_DATA[result.moolaank]?.direction, color: 'text-gray-900' },
              { label: 'Auspicious Colour', value: NUM_DATA[result.moolaank]?.colour, color: 'text-[#b8962e]' },
              { label: 'Ruling Planet', value: NUM_DATA[result.moolaank]?.planet, color: 'text-[#b8962e]' },
              { label: 'God/Goddess', value: NUM_DATA[result.moolaank]?.deity, color: 'text-gray-900' },
              { label: 'Fast', value: NUM_DATA[result.moolaank]?.fast, color: 'text-gray-900' }].
              map((item, i) =>
              <div key={i} className="bg-white p-6 flex flex-col justify-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">{item.label}</p>
                                        <p className={`text-lg font-bold ${item.color} leading-tight`}>{item.value}</p>
                                    </div>
              )}
                                {/* Full Width Bottom Row */}
                                <div className="bg-white p-6 md:col-span-2 border-t border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">{t("numerology.favourable_date_s")}</p>
                                    <p className="text-lg font-bold text-gray-900">{NUM_DATA[result.moolaank]?.dates}</p>
                                </div>
                            </div>

                            {/* ── DETAILED ANALYSIS SECTIONS (CONCISE) ── */}
                            <div className="space-y-6 pt-6">
                                {[
              { num: result.moolaank, title: 'Radical Number', color: 'bg-[#b8962e]', desc: NUM_DATA[result.moolaank]?.description },
              { num: result.bhagyaank, title: 'Destiny Number', color: 'bg-[#7A1F01]', desc: NUM_DATA[result.bhagyaank]?.description },
              { num: result.namaank, title: 'Name Number', color: 'bg-[#2563eb]', desc: NUM_DATA[result.namaank]?.description }].
              map((sec, i) =>
              <div key={i} className="bg-white rounded-xl p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start transition-all">
                                        <div className={`w-20 h-20 rounded-xl ${sec.color} flex-shrink-0 flex items-center justify-center text-white text-4xl font-bold`}>
                                            {sec.num}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{sec.title}</h3>
                                            <p className="text-gray-500 leading-relaxed text-base font-medium">
                                                {sec.desc}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                            {/* Reset Button */}
                            <div className="text-center pt-8">
                                <button onClick={() => setResult(null)} className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b8962e] font-semibold transition-all group" suppressHydrationWarning>
                                    <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    {t("numerology.calculate_again")}
                                </button>
                            </div>

                        </motion.div>
          }
                </AnimatePresence>
            </div>
        </div>
        );

}