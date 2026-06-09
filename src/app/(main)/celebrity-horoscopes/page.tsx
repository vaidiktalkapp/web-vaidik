'use client';
import { useTranslation } from '@/context/LanguageContext';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Star, Loader2, Users, MapPin, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { celebrityService, CelebrityProfile } from '@/lib/celebrityService';

const CATEGORIES = [
'All', 'Bollywood', 'Hollywood', 'Sports', 'Cricket', 'Football', 'Hockey',
'Businessman', 'Politician', 'Musician', 'Singer', 'Literature',
'Criminal', 'Astrologer', 'Scientist', 'Others'];


export default function CelebrityListPage() {
    const { t } = useTranslation();

  const [celebrities, setCelebrities] = useState<CelebrityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCelebrities();
  }, []);

  const fetchCelebrities = async () => {
    try {
      setLoading(true);
      const data = await celebrityService.getCelebrities();
      setCelebrities(data);
    } catch (err) {
      console.error('Error fetching celebrities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = celebrities.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fdf6e3] w-full overflow-x-hidden flex flex-col">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        .celeb-list-wrap { font-family: 'Source Sans 3', sans-serif; }
        .celeb-list-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#121212] to-[#0a0a0a] py-8 md:py-12 px-4 border-b border-amber-500/10 mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(184,150,46,0.1)_0%,_transparent_70%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-20 mb-8">
            <div className="flex items-center justify-between">
                <Link href="/" className="text-white/40 hover:text-amber-400 font-bold flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-colors">
                    <ChevronLeft className="w-4 h-4" />{t("celebrity_horoscopes.back_to_home")}
            </Link>
                <div className="hidden md:flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Clock className="w-4 h-4" />{t("celebrity_horoscopes.celestial_records_v2")}
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Star size={12} fill="currentColor" />{t("celebrity_horoscopes.divine_alignments")}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white serif tracking-tight">
{t("celebrity_horoscopes.celebrity")}<span className="text-[#b8962e]">{t("celebrity_horoscopes.horoscopes")}</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg font-medium">
{t("celebrity_horoscopes.explore_the_cosmic_blueprints")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-20 relative z-20 celeb-list-wrap">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/20 border border-[#d6c89a]/30 p-4 md:p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Categories */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl overflow-x-auto w-full md:w-0 md:flex-1 no-scrollbar" suppressHydrationWarning>
              {CATEGORIES.map((cat) =>
              <button
                key={cat}
                suppressHydrationWarning
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat ?
                'bg-white text-[#b8962e] shadow-sm' :
                'text-gray-500 hover:text-gray-900'}`
                }>
                
                  {cat}
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search celebrity..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)} />
              
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ?
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-amber-500" size={40} />
            <p className="text-gray-500 font-medium">{t("celebrity_horoscopes.deciphering_star_charts")}</p>
          </div> :
        filtered.length === 0 ?
        <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 serif">{t("celebrity_horoscopes.no_profiles_found")}</h3>
            <p className="text-gray-500">{t("celebrity_horoscopes.try_adjusting_your_filters_or")}</p>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((celebrity) =>
          <Link
            key={celebrity._id}
            href={`/celebrity-horoscopes/${celebrity.slug}`}
            className="group flex flex-row items-center p-3 bg-white rounded-3xl border border-[#d6c89a]/30 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-500 transform hover:-translate-y-1">
            
                {/* Horizontal Image Capsule */}
                <div className="w-24 h-20 md:w-32 md:h-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 relative border border-gray-100/50">
                    {celebrity.image ?
              <img
                src={celebrity.image}
                alt={celebrity.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" /> :


              <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Users size={24} />
                    </div>
              }
                </div>

                {/* Minimal Content */}
                <div className="ml-4 flex-1 min-w-0 pr-2">
                  <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-1 line-clamp-1">
                    {celebrity.name}
                  </h3>
                  {celebrity.summary &&
              <p className="text-[10px] md:text-[11px] text-gray-400 line-clamp-1 mb-2">
                       {celebrity.summary}
                    </p>
              }
                  
                  <div className="text-[11px] md:text-xs text-gray-500 space-y-0.5">
                    <p className="truncate">
                      {celebrity.birthDate ? new Date(celebrity.birthDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown Date'}
                      {celebrity.birthTime ? ` at ${celebrity.birthTime}` : ''}
                    </p>
                    <p className="truncate text-gray-400">{celebrity.birthPlace || 'Unknown Location'}</p>
                  </div>
                </div>
              </Link>
          )}
          </div>
        }
      </div>

      {/* Why Listen Section */}
      <div className="bg-[#1a1a1a] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t("celebrity_horoscopes.the_stars_of_the_famous")}</h2>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base">
{t("celebrity_horoscopes.astrology_isn_t_just_for_predi")}



          </p>
        </div>
      </div>
    </div>);

}