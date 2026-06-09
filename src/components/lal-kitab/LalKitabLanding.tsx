'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { 
  Sparkles, 
  Shield, 
  Award,
  Crown,
  BookOpen,
  Compass,
  Zap,
  Star,
  ChevronRight,
  Sun,
  Moon,
  Flower2,
  Coins,
  Droplets,
  Flame
} from 'lucide-react';

interface LalKitabLandingProps {
  onStart: () => void;
}

const LalKitabLanding = ({ onStart }: LalKitabLandingProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8 md:pt-16 pb-0 lk-landing">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

        .lk-landing * {
          font-family: 'Source Sans 3', sans-serif;
        }
        .lk-landing h1, 
        .lk-landing h2,
        .lk-landing h3,
        .lk-landing .serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .lk-divider {
          border: none;
          border-top: 1px solid rgba(184, 150, 46, 0.25);
          margin: 0;
        }
        .lk-remedy-card {
          padding: 20px 24px;
          border-radius: 14px;
          border: 1px solid rgba(184, 150, 46, 0.2);
          background: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .lk-planet-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
          border: 1px solid rgba(184, 150, 46, 0.3);
          color: #92720a;
          background: rgba(184, 150, 46, 0.08);
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="mb-12 text-center relative pt-12 pb-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(184,150,46,0.1)_0%,_transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.04] pointer-events-none -z-10 overflow-hidden">
          <div className="w-[500px] h-[500px] border-[40px] border-double border-[#b8962e] rounded-full animate-[spin_180s_linear_infinite]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-[#b8962e] text-sm font-semibold mb-5 tracking-widest uppercase"
        >
          <Crown className="w-4 h-4" />
          <span className="serif">{t("lal_kitab.ancient_remedial_wisdom")}</span>
          <Crown className="w-4 h-4" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold text-gray-900 mb-5 leading-tight serif"
        >
          {t("lal_kitab.lal_kitab")} <span className="text-[#b8962e]">{t("lal_kitab.generator")}</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-700 text-[19px] leading-relaxed max-w-2xl mx-auto mb-8 font-medium"
        >
          {t("lal_kitab.landing_desc")}
        </motion.p>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 py-3 px-6 rounded-2xl bg-white/40 border border-white/60 shadow-sm backdrop-blur-sm max-w-fit mx-auto"
        >
          <div className="flex items-center gap-2 text-[15px] text-gray-700 font-semibold">
            <Shield className="w-4 h-4 text-[#b8962e]" />
            <span>{t("lal_kitab.secure")}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2 text-[15px] text-gray-700 font-semibold">
            <Award className="w-4 h-4 text-[#b8962e]" />
            <span>{t("lal_kitab.accurate")}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2 text-[15px] text-gray-700 font-semibold">
            <Sparkles className="w-4 h-4 text-[#b8962e]" />
            <span>{t("lal_kitab.remedial")}</span>
          </div>
        </motion.div>
      </div>

      {/* ── Content Sections ── */}
      <div className="space-y-0 mt-16 mb-8">

        {/* What is Lal Kitab */}
        <section className="py-14">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-6 serif text-center">{t("lal_kitab.what_is_lal_kitab")}</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed text-[18px] text-center">
            <p>
              {t("lal_kitab.what_desc_1")}
            </p>
            <p>
              {t("lal_kitab.what_desc_2")}
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-14">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-10 serif text-center">{t("lal_kitab.core_pillars")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Practical Remedies",
                desc: "Simple behavioral changes and symbolic gestures designed to shift your planetary energy.",
                icon: Shield,
                color: "text-red-600",
                bg: "bg-red-50"
              },
              {
                title: "Unique House Logic",
                desc: "Discover how your planets act as 'guests' within the 12 houses of your destiny.",
                icon: Compass,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                title: "Expert AI Rules",
                desc: "Access a library of knowledge previously held only by master Lal Kitab astrologers.",
                icon: Zap,
                color: "text-amber-600",
                bg: "bg-amber-50"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-[#d6c89a]/40 bg-white/50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.bg} ${feature.color}`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-[19px] font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-[16px] text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How Lal Kitab Differs */}
        <section className="py-14">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 serif text-center">{t("lal_kitab.how_it_differs")}</h2>
          <p className="text-center text-gray-700 text-[17px] max-w-xl mx-auto mb-10">
          </p>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                vedic: "Uses complex Dasha periods & transits",
                lk: "Reads the static birth chart alone",
                label: "Time System"
              },
              {
                vedic: "Gemstones & Mantras as primary remedies",
                lk: "Simple household items & acts of charity",
                label: "Remedy Type"
              },
              {
                vedic: "Rashi (sign) is the primary lens",
                lk: "Bhava (house) is everything — signs are secondary",
                label: "Core Focus"
              },
              {
                vedic: "Planets exert independent influences",
                lk: "Planets interact as 'guests' affecting the host house",
                label: "Planet Logic"
              }
            ].map((row, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[#d6c89a]/30 bg-white/40">
                <p className="text-[12px] font-bold tracking-widest uppercase text-[#b8962e] mb-3">{row.label}</p>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 text-[15px] text-gray-500 leading-snug">
                    <span className="block text-[11px] uppercase font-semibold mb-1 text-gray-400">{t("lal_kitab.vedic")}</span>
                    {row.vedic}
                  </div>
                  <div className="w-px self-stretch bg-[#d6c89a]/40" />
                  <div className="flex-1 text-[15px] text-gray-700 leading-snug">
                    <span className="block text-[11px] uppercase font-semibold mb-1 text-[#b8962e]">{t("lal_kitab.lal_kitab")}</span>
                    {row.lk}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9 Planets Overview */}
        <section className="py-14">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 serif text-center">{t("lal_kitab.nine_planets_role")}</h2>
          <p className="text-center text-gray-700 text-[17px] max-w-xl mx-auto mb-10">
            {t("lal_kitab.nine_planets_desc")}
          </p>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { planet: "Sun (Surya)", rules: "Soul, father, authority, government", remedy: "Respect elders & avoid ego", color: "text-orange-600 bg-orange-50" },
              { planet: "Moon (Chandra)", rules: "Mind, mother, emotions, water", remedy: "Offer milk to the needy", color: "text-blue-500 bg-blue-50" },
              { planet: "Mars (Mangal)", rules: "Energy, siblings, land, courage", remedy: "Plant a red flower garden", color: "text-red-600 bg-red-50" },
              { planet: "Mercury (Budh)", rules: "Intelligence, communication, business", remedy: "Feed green vegetables to cows", color: "text-green-600 bg-green-50" },
              { planet: "Jupiter (Guru)", rules: "Wisdom, children, wealth, religion", remedy: "Serve Brahmins & teachers", color: "text-yellow-600 bg-yellow-50" },
              { planet: "Venus (Shukra)", rules: "Love, luxury, beauty, marriage", remedy: "Respect women in your life", color: "text-pink-500 bg-pink-50" },
              { planet: "Saturn (Shani)", rules: "Karma, discipline, servants, delays", remedy: "Feed oil to a peepal tree", color: "text-gray-600 bg-gray-100" },
              { planet: "Rahu", rules: "Illusion, foreign, technology, ambition", remedy: "Donate items to orphanages", color: "text-indigo-600 bg-indigo-50" },
              { planet: "Ketu", rules: "Spirituality, detachment, past karma", remedy: "Keep a dog & care for it", color: "text-purple-600 bg-purple-50" },
            ].map((p, i) => (
              <div key={i} className="p-5 rounded-xl border border-[#d6c89a]/30 bg-white/50 hover:bg-white hover:shadow-md transition-all">
                <p className={`text-[13px] font-bold px-2.5 py-1 rounded-full inline-block mb-3 ${p.color}`}>{p.planet}</p>
                <p className="text-[15px] text-gray-700 font-medium leading-snug mb-1">{p.rules}</p>
                <p className="text-[13px] text-gray-600 leading-snug">Upaya: {p.remedy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Types of Upayas */}
        <section className="py-14">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 serif text-center">{t("lal_kitab.types_of_upayas")}</h2>
          <p className="text-center text-gray-700 text-[17px] max-w-xl mx-auto mb-10">
            {t("lal_kitab.types_of_upayas_desc")}
          </p>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                icon: Droplets,
                title: "Charity (Daan)",
                desc: "Donating specific items linked to a planet on its ruling weekday is one of the most powerful Lal Kitab techniques. For example, donating mustard oil on Saturdays for Saturn.",
                color: "text-blue-500 bg-blue-50"
              },
              {
                icon: Flower2,
                title: "Behavioral Changes",
                desc: "Lal Kitab is unique in prescribing changes in daily conduct — like respecting one's mother to strengthen Moon, or avoiding non-vegetarian food on specific days.",
                color: "text-green-600 bg-green-50"
              },
              {
                icon: Flame,
                title: "Symbolic Acts (Tona)",
                desc: "Simple household rituals using common items — flowing water, burning camphor, or burying copper coins — are used to neutralize malefic planetary effects.",
                color: "text-orange-500 bg-orange-50"
              },
              {
                icon: Coins,
                title: "Feeding Animals & Birds",
                desc: "Animals are planetary symbols. Feeding crows (Saturn), fish (Ketu), cows (Venus/Mercury), or dogs (Mars/Ketu) appeases the corresponding Graha.",
                color: "text-amber-600 bg-amber-50"
              },
            ].map((u, i) => (
              <div key={i} className="lk-remedy-card">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${u.color}`}>
                  <u.icon size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-1">{u.title}</h3>
                  <p className="text-[16px] text-gray-600 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 12 Houses */}
        <section className="py-14">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 serif text-center">{t("lal_kitab.twelve_houses")}</h2>
          <p className="text-center text-gray-700 text-[17px] max-w-xl mx-auto mb-10">
            {t("lal_kitab.twelve_houses_desc")}
          </p>
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { num: "1st", name: "Lagna", governs: "Self, personality, health" },
              { num: "2nd", name: "Dhana", governs: "Wealth, speech, family" },
              { num: "3rd", name: "Sahaja", governs: "Siblings, courage, short travel" },
              { num: "4th", name: "Sukha", governs: "Mother, home, vehicles" },
              { num: "5th", name: "Putra", governs: "Children, intellect, past life" },
              { num: "6th", name: "Shatru", governs: "Enemies, debt, diseases" },
              { num: "7th", name: "Kalatra", governs: "Marriage, partnerships, public" },
              { num: "8th", name: "Mrityu", governs: "Longevity, secrets, inheritance" },
              { num: "9th", name: "Bhagya", governs: "Luck, religion, father, dharma" },
              { num: "10th", name: "Karma", governs: "Career, status, authority" },
              { num: "11th", name: "Labha", governs: "Gains, elder siblings, desires" },
              { num: "12th", name: "Vyaya", governs: "Loss, liberation, foreign lands" },
            ].map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-[#d6c89a]/30 bg-white/40 hover:bg-white hover:shadow-md transition-all text-center">
                <p className="text-[20px] font-bold text-[#b8962e] serif mb-0.5">{h.num}</p>
                <p className="text-[15px] font-semibold text-gray-800 mb-1">{h.name}</p>
                <p className="text-[13px] text-gray-600 leading-snug">{h.governs}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-14 pb-4">
          <hr className="lk-divider mb-14" />
          <h2 className="text-4xl font-semibold text-gray-900 mb-10 serif text-center">{t("lal_kitab.faqs")}</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Do I need to know my exact birth time?",
                a: "Yes, birth time is essential for accurate Lal Kitab analysis. Even a 30-minute difference can shift planetary house positions, which is the core of any Lal Kitab reading."
              },
              {
                q: "Are the remedies expensive or difficult?",
                a: "No — that is the hallmark of Lal Kitab. Most remedies involve everyday items like wheat, copper coins, mustard oil, or simple acts like feeding animals. No expensive gemstones are required."
              },
              {
                q: "How soon do Lal Kitab remedies work?",
                a: "Many practitioners report results within 43 days of consistent practice, which is why Lal Kitab prescribes remedies for 43-day uninterrupted cycles. Results vary by planetary strength and sincerity."
              },
              {
                q: "Is Lal Kitab based on Western or Vedic astrology?",
                a: "Lal Kitab is rooted in the Vedic tradition but uses the Lagna chart without divisional charts. It borrows some concepts from Samudrik Shastra (palmistry) and folk astrology of the Punjab region."
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-[#d6c89a]/30 pb-6 last:border-0">
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-[16px] text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>



      </div>
    </div>
  );
};

export default LalKitabLanding;