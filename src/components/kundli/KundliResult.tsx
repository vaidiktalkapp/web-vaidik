'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ArrowLeft, Layout, Table, History, Sparkles, ChevronRight, CalendarDays, User, Crown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NorthIndianChart from './charts/NorthIndianChart';
import SouthIndianChart from './charts/SouthIndianChart';
import PlanetaryTable from './PlanetaryTable';
import PanchangDetails from './PanchangDetails';
import HouseAnalysis from './HouseAnalysis';
import { downloadKundliPDF } from '@/lib/kundliPdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

interface KundliResultProps {
    data: any;
    onBack: () => void;
    onNew: () => void;
    hideHeader?: boolean;
}

const KundliResult = ({ data, onBack, onNew, hideHeader = false }: KundliResultProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [chartStyle, setChartStyle] = useState<'North' | 'South'>('North');
    const [chartType, setChartType] = useState<'D1' | 'D9' | 'Bhav'>('D1');

    const handleDownloadPDF = async () => {
        await downloadKundliPDF(data);
    };

    if (!data || !data.kundli) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 rounded-xl border border-[#d6c89a]" style={{ background: '#fffdf5' }}>
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: '#b8962e', borderTopColor: 'transparent' }} />
                <h3 className="text-[15px] font-semibold text-gray-900">Synchronizing with Stars</h3>
                <p className="text-sm text-gray-400 mt-1">Connecting to the celestial bridge. Please wait...</p>
                <button onClick={onBack} className="mt-6 px-6 py-2.5 rounded-lg text-white text-[13px] font-semibold" style={{ background: '#b8962e' }}>Go Back</button>
            </div>
        );
    }

    const { kundli, dasha, panchang, input, doshas } = data;

    React.useEffect(() => {
        const styleQuery = searchParams.get('chartStyle');
        if (styleQuery === 'South') setChartStyle('South');
        else if (styleQuery === 'North') setChartStyle('North');
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [searchParams]);

    // Shared toggle style
    const toggleBtn = (active: boolean) => ({
        background: active ? '#b8962e' : 'transparent',
        color: active ? '#fff' : '#9ca3af',
    });

    const sectionHeader = (Icon: any, label: string) => (
        <div className="flex items-center gap-2 pb-3 mb-5 border-b border-[#d6c89a]">
            <Icon className="w-4 h-4" style={{ color: '#b8962e' }} />
            <span className="text-[13px] font-semibold text-gray-900 uppercase tracking-widest">{label}</span>
        </div>
    );

    return (
        <div id="kundli-report" className="kr-wrap max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-8 scroll-smooth bg-white" style={{ color: '#111827' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                .kr-wrap { font-family: 'Inter', sans-serif; }
                .kr-panel { background: #fffdf5; border: 1px solid #d6c89a; border-radius: 12px; }
                .kr-panel-hd { background: rgba(184,150,46,0.08); border-bottom: 1px solid #d6c89a; padding: 14px 20px; }
            `}} />

            {/* ── Sticky Header ── */}
            {!hideHeader && (
                <div
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[#d6c89a] sticky top-4 z-40 no-print"
                    style={{ background: 'rgba(253,246,227,0.95)', backdropFilter: 'blur(10px)' }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2.5 rounded-lg border border-[#d6c89a] text-gray-500 hover:text-[#b8962e] hover:bg-[#f5e9c8] transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h2 className="text-[15px] font-semibold text-gray-900">{input.name}'s Kundli</h2>
                            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: '#b8962e' }}>
                                {input.date} · {input.time} · {input.place}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => router.push('/kundli/history')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#d6c89a] text-[12px] font-medium text-gray-600 hover:bg-[#f5e9c8] transition-all"
                        >
                            <History className="w-3.5 h-3.5" /> History
                        </button>
                        <button
                            onClick={onNew}
                            className="px-4 py-2 rounded-lg border border-[#d6c89a] text-[12px] font-medium text-gray-600 hover:bg-[#f5e9c8] transition-all"
                        >
                            New Chart
                        </button>
                        <PaidPDFButton 
                            toolKey="kundli"
                            reportName={`${input.name}'s Kundli`}
                            downloadFn={handleDownloadPDF}
                        />
                    </div>
                </div>
            )}

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ═══ LEFT COLUMN ═══ */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Chart Panel */}
                    <div id="charts" className="kr-panel overflow-hidden scroll-mt-32">
                        <div className="kr-panel-hd flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#b8962e' }}>
                                    {chartType === 'D1' ? 'Birth / Lagna Chart' : chartType === 'D9' ? 'Navamsa (D9) Chart' : 'Bhav Chalit Chart'}
                                </p>
                                <p className="text-[15px] font-semibold text-gray-900">{chartStyle} Indian Style</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {/* North / South toggle */}
                                <div className="flex p-0.5 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.06)' }}>
                                    {(['North', 'South'] as const).map(s => (
                                        <button key={s} onClick={() => setChartStyle(s)}
                                            className="px-4 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all"
                                            style={toggleBtn(chartStyle === s)}
                                        >{s}</button>
                                    ))}
                                </div>
                                {/* D1 / D9 / Bhav toggle */}
                                <div className="flex p-0.5 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.06)' }}>
                                    {(['D1', 'D9', 'Bhav'] as const).map(t => (
                                        <button key={t} onClick={() => setChartType(t)}
                                            className="flex-1 px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all"
                                            style={toggleBtn(chartType === t)}
                                        >
                                            {t === 'D1' ? 'D1' : t === 'D9' ? 'D9' : 'Bhav'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${chartStyle}-${chartType}`}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {chartStyle === 'North'
                                        ? <NorthIndianChart data={kundli} chartType={chartType} />
                                        : <SouthIndianChart data={kundli} chartType={chartType} />
                                    }
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {['Lahiri Ayanamsha', 'Porphyry Houses'].map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest border border-[#d6c89a]" style={{ color: '#b8962e', background: 'rgba(184,150,46,0.08)' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dasha Timeline */}
                    <div className="kr-panel overflow-hidden">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <History className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">Vimshottari Dasha Timeline</span>
                        </div>
                        <div className="p-4 space-y-3">
                            {dasha?.timeline ? dasha.timeline.map((item: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border transition-all"
                                    style={{
                                        background: item.is_current ? '#b8962e' : 'rgba(184,150,46,0.04)',
                                        borderColor: item.is_current ? '#b8962e' : '#d6c89a',
                                        transform: item.is_current ? 'scale(1.01)' : undefined,
                                    }}
                                >
                                    <div className="flex justify-between items-center p-4">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5"
                                                style={{ color: item.is_current ? 'rgba(255,255,255,0.6)' : '#b8962e' }}>
                                                {item.is_current ? 'Current Period' : `Mahadasha ${idx + 1}`}
                                            </p>
                                            <p className="text-[18px] font-semibold" style={{ color: item.is_current ? '#fff' : '#111827' }}>{item.lord}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-medium uppercase mb-0.5" style={{ color: item.is_current ? 'rgba(255,255,255,0.6)' : '#b8962e' }}>Timeline</p>
                                            <p className="text-[13px] font-semibold" style={{ color: item.is_current ? '#fff' : '#111827' }}>{item.start} — {item.end}</p>
                                        </div>
                                    </div>

                                    {item.antardashas && (
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="border-t pt-3 mb-2" style={{ borderColor: item.is_current ? 'rgba(255,255,255,0.2)' : '#e9ddb8' }}>
                                                <p className="text-[9px] font-semibold uppercase tracking-widest mb-2"
                                                    style={{ color: item.is_current ? 'rgba(255,255,255,0.5)' : '#b8962e' }}>Antardashas</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
                                                {item.antardashas.map((a: any, aIdx: number) => (
                                                    <div
                                                        key={aIdx}
                                                        className="px-3 py-1.5 rounded-lg flex justify-between items-center text-[11px]"
                                                        style={{
                                                            background: a.is_current
                                                                ? '#fffdf5'
                                                                : item.is_current ? 'rgba(255,255,255,0.1)' : 'rgba(184,150,46,0.06)',
                                                            color: a.is_current ? '#b8962e' : item.is_current ? 'rgba(255,255,255,0.8)' : '#6b7280',
                                                        }}
                                                    >
                                                        <span className="text-[12px] font-semibold">{a.lord}</span>
                                                        <span className="text-[11px] opacity-70">{a.end}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="p-5 rounded-xl border border-[#d6c89a] text-center" style={{ background: 'rgba(184,150,46,0.05)' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#b8962e' }}>Current Active Dasha</p>
                                    <p className="text-[17px] font-semibold text-gray-900">{dasha?.mahadasha?.lord || 'N/A'}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Recalculate to see full timeline</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dosha Audit */}
                    <div className="kr-panel overflow-hidden">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <Sparkles className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">Dosha Audit</span>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Manglik */}
                            <div
                                className="p-4 rounded-xl border"
                                style={{
                                    background: doshas.manglik.is_present ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
                                    borderColor: doshas.manglik.is_present ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                                    borderLeft: `3px solid ${doshas.manglik.is_present ? '#ef4444' : '#22c55e'}`,
                                }}
                            >
                                <p className="text-[12px] font-semibold uppercase tracking-widest mb-1.5"
                                    style={{ color: doshas.manglik.is_present ? '#b91c1c' : '#15803d' }}>Manglik Analysis</p>
                                <p className="text-[15px] font-semibold text-gray-900 mb-1.5">{doshas.manglik.is_present ? 'Dosha Present' : 'No Dosha'}</p>
                                <p className="text-[13px] text-gray-700 leading-relaxed">{doshas.manglik.details}</p>
                            </div>
                            {/* Kalsarp */}
                            <div
                                className="p-4 rounded-xl border"
                                style={{
                                    background: doshas.kalsarp.is_present ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
                                    borderColor: doshas.kalsarp.is_present ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                                    borderLeft: `3px solid ${doshas.kalsarp.is_present ? '#ef4444' : '#22c55e'}`,
                                }}
                            >
                                <p className="text-[12px] font-semibold uppercase tracking-widest mb-1.5"
                                    style={{ color: doshas.kalsarp.is_present ? '#b91c1c' : '#15803d' }}>Kalsarp Analysis</p>
                                <p className="text-[15px] font-semibold text-gray-900 mb-1.5">{doshas.kalsarp.is_present ? 'Dosha Present' : 'No Dosha'}</p>
                                <p className="text-[13px] text-gray-700 leading-relaxed">{doshas.kalsarp.details}</p>
                            </div>
                            {/* Aspects */}
                            {kundli.aspects && kundli.aspects.length > 0 && (
                                <div className="p-4 rounded-xl border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                    <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#b8962e' }}>Planetary Aspects</p>
                                    <div className="space-y-1.5">
                                        {kundli.aspects.slice(0, 10).map((asp: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-800">
                                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#b8962e' }} />
                                                {asp}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT COLUMN ═══ */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Core Astrological Identity */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-3.5 h-3.5" style={{ color: '#b8962e' }} />
                            <span className="text-[13px] font-semibold uppercase tracking-widest text-gray-700">Core Astrological Identity</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Ascendant', value: kundli.ascendant },
                                { label: 'Moon Sign',  value: panchang.moon_sign },
                                { label: 'Sun Sign',   value: panchang.sun_sign },
                                { label: 'Nakshatra',  value: panchang.nakshatra },
                            ].map((stat) => (
                                <div key={stat.label} className="kr-panel p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#b8962e' }}>{stat.label}</p>
                                    <p className="text-[16px] font-semibold text-gray-900 uppercase leading-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panchang Details */}
                    <div className="kr-panel overflow-hidden">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">Birth Panchang Details</span>
                        </div>
                        <div className="p-5">
                            <PanchangDetails panchang={panchang} />
                        </div>
                    </div>

                    {/* Planetary Table */}
                    <div id="planetary-positions" className="kr-panel overflow-hidden scroll-mt-32">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <Table className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">Planetary Positions & Dignities</span>
                        </div>
                        <div className="p-5">
                            <PlanetaryTable planets={kundli.planets} />
                        </div>
                    </div>

                    {/* Detailed Planetary Alignments */}
                    <div className="kr-panel overflow-hidden">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <Sparkles className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">Detailed Planetary Alignments</span>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(kundli.planets)
                                    .map(([name, p]: any) => {
                                        const symbols: any = {
                                            Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
                                            Jupiter: '♃', Venus: '♀', Saturn: '♄',
                                            Rahu: '☊', Ketu: '☋', Uranus: '⛢', Neptune: '♆', Pluto: '♇',
                                            Ascendant: 'ASC'
                                        };
                                        return (
                                            <div key={name} className="p-4 rounded-lg border border-[#e9ddb8] transition-all" style={{ background: 'rgba(184,150,46,0.04)' }}>
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white" style={{ background: '#b8962e' }}>
                                                        {symbols[name] || name.charAt(0)}
                                                    </div>
                                                    <h4 className="text-[14px] font-semibold text-gray-900">{name}</h4>
                                                </div>
                                                <p className="text-[13px] text-gray-700 leading-relaxed">{p.basic_reading || 'No reading generated.'}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* House Analysis */}
                    <div id="house-representation" className="kr-panel overflow-hidden scroll-mt-32">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <Layout className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">House Analysis</span>
                        </div>
                        <div className="p-5">
                            <HouseAnalysis houses={kundli.houses} planets={kundli.planets} />
                        </div>
                    </div>

                    {/* Deep Cosmic Insights — cream themed, no dark purple */}
                    <div id="basic-interpretation" className="kr-panel overflow-hidden scroll-mt-32">
                        <div className="kr-panel-hd flex items-center gap-2">
                            <Sparkles className="w-4 h-4" style={{ color: '#b8962e' }} />
                            <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-widest">Deep Cosmic Insights</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-[13px] text-gray-600">Vedic personality & life analysis based on your unique alignment.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Core Identity */}
                                <div className="p-4 rounded-xl border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#b8962e' }}>Core Identity & Ascendant</p>
                                    <p className="text-[13px] text-gray-800 leading-relaxed">"{data.interpretations.ascendant.reading}"</p>
                                </div>
                                {/* Emotional Nature */}
                                <div className="p-4 rounded-xl border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#b8962e' }}>Emotional Nature</p>
                                    <p className="text-[13px] text-gray-800 leading-relaxed">"{data.interpretations.moon.reading}"</p>
                                </div>
                            </div>

                            {/* Life Path */}
                            <div className="p-5 rounded-xl border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout className="w-3.5 h-3.5" style={{ color: '#b8962e' }} />
                                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>Your Life's Path & Purpose</p>
                                </div>
                                <p className="text-[14px] font-semibold text-gray-900 mb-2">General Soul Blueprint</p>
                                <p className="text-[13px] text-gray-800 leading-relaxed">{data.interpretations.life_path.reading}</p>
                            </div>

                            <div className="pt-1">
                                <Link
                                    href="/kundli/interpretation"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-[12px] font-semibold transition-all"
                                    style={{ background: '#b8962e' }}
                                >
                                    Explore Advanced Interpretations
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default KundliResult;