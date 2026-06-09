'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import FreeReportForm from '@/components/shared/FreeReportForm';
import NorthIndianChart from '@/components/kundli/charts/NorthIndianChart';
import { Shield, AlertCircle, CheckCircle2, Info, ChevronLeft, Sparkles, Clock, BookOpen, Star, Gem, Download } from 'lucide-react';
import Link from 'next/link';
import { saveReportToHistory, generateReportSummary } from '@/lib/reportHistory';
import { downloadKaalSarpPDF } from '@/lib/kaalSarpPdfGenerator';
import { stripHtml } from '@/lib/renderUtils';
import { Loader2 } from 'lucide-react';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

// ─── Kaal Sarp Yoga Type Descriptions & Remedies ─────────────────────────────
const kaalSarpTypeData: Record<string, {
  meaning: string;
  description: string;
  effects: string[];
  remedies: string[];
}> = {
  'Anant': {
    meaning: 'Rahu in 1st house, Ketu in 7th house',
    description: 'Anant Kalsarpa Yoga is the most talked about type. When Rahu is in the Ascendant (1st house) and Ketu in the 7th house, with all planets hemmed between them, the native faces significant challenges in personal life and partnerships. This yoga can bring sudden rises and falls in career, health concerns, and turbulence in marriage. However, it also grants immense willpower, resilience, and the ability to overcome any obstacle through sheer determination.',
    effects: [
    'Struggles in married life and partnerships',
    'Health concerns, especially related to head and nervous system',
    'Sudden career changes — both rises and falls',
    'Strong willpower and ability to fight adversity',
    'Tendency towards spiritual growth after mid-life'],

    remedies: [
    'Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar, Nashik',
    'Chant "Om Namah Shivaya" 108 times daily',
    'Worship Lord Shiva every Monday with Abhishek of milk and water',
    'Donate black sesame seeds (til) and mustard oil on Saturdays',
    'Keep a silver Nag (serpent) idol at home and worship it',
    'Feed ants with flour and sugar regularly',
    'Wear a Gomed (Hessonite) gemstone after consulting an astrologer']

  },
  'Kulik': {
    meaning: 'Rahu in 2nd house, Ketu in 8th house',
    description: 'Kulik Kalsarpa Yoga occurs when Rahu occupies the 2nd house (house of wealth and family) and Ketu sits in the 8th house (house of longevity and sudden events). This creates financial instability, family disputes, and health-related anxieties. The native may face sudden financial losses or gains. Speech can be harsh or misunderstood. However, this yoga also gives deep occult knowledge and the ability to transform one\'s destiny through spiritual practices.',
    effects: [
    'Financial instability and sudden monetary losses',
    'Family disputes and disharmony in domestic life',
    'Health issues related to face, eyes, and mouth',
    'Harsh or misunderstood speech patterns',
    'Deep interest in occult sciences and mysticism'],

    remedies: [
    'Perform Rahu Shanti Puja and Kaal Sarp Dosh Puja',
    'Chant Rahu Beej Mantra "Om Bhram Bhreem Bhroum Sah Rahave Namah" 108 times daily',
    'Donate wheat, jaggery, and copper items on Sundays',
    'Offer water mixed with milk to a Shivling every Monday',
    'Keep a Sarpa Yantra at your worship place',
    'Feed fishes and birds regularly',
    'Visit Kalahasti temple in Andhra Pradesh for Kaal Sarp Puja']

  },
  'Vasuki': {
    meaning: 'Rahu in 3rd house, Ketu in 9th house',
    description: 'Vasuki Kalsarpa Yoga forms when Rahu is in the 3rd house (courage and siblings) and Ketu in the 9th house (fortune and dharma). The native may struggle with relationships with siblings, face obstacles in higher education, and experience delays in fortune. Short-distance travels may bring troubles. However, this yoga blesses the native with exceptional courage, communication skills, and the ability to influence others through words and writing.',
    effects: [
    'Troubled relationships with siblings and neighbors',
    'Delays in receiving fortune and luck',
    'Obstacles in higher education and spiritual pursuits',
    'Problems during short-distance travels',
    'Exceptional courage and communication skills'],

    remedies: [
    'Perform Naag Panchami Puja with full rituals every year',
    'Chant "Om Ketave Namah" 17,000 times in a 40-day period',
    'Donate barley, sesame, and blue-colored clothes on Saturdays',
    'Keep a peacock feather in your books or study area',
    'Offer prayers at Mahakaleshwar temple, Ujjain',
    'Feed cows with green fodder on Wednesdays',
    'Wear a Cat\'s Eye (Lehsunia) after astrological consultation']

  },
  'Shankhapal': {
    meaning: 'Rahu in 4th house, Ketu in 10th house',
    description: 'Shankhapal Kalsarpa Yoga occurs when Rahu is placed in the 4th house (mother, property, and mental peace) and Ketu in the 10th house (career and public image). This yoga creates disturbances in domestic life, property disputes, and obstacles in career growth. The native may experience a strained relationship with their mother. However, it also gives the native an unconventional career path and the ability to achieve success through non-traditional means.',
    effects: [
    'Disturbances in domestic life and mental peace',
    'Property disputes and problems with vehicles',
    'Strained relationship with mother',
    'Obstacles in career advancement and public image',
    'Success through unconventional career paths'],

    remedies: [
    'Perform Rudrabhishek on every Pradosh Vrat',
    'Chant Maha Mrityunjaya Mantra 108 times daily',
    'Keep a silver idol of a serpent and offer milk on Nag Panchami',
    'Donate white-colored items on Mondays',
    'Plant a Peepal tree and water it regularly',
    'Offer water to the Sun every morning (Surya Arghya)',
    'Perform Kaal Sarp Shanti at Rameswaram temple']

  },
  'Padma': {
    meaning: 'Rahu in 5th house, Ketu in 11th house',
    description: 'Padma Kalsarpa Yoga forms when Rahu occupies the 5th house (children, education, and intellect) and Ketu is in the 11th house (gains and social circles). This yoga may cause delays in having children, problems in education, and difficulties with speculative investments. The native\'s intellectual abilities may be misunderstood or undervalued. However, this yoga also grants exceptional creative abilities and the potential for sudden gains through unexpected sources.',
    effects: [
    'Delays or problems related to children',
    'Difficulties in education and competitive exams',
    'Losses in speculative investments and stocks',
    'Misunderstood intellectual abilities',
    'Exceptional creative and artistic talents'],

    remedies: [
    'Worship Lord Ganesha before starting any new venture',
    'Chant Saraswati Mantra for education-related issues',
    'Donate yellow clothes, turmeric, and gram dal on Thursdays',
    'Perform Nag Stotra Paath on Nag Panchami',
    'Keep 5 almonds wrapped in red cloth under your pillow',
    'Visit Kukke Subramanya temple in Karnataka for serpent worship',
    'Offer Durva grass to Lord Ganesha on Wednesdays']

  },
  'Mahapadma': {
    meaning: 'Rahu in 6th house, Ketu in 12th house',
    description: 'Mahapadma Kalsarpa Yoga occurs when Rahu is in the 6th house (enemies, diseases, and debts) and Ketu in the 12th house (expenses and moksha). This yoga brings challenges through enemies, legal disputes, and chronic health issues. The native may accumulate debts and face unnecessary expenditures. However, this yoga is unique because Rahu in the 6th house (an Upachaya house) can actually destroy enemies and overcome diseases over time, making the native ultimately victorious.',
    effects: [
    'Challenges from enemies and legal disputes',
    'Chronic health issues and recurring ailments',
    'Debt accumulation and financial drain',
    'Excessive expenditure and losses in foreign lands',
    'Ultimate victory over enemies and diseases over time'],

    remedies: [
    'Perform Hanuman Chalisa recitation 11 times on Tuesdays',
    'Chant "Om Ram Rahave Namah" 18,000 times in 40 days',
    'Donate medicines and food to the needy on Saturdays',
    'Keep a silver snake idol and offer milk regularly',
    'Worship Kaal Bhairav on Ashtami Tithi',
    'Feed stray dogs with roti on Saturdays',
    'Perform Sarpa Suktam Homam for relief']

  },
  'Takshak': {
    meaning: 'Rahu in 7th house, Ketu in 1st house',
    description: 'Takshak Kalsarpa Yoga forms when Rahu is in the 7th house (marriage and partnerships) and Ketu in the 1st house (self and personality). This is one of the challenging types as it directly impacts marriage and all forms of partnerships. The native may face multiple relationship breakdowns, delayed marriage, or conflicts with business partners. Ketu in the 1st house makes the native spiritual but confused about self-identity. However, this yoga grants deep wisdom and spiritual evolution.',
    effects: [
    'Delayed marriage or marital discord',
    'Conflicts with business partners',
    'Confusion about self-identity and life purpose',
    'Health concerns related to reproductive system',
    'Deep spiritual wisdom and detachment from material world'],

    remedies: [
    'Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar',
    'Chant Vishnu Sahasranamam every Saturday',
    'Donate items related to Rahu (coconut, blue cloth, iron) on Saturdays',
    'Wear a silver ring in the middle finger of the left hand',
    'Keep a pair of Nag-Nagin idols made of silver and worship them',
    'Offer bhog to snakes on Nag Panchami',
    'Perform Rudrabhishek with Panchamrit every Monday']

  },
  'Karkotak': {
    meaning: 'Rahu in 8th house, Ketu in 2nd house',
    description: 'Karkotak Kalsarpa Yoga occurs when Rahu is in the 8th house (longevity and sudden events) and Ketu in the 2nd house (wealth and speech). This yoga brings sudden upheavals, accidents, and chronic health problems. The native\'s family wealth may diminish, and speech-related issues may arise. Inheritance matters often get complicated. However, Rahu in the 8th house also grants deep research abilities, interest in occult sciences, and the potential for sudden transformation and renewal.',
    effects: [
    'Sudden upheavals and unexpected life changes',
    'Chronic health problems and accident-proneness',
    'Diminishing family wealth and inheritance disputes',
    'Speech-related problems and communication issues',
    'Deep interest in research, occult, and transformation'],

    remedies: [
    'Perform Maha Mrityunjaya Jaap of 1,25,000 mantras',
    'Chant "Om Namah Shivaya" 1008 times on Mondays',
    'Donate black gram (urad dal) and iron items on Saturdays',
    'Keep a Shiva Lingam at home and perform Abhishek daily',
    'Visit Kalahasti temple for Rahu-Ketu Puja',
    'Feed Brahmins on Amavasya (New Moon day)',
    'Wear an 8 Mukhi Rudraksha after proper energization']

  },
  'Shankhachood': {
    meaning: 'Rahu in 9th house, Ketu in 3rd house',
    description: 'Shankhachood Kalsarpa Yoga (also called Shankchud) forms when Rahu is in the 9th house (fortune, father, and dharma) and Ketu in the 3rd house (courage and siblings). This yoga creates obstacles in fortune, strained relationship with father, and difficulties in religious/spiritual pursuits. The native may have to travel far for livelihood and may face defamation. However, this yoga also grants exceptional courage, self-made success, and the ability to create one\'s own fortune through hard work.',
    effects: [
    'Obstacles in fortune and delayed luck',
    'Strained relationship with father and elders',
    'Having to travel far from birthplace for livelihood',
    'Fear of defamation and social ridicule',
    'Self-made success and exceptional courage'],

    remedies: [
    'On an auspicious Muhurta, place a swastika on the main door carved in metal',
    'Read Hanuman Chalisa 108 times and observe a fast for five Tuesdays',
    'Feed birds with grain regularly, especially on Saturdays',
    'Start an 11 times Jaap of rosary chanting "Om Namah Shivay"',
    'Perform Abhishek of Shivling with cow\'s milk and bel patra',
    'Adorn the Shivling with a copper Naag after rituals',
    'Wear a Naag Paash Yantra after proper invocation and use red curtains in bedroom']

  },
  'Ghatak': {
    meaning: 'Rahu in 10th house, Ketu in 4th house',
    description: 'Ghatak Kalsarpa Yoga occurs when Rahu is in the 10th house (career, fame, and authority) and Ketu in the 4th house (home, mother, and mental peace). This yoga creates turbulence in career despite hard work, and domestic unhappiness. The native may face sudden job changes, difficulties with authorities, and mental restlessness. However, Rahu in the 10th house is actually considered powerful and can grant exceptional career success, political power, and public recognition after initial struggles.',
    effects: [
    'Turbulence in career and sudden job changes',
    'Difficulties with authority figures and government',
    'Domestic unhappiness and mental restlessness',
    'Strained relationship with mother',
    'Exceptional career success and public recognition after struggles'],

    remedies: [
    'Perform Surya Namaskar and offer Arghya to the Sun daily',
    'Chant Aditya Hridayam Stotram on Sundays',
    'Donate jaggery, wheat, and copper on Sundays',
    'Keep an energized Navagraha Yantra at home',
    'Visit Rameswaram for Kaal Sarp Dosh Puja',
    'Feed crows on Saturdays with cooked rice',
    'Offer ghee lamp at Hanuman temple on Tuesdays and Saturdays']

  },
  'Vishdhar': {
    meaning: 'Rahu in 11th house, Ketu in 5th house',
    description: 'Vishdhar Kalsarpa Yoga forms when Rahu is in the 11th house (gains, social circles, and elder siblings) and Ketu in the 5th house (children, education, and intellect). This yoga may cause problems with children, difficulties in education, and unreliable friendships. The native\'s gains may be unpredictable and social circles may bring troubles. However, Rahu in the 11th house is considered one of the better placements, often granting large gains through unconventional means and a wide social network.',
    effects: [
    'Problems related to children and their education',
    'Unreliable friendships and social circle troubles',
    'Unpredictable gains and financial fluctuations',
    'Difficulties in speculative investments',
    'Large gains through unconventional means and wide network'],

    remedies: [
    'Worship Lord Vishnu with Tulsi leaves on Thursdays',
    'Chant "Om Graam Greem Groum Sah Gurave Namah" 108 times daily',
    'Donate yellow items (turmeric, clothes, gram dal) on Thursdays',
    'Keep an energized Kaal Sarp Yantra at worship place',
    'Perform Sarpa Homam annually',
    'Feed Brahmins with kheer (rice pudding) on Purnima',
    'Plant banana trees and take care of them']

  },
  'Sheshnag': {
    meaning: 'Rahu in 12th house, Ketu in 6th house',
    description: 'Sheshnag Kalsarpa Yoga occurs when Rahu is in the 12th house and Ketu in the 6th house, with all remaining planets placed between the 12th and 6th house. In this case, the native\'s desires get fulfilled after a long time. For livelihood, they may have to travel far and beyond, and they live in fear of defamation and conflict. Due to certain behavior, the native may become a victim of ridicule. However, once in their lifetime, they receive a position of authority and earn the desired fame.',
    effects: [
    'Desires get fulfilled only after long delays',
    'Need to travel far from birthplace for livelihood',
    'Living in fear of defamation and social conflict',
    'Becoming a victim of ridicule due to certain behaviors',
    'Eventually receiving a position of authority and fame'],

    remedies: [
    'On an auspicious Muhurta, place a swastika on the main door carved in metal with your name on both sides',
    'Read Hanuman Chalisa 108 times and observe a fast for five Tuesdays, offering vermillion mixed in chameli and bundi laddu',
    'Feed birds with grain for quarter a month and then start anything new',
    'On an auspicious occasion, start 11 times Jaap of a rosary chanting "Om Namah Shivay", then perform Abhishek of Shivling with cow\'s milk and bel patra',
    'After rituals, adorn the Shivling with a copper Naag',
    'Offer masoor daal to beggars and have your meal at a restraint on a proper occasion',
    'Wear a Naag Paash Yantra after invocation. Use red curtains and red coloured bed sheet in your bedroom']

  }
};

export default function KaalSarpPage() {
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
        console.error('Error fetching Kaal Sarp settings:', error);
      }
    };
    fetchSettings();

    try {
      const saved = sessionStorage.getItem('freereport_kaalsarp');
      if (saved) setReportData(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.vaidiktalk.com'}/free-reports/kaal-sarp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        try {sessionStorage.setItem('freereport_kaalsarp', JSON.stringify(result.data));} catch {}
        await saveReportToHistory({
          type: 'kaal-sarp',
          name: formData.name || 'Unknown',
          date: formData.date,
          place: formData.place || '',
          summary: generateReportSummary('kaal-sarp', result.data),
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error fetching Kaal Sarp report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
            <div className="w-8 h-8 border-4 border-[#b8962e]/30 border-t-[#b8962e] rounded-full animate-spin" />
        </div>);


  // ─── REPORT VIEW ────────────────────────────────────────────────────────────
  if (reportData) {
    const { doshas, kundli } = reportData;
    const typeName = doshas.type;

    let typeData: any = null;
    if (doshas.is_present) {
      const defaultData = kaalSarpTypeData[doshas.type] || null;
      const adminData = customSettings?.kaalSarp?.[doshas.type];
      if (adminData && (adminData.description || adminData.meaning)) {
        typeData = {
          meaning: adminData.meaning || defaultData?.meaning || '',
          description: adminData.description || defaultData?.description || '',
          effects: adminData.effects && adminData.effects.length > 0 ? adminData.effects : defaultData?.effects || [],
          remedies: adminData.remedies && adminData.remedies.length > 0 ? adminData.remedies : defaultData?.remedies || []
        };
      } else {
        typeData = defaultData;
      }
    }

    const handleDownloadPDF = async () => {
      try {
        setIsDownloading(true);
        await downloadKaalSarpPDF({
          doshas,
          input: reportData.input,
          typeData
        });
      } catch (error) {
        console.error('PDF error:', error);
      } finally {
        setIsDownloading(false);
      }
    };

    if (!doshas.is_present) {
      // Dynamic content for "No Kaal Sarp" case
      const adminData = customSettings?.kaalSarp?.['No Dosha Found'];
      if (adminData) {
        typeData = {
          meaning: adminData.meaning || '',
          description: adminData.description || '',
          effects: adminData.effects || [],
          remedies: adminData.remedies || [],
          intro: adminData.intro || '',
          resultMsg: adminData.resultMsg || ''
        };
      }
    }

    // Helper to check if HTML content is effectively empty
    const isHtmlEmpty = (html: string) => {
      if (!html) return true;
      const stripped = stripHtml(html).trim();
      return stripped === '';
    };

    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: '#fdf6e3' }}>
                <style jsx global>{`
                    .report-wrap { font-family: 'Inter', sans-serif; }
                `}</style>

                <div className="max-w-5xl mx-auto px-6 report-wrap">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => { setReportData(null); try { sessionStorage.removeItem('freereport_kaalsarp'); } catch { } }}
                            className="flex items-center gap-2 text-[#b8962e] hover:text-[#7a6010] transition-colors font-bold text-sm">
                            <ChevronLeft className="w-4 h-4" />{t("kaal_sarp.back_to_calculator")}
                        </button>

                        <PaidPDFButton 
                            toolKey="kaal-sarp"
                            reportName="Kaal Sarp Report"
                            downloadFn={handleDownloadPDF}
                            className="px-5 py-2 !text-sm"
                        />
                    </div>

                    <div id="kaal-sarp-report" className="space-y-5">
                        {/* Title Card */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden">
                            <div className="text-center py-5 px-6 border-b border-[#eee3c7]">
                                <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: '#b8962e' }}>{t("kaal_sarp.kaal_sarp_dosha_yog")}</p>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {doshas.is_present ? 'Kalsarp Remedies' : 'Astrological Analysis'}
                                </h1>
                            </div>
                        </div>

                        {doshas.is_present ? (
            /* ── DOSHA PRESENT VIEW (Side-by-Side) ── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b border-[#eee3c7] bg-[#fdf8ed]">
                                        <h2 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">{t("kaal_sarp.lagna_kundli")}</h2>
                                    </div>
                                    <div className="p-5">
                                        {kundli ?
                  <NorthIndianChart data={kundli} chartType="D1" /> :

                  <div className="aspect-square w-full flex items-center justify-center border-2 border-dashed border-orange-100 rounded-2xl text-orange-300 text-xs font-bold uppercase tracking-widest">
{t("kaal_sarp.chart_data_unavailable")}
                  </div>
                  }
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b bg-rose-50 border-rose-100">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-rose-500" />
                                            <h2 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">{t("kaal_sarp.analysis_result")}</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                                                <span className="text-2xl">🐍</span>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">{t("kaal_sarp.your_kundli_has")}</p>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {typeData?.resultMsg ?
                        typeData.resultMsg.replace('{type}', doshas.type) :
                        customSettings?.kaalSarpResultMsg ?
                        customSettings.kaalSarpResultMsg.replace('{type}', doshas.type) :
                        `${doshas.type} Kalsarpa Yoga`}
                                                </h3>
                                            </div>
                                        </div>
                                        {typeData &&
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-5">{typeData.meaning}</p>
                  }
                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
                                                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">{t("kaal_sarp.status")}</span>
                                                <span className="text-[14px] font-black text-rose-900">{t("kaal_sarp.dosha_present")}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                                                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">{t("kaal_sarp.type")}</span>
                                                <span className="text-[14px] font-black text-amber-900">{doshas.type} ({doshas.type === 'Anant' ? '1st' : doshas.type === 'Kulik' ? '2nd' : doshas.type === 'Vasuki' ? '3rd' : doshas.type === 'Shankhapal' ? '4th' : doshas.type === 'Padma' ? '5th' : doshas.type === 'Mahapadma' ? '6th' : doshas.type === 'Takshak' ? '7th' : doshas.type === 'Karkotak' ? '8th' : doshas.type === 'Shankhachood' ? '9th' : doshas.type === 'Ghatak' ? '10th' : doshas.type === 'Vishdhar' ? '11th' : '12th'}{t("kaal_sarp.of_12_types")}</span>
                                            </div>
                                        </div>
                                        {typeData &&
                  <p className="text-[14px] text-gray-700 leading-[1.7] border-t border-[#eee3c7] pt-4">
                                                {typeData.description.substring(0, 220)}...
                                            </p>
                  }
                                    </div>
                                </div>
                            </div>) : (

            /* ── DOSHA ABSENT VIEW (Centered & Professional) ── */
            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Shield className="w-32 h-32 text-emerald-600" />
                                    </div>
                                    <div className="px-6 py-12 text-center relative z-10">
                                        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-3">
                                            {typeData?.meaning || 'Auspicious Chart Alignment'}
                                        </h3>
                                        <h4 className="text-xl font-bold text-emerald-600 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            {typeData?.resultMsg ?
                    typeData.resultMsg.replace('{type}', '') :
                    customSettings?.kaalSarpNoDoshaMsg || 'No Kaal Sarp Yoga Found'}
                                        </h4>
                                        <div className="max-w-xl mx-auto">
                                            {!isHtmlEmpty(typeData?.description) ?
                    <div
                      className="text-[16px] text-gray-600 leading-relaxed rich-content"
                      dangerouslySetInnerHTML={{ __html: typeData?.description || '' }} /> :


                    <p className="text-[16px] text-gray-600 leading-relaxed ">
{t("kaal_sarp._your_birth_chart_is_remarkabl")}
                    </p>
                    }
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50/50 border-t border-emerald-100 px-6 py-4 flex items-center justify-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-emerald-600" />
                                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">{t("kaal_sarp.safe_chart")}</span>
                                        </div>
                                        <div className="w-px h-4 bg-emerald-200" />
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-emerald-600" />
                                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">{t("kaal_sarp.prosperous_influence")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Positive Guidance Merged */}
                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Gem className="w-5 h-5 text-emerald-600" />
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {typeData?.meaning || 'Sustaining Your Positive Energy'}
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <p className="text-[15px] text-gray-600 leading-relaxed">
{t("kaal_sarp.since_your_chart_is_free_from")}
                    </p>
                                            <p className="text-[15px] text-gray-600 leading-relaxed">
{t("kaal_sarp.consider_these_daily_affirmati")}
                    </p>
                                        </div>
                                        <div className="bg-[#fdfbf3] p-6 rounded-2xl border border-[#ede3c7]">
                                            <ul className="space-y-4">
                                                {(typeData?.remedies && typeData.remedies.length > 0 ? typeData.remedies : [
                      'Morning meditation to ground your mental peace',
                      'Gratitude rituals during Sunrise or Sunset',
                      'Feeding birds or small animals twice a week',
                      'Regular chanting of "Om Namah Shivaya"']).
                      map((tip: string, i: number) =>
                      <li key={i} className="flex gap-3 items-start">
                                                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        </div>
                                                        <span className="text-[14px] text-gray-700 font-medium">{tip}</span>
                                                    </li>
                      )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>)
            }

                        {/* Understanding Section (Only if needed or always) */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-[#b8962e]" />
                                <h2 className="text-xl font-bold text-gray-900">{t("kaal_sarp.about_kaal_sarp_dosha")}</h2>
                            </div>
                            <div
                className="text-[15px] text-gray-700 leading-relaxed space-y-4 rich-content"
                dangerouslySetInnerHTML={{
                  __html: typeData?.intro || customSettings?.kaalSarpIntro || `
                                    <p>As per the popular definition, when all planets are situated in between Rahu and Ketu in a birth-chart or horoscope, the astrologers call it <strong>Kalsarp Dosh</strong>. in present days, discussions about this dosh are common among Jyotishi or Hindu Astrologers of India. Many of the troubles in one's life are attributed to Kalsarp Dosh.</p>
                                    <p>Without analyzing other areas of astrology, most astrologers accept Kalsarp dosh as the main root of problems. But the reality is that if all planets are well posited in the horoscope, Kalsarp dosh will not be harmful, and can be supportive to beneficial results endowed by good positions of planets. <strong>Kalsarp dosh is inauspicious only when positions of other planets are unfavorable</strong> in one's horoscope.</p>
                                ` }} />
              
                        </div>

                        {/* Type-Specific Details (Only if dosha present) */}
                        {doshas.is_present && typeData &&
            <>
                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-5">
                                        <Info className="w-4 h-4 text-sky-500" />
                                        <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-700">{t("kaal_sarp.about_this_type")}</span>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("kaal_sarp.what_is")}{doshas.type}{t("kaal_sarp.kalsarpa_yoga")}</h2>
                                    <div
                  className="text-[15px] text-gray-700 leading-[1.8] space-y-4 rich-content"
                  dangerouslySetInnerHTML={{ __html: typeData.description }} />
                
                                </div>

                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-5">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-700">{t("kaal_sarp.effects_of")}{doshas.type}{t("kaal_sarp.kalsarpa_yoga")}</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {typeData.effects.map((effect: string, i: number) =>
                  <li key={i} className="flex gap-3 items-start">
                                                <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                                <span className="text-[15px] text-gray-700 leading-relaxed">{effect}</span>
                                            </li>
                  )}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-5">
                                        <Sparkles className="w-4 h-4 text-sky-500" />
                                        <span className="text-[12px] font-black uppercase tracking-[0.16em] text-gray-700">{t("kaal_sarp.recommended_remedies")}</span>
                                    </div>
                                    <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
{t("kaal_sarp.to_deal_with_the_problems_caus")}{doshas.type}{t("kaal_sarp.kalsarpa_yoga_here_are_few_rem")}
                </p>
                                    <div className="space-y-3">
                                        {typeData.remedies.map((remedy: string, i: number) =>
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-sky-50/50 border border-sky-100/50">
                                                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
                                                    {i + 1}
                                                </div>
                                                <p className="text-[14px] text-gray-700 leading-relaxed pt-1">{remedy}</p>
                                            </div>
                  )}
                                    </div>
                                </div>
                            </>
            }

                        {/* CTA */}
                        <div className="flex flex-col items-center gap-4 pt-6 pb-4">
                            <p className="text-[13px] text-gray-500 text-center">{t("kaal_sarp.looking_for_personalized_guida")}</p>
                            <Link href="/astrologers-chat" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#b8962e] text-white font-bold rounded-xl hover:bg-[#7a6010] transition-all shadow-md group">
{t("kaal_sarp.discuss_with_expert_astrologer")}<Sparkles className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>);

  }

  // ─── FORM + DESCRIPTION VIEW ────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
            <style jsx global>{`

                .report-wrap { font-family: 'Inter', sans-serif; }
                .desc-section h2 { font-size: 23px; font-weight: 600; color: #111827; margin: 0 0 12px; }
                .desc-section h3 { font-size: 19px; font-weight: 600; color: #111827; margin: 0 0 10px; }
                .desc-section p { font-size: 15px; color: #374151; line-height: 1.85; margin: 0 0 14px; }
                .desc-section ul { margin: 10px 0 14px 0; padding: 0; list-style: none; }
                .desc-section ul li { font-size: 15px; color: #374151; line-height: 1.8; padding: 5px 0 5px 20px; position: relative; }
                .desc-section ul li::before { content: '•'; position: absolute; left: 4px; color: #b8962e; font-size: 16px; }

                .desc-section ul li::before { content: '•'; position: absolute; left: 4px; color: #b8962e; font-size: 16px; }
            `}</style>

            <div className="max-w-5xl mx-auto px-6 report-wrap">
                {/* Nav */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/free-reports" className="text-[#b8962e] hover:text-[#7a6010] font-bold flex items-center gap-2 text-sm">
                        <ChevronLeft className="w-4 h-4" />{t("kaal_sarp.back_to_reports")}
          </Link>
                    <Link href="/free-reports/history" className="text-gray-600 hover:text-[#b8962e] font-bold flex items-center gap-2 text-sm transition-colors">
                        <Clock className="w-4 h-4" />{t("kaal_sarp.view_history")}
          </Link>
                </div>

                {/* Hero text — styled like Gemstone page */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("kaal_sarp.kaal_sarp_dosh_and_its_effects")}
          </h1>
                    <h2 className="text-xl text-gray-700 mb-3">
{t("kaal_sarp.find_your_specific_kaal_sarp_y")}
          </h2>
                    <p className="text-[14px] text-gray-500 max-w-3xl mx-auto leading-relaxed">
{t("kaal_sarp.kaal_sarp_dosh_is_formed_when")}

          </p>
                </div>

                {/* ── Compact Form ── */}
                <div className="max-w-2xl mx-auto mb-16">
                    <FreeReportForm
            title="Enter Your Birth Details"
            subtitle=""
            onSubmit={handleSubmit}
            loading={loading}
            buttonText="Analyze Kaal Sarp"
            compact={true} />
          
                </div>

                {/* ── Educational Description Sections ── */}
                <div className="max-w-4xl mx-auto space-y-12 desc-section">

                    {/* What is Kaal Sarp Yog */}
                    <section>
                        <hgroup className="mb-4 pb-2 border-b border-[#d6c89a]">
                            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("kaal_sarp.what_is_kaal_sarp_yog")}
              </h2>
                        </hgroup>
                        <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
                            <p>
                                <span className="text-[#c0392b] font-medium">{t("kaal_sarp.kaal_sarp_yog")}</span>{t("kaal_sarp.is_formed_when_all_seven_major")}
              </p>
                            <p>
{t("kaal_sarp.it_is_also_important_to_check")}<span className="text-[#c0392b] font-medium">{t("kaal_sarp.kaal_sarpa_dosha")}</span>{t("kaal_sarp._however_if_mars_has_10_5_degr")}
              </p>
                            <p>
{t("kaal_sarp.since_this_yoga_is_formed_thro")}<span className="text-[#c0392b] font-medium">{t("kaal_sarp.vedic_astrology")}</span>.
                            </p>
                        </div>
                    </section>

                    {/* What is Rahu & Ketu */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-amber-50/50 border border-[#d6c89a]/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("kaal_sarp.what_is_rahu")}
              </h3>
                            <p className="text-[14px] text-gray-700 leading-relaxed">
{t("kaal_sarp.rahu_is_known_as_the")}<span className="text-[#c0392b] font-medium">{t("kaal_sarp._head_of_the_serpent")}</span>{t("kaal_sarp._it_is_a_chhaya_graha_shadow_p")}
              </p>
                        </section>

                        <section className="bg-orange-50/50 border border-[#d6c89a]/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("kaal_sarp.what_is_ketu")}
              </h3>
                            <p className="text-[14px] text-gray-700 leading-relaxed">
{t("kaal_sarp.ketu_is_the")}<span className="text-[#c0392b] font-medium">{t("kaal_sarp._tail_of_the_serpent")}</span>{t("kaal_sarp._the_south_node_and_the_counte")}
              </p>
                        </section>
                    </div>

                    {/* Different Types */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-[#d6c89a]" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("kaal_sarp.different_types_of_kaal_sarp_y")}
            </h2>
                        <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
{t("kaal_sarp.since_there_are_12_houses_in_a")}
            </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Anant', 'Kulik', 'Vasuki', 'Shankhapal', 'Padma', 'Mahapadma', 'Takshak', 'Karkotak', 'Shankhachood', 'Ghatak', 'Vishdhar', 'Sheshnag'].map((type) =>
              <span key={type} className="px-3 py-1 rounded-full bg-white border border-[#d6c89a] text-[13px] text-[#b8962e] font-bold shadow-sm">
                                    {type}
                                </span>
              )}
                        </div>
                        <p className="text-[15px] text-gray-700 leading-relaxed">
{t("kaal_sarp.each_type_affects_different_as")}
            </p>
                    </section>

                    {/* Effects */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-[#d6c89a]" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("kaal_sarp.effects_of_kaal_sarp_dosh")}
            </h2>
                        <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
                            <p>
{t("kaal_sarp.generally_it_is_believed_that")}
              </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                '1st-7th axis: Challenges in self-development and partnerships',
                '2nd-8th axis: Potential family or financial difficulties',
                '5th-11th axis: Delays in progeny or educational hurdles',
                '9th-3rd axis: Fluctuations in luck and communication'].
                map((item, i) =>
                <li key={i} className="flex gap-3 items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="w-5 h-5 rounded-full bg-[#fdf6e3] border border-[#d6c89a] text-[#b8962e] flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">✓</div>
                                        <span className="text-[14px]">{item}</span>
                                    </li>
                )}
                            </ul>
                        </div>
                    </section>

                    {/* Results Table-like style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-red-400 rounded-full" />{t("kaal_sarp.inauspicious_results")}
              </h3>
                            <ul className="space-y-2">
                                {[
                'Obstacles in auspicious ceremonies',
                'Delays in marriage or marital life',
                'Difficulty in career growth',
                'Mental tension and lack of peace'].
                map((text, i) =>
                <li key={i} className="text-[14px] text-gray-600 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {text}
                                    </li>
                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-400 rounded-full" />{t("kaal_sarp.auspicious_results")}
              </h3>
                            <p className="text-[14px] text-gray-600 leading-relaxed">
{t("kaal_sarp.kaal_sarp_yog_also_has_a_const")}
              </p>
                        </div>
                    </div>

                    {/* General Remedies */}
                    <section className="bg-white rounded-3xl border border-[#d6c89a] p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            <Sparkles className="w-6 h-6 text-[#b8962e]" />{t("kaal_sarp.general_remedies_upay")}
            </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                            {[
              'Worship Lord Shiva regularly',
              'Chant Maha Mrityunjaya Mantra',
              'Observe fasts on Shravan Somvar',
              'Perform Rudrabhishek on Shivratri',
              'Feed dogs with roti on Saturdays',
              'Offer water to Shivling daily',
              'Recite the Gayatri Mantra',
              'Visit Trimbakeshwar or Ujjain'].
              map((remedy, i) =>
              <div key={i} className="flex gap-3 items-start group">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[12px] font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors capitalize">
                                        {i + 1}
                                    </div>
                                    <p className="text-[14px] text-gray-700 font-medium">{remedy}</p>
                                </div>
              )}
                        </div>
                        <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <p className="text-[13px] text-blue-700 leading-relaxed text-center">
{t("kaal_sarp._these_remedies_are_supportive")}
              </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>);

}