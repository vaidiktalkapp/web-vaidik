'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import aiAstrologerService, { AiAstrologer } from '@/lib/aiAstrologerService';
import { useAuth } from '@/context/AuthContext';
import {
  Star, MessageSquare, Filter, Search, Check,
  ChevronRight, Sparkles, User, Users, Clock, ChevronDown,
  MapPin, Calendar, Mail, Phone, Video, TrendingUp, Award,
  Zap, Crown, BadgeCheck, X, Moon, Sun, Globe, Heart, Shield } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AiChatIntakeModal from '@/components/modals/AiChatIntakeModal';

const SPECIALIZATION_TABS = [
{ id: 'all', label: 'All' },
{ id: 'vedic', label: 'Vedic' },
{ id: 'tarot', label: 'Tarot' },
{ id: 'numerology', label: 'Numerology' }];


const SORT_OPTIONS = [
{ id: 'popularity', label: 'Popularity' },
{ id: 'exp-high-low', label: 'Experience : High to Low' },
{ id: 'exp-low-high', label: 'Experience : Low to High' },
{ id: 'orders-high-low', label: 'Total orders : High to Low' },
{ id: 'orders-low-high', label: 'Total orders : Low to High' },
{ id: 'price-high-low', label: 'Price : High to Low' },
{ id: 'price-low-high', label: 'Price : Low to High' },
{ id: 'rating-high-low', label: 'Rating : High to Low' }];

const COSMIC_QUOTES = [
  "The stars are aligning for your success.",
  "Trust the journey the universe has planned for you.",
  "Your energy introduces you before you even speak.",
  "Embrace the cosmic flow and find your peace.",
  "Every phase of the moon brings a new beginning.",
  "You are a child of the cosmos, destined for greatness.",
  "Let the celestial energy guide your decisions today.",
  "The universe is always conspiring in your favor.",
  "Align your thoughts with the vibrations of the cosmos.",
  "Cosmic harmony begins within your own soul.",
  "The cosmos whispers secrets to those who listen.",
  "Your potential is as limitless as the night sky.",
  "Channel the power of the sun and shine brightly.",
  "Let go of what no longer serves your spiritual path.",
  "The planets are guiding you towards your true purpose.",
  "Find balance in the dualities of the universe.",
  "Radiate love, and the cosmos will reflect it back.",
  "Your intuition is the universe speaking to you.",
  "Every ending is just a new astrological beginning.",
  "The energy you put out is the energy you attract.",
  "Breathe in the starlight, exhale the doubt.",
  "You are made of star-stuff, capable of anything.",
  "The celestial bodies watch over your journey.",
  "Trust the timing of your life; it is cosmically perfect.",
  "Open your heart to the abundant cosmic energies.",
  "May the wisdom of the ancients light your path today.",
  "Your spiritual journey is guided by unseen forces.",
  "Embrace the mystery of the unfolding universe.",
  "The alignment of planets brings new opportunities.",
  "You are deeply connected to the rhythm of the cosmos.",
  "Let the moonlight wash away your worldly worries."
];



const AstrologerListing = () => {
    const { t } = useTranslation();

  const router = useRouter();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [astrologers, setAstrologers] = useState<AiAstrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCallIntakeModal, setShowCallIntakeModal] = useState(false);
  const [selectedCallAstrologer, setSelectedCallAstrologer] = useState<AiAstrologer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    specialization: string[];
    minRating: number;
    maxRate: number;
    availability: string;
  }>({
    specialization: [],
    minRating: 0,
    maxRate: 200,
    availability: 'all'
  });
  const [sortBy, setSortBy] = useState('popularity');
  const [showDailyHoroscope, setShowDailyHoroscope] = useState(true);
  const [showSortModal, setShowSortModal] = useState(false);
  const [tempSortBy, setTempSortBy] = useState('popularity');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [activeFilterTab, setActiveFilterTab] = useState('sorting');
  const [tempFilters, setTempFilters] = useState(filters);
  const [serviceMode, setServiceMode] = useState<'chat' | 'call'>('chat');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchAstrologers();
  }, [filters, sortBy, selectedSpecialization]);

  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 [Page] Starting to fetch AI astrologers...');

      // Fetching all AI astrologers and filtering client-side for now as per previous logic
      const data = await aiAstrologerService.getAllAiAstrologers();
      // console.log('📡 [Page] Received AI astrologers:', data);

      if (!data || data.length === 0) {
        console.warn('⚠️ [Page] No AI astrologers found. Check:');
        console.warn('  1. Is the backend running?');
        console.warn('  2. Have AI astrologers been created in admin panel and set to isAvailable: true?');
        console.warn('  3. Check backend logs for /api/v1/ai-astrologers');
        setError('No AI astrologers available at the moment. Please check back soon or try refreshing.');
      }

      let filteredData = data.filter((astro) => {
        // 1. Filter by tab-selected specialization
        if (selectedSpecialization !== 'all') {
          const hasSpec = astro.specialization?.some((s) =>
          s.toLowerCase().includes(selectedSpecialization.toLowerCase())
          );
          if (!hasSpec) return false;
        }

        // 2. Filter by modal-selected specializations (if any)
        if (filters.specialization.length > 0) {
          const hasSpec = filters.specialization.some((filterSpec) =>
          astro.specialization?.some((s) => s.toLowerCase().includes(filterSpec.toLowerCase()))
          );
          if (!hasSpec) return false;
        }

        // 3. Filter by Rating
        if (filters.minRating > 0) {
          if ((astro.rating || 0) < filters.minRating) return false;
        }

        // 4. Filter by Price Range
        if (filters.maxRate > 0 && filters.maxRate < 200) {
          if ((astro.chatRate || 0) > filters.maxRate) return false;
        }


        // 6. Filter by Availability
        if (filters.availability === 'online') {
          // For AI, we can assume status 'active' means online
          if (astro.status !== 'active') return false;
        }

        return true;
      });

      let sortedData = [...filteredData];
      switch (sortBy) {
        case 'orders-high-low':
        case 'popularity':
          sortedData.sort((a, b) => (b.totalChats || 0) - (a.totalChats || 0));
          break;
        case 'orders-low-high':
          sortedData.sort((a, b) => (a.totalChats || 0) - (b.totalChats || 0));
          break;
        case 'exp-high-low':
          sortedData.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
          break;
        case 'exp-low-high':
          sortedData.sort((a, b) => (a.experienceYears || 0) - (b.experienceYears || 0));
          break;
        case 'price-high-low':
          sortedData.sort((a, b) => (b.chatRate || 0) - (a.chatRate || 0));
          break;
        case 'price-low-high':
          sortedData.sort((a, b) => (a.chatRate || 0) - (b.chatRate || 0));
          break;
        case 'rating-high-low':
          sortedData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          sortedData.sort((a, b) => (b.totalChats || 0) - (a.totalChats || 0));
      }

      setAstrologers(sortedData);
    } catch (error) {
      console.error("Failed to fetch astrologers:", error);
      setError('Failed to load AI astrologers. Please check your connection and try again.');
      toast.error("Failed to load astrologers");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (astrologer: AiAstrologer) => {
    router.push(`/ai-astrologer/${astrologer._id}`);
  };

  const handleStartCall = async (astrologer: AiAstrologer) => {
    if (!isAuthenticated) {
      toast('Please login to start a voice consultation', { icon: 'ℹ️' });
      openLoginModal?.();
      return;
    }
    // Open intake form so user can share birth details & language before the call
    setSelectedCallAstrologer(astrologer);
    setShowCallIntakeModal(true);
  };

  const getImageUrl = (url: string, name: string = 'AI') => {
    if (url && url.trim() !== '') return url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF8C00&color=fff&bold=true`;
  };

  const handleApplyFilter = () => {
    setSortBy(tempSortBy);
    setFilters(tempFilters);
    // If modal specializations are cleared, we don't necessarily want to clear the tab,
    // but often "Clear All" should reset everything.
    // This will be handled in the Reset button inside the modal.
    setShowSortModal(false);
  };

  useEffect(() => {
    if (showSortModal) {
      setTempSortBy(sortBy);
      setTempFilters({ ...filters });
    }
  }, [showSortModal, sortBy, filters]);

  const filteredAstrologers = astrologers.filter((astrologer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      astrologer.name?.toLowerCase().includes(query) ||
      astrologer.specialization?.some((s) => s.toLowerCase().includes(query))
      // astrologer.languages?.some(l => l.toLowerCase().includes(query))
    );
  });

  // Debug logging
  // useEffect(() => {
  //   console.log('🎯 [Page] State Update:');
  //   console.log('  - astrologers:', astrologers);
  //   console.log('  - astrologers.length:', astrologers.length);
  //   console.log('  - filteredAstrologers:', filteredAstrologers);
  //   console.log('  - filteredAstrologers.length:', filteredAstrologers.length);
  //   console.log('  - loading:', loading);
  //   console.log('  - error:', error);
  // }, [astrologers, filteredAstrologers, loading, error]);

  const getSpiritualSymbol = (index: number) => {
    const symbols = ['ॐ', '卐', '꧁', '𑁍', '☥', '☸', '☯', '♆'];
    return symbols[index % symbols.length];
  };

  return (
    <div className="min-h-screen bg-saffron-50 relative overflow-hidden">
      {/* Spiritual Background Patterns */}
      {mounted &&
      <div className="fixed inset-0 pointer-events-none opacity-5">
          {Array.from({ length: 20 }).map((_, i) =>
        <div
          key={i}
          className="absolute text-4xl animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 20}s`
          }}>
          
              {getSpiritualSymbol(i)}
            </div>
        )}
        </div>
      }

      {/* Mandala Background */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.02] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M100,20 a80,80 0 1,0 0,160 a80,80 0 1,0 0,-160"
          fill="none" stroke="#d97706" strokeWidth="0.5" />
          <path d="M100,40 a60,60 0 1,0 0,120 a60,60 0 1,0 0,-120"
          fill="none" stroke="#d97706" strokeWidth="0.5" />
          <text x="100" y="100" textAnchor="middle" dy="0.3em"
          fontSize="24" fill="#d97706" opacity="0.3">ॐ</text>
        </svg>
      </div>




      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-10 py-4 shadow-sm transition-all relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 flex-shrink-0">
              
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
            </button>
            <div className="flex-1 min-w-0 pr-2">
              <h1 className="text-base md:text-2xl font-bold text-gray-900 leading-tight">
{t("ai_astrologer_chat.ai_astrologers")}
              </h1>
              <div className="mt-0.5 md:mt-1 h-[2px] md:h-[3px] w-10 md:w-28 bg-yellow-400 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-yellow-400 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-yellow-500 transition-all">
              <Search className="w-5 h-5 text-gray-900 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name..."
                className="bg-transparent outline-none text-sm placeholder-gray-700 text-gray-900 w-32 xl:w-48 font-medium" />
              
            </div>

            <button
              onClick={() => router.push('/ai-chat-history')}
              className="flex items-center gap-2 border border-orange-200 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-orange-700 bg-white hover:bg-orange-50 shadow-sm transition-all shrink-0 cursor-pointer">
              
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden xs:inline">{t("ai_astrologer_chat.history")}</span>
            </button>

            <button
              onClick={() => setShowSortModal(true)}
              className="flex items-center border border-gray-300 rounded-full px-5 py-2.5 text-sm text-gray-800 bg-white hover:bg-gray-50 shadow-sm transition-all shrink-0 cursor-pointer">
              
              <Filter className="w-4 h-4 text-gray-600 mr-2" />
              <span>{t("ai_astrologer_chat.filter")}</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden mt-3">
          <div className="w-full flex items-center bg-yellow-400 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-yellow-500 transition-all">
            <Search className="w-5 h-5 text-gray-900 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search astrologers..."
              className="bg-transparent outline-none text-sm placeholder-gray-700 text-gray-900 flex-1 font-medium" />
            
          </div>
        </div>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-10 py-3">
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar">
          {SPECIALIZATION_TABS.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setSelectedSpecialization(tab.id)}
            className={`flex items-center px-5 py-2 rounded-full border text-sm whitespace-nowrap transition ${selectedSpecialization === tab.id ?
            'bg-yellow-100 border-yellow-400 text-yellow-700 font-semibold shadow-sm' :
            'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`
            }>
            
              {tab.label}
            </button>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">

        {/* Daily Insight Ribbon */}
        {showDailyHoroscope &&
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl py-3 px-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          
            {/* Subtle Star Background */}
            <div className="absolute inset-0 opacity-40">
              {mounted && Array.from({ length: 30 }).map((_, i) =>
            <div
              key={i}
              className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }} />
            )}
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-center sm:justify-start">
              <div className="p-1.5 bg-white/10 rounded-lg shrink-0 backdrop-blur-sm border border-white/5">
                <Moon className="w-4 h-4 text-purple-200" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                <div className="w-1 h-1 bg-purple-400 rounded-full hidden sm:block" />
                <p className="text-xs text-white hidden sm:block">{`"${COSMIC_QUOTES[new Date().getDate() % COSMIC_QUOTES.length]}"`}</p>
              </div>
            </div>
          </motion.div>
        }





        {/* Error Banner */}
        {error &&
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                !
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">{t("ai_astrologer_chat.unable_to_load_ai_astrologers")}</h3>
                <p className="text-sm text-red-700 mb-2">{error}</p>
                <details className="text-xs text-red-600">
                  <summary className="cursor-pointer font-semibold hover:text-red-800">
{t("ai_astrologer_chat.troubleshooting_steps")}
                </summary>
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>{t("ai_astrologer_chat.check_that_the_backend_server")}</li>
                    <li>{t("ai_astrologer_chat.verify_ai_astrologers_have_bee")}</li>
                    <li>{t("ai_astrologer_chat.try_refreshing_the_page_or_che")}</li>
                  </ul>
                </details>
                <button
                onClick={() => {
                  setError(null);
                  fetchAstrologers();
                }}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
{t("ai_astrologer_chat.retry_loading")}

              </button>
              </div>
            </div>
          </motion.div>
        }

        {/* Results Count with Spiritual Touch */}
        <div className="mb-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-2">
          <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1.5">
            <span className="text-saffron-500">🔮</span>
            <span>{t("ai_astrologer_chat.showing")} <span className="font-bold text-gray-900">{filteredAstrologers.length}</span> {t("ai_astrologer_chat.divine_astrologers")}</span>
          </p>
          <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] md:text-xs text-green-600 font-bold whitespace-nowrap">
              {filteredAstrologers.length}{t("ai_astrologer_chat.available_now")}
            </span>
          </div>
        </div>

        {/* Service Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-gray-200 p-1.5 rounded-full inline-flex shadow-sm">
            <button
              onClick={() => setServiceMode('chat')}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all ${
                serviceMode === 'chat'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </button>
            <button
              onClick={() => setServiceMode('call')}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all ${
                serviceMode === 'call'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Phone className="w-4 h-4" />
              AI Call
            </button>
          </div>
        </div>

        {/* Astrologer Grids */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/50 rounded-3xl h-72 animate-pulse shadow-lg border border-saffron-100" />
            ))}
          </div>
        ) : filteredAstrologers.filter(a => serviceMode === 'chat' ? a.isChatEnabled === true : a.isCallEnabled === true).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 max-w-[1200px] mx-auto">
            {filteredAstrologers.filter(a => serviceMode === 'chat' ? a.isChatEnabled === true : a.isCallEnabled === true).map((astrologer, index) => (
              <motion.div
                key={astrologer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex bg-white rounded-xl border border-orange-100 p-3 shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden"
                onClick={() => router.push(`/ai-astrologer/${astrologer._id}`)}
              >
                {/* Subtle Gradient Accent */}
                <div className="absolute top-0 right-0 bottom-0 w-32 bg-orange-50/50 rounded-l-[100px] z-0" />
                
                {/* Avatar Section */}
                <div className="relative w-24 shrink-0 flex flex-col items-center mr-2 z-10">
                  <div className="relative">
                    <img
                      src={getImageUrl(astrologer.profileImage, astrologer.name)}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 shadow-sm"
                      alt={astrologer.name}
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-[12px] text-orange-500 font-bold flex items-center justify-center gap-1">
                      <span>⭐</span>
                      <span>{astrologer.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                    {/* <div className="text-[10px] text-gray-400 mt-0.5">
                      {astrologer.totalChats || 0} orders
                    </div> */}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center z-10 py-1">
                  <h3 className="font-bold text-[16px] text-gray-900 leading-tight truncate">
                    {astrologer.name}
                  </h3>
                  
                  <div className="mt-1.5 mb-2">
                    <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      AI ASTROLOGER
                    </span>
                  </div>

                  <div className="text-[12px] text-gray-500 space-y-0.5">
                    <p className="truncate">{(astrologer.specialization || []).filter(s => s.toLowerCase() !== 'palmistry').slice(0, 2).join(', ') || 'Vedic'}</p>
                    <p>Exp: {astrologer.experienceYears || 5} Years</p>
                  </div>
                  
                  <div className="flex items-center mt-2 gap-2">
                    {astrologer.isAiPromotional ? (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-sm animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span>FREE</span>
                      </div>
                    ) : (
                      <>
                        {serviceMode === 'chat' ? (
                          <>
                            <span className="text-[12px] text-gray-400 line-through">₹{Math.round((astrologer.chatRate || 10) * 1.5)}</span>
                            <span className="text-[14px] font-bold text-red-600">₹{astrologer.chatRate || 0}/min</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[12px] text-gray-400 line-through">₹{Math.round((astrologer.voiceRate || 10) * 1.5)}</span>
                            <span className="text-[14px] font-bold text-red-600">₹{astrologer.voiceRate || 0}/min</span>
                          </>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-bold border border-green-100">
                          Offer
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button Section */}
                <div className="flex items-center ml-2 shrink-0 justify-end z-10">
                  {serviceMode === 'chat' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartChat(astrologer);
                      }}
                      className="px-4 py-1.5 rounded-full border border-orange-500 bg-white text-orange-500 hover:bg-orange-50 text-[13px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCall(astrologer);
                      }}
                      className="px-4 py-1.5 rounded-full border border-orange-500 bg-white text-orange-500 hover:bg-orange-50 text-[13px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (

        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-saffron-200 relative overflow-hidden">
          
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-saffron-100 to-amber-100 rounded-full mb-6 shadow-lg">
                <span className="text-4xl">🔮</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-saffron-700 to-amber-600 bg-clip-text text-transparent">
{t("ai_astrologer_chat.seeking_cosmic_guidance")}
            </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
{t("ai_astrologer_chat.the_stars_will_align_soon_try")}
            </p>
              <button
              onClick={() => {
                setSelectedSpecialization('all');
                setFilters({
                  specialization: [],
                  minRating: 0,
                  maxRate: 200,
                  availability: 'all'
                });
                setSearchQuery('');
              }}
              className="bg-gradient-to-r from-saffron-600 to-amber-600 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto">
              
                <span className="text-xl">🕉️</span>
{t("ai_astrologer_chat.reset_all_filters")}
              <span className="text-xl">✨</span>
              </button>
            </div>
          </motion.div>)
        }

        {/* Spiritual Guidance Footer */}
        <div className="mt-12 pt-8 border-t border-saffron-200 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-saffron-500">🛡️</span>
              <span className="font-bold">{t("ai_astrologer_chat.100_privacy_protected")}</span>
            </div>
            <div className="w-2 h-2 bg-saffron-300 rounded-full" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-saffron-500">⭐</span>
              <span className="font-bold">{t("ai_astrologer_chat.certified_vedic_astrologers")}</span>
            </div>
            <div className="w-2 h-2 bg-saffron-300 rounded-full" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-saffron-500">⚡</span>
              <span className="font-bold">{t("ai_astrologer_chat.instant_divine_guidance")}</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
{t("ai_astrologer_chat._as_above_so_below_connect_wit")}
            <span className="block mt-2 text-saffron-400">{t("ai_astrologer_chat._ancient_vedic_wisdom")}</span>
          </p>
        </div>
      </main>

      {/* Custom Animations and Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(251, 146, 60, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d97706, #b45309);
        }

        /* Spiritual gradient backgrounds */
        .bg-saffron-50 { background-color: #fffbeb; }
        .bg-saffron-100 { background-color: #fef3c7; }
        .bg-saffron-200 { background-color: #fde68a; }
        .bg-saffron-300 { background-color: #fcd34d; }
        .bg-saffron-400 { background-color: #fbbf24; }
        .bg-saffron-500 { background-color: #f59e0b; }
        .bg-saffron-600 { background-color: #d97706; }
        .bg-saffron-700 { background-color: #b45309; }
        .bg-saffron-800 { background-color: #92400e; }
        .bg-saffron-900 { background-color: #78350f; }

        .bg-sand-50 { background-color: #fefce8; }
        .bg-cream-50 { background-color: #fef9c3; }
      `}</style>
      {/* Filter Modal */}
      {showSortModal &&
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 tracking-wide uppercase">{t("ai_astrologer_chat.filters_sorting")}</h2>
              <button onClick={() => setShowSortModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 bg-gray-50 border-r border-gray-100 py-2">
                <button
                onClick={() => setActiveFilterTab('sorting')}
                className={`w-full text-left relative py-4 px-5 transition-colors ${activeFilterTab === 'sorting' ? 'bg-white' : 'hover:bg-gray-100'}`}>
                
                  {activeFilterTab === 'sorting' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-700"></div>}
                  <span className={`text-sm font-semibold ${activeFilterTab === 'sorting' ? 'text-gray-900' : 'text-gray-500'}`}>{t("ai_astrologer_chat.sorting")}</span>
                </button>
                <button
                onClick={() => setActiveFilterTab('filters')}
                className={`w-full text-left relative py-4 px-5 transition-colors ${activeFilterTab === 'filters' ? 'bg-white' : 'hover:bg-gray-100'}`}>
                
                  {activeFilterTab === 'filters' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-700"></div>}
                  <span className={`text-sm font-semibold ${activeFilterTab === 'filters' ? 'text-gray-900' : 'text-gray-500'}`}>{t("ai_astrologer_chat.refine")}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                {activeFilterTab === 'sorting' ?
              <div className="space-y-4">
                    {SORT_OPTIONS.map((opt) =>
                <label key={opt.id} className="flex items-center cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <input
                    type="radio"
                    name="sortParams"
                    value={opt.id}
                    checked={tempSortBy === opt.id}
                    onChange={() => setTempSortBy(opt.id)}
                    className="hidden" />
                  
                        <div className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center mr-3 transition-all ${tempSortBy === opt.id ? 'border-teal-600 bg-teal-50' : 'border-teal-500/30 bg-white'}`}>
                          {tempSortBy === opt.id &&
                    <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />
                    }
                        </div>
                        <span className={`text-[16px] ${tempSortBy === opt.id ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>{opt.label}</span>
                      </label>
                )}
                  </div> :

              <div className="space-y-8">
                    {/* Rating Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">{t("ai_astrologer_chat.minimum_rating")}</h3>
                      <div className="flex flex-wrap gap-2">
                        {[4.5, 4.0, 3.5, 3.0, 0].map((rating) =>
                    <button
                      key={rating}
                      onClick={() => setTempFilters({ ...tempFilters, minRating: rating })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilters.minRating === rating ?
                      'bg-saffron-100 border-saffron-600 text-saffron-700 shadow-sm' :
                      'bg-white border-gray-200 text-gray-600 hover:border-saffron-300'}`
                      }>
                      
                            {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                          </button>
                    )}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">{t("ai_astrologer_chat.price_ceiling_min")}</h3>
                      <div className="px-2">
                        <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={tempFilters.maxRate}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxRate: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-saffron-600" />
                    
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase">
                          <span>₹0</span>
                          <span className="text-saffron-600 text-sm">₹{tempFilters.maxRate}</span>
                          <span>₹200+</span>
                        </div>
                      </div>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2 uppercase tracking-wider">{t("ai_astrologer_chat.availability")}</h3>
                      <div className="flex gap-2">
                        {['all', 'online'].map((status) =>
                    <button
                      key={status}
                      onClick={() => setTempFilters({ ...tempFilters, availability: status })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${tempFilters.availability === status ?
                      'bg-teal-50 border-teal-600 text-teal-700 shadow-sm' :
                      'bg-white border-gray-200 text-gray-600 hover:border-teal-300'}`
                      }>
                      
                            {status === 'all' ? 'All' : 'Online Now'}
                          </button>
                    )}
                      </div>
                    </div>

                    {/* Multiple Specializations Filter */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">{t("ai_astrologer_chat.specializations")}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['Vedic', 'Tarot', 'Numerology', 'Love', 'Career'].map((spec) =>
                    <label key={spec} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-orange-50 rounded transition-colors">
                            <input
                        type="checkbox"
                        checked={tempFilters.specialization.includes(spec)}
                        onChange={(e) => {
                          const newSpecs = e.target.checked ?
                          [...tempFilters.specialization, spec] :
                          tempFilters.specialization.filter((s) => s !== spec);
                          setTempFilters({ ...tempFilters, specialization: newSpecs });
                        }}
                        className="w-4 h-4 rounded text-saffron-600 focus:ring-saffron-500 border-gray-300" />
                      
                            <span className="text-xs font-medium text-gray-700">{spec}</span>
                          </label>
                    )}
                      </div>
                    </div>

                  </div>
              }
              </div>
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-white shrink-0">
              <button
              type="button"
              onClick={() => {
                setTempSortBy('popularity');
                setSelectedSpecialization('all');
                setTempFilters({
                  specialization: [],
                  minRating: 0,
                  maxRate: 200,
                  availability: 'all'
                });
              }}
              className="text-teal-700 text-sm font-bold hover:underline">
{t("ai_astrologer_chat.reset")}

            </button>
              <button
              type="button"
              onClick={handleApplyFilter}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-12 rounded-xl text-[15px] transition-all shadow-md hover:shadow-lg active:scale-95">
{t("ai_astrologer_chat.apply")}

            </button>
            </div>
          </div>
        </div>
      }

      {/* AI Call Intake Modal */}
      {selectedCallAstrologer && (
        <AiChatIntakeModal
          isOpen={showCallIntakeModal}
          onClose={() => {
            setShowCallIntakeModal(false);
            setSelectedCallAstrologer(null);
          }}
          astrologer={selectedCallAstrologer}
          mode="call"
        />
      )}
    </div>);

};

export default AstrologerListing;
