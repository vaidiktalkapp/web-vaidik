'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import RashiForm from '@/components/rashi/RashiForm';
import RashiResult from '@/components/rashi/RashiResult';
import { astrologyService, AstrologyCalculationRequest } from '@/lib/astrologyService';
import { moonSignStorage } from '@/lib/moonSignStorage';

function RashiCalculatorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        const isNew = searchParams.get('new') === 'true';
        
        if (isNew) {
            setResult(null);
            setShowForm(true);
        } else if (!result) {
            const lastViewed = moonSignStorage.getLastViewed();
            if (lastViewed && !isCancelled) {
                setResult(lastViewed);
            } else {
                setShowForm(true);
            }
        }
        return () => { isCancelled = true; };
    }, [searchParams]);

    const handleGenerate = async (formData: any) => {
        try {
            setLoading(true);
            
            const request: AstrologyCalculationRequest = {
                name: formData.name,
                date: formData.date,
                time: formData.time,
                lat: String(formData.lat),
                lon: String(formData.lon),
                place: formData.place,
                tzone: formData.tzone || 5.5
            };

            // We use the same calculation engine but provide a different UI experience
            const response = await astrologyService.calculateMoonSign(request);

            if (response.success) {
                const dataWithInput = { ...response.data, input: formData };
                setResult(dataWithInput);
                setShowForm(false);
                
                // Synchronously save last viewed to prevent race conditions during navigation
                moonSignStorage.setLastViewed(dataWithInput);
                // Async save to database history
                await moonSignStorage.saveData(dataWithInput);
                
                toast.success('Your Vedic Rashi has been revealed!');
                if (searchParams.get('new') === 'true') {
                    router.replace('/rashi-calculator', { scroll: false });
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(response.message || 'Calculation failed. Please check your details.');
            }
        } catch (err: any) {
            console.error('Rashi Error:', err);
            toast.error('Failed to connect to the Vedic calculation engine.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto relative z-10 rashi-wrap">
            <AnimatePresence mode="wait">
                {(!result || showForm) ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full flex justify-center"
                    >
                        <RashiForm 
                            onSubmit={handleGenerate} 
                            loading={loading} 
                            onCancel={result ? () => setShowForm(false) : undefined}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full"
                    >
                        <RashiResult 
                            data={result} 
                            onReset={() => {
                                moonSignStorage.clearLastViewed();
                                setResult(null);
                                setShowForm(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function RashiCalculatorPage() {
    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans" style={{ backgroundColor: '#fdf6e3' }}>
            <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8962e]"></div>
                </div>
            }>
                <RashiCalculatorContent />
            </Suspense>
        </div>
    );
}
