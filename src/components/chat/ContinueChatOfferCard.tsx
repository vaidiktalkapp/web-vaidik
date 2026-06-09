import React from 'react';
import { Star } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

interface ContinueChatOfferCardProps {
  astrologer: any;
  onContinue: () => void;
  type: 'chat' | 'call';
}

export default function ContinueChatOfferCard({ astrologer, onContinue, type }: ContinueChatOfferCardProps) {
  const displayRate = type === 'chat' 
    ? (astrologer?.chatRate || astrologer?.chatRatePerMinute || 10)
    : (astrologer?.callRate || astrologer?.callRatePerMinute || 15);
    
  const originalRate = astrologer?.originalRate || (displayRate * 2.5);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 my-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative">
            <img
              src={getImageUrl(astrologer?.profileImage || astrologer?.profilePicture || astrologer?.image, astrologer?.name)}
              alt={astrologer?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
            />
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-gray-700">{astrologer?.rating || 4.5}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight text-center">
            {astrologer?.specialization?.[0] || 'Expert'}
          </span>
        </div>

        <div className="flex-1 pt-1">
          <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">
            Hi, continue your expert consultation and get more insights at just
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-orange-600 font-extrabold text-lg md:text-xl">₹{displayRate}/min</span>
            <span className="text-gray-400 line-through text-sm">₹{originalRate}/min</span>
          </div>
          <p className="text-orange-700 font-black text-xs uppercase tracking-widest mt-1">
            One Time Offer
          </p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 text-lg uppercase tracking-wider"
      >
        Continue {type === 'chat' ? 'Chat' : 'Call'}
      </button>
    </div>
  );
}
