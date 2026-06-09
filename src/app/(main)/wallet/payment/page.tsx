'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { calculateBonus } from '@/lib/walletService';
import paymentService from '@/lib/paymentService';

const GST_RATE = 18;

function PaymentContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, fetchUserProfile } = useAuth();

  const amount = Number(searchParams.get('amount')) || 0;
  const isBonusAvailable = searchParams.get('bonus') === 'true';
  const isWelcomePack = searchParams.get('isWelcome') === 'true';
  const welcomeBonusAmount = Number(searchParams.get('welcomeBonusAmount')) || 0;

  const [isProcessing, setIsProcessing] = useState(false);

  const baseAmount = amount;
  const bonus = isBonusAvailable ? calculateBonus(baseAmount) : { percentage: 0, amount: 0 };
  const gstAmount = parseFloat((baseAmount * GST_RATE / 100).toFixed(2));
  const totalPayable = parseFloat((baseAmount + gstAmount).toFixed(2));
  
  // Use welcomeBonusAmount for welcome packs, otherwise standard calculation
  const totalCredit = (isWelcomePack && welcomeBonusAmount) ? welcomeBonusAmount : (baseAmount + bonus.amount);

  const handlePayment = async () => {
    if (isProcessing) return;

    if (baseAmount < 1) {
      alert('Minimum recharge is ₹1');
      return;
    }

    setIsProcessing(true);

    try {
      await paymentService.completeRazorpayFlow(
        baseAmount,
        {
          phone: user?.phoneNumber,
          name: user?.name,
          email: user?.email,
          bonusPercentage: bonus.percentage
        },
        async (newBalance) => {
          setIsProcessing(false);
          await fetchUserProfile();
          alert(`Success! Added ₹${totalCredit.toLocaleString()}`);
          router.push('/wallet');
        },
        (err) => {
          setIsProcessing(false);
          alert(err || 'Payment failed');
        }
      );
    } catch (error: any) {
      setIsProcessing(false);
      alert(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t("payment.review_payment")}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Main Amount Display */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 mb-2">{t("payment.you_are_paying")}</p>
          <p className="text-5xl font-bold text-gray-900 mb-3">
            ₹{totalPayable.toFixed(2)}
          </p>
          {isWelcomePack ? (
            <span className="inline-block bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200">
              🎁 Welcome Offer
            </span>
          ) : (
            <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full">
              {t("payment.includes")}{GST_RATE}{t("payment._gst")}
            </span>
          )}
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t("payment.recharge_amount")}</span>
              <span className="font-semibold text-gray-900">
                ₹{baseAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t("payment.gst")}{GST_RATE}%)</span>
              <span className="font-semibold text-gray-900">
                + ₹{gstAmount.toFixed(2)}
              </span>
            </div>

            {bonus.amount > 0 && !isWelcomePack &&
            <div className="flex justify-between items-center text-green-600">
                <span className="font-semibold">
                  {`${t("payment.bonus_applied")}${bonus.percentage}%)`}
                </span>
                <span className="font-bold">+ ₹{bonus.amount.toLocaleString()}</span>
              </div>
            }

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">{t("payment.wallet_credit")}</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{totalCredit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className=" from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-yellow-900">{t("payment.current_balance")}</span>
            <span className="text-lg font-bold text-yellow-900">
              ₹{user?.wallet?.balance?.toFixed(0) || 0}
            </span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
          
          {isProcessing ?
          <>
              <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>{t("payment.processing")}</span>
            </> :

          <>
              <span>{t("payment.pay")}{totalPayable.toLocaleString()}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </>
          }
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
{t("payment.payments_are_100_safe_and_secu")}
        </p>
      </div>
    </div>);

}

export default function PaymentPage() {

  return (
    <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>);

}