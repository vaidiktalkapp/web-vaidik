'use client';
import { useTranslation } from '@/context/LanguageContext';

import React from 'react';
import Link from 'next/link';
import {
  Shield, Gem, Zap, ChevronRight, Sparkles, Clock,
  CheckCircle2, Star, BookOpen, Globe, Award } from
'lucide-react';

export default function FreeReportsPage() {
    const { t } = useTranslation();

  const reports = [
  {
    title: 'Kaal Sarp Yoga',
    description: 'Determine if your chart has the Kaal Sarp Dosha and identify its type and impact.',
    icon: <Shield className="w-8 h-8 text-rose-500" />,
    href: '/free-reports/kaal-sarp',
    color: 'rose',
    badge: 'Karmic Alert',
    features: ['Automatic Type Detection', 'House Placement Impact', 'Practical Remedies']
  },
  {
    title: 'Gemstone Recommendation',
    description: 'Find the perfect Life, Lucky, and Fortune stones tailored to your birth chart.',
    icon: <Gem className="w-8 h-8 text-blue-500" />,
    href: '/free-reports/gemstone',
    color: 'blue',
    badge: 'Most Popular',
    features: ['Life & Fortune Stones', 'Metal & Finger Analysis', 'Wear & Care Guide']
  },
  {
    title: 'Sade Sati Analysis',
    description: 'Detailed analysis of Shani’s influence on your Moon sign and current transit phase.',
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    href: '/free-reports/sade-sati',
    color: 'amber',
    badge: 'Transit Report',
    features: ['Phase Detection (Charan)', '120-Year Lifetime Map', 'Saturn Transit Guide']
  }];


  return (
    <div className="min-h-screen pt-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .hub-wrap { font-family: 'Source Sans 3', sans-serif; }
                .hub-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
            `}</style>

            <div className="max-w-6xl mx-auto px-6 hub-wrap">
                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#b8962e] text-[10px] font-black uppercase tracking-widest mb-4 border border-[#d6c89a]/30 shadow-sm">
                        <Sparkles className="w-4 h-4" />{t("free_reports.vedic_knowledge_hub")}
          </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("free_reports.free_astrology")}<span className="text-[#b8962e]">{t("free_reports.reports")}</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
{t("free_reports.access_our_high_precision_vedi")}
          </p>
                    <div className="flex justify-center gap-4 mt-8">
                        <Link
              href="/free-reports/history"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-gray-700 border border-[#d6c89a] text-[13px] font-bold hover:border-[#b8962e] hover:text-[#b8962e] transition-all shadow-sm">
              
                            <Clock className="w-4 h-4" />{t("free_reports.my_reports")}
            </Link>
                    </div>
                </div>

                {/* ── Report Cards ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reports.map((report) =>
          <Link
            key={report.title}
            href={report.href}
            className="group relative bg-white rounded-2xl p-5 border border-[#d6c89a] hover:border-[#b8962e] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
            
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-[#fdf6e3] group-hover:scale-110 transition-transform duration-300 text-[#b8962e]">
                                    {React.cloneElement(report.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-white text-gray-400 px-2.5 py-1 rounded-full border border-gray-100">
                                    {report.badge}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {report.title}
                            </h3>
                            
                            <p className="text-gray-500 text-[12px] leading-relaxed mb-4">
                                {report.description}
                            </p>

                            <div className="space-y-2 mb-6 flex-grow">
                                {report.features.map((feature, i) =>
              <div key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                        <span className="text-[11px] text-gray-700">{feature}</span>
                                    </div>
              )}
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[13px] font-bold text-gray-900 group-hover:text-[#b8962e] transition-colors">
                                <span>{t("free_reports.get_report")}</span>
                                <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#b8962e] group-hover:text-white transition-all">
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </Link>
          )}
                </div>

                {/* ── Educational Footer Sections ────────────────────────────── */}
                <div className="mt-24 space-y-20">
                    
                    {/* Deep Dive into Tools */}
                    <div className="space-y-16">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 serif mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
{t("free_reports.navigating_the_cosmic_tapestry")}
              </h2>
                            <p className="text-gray-500 text-[15px] leading-relaxed">
{t("free_reports.our_professional_vedic_reports")}
              </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Kaal Sarp Insight */}
                            <div className="space-y-4">
                                <div className="p-3 w-fit rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{t("free_reports.understanding_kaal_sarp")}</h3>
                                <p className="text-[14px] text-gray-600 leading-relaxed">
                                    <span className="text-[#c0392b] font-medium">{t("free_reports.kaal_sarp_dosha")}</span>{t("free_reports.occurs_when_all_seven_planets")}<span className="text-gray-900 font-semibold">{t("free_reports.anant")}</span> or <span className="text-gray-900 font-semibold">{t("free_reports.kulik")}</span>{t("free_reports._allows_for_targeted_remedies")}
                </p>
                            </div>

                            {/* Gemstone Insight */}
                            <div className="space-y-4">
                                <div className="p-3 w-fit rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                                    <Gem className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{t("free_reports.the_science_of_gemstones")}</h3>
                                <p className="text-[14px] text-gray-600 leading-relaxed">
{t("free_reports.every_authentic_gemstone_is_a")}<span className="text-[#c0392b] font-medium">{t("free_reports.storehouse_of_cosmic_energy")}</span>{t("free_reports._when_chosen_correctly_based_o")}<span className="text-gray-900 font-semibold">{t("free_reports.maraka")}</span>{t("free_reports._killer_house_can_be_detriment")}
                </p>
                            </div>

                            {/* Sade Sati Insight */}
                            <div className="space-y-4">
                                <div className="p-3 w-fit rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{t("free_reports.the_mystery_of_sade_sati")}</h3>
                                <p className="text-[14px] text-gray-600 leading-relaxed">
{t("free_reports.shani_saturn_is_the")}<span className="text-[#c0392b] font-medium">{t("free_reports.strict_teacher")}</span>{t("free_reports.of_the_zodiac_his_7_5_year_tra")}
                </p>
                            </div>
                        </div>
                    </div>

                    {/* Final CTA Strip */}
                    <div className="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-10 text-center border-t-4 border-[#b8962e] shadow-2xl relative overflow-hidden group">
                         <Sparkles className="absolute top-0 right-0 w-32 h-32 text-white opacity-[0.03] -translate-y-10 group-hover:rotate-12 transition-transform" />
                         <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-4 serif">{t("free_reports.need_deeper_personal_guidance")}</h2>
                            <p className="text-indigo-100/70 text-[15px] mb-8 leading-relaxed">
{t("free_reports.automated_reports_provide_tech")}
              </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/astrologers-chat" className="px-10 py-3 bg-[#b8962e] text-white font-black rounded-xl hover:bg-[#a68529] transition-all shadow-xl active:scale-95">
{t("free_reports.chat_with_an_expert")}
                </Link>
                                <Link href="/astrologers-call" className="px-10 py-3 bg-white/10 text-white border border-white/20 font-black rounded-xl hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
{t("free_reports.call_astrologer")}
                </Link>
                            </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>);

}