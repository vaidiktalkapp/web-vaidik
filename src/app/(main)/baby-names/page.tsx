'use client';
import { useTranslation } from '@/context/LanguageContext';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Baby, Sparkles, Star, Download, Search } from 'lucide-react';
import { downloadAsPDF } from '@/lib/pdfGenerator';
import Link from 'next/link';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const NAKSHATRAS = [
'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu', 'Pushyami',
'Aslesha', 'Magha', 'P.Phalguni', 'U.Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
'Anuradha', 'Jyeshta', 'Moola', 'P.Shadha', 'U.Shadha', 'Sravana', 'Dhanishta', 'Satabishak',
'P.Bhadra', 'U.Bhadra', 'Revati'];


const ZODIAC_SIGNS = [
{ name: 'Aries', hindi: 'मेष', emoji: '♈', dates: 'Mar 21 - Apr 19' },
{ name: 'Taurus', hindi: 'वृषभ', emoji: '♉', dates: 'Apr 20 - May 20' },
{ name: 'Gemini', hindi: 'मिथुन', emoji: '♊', dates: 'May 21 - Jun 20' },
{ name: 'Cancer', hindi: 'कर्क', emoji: '♋', dates: 'Jun 21 - Jul 22' },
{ name: 'Leo', hindi: 'सिंह', emoji: '♌', dates: 'Jul 23 - Aug 22' },
{ name: 'Virgo', hindi: 'कन्या', emoji: '♍', dates: 'Aug 23 - Sep 22' },
{ name: 'Libra', hindi: 'तुला', emoji: '♎', dates: 'Sep 23 - Oct 22' },
{ name: 'Scorpio', hindi: 'वृश्चिक', emoji: '♏', dates: 'Oct 23 - Nov 21' },
{ name: 'Sagittarius', hindi: 'धनु', emoji: '♐', dates: 'Nov 22 - Dec 21' },
{ name: 'Capricorn', hindi: 'मकर', emoji: '♑', dates: 'Dec 22 - Jan 19' },
{ name: 'Aquarius', hindi: 'कुम्भ', emoji: '♒', dates: 'Jan 20 - Feb 18' },
{ name: 'Pisces', hindi: 'मीन', emoji: '♓', dates: 'Feb 19 - Mar 20' }];


export default function BabyNamesPage() {
    const { t } = useTranslation();

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6"
      style={{ backgroundColor: '#fdf6e3', fontFamily: "'Inter', sans-serif" }}>
      
      <style jsx global>{`
        .bn-serif { font-family: 'Inter', sans-serif; }

        .bn-section {
          background: #ffffff;
          border: 0.5px solid rgba(184,150,46,0.25);
          border-radius: 20px;
          padding: 20px 24px 18px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .bn-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(184,150,46,0.55), transparent);
        }

        .bn-alpha-btn {
          height: 34px;
          width: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .bn-alpha-btn.boy {
          background: #f0f7ff;
          border: 0.5px solid #c7dff7;
          color: #3b82f6;
        }
        .bn-alpha-btn.boy:hover {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
          transform: scale(1.08);
        }
        .bn-alpha-btn.girl {
          background: #fff0f5;
          border: 0.5px solid #fbcfe8;
          color: #ec4899;
        }
        .bn-alpha-btn.girl:hover {
          background: #ec4899;
          color: #fff;
          border-color: #ec4899;
          transform: scale(1.08);
        }

        .bn-nak-btn {
          padding: 10px 14px;
          text-align: left;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 0.5px solid rgba(184,150,46,0.2);
          background: #fdfaf3;
          color: #7a5e14;
          text-decoration: none;
          display: block;
        }
        .bn-nak-btn:hover {
          background: #b8962e;
          color: #fff;
          border-color: #b8962e;
          transform: translateY(-1px);
        }

        .bn-zod-btn {
          padding: 16px 14px 14px;
          text-align: left;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 0.5px solid rgba(184,150,46,0.2);
          background: #fdfaf3;
          text-decoration: none;
          display: block;
        }
        .bn-zod-btn:hover {
          background: #b8962e;
          border-color: #b8962e;
          transform: translateY(-1px);
        }
        .bn-zod-btn:hover .zod-name,
        .bn-zod-btn:hover .zod-hindi { color: #fff !important; }
      `}</style>

      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-0">

          {/* Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 pb-2">
            <div>
              <div className="flex items-center justify-start gap-2 text-[#b8962e] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
                <Crown className="w-3 h-3" />
                <span className="bn-serif">{t("baby_names.vedic_name_directory")}</span>
                <Crown className="w-3 h-3" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight bn-serif">
  {t("baby_names.baby")}<span style={{ color: '#b8962e' }}>{t("baby_names.names")}</span>
              </h1>
              <p className="text-gray-600 text-[15px] leading-relaxed font-medium max-w-2xl">
  {t("baby_names.baby_birth_is_most_delightful")}
              </p>
            </div>

             <button
                onClick={() => downloadAsPDF('baby-names-directory', { filename: t("baby_names.vedic_baby_names_directory_fil") })}
                className="flex items-center gap-2 px-6 py-3 bg-[#b8962e] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#8f7422] transition-all self-start md:self-auto"
            >
                <Download className="w-4 h-4" /> {t("baby_names.download_directory_pdf")}
            </button>
          </div>

          {/* ── Search Bar ── */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#d6c89a]/50 mt-4 mb-10 flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 w-full">
                <form action="/baby-names/search" method="GET" className="relative flex items-center">
                   <Search className="absolute left-4 text-[#b8962e] w-5 h-5" />
                   <input 
                     type="text" 
                     name="q" 
                     placeholder={t("baby_names.search_placeholder") || "Search thousands of baby names..."} 
                     className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#d6c89a]/40 focus:outline-none focus:ring-2 focus:ring-[#b8962e] text-[#7a6010] bg-[#fdfaf3] font-medium text-[15px]"
                     required
                   />
                   <button type="submit" className="absolute right-2 px-6 py-2.5 bg-[#b8962e] text-white rounded-lg font-bold text-sm shadow-md hover:bg-[#8f7422] transition-all">
                     Search
                   </button>
                </form>
             </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(184,150,46,0.4), transparent)' }} />
            <div className="w-1.5 h-1.5 rotate-45 rounded-sm" style={{ background: '#b8962e' }} />
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(184,150,46,0.4), transparent)' }} />
          </div>

          <div id="baby-names-directory">
            {/* ── Boy Names ── */}
            <div className="bn-section">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: '#eff6ff', border: '0.5px solid #bfdbfe' }}>
                  
                  👦
                </div>
                <div>
                  <p className="bn-serif text-[17px] font-bold m-0" style={{ color: '#1c1509' }}>{t("baby_names.boy_names")}</p>
                  <p className="text-xs m-0" style={{ color: '#9d8850' }}>{t("baby_names.select_a_letter_to_browse_boy")}</p>
                </div>
              </div>
              <div className="grid grid-cols-9 sm:grid-cols-13 gap-1">
                {ALPHABET.map((letter) =>
                <Link key={`boy-${letter}`} href={`/baby-names/alphabet/${letter}?gender=Boy`} className="bn-alpha-btn boy">
                    {letter}
                  </Link>
                )}
              </div>
            </div>

            {/* ── Girl Names ── */}
            <div className="bn-section">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: '#fff0f5', border: '0.5px solid #fbcfe8' }}>
                  
                  👧
                </div>
                <div>
                  <p className="bn-serif text-[17px] font-bold m-0" style={{ color: '#1c1509' }}>{t("baby_names.girl_names")}</p>
                  <p className="text-xs m-0" style={{ color: '#9d8850' }}>{t("baby_names.select_a_letter_to_browse_girl")}</p>
                </div>
              </div>
              <div className="grid grid-cols-9 sm:grid-cols-13 gap-1">
                {ALPHABET.map((letter) =>
                <Link key={`girl-${letter}`} href={`/baby-names/alphabet/${letter}?gender=Girl`} className="bn-alpha-btn girl">
                    {letter}
                  </Link>
                )}
              </div>
            </div>

            {/* ── Nakshatra ── */}
            <div className="bn-section">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: '#fdf3de', border: '0.5px solid rgba(184,150,46,0.3)' }}>
                  
                  ✦
                </div>
                <div>
                  <p className="bn-serif text-[17px] font-bold m-0" style={{ color: '#1c1509' }}>{t("baby_names.find_by_nakshatra")}</p>
                  <p className="text-xs m-0" style={{ color: '#9d8850' }}>{t("baby_names.moon_s_nakshatra_determines_au")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {NAKSHATRAS.map((nak) =>
                <Link key={nak} href={`/baby-names/nakshatra/${encodeURIComponent(nak)}`} className="bn-nak-btn">
                    {nak}
                  </Link>
                )}
              </div>
            </div>

            {/* ── Zodiac ── */}
            <div className="bn-section">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: '#fdf3de', border: '0.5px solid rgba(184,150,46,0.3)' }}>
                  
                  ♈
                </div>
                <div>
                  <p className="bn-serif text-[17px] font-bold m-0" style={{ color: '#1c1509' }}>{t("baby_names.find_by_zodiac_sign_rasi")}</p>
                  <p className="text-xs m-0" style={{ color: '#9d8850' }}>{t("baby_names.astrologically_aligned_names_b")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {ZODIAC_SIGNS.map((sign) =>
                <Link key={sign.name} href={`/baby-names/zodiac/${sign.name}`} className="bn-zod-btn">
                    <span style={{ fontSize: 22, display: 'block', marginBottom: 4, lineHeight: 1 }}>{sign.emoji}</span>
                    <span className="zod-name block text-[12.5px] font-semibold" style={{ color: '#7a5e14' }}>{t(`baby_names.zodiac.${sign.name}`)}</span>
                    <div className="flex justify-between items-baseline mt-px">
                      <span className="zod-hindi block text-[11px]" style={{ color: '#b8962e' }}>{t(`baby_names.zodiac.${sign.name}`)}</span>
                      <span className="text-[10px] opacity-70" style={{ color: '#b8962e' }}>{sign.dates}</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>);

}