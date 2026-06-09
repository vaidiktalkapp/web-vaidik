'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import FreeReportForm from '@/components/shared/FreeReportForm';
import { saveReportToHistory, generateReportSummary } from '@/lib/reportHistory';
import { downloadGemstonePDF } from '@/lib/gemstonePdfGenerator';
import { AlertTriangle, ChevronLeft, Clock, Download, Gem, Info, Link, Loader2, Shield, Sparkles } from 'lucide-react';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

// ─── Inline content sections shown below the form ────────────────────────────

const GemstoneInfoSections = () => {
    const { t } = useTranslation();
    return (
<div className="mt-14 space-y-12 max-w-4xl mx-auto">

        {/* ── What is Gemstone? ─────────────────────────────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-[#d6c89a]">
{t("gemstone.what_is_gemstone")}
    </h2>
            <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
                <p>
{t("gemstone.gems_or_gemstones_play_an_impo")}{' '}
                    <span className="text-[#c0392b] font-medium">{t("gemstone.vedic_astrology")}</span>{' '}
{t("gemstone.specifically_for_remedial_purp")}
      </p>
                <p>
{t("gemstone.our_divine_earth_has_natural_s")}
      </p>
                <p>
{t("gemstone.it_is_preferable_to_wear_only")}{' '}
                    <span className="text-[#c0392b] font-medium">{t("gemstone.birth_chart")}</span>{' '}
{t("gemstone.because_if_you_wear_one_that_i")}
      </p>
                <p>
{t("gemstone.these_days_everyone_is_asking")}{' '}
                    <span className="text-[#c0392b] font-medium">{t("gemstone.how_to_know_my_lucky_gemstone")}</span>
{t("gemstone._which_gemstone_should_i_wear")}
      </p>
                <p>
{t("gemstone.let_s_discuss_all_of_your_ques")}
      </p>
                <p>
{t("gemstone.ascendant_is_the_most_importan")}{' '}
                    <span className="text-[#c0392b] font-medium">{t("gemstone.ascendant")}</span>{' '}
{t("gemstone.or_its_lord_is_weak_a_person_m")}
      </p>
                <p>
{t("gemstone.there_are_certain_houses_that")}
      </p>
            </div>
        </section>

        {/* ── Types of Gemstones ────────────────────────────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b border-[#d6c89a]">
{t("gemstone.types_of_gemstones")}
    </h2>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
{t("gemstone.as_per_quality_effects_purity")}
    </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Precious Stones */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
{t("gemstone.precious_stones")}
        </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">
{t("gemstone.precious_gemstones_are_expensi")}{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.diamond")}</span>{t("gemstone.or_sapphire")}{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.yellow_sapphire")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.blue_sapphire")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.ruby")}</span>{t("gemstone.and")}{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.emerald")}</span>.
                    </p>
                </div>

                {/* Semi-Precious Stones */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
{t("gemstone.semi_precious_stones")}
        </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">
{t("gemstone.gemstones_that_are_not_much_ex")}{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.red_coral")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.pearl")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.hessonite")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.cat_s_eye")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.turquoise")}</span>,{' '}
                        <span className="text-[#c0392b] font-medium">{t("gemstone.onyx")}</span>{t("gemstone._agate_labradorite_amber_quart")}
        </p>
                </div>
            </div>
        </section>

        {/* ── Suitable Gemstones for different Ascendants ───────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b border-[#d6c89a]">
{t("gemstone.suitable_gemstones_for_differe")}
    </h2>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
{t("gemstone.every_ascendant_has_a_differen")}{' '}
                <span className="text-[#c0392b] font-medium">{t("gemstone.yantra")}</span>,{' '}
                <span className="text-[#c0392b] font-medium">{t("gemstone.rudraksha")}</span> or{' '}
                <span className="text-[#c0392b] font-medium">{t("gemstone.jadi")}</span>{' '}
{t("gemstone.of_that_planet_take_a_look_at")}
    </p>

            {/* All 12 Ascendants */}
            {[
    {
      sign: 'Aries Ascendant',
      ruler: 'Mars',
      text: 'Sun and Jupiter are beneficial planets for this ascendant. Hence, person born under',
      link: 'Aries Ascendant',
      gems: 'can wear Red Coral, Ruby and Yellow Sapphire gemstones.'
    },
    {
      sign: 'Taurus Ascendant',
      ruler: 'Venus',
      text: 'Mercury and Saturn are beneficial planets for this ascendant. Saturn is Yogakaraka planet hence, is much beneficial. A person born under',
      link: 'Taurus Ascendant',
      gems: 'can wear Diamond or Sapphire, Emerald and Blue Sapphire gemstones.'
    },
    {
      sign: 'Gemini Ascendant',
      ruler: 'Mercury',
      text: 'Venus and Saturn are beneficial planets for this ascendant. Hence, person born under',
      link: 'Gemini Ascendant',
      gems: 'can wear Emerald, Diamond or Sapphire and Blue Sapphire gemstones.'
    },
    {
      sign: 'Cancer Ascendant',
      ruler: 'Moon',
      text: 'Mars and Jupiter are beneficial planets for this ascendant. Mars is the Yogakaraka planet for them hence, is much beneficial. A person born under',
      link: 'Cancer Ascendant',
      gems: 'can wear Natural Pearl, Red Coral and Yellow Sapphire gemstones.'
    },
    {
      sign: 'Leo Ascendant',
      ruler: 'Sun',
      text: 'Jupiter and Mars are beneficial planets for this ascendant. For this Ascendant, Mars is the Yogakaraka planet hence, is much beneficial. A person born under',
      link: 'Leo Ascendant',
      gems: 'can wear Ruby, Yellow Sapphire and Red Coral gemstones.'
    },
    {
      sign: 'Virgo Ascendant',
      ruler: 'Mercury',
      text: 'Saturn and Venus are beneficial planets for this ascendant. Hence, person born under',
      link: 'Virgo Ascendant',
      gems: 'can wear Emerald, Blue Sapphire and Diamond or Sapphire gemstones.'
    },
    {
      sign: 'Libra Ascendant',
      ruler: 'Venus',
      text: 'Saturn and Mercury are beneficial planets for this ascendant. Saturn is Yogakaraka planet hence, is much beneficial. A person born under',
      link: 'Libra Ascendant',
      gems: 'can wear Diamond or Sapphire, Blue Sapphire and Emerald gemstones.'
    },
    {
      sign: 'Scorpio Ascendant',
      ruler: 'Mars',
      text: 'Jupiter and Moon are beneficial planets for this ascendant. Hence, person born under',
      link: 'Scorpio Ascendant',
      gems: 'can wear Red Coral, Yellow Sapphire and natural Pearl gemstones.'
    },
    {
      sign: 'Sagittarius Ascendant',
      ruler: 'Jupiter',
      text: 'Mars and Sun are beneficial planets for this ascendant. Hence, person born under',
      link: 'Sagittarius ascendant',
      gems: 'can wear Yellow Sapphire, Red Coral and Ruby gemstones.'
    },
    {
      sign: 'Capricorn Ascendant',
      ruler: 'Saturn',
      text: 'Venus and Mercury are beneficial planets for this ascendant. Venus is Yogakaraka planet hence, is much beneficial. A person born under',
      link: 'Capricorn Ascendant',
      gems: 'can wear Blue Sapphire, Diamond or Sapphire and Emerald gemstones.'
    },
    {
      sign: 'Aquarius Ascendant',
      ruler: 'Saturn',
      text: 'Mercury and Venus are beneficial planets for this ascendant. Here, Venus becomes a Yogakaraka planet hence, is much beneficial. A person born under',
      link: 'Aquarius Ascendant',
      gems: 'can wear Blue Sapphire, Emerald and Diamond or Sapphire gemstones.'
    },
    {
      sign: 'Pisces Ascendant',
      ruler: 'Jupiter',
      text: 'Moon and Mars are beneficial planets for this ascendant. Hence, person born under',
      link: 'Pisces ascendant',
      gems: 'can wear Yellow Sapphire, Natural Pearl and Red Coral gemstones.'
    }].
    map(({ sign, ruler, text, link, gems }, i) =>
    <div key={i} className="mb-6">
                    <h3 className="text-[18px] font-bold text-gray-900 mb-1">
                        {sign}
                    </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">
                        <span className="text-[#c0392b] font-medium">{ruler}</span>{' '}
{t("gemstone.is_the_ruling_planet_of")}{sign.replace(' Ascendant', '')}. {text}{' '}
                        <span className="text-[#c0392b] font-medium">{link}</span>{' '}
                        {gems}
                    </p>
                </div>
    )}
        </section>

        {/* ── How and When to Wear ──────────────────────────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b border-[#d6c89a]">
{t("gemstone.how_and_when_to_wear_a_gemston")}
    </h2>
            <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
                <p>
{t("gemstone.now_when_you_came_to_know_as_t")}{' '}
                    <span className="text-[#c0392b] font-medium">{t("gemstone.muhurat")}</span>{' '}
{t("gemstone.of_wearing_a_gemstone_method_o")}
      </p>
                <p>
{t("gemstone.every_good_step_must_be_taken")}{' '}
                    <span className="text-[#c0392b] font-medium">{t("gemstone.nakshatra")}</span>{' '}
{t("gemstone.and_the_hora_of_the_planet_to")}
      </p>
            </div>
        </section>

        {/* ── Contradictory / Incompatible Gemstones ───────────────────── */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b border-[#d6c89a]">
{t("gemstone.contradictory_or_incompatible")}
    </h2>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
{t("gemstone.now_you_may_think_about_which")}
    </p>

            {[
    {
      title: 'Blue Sapphire Gemstone or Neelam:',
      text: 'Neelam is ruled by planet Saturn and as per Vedic Astrology, enemies of planet Saturn are Sun, Moon, and Mars which rules Ruby, Pearl and Red Coral gemstones respectively. Therefore, if you are wearing Blue Sapphire gemstone, you should not wear Ruby stone, Pearl gem and Red Coral gemstones with it.'
    },
    {
      title: 'Ruby Gemstone or Manik/Manikya:',
      text: 'It is ruled by planet Sun and as per Vedic Astrology, enemies of planet Sun are Venus and Saturn. Venus rules Diamond and Saturn rules Blue Sapphire. Therefore, if you are wearing Ruby gemstone, you should not wear Blue Sapphire stone and Diamond.'
    },
    {
      title: 'Emerald Gemstone or Panna:',
      text: 'It is ruled by planet Mercury and as per Vedic Astrology, enemies of planet Mercury are Moon and Mars. Moon rules over Pearls and Mars rules over Red Coral. Therefore, if you are wearing Emerald gemstone, you should avoid wearing Pearl and Red Coral Gemstones.'
    },
    {
      title: 'Pearl Gemstone or Moti:',
      text: "It is ruled by planet Moon and as per astrology, enemies of this planet are Rahu and Ketu. Rahu rules over Hessonite stone and Ketu rules over Cat's Eye gemstone. Therefore, if you are going to wear Pearl gemstone, you should avoid wearing Hessonite and Cat's Eye Gemstones."
    },
    {
      title: 'Red Coral Gemstone or Moonga:',
      text: "Red Coral gemstone is ruled by planet Mars and as per astrology, enemies of planet Mars are Venus, Mercury, Saturn, Rahu and Ketu. Gemstones like Diamond, Emerald, Blue Sapphire, Hessonite or Garnet and Cat's Eye are ruled by these planets respectively. Therefore, if you are going to wear Red Coral gemstone, you should avoid wearing above-mentioned non-compatible Gemstones."
    },
    {
      title: 'Yellow Sapphire Gemstone or Pukhraj:',
      text: 'Yellow Topaz or Yellow Sapphire gemstone is ruled by planet Jupiter and as per Vedic Astrology, enemies of planet Jupiter are Venus, Mercury and Saturn. Therefore, if you are wearing Yellow Sapphire gemstone, you should abstain from wearing Diamond or Solitaire, Emerald and Blue Sapphire Gemstones.'
    },
    {
      title: 'Diamond or Heera/Hira:',
      text: 'Diamond gemstone or Solitaire is ruled by planet Venus and as per Vedic Astrology, enemies of planet Venus are Jupiter, Sun and Moon. Therefore, if you are wearing Diamond, you should abstain from wearing Yellow Sapphire, Ruby and Pearl Gemstones.'
    },
    {
      title: 'Hessonite or Garnet or Gomed:',
      text: 'It is ruled by planet Rahu and as per Vedic Astrology, enemies of planet Rahu are Sun and Moon. Therefore, if you are wearing Hessonite gemstone, you should not wear Ruby or Pearl gemstones.'
    },
    {
      title: "Cat's Eye Gemstone or Lehsunia:",
      text: 'It is ruled by planet Ketu and as per Vedic Astrology, enemies of planet Ketu are Moon and Sun. Therefore, if you are wearing Cat\'s Eye gemstone, you should not wear Pearl or Ruby gemstones.'
    }].
    map(({ title, text }, i) =>
    <div key={i} className="mb-6">
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1">
                        {title}
                    </h3>
                    <p className="text-[14px] text-gray-700 leading-relaxed">{text}</p>
                </div>
    )}

            {/* Closing paragraph */}
            <div className="mt-6 space-y-4 text-[15px] text-gray-700 leading-relaxed">
                <p>
{t("gemstone.it_is_evident_that_wearing_a_g")}
      </p>
                <p>
{t("gemstone.therefore_you_should_consult_w")}
      </p>
            </div>
        </section>

    </div>
    );
};


// ─── Main Page Component ──────────────────────────────────────────────────────

export default function GemstonePage() {
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
        console.error('Error fetching Gemstone settings:', error);
      }
    };
    fetchSettings();

    try {
      const saved = sessionStorage.getItem('freereport_gemstone');
      if (saved) setReportData(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.vaidiktalk.com'}/free-reports/gemstone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        try {sessionStorage.setItem('freereport_gemstone', JSON.stringify(result.data));} catch {}
        await saveReportToHistory({
          type: 'gemstone',
          name: formData.name || 'Unknown',
          date: formData.date,
          place: formData.place || '',
          summary: generateReportSummary('gemstone', result.data),
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error fetching Gemstone report:', error);
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
    const { gemstones, input } = reportData;

    const handleDownloadPDF = async () => {
      try {
        setIsDownloading(true);
        await downloadGemstonePDF({
          gemstones,
          input,
          settings: {
            gemstones: customSettings?.gemstones,
            gemstoneRoleDescriptions: customSettings?.gemstoneRoleDescriptions
          }
        });
      } catch (error) {
        console.error('PDF error:', error);
      } finally {
        setIsDownloading(false);
      }
    };

    const gemstoneDetails: Record<string, {hindi: string;weight: string;mantra: string;day: string;substitute: string;}> = {
      'Ruby': { hindi: 'Manik', weight: '3–5 Carats (5–8 Ratti)', mantra: 'Om Hraam Hreem Hroum Sah Suryaya Namah', day: 'Sunday', substitute: 'Garnet (Tamra)' },
      'Pearl': { hindi: 'Moti', weight: '2–4 Carats (4–6 Ratti)', mantra: 'Om Shram Shreem Shroum Sah Chandraya Namah', day: 'Monday', substitute: 'Moonstone (Chandrakant)' },
      'Red Coral': { hindi: 'Moonga', weight: '3–5 Carats (5–9 Ratti)', mantra: 'Om Kraam Kreem Kroum Sah Bhaumaya Namah', day: 'Tuesday', substitute: 'Carnelian (Lal Onyx)' },
      'Emerald': { hindi: 'Panna', weight: '3–5 Carats (5–7 Ratti)', mantra: 'Om Braam Breem Broum Sah Budhaya Namah', day: 'Wednesday', substitute: 'Peridot (Ghrit Mani)' },
      'Yellow Sapphire': { hindi: 'Pukhraj', weight: '2–4 Carats (3–5 Ratti)', mantra: 'Om Graam Greem Groum Sah Gurave Namah', day: 'Thursday', substitute: 'Citrine (Sunela)' },
      'Diamond': { hindi: 'Heera', weight: '0.5–1 Carat (1–2 Ratti)', mantra: 'Om Draam Dreem Droum Sah Shukraya Namah', day: 'Friday', substitute: 'White Sapphire (Safed Pukhraj)' },
      'Blue Sapphire': { hindi: 'Neelam', weight: '2–4 Carats (3–5 Ratti)', mantra: 'Om Praam Preem Proum Sah Shanaischaraya Namah', day: 'Saturday', substitute: 'Amethyst (Jamunia)' },
      'Gomed': { hindi: 'Gomed (Hessonite)', weight: '3–5 Carats (5–8 Ratti)', mantra: 'Om Bhraam Bhreem Bhroum Sah Rahave Namah', day: 'Saturday', substitute: 'Orange Zircon' },
      "Cat's Eye": { hindi: 'Lehsunia (Vaidurya)', weight: '3–5 Carats (5–7 Ratti)', mantra: 'Om Sraam Sreem Sroum Sah Ketave Namah', day: 'Tuesday', substitute: "Tiger's Eye" }
    };

    const roleDescriptions: Record<string, string> = {
      'Life Stone': customSettings?.gemstoneRoleDescriptions?.['Life Stone'] || 'A life stone is a gem for the Lagna lord. One can wear it throughout life to experience its mystic powers. Wearing a life stone can remove obstacles and bless an individual with happiness, success and prosperity. It is generally worn to bring about an overall well being. Its cosmic rays influence the entire existence.',
      'Lucky Stone': customSettings?.gemstoneRoleDescriptions?.['Lucky Stone'] || "Life is a perfect blend of efforts and destiny. Get destiny to work for you by wearing your lucky stone. An individual's lucky stone is one that keeps luck ticking, bringing pleasant surprises in life. The Lucky Stone is recommended based on the lord of the 5th house in your birth chart.",
      'Fortune Stone': customSettings?.gemstoneRoleDescriptions?.['Fortune Stone'] || 'Recommendations of Bhagya stone also known as fortune stone is done on the basis of the Lord governing the ninth house. This stone is known to make fortune work for you when you actually need it. Good fortune comes your way in personal and professional life. It helps you combat any obstacle that stands in your way of prosperity.'
    };

    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: '#fdf6e3' }}>
                <style jsx global>{`
                    .report-wrap { font-family: 'Inter', sans-serif; }
                `}</style>

                <div className="max-w-4xl mx-auto px-6 report-wrap">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => { setReportData(null); try { sessionStorage.removeItem('freereport_gemstone'); } catch { } }}
                            className="flex items-center gap-2 text-[#b8962e] hover:text-[#7a6010] transition-colors font-bold text-sm">

                            <ChevronLeft className="w-4 h-4" />{t("gemstone.back_to_calculator")}
                        </button>

                        <PaidPDFButton 
                            toolKey="gemstone"
                            reportName="Gemstone Report"
                            downloadFn={handleDownloadPDF}
                            className="px-5 py-2 !text-sm"
                        />
                    </div>

                    <div id="gemstone-report" className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden">
                            <div className="h-1 bg-[#b8962e]" />
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: '#b8962e' }}>{t("gemstone.vedic_gemstone_prediction")}</p>
                                <h1 className="text-3xl font-semibold text-gray-900 mb-3">{t("gemstone.gemstone_prediction")}</h1>
                                <p className="text-gray-700 text-[15px] max-w-xl mx-auto">{t("gemstone.personalized_gemstone_recommen")}<strong>{input.name}</strong>{t("gemstone.based_on_birth_chart_analysis")}</p>
                            </div>
                            {gemstones.length > 0 &&
              <div className="px-8 pb-8">
                                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                                        <p className="text-sky-800 font-bold text-sm text-center">
                                            {customSettings?.gemstones?.[gemstones[0].gemstone]?.resultMsg ?
                    customSettings.gemstones[gemstones[0].gemstone].resultMsg.replace(/{gemstone}/g, gemstones[0].gemstone) :
                    customSettings?.gemstonesResultMsg ?
                    customSettings.gemstonesResultMsg.replace(/{gemstone}/g, gemstones[0].gemstone) :
                    `Recommended Gemstone for you is ${gemstones[0].gemstone}`}
                                        </p>
                                    </div>
                                </div>
              }
                        </div>

                        {/* What Is Gemstone? */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t("gemstone.what_is_gemstone")}</h2>
                            <div
                className="text-[14px] text-gray-700 leading-relaxed rich-content"
                dangerouslySetInnerHTML={{
                  __html: gemstones.length > 0 && customSettings?.gemstones?.[gemstones[0].gemstone]?.intro || customSettings?.gemstonesIntro || `
                                    The primary use for gems throughout history has been for healing and spiritual rituals. Although gems were rare and exhibited great beauty, the reason they were so precious was due to the power they imparted to their wearers. They are storehouses of empowerment, transmitted through contact with one's body. Gems exhibit their power in a beneficial or detrimental way — depending on how they are used. All stones or gems have magnetic powers in varying degrees, and many of them are beneficial to us for their therapeutic cures. They emit vibrations and frequencies which have strong potential influence on our whole being. Here's what your Gemstone prediction looks like.
                                ` }} />
              
                        </div>

                        {/* Each Stone Type */}
                        {gemstones.map((gem: any, i: number) => {
              const adminStone = customSettings?.gemstones?.[gem.gemstone];
              const defaultDetails = gemstoneDetails[gem.gemstone] || { hindi: '', weight: '2 Carats', mantra: 'Consult an expert', day: 'Consult an expert', substitute: '' };
              const details = {
                hindi: adminStone?.hindiName || defaultDetails.hindi,
                weight: adminStone?.weight || defaultDetails.weight,
                mantra: adminStone?.mantra || defaultDetails.mantra,
                day: adminStone?.day || defaultDetails.day,
                substitute: adminStone?.substitute || defaultDetails.substitute
              };
              const roleName = gem.role === 'Fortune Stone' ? 'Bhagya Stone' : gem.role;
              const description = roleDescriptions[gem.role] || '';
              const colorAccent = gem.role === 'Life Stone' ? '#2563eb' : gem.role === 'Lucky Stone' ? '#d97706' : '#059669';

              return (
                <div key={i} className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden">
                                    <div className="h-1" style={{ backgroundColor: colorAccent }} />
                                    <div className="p-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colorAccent + '15', color: colorAccent }}>
                                                <Gem className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">{roleName}</h2>
                                            {!gem.is_recommended &&
                      <span className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                                                    <AlertTriangle className="w-3 h-3" />{t("gemstone.caution")}
                      </span>
                      }
                                            {gem.is_recommended &&
                      <span className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                                    <Shield className="w-3 h-3" />{t("gemstone.recommended")}
                      </span>
                      }
                                        </div>
                                        <div className="text-[14px] text-gray-700 leading-relaxed mb-4 rich-content"
                    dangerouslySetInnerHTML={{ __html: customSettings?.gemstones?.[gem.gemstone]?.profile || description }} />
                                        {customSettings?.gemstones?.[gem.gemstone]?.benefits?.length > 0 &&
                    <div className="mb-6 space-y-2">
                                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{t("gemstone.key_benefits")}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {customSettings.gemstones[gem.gemstone].benefits.map((benefit: string, idx: number) =>
                        <span key={idx} className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[12px] text-gray-600 font-medium">{benefit}</span>
                        )}
                                                </div>
                                            </div>
                    }
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">{t("gemstone.recommendation")}</h3>
                                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                                            <table className="w-full text-sm border-collapse">
                                                <tbody>
                                                    {[
                          ['Recommend Gemstone', `${gem.gemstone}${details.hindi ? ` (${details.hindi})` : ''}`],
                          ['Ruling Planet', gem.planet],
                          ['Minimum Recommended Weight', details.weight],
                          ['Wearing Instructions', null],
                          ['Best Day to Wear', details.day],
                          ['Recommend Mantra', details.mantra],
                          ['Substitute Stone', details.substitute]].
                          map(([label, val], ri) =>
                          <tr key={ri} className={ri < 6 ? 'border-b border-gray-100' : ''}>
                                                            <td className="px-5 py-3 bg-gray-50 font-bold text-gray-700 w-2/5">{label}</td>
                                                            <td className="px-5 py-3 font-semibold text-gray-900">
                                                                {label === 'Wearing Instructions' ?
                              <div className="rich-content" dangerouslySetInnerHTML={{ __html: customSettings?.gemstones?.[gem.gemstone]?.wearingInstructions || `${gem.metal}, in ${gem.finger.toLowerCase()} finger` }} /> :
                              val}
                                                            </td>
                                                        </tr>
                          )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>);

            })}

                        {/* Important Information */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-[#b8962e]" />
                                <h2 className="text-xl font-bold text-gray-900">{t("gemstone.important_information")}</h2>
                            </div>
                            <p className="text-[14px] text-gray-700 leading-relaxed mb-6">
{t("gemstone.while_wearing_a_gem_please_kee")}
              </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {[
                'Wear within 2 hours of sunrise on the designated day.',
                'Purify with raw milk and Gangajal before wearing.',
                'The stone must touch the skin directly for impact.',
                'Chant the recommended mantra 108 times while wearing.',
                'Verify Carat/Ratti weight with an expert before purchase.',
                'Remove during sleep if advised by your astrologer.'].
                map((text: string, i: number) =>
                <div key={i} className="flex gap-3 items-start">
                                        <div className="w-5 h-5 rounded-full bg-[#fdf6e3] border border-[#d6c89a] text-[#b8962e] flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</div>
                                        <p className="text-[13px] text-gray-700 leading-relaxed">{text}</p>
                                    </div>
                )}
                            </div>
                            <div className="border-t border-gray-100 pt-6 mb-6">
                                <div className="bg-gradient-to-r from-[#fdf6e3] to-amber-50 rounded-xl border border-[#d6c89a] p-6 flex flex-col md:flex-row items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-[#b8962e] flex items-center justify-center flex-shrink-0">
                                        <Gem className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#b8962e] mb-1">{t("gemstone.vaidiktalk_store")}</p>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t("gemstone.buy_authentic_gemstones")}</h3>
                                        <p className="text-[13px] text-gray-700 leading-relaxed">
{t("gemstone.get_100_certified_genuine_gems")}<strong>{t("gemstone.vaidiktalk_store")}</strong>{t("gemstone._lab_tested_with_authenticity")}
                    </p>
                                    </div>
                                    <a href="https://vaidiktalk.store" target="_blank" rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-[#b8962e] text-white font-bold rounded-xl hover:bg-[#7a6010] transition-all flex items-center gap-2 group flex-shrink-0 shadow-md">
{t("gemstone.visit_store")}<Sparkles className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-gray-600 text-center max-w-2xl text-[13px]">
{t("gemstone.need_personalized_guidance_on")}
                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Link href="/astrologers-chat" className="px-8 py-3.5 bg-white text-gray-900 border border-[#d6c89a] font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
{t("gemstone.talk_to_expert_gemologist")}
                  </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);

  }

  // ── FORM VIEW (with full info content below) ───────────────────────────────
  return (
    <div className="min-h-screen py-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
                <style jsx>{`
                    .gemstone-page { font-family: 'Inter', sans-serif; }
                `}</style>

            <div className="max-w-5xl mx-auto px-6 gemstone-page">

                {/* Top nav */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/free-reports" className="text-[#b8962e] hover:text-[#7a6010] font-bold flex items-center gap-2 text-sm">
                        <ChevronLeft className="w-4 h-4" />{t("gemstone.back_to_reports")}
          </Link>
                    <Link href="/free-reports/history" className="text-gray-500 hover:text-[#b8962e] font-bold flex items-center gap-2 text-sm transition-colors">
                        <Clock className="w-4 h-4" />{t("gemstone.view_history")}
          </Link>
                </div>

                {/* Hero text — styled like the reference image */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
{t("gemstone.birthstones_and_their_effects")}
          </h1>
                    <h2 className="text-xl text-gray-700 mb-3">
{t("gemstone.find_your_lucky_stone_accordin")}
          </h2>
                    <p className="text-[14px] text-gray-500 max-w-3xl mx-auto leading-relaxed">
{t("gemstone.see_how_gemstones_can_change_y")}
          </p>
                </div>

                {/* Form — compact, centred */}
                <div className="max-w-2xl mx-auto">
                    <FreeReportForm
            title="Enter Your Birth Details"
            subtitle=""
            loading={loading}
            onSubmit={handleSubmit}
            buttonText="Submit"
            compact />
          
                </div>

                {/* ── All descriptive content below the form ── */}
                <GemstoneInfoSections />

            </div>
        </div>);

}