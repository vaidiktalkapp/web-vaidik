'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { astrologyService } from '@/lib/astrologyService';
import { ArrowLeft, CheckCircle2, AlertCircle, Download, Table as TableIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { horoscopeMatchingStorage } from '@/lib/horoscopeMatchingStorage';
import { downloadMatchingPDF } from '@/lib/matchingPdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

export default function ResultPage() {
    const { t } = useTranslation();

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputData, setInputData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleDownloadPDF = async () => {
    if (!result || !inputData) return;
    await downloadMatchingPDF({ result, inputData });
  };

  const fetchMatch = async (boy: any, girl: any, system: string) => {
    try {
      setLoading(true);
      const res = await astrologyService.calculateMatch(boy, girl, system);
      if (res.success) {
        setResult(res.data);
        // Save full result to history
        if (boy && girl) {
          const matchRecord = { boy, girl, system, result: res.data };
          await horoscopeMatchingStorage.saveData(matchRecord, false);
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('horoscope_match_input');
    if (stored) {
      const data = JSON.parse(stored);
      setInputData(data);
      fetchMatch(data.boy, data.girl, data.system || 'north_indian');
    } else {
      router.push('/horoscope-matching');
    }

    horoscopeMatchingStorage.getHistory().then(setHistory);
  }, [router]);

  const handleSystemToggle = (newSystem: string) => {
    if (!inputData || loading) return;
    const updatedInput = { ...inputData, system: newSystem };
    setInputData(updatedInput);
    localStorage.setItem('horoscope_match_input', JSON.stringify(updatedInput));
    fetchMatch(updatedInput.boy, updatedInput.girl, newSystem);
  };

  const loadFromHistory = (item: any) => {
    const itemWithFlag = { ...item, isFromHistory: true };
    setInputData(itemWithFlag);
    localStorage.setItem('horoscope_match_input', JSON.stringify(itemWithFlag));
    // If the item already has a result, use it immediately to avoid re-calculation
    if (item.result) {
      setResult(item.result);
      setLoading(false);
    } else {
      fetchMatch(item.boy, item.girl, item.system || 'north_indian');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-black uppercase tracking-widest text-gray-800">{t("result.calculating_match")}</h2>
                <p className="text-gray-700 text-sm mt-2">{t("result.analyzing_36_gunas_and_planeta")}</p>
            </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t("result.calculation_failed")}</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button onClick={() => router.push('/horoscope-matching')} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold">{t("result.try_again")}</button>
                </div>
            </div>);

  }

  if (!result || !inputData) return null;

  const { boy, girl, system } = inputData;
  const { 
    scores = {}, 
    details = {}, 
    total = 0, 
    max_scores = {}, 
    manglik_status = {}, 
    conclusion = "" 
  } = result || {};

  const isSouth = system === 'south_indian';

  const getFullConclusion = (text: string) => {
    if (!text) return "";
    const mapping: Record<string, string> = {
      "Excellent compatibility.": "Excellent compatibility. This marriage is highly preferable.",
      "Average compatibility.": "Average compatibility. This marriage is acceptable.",
      "Poor compatibility.": "Poor compatibility. This marriage is not recommended without astrological remedies."
    };
    return mapping[text] || text;
  };

  // Use details safely (fallback to empty string if backend hasn't generated them yet)
  let kootData: any[] = [];
  if (isSouth) {
    kootData = [
    { name: "Dina (Tara)", b: details?.dina?.boy || "-", g: details?.dina?.girl || "-", max: max_scores?.dina || 3, obtained: scores?.dina || 0, area: "Health & Well-being" },
    { name: "Gana", b: details?.gana?.boy || "-", g: details?.gana?.girl || "-", max: max_scores?.gana || 4, obtained: scores?.gana || 0, area: "Temperament" },
    { name: "Yoni", b: details?.yoni?.boy || "-", g: details?.yoni?.girl || "-", max: max_scores?.yoni || 4, obtained: scores?.yoni || 0, area: "Intimacy" },
    { name: "Rasi", b: details?.rasi?.boy || "-", g: details?.rasi?.girl || "-", max: max_scores?.rasi || 7, obtained: scores?.rasi || 0, area: "Lineage Growth" },
    { name: "Rasyadhipati", b: details?.maitri?.boy || "-", g: details?.maitri?.girl || "-", max: max_scores?.maitri || 5, obtained: scores?.maitri || 0, area: "Friendship" },
    { name: "Rajju", b: details?.rajju?.boy || "-", g: details?.rajju?.girl || "-", max: max_scores?.rajju || 5, obtained: scores?.rajju || 0, area: "Longevity" },
    { name: "Vedha", b: details?.vedha?.boy || "-", g: details?.vedha?.girl || "-", max: max_scores?.vedha || 2, obtained: scores?.vedha || 0, area: "Obstacles" },
    { name: "Vashya", b: details?.vashya?.boy || "-", g: details?.vashya?.girl || "-", max: max_scores?.vashya || 2, obtained: scores?.vashya || 0, area: "Dominance" },
    { name: "Mahendra", b: details?.mahendra?.boy || "-", g: details?.mahendra?.girl || "-", max: max_scores?.mahendra || 2, obtained: scores?.mahendra || 0, area: "Wealth & Progeny" },
    { name: "Stree Deergha", b: details?.stree?.boy || "-", g: details?.stree?.girl || "-", max: max_scores?.stree || 2, obtained: scores?.stree || 0, area: "Prosperity" }];

  } else {
    kootData = [
    { name: "Varna", b: details?.varna?.boy || "-", g: details?.varna?.girl || "-", max: max_scores?.varna || 1, obtained: scores?.varna || 0, area: "Work" },
    { name: "Vashya", b: details?.vashya?.boy || "-", g: details?.vashya?.girl || "-", max: max_scores?.vashya || 2, obtained: scores?.vashya || 0, area: "Dominance" },
    { name: "Tara", b: details?.tara?.boy || "-", g: details?.tara?.girl || "-", max: max_scores?.tara || 3, obtained: scores?.tara || 0, area: "Destiny" },
    { name: "Yoni", b: details?.yoni?.boy || "-", g: details?.yoni?.girl || "-", max: max_scores?.yoni || 4, obtained: scores?.yoni || 0, area: "Mentality" },
    { name: "Maitri", b: details?.maitri?.boy || "-", g: details?.maitri?.girl || "-", max: max_scores?.maitri || 5, obtained: scores?.maitri || 0, area: "Compatibility" },
    { name: "Gana", b: details?.gana?.boy || "-", g: details?.gana?.girl || "-", max: max_scores?.gana || 6, obtained: scores?.gana || 0, area: "Guna Level" },
    { name: "Bhakoot", b: details?.bhakoot?.boy || "-", g: details?.bhakoot?.girl || "-", max: max_scores?.bhakoot || 7, obtained: scores?.bhakoot || 0, area: "Love" },
    { name: "Nadi", b: details?.nadi?.boy || "-", g: details?.nadi?.girl || "-", max: max_scores?.nadi || 8, obtained: scores?.nadi || 0, area: "Health" }];

  }

  const formatCoord = (decimalStr: any, isLat: boolean) => {
    if (!decimalStr) return "-";
    const decimal = parseFloat(decimalStr);
    const dir = decimal >= 0 ? isLat ? 'N' : 'E' : isLat ? 'S' : 'W';
    const abs = Math.abs(decimal);
    const deg = Math.floor(abs);
    const min = Math.round((abs - deg) * 60);
    return `${deg}${dir}${min}`;
  };

  return (
    <div className="min-h-screen bg-orange-50/50 py-12 px-4 sm:px-6">
            <div id="matching-report" className="max-w-5xl mx-auto space-y-8 bg-white p-4 md:p-8 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <button
              onClick={() => router.push('/horoscope-matching/history')}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-50 rounded-xl text-orange-600 transition-all border border-orange-100 shadow-sm font-bold text-xs uppercase tracking-widest group">
              
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
{t("result.history")}
            </button>
                        <div className="px-4 py-2 bg-orange-100/50 rounded-xl border border-orange-200 text-orange-700 font-black text-[10px] uppercase tracking-widest">
                            {isSouth ? "South Indian System" : "North Indian System"}
                        </div>
                    </div>
                    
                    <PaidPDFButton 
                        toolKey="matching"
                        reportName={`Match - ${boy?.name || 'Boy'} & ${girl?.name || 'Girl'}`}
                        downloadFn={handleDownloadPDF}
                        variant="primary"
                        className="!bg-rose-600 hover:!bg-rose-700 !text-white text-xs uppercase tracking-widest shadow-lg shadow-rose-100"
                    />
                </div>

                {/* Birth Details Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
                    <div className="bg-amber-50 px-6 py-4 border-b border-orange-100">
                        <h2 className="text-lg font-bold text-amber-900">{t("result.birth_details_of_boy_and_girl")}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700 font-medium whitespace-nowrap">
                            <thead className="bg-white border-b border-gray-100 text-amber-900">
                                <tr>
                                    <th className="px-6 py-4"></th>
                                    <th className="px-6 py-4">{t("result.name")}</th>
                                    <th className="px-6 py-4">{t("result.date_time")}</th>
                                    <th className="px-6 py-4">{t("result.place")}</th>
                                    <th className="px-6 py-4">{t("result.longitude")}</th>
                                    <th className="px-6 py-4">{t("result.latitude")}</th>
                                    <th className="px-6 py-4">{t("result.time_zone")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-800">
                                <tr className="border-b border-gray-50 hover:bg-orange-50/20">
                                    <td className="px-6 py-4 font-black text-gray-900">{t("result.boy")}</td>
                                    <td className="px-6 py-4">{boy.name}</td>
                                    <td className="px-6 py-4">{boy.date} <br /> {boy.time}</td>
                                    <td className="px-6 py-4">{boy.place}</td>
                                    <td className="px-6 py-4">{formatCoord(boy.lon, false)}</td>
                                    <td className="px-6 py-4">{formatCoord(boy.lat, true)}</td>
                                    <td className="px-6 py-4">{boy.tzone}</td>
                                </tr>
                                <tr className="hover:bg-rose-50/20">
                                    <td className="px-6 py-4 font-black text-gray-900">{t("result.girl")}</td>
                                    <td className="px-6 py-4">{girl.name}</td>
                                    <td className="px-6 py-4">{girl.date} <br /> {girl.time}</td>
                                    <td className="px-6 py-4">{girl.place}</td>
                                    <td className="px-6 py-4">{formatCoord(girl.lon, false)}</td>
                                    <td className="px-6 py-4">{formatCoord(girl.lat, true)}</td>
                                    <td className="px-6 py-4">{girl.tzone}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Guna Milan Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
                    <div className="bg-amber-50 px-6 py-4 border-b border-orange-100">
                        <h2 className="text-lg font-bold text-amber-900">
                            {isSouth ? "Dashakoot (10 Porutham) Milan" : "Ashtakoot Guna Milan (36-Point System)"}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700 font-medium whitespace-nowrap">
                            <thead className="bg-white border-b border-gray-100 text-amber-900">
                                <tr>
                                    <th className="px-6 py-4">{t("result.guna")}</th>
                                    <th className="px-6 py-4">{t("result.boy")}</th>
                                    <th className="px-6 py-4">{t("result.girl")}</th>
                                    <th className="px-6 py-4">{t("result.maximum")}</th>
                                    <th className="px-6 py-4">{t("result.score")}</th>
                                    <th className="px-6 py-4">{t("result.area_of_life")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-800">
                                {kootData.map((row) =>
                <tr key={row.name} className="hover:bg-orange-50/20">
                                        <td className="px-6 py-3 font-bold text-rose-600">{row.name}</td>
                                        <td className="px-6 py-3">{row.b}</td>
                                        <td className="px-6 py-3">{row.g}</td>
                                        <td className="px-6 py-3">{row.max}</td>
                                        <td className={`px-6 py-3 ${row.obtained === 0 ? 'text-red-500 font-black' : 'text-gray-900 font-bold'}`}>
                                            {row.obtained}
                                        </td>
                                        <td className="px-6 py-3 text-xs">{row.area}</td>
                                    </tr>
                )}
                            </tbody>
                            <tfoot className="bg-amber-50/50 border-t-2 border-orange-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4"></td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{t("result.total_max_36")}</td>
                                    <td className="px-6 py-4 font-black text-rose-600 text-xl">{total}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-amber-900 uppercase tracking-widest">{total >= 18 ? 'Passed' : 'Remedy Needed'}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Results Summary Box — Refactored to md:grid-cols-4 for a smaller score card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Detailed Summary */}
                    <div className="md:col-span-3 bg-white rounded-3xl shadow-sm border border-orange-100 p-8 space-y-4">
                        <h3 className="text-xl font-black text-amber-900 mb-6">{t("result.match_conclusion")}</h3>
                        
                        <div className="space-y-3 font-medium text-gray-700">
                            <p className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2"></span>
                                <span>{isSouth ? "Dashakoot" : "Ashtakoot"}{t("result.matching_between")}<b>{boy.name}</b>{t("result.and")}<b>{girl.name}</b>{t("result.scored_exactly")}<strong className="text-xl text-rose-600">{total} / 36</strong>{t("result.points")}</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2"></span>
                                <span>{t("result.manglik_dosha_analysis")}<strong className="text-orange-600">{manglik_status}</strong></span>
                            </p>
                            <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-200">
                                <p className="font-black text-lg text-amber-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
{t("result.final_decision")}{getFullConclusion(conclusion)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tiny Score Visual */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl border border-orange-200 p-3 flex flex-col items-center justify-center text-center shadow-sm h-fit self-center">
                        <p className="text-amber-800 font-bold tracking-widest uppercase text-[8px] mb-1">{t("result.final_score")}</p>
                        <div className="flex items-baseline justify-center">
                            <span className="text-4xl font-black tracking-tighter text-amber-900">{total}</span>
                            <span className="text-sm font-black text-amber-700/50">/36</span>
                        </div>
                        <div className="mt-3 w-full bg-orange-200 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${total / 36 * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${total >= 18 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}