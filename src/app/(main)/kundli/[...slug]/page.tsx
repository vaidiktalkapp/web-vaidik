'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { kundliStorage } from '@/lib/kundliStorage';
import NorthIndianChart from '@/components/kundli/charts/NorthIndianChart';
import SouthIndianChart from '@/components/kundli/charts/SouthIndianChart';
import PlanetaryTable from '@/components/kundli/PlanetaryTable';
import PanchangDetails from '@/components/kundli/PanchangDetails';
import HouseAnalysis from '@/components/kundli/HouseAnalysis';
import { ArrowLeft, Sparkles, FileText, Layout, Table, Info, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Interpretation Component ──────────────────────────────────────────────────
const AstrologicalInterpretation = ({ data }: {data: any;}) => {
    const { t } = useTranslation();

  const interpretations = data.interpretations;

  if (!interpretations) return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed border-[#d6c89a] p-14 text-center"
      style={{ background: 'rgba(184,150,46,0.03)' }}>
      
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                <Sparkles className="w-6 h-6 opacity-50" style={{ color: '#b8962e' }} />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-800 mb-1.5">{t("____slug_.interpretation_available")}</h3>
            <p className="text-sm text-gray-400">{t("____slug_.recalculate_your_chart_to_unlo")}</p>
        </motion.div>);


  const primaryCards = [
  { label: 'Ascendant (Lagna)', sign: interpretations.ascendant.sign, reading: interpretations.ascendant.reading },
  { label: 'Moon Sign (Rashi)', sign: interpretations.moon.sign, reading: interpretations.moon.reading },
  { label: 'Sun Sign (Surya)', sign: interpretations.sun.sign, reading: interpretations.sun.reading }];


  const secondaryCards = [
  { label: 'Birth Nakshatra', sign: interpretations.nakshatra.name, reading: interpretations.nakshatra.reading },
  { label: 'Jupiter (Guru)', sign: interpretations.jupiter.sign, reading: interpretations.jupiter.reading },
  { label: 'Saturn (Shani)', sign: interpretations.saturn.sign, reading: interpretations.saturn.reading }];


  return (
    <div className="space-y-5">
            {/* Section header */}
            <div className="flex items-center gap-2 pb-3 border-b border-[#d6c89a]">
                <Sparkles className="w-4 h-4" style={{ color: '#b8962e' }} />
                <span className="text-[15px] font-semibold text-gray-800">{t("____slug_.astrological_interpretation")}</span>
            </div>

            {/* Primary triad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {primaryCards.map((item) =>
        <div
          key={item.label}
          className="rounded-xl border border-[#d6c89a] p-5"
          style={{ background: '#fffdf5' }}>
          
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#b8962e' }}>{item.label}</p>
                        <h4 className="text-[15px] font-semibold text-gray-900 mb-2">{item.sign}</h4>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{item.reading}</p>
                    </div>
        )}
            </div>

            {/* Secondary triad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {secondaryCards.map((item) =>
        <div
          key={item.label}
          className="rounded-xl border border-[#d6c89a] p-5"
          style={{ background: '#fffdf5' }}>
          
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#b8962e' }}>{item.label}</p>
                        <h4 className="text-[15px] font-semibold text-gray-900 mb-2">{item.sign}</h4>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{item.reading}</p>
                    </div>
        )}
            </div>

            {/* Yoga & Strengths */}
            <div className="rounded-xl border border-[#d6c89a] p-6" style={{ background: '#fffdf5' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Layout className="w-3.5 h-3.5" style={{ color: '#b8962e' }} />
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>
                        {interpretations.yoga?.title || 'Yoga & Strengths'}
                    </p>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                    {interpretations.yoga?.reading || 'The chart shows balanced planetary energies with strong beneficial influences.'}
                </p>
            </div>

            {/* Special Combinations */}
            <div className="rounded-xl border border-[#d6c89a] p-6" style={{ background: '#fffdf5' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: '#b8962e' }} />
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>{t("____slug_.special_combinations")}</p>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                    {interpretations.special_combinations || 'The chart shows balanced planetary energies across various houses.'}
                </p>
            </div>

            {/* Life Path */}
            <div className="rounded-xl border border-[#d6c89a] p-6" style={{ background: '#fffdf5' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-3.5 h-3.5" style={{ color: '#b8962e' }} />
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>{t("____slug_.life_path_insight")}</p>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed border-l-2 pl-4" style={{ borderColor: '#b8962e' }}>
                    {interpretations.life_path?.reading || 'Your journey is guided by a unique cosmic vibration that encourages growth and wisdom.'}
                </p>
            </div>
        </div>);

};

// ── Section Card Wrapper ──────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, children }: {icon: any;title: string;children: React.ReactNode;}) =>
<div className="rounded-xl border border-[#d6c89a] overflow-hidden" style={{ background: '#fffdf5' }}>
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
            <Icon className="w-4 h-4" style={{ color: '#b8962e' }} />
            <h3 className="text-[15px] font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </div>;


// ── Chart Type Toggle ─────────────────────────────────────────────────────────
const ChartToggle = ({ chartType, setChartType }: {chartType: string;setChartType: (t: any) => void;}) =>
<div
  className="flex p-1 rounded-lg border border-[#d6c89a] mb-6 max-w-sm mx-auto"
  style={{ background: 'rgba(184,150,46,0.06)' }}>
  
        {(['D1', 'D9', 'Bhav'] as const).map((t) =>
  <button
    key={t}
    onClick={() => setChartType(t)}
    className="flex-1 px-4 py-2 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all"
    style={{
      background: chartType === t ? '#b8962e' : 'transparent',
      color: chartType === t ? '#fff' : '#9ca3af'
    }}>
    
                {t === 'D1' ? 'D1 (Lagna)' : t === 'D9' ? 'D9 (Navamsa)' : 'Bhav Chalit'}
            </button>
  )}
    </div>;


// ── Loading State ─────────────────────────────────────────────────────────────
const LoadingCard = () => {
    const { t } = useTranslation();
    return (
<div className="rounded-xl border border-[#d6c89a] p-14 text-center" style={{ background: '#fffdf5' }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#b8962e', borderTopColor: 'transparent' }} />
        <h3 className="text-[15px] font-semibold text-gray-800">{t("____slug_.synchronizing_with_stars")}</h3>
        <p className="text-sm text-gray-400 mt-1">{t("____slug_.connecting_to_the_celestial_br")}</p>
    </div>
    );
};


// ── Main Page ─────────────────────────────────────────────────────────────────
const KundliSubPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [chartType, setChartType] = useState<'D1' | 'D9' | 'Bhav'>('D1');
  const slug = params.slug as string[];
  const view = slug?.find((s) => s && ['north', 'south', 'planets', 'houses', 'interpretation'].includes(s)) || slug?.[0];

  useEffect(() => {
    const savedData = kundliStorage.getData();
    if (!savedData && view !== 'new') {
      router.push('/kundli');
    } else {
      setData(savedData);
    }
  }, [view, router]);

  if (!data && view !== 'new') return null;

  const renderContent = () => {
    if (!data || !data.kundli) return <LoadingCard />;

    switch (view) {
      case 'north':
        return (
          <SectionCard icon={Layout} title="North Indian Birth Chart">
                        <ChartToggle chartType={chartType} setChartType={setChartType} />
                        <NorthIndianChart data={data.kundli} chartType={chartType} />
                    </SectionCard>);

      case 'south':
        return (
          <SectionCard icon={Layout} title="South Indian Birth Chart">
                        <ChartToggle chartType={chartType} setChartType={setChartType} />
                        <SouthIndianChart data={data.kundli} chartType={chartType} />
                    </SectionCard>);

      case 'planets':
        return (
          <div className="space-y-5">
                        <SectionCard icon={Table} title="Planetary Positions">
                            <PlanetaryTable planets={data.kundli.planets} />
                        </SectionCard>

                        <SectionCard icon={Sparkles} title="Detailed Planetary Alignments">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(data.kundli.planets).
                filter(([name]) => name !== 'Ascendant').
                map(([name, p]: any) => {
                  const symbols: any = {
                    Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
                    Jupiter: '♃', Venus: '♀', Saturn: '♄',
                    Rahu: '☊', Ketu: '☋', Uranus: '⛢', Neptune: '♆', Pluto: '♇'
                  };
                  return (
                    <div
                      key={name}
                      className="p-5 rounded-xl border border-[#d6c89a] transition-all"
                      style={{ background: 'rgba(184,150,46,0.04)' }}>
                      
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-semibold flex-shrink-0"
                          style={{ background: '#b8962e', color: '#fff' }}>
                          
                                                        {symbols[name] || name.charAt(0)}
                                                    </div>
                                                    <h4 className="text-[14px] font-semibold text-gray-900">{name}</h4>
                                                </div>
                                                <p className="text-[12px] text-gray-600 leading-relaxed">
                                                    {p.basic_reading || 'No reading generated.'}
                                                </p>
                                            </div>);

                })}
                            </div>
                        </SectionCard>
                    </div>);

      case 'houses':
        return (
          <SectionCard icon={Layout} title="House Representation & Analysis">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="text-center">
                                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#b8962e' }}>{t("____slug_.north_indian_style")}</p>
                                <NorthIndianChart data={data.kundli} />
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#b8962e' }}>{t("____slug_.south_indian_style")}</p>
                                <SouthIndianChart data={data.kundli} />
                            </div>
                        </div>
                        <HouseAnalysis houses={data.kundli.houses} planets={data.kundli.planets} />
                    </SectionCard>);

      case 'interpretation':
        return <AstrologicalInterpretation data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ks-wrap" style={{ backgroundColor: '#fdf6e3' }}>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .ks-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .ks-wrap h1, .ks-wrap h2, .ks-wrap h3, .ks-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
            ` }} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* ── Back link ── */}
                <button
          onClick={() => router.push('/kundli')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#b8962e] transition-colors mb-7">
          
                    <ArrowLeft className="w-4 h-4" />
{t("____slug_.back_to_generator")}
        </button>

                {/* ── Page header ── */}
                <div className="mb-8 pb-6 border-b border-[#d6c89a]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                                <Crown className="w-3.5 h-3.5" />
                                <span className="serif">{t("____slug_.kundli_generator")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
{t("____slug_.kundli_insights")}
              </h1>
                            {data?.input?.name &&
              <p className="text-gray-500 text-sm mt-1">
                                    {data.input.name}{t("____slug_._accurate_vedic_calculations")}
              </p>
              }
                        </div>

                        <div
              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#b8962e' }}>
              
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* ── Content ── */}
                <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}>
          
                    {renderContent()}
                </motion.div>
            </div>
        </div>);

};

export default KundliSubPage;