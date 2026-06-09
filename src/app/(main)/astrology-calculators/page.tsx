'use client';
import { useTranslation } from '@/context/LanguageContext';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, Heart, Book, Star, Clock, Calendar,
  Sparkles, Compass, ChevronRight, Moon, Type } from
'lucide-react';

const CALCULATORS = [
{
  title: 'Numerology Calculator',
  desc: 'Sacred Chaldean and Vedic vibration analysis for your name and birth date.',
  icon: Type,
  href: '/numerology',
  iconColor: 'text-violet-600',
  iconBg: 'bg-violet-50'
},
{
  title: 'Moon Sign Calculator',
  desc: 'Discover deep subconscious traits using authentic astronomical positioning data.',
  icon: Moon,
  href: '/moon-signs?new=true',
  iconColor: 'text-indigo-600',
  iconBg: 'bg-indigo-50'
},
{
  title: 'Rashi Calculator',
  desc: 'Identifies your Janma Rashi using precise birth time and location data.',
  icon: Compass,
  href: '/rashi-calculator?new=true',
  iconColor: 'text-blue-600',
  iconBg: 'bg-blue-50'
},
{
  title: 'Love Calculator',
  desc: 'Vibrational and zodiac matching engine for deep insight into romantic compatibility.',
  icon: Heart,
  href: '/compatibility?mode=love&new=true',
  iconColor: 'text-rose-600',
  iconBg: 'bg-rose-50'
},
{
  title: 'Kundli Generation',
  desc: 'Detailed birth chart with complete planetary positions and house analysis.',
  icon: FileText,
  href: '/kundli',
  iconColor: 'text-orange-600',
  iconBg: 'bg-orange-50'
},
{
  title: 'Horoscope Matching',
  desc: 'Detailed 36-point Guna Milan compatibility check for marriage and partnership.',
  icon: Heart,
  href: '/horoscope-matching',
  iconColor: 'text-red-600',
  iconBg: 'bg-red-50'
},
{
  title: 'Lal Kitab Reading',
  desc: 'Remedial insights and planetary analysis from the legendary Red Book tradition.',
  icon: Book,
  href: '/lal-kitab',
  iconColor: 'text-pink-700',
  iconBg: 'bg-pink-50'
},
{
  title: 'Muhurat Finder',
  desc: 'Discover the most auspicious Shubh Muhurat timings for important life events.',
  icon: Clock,
  href: '/muhurat',
  iconColor: 'text-amber-600',
  iconBg: 'bg-amber-50'
},
{
  title: 'Chinese Horoscope',
  desc: 'Discover your Eastern zodiac sign and explore yearly destiny projections.',
  icon: Star,
  href: '/chinese-horoscope',
  iconColor: 'text-red-700',
  iconBg: 'bg-red-50'
},
{
  title: 'Panchang & Rahu Kaal',
  desc: 'Daily Tithi, Nakshatra, and essential inauspicious Rahu Kaal timings.',
  icon: Calendar,
  href: '/panchang',
  iconColor: 'text-stone-600',
  iconBg: 'bg-stone-100'
}];


export default function AstrologyCalculatorsPage() {
    const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fdf8f0' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        .calc-hub { font-family: 'Inter', sans-serif; }
        .calc-hub .serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <div className="max-w-5xl mx-auto pt-12 md:pt-20 calc-hub">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-[#9a7b2f] text-[11px] font-semibold tracking-widest uppercase mb-4">
            
            <span className="w-1.5 h-1.5 rounded-full bg-[#9a7b2f]" />
{t("astrology_calculators.vedic_precision_tools")}
            <span className="w-1.5 h-1.5 rounded-full bg-[#9a7b2f]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="serif text-4xl md:text-5xl font-semibold text-[#1a1208] mb-4 leading-tight">
{t("astrology_calculators.astrology")}
            <span className="text-[#9a7b2f]">{t("astrology_calculators.calculators")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-[#5a4a2a] text-[15px] leading-relaxed max-w-xl mx-auto">
{t("astrology_calculators.a_complete_suite_of_vedic_tool")}


          </motion.p>
        </div>

        {/* Grid — seamless bordered grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden mb-12"
          style={{ background: '#e8dfc7', border: '1px solid #e8dfc7' }}>
          
          {CALCULATORS.map((calc, i) =>
          <motion.div
            key={calc.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}>
            
              <Link
              href={calc.href}
              className="group flex flex-col gap-2.5 p-6 h-full transition-colors duration-200"
              style={{ background: '#fdf8f0' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fdf8f0'}>
              
                <div className={`w-9 h-9 ${calc.iconBg} ${calc.iconColor} rounded-lg flex items-center justify-center`}>
                  <calc.icon size={18} strokeWidth={1.75} />
                </div>

                <h3 className="text-[15px] font-semibold text-[#1a1208] leading-snug group-hover:text-[#9a7b2f] transition-colors">
                  {calc.title}
                </h3>

                <p className="text-[13px] text-[#6b5635] leading-relaxed flex-1">
                  {calc.desc}
                </p>

                <span className="text-[11px] font-semibold text-[#9a7b2f] tracking-wider uppercase mt-1">
{t("astrology_calculators.explore")}
              </span>
              </Link>
            </motion.div>
          )}

         {Array.from({ length: (3 - CALCULATORS.length % 3) % 3 }).map((_, i) =>
          <div
            key={`filler-${i}`}
            className="hidden lg:block"
            style={{ background: '#fdf8f0' }}
            aria-hidden />

          )}

        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-dashed border-[#d6c48a] bg-white/50 p-10 text-center">
          
          <Sparkles className="w-6 h-6 text-[#9a7b2f] mx-auto mb-3" />
          <h2 className="serif text-[22px] font-semibold text-[#1a1208] mb-2">
{t("astrology_calculators.need_a_personalized_reading")}
          </h2>
          <p className="text-[14px] text-[#6b5635] mb-6 max-w-md mx-auto">
{t("astrology_calculators._while_calculators_provide_pre")}
          </p>
          <Link
            href="/astrologers-chat"
            className="inline-flex items-center gap-2 bg-[#7A1F01] hover:bg-[#922501] text-white px-6 py-3 rounded-xl text-[14px] font-semibold transition-colors">
{t("astrology_calculators.chat_with_an_astrologer")}

            <ChevronRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>);

}