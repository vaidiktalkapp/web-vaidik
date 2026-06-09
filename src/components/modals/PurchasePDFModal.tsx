'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import { X, Wallet, ShieldCheck, FileText, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PurchasePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolKey: string;
  toolName: string;
  price: number;
  onSuccess: () => void;
  reportName?: string;
}

export default function PurchasePDFModal({
  isOpen,
  onClose,
  toolKey,
  toolName,
  price,
  onSuccess,
  reportName
}: PurchasePDFModalProps) {
  const { user, refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const currentBalance = user?.wallet?.balance || 0;
  const isInsufficient = currentBalance < price;

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      const response = await apiClient.post('/pdf-pricing/purchase', {
        toolKey,
        reportName
      });

      if (response.data.success) {
        toast.success('Report unlocked successfully!');
        await refreshUser(); // Update balance in UI
        onSuccess();
      } else {
        toast.error(response.data.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-[90%] max-w-sm bg-white rounded-[24px] shadow-2xl overflow-hidden relative animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-[#fdfbf7] to-[#fff9e6] -z-10" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Header Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-yellow-100 flex items-center justify-center shadow-inner relative">
              <FileText className="w-8 h-8 text-[#b8962e]" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white text-white">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">Unlock Detailed Report</h2>
            <p className="text-gray-600 text-sm">
              Get your premium <strong>{toolName}</strong> PDF report instantly.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#fffdf5] border border-[#d6c89a] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#d6c89a]/30">
              <span className="text-gray-600 text-sm font-medium">Report Price</span>
              <span className="text-xl font-black text-gray-900">₹{price}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Your Wallet Balance</span>
              </div>
              <span className={`font-bold text-sm ${isInsufficient ? 'text-red-500' : 'text-green-600'}`}>
                ₹{currentBalance}
              </span>
            </div>
          </div>

          {/* Action Area */}
          {isInsufficient ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-[13px] text-red-700 leading-snug">
                  <p className="font-bold mb-0.5">Insufficient Balance</p>
                  <p>You need ₹{price - currentBalance} more to unlock this report.</p>
                </div>
              </div>
              
              <Link
                href="/wallet"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
              >
                Recharge Wallet
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-[#b8962e] hover:bg-[#a07c1e] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Pay & Download PDF'
              )}
            </button>
          )}

          <p className="text-center text-[10px] text-gray-400 mt-5 leading-tight">
            Secure payment powered by VaidikTalk Wallet. <br /> 
            Reports are available for lifetime in your history.
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    const { createPortal } = require('react-dom');
    return createPortal(modalContent, document.body);
  }

  return null;
}
