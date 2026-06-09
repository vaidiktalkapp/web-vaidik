'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Sparkles, Heart, Shield, Zap, Star,
    ChevronDown, ChevronUp, Gem, Compass, Palette, Hash, Calendar, RotateCcw, Moon,
    Download, Loader2
} from 'lucide-react';
import { downloadMoonSignPDF } from '@/lib/moonSignPdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';
import Link from 'next/link';
import { Users } from 'lucide-react';

interface MoonSignResultProps {
    data: any;
    onBack: () => void;
    onNew: () => void;
}

const SIGN_CONFIG: Record<string, { color: string; light: string; border: string; pillText: string; pillBg: string; pillBorder: string }> = {
    Aries:       { color: '#dc2626', light: '#fef2f2', border: '#fca5a5', pillText: '#991b1b', pillBg: '#fef2f2', pillBorder: '#fca5a5' },
    Taurus:      { color: '#059669', light: '#ecfdf5', border: '#6ee7b7', pillText: '#065f46', pillBg: '#ecfdf5', pillBorder: '#6ee7b7' },
    Gemini:      { color: '#d97706', light: '#fffbeb', border: '#fcd34d', pillText: '#92400e', pillBg: '#fffbeb', pillBorder: '#fcd34d' },
    Cancer:      { color: '#2563eb', light: '#eff6ff', border: '#93c5fd', pillText: '#1e3a8a', pillBg: '#eff6ff', pillBorder: '#93c5fd' },
    Leo:         { color: '#ea580c', light: '#fff7ed', border: '#fdba74', pillText: '#9a3412', pillBg: '#fff7ed', pillBorder: '#fdba74' },
    Virgo:       { color: '#16a34a', light: '#f0fdf4', border: '#86efac', pillText: '#14532d', pillBg: '#f0fdf4', pillBorder: '#86efac' },
    Libra:       { color: '#db2777', light: '#fdf2f8', border: '#f9a8d4', pillText: '#9d174d', pillBg: '#fdf2f8', pillBorder: '#f9a8d4' },
    Scorpio:     { color: '#e11d48', light: '#fff1f2', border: '#fda4af', pillText: '#9f1239', pillBg: '#fff1f2', pillBorder: '#fda4af' },
    Sagittarius: { color: '#7c3aed', light: '#f5f3ff', border: '#c4b5fd', pillText: '#4c1d95', pillBg: '#f5f3ff', pillBorder: '#c4b5fd' },
    Capricorn:   { color: '#475569', light: '#f8fafc', border: '#cbd5e1', pillText: '#1e293b', pillBg: '#f8fafc', pillBorder: '#cbd5e1' },
    Aquarius:    { color: '#0891b2', light: '#ecfeff', border: '#67e8f9', pillText: '#164e63', pillBg: '#ecfeff', pillBorder: '#67e8f9' },
    Pisces:      { color: '#4f46e5', light: '#eef2ff', border: '#a5b4fc', pillText: '#312e81', pillBg: '#eef2ff', pillBorder: '#a5b4fc' },
};
const DEFAULT_CFG = { color: '#d97706', light: '#fffbeb', border: '#fcd34d', pillText: '#92400e', pillBg: '#fffbeb', pillBorder: '#fcd34d' };

const fade    = { hidden: { opacity: 0, y: 8 },  show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
const stagger = { hidden: { opacity: 0 },         show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);

/* Section label — dark text, visible icon */
const SectionLabel = ({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) => (
    <div className="flex items-center gap-2 mb-3">
        <span style={{ color: color ?? '#d97706' }}>{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-700">{label}</span>
    </div>
);

const MoonSignResult = ({ data, onBack, onNew }: MoonSignResultProps) => {
    const [emoOpen, setEmoOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await downloadMoonSignPDF(data);
        } catch (error) {
            console.error('PDF error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const sign = data.moonSign || 'Unknown';
    const cfg  = SIGN_CONFIG[sign] ?? DEFAULT_CFG;

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: '#fdf6e3' }}>
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="w-full max-w-screen-xl mx-auto px-6 py-8 space-y-4 shadow-sm"
            >

                {/* ── ROW 1: HERO ── */}
                <motion.div variants={fade}>
                    <Card className="overflow-hidden border-[#d6c89a]">
                        <div className="h-1" style={{ backgroundColor: cfg.color }} />
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">

                            {/* Symbol tile */}
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 select-none text-3xl font-bold"
                                style={{ backgroundColor: cfg.light, border: `2px solid ${cfg.border}` }}
                            >
                                {data.symbol ?? '☽'}
                            </div>

                            {/* Identity */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-0.5" style={{ color: cfg.color }}>
                                    Celestial Reading
                                </p>
                                <div className="flex items-baseline gap-2.5 flex-wrap">
                                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none">{sign}</h1>
                                    {data.sanskritName && (
                                        <span className="text-base font-medium text-gray-500">{data.sanskritName}</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {data.element && (
                                        <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest bg-gray-100 border-gray-300 text-gray-700">
                                            {data.element}
                                        </span>
                                    )}
                                    {data.quality && (
                                        <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest bg-gray-100 border-gray-300 text-gray-700">
                                            {data.quality}
                                        </span>
                                    )}
                                    <span
                                        className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: cfg.pillText, backgroundColor: cfg.pillBg, borderColor: cfg.pillBorder }}
                                    >
                                        Birth Sign
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-row gap-0 divide-x divide-[#d6c89a] border border-[#d6c89a] rounded-xl overflow-hidden">
                                {[
                                    { label: 'Ruler',     value: data.rulingPlanet ?? '—' },
                                    { label: 'Nakshatra', value: data.rawAstro?.moonNakshatra ?? '—' },
                                    { label: 'House',     value: data.rawAstro?.moonHouse ? `${data.rawAstro.moonHouse}th` : '—' },
                                    { label: 'Degree',    value: data.rawAstro?.moonDegree != null ? `${Number(data.rawAstro.moonDegree).toFixed(1)}°` : '—' },
                                ].map((s) => (
                                    <div key={s.label} className="px-5 py-3 text-center bg-gray-50/50">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#b8962e] mb-1">{s.label}</p>
                                        <p className="text-sm font-black text-gray-900">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={onNew}
                                    className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md group shrink-0"
                                    style={{ backgroundColor: '#b8962e' }}
                                    suppressHydrationWarning
                                >
                                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                    New Calculation
                                </button>
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-500 border border-[#d6c89a] rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-[#b8962e] hover:border-[#b8962e] transition-all group shrink-0"
                                    suppressHydrationWarning
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                    Reset Result
                                </button>
                                <PaidPDFButton 
                                    toolKey="moon-sign"
                                    reportName={`${sign} Moon Sign Report`}
                                    downloadFn={handleDownload}
                                    variant="outline"
                                    className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest group shrink-0 border-[#b8962e] text-[#b8962e] hover:bg-[#b8962e] hover:text-white"
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>
                
                {/* ── NAVIGATION CARDS ── */}
                <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/horoscope-matching">
                        <Card className="p-5 flex items-center gap-4 hover:shadow-md hover:border-[#b8962e] transition-all group cursor-pointer h-full border-[#d6c89a]">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                <Users className="w-6 h-6 text-[#b8962e]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-gray-900 leading-tight">Horoscope Matching</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Check compatibility with your partner</p>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/love-horoscope">
                        <Card className="p-5 flex items-center gap-4 hover:shadow-md hover:border-rose-300 transition-all group cursor-pointer h-full border-[#d6c89a]">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 group-hover:bg-rose-100 transition-colors">
                                <Heart className="w-6 h-6 text-rose-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-gray-900 leading-tight">Love Horoscope</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Explore your romantic future today</p>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/moon-signs">
                        <Card className="p-5 flex items-center gap-4 hover:shadow-md hover:border-cyan-300 transition-all group cursor-pointer h-full border-[#d6c89a]">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center border border-cyan-100 group-hover:bg-cyan-100 transition-colors">
                                <Moon className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-gray-900 leading-tight">Moon Signs</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Discover your emotional blueprint</p>
                            </div>
                        </Card>
                    </Link>
                </motion.div>

                {/* ── ROW 2: ANALYSIS + GIFTS/LESSONS ── */}
                {false && (
                <motion.div variants={fade} className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

                    <div className="lg:col-span-3 flex flex-col gap-4">
                        {/* Soul Analysis */}
                        <Card className="p-6 border-[#d6c89a]">
                            <SectionLabel icon={<Sparkles className="w-4 h-4" />} label="Soul Analysis" color={'#b8962e'} />
                            <div className="text-[14px] text-gray-800 leading-relaxed space-y-3">
                                {data.overview?.split('\n').filter(Boolean).map((p: string, i: number) => (
                                    <p key={i}>{p}</p>
                                )) ?? <p className="text-gray-500">Generating…</p>}
                            </div>
                        </Card>

                        {/* Moon Sign Explanation (Static Content to fill gap and educate) */}
                        <Card className="p-6 border-[#d6c89a] bg-amber-50/30">
                            <SectionLabel icon={<Moon className="w-4 h-4" />} label="Understanding Your Moon Sign" color={'#b8962e'} />
                            <div className="text-[13px] text-gray-700 leading-relaxed space-y-3">
                                <p>
                                    In Vedic Astrology (Jyotish), your <strong>Moon Sign (Chandra Rashi)</strong> is considered more important than your Sun Sign. While the Sun represents your soul and ego, the Moon governs your <strong>mind, emotions, and inner subconscious</strong>.
                                </p>
                                <p>
                                    It dictates how you react to the world, your psychological patterns, and your sense of comfort. Since the Moon changes signs every 2.5 days, its position provides a highly personalized layer to your personality, revealing your deepest emotional needs and your natural temperament.
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Gifts + Lessons */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Card className="flex-1 p-5">
                            <SectionLabel icon={<Zap className="w-4 h-4" />} label="Divine Gifts" color="#16a34a" />
                            <ul className="space-y-2.5">
                                {(data.strengths ?? []).map((s: string, i: number) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                        <span className="text-[13px] text-gray-800 font-medium leading-snug">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card className="flex-1 p-5">
                            <SectionLabel icon={<Shield className="w-4 h-4" />} label="Karmic Lessons" color={cfg.color} />
                            <ul className="space-y-2.5">
                                {(data.weaknesses ?? []).map((s: string, i: number) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                                        <span className="text-[13px] text-gray-800 font-medium leading-snug">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </motion.div>
                )}

                {/* ── ROW 3: CORE TRAITS ── */}
                {false && (
                data.personalityTraits?.length > 0 && (
                    <motion.div variants={fade}>
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4" style={{ color: cfg.color }} />
                            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-700">Core Traits</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {data.personalityTraits.map((t: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                                >
                                    <span className="text-2xl block mb-2 leading-none">{t.emoji ?? '✦'}</span>
                                    <p className="text-[12px] font-black text-gray-900 mb-1">{t.title}</p>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">{t.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )
                )}

                {/* ── ROW 4: EMOTIONAL + COMPAT + LUCKY ── */}
                {false && (
                <motion.div variants={fade} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Emotional Accordion */}
                    <Card className="overflow-hidden">
                        <button
                            onClick={() => setEmoOpen(o => !o)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                            suppressHydrationWarning
                        >
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-700">Emotional Landscape</span>
                            </div>
                            {emoOpen
                                ? <ChevronUp className="w-4 h-4 text-gray-500" />
                                : <ChevronDown className="w-4 h-4 text-gray-500" />
                            }
                        </button>
                        <AnimatePresence>
                            {emoOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5 pt-2 border-t border-gray-200 text-[13px] text-gray-800 leading-relaxed space-y-2">
                                        {data.emotionalNature?.split('\n').filter(Boolean).map((p: string, i: number) => (
                                            <p key={i}>{p}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!emoOpen && data.emotionalNature && (
                            <p className="px-5 pb-4 text-[12px] text-gray-600 leading-relaxed line-clamp-3">
                                {data.emotionalNature.split('\n').filter(Boolean)[0]}
                            </p>
                        )}
                    </Card>

                    {/* Compatibility */}
                    <Card className="p-5">
                        <SectionLabel icon={<Heart className="w-4 h-4" />} label="Rashi Compatibility" color="#e11d48" />
                        <div className="space-y-3">
                            {[
                                { label: 'Divine Unions',   key: 'bestMatches',        hd: '#15803d', tagText: '#14532d', tagBg: '#f0fdf4', tagBorder: '#86efac' },
                                { label: 'Good Allies',     key: 'goodMatches',        hd: '#1d4ed8', tagText: '#1e3a8a', tagBg: '#eff6ff', tagBorder: '#93c5fd' },
                                { label: 'Growth Partners', key: 'challengingMatches', hd: '#b45309', tagText: '#78350f', tagBg: '#fffbeb', tagBorder: '#fcd34d' },
                            ].map(({ label, key, hd, tagText, tagBg, tagBorder }) => (
                                <div key={key}>
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: hd }}>{label}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {data.compatibility?.[key]?.map((s: string) => (
                                            <span
                                                key={s}
                                                className="px-2 py-0.5 rounded-lg text-[11px] font-bold border"
                                                style={{ color: tagText, backgroundColor: tagBg, borderColor: tagBorder }}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Lucky Attributes */}
                    <Card className="p-5">
                        <SectionLabel icon={<Gem className="w-4 h-4" />} label="Lucky Attributes" color={cfg.color} />
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { icon: <Palette className="w-3.5 h-3.5" />, label: 'Color',     value: data.luckyAttributes?.color },
                                { icon: <Hash className="w-3.5 h-3.5" />,    label: 'Number',    value: data.luckyAttributes?.number },
                                { icon: <Calendar className="w-3.5 h-3.5" />,label: 'Day',       value: data.luckyAttributes?.day },
                                { icon: <Gem className="w-3.5 h-3.5" />,     label: 'Stone',     value: data.luckyAttributes?.gemstone },
                                { icon: <Star className="w-3.5 h-3.5" />,    label: 'Metal',     value: data.luckyAttributes?.metal },
                                { icon: <Compass className="w-3.5 h-3.5" />, label: 'Direction', value: data.luckyAttributes?.direction },
                            ].map((a) => (
                                <div key={a.label} className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-center">
                                    <div className="flex justify-center mb-1" style={{ color: cfg.color }}>{a.icon}</div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-0.5">{a.label}</p>
                                    <p className="text-[11px] font-black text-gray-900 truncate">{a.value ?? '—'}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
                )}

                {/* ── ROW 5: NAKSHATRA + MANTRA ── */}
                {false && (
                <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4" style={{ color: cfg.color }} />
                            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-700">Nakshatra Essence</span>
                        </div>
                        <p className="text-[14px] text-gray-800 leading-relaxed">&ldquo;{data.nakshatraInsight}&rdquo;</p>
                    </Card>

                    <div
                        className="rounded-2xl border p-5"
                        style={{ backgroundColor: cfg.light, borderColor: cfg.border }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4" style={{ color: cfg.color }} />
                            <span className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: cfg.pillText }}>Sacred Mantra</span>
                        </div>
                        <p className="text-[16px] font-black text-gray-900 leading-snug mb-1.5">&ldquo;{data.moonMantra}&rdquo;</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>Chant for lunar alignment</p>
                    </div>
                </motion.div>
                )}

                {/* ── FOOTER ── */}
                {false && (
                <motion.div variants={fade} className="flex justify-center pb-4 pt-2">
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-[11px] font-bold uppercase tracking-widest text-gray-700 hover:border-amber-400 hover:text-amber-600 bg-white transition-all shadow-sm"
                        suppressHydrationWarning
                    >
                        ← Get Another Reading
                    </button>
                </motion.div>
                )}

            </motion.div>
        </div>
    );
};

export default MoonSignResult;