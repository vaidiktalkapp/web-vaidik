import React from 'react';
import { motion } from 'framer-motion';
import { astrologyService } from '@/lib/astrologyService';

const ZODIAC_SIGNS = [
  { name: 'Aries',       symbol: '♈', date: 'Mar 21 - Apr 19', hindiName: 'Mesh (मेष)' },
  { name: 'Taurus',      symbol: '♉', date: 'Apr 20 - May 20', hindiName: 'Vrishabha (वृषभ)' },
  { name: 'Gemini',      symbol: '♊', date: 'May 21 - Jun 20', hindiName: 'Mithun (मिथुन)' },
  { name: 'Cancer',      symbol: '♋', date: 'Jun 21 - Jul 22', hindiName: 'Kark (कर्क)' },
  { name: 'Leo',         symbol: '♌', date: 'Jul 23 - Aug 22', hindiName: 'Singh (सिंह)' },
  { name: 'Virgo',       symbol: '♍', date: 'Aug 23 - Sep 22', hindiName: 'Kanya (कन्या)' },
  { name: 'Libra',       symbol: '♎', date: 'Sep 23 - Oct 22', hindiName: 'Tula (तुला)' },
  { name: 'Scorpio',     symbol: '♏', date: 'Oct 23 - Nov 21', hindiName: 'Vrishchik (वृश्चिक)' },
  { name: 'Sagittarius', symbol: '♐', date: 'Nov 22 - Dec 21', hindiName: 'Dhanu (धनु)' },
  { name: 'Capricorn',   symbol: '♑', date: 'Dec 22 - Jan 19', hindiName: 'Makar (मकर)' },
  { name: 'Aquarius',    symbol: '♒', date: 'Jan 20 - Feb 18', hindiName: 'Kumbh (कुंभ)' },
  { name: 'Pisces',      symbol: '♓', date: 'Feb 19 - Mar 20', hindiName: 'Meen (मीन)' },
];

const ZODIAC_LOVE_PROFILES = [
  {
    name: 'Aries',
    hindiName: 'Mesh (मेष)',
    symbol: '♈',
    element: 'Fire',
    rulingPlanet: 'Mars',
    loveTraits: 'Passionate, spontaneous, and bold in love. Aries takes the lead in relationships and thrives with a partner who matches their energy and enthusiasm.',
  },
  {
    name: 'Taurus',
    hindiName: 'Vrishabha (वृषभ)',
    symbol: '♉',
    element: 'Earth',
    rulingPlanet: 'Venus',
    loveTraits: 'Deeply loyal and sensual, Taurus seeks stability and long-lasting commitment. They express love through physical affection and acts of devotion.',
  },
  {
    name: 'Gemini',
    hindiName: 'Mithun (मिथुन)',
    symbol: '♊',
    element: 'Air',
    rulingPlanet: 'Mercury',
    loveTraits: 'Witty and communicative, Gemini needs mental stimulation in a relationship. They love playful banter and value intellectual connection above all.',
  },
  {
    name: 'Cancer',
    hindiName: 'Kark (कर्क)',
    symbol: '♋',
    element: 'Water',
    rulingPlanet: 'Moon',
    loveTraits: 'Nurturing and deeply emotional, Cancer loves with their whole heart. They create a warm, safe home environment and are incredibly devoted partners.',
  },
  {
    name: 'Leo',
    hindiName: 'Singh (सिंह)',
    symbol: '♌',
    element: 'Fire',
    rulingPlanet: 'Sun',
    loveTraits: 'Generous, romantic, and expressive, Leo loves grand gestures and being adored. They are fiercely loyal and bring warmth and passion to every relationship.',
  },
  {
    name: 'Virgo',
    hindiName: 'Kanya (कन्या)',
    symbol: '♍',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    loveTraits: 'Thoughtful and attentive, Virgo shows love through acts of service and careful attention to detail. They are reliable partners who value trust and honesty.',
  },
  {
    name: 'Libra',
    hindiName: 'Tula (तुला)',
    symbol: '♎',
    element: 'Air',
    rulingPlanet: 'Venus',
    loveTraits: 'Charming, romantic, and harmony-seeking, Libra thrives in balanced partnerships. They are natural peacemakers who bring grace and beauty to relationships.',
  },
  {
    name: 'Scorpio',
    hindiName: 'Vrishchik (वृश्चिक)',
    symbol: '♏',
    element: 'Water',
    rulingPlanet: 'Pluto',
    loveTraits: 'Intense and deeply passionate, Scorpio loves with profound loyalty. They seek transformative connections and value emotional depth and authenticity.',
  },
  {
    name: 'Sagittarius',
    hindiName: 'Dhanu (धनु)',
    symbol: '♐',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    loveTraits: 'Adventurous and free-spirited, Sagittarius seeks a partner who shares their love for exploration and growth. They bring joy, humor, and optimism to love.',
  },
  {
    name: 'Capricorn',
    hindiName: 'Makar (मकर)',
    symbol: '♑',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    loveTraits: 'Patient and deeply committed, Capricorn takes relationships seriously. They are dependable partners who build love slowly but with lasting, unshakeable foundations.',
  },
  {
    name: 'Aquarius',
    hindiName: 'Kumbh (कुंभ)',
    symbol: '♒',
    element: 'Air',
    rulingPlanet: 'Uranus',
    loveTraits: 'Unique and intellectually driven, Aquarius seeks a partner who respects their independence. They value friendship at the core of romance and love unconventionally.',
  },
  {
    name: 'Pisces',
    hindiName: 'Meen (मीन)',
    symbol: '♓',
    element: 'Water',
    rulingPlanet: 'Neptune',
    loveTraits: 'Dreamy, empathetic, and deeply romantic, Pisces gives selflessly in love. They are sensitive souls who seek soulmate connections and spiritual bonds.',
  },
];

interface ZodiacGridProps {
  onSelect: (sign: string) => void;
}

const ZodiacGrid: React.FC<ZodiacGridProps> = ({ onSelect }) => {
  const [dynamicProfiles, setDynamicProfiles] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await astrologyService.getZodiacProfiles();
        if (res.success && Array.isArray(res.data)) {
          setDynamicProfiles(res.data);
        }
      } catch (err) {
        console.error("Error loading zodiac profiles:", err);
      }
    };
    loadProfiles();
  }, []);

  const isUrl = (str: string) => {
    return str && (str.startsWith('http') || str.startsWith('/uploads') || str.includes('.'));
  };

  const profiles = dynamicProfiles.length > 0 ? dynamicProfiles : ZODIAC_SIGNS;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 love-grid-wrap">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        .love-grid-wrap * { font-family: 'Source Sans 3', sans-serif; }
        .love-grid-wrap h2, .love-grid-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
      `}} />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
          <span className="text-base serif">♥</span>
          <span className="serif">Daily Love Reading</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
          What Is My Love Horoscope?
        </h2>
        <p className="text-gray-600 text-base leading-relaxed max-w-xl">
          Select your zodiac sign to discover what the cosmos has planned for your{' '}
          <span className="serif text-gray-700">romantic journey</span> today.
        </p>
      </div>

      {/* Grid — fully transparent cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {profiles.map((sign) => (
          <motion.button
            key={sign.name || sign.sign}
            onClick={() => onSelect(sign.name || sign.sign)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border border-[#d6c89a] bg-transparent hover:border-[#b8962e] transition-all group text-center"
          >
            {/* Symbol/Image */}
            <div className="w-12 h-12 mb-2 flex items-center justify-center">
              {isUrl(sign.icon || sign.symbol) ? (
                <img 
                  src={sign.icon || sign.symbol} 
                  alt={sign.name || sign.sign} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                />
              ) : (
                <span
                  className="text-3xl text-[#b8962e] group-hover:bubble transition-all leading-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {sign.icon || sign.symbol}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center flex-grow justify-center mt-1">
              <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#b8962e] transition-colors tracking-wide text-center leading-none">
                {sign.name || sign.sign}
              </span>
              <span className="text-[12px] text-gray-600 font-semibold mt-1">
                {sign.hindiName || ZODIAC_SIGNS.find(s => s.name === (sign.name || sign.sign))?.hindiName || ''}
              </span>
            </div>

            <span className="serif text-[11px] text-gray-500 mt-2 group-hover:text-[#b8962e] transition-colors leading-tight">
              {sign.date || ZODIAC_SIGNS.find(s => s.name === (sign.name || sign.sign))?.date || ''}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Footer quote */}
      <div className="mt-10 p-7 border border-[#d6c89a] rounded-2xl text-center bg-transparent">
        <p className="text-gray-600 text-[15px] max-w-2xl mx-auto serif leading-relaxed">
          "Love is written in the stars, but it is lived in the heart. The cosmos illuminate the path — your choices, courage, and{' '}
          <span className="text-[#b8962e] font-semibold">commitment</span>{' '}
          make the journey unforgettable."
        </p>
      </div>

      {/* SEO Content Sections */}
      <div className="mt-16 space-y-12">

        {/* What is Love Horoscope */}
        <section className="border-t border-[#d6c89a]/50 pt-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4 serif">Love Horoscope — What Does It Mean?</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
            <p>
              A love horoscope is an astrological reading that reveals the influence of planetary positions on your romantic life, relationships, and emotional well-being. Based on your zodiac sign, it offers insights into compatibility, communication with your partner, the right time to express your feelings, and potential challenges you may face in love.
            </p>
            <p>
              Astrology has been used for thousands of years to understand human emotions and relationships. Each of the 12 zodiac signs carries distinct personality traits, and these traits deeply influence how a person loves, communicates, and bonds with their partner. A daily love horoscope takes into account the current position of planets like Venus — the planet of love — Mars, the Moon, and others to offer you a personalised romantic outlook for the day.
            </p>
            <p>
              Whether you are single, in a new relationship, or in a long-term commitment, your daily love horoscope can help you navigate your emotions, strengthen your bond, and make the most of the romantic energy available to you.
            </p>
          </div>
        </section>

        {/* How Planets Influence Love */}
        <section className="border-t border-[#d6c89a]/50 pt-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4 serif">How Planets Influence Your Love Life</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
            <p>
              In Vedic and Western astrology, certain planets hold special significance when it comes to love and relationships. Understanding their influence can give you deeper clarity about your romantic patterns and desires.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { planet: 'Venus', role: 'The planet of love, beauty, and pleasure. Venus governs attraction, romance, and how you express affection in a relationship.' },
                { planet: 'Mars', role: 'The planet of passion and desire. Mars drives physical attraction, sexual chemistry, and the courage to pursue love.' },
                { planet: 'Moon', role: 'Rules emotions and intuition. The Moon influences how emotionally connected you feel to your partner and your need for security.' },
                { planet: 'Jupiter', role: 'The planet of growth and abundance. Jupiter brings expansion, optimism, and long-term commitment to romantic relationships.' },
                { planet: 'Mercury', role: 'Governs communication. Mercury determines how clearly and effectively you express your feelings and resolve conflicts with your partner.' },
                { planet: 'Saturn', role: 'The planet of discipline and longevity. Saturn tests the strength of relationships and rewards those built on genuine trust and commitment.' },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl border border-[#d6c89a]/60 bg-transparent">
                  <p className="text-[14px] font-bold text-[#b8962e] mb-1">{item.planet}</p>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Love Traits by Zodiac */}
        <section className="border-t border-[#d6c89a]/50 pt-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2 serif">Love Traits of Each Zodiac Sign</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
            Every zodiac sign has a unique way of loving and being loved. Here is a brief overview of the romantic nature of all 12 signs.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-[#d6c89a]/60 bg-transparent">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d6c89a]/60">
                  <th className="p-4 text-[12px] font-black text-gray-400 uppercase tracking-wider">Sign</th>
                  <th className="p-4 text-[12px] font-black text-gray-400 uppercase tracking-wider">Element</th>
                  <th className="p-4 text-[12px] font-black text-gray-400 uppercase tracking-wider">Ruling Planet</th>
                  <th className="p-4 text-[12px] font-black text-gray-400 uppercase tracking-wider">Love Nature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6c89a]/30">
                {ZODIAC_LOVE_PROFILES.map((z, i) => (
                  <tr
                    key={i}
                    className="hover:bg-[#fdf6e3]/20 transition-colors cursor-pointer"
                    onClick={() => onSelect(z.name)}
                  >
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-[#b8962e] font-bold text-[15px] mr-2" style={{ fontFamily: 'Georgia, serif' }}>{z.symbol}</span>
                      <span className="font-semibold text-gray-800 text-[14px]">{z.name}</span>
                      <span className="text-gray-500 text-[12px] ml-1 font-medium">{z.hindiName}</span>
                    </td>
                    <td className="p-4 text-[14px] text-gray-600">{z.element}</td>
                    <td className="p-4 text-[14px] text-gray-600">{z.rulingPlanet}</td>
                    <td className="p-4 text-[13px] text-gray-600 leading-relaxed">{z.loveTraits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips for Using Love Horoscope */}
        <section className="border-t border-[#d6c89a]/50 pt-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4 serif">How to Use Your Daily Love Horoscope</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
            <p>
              Your daily love horoscope is a guide, not a guarantee. Here are a few ways to make the most of your reading:
            </p>
            <div className="space-y-3 mt-2">
              {[
                { title: 'Read it with an open mind', desc: 'Astrology offers perspective, not prediction. Use your reading as a lens to reflect on your emotions and relationship dynamics.' },
                { title: 'Pay attention to Venus and Moon transits', desc: 'These two celestial bodies have the greatest influence on your love life on any given day. Note when they change signs for a shift in romantic energy.' },
                { title: 'Apply insights to real situations', desc: 'If your horoscope advises patience today, think about where patience may benefit your relationship. If it speaks of opportunity, consider having that heartfelt conversation you have been postponing.' },
                { title: 'Combine with your partner\'s sign', desc: 'Reading both your sign and your partner\'s sign can offer a fuller picture of the day\'s relational dynamics and areas of harmony or tension.' },
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-[#d6c89a]/40">
                  <div className="w-7 h-7 rounded-full border border-[#b8962e] text-[#b8962e] text-[13px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-[14px] mb-1">{tip.title}</p>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ZodiacGrid;