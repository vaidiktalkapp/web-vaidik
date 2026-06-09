import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';
import { useTranslation } from '@/context/LanguageContext';

interface PostSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  astrologer: any;
  onSubmitRating: (rating: number, review: string) => Promise<void>;
  onContinue: () => void;
  type: 'chat' | 'call';
  isProcessing?: boolean;
}

export default function PostSessionModal({
  isOpen,
  onClose,
  onGoHome,
  astrologer,
  onSubmitRating,
  onContinue,
  type,
  isProcessing = false
}: PostSessionModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0 || isSubmitting || submitted) return;
    setIsSubmitting(true);
    try {
      await onSubmitRating(rating, review);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 text-center">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {type === 'chat' ? 'Chat Ended' : 'Call Ended'}
            </h2>
            <p className="text-gray-500 text-sm">
              Your consultation with {astrologer?.name || 'Astrologer'} has ended.
            </p>
          </div>

          <div className="w-20 h-20 mx-auto mb-4 relative">
            <img 
              src={getImageUrl(astrologer?.profileImage || astrologer?.profilePicture || astrologer?.image, astrologer?.name)} 
              alt={astrologer?.name}
              className="w-full h-full rounded-full object-cover border-4 border-yellow-400"
            />
          </div>

          {!submitted ? (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Rate your experience</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'fill-gray-100 text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review (optional)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all resize-none min-h-[80px]"
              />

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          ) : (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
              <p className="font-bold mb-1">Thank you!</p>
              <p className="text-sm">Your feedback helps us improve.</p>
            </div>
          )}

          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={onGoHome || onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={onContinue}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isProcessing ? 'Connecting...' : `Continue ${type === 'chat' ? 'Chat' : 'Call'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
