'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ArrowLeft, Baby, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface BabyName {
  _id: string;
  name: string;
  meaning: string;
  gender: string;
  zodiacSign?: string;
  nakshatra?: string;
  origin?: string;
  nameLength?: number;
  numerologyNumber?: number;
}

function SearchContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const genderFilter = searchParams.get('gender') || 'all';

  const [names, setNames] = useState<BabyName[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    if (q) {
      fetchNames();
    } else {
      setLoading(false);
    }
  }, [q, page, genderFilter]);

  const fetchNames = async () => {
    setLoading(true);
    try {
      const genderParam = genderFilter !== 'all' ? `&gender=${genderFilter}` : '';
      const res = await fetch(`${API_BASE}/baby-names/search?q=${encodeURIComponent(q)}&page=${page}&limit=50${genderParam}`);
      const data = await res.json();
      if (data.success) {
        setNames(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.push(`/baby-names/search?q=${encodeURIComponent(searchInput)}&gender=${genderFilter}`);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 bg-[#fdf6e3]" style={{ backgroundColor: '#fdf6e3' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        .bn-wrap * { font-family: 'Source Sans 3', sans-serif; }
        .bn-wrap h1, .bn-wrap h2, .bn-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
      ` }} />

      <div className="max-w-6xl bn-wrap space-y-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Back + Header */}
          <div className="text-left">
            <Link href="/baby-names" className="inline-flex items-center gap-2 text-[#b8962e] text-sm font-semibold hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" />{t("_letter_.back_to_baby_names")}
            </Link>
            <div className="text-left">
              <div className="flex items-center justify-start gap-2 text-[#b8962e] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
                <Crown className="w-3 h-3" />
                <span className="serif">{t("baby_names.vedic_name_directory") || 'Vedic Name Directory'}</span>
                <Crown className="w-3 h-3" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 serif">
                Search Results for <span className="text-[#b8962e]">&ldquo;{q}&rdquo;</span>
              </h1>
              <p className="text-gray-500 text-sm">{total} {t("_letter_.names_found")}</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
             <input
               type="text"
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               placeholder="Search by name..."
               className="flex-1 px-4 py-3 rounded-xl border border-[#d6c89a]/50 focus:outline-none focus:ring-2 focus:ring-[#b8962e] bg-white text-[#7a6010] placeholder:text-[#d6c89a]"
             />
             <button type="submit" className="px-6 py-3 bg-[#b8962e] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#8f7422] transition-all">
                Search
             </button>
          </form>

          {/* Gender Filter */}
          <div className="flex justify-start gap-2">
            {['all', 'Boy', 'Girl', 'Unisex'].map((g) =>
            <button
              key={g}
              onClick={() => {
                setPage(1);
                router.push(`/baby-names/search?q=${encodeURIComponent(searchInput)}&gender=${g}`);
              }}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              genderFilter === g ?
              'bg-[#b8962e] text-white shadow-md' :
              'bg-white border border-[#d6c89a]/30 text-[#7a6010] hover:bg-[#f5e9c8]/50'}`
              }>
              
                {t(`common.${g.toLowerCase()}`)}
              </button>
            )}
          </div>

          {/* Results */}
          <div className="bg-white/70 backdrop-blur-sm border border-[#d6c89a] rounded-3xl p-6 md:p-8 shadow-lg shadow-[#b8962e]/5">
            <AnimatePresence mode="wait">
              {loading ?
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[#d6c89a]/20 border-t-[#b8962e] rounded-full animate-spin" />
                </motion.div> :
              names.length === 0 ?
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Baby className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 serif text-lg">{t("_letter_.no_names_found_for_this_select")}</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different search term or filter.</p>
                </motion.div> :

              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="overflow-x-auto rounded-2xl border border-[#d6c89a]/30 shadow-sm bg-white">
                    <table className="w-full text-left text-sm whitespace-normal border-collapse">
                      <thead className="bg-[#fdf6e3] border-b border-[#d6c89a]/50 text-[#7a6010]">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-[#d6c89a]/20">{t("_letter_.name")}</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-[#d6c89a]/20">{t("_letter_.length")}</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-[#d6c89a]/20">{t("_letter_.destiny_no")}</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-amber-900 uppercase tracking-widest border-r border-[#d6c89a]/10">{t("_letter_.gender")}</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-amber-900 uppercase tracking-widest border-r border-[#d6c89a]/10">{t("_letter_.rashi_zodiac")}</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-amber-900 uppercase tracking-widest border-r border-[#d6c89a]/10">{t("_letter_.nakshatra")}</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-amber-900 uppercase tracking-widest">{t("_letter_.meaning")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d6c89a]/10">
                        {names.map((item, i) =>
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.01 }}
                        className="hover:bg-[#fdf6e3]/30 transition-colors">
                        
                            <td className="px-6 py-3 font-bold text-[#b87333] border-r border-[#d6c89a]/10">
                              {item.name}
                            </td>
                            <td className="px-6 py-3 text-gray-600 border-r border-[#d6c89a]/10">
                              {item.nameLength || item.name.length}
                            </td>
                            <td className="px-6 py-3 text-gray-600 font-bold border-r border-[#d6c89a]/10">
                              {item.numerologyNumber || '—'}
                            </td>
                            <td className="px-6 py-3 border-r border-[#d6c89a]/10">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.gender === 'Boy' ? 'bg-blue-50 text-blue-600' :
                          item.gender === 'Girl' ? 'bg-pink-50 text-pink-600' :
                          'bg-purple-50 text-purple-600'}`
                          }>
                                  {t(`common.${item.gender.toLowerCase()}`)}
                                </span>
                            </td>
                            <td className="px-6 py-3 border-r border-[#d6c89a]/10">
                              <span className="text-[11px] font-bold text-amber-700 uppercase">{item.zodiacSign}</span>
                            </td>
                            <td className="px-6 py-3 border-r border-[#d6c89a]/10">
                              <span className="text-[10px] text-indigo-500 font-semibold uppercase">{item.nakshatra}</span>
                            </td>
                            <td className="px-6 py-3 text-gray-500 max-w-xs md:max-w-md">
                              {item.meaning}
                            </td>
                          </motion.tr>
                      )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 &&
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#d6c89a]/20">
                      <p className="text-xs text-gray-400 font-semibold">{t("_letter_.page")} {page} {t("common.upto") || 'of'} {totalPages}</p>
                      <div className="flex gap-2">
                        <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-4 py-2 rounded-xl border border-[#d6c89a]/30 text-sm font-semibold text-[#7a6010] hover:bg-[#f5e9c8]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1">
                      
                          <ChevronLeft className="w-4 h-4" />{t("_letter_.prev")}
                    </button>
                        <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 rounded-xl border border-[#d6c89a]/30 text-sm font-semibold text-[#7a6010] hover:bg-[#f5e9c8]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1">
{t("_letter_.next")}
                      <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                }
                </motion.div>
              }
            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </div>);

}

export default function BabyNameSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-20 flex flex-col items-center justify-center bg-[#fdf6e3]">
        <div className="w-12 h-12 border-4 border-[#d6c89a]/20 border-t-[#b8962e] rounded-full animate-spin mb-4" />
        <p className="text-[#b8962e] font-medium animate-pulse">Loading Search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
