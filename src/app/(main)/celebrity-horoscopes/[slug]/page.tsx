'use client';
import { useTranslation } from '@/context/LanguageContext';

import { useState, useEffect, use } from 'react';
import {
  ChevronLeft, Star, MapPin, Calendar, Clock,
  Sparkles, Loader2, Info, User,
  Crown } from
'lucide-react';
import Link from 'next/link';
import { celebrityService, CelebrityProfile } from '@/lib/celebrityService';
import { astrologyService } from '@/lib/astrologyService';
import KundliResult from '@/components/kundli/KundliResult';
import PaidPDFButton from '@/components/shared/PaidPDFButton';
import { downloadCelebrityPDF } from '@/lib/celebrityPdfGenerator';

export default function CelebrityDetailPage({ params }: {params: Promise<{slug: string;}>;}) {
    const { t } = useTranslation();

  const { slug } = use(params);
  const [profile, setProfile] = useState<CelebrityProfile | null>(null);
  const [kundliData, setKundliData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await celebrityService.getCelebrityBySlug(slug);
      setProfile(data);
      if (data) {
        calculateChart(data);
      }
    } catch (err) {
      console.error('Error fetching celebrity profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateChart = async (p: CelebrityProfile) => {
    if (p.kundliData) {
      setKundliData(p.kundliData);
      return;
    }
    try {
      setCalculating(true);
      const res = await astrologyService.calculateKundli({
        name: p.name,
        date: p.birthDate,
        time: p.birthTime || '12:00',
        lat: String(p.latitude),
        lon: String(p.longitude),
        place: p.birthPlace,
        tzone: p.timezone
      });

      if (res.success) {
        setKundliData(res.data);
      }
    } catch (err) {
      console.error('Error calculating celebrity chart:', err);
    } finally {
      setCalculating(false);
    }
  };

  // --- Astrological Data Formatting Helpers ---
  const rashiMap: Record<string, string> = {
    'Aries': 'Mesha', 'Taurus': 'Vrishabha', 'Gemini': 'Mithuna',
    'Cancer': 'Karka', 'Leo': 'Simha', 'Virgo': 'Kanya',
    'Libra': 'Tula', 'Scorpio': 'Vrishchika', 'Sagittarius': 'Dhanu',
    'Capricorn': 'Makara', 'Aquarius': 'Kumbha', 'Pisces': 'Meena'
  };

  const formatR = (s: any) => {
    if (!s) return null;
    const sign = String(s).split(' ')[0];
    return rashiMap[sign] ? `${sign} (${rashiMap[sign]})` : s;
  };

  const facts = [
  { label: 'Moon Sign', value: formatR(kundliData?.panchang?.moon_sign), icon: Star },
  { label: 'Sun Sign', value: formatR(kundliData?.panchang?.sun_sign), icon: Star },
  { label: 'Ascendant', value: formatR(kundliData?.kundli?.ascendant), icon: User },
  { label: 'Nakshatra', value: kundliData?.panchang?.nakshatra, icon: Sparkles },
  { label: 'Destiny', value: 'Royal Path', icon: Crown }];


  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#b8962e]" size={48} />
        <p className="text-gray-500 font-medium serif">{t("_slug_.summoning_cosmic_records")}</p>
      </div>);

  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <User size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 serif">{t("_slug_.profile_not_found")}</h1>
        <p className="text-gray-500 max-w-sm">{t("_slug_.the_star_you_are_looking_for_h")}</p>
        <Link href="/celebrity-horoscopes" className="text-[#b8962e] font-bold underline">{t("_slug_.back_to_all_celebrities")}</Link>
      </div>);

  }

  return (
    <div className="min-h-screen bg-[#fdf6e3]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        .celeb-wrap * { font-family: 'Source Sans 3', sans-serif; }
        .celeb-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
        
        /* Insights Styling */
        .insights-content { overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
        .insights-content p { margin-bottom: 1.5rem; line-height: 1.8; color: #374151; font-size: 1.05rem; }
        .insights-content h2 { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #111827; border-left: 4px solid #b8962e; padding-left: 1rem; }
        .insights-content img { border-radius: 1.5rem; margin: 2rem auto; display: block; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); border: 4px solid white; max-width: 500px; width: 100%; height: auto; }
        
        /* Kundli Result Component Overrides (LOCAL ONLY) */
        .celeb-wrap .kr-wrap { padding: 0 !important; max-width: 100% !important; }
        .celeb-wrap .kr-panel { background: white !important; border: 1px solid #f3f4f6 !important; box-shadow: none !important; border-radius: 1.5rem !important; }
        
        /* Dasha Timeline Scrollable Fix */
        .celeb-wrap .kr-panel:nth-of-type(2) {
          max-height: 600px !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .celeb-wrap .kr-panel:nth-of-type(2) > div:last-child {
          overflow-y: auto !important;
          flex: 1 !important;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
        .celeb-wrap .kr-panel:nth-of-type(2) > div:last-child::-webkit-scrollbar { width: 4px; }
        .celeb-wrap .kr-panel:nth-of-type(2) > div:last-child::-webkit-scrollbar-track { background: transparent; }
        .celeb-wrap .kr-panel:nth-of-type(2) > div:last-child::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        
        /* Hide excessive padding in embedded mode */
        .celeb-wrap .pb-20 { padding-bottom: 0 !important; }

        /* Hide Specific Detailed Sections for Celebrities */
        .celeb-wrap #house-representation, 
        .celeb-wrap #basic-interpretation,
        .celeb-wrap #planetary-positions + div,
        .celeb-wrap .kr-panel:nth-of-type(3) .p-4 > div:last-child { 
          display: none !important; 
        }
      ` }} />

      <div className="celeb-wrap">
        {/* Navigation & Header */}
        {/* Navigation & Header */}
        <div className="bg-[#0f0f0f] pb-10 pt-6 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,_#b8962e_0%,_transparent_50%)]" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <Link
              href="/celebrity-horoscopes"
              className="inline-flex items-center gap-2 text-white/40 hover:text-amber-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              
              <ChevronLeft size={14} />{t("_slug_.back_to_library")}
            </Link>

            <div className="flex flex-col md:flex-row gap-10 items-center">
              {/* Profile Image - Reduced scale */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.2rem] overflow-hidden border border-white/10 shadow-2xl relative bg-gray-900">
                  {profile.image ?
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }} /> :


                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      <User size={48} />
                    </div>
                  }
                </div>
              </div>

              {/* Identity */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em]">
                  <Sparkles size={10} /> {profile.category}{t("_slug_.vip")}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white serif tracking-tight">
                  {profile.name}
                </h1>
                {profile.summary &&
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                    {profile.summary}
                  </p>
                }
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-y-3 gap-x-6 text-white/50 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Calendar size={12} className="text-amber-500" /> {profile.birthDate}
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Clock size={12} className="text-amber-500" /> {profile.birthTime || '--:--'}
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <MapPin size={12} className="text-amber-500" /> {profile.birthPlace}
                  </div>

                  <PaidPDFButton 
                    toolKey="celebrity-horoscope"
                    reportName={`${profile.name}'s Cosmic Legacy`}
                    downloadFn={async () => {
                      if (!kundliData) return;
                      await downloadCelebrityPDF({
                        profile,
                        kundliData
                      });
                    }}
                    variant="none"
                    className="text-amber-500 hover:text-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Facts Integrated Bar */}
        <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-30">
          <div className="bg-white rounded-2xl md:rounded-full p-2 shadow-xl border border-[#d6c89a]/30 flex flex-col md:flex-row gap-2 overflow-hidden items-stretch">
             {facts.map((fact, idx) =>
            <div key={idx} className="flex-1 flex items-center gap-4 bg-gray-50/50 hover:bg-amber-50 rounded-xl md:rounded-full px-6 py-4 transition-colors group">
                   <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <fact.icon size={16} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{fact.label}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {fact.value || (calculating ? '...' : '--')}
                      </p>
                   </div>
                </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 mt-12 pb-20 relative z-20">
          <div className="flex flex-col gap-10">
            {/* Kundli Result Card - Balanced Full Width */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/20 border border-[#d6c89a]/40 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 md:p-10 bg-[#fffdf5] border-b border-[#d6c89a]/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 serif tracking-tight">{t("_slug_.janam_kundli")}</h2>
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em]">{t("_slug_.verified_chart_alignment")}</p>
                  </div>
                </div>
                {calculating &&
                <div className="flex items-center gap-3 text-amber-600 text-xs font-black uppercase tracking-widest animate-pulse">
                    <Loader2 className="animate-spin" size={16} />{t("_slug_.calculating")}
                </div>
                }
              </div>

              <div className="flex-1 bg-white">
                {kundliData ?
                <div className="p-4 md:p-10 overflow-hidden">
                    <KundliResult
                    data={kundliData}
                    hideHeader
                    onBack={() => {}}
                    onNew={() => {}} />
                  
                  </div> :

                <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-gray-300">
                    {!calculating &&
                  <>
                        <Info size={40} className="opacity-20" />
                        <p className="text-sm font-medium">{t("_slug_.chart_data_currently_unavailab")}</p>
                      </>
                  }
                  </div>
                }
              </div>
            </div>

            {/* Astrology Insights Content - Well Organized Below Chart */}
            {profile.content &&
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-gray-200/20 border border-[#d6c89a]/40">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                    <Info size={24} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 serif">{t("_slug_.celestial_legacy_analysis")}</h2>
                </div>
                
                <div className="insights-content max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: profile.content }} />
              </div>
            }
            
            {/* Footer Navigation */}
            <div className="flex justify-center pt-10">
              <Link
                href="/celebrity-horoscopes"
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-colors shadow-lg">
{t("_slug_.back_to_all_celebrities")}

              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>);

}