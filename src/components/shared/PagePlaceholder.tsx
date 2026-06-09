'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Construction } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function PagePlaceholder({ title, description, icon }: PagePlaceholderProps) {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[2rem] shadow-2xl border border-gray-100 max-w-2xl w-full">
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl text-white shadow-lg">
              {icon || <Construction size={48} />}
            </div>
            <div className="absolute -top-2 -right-2 text-yellow-500 animate-bounce">
              <Sparkles size={24} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          {description || "We are currently crafting this cosmic feature for you. Stay tuned for a world-class astrology experience!"}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all active:scale-95 w-full sm:w-auto"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <button
            onClick={() => router.push('/astrologers-chat')}
            className="px-10 py-4 bg-gradient-to-r from-[#922501] to-[#6A1A01] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 w-full sm:w-auto"
          >
            Explore Astrologers
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Coming Soon • VaidikTalk AI
          </p>
        </div>
      </div>
    </div>
  );
}
