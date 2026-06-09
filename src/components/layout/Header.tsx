'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import LoginModal from './LoginModal';
import Sidebar from './Sidebar';


// Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const OrderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4M4 19h4m9-15v4m-2-2h4m-5 15v4m-2-2h4m-7-4l2-2 2 2-2 2-2-2z" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'hi', name: 'हिन्दी', short: 'HI' },
  /*
  { code: 'mr', name: 'मराठी', short: 'MR' },
  { code: 'gu', name: 'ગુજરાતી', short: 'GU' },
  { code: 'bn', name: 'বাংলা', short: 'BN' },
  { code: 'ta', name: 'தமிழ்', short: 'TA' },
  { code: 'te', name: 'తెలుగు', short: 'TE' },
  { code: 'kn', name: 'ಕನ್ನಡ', short: 'KN' },
  { code: 'ml', name: 'മലയാളം', short: 'ML' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', short: 'PA' }
  */
];

interface HeaderProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
  isPersistent?: boolean;
}

export default function Header({ 
  isSidebarOpen = false, 
  setIsSidebarOpen = () => {}, 
  isPersistent = false 
}: HeaderProps = {}) {

  const {
    user,
    isAuthenticated,
    logout,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal
  } = useAuth();
  const { t, locale, setLocale } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    if (!isPersistent) setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100 w-full">

        {/* min-w-0 + overflow-x-clip on the bar prevents children from forcing horizontal overflow */}
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between gap-2 overflow-x-clip">

          {/* Left: Hamburger + Logo
              flex-1 + min-w-0 lets this side SHRINK on small screens so it never
              pushes the right-hand controls off the edge of the viewport. */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 lg:flex-none">
            {!isPersistent && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none shrink-0"
                aria-label="Open sidebar menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link href="https://vaidiktalk.com" className="flex items-center min-w-0 transition-opacity hover:opacity-80">
              <img
                src="/Vaidik-talk1.png"
                alt="Vaidik Talk Logo"
                className="h-8 sm:h-12 w-auto max-w-[110px] sm:max-w-[160px] lg:max-w-none object-contain"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-1 xl:gap-2 px-4">
            <Link href="/astrologers-chat" className="flex items-center gap-2 px-5 py-2.5 text-[15px] font-semibold text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all whitespace-nowrap border border-transparent hover:border-yellow-200">
              {t('nav.chat_astro')}
            </Link>
            <Link href="/astrologers-call" className="flex items-center gap-2 px-5 py-2.5 text-[15px] font-semibold text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all whitespace-nowrap border border-transparent hover:border-yellow-200">
              {t('nav.call_astro')}
            </Link>
            <Link href="/ai-astrologer-chat" className="flex items-center gap-2 px-5 py-2.5 text-[15px] font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all whitespace-nowrap border border-transparent hover:border-orange-200 group">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping opacity-75"></div>
              </div>
              {t('nav.ai_astro')}
            </Link>
          </nav>

          {/* Right: Auth Button / Profile
              shrink-0 keeps this cluster ALWAYS visible; left side shrinks instead. */}
          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-3 lg:gap-4">

            {/* Language Selector */}
            <div className="relative shrink-0" ref={languageMenuRef}>
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-full hover:bg-gray-50 transition-colors text-gray-700 font-semibold"
                aria-label="Select Language"
              >
                <GlobeIcon />
                <span className="hidden sm:block text-sm">
                  {LANGUAGES.find(l => l.code === locale)?.short || 'EN'}
                </span>
                <span className="hidden sm:inline"><ChevronDownIcon /></span>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute top-12 right-0 w-36 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <div className="px-4 py-1.5 mb-1 border-b border-gray-50"></div>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code as any); setIsLanguageMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between
                        ${locale === lang.code ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700 hover:bg-gray-50 hover:text-yellow-600'}
                      `}
                    >
                      {lang.name}
                      {locale === lang.code && (
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle (Three Dots) — hidden on lg+ */}
            <div className="lg:hidden relative shrink-0" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Mobile menu"
              >
                <MoreVerticalIcon />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link 
                    href="/astrologers-chat" 
                    className="flex items-center gap-3 px-6 py-4 text-[14px] font-semibold text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all border-b border-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ChatIcon /> {t('nav.chat_astro')}
                  </Link>
                  <Link 
                    href="/astrologers-call" 
                    className="flex items-center gap-3 px-6 py-4 text-[14px] font-semibold text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all border-b border-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <PhoneIcon /> {t('nav.call_astro')}
                  </Link>
                  <Link 
                    href="/ai-astrologer-chat" 
                    className="flex items-center gap-3 px-6 py-4 text-[14px] font-semibold text-orange-600 hover:bg-orange-50 transition-all border-b border-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="relative flex items-center justify-center mr-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                      <div className="absolute w-3 h-3 bg-orange-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    {t('nav.ai_astro')}
                  </Link>
                </div>
              )}
            </div>

            {/* Auth: Login Button or Profile Dropdown */}
            {!mounted || !isAuthenticated ? (
              <button
                onClick={openLoginModal}
                suppressHydrationWarning
                className="bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black font-bold px-3 py-2 sm:px-6 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md text-sm sm:text-base whitespace-nowrap shrink-0"
              >
                <UserIcon />
                <span className="hidden sm:inline">{t('nav.login')}</span>
              </button>
            ) : (
              <div className="relative shrink-0" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <span className="hidden md:block text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-black shadow-sm overflow-hidden shrink-0">
                    <img
                      src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline"><ChevronDownIcon /></span>
                </div>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute top-[60px] right-0 w-72 max-w-[calc(100vw-24px)] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 py-3 z-[100] animate-in fade-in slide-in-from-top-3 duration-300 overflow-hidden max-h-[calc(100vh-100px)] flex flex-col">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                      {/* User Info Header */}
                      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-yellow-400 p-0.5 overflow-hidden shadow-sm shrink-0">
                            <img
                              src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
                              alt={user?.name || 'User'}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[16px] font-bold text-gray-900 leading-tight truncate">
                              {user?.name || 'User'}
                            </span>
                            <span className="text-[12px] font-medium text-gray-500 mt-0.5 truncate">
                              {user?.phoneNumber || 'Premium User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="px-2 space-y-1">
                        <Link 
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors shrink-0">
                            <UserIcon />
                          </div>
                          {t('nav.profile')}
                        </Link>

                        <Link 
                          href="/wallet"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors shrink-0">
                            <WalletIcon />
                          </div>
                          {t('nav.wallet')}
                        </Link>

                        <Link 
                          href="/ai-chat-history"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors shrink-0">
                            <ChatIcon />
                          </div>
                          {t('nav.ai_history')}
                        </Link>

                        <Link 
                          href="/orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors shrink-0">
                            <OrderIcon />
                          </div>
                          {t('nav.orders')}
                        </Link>

                        <div className="pt-2 mt-2 border-t border-gray-50">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                              <LogoutIcon />
                            </div>
                            {t('common.logout')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* END Right Section */}

        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />
      {/* Sidebar rendered in Layout */}
    </>
  );
}