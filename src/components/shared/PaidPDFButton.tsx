'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import { Download, Loader2, Lock, Wallet } from 'lucide-react';
import PurchasePDFModal from '@/components/modals/PurchasePDFModal';

interface PaidPDFButtonProps {
  toolKey: string;
  reportName?: string;
  downloadFn: () => Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'none';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PaidPDFButton({
  toolKey,
  reportName,
  downloadFn,
  variant = 'primary',
  className = '',
  size = 'md'
}: PaidPDFButtonProps) {
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [pricing, setPricing] = useState<{ price: number; isActive: boolean; toolName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, [toolKey]);

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/pdf-pricing/${toolKey}`);
      if (response.data.success) {
        setPricing(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching PDF pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (!pricing) {
      toast.error('Pricing information not available');
      return;
    }

    // If price is 0, download immediately
    if (pricing.price <= 0 || !pricing.isActive) {
      await executeDownload();
      return;
    }

    // Otherwise, show purchase modal
    setIsModalOpen(true);
  };

  const executeDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadFn();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePurchaseSuccess = async () => {
    setIsModalOpen(false);
    await executeDownload();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  const isPaid = pricing && pricing.isActive && pricing.price > 0;

  return (
    <>
      <button
        onClick={handleAction}
        disabled={isDownloading}
        className={`flex items-center transition-all active:scale-95 disabled:opacity-50 ${
          variant === 'primary' 
            ? 'bg-[#b8962e] text-white hover:bg-[#a07c1e] px-6 py-2.5 rounded-xl font-bold shadow-md gap-2' 
            : variant === 'secondary'
            ? 'bg-yellow-400 text-black hover:bg-yellow-500 px-6 py-2.5 rounded-xl font-bold shadow-md gap-2'
            : variant === 'outline'
            ? 'border-2 border-[#b8962e] text-[#b8962e] hover:bg-[#b8962e]/5 px-6 py-2.5 rounded-xl font-bold shadow-md gap-2'
            : 'bg-transparent border-none p-0 font-bold gap-1.5'
        } ${className}`}
      >
        {isDownloading ? (
          <Loader2 className={size === 'sm' ? "w-3 h-3 animate-spin" : "w-4 h-4 animate-spin"} />
        ) : isPaid ? (
          <Lock className={size === 'sm' ? "w-3 h-3" : "w-4 h-4"} />
        ) : (
          <Download className={size === 'sm' ? "w-3 h-3" : "w-4 h-4"} />
        )}
        
        {isDownloading ? 'Exporting...' : isPaid ? (variant === 'none' ? `Export (₹${pricing.price})` : `Unlock PDF (₹${pricing.price})`) : 'Export PDF'}
      </button>

      {isModalOpen && pricing && (
        <PurchasePDFModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          toolKey={toolKey}
          toolName={pricing.toolName}
          price={pricing.price}
          onSuccess={handlePurchaseSuccess}
          reportName={reportName}
        />
      )}
    </>
  );
}
