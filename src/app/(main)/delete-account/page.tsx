'use client';
import { useTranslation } from '@/context/LanguageContext';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { AuthService } from '../../../lib/AuthService';
import toast from 'react-hot-toast';
import { AlertTriangle, Trash2, Mail, ArrowLeft, Loader2, Info } from 'lucide-react';

export default function DeleteAccountPage() {
    const { t } = useTranslation();

  const { user } = useAuth();
  const router = useRouter();

  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<'info' | 'confirm'>('info');

  const handleDelete = async () => {
    if (!reason.trim()) {
      return toast.error('Please provide a reason for leaving');
    }

    setIsDeleting(true);
    try {
      await AuthService.deleteAccount(reason);
      toast.success('Account scheduled for deletion');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!user) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-red-50 p-6 border-b border-red-100">
          <div className="flex items-center gap-3 text-red-700 mb-2">
            <AlertTriangle size={24} />
            <h1 className="text-xl font-bold">{t("delete_account.delete_account")}</h1>
          </div>
          <p className="text-red-600/80 text-sm">
{t("delete_account.we_re_sorry_to_see_you_go")}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {step === 'info' ?
          <>
              <div className="space-y-4">
                {/* Simplified Content */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info size={18} />{t("delete_account.what_happens_next")}
                </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
{t("delete_account.your_account_has_been_schedule")}<strong>{t("delete_account.7_days")}</strong>.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
{t("delete_account.if_you_wish_to_rejoin_simply")}<strong>{t("delete_account.log_in_within_these_7_days")}</strong>{t("delete_account.to_cancel_the_deletion_and_res")}
                </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <Mail className="text-blue-600 shrink-0 mt-1" size={18} />
                  <div className="text-sm text-blue-800">
                    <strong>{t("delete_account.need_help")}</strong><br />
{t("delete_account.you_can_email_us_at")}<a href="mailto:contact@vaidiktalk.com" className="underline font-medium">{t("delete_account.contact_vaidiktalk_com")}</a>{t("delete_account.with_the_subject_delete_accoun")}
                </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                onClick={() => setStep('confirm')}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
{t("delete_account.proceed_to_delete")}

              </button>
                <button
                onClick={() => router.back()}
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
{t("delete_account.cancel")}

              </button>
              </div>
            </> :

          <>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
{t("delete_account.please_tell_us_why_you_are_lea")}
              </label>
                <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[100px]"
                placeholder="I'm not using the app anymore..." />
              
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                
                  {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
{t("delete_account.confirm_permanent_deletion")}
              </button>
                <button
                onClick={() => setStep('info')}
                disabled={isDeleting}
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                
                  <ArrowLeft size={18} />{t("delete_account.back")}
              </button>
              </div>
            </>
          }
        </div>
      </div>
    </div>);

}