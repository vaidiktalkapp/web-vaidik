'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Heart, DollarSign, Briefcase, Home, Shield, 
    Zap, Star, Moon, Sun, ChevronRight,
    RotateCcw, Download, Sparkles,
    User, Globe, Compass, Plus, Minus, Eye, BookOpen, Book,
    ArrowLeft, History } from 'lucide-react';
    
import { downloadLalKitabPDF } from '@/lib/lalKitabPdfGenerator';
import { useTranslation } from '@/context/LanguageContext';
import { lalKitabStorage } from '@/lib/lalKitabStorage';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

interface PlanetData {
    house: string;
    sign: string;
    analysis: string;
    beneficEffects: string[];
    maleficEffects: string[];
    remedies: string[];
    houseGuide: string[];
}

interface LalKitabResultProps {
    data: {
        planets: Record<string, PlanetData>;
        lifeAreaRemedies?: { category: string; text: string; icon: string }[];
        generalRules: string[];
        input: any;
    };
    onBack?: () => void;
    onHistoryClick?: () => void;
    onNew: () => void;
}

const planetIcons: Record<string, any> = {
    Sun: Sun, Moon: Moon, Mars: Zap, Mercury: Star,
    Jupiter: Sparkles, Venus: Heart, Saturn: Shield,
    Rahu: Globe, Ketu: Compass
};

const areaIcons: Record<string, any> = {
    Health: Heart, Wealth: DollarSign, Career: Briefcase,
    Family: Home, Protection: Shield
};

const planetHindi: Record<string, string> = {
    Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
    Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु'
};

const formatText = (text: any) => {
    if (!text) return '';
    if (typeof text !== 'string') return text.title || text.description || text.text || String(text);
    return text.replace(/^\(\d+\)\s*/, '');
};

const LalKitabResult = ({ data, onBack, onNew, onHistoryClick }: LalKitabResultProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [selectedPlanet, setSelectedPlanet] = useState<string>('Sun');

    useEffect(() => {
        setMounted(true);
        if (data.planets) {
            const firstPlanet = Object.keys(data.planets)[0];
            if (firstPlanet) setSelectedPlanet(firstPlanet);
        }
    }, [data.planets]);

    if (!mounted) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf6e3' }}>
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#b8962e', borderTopColor: 'transparent' }} />
        </div>
    );

    if (!data.planets || Object.keys(data.planets).length === 0) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 rounded-xl border border-[#d6c89a] space-y-6" style={{ background: '#fffdf5' }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184,150,46,0.1)', border: '1px solid #d6c89a' }}>
                    <RotateCcw className="w-8 h-8" style={{ color: '#b8962e' }} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">{t("lal_kitab.system_upgrade")}</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                        {t("lal_kitab.upgrade_desc")}
                    </p>
                </div>
                <button
                    onClick={onNew}
                    className="px-6 py-3 text-white text-sm font-semibold rounded-lg transition-all"
                    style={{ background: '#b8962e' }}
                >
                    {t("lal_kitab.recalculate_now")}
                </button>
            </div>
        );
    }

    const currentPlanetData = data.planets[selectedPlanet];
    if (!currentPlanetData) return <div className="p-20 text-center text-gray-400 text-sm">{t("lal_kitab.preparing_synthesis")}</div>;

    return (
        <div className="lk-wrap max-w-6xl mx-auto space-y-8 pb-24 px-4" style={{ color: '#111827' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .lk-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .lk-wrap h1, .lk-wrap h2, .lk-wrap h3, .lk-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .lk-planet-btn:hover { background: rgba(184,150,46,0.08) !important; }
            `}} />

            {/* ── Sticky Header ── */}
            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[#d6c89a] sticky top-4 z-40"
                style={{ background: 'rgba(253,246,227,0.95)', backdropFilter: 'blur(10px)' }}
            >
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2.5 rounded-lg border border-[#d6c89a] text-gray-500 hover:text-[#b8962e] hover:bg-[#f5e9c8] transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-[15px] font-semibold text-gray-900 serif">{data.input?.name}{t("lal_kitab.s_lal_kitab")}</h2>
                        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: '#b8962e' }}>
                            {data.input?.date} · {data.input?.time} · {data.input?.place}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            lalKitabStorage.clearLastViewed();
                            if (onHistoryClick) {
                                onHistoryClick();
                            } else {
                                router.push('/lal-kitab/history');
                            }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#d6c89a] text-[12px] font-medium text-gray-600 hover:bg-[#f5e9c8] transition-all"
                    >
                        <History className="w-3.5 h-3.5" /> {t("lal_kitab.history")}
                    </button>
                    <button
                        onClick={onNew}
                        className="px-4 py-2 rounded-lg border border-[#d6c89a] text-[12px] font-medium text-gray-600 hover:bg-[#f5e9c8] transition-all"
                    >
                        {t("lal_kitab.new_report")}
                    </button>
                    <PaidPDFButton 
                        toolKey="lal-kitab"
                        reportName={`${data.input?.name || 'User'}'s Lal Kitab`}
                        downloadFn={async () => { await downloadLalKitabPDF(data); }}
                        className="px-5 py-2 !text-[12px] !rounded-lg"
                    />
                </div>
            </div>

            {/* ── Planet Selector ── */}
            <div className="rounded-xl border border-[#d6c89a] p-2.5" style={{ background: 'rgba(184,150,46,0.04)' }}>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                    {Object.keys(data.planets).map((p) => {
                        const Icon = planetIcons[p] || Star;
                        const isSelected = selectedPlanet === p;
                        return (
                            <button
                                key={p}
                                onClick={() => setSelectedPlanet(p)}
                                className="lk-planet-btn flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-all"
                                style={{
                                    background: isSelected ? '#b8962e' : 'transparent',
                                    color: isSelected ? '#fff' : '#6b7280',
                                }}
                            >
                                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? '#fff' : '#b8962e' }} />
                                <span className="text-[10px] font-semibold uppercase tracking-wide">{p}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Planet Hero ── */}
            <div
                className="rounded-xl px-7 py-5 flex items-center gap-5"
                style={{ background: 'rgba(184,150,46,0.08)', border: '1px solid #d6c89a' }}
            >
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#b8962e' }}
                >
                    {React.createElement(planetIcons[selectedPlanet] || Sun, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 serif">
                            {selectedPlanet}
                        </h2>
                        <span style={{ color: '#b8962e' }} className="opacity-40 text-lg">·</span>
                        <span className="serif text-lg md:text-xl" style={{ color: '#b8962e' }}>{planetHindi[selectedPlanet]}</span>
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mt-0.5">
                        {t("lal_kitab.lbl_remedies_house")} {currentPlanetData.house}
                    </p>
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="space-y-8">

                {/* Analysis */}
                <motion.div
                    key={`${selectedPlanet}-analysis`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#d6c89a] p-6 md:p-8"
                    style={{ background: '#fffdf5' }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>
                            {selectedPlanet} {t("lal_kitab.in_house")} {currentPlanetData.house} {t("lal_kitab.interpretation_suffix")}
                        </span>
                    </div>
                    <div className="h-px w-10 mb-4" style={{ background: '#b8962e' }} />
                    <p className="text-[14px] leading-relaxed text-gray-700 font-normal">
                        {formatText(currentPlanetData.analysis)}
                    </p>
                </motion.div>

                {/* Remedies + Effects */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left: Remedies + Life Areas */}
                    <div className="xl:col-span-2 space-y-5">

                        {/* Remedies */}
                        <div className="rounded-xl border border-[#d6c89a] overflow-hidden" style={{ background: '#fffdf5' }}>
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#b8962e' }}>
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-gray-900 serif">{t("lal_kitab.remedial_measures")}</h3>
                                    <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: '#b8962e' }}>{t("lal_kitab.authentic_upays")}</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-2.5">
                                {(currentPlanetData.remedies || []).map((remedy, idx) => (
                                    <div key={idx} className="flex items-start gap-3 pb-2.5 border-b border-[#e9ddb8] last:border-0 last:pb-0">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                                            style={{ background: 'rgba(184,150,46,0.12)', color: '#b8962e' }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <p className="text-[13px] text-gray-700 font-normal leading-relaxed">
                                            {formatText(remedy)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Life Area Remedies */}
                        {(data.lifeAreaRemedies || []).length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {(data.lifeAreaRemedies || []).map((area, idx) => {
                                    const Icon = areaIcons[area.category] || Shield;
                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-[#d6c89a] p-4 space-y-2.5 transition-all"
                                            style={{ background: '#fffdf5' }}
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,150,46,0.12)' }}>
                                                <Icon className="w-4 h-4" style={{ color: '#b8962e' }} />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-semibold text-gray-900 mb-0.5">{area.category}</h4>
                                                <p className="text-[11px] text-gray-500 leading-relaxed">{formatText(area.text)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right: Benefic + Malefic */}
                    <div className="space-y-5">
                        <div
                            className="rounded-xl border overflow-hidden"
                            style={{ borderColor: '#d6c89a', background: '#fffdf5', borderLeftWidth: '3px', borderLeftColor: '#22c55e' }}
                        >
                            <div className="px-5 py-3.5 border-b border-[#e9ddb8] flex items-center gap-2" style={{ background: 'rgba(34,197,94,0.05)' }}>
                                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                <h4 className="text-[13px] font-semibold text-gray-900">{t("lal_kitab.if_benefic")}</h4>
                            </div>
                            <ul className="p-4 space-y-2">
                                {(currentPlanetData.beneficEffects || []).map((item, i) => (
                                    <li key={i} className="text-[12px] text-gray-600 leading-relaxed pb-2 border-b border-[#e9ddb8] last:border-0 last:pb-0 flex gap-2">
                                        <span className="text-emerald-500 flex-shrink-0">·</span>
                                        {formatText(item)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div
                            className="rounded-xl border overflow-hidden"
                            style={{ borderColor: '#d6c89a', background: '#fffdf5', borderLeftWidth: '3px', borderLeftColor: '#ef4444' }}
                        >
                            <div className="px-5 py-3.5 border-b border-[#e9ddb8] flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.05)' }}>
                                <Minus className="w-3.5 h-3.5 text-red-500" />
                                <h4 className="text-[13px] font-semibold text-gray-900">{t("lal_kitab.if_malefic")}</h4>
                            </div>
                            <ul className="p-4 space-y-2">
                                {(currentPlanetData.maleficEffects || []).map((item, i) => (
                                    <li key={i} className="text-[12px] text-gray-600 leading-relaxed pb-2 border-b border-[#e9ddb8] last:border-0 last:pb-0 flex gap-2">
                                        <span className="text-red-400 flex-shrink-0">·</span>
                                        {formatText(item)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* House Guide */}
                <section className="rounded-xl border border-[#d6c89a] overflow-hidden" style={{ background: '#fffdf5' }}>
                    <div className="px-6 py-4 border-b border-[#d6c89a] text-center" style={{ background: 'rgba(184,150,46,0.08)' }}>
                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#b8962e' }}>{t("lal_kitab.encyclopedic_guide")}</p>
                        <p className="text-[12px] text-gray-500">{t("lal_kitab.traditional_placement_guide")} {selectedPlanet} {t("lal_kitab.across_all_houses")}</p>
                    </div>
                    <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {(currentPlanetData.houseGuide || []).map((effect, i) => {
                            const isActive = currentPlanetData.house === String(i + 1);
                            return (
                                <div
                                    key={i}
                                    className="p-4 rounded-lg border transition-all"
                                    style={{
                                        background: isActive ? '#b8962e' : 'rgba(184,150,46,0.04)',
                                        border: isActive ? '1px solid #b8962e' : '1px solid #d6c89a',
                                        transform: isActive ? 'scale(1.02)' : undefined,
                                    }}
                                >
                                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: isActive ? 'rgba(255,255,255,0.65)' : '#b8962e' }}>
                                        {t("lal_kitab.house")} {i + 1}
                                    </p>
                                    <p className="text-[11px] leading-relaxed" style={{ color: isActive ? '#fff' : '#374151' }}>
                                        {effect}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* Universal Wisdom */}
            <section className="rounded-xl border border-[#d6c89a] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" style={{ color: '#b8962e' }} />
                        <h3 className="text-[15px] font-semibold text-gray-900 serif">{t("lal_kitab.personalized_rules")}</h3>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ background: '#fffdf5' }}>
                    {(data.generalRules || []).map((rule, idx) => (
                        <div
                            key={idx}
                            className="flex gap-3 p-4 rounded-lg border border-[#e9ddb8] transition-all"
                            style={{ background: 'rgba(184,150,46,0.03)' }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-white"
                                style={{ background: '#b8962e' }}
                            >
                                {idx + 1}
                            </div>
                            <p className="text-[12px] text-gray-600 leading-relaxed">{formatText(rule)}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LalKitabResult;