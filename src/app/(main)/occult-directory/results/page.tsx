'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  AlertCircle,
  Loader,
  Sparkles,
  Filter,
  ArrowLeft,
  Search as SearchIcon,
  Users,
  Shield,
  Heart } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OccultSearchForm from '@/components/occult-directory/OccultSearchForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Astrologer {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  specializations: string[];
  languages: string[];
  gender?: string;
  experienceYears: number;
  pricing?: {
    chat: number;
    call: number;
    videoCall?: number;
  };
  ratings?: {
    average: number;
    total: number;
  };
  country?: string;
  bio?: string;
  city?: string;
}

interface DirectorySettings {
  cities: string[];
  popularCities: string[];
  expertise: string[];
  languages?: string[];
}

function ResultsContent() {
  const { t: T } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const expertiseParam = searchParams.get('expertise') || '';

  // State for data
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [dirSettings, setDirSettings] = useState<DirectorySettings>({
    cities: [],
    popularCities: [],
    expertise: [],
    languages: []
  });

  // State for loading/errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch directory settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/occult-directory/settings`);
        const data = await response.json();
        if (data.success) {
          setDirSettings(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch astrologers based on query params
  useEffect(() => {
    const fetchAstrologers = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          limit: '100',
          page: '1',
          ...(cityParam && { search: cityParam }),
          ...(expertiseParam && { skills: expertiseParam })
        });

        const response = await fetch(`${API_BASE}/astrologers/search?${queryParams.toString()}`);
        const data = await response.json();

        if (data.success) {
          let filtered = data.data.astrologers || [];
          if (cityParam) {
            filtered = filtered.filter((a: any) =>
            a.city?.toLowerCase().includes(cityParam.toLowerCase()) ||
            a.name?.toLowerCase().includes(cityParam.toLowerCase())
            );
          }
          setAstrologers(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch astrologers:', err);
        setError('Failed to load astrologers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAstrologers();
  }, [cityParam, expertiseParam]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ backgroundColor: '#fdf6e3' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        .results-wrap * { font-family: 'Source Sans 3', sans-serif; }
        .results-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
        
        .result-card {
            background: white;
            border: 1px solid #d6c89a;
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(184,150,46,0.04);
        }
        .result-card:hover {
            border-color: #b8962e;
            box-shadow: 0 10px 30px rgba(184,150,46,0.1);
            transform: translateY(-2px);
        }
        .sidebar-panel {
            background: white;
            border: 1px solid #d6c89a;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
      ` }} />

      <div className="max-w-7xl mx-auto results-wrap">
        {/* Navigation - Professional & Clean */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/occult-directory"
            className="p-2 bg-white rounded-lg border border-[#d6c89a] text-[#b8962e] hover:bg-[#b8962e] hover:text-white transition-all shadow-sm">
            
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight serif">
                {expertiseParam || 'Directory Experts'} <span className="text-[#b8962e]">{cityParam ? `in ${cityParam}` : ''}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-[#9a7d52] uppercase tracking-[0.2em]">{astrologers.length} {T("results.verified_professionals_found")}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Matching Kundli/Matching Theme */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sidebar-panel sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-[#b8962e] border-b border-[#f5e9c8] pb-4">
                <Filter className="w-4 h-4" />
                <h2 className="serif font-semibold text-base mt-0.5">{T("results.refine_directory")}</h2>
              </div>
              
              <OccultSearchForm
                variant="sidebar"
                initialCity={cityParam}
                initialExpertise={expertiseParam}
                expertiseOptions={dirSettings.expertise}
                cityOptions={dirSettings.cities} />
              

              {/* Popular Expertise Links */}
              <div className="mt-8 pt-6 border-t border-[#f5e9c8]">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{T("results.quick_browse")}</h3>
                 <div className="space-y-1">
                    {dirSettings.expertise.slice(0, 8).map((exp) =>
                  <Link
                    key={exp}
                    href={`/occult-directory/results?city=${cityParam}&expertise=${encodeURIComponent(exp)}`}
                    className={`block px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    expertiseParam === exp ?
                    'bg-[#b8962e] text-white' :
                    'text-[#6b5535] hover:bg-[#b8962e]/5 hover:text-[#b8962e]'}`
                    }>
                    
                            {exp}
                        </Link>
                  )}
                 </div>
              </div>
            </div>
          </aside>

          {/* Listings */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              {loading ?
              <div className="flex flex-col items-center justify-center h-64 bg-white/40 rounded-2xl border border-[#d6c89a] border-dashed">
                  <Loader className="w-8 h-8 text-[#b8962e] animate-spin mb-4" />
                  <p className="text-[#9a7d52] text-xs font-black uppercase tracking-widest">{T("results.consulting_the_chart")}</p>
                </div> :
              error ?
              <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                  <p className="text-red-800 text-sm font-bold">{error}</p>
                </div> :
              astrologers.length === 0 ?
              <div className="bg-white/40 p-16 rounded-2xl border border-[#d6c89a] text-center border-dashed">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#f5e9c8]">
                      <SearchIcon size={28} className="text-[#d6c89a]" />
                  </div>
                  <h3 className="serif text-xl font-semibold text-gray-900 mb-2">{T("results.divine_path_not_found")}</h3>
                  <p className="text-[#6b5535] text-sm max-w-xs mx-auto mb-8 font-medium">
{T("results.we_couldn_t_find_any_experts_m")}
                </p>
                  <button
                  onClick={() => router.push('/occult-directory')}
                  className="px-8 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-black transition-colors">
{T("results.reset_all_filters")}

                </button>
                </div> :

              <div className="space-y-4">
                  {astrologers.map((astro, idx) =>
                <motion.div
                  key={astro._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="result-card group">
                  
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 flex items-start justify-center">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#fdf6e3] overflow-hidden border border-[#d6c89a] p-1">
                            {astro.profilePicture ?
                        <img
                          src={astro.profilePicture}
                          alt={astro.name}
                          className="w-full h-full object-cover rounded-xl" /> :


                        <div className="w-full h-full flex items-center justify-center text-[#d6c89a]">
                                <Users size={40} />
                              </div>
                        }
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                             <div>
                                <h3 className="serif text-xl font-bold text-gray-900 mb-1 group-hover:text-[#b8962e] transition-colors">{astro.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <div className="flex items-center gap-1.5 text-[#b8962e] font-black text-[10px] uppercase tracking-wider">
                                        <Shield size={14} />{T("results.certified_specialist")}
                            </div>
                                    <div className="flex items-center gap-1.5 text-[#9a7d52] font-black text-[10px] uppercase tracking-wider">
                                        <Star size={14} /> {astro.experienceYears} {T("results.years_exp")}
                            </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-1.5 bg-[#fdf6e3] px-3 py-1.5 rounded-lg border border-[#f5e9c8]">
                                <Star size={14} className="text-[#b8962e] fill-[#b8962e]" />
                                <span className="font-black text-[#1a1209] text-sm">{astro.ratings?.average || '0.0'}</span>
                                <span className="text-[10px] text-[#9a7d52] font-bold">({astro.ratings?.total || 0})</span>
                             </div>
                          </div>

                          <p className="text-[#b8962e] font-black text-[11px] mb-3 uppercase tracking-[0.15em] border-b border-[#fdf6e3] pb-2">
                                {astro.specializations.join(' • ')}
                          </p>

                          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 mb-4">
                                <div className="flex items-center gap-1.5 text-[#6b5535]"><MapPin size={14} /> {astro.city || 'Location Pending'}</div>
                                <div className="flex items-center gap-1.5 text-[#6b5535]"><Heart size={14} />{T("results.98_happy_souls")}</div>
                          </div>

                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 opacity-80 mb-6 bg-[#fdf6e3]/50 p-2 rounded-lg border border-[#f5e9c8]/50">
                             "{astro.bio || 'Highly intuitive and experienced practitioner helping souls navigate their life paths with ancient wisdom.'}"
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
                             <div className="flex items-baseline gap-1">
                                <p className="text-[10px] font-black text-[#9a7d52] uppercase tracking-[0.1em] mr-2">{T("results.consultation")}</p>
                                <p className="text-xl font-black text-gray-900">₹{astro.pricing?.chat || 0}</p>
                                <p className="text-[10px] text-gray-400 font-bold tracking-widest">{T("results._min")}</p>
                             </div>
                             <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Link
                             href={`/astrologer/${astro._id}`}
                             className="flex-1 sm:flex-none px-8 py-3 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-md active:scale-95 text-center"
                             style={{ background: 'linear-gradient(135deg, #1a1209 0%, #332b1d 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
{T("results.experience_now")}

                          </Link>
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                )}
                </div>
              }
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>);

}

export default function OccultDirectoryResultsPage() {

  return (
    <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#fdf6e3' }}>
            <Loader className="w-8 h-8 text-[#b8962e] animate-spin" />
        </div>
    }>
      <ResultsContent />
    </Suspense>);

}