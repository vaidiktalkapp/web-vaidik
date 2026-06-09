'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import FreeReportForm from '@/components/shared/FreeReportForm';
import {
  Zap, Shield, AlertCircle, Info, ChevronLeft,
  Sparkles, Moon, Calendar, Star, Clock } from
'lucide-react';
import Link from 'next/link';
import { saveReportToHistory, generateReportSummary } from '@/lib/reportHistory';
import { downloadSadeSatiPDF } from '@/lib/sadeSatiPdfGenerator';
import { Download, Loader2 } from 'lucide-react';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

// ─── Inline content sections shown below the form ────────────────────────────

const SadeSatiInfoSections = () => {
    const { t } = useTranslation();
    return (
<div className="mt-14 space-y-12 max-w-4xl mx-auto">

        {/* ── What is Sade Sati? ─────────────────────────────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-[#d6c89a]">
{t("sade_sati.what_is_shani_sade_sati")}
    </h2>
            <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
                <p>
                    <span className="text-[#c0392b] font-medium">{t("sade_sati.shani_sade_sati")}</span>{t("sade_sati.is_a_significant_7_5_year_astr")}<span className="text-[#c0392b] font-medium">{t("sade_sati.vedic_wisdom")}</span>{t("sade_sati._it_is_seen_as_a_powerful_peri")}
      </p>
                <p>
{t("sade_sati.saturn_is_the")}<span className="text-[#c0392b] font-medium">{t("sade_sati._strict_teacher")}</span>{t("sade_sati.of_the_cosmos_judging_us_based")}
      </p>
            </div>
        </section>

        {/* ── Why 7.5 Years and the Three Phases ─────────────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-[#d6c89a]">
{t("sade_sati.the_three_stages_charans_of_sa")}
    </h2>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
{t("sade_sati.saturn_takes_approximately_2_5")}<span className="text-gray-900 font-bold">{t("sade_sati.7_5_years_3_2_5")}</span>{t("sade_sati._these_years_are_divided_into")}
    </p>

            <div className="space-y-6">
                {/* 1st Phase */}
                <div className="bg-amber-50/50 border border-[#d6c89a]/30 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
{t("sade_sati.1_the_rising_phase_first_chara")}
        </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">
{t("sade_sati.this_phase_begins_when_saturn")}
        </p>
                </div>

                {/* 2nd Phase */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
{t("sade_sati.2_the_peak_phase_second_charan")}
        </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">
{t("sade_sati.the_most_intense_stage_occurs")}<span className="text-[#c0392b] font-medium">{t("sade_sati.natal_moon")}</span>{t("sade_sati._this_influences_your_physical")}
        </p>
                </div>

                {/* 3rd Phase */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
{t("sade_sati.3_the_setting_phase_third_char")}
        </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">
{t("sade_sati.in_the_final_stage_saturn_move")}
        </p>
                </div>
            </div>
        </section>

        {/* ── Remedies and Lifestyle Guidelines ─────────────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-2 border-b border-[#d6c89a]">
{t("sade_sati.karmic_remedies_supportive_pra")}
    </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Spiritual Remedies */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#b8962e]" />{t("sade_sati.healing_practices")}
        </h3>
                    <ul className="space-y-3">
                        {[
          'Worship Lord Shani and Lord Shiva on Saturdays',
          'Recite Shani Grah Mantra and Hanuman Chalisa regularly',
          'Light a mustard oil lamp under a Peepal tree',
          'Wear an Iron ring made of a horseshoe on the middle finger',
          'Donate items like black seeds, oil, and money to the needy'].
          map((remedy, i) =>
          <li key={i} className="flex gap-3 items-start p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">✓</div>
                                <span className="text-[13px] text-gray-700">{remedy}</span>
                            </li>
          )}
                    </ul>
                </div>

                {/* Things to Avoid */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />{t("sade_sati.activities_to_avoid")}
        </h3>
                    <ul className="space-y-2">
                        {[
          'Participating in risky or adventurous sports',
          'Arguments at home or in the workplace',
          'Engaging in careless behavior while driving',
          'Witnessing or signing formal legal agreements blindly',
          'Making impulsive career changes without deep thought'].
          map((text, i) =>
          <li key={i} className="text-[14px] text-gray-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {text}
                            </li>
          )}
                    </ul>
                </div>
            </div>

            {/* Closing Quote */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-8 text-center border-t-4 border-[#b8962e] shadow-xl">
                <p className="text-gray-300 text-[16px] leading-relaxed max-w-2xl mx-auto">
{t("sade_sati._shani_dev_is_the_strict_judge")}
      </p>
            </div>
        </section>

    </div>
    );
};


// ─── Main Page Component ──────────────────────────────────────────────────────

export default function SadeSatiPage() {
    const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [customSettings, setCustomSettings] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.vaidiktalk.com'}/free-tool-settings`);
        const data = await response.json();
        if (data) setCustomSettings(data);
      } catch (error) {
        console.error('Error fetching Sade Sati settings:', error);
      }
    };
    fetchSettings();

    try {
      const saved = sessionStorage.getItem('freereport_sadesati');
      if (saved) setReportData(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.vaidiktalk.com'}/free-reports/sade-sati`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        try {sessionStorage.setItem('freereport_sadesati', JSON.stringify(result.data));} catch {}
        await saveReportToHistory({
          type: 'sade-sati',
          name: formData.name || 'Unknown',
          date: formData.date,
          place: formData.place || '',
          summary: generateReportSummary('sade-sati', result.data),
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error fetching Sade Sati report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
            <div className="w-8 h-8 border-4 border-[#b8962e]/30 border-t-[#b8962e] rounded-full animate-spin" />
        </div>);


  // ── REPORT VIEW ────────────────────────────────────────────────────────────
    if (reportData) {
        const { sadeSati, input, panchang } = reportData;
        const isIntense = sadeSati.phase?.includes('Peak') || sadeSati.is_active;
        const currentPhaseKey = sadeSati.phase?.includes('Rising') ? 'Rising' : sadeSati.phase?.includes('Peak') ? 'Peak' : sadeSati.phase?.includes('Setting') ? 'Setting' : null;

        const handleDownloadPDF = async () => {
            try {
                setIsDownloading(true);
                await downloadSadeSatiPDF({
                    sadeSati,
                    input,
                    panchang
                });
            } catch (error) {
                console.error('PDF error:', error);
            } finally {
                setIsDownloading(false);
            }
        };

        return (
            <div className="min-h-screen py-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
                <style jsx global>{`
                    .report-wrap { font-family: 'Inter', sans-serif; }
                `}</style>

                <div className="max-w-5xl mx-auto px-6 report-wrap">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => { setReportData(null); try { sessionStorage.removeItem('freereport_sadesati'); } catch { } }}
                            className="flex items-center gap-2 text-[#b8962e] hover:text-[#7a6010] transition-colors font-bold text-sm">

                            <ChevronLeft className="w-4 h-4" />{t("sade_sati.back_to_calculator")}
                        </button>

                        <PaidPDFButton 
                            toolKey="sade-sati"
                            reportName="Sade Sati Report"
                            downloadFn={handleDownloadPDF}
                            className="px-5 py-2 !text-sm"
                        />
                    </div>

                    <div id="sade-sati-report" className="space-y-6">
                        {/* Hero Card */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden">
                            <div className="h-1" style={{ backgroundColor: isIntense ? '#4c1e95' : '#0891b2' }} />
                            <div className="p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-white ${isIntense ? 'bg-indigo-900' : 'bg-cyan-600'}`}>
                                    <Zap className="w-10 h-10" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: '#b8962e' }}>{t("sade_sati.transit_analysis")}</p>
                                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                                        {sadeSati.phase || 'No Active Phase'}
                                    </h1>
                                    <p className="text-gray-700 text-sm leading-relaxed max-w-xl">
                                        {sadeSati.is_active ?
                    `Shani is currently transiting through houses influencing your Moon sign (${sadeSati.natal_moon_sign}).` :
                    `You are currently in a clear period. Shani is not directly influencing your Moon sign (${sadeSati.natal_moon_sign}).`
                    }
                                    </p>
                                    {sadeSati.is_active &&
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 max-w-xl">
                                            <p className="text-amber-800 font-bold text-sm">
                                                {customSettings?.sadeSati?.[currentPhaseKey || '']?.resultMsg ?
                      customSettings.sadeSati[currentPhaseKey || ''].resultMsg.replace(/{phase}/g, sadeSati.phase) :
                      customSettings?.sadeSatiResultMsg ?
                      customSettings.sadeSatiResultMsg.replace(/{phase}/g, sadeSati.phase) :
                      `Result: You are currently in ${sadeSati.phase} of Sade Sati`}
                                            </p>
                                        </div>
                  }
                                </div>
                                <div className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#b8962e] mb-1">{t("sade_sati.moon_sign")}</p>
                                    <p className="text-sm font-black text-gray-900">{sadeSati.natal_moon_sign}</p>
                                </div>
                            </div>
                        </div>

                        {/* Birth Details Table */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-t-4 border-t-[#b8962e]">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <table className="w-full text-sm border-collapse">
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="px-6 py-4 bg-gray-50/50 font-bold text-gray-700 w-1/3">{t("sade_sati.name")}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{input.name}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="px-6 py-4 bg-gray-50/50 font-bold text-gray-700">{t("sade_sati.birth_date")}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{input.date}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 md:border-b-0">
                                            <td className="px-6 py-4 bg-gray-50/50 font-bold text-gray-700">{t("sade_sati.place_of_birth")}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{input.place || 'Not Provided'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="w-full text-sm border-collapse border-l border-gray-100">
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="px-6 py-4 bg-gray-50/50 font-bold text-gray-700 w-1/3">{t("sade_sati.birth_time")}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{input.time}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="px-6 py-4 bg-gray-50/50 font-bold text-gray-700">{t("sade_sati.tithi")}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{panchang?.tithi || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 bg-gray-50/50 font-bold text-gray-700">{t("sade_sati.saturn_transit")}</td>
                                            <td className="px-6 py-4 font-black text-[#b8962e] uppercase">{sadeSati.transit_saturn_sign || 'N/A'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Analysis Grid (Phase Insight & Focus) */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="md:col-span-3 space-y-4">
                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-7 h-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-4 h-4 text-[#b8962e]" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-700">{t("sade_sati.phase_perspective")}</span>
                                    </div>
                                    <div
                    className="text-[14px] text-gray-800 leading-relaxed space-y-4 rich-content"
                    dangerouslySetInnerHTML={{ __html: customSettings?.sadeSati?.[currentPhaseKey || '']?.intro || customSettings?.sadeSatiIntro || `
                                            <p className="font-bold text-gray-900 text-[15px] border-l-4 border-amber-400 pl-4 py-1">${sadeSati.details}</p>
                                            <p>This is a major karmic transit representing a cycle of maturity and growth. Shani Dev tests your integrity and patience, eventually rewards the hard work and discipline demonstrated during this period.</p>
                                        ` }} />
                  
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl p-7 text-white h-full relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Shield className="w-20 h-20" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Shield className="w-4 h-4 text-amber-400" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-100/70">{t("sade_sati.transit_strategy")}</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {(currentPhaseKey === 'Rising' ? [
                    'Strict control over spending',
                    'Caution with hidden enemies',
                    'Avoid risky long-distance travel',
                    'Integrity at the workplace'] :
                    currentPhaseKey === 'Peak' ? [
                    'Prioritize physical immunity',
                    'Accept delays with patience',
                    'Spiritual fortitude daily',
                    'Maintain respectful interactions'] :
                    currentPhaseKey === 'Setting' ? [
                    'Steady financial focus',
                    'Family stabilization efforts',
                    'Enthusiastic problem solving',
                    'Long-term asset management'] :
                    [
                    'Consistent social service',
                    'Health-first lifestyle',
                    'Avoiding impulsive changes',
                    'Deepening spiritual practice']).
                    map((step, i) =>
                    <li key={i} className="flex gap-4 items-center">
                                                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                                <span className="text-[13px] text-amber-50/90 font-medium">{step}</span>
                                            </li>
                    )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Lifetime Table */}
                        <div className="bg-white rounded-3xl border border-[#d6c89a] shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-8 py-5 border-b border-[#d6c89a] flex justify-between items-center">
                                <div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#b8962e]">{t("sade_sati.lifetime_transit_map")}</h2>
                                    <p className="text-[11px] text-gray-500 mt-1 font-medium">{t("sade_sati.120_years_cycle_analysis_of_sh")}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-[#b8962e]">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-sky-50/30 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-sky-900/60">{t("sade_sati.s_n")}</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-sky-900/60">{t("sade_sati.type")}</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-sky-900/60">{t("sade_sati.saturn_rashi")}</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-sky-900/60">{t("sade_sati.from_date")}</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-sky-900/60">{t("sade_sati.to_date")}</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-sky-900/60">{t("sade_sati.phase")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sadeSati.life_timeline?.map((p: any, i: number) => {
                      const isActiveTimeline = new Date().getFullYear() >= parseInt(p.start_date.split('-')[0]) && new Date().getFullYear() <= parseInt(p.end_date.split('-')[0]);
                      return (
                        <tr key={i} className={`hover:bg-amber-50/30 transition-colors ${isActiveTimeline ? 'bg-amber-50/40 relative z-10' : ''}`}>
                                                    <td className="px-6 py-4 text-[12px] font-bold text-gray-400">{i + 1}</td>
                                                    <td className="px-6 py-4 text-[13px] font-bold text-gray-900">{p.type}</td>
                                                    <td className="px-6 py-4 text-[13px] font-bold text-indigo-600">{p.shani_rashi}</td>
                                                    <td className="px-6 py-4 text-[13px] text-gray-600">{p.start_date}</td>
                                                    <td className="px-6 py-4 text-[13px] text-gray-600">{p.end_date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                            p.phase === 'Peak' ? 'bg-rose-100 text-rose-700' :
                            p.phase === 'Rising' ? 'bg-blue-100 text-blue-700' :
                            p.phase === 'Setting' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-600'}`
                            }>
                                                            {p.phase || 'Transit'}
                                                        </span>
                                                    </td>
                                                </tr>);

                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col items-center gap-6 pt-10 pb-6">
                            <Link href="/astrologers-chat" className="inline-flex items-center gap-3 px-10 py-4 bg-[#b8962e] text-white font-bold rounded-2xl hover:bg-[#7a6010] transition-all shadow-xl group hover:scale-[1.02]">
{t("sade_sati.discuss_report_with_consultant")}<Sparkles className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>);

  }

  // ─── FORM VIEW (with full info content below) ───────────────────────────────
  return (
    <div className="min-h-screen py-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
                <style jsx>{`
                    .sadesati-page { font-family: 'Inter', sans-serif; }
                `}</style>
            <div className="max-w-5xl mx-auto px-6 sadesati-page">

                {/* Top nav */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/free-reports" className="text-[#b8962e] hover:text-[#7a6010] font-bold flex items-center gap-2 text-sm">
                        <ChevronLeft className="w-4 h-4" />{t("sade_sati.back_to_reports")}
          </Link>
                    <Link href="/free-reports/history" className="text-gray-500 hover:text-[#b8962e] font-bold flex items-center gap-2 text-sm transition-colors">
                        <Clock className="w-4 h-4" />{t("sade_sati.view_history")}
          </Link>
                </div>

                {/* Hero text */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
{t("sade_sati.shani_sade_sati_analysis_timel")}
          </h1>
                    <h2 className="text-xl text-gray-700 mb-3">
{t("sade_sati.understand_your_7_5_year_cycle")}
          </h2>
                    <p className="text-[14px] text-gray-500 max-w-3xl mx-auto leading-relaxed">
{t("sade_sati.calculate_exactly_when_your_sa")}

          </p>
                </div>

                {/* Form — compact, centred */}
                <div className="max-w-2xl mx-auto mb-16">
                    <FreeReportForm
            title="Enter Your Birth Details"
            subtitle=""
            loading={loading}
            onSubmit={handleSubmit}
            buttonText="Calculate Sade Sati"
            compact />
          
                </div>

                {/* ── All descriptive content below the form ── */}
                <SadeSatiInfoSections />

            </div>
        </div>);

}