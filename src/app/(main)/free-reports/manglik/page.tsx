'use client';
import { useTranslation } from '@/context/LanguageContext';
import React, { useState, useEffect } from 'react';
import FreeReportForm from '@/components/shared/FreeReportForm';
import { Shield, AlertCircle, CheckCircle2, Info, ChevronLeft, Sparkles, Clock, BookOpen, Star, Gem } from 'lucide-react';
import Link from 'next/link';
import { saveReportToHistory, generateReportSummary } from '@/lib/reportHistory';
import { downloadManglikPDF } from '@/lib/manglikPdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

export default function ManglikPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('freereport_manglik');
            if (saved) setReportData(JSON.parse(saved));
        } catch {}
        setMounted(true);
    }, []);

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.vaidiktalk.com'}/free-reports/manglik`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                setReportData(result.data);
                try { sessionStorage.setItem('freereport_manglik', JSON.stringify(result.data)); } catch {}
                await saveReportToHistory({
                    type: 'manglik',
                    name: formData.name || 'Unknown',
                    date: formData.date,
                    place: formData.place || '',
                    summary: result.data.manglik.is_present ? 'Manglik Dosha Detected' : 'No Manglik Dosha Found',
                    data: result.data
                });
            }
        } catch (error) {
            console.error('Error fetching Manglik report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
            <div className="w-8 h-8 border-4 border-[#b8962e]/30 border-t-[#b8962e] rounded-full animate-spin" />
        </div>
    );

    if (reportData) {
        const { manglik, input } = reportData;
        const isPresent = manglik.is_present;

        return (
            <div className="min-h-screen py-12" style={{ backgroundColor: '#fdf6e3' }}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => { setReportData(null); try { sessionStorage.removeItem('freereport_manglik'); } catch {} }}
                            className="flex items-center gap-2 text-[#b8962e] hover:text-[#7a6010] transition-colors font-bold text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Calculator
                        </button>

                        <PaidPDFButton 
                            toolKey="manglik-dosha"
                            reportName="Manglik Analysis Report"
                            downloadFn={async () => {
                                await downloadManglikPDF({
                                    input: {
                                        name: input.name,
                                        date: input.date,
                                        time: input.time,
                                        place: input.place
                                    },
                                    results: {
                                        is_present: manglik.is_present,
                                        details: manglik.details
                                    }
                                });
                            }}
                            className="px-5 py-2 !text-sm"
                        />
                    </div>

                    <div className="space-y-6">
                        {/* Hero Card */}
                        <div className={`rounded-3xl border-2 p-10 text-center shadow-xl overflow-hidden relative ${isPresent ? 'bg-white border-red-100' : 'bg-white border-emerald-100'}`}>
                            <div className="relative z-10">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border ${isPresent ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                    {isPresent ? <AlertCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {isPresent ? 'Manglik Dosha Detected' : 'No Manglik Dosha Found'}
                                </h1>
                                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                                    {isPresent 
                                        ? "Your birth chart shows an alignment of Mars that indicates Manglik Dosha (Kuja Dosha)."
                                        : "Congratulations! Your birth chart is free from the influence of Manglik Dosha."}
                                </p>
                            </div>
                        </div>

                        {/* Analysis Detail */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield className="w-5 h-5 text-[#b8962e]" />
                                <h2 className="text-xl font-bold text-gray-900">Technical Analysis</h2>
                            </div>
                            <div className="text-gray-700 leading-relaxed space-y-4">
                                <p className="p-4 rounded-xl bg-[#fdfbf3] border border-[#ede3c7] font-medium text-gray-800">
                                    {manglik.details}
                                </p>
                            </div>
                        </div>

                        {/* Educational Info */}
                        <div className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">What is Manglik Dosha?</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Manglik Dosha, also known as Kuja Dosha, occurs when Mars (Mangal) is placed in certain houses of the birth chart (Lagna Kundli) - specifically the 1st, 4th, 7th, 8th, or 12th house.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                In Vedic astrology, Mars represents energy, fire, and assertiveness. While its placement in these houses can lead to challenges in marital harmony if not understood correctly, it also grants the native great drive, courage, and technical ability.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 pb-20" style={{ backgroundColor: '#fdf6e3' }}>
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/free-reports" className="text-[#b8962e] hover:text-[#7a6010] font-bold flex items-center gap-2 text-sm">
                        <ChevronLeft className="w-4 h-4" /> Back to Reports
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Manglik Dosha Check</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Find out if you have Manglik Dosha in your birth chart and understand its impact on your life and marriage.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <FreeReportForm
                        title="Enter Birth Details"
                        onSubmit={handleSubmit}
                        loading={loading}
                        buttonText="Analyze Mars Alignment"
                        compact={true}
                    />
                </div>
            </div>
        </div>
    );
}
