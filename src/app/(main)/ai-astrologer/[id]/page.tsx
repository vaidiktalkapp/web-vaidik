'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import aiAstrologerService, { AiAstrologer } from '@/lib/aiAstrologerService';
import {
  Star, MessageSquare, ArrowLeft, Languages, Clock,
  BookOpen, Target, Users, BadgeCheck, Shield, Heart,
  Zap, Info, CheckCircle, Phone } from
'lucide-react';
import { motion } from 'framer-motion';
import AiChatIntakeModal from '@/components/modals/AiChatIntakeModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/lib/imageUtils';

interface PageProps {
  params: Promise<{id: string;}>;
}

const AiAstrologerProfilePage = ({ params }: PageProps) => {
    const { t } = useTranslation();

  const { id } = use(params);
  const router = useRouter();
  const [astrologer, setAstrologer] = useState<AiAstrologer | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewLimit, setReviewLimit] = useState(3);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeMode, setIntakeMode] = useState<'chat' | 'call'>('chat');
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentBalance = user?.wallet?.balance || 0;
  const astrologerRate = Number(astrologer?.chatRate || 0);
  const minRequiredBalance = astrologerRate * 5;
  const isInsufficient = isAuthenticated && astrologerRate > 0 && currentBalance < minRequiredBalance;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [astroData, reviewsData, statsData] = await Promise.all([
          aiAstrologerService.getAiAstrologer(id),
          aiAstrologerService.getReviews(id, 1, 50), // Fetch up to 50 for "Show More"
          aiAstrologerService.getReviewStats(id)
        ]);

        setAstrologer(astroData);
        if (reviewsData?.reviews) {
          setReviews(reviewsData.reviews);
          setTotalReviews(reviewsData.pagination?.totalReviews || reviewsData.reviews.length);
        }
        setReviewStats(statsData);
      } catch (error) {
        console.error('Failed to fetch astrologer details or reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const handleStartCall = async () => {
    if (!isAuthenticated) {
      toast('Please login to start a voice consultation', { icon: 'ℹ️' });
      openLoginModal?.();
      return;
    }

    setIntakeMode('call');
    setShowIntakeModal(true);
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      toast('Please login to start a consultation', { icon: 'ℹ️' });
      openLoginModal?.();
      return;
    }
    setIntakeMode('chat');
    setShowIntakeModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-gray-200 border-t-gray-700 rounded-full" />
        
            </div>);

  }

  if (!astrologer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50">
                <p className="text-lg font-medium text-gray-800 mb-2">{t("_id_.astrologer_not_found")}</p>
                <p className="text-sm text-gray-500 mb-6">{t("_id_.this_profile_may_have_been_rem")}</p>
                <button
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
{t("_id_.go_back")}

        </button>
            </div>);

  }

  const statItems = [
  { label: 'Experience', value: astrologer.experienceYears || 5, unit: 'yrs', icon: Clock },
  { label: 'Rating', value: astrologer.rating || 4.8, unit: '/5', icon: Star },
  { label: 'Clients', value: `${(astrologer.totalChats || 1200).toLocaleString()}+`, unit: '', icon: Users },
  {
    label: 'Rate',
    value: (() => {
       const chatR = astrologer.chatRate || 0;
       const voiceR = astrologer.voiceRate || 0;
        if (astrologer.isChatEnabled === true && astrologer.isCallEnabled === true) {
            return chatR === voiceR ? (chatR > 0 ? `₹${chatR}` : 'Free') : `₹${Math.min(chatR, voiceR)}+`;
        }
        if (astrologer.isChatEnabled === true) return chatR > 0 ? `₹${chatR}` : 'Free';
        if (astrologer.isCallEnabled === true) return voiceR > 0 ? `₹${voiceR}` : 'Free';
       return 'N/A';
    })(),
    unit: '/min',
    icon: Zap
  }];


  return (
    <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-4">

                {/* Back */}
                <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          
                    <ArrowLeft className="w-4 h-4" />
{t("_id_.back")}
        </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Hero Card */}
                        <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm relative">
                            {/* Decorative background blur */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -z-0 pointer-events-none" />
              
                            <div className="p-6 relative z-10">
                                <div className="flex flex-col sm:flex-row gap-6">

                                    {/* Avatar */}
                                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start gap-3">
                                        <div className="relative p-1 rounded-2xl bg-gradient-to-br from-orange-300 to-amber-200 shadow-sm">
                                            <img
                        src={getImageUrl(astrologer.profileImage, astrologer.name)}
                        alt={astrologer.name}
                        className="w-28 h-28 rounded-xl object-cover border-4 border-white" />
                      
                                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm border-2 border-white">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
{t("_id_.live")}
                      </span>
                                        </div>
                                        {astrologer.specialization?.[0] &&
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                {astrologer.specialization[0]}
                                            </span>
                    }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{astrologer.name}</h1>
                                            <BadgeCheck className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                        </div>

                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                                            {astrologer.specialization?.[0] ?
                      `${astrologer.specialization[0]} Expert` :
                      'Astrology Expert'}
                                        </p>


                                        {/* Stats */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                            {statItems.map(({ label, value, unit, icon: Icon }) =>
                                              <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                                {value}
                                                                {unit && <span className="text-xs font-medium text-gray-400 ml-0.5">{unit}</span>}
                                                            </p>
                                                        </div>
                                              )}
                                        </div>

                                        {/* Low balance warning */}
                                        {isInsufficient &&
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                                <div className="flex items-start gap-2.5">
                                                    <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-red-700">{t("_id_.insufficient_balance")}</p>
                                                        <span className="text-gray-600 block mt-1 text-sm font-medium">
                                {t("_id_.minimum")}{minRequiredBalance}{t("_id_.required_to_start_a_session")}
                              </span>
                                                        <button
                            onClick={() => router.push('/wallet/recharge')}
                            className="mt-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">
{t("_id_.recharge_wallet")}

                          </button>
                                                    </div>
                                                </div>
                                            </div>
                    }

                                        {/* CTA Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                          {astrologer.isChatEnabled === true && (
                                              <button
                                                onClick={handleStartChat}
                                                disabled={isInsufficient}
                                                className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                                                <MessageSquare className="w-4 h-4" />
                                                {t("_id_.start_consultation")}
                                              </button>
                                          )}
                                          {astrologer.isCallEnabled === true && (
                                              <button
                                                onClick={handleStartCall}
                                                disabled={isInsufficient}
                                                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                                                <Phone className="w-4 h-4" />
                                                Voice Consultation
                                              </button>
                                          )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="border-t border-gray-100 px-6 py-5">
                                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-gray-400" />
{t("_id_.about")}
                </h2>
                                <div>
                                    <p className={`text-sm text-gray-500 leading-relaxed ${!isBioExpanded ? 'line-clamp-4' : ''}`}>
                                        {astrologer.bio ||
                      `${astrologer.name} is an experienced Vedic astrology practitioner who combines ancient wisdom with precise astronomical analysis. With a strong background in birth chart reading and planetary transit forecasting, they offer meaningful guidance on relationships, career decisions, and spiritual growth.`}
                                    </p>
                                    {((astrologer.bio && astrologer.bio.length > 200) || (!astrologer.bio)) && (
                                        <button 
                                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                                            className="text-orange-500 hover:text-orange-600 font-medium text-xs mt-2 transition-colors hover:underline"
                                        >
                                            {isBioExpanded ? 'Show Less' : 'Read More'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expertise tags */}
                            {astrologer.specialization && astrologer.specialization.length > 0 &&
              <div className="border-t border-gray-100 px-6 py-5">
                                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                        <Star className="w-4 h-4 text-gray-400" />
{t("_id_.areas_of_expertise")}
                </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {astrologer.specialization.filter(s => s.toLowerCase() !== 'palmistry').map((spec) =>
                  <span
                    key={spec}
                    className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                    
                                                {spec}
                                            </span>
                  )}
                                    </div>
                                </div>
              }

                            {/* Reviews Section */}
                            <div className="border-t border-gray-100 px-6 py-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                                            <BadgeCheck className="w-5 h-5 text-orange-500" />
                                            Reviews
                                        </h2>
                                        <p className="text-xs text-gray-400">Feedback from our spiritual community</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-2xl font-bold text-gray-900">{reviewStats?.averageRating || astrologer.rating || 4.8}</span>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star 
                                                        key={s} 
                                                        className={`w-4 h-4 ${s <= Math.round(reviewStats?.averageRating || astrologer.rating || 4.8) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{totalReviews} Reviews</p>
                                    </div>
                                </div>

                                {totalReviews > 0 ? (
                                    <>
                                        {/* Rating Breakdown Bars */}
                                        {reviewStats?.ratingBreakdown && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                <div className="flex flex-col gap-2.5">
                                                    {[5, 4, 3, 2, 1].map((rating) => {
                                                        const count = reviewStats.ratingBreakdown[rating] || 0;
                                                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                                        return (
                                                            <div key={rating} className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-gray-500 w-4">{rating}</span>
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${percentage}%` }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        className="h-full bg-orange-400 rounded-full" 
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex flex-col items-center justify-center border-l border-gray-200/50 hidden md:flex">
                                                    <div className="relative">
                                                        <div className="absolute -inset-4 bg-orange-100/50 blur-xl rounded-full" />
                                                        <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                                                            <p className="text-sm font-bold text-gray-800 text-center mb-1">Satisfied Clients</p>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                                <span className="text-2xl font-black text-gray-900">98%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Review List */}
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                            {reviews.slice(0, reviewLimit).map((review, idx) => (
                                                <motion.div 
                                                    key={review.reviewId || idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 transition-all hover:shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                                                                {review.userProfileImage ? (
                                                                    <img src={review.userProfileImage} alt={review.userName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Users className="w-5 h-5 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex">
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{review.serviceType}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-gray-400">
                                                            {new Date(review.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                                        "{review.reviewText || 'No comment provided'}"
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {reviews.length > 3 && (
                                            <div className="mt-8 text-center">
                                                {reviewLimit < reviews.length ? (
                                                    <button 
                                                        onClick={() => setReviewLimit(reviews.length)}
                                                        className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-6 py-2.5 rounded-full transition-all border border-orange-100 active:scale-95"
                                                    >
                                                        Show More Reviews ({reviews.length - reviewLimit})
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => setReviewLimit(3)}
                                                        className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-6 py-2.5 rounded-full transition-all border border-orange-100 active:scale-95"
                                                    >
                                                        Show Less Reviews
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-gray-500">No reviews yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Be the first to consult and share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Detail Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("_id_.training_background")}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                    {astrologer.bio ? 
                                        astrologer.bio.split('.')[0] + '.' : 
                                        `${t("_id_.highly_experienced_in")}${astrologer.specialization?.join(', ') || 'Vedic Astrology'}. Providing professional guidance with ${astrologer.experienceYears || 5} years of experience.`
                                    }
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {astrologer.specialization?.map((spec) => (
                                        <span key={spec} className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <Target className="w-4 h-4 text-gray-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("_id_.consultation_focus")}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                                    {astrologer.focusArea || 'Specialized guidance focused on resolving complex life challenges and providing path-breaking insights.'}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(astrologer.focusArea || 'Life Path, Prosperity').split(',').map((focus) => (
                                        <span key={focus} className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                                            {focus.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div className="flex flex-col gap-5">

                        {/* Profile summary */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                            <img
                src={getImageUrl(astrologer.profileImage, astrologer.name)}
                alt={astrologer.name}
                className="w-20 h-20 rounded-full object-cover border border-gray-200 mx-auto mb-3" />
              
                            <p className="text-sm font-semibold text-gray-900 mb-1">{astrologer.name}</p>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                {astrologer.bio ? astrologer.bio.slice(0, 80) + '...' : 'Guiding seekers through cosmic rhythms with clarity and precision.'}
                            </p>
                            <div className="flex flex-col gap-2 text-left">
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    <Heart className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600 capitalize">{astrologer.tone || 'Compassionate guidance'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    <Shield className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">
                                        {astrologer.specialization?.join(' & ') || 'Vedic Expert'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    <CheckCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">Verified AI Expert</span>
                                </div>
                            </div>
                        </div>

                        {/* Consultation details */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <p className="text-sm font-semibold text-gray-900 mb-4">{t("_id_.consultation_details")}</p>
                            <div className="flex flex-col gap-3">
                                {[
                                { label: 'Session type', value: 'Chat' },
                                {
                                  label: 'Rate',
                                  value: astrologer.chatRate && astrologer.chatRate > 0 ?
                                  `₹${astrologer.chatRate} / min` :
                                  'Free'
                                },
                                { label: 'Min. balance', value: `₹${minRequiredBalance}` },
                                { label: 'Availability', value: 'Online now', highlight: true }].
                                map(({ label, value, highlight }) =>
                                <div key={label} className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{label}</span>
                                    <span className={`text-xs font-bold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</span>
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Mantra */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                            <div className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-base">
                                ॐ
                            </div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">{t("_id_.daily_mantra")}</p>
                            <p className="text-sm font-medium text-gray-900 font-mono mb-1">ॐ श्री महालक्ष्म्यै नमः</p>
                            <p className="text-xs text-gray-400">{t("_id_.chant_for_abundance_and_wisdom")}</p>
                        </div>
                    </div>
                </div>
            </div>

            <AiChatIntakeModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        astrologer={astrologer}
        mode={intakeMode} />
      
        </div>);

};

export default AiAstrologerProfilePage;