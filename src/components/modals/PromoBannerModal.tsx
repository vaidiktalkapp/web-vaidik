'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import walletService from '@/lib/walletService';

interface Astrologer {
  _id: string;
  name: string;
  profilePicture: string;
  availability: {
    isOnline: boolean;
  };
}

interface BannerData {
  isActive: boolean;
  title: string;
  subtitle: string;
  callText: string;
  chatText: string;
  showCall: boolean;
  showChat: boolean;
  promoImage?: string;
  redirectRoute?: string;
  astrologers: Astrologer[];
}

export default function PromoBannerModal() {
  const [data, setData] = useState<BannerData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if closed in this session
    const isClosed = sessionStorage.getItem('promo_banner_closed');
    if (isClosed === 'true') return;

    // 2. Fetch active banner from server
    const fetchBanner = async () => {
      try {
        const response = await walletService.getPromoBanner();
        if (response.success && response.data?.isActive) {
          setData(response.data);
          
          // Delay display slightly for smooth entrance animation
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 1500);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Failed to load promotional banner:', error);
      }
    };

    fetchBanner();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo_banner_closed', 'true');
  };

  const handleAction = (targetUrl: string) => {
    setIsVisible(false);
    sessionStorage.setItem('promo_banner_closed', 'true');
    router.push(targetUrl);
  };

  if (!isVisible || !data) return null;

  const hasImage = !!data.promoImage;
  const hasText = !!(data.title && data.title.trim() !== '');
  const hasSubtitle = !!(data.subtitle && data.subtitle.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      {/* Modal Box */}
      <div className={`relative w-full ${hasImage && !hasText ? 'max-w-sm' : 'max-w-md'} bg-white rounded-3xl shadow-2xl mx-4 overflow-hidden border border-gray-100 transition-all duration-300 transform scale-100 animate-slideUp`}>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className={`absolute top-4 right-4 z-30 p-2 rounded-full ${hasImage && !hasText ? 'bg-black/40 hover:bg-black/60 text-white' : 'bg-black/10 hover:bg-black/20 text-white'} transition-all focus:outline-none`}
          aria-label="Close Promo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Header Section - only show if title exists */}
        {hasText && (
          <div className="bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-500 pt-6 pb-5 text-center text-white relative flex flex-col items-center gap-3">
            {/* Subtle cosmic stars background */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Divine Symbol Badge Inside Header (Never Cut Off!) */}
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg shadow-amber-600/30 flex items-center justify-center relative z-10 transform hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-black drop-shadow-sm animate-pulse">
                🕉️
              </div>
            </div>

            <h3 className="text-2xl font-black uppercase tracking-wide px-6 drop-shadow-md relative z-10">
              {data.title}
            </h3>
          </div>
        )}

        {/* Body Section */}
        <div className={`text-center bg-white relative ${hasImage && !hasText ? 'p-0' : 'p-6'}`}>
          
          {/* Dynamic Image Banner Render */}
          {hasImage ? (
            <div 
              onClick={() => data.redirectRoute && handleAction(data.redirectRoute)}
              className={`overflow-hidden ${hasText ? 'my-4 rounded-2xl border border-gray-150 shadow-sm' : 'w-full h-auto'} ${
                data.redirectRoute ? 'cursor-pointer hover:opacity-95 transition-opacity duration-200' : ''
              }`}
            >
              <img 
                src={data.promoImage} 
                alt="Promotion" 
                className="w-full h-auto object-contain max-h-[460px] mx-auto block"
              />
            </div>
          ) : (
            /* Overlapping Astrologer profile pictures with active indicators */
            data.astrologers && data.astrologers.length > 0 && (
              <div className="flex flex-col items-center my-4">
                <div className="flex justify-center items-center -space-x-4 mb-3">
                  {data.astrologers.map((astro, idx) => (
                    <div key={astro._id} className="relative z-10 hover:z-20 transition-all transform hover:scale-105">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                          src={astro.profilePicture} 
                          alt={astro.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                      </div>
                      {/* Glowing active indicator dot */}
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-md animate-ping" />
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-md" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-600 font-bold tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Live Expert Astrologers Online
                </p>
              </div>
            )
          )}

          {/* Wrapper for text content when title/buttons are present */}
          {(hasSubtitle || (data.redirectRoute && !hasImage) || data.showCall || data.showChat) && (
            <div className={hasImage && !hasText ? 'p-6 pt-2' : ''}>
              {/* Subtitle */}
              {hasSubtitle && (
                <p className="text-gray-700 text-lg font-bold px-4 mb-6 leading-relaxed">
                  {data.subtitle}
                </p>
              )}

              {/* Optional Redirect Badge under Subtitle */}
              {data.redirectRoute && !hasImage && (
                <div className="mb-4">
                  <button 
                    onClick={() => data.redirectRoute && handleAction(data.redirectRoute)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200 transition-all cursor-pointer"
                  >
                    Explore Special Offer <span className="text-amber-600 font-extrabold">&rarr;</span>
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4 px-2">
                {data.showCall && (
                  <button
                    onClick={() => handleAction(data.redirectRoute || '/astrologers-call')}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all duration-200 transform active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.906.717H9c.17 0 .34-.02.5-.058L10.3 5.4a2 2 0 012.3 2.3l-.3 1.35a2 2 0 01-.5 1.058l-1.9 1.9a11.9 11.9 0 005.15 5.15l1.9-1.9a2 2 0 011.058-.5l1.35-.3a2 2 0 012.3 2.3l-.3 1.35c-.038.16-.058.33-.058.5V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {data.callText}
                  </button>
                )}

                {data.showChat && (
                  <button
                    onClick={() => handleAction(data.redirectRoute || '/astrologers-chat')}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-yellow-100 hover:shadow-yellow-200 transition-all duration-200 transform active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {data.chatText}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
