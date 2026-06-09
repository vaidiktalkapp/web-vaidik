'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Moon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import MoonSignForm from '@/components/moon-signs/MoonSignForm';
import MoonSignResult from '@/components/moon-signs/MoonSignResult';
import { astrologyService, AstrologyCalculationRequest } from '@/lib/astrologyService';
import { moonSignStorage } from '@/lib/moonSignStorage';

function MoonSignsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);

    // Initial load and query param handling
    useEffect(() => {
        let isCancelled = false;
        
        // Check for ?new=true query param to force start fresh
        const isNew = searchParams.get('new') === 'true';
        
        if (isNew) {
            // ONLY reset if we aren't already in "new" mode or if we have a result
            // This prevents loops where searchParams change but we want to keep state
            setResult(null);
            setShowForm(true);
        } else if (!result) {
            const lastViewed = moonSignStorage.getLastViewed();
            if (lastViewed && !isCancelled) {
                setResult(lastViewed);
            }
        }
        return () => { isCancelled = true; };
    }, [searchParams]); // REMOVED [result] from dependencies to prevent reset loops

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

            const response = await astrologyService.calculateMoonSign(request);

            if (response.success) {
                const dataWithInput = { ...response.data, input: formData };
                setResult(dataWithInput);
                setShowForm(false);
                
                // Synchronous save to prevent race conditions during router replace
                moonSignStorage.setLastViewed(dataWithInput);
                await moonSignStorage.saveData(dataWithInput);
                
                // ✅ NEW: Clear ?new=true from URL if present to prevent reset on re-render
                if (searchParams.get('new')) {
                    router.replace('/moon-signs', { scroll: false });
                }

                toast.success('Your lunar destiny has been revealed!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(response.message || 'Calculation failed. Please check your details.');
            }
        } catch (err: any) {
            console.error('Moon Sign Error:', err);
            toast.error(err.response?.data?.message || 'Failed to connect to celestial bridge.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto relative z-10">
            {/* Form & Result Logic (Header is now inside MoonSignForm for professional look) */}

            <AnimatePresence mode="wait">
                {(!result || showForm) ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="w-full flex justify-center"
                    >
                        <MoonSignForm 
                            onSubmit={handleGenerate} 
                            loading={loading} 
                            onCancel={result ? () => setShowForm(false) : undefined}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
                        className="w-full"
                    >
                        <MoonSignResult 
                            data={result} 
                            onBack={() => {
                                moonSignStorage.clearLastViewed();
                                setResult(null);
                                setShowForm(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            onNew={() => {
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
// moon sign export function
export default function MoonSignsPage() {
    return (
        // ✅ ONLY CHANGE: replaced gradient+glow with solid cream background
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#fdf6e3' }}>
            <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            }>
                <MoonSignsContent />
            </Suspense>
        </div>
    );
}