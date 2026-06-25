'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import {
  X, User, FileText, Clock, Book, Star, Settings,
  ChevronDown, Heart, Calendar as CalendarIcon, MapPin,
  Globe, Phone, Home, Sparkles, Baby, Search,
  BookOpen, Compass, Grid, BarChart2, Languages,
  Download, Eye, LayoutGrid, Columns, AlignLeft, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isPersistent?: boolean;
}

interface SubItem {
  title: string;
  href: string;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: SubItem[];
}

export default function Sidebar({ isOpen, onClose, isPersistent = false }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);

  // Construct search string if it exists
  const queryString = searchParams.toString();
  const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-expand the section containing the active sub-item
  useEffect(() => {
    if (isMounted) {
      const activeParent = menuItems.find(item => 
        item.subItems?.some(sub => 
          currentUrl === sub.href || 
          (sub.href !== '/' && currentUrl.startsWith(sub.href + '/'))
        )
      );
      if (activeParent) {
        setExpandedNav(activeParent.title);
      }
    }
  }, [pathname, queryString, isMounted]);

  const showOverlay = isMounted && isOpen && !isPersistent;
  const isVisible = isMounted && (isPersistent || isOpen);

  const menuItems: MenuItem[] = [
    { 
      title: t('nav.home'), 
      icon: <Home size={18} />, 
      href: '/astrologers-chat'
    },
    { 
      title: t('nav.calculators'), 
      icon: <LayoutGrid size={18} />, 
      href: '/astrology-calculators'
    },
    { 
      title: t('nav.kundli'), 
      icon: <FileText size={18} />, 
      subItems: [
        { title: t('nav.kundli_gen'), href: '/kundli' },
        { title: t('nav.north_chart'), href: '/kundli/north' },
        { title: t('nav.south_chart'), href: '/kundli/south' },
        { title: t('nav.kundli_results'), href: '/kundli/history' },
        { title: t('nav.planets'), href: '/kundli/planets' },
        { title: t('nav.houses'), href: '/kundli/houses' },
        { title: t('nav.interpretation'), href: '/kundli/interpretation' },
        { title: t('nav.pdf_report'), href: '/kundli#download-pdf' }
      ]
    },
    { 
      title: t('nav.matching'), 
      icon: <Heart size={18} />, 
      subItems: [
        { title: t('nav.new_matching'), href: '/horoscope-matching' },
        { title: t('nav.matching_results'), href: '/horoscope-matching/history' },
        { title: t('nav.pdf_report'), href: '/horoscope-matching' }
      ]
    },
    { 
      title: t('nav.calendar'), 
      icon: <CalendarIcon size={18} />, 
      href: '/calendar'
    },
    { 
      title: t('nav.rahu_kaal'), 
      icon: <Clock size={18} />, 
      href: '/rahu-kaal'
    },
    { 
      title: t('nav.panchang'), 
      icon: <CalendarIcon size={18} />, 
      href: '/panchang'
    },
    { 
      title: t('nav.lal_kitab'), 
      icon: <Book size={18} />, 
      subItems: [
        { title: t('nav.lal_kitab_gen'), href: '/lal-kitab' },
        { title: t('nav.lal_kitab_history'), href: '/lal-kitab/history' }
      ]
    },


    { 
      title: t('nav.moon_signs'), 
      icon: <Star size={18} />, 
      subItems: [
        { title: t('nav.new_calc'), href: '/moon-signs?new=true' },
        { title: t('nav.moon_history'), href: '/moon-signs/history' }
      ]
    },
    { 
      title: t('nav.celebrity'), 
      icon: <Search size={18} />, 
      href: '/celebrity-horoscopes'
    },
    { 
      title: t('nav.love_horo'), 
      icon: <Heart size={18} />, 
      subItems: [
        { title: t('nav.zodiac_love'), href: '/love-horoscope' },
        { title: t('nav.personal_love'), href: '/love-horoscope?mode=personal' },
        { title: t('nav.love_history'), href: '/love-horoscope?mode=history' }
      ]
    },
    { 
      title: t('nav.chinese_horo'), 
      icon: <Star size={18} />, 
      subItems: [
        { title: t('nav.chinese_zodiac'), href: '/chinese-horoscope?mode=grid' },
        { title: t('nav.destiny'), href: '/chinese-horoscope?mode=personal' },
        { title: t('nav.chinese_history'), href: '/chinese-horoscope/history' }
      ]
    },
    { 
      title: t('nav.matrimony'), 
      icon: <Heart size={18} />, 
      href: '/matrimony'
    },
    { 
      title: t('nav.muhurat'), 
      icon: <Clock size={18} />, 
      subItems: [
        { title: t('nav.find_muhurat'), href: '/muhurat' },
        { title: t('nav.muhurat_history'), href: '/muhurat/history' },
        { title: t('nav.muhurat_directory'), href: '/muhurat/directory' }
      ]
    },
    { 
      title: t('nav.learn'), 
      icon: <BookOpen size={18} />, 
      href: '/learn',
      subItems: [
        { title: t('nav.lessons'), href: '/learn' },
        { title: t('nav.planet_library'), href: '/learn/planets' },
      ]
    },
    /*
    { 
      title: t('nav.occult'), 
      icon: <LayoutGrid size={18} />, 
      href: '/occult-directory'
    },
    */
    { 
      title: t('nav.baby_names'), 
      icon: <Baby size={18} />, 
      href: '/baby-names'
    },
    { 
      title: t('nav.atlas'), 
      icon: <MapPin size={18} />, 
      href: '/atlas'
    },
    { 
      title: t('nav.free_reports'), 
      icon: <Sparkles size={18} />, 
      subItems: [
        { title: t('nav.lessons'), href: '/free-reports' },
        { title: t('nav.kaal_sarp'), href: '/free-reports/kaal-sarp' },
        { title: t('nav.gemstone'), href: '/free-reports/gemstone' },
        { title: t('nav.sade_sati'), href: '/free-reports/sade-sati' },
        { title: t('nav.free_report_history'), href: '/free-reports/history' }
      ]
    },
    { 
      title: t('nav.healing'), 
      icon: <Sparkles size={18} />, 
      href: '/healing'
    },
    { 
      title: t('nav.festivals'), 
      icon: <Star size={18} />, 
      href: '/festivals'
    },
    { 
      title: t('nav.compatibility'), 
      icon: <Heart size={18} />, 
      href:'/compatibility'
    },
    { 
      title: t('nav.profile'), 
      icon: <User size={18} />, 
      href: '/profile'
    },
    { 
      title: t('nav.wallet'), 
      icon: <Settings size={18} />, 
      href: '/wallet'
    },
    { 
      title: t('nav.ai_history'), 
      icon: <Clock size={18} />, 
      href: '/ai-chat-history'
    },
    { 
      title: t('nav.orders'), 
      icon: <FileText size={18} />, 
      href: '/orders'
    },
  ];


  if (!isMounted) return null;

  return (
    <>
      {/* Overlay (only for non-persistent) */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] transition-opacity duration-300 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Area */}
      <div className={`fixed inset-y-0 left-0 h-[100dvh] w-[220px] sm:w-[240px] flex flex-col bg-gradient-to-b from-[#922501] via-[#8B2303] to-[#6A1A01] text-white z-[60] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
        ${isVisible ? 'translate-x-0' : '-translate-x-full'} 
        ${isPersistent ? 'shadow-none border-r border-white/10' : 'shadow-[10px_0_60px_rgba(0,0,0,0.5)]'} 
        ${isPersistent ? 'md:translate-x-0' : ''}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#7A1F01]/50 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            {!isPersistent && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:rotate-90 active:scale-95"
              >
                <X size={26} strokeWidth={2.5} />
              </button>
            )}
            <span className="text-2xl font-black tracking-tighter uppercase bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent drop-shadow-sm">
              vaidiktalk AI
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="py-2">
            {menuItems.map((item: MenuItem, index) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedNav === item.title;
              const isActive = item.href ? pathname === item.href || pathname?.startsWith(item.href + '/') : false;
              
              // Check if any sub-item is active, OR if any sub-item path is a prefix of current url
              const isSubActive = hasSubItems && item.subItems?.some(sub => {
                return currentUrl === sub.href || 
                       (sub.href !== '/' && currentUrl.startsWith(sub.href + '/')) ||
                       // Special case: activation for nested lesson/planet pages
                       (sub.href === '/learn' && currentUrl.startsWith('/learn/guides/')) ||
                       (sub.href === '/learn/planets' && currentUrl.startsWith('/learn/planets/'));
              });

              return (
                <div key={index}>
                  {hasSubItems ? (
                    <button
                      className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-300 group relative overflow-hidden
                        ${isSubActive ? 'bg-yellow-400/15 text-yellow-300' : 'hover:bg-white/10'}
                      `}
                      onClick={() => setExpandedNav(isExpanded ? null : item.title)}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 transform transition-transform duration-300
                        ${isSubActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}
                      `}></div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`transition-all duration-300 drop-shadow-lg
                          ${isSubActive ? 'text-yellow-400 scale-125' : 'text-white/80 group-hover:text-yellow-400 group-hover:scale-110'}
                        `}>
                          {item.icon}
                        </span>
                        <span className={`text-[15px] font-bold tracking-tight text-left transition-all duration-300
                          ${isSubActive ? 'pl-1 text-yellow-300' : 'group-hover:pl-1 text-white'}
                        `}>
                          {item.title}
                        </span>
                      </div>
                      {isSubActive && <CheckCircle2 size={10} className="text-yellow-400 fill-yellow-400" strokeWidth={2.5} />}
                      <ChevronDown
                        size={18}
                        className={`transition-all duration-300 ml-auto
                          ${isExpanded ? 'rotate-180 text-yellow-400' : 'text-white/20 group-hover:text-white'}
                        `}
                        strokeWidth={3}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`flex items-center justify-between px-4 py-3 transition-all duration-300 group relative overflow-hidden
                        ${isActive ? 'bg-yellow-400/15 text-yellow-300' : 'hover:bg-white/10'}
                      `}
                      onClick={isPersistent ? undefined : onClose}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 transform transition-transform duration-300
                        ${isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}
                      `}></div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`transition-all duration-300 drop-shadow-lg
                          ${isActive ? 'text-yellow-400 scale-125' : 'text-white/80 group-hover:text-yellow-400 group-hover:scale-110'}
                        `}>
                          {item.icon}
                        </span>
                        <span className={`text-[15px] font-bold tracking-tight text-left transition-all duration-300
                          ${isActive ? 'pl-1 text-yellow-300' : 'group-hover:pl-1 text-white'}
                        `}>
                          {item.title}
                        </span>
                      </div>
                      {isActive && <CheckCircle2 size={10} className="text-yellow-400 fill-yellow-400" strokeWidth={2.5} />}
                    </Link>
                  )}

                  {/* Sub-items */}
                  {hasSubItems && (
                    <div className={`bg-black/10 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      {item.subItems?.map((sub, sIndex) => {
                        // Better path matching: exact match OR starts with path + /
                        const isSubItemActive = 
                          currentUrl === sub.href || 
                          (sub.href !== '/' && currentUrl.startsWith(sub.href + '/')) ||
                          // Special case: All Lessons (/learn) should also activate for /learn/guides/* paths
                          (sub.href === '/learn' && currentUrl.startsWith('/learn/guides/'));
                        
                        return (
                          <Link
                            key={sIndex}
                            href={sub.href}
                            className={`flex items-center pl-12 pr-4 py-2 text-[13px] font-medium transition-all duration-300 hover:text-yellow-400 relative group
                              ${isSubItemActive ? 'text-yellow-300 bg-yellow-400/10' : 'text-white/60 hover:bg-white/5'}
                            `}
                            onClick={isPersistent ? undefined : onClose}
                          >
                            {isSubItemActive && (
                              <div className="absolute left-4 w-2 h-2 bg-yellow-400 rounded-full"></div>
                            )}
                            <span className={isSubItemActive ? 'pl-3' : ''}>
                              {sub.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          {user && (
            <div className="px-4 pt-2 pb-4">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userData');
                    window.location.href = '/';
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-all duration-300 group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[15px] font-bold tracking-tight">{t('common.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
