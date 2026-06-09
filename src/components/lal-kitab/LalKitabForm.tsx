'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import { useTranslation } from '@/context/LanguageContext';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';
import { BookOpen, ChevronRight, MapPin, User } from 'lucide-react';

interface LalKitabFormProps {
    onSubmit: (data: any) => void;
    loading: boolean;
    onCancel?: () => void;
}

const LalKitabForm = ({ onSubmit, loading, onCancel }: LalKitabFormProps) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        tzone: 5.5, // Default for server-side
    });

    useEffect(() => {
        setMounted(true);
        // Set client-side timezone
        setFormData(prev => ({
            ...prev,
            tzone: parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1))
        }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.lat || !formData.lon || !formData.place) {
            toast.error(t('lal_kitab.select_city_error'));
            return;
        }

        onSubmit(formData);
    };

    if (!mounted) return <div className="min-h-[400px]" />; // Prevent mismatch

    const inputClass = `
        w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

    const selectClass = `
        appearance-none w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all cursor-pointer
    `;

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .lk-form-wrap * {
                    font-family: 'Source Sans 3', sans-serif;
                }
                .lk-form-wrap h1,
                .lk-form-wrap .serif {
                    font-family: 'Playfair Display', Georgia, serif;
                }

                /* Geocoder overrides — transparent to match page */
                .lk-geo,
                .lk-geo > div,
                .lk-geo .geoapify-container {
                    width: 100% !important;
                }
                .lk-geo .geoapify-autocomplete-input {
                    color: #111827 !important;
                    font-weight: 400;
                    background: transparent !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 8px !important;
                    padding: 14px 16px 14px 42px !important;
                    font-size: 15px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    line-height: 1.5 !important;
                    box-shadow: none !important;
                }
                .lk-geo .geoapify-autocomplete-input::placeholder {
                    color: #9ca3af !important;
                }
                .lk-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }
                .lk-geo .geoapify-autocomplete-items {
                    background-color: #fffdf5 !important;
                    color: #111827 !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 10px !important;
                    z-index: 9999 !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                    font-size: 14px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                }
                .lk-geo .geoapify-autocomplete-item:hover {
                    background-color: #f5e9c8 !important;
                    color: #7a6010 !important;
                }

                select option {
                    background-color: #fffdf5;
                    color: #111827;
                }
            `}</style>

            <div className="lk-form-wrap">

                {/* Subtle Section Header (Kundli Style) */}
                <div className="mb-6 flex items-center gap-2 text-gray-900 border-b border-[#d6c89a]/30 pb-4">
                    <User className="w-4 h-4 text-[#b8962e]" />
                    <span className="text-[15px] font-bold uppercase tracking-wider">{t("lal_kitab.birth_details")}</span>
                </div>

                {/* Form — flat, no card, part of the page */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">

                        {/* Full Name */}
                        <div>
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                                {t("lal_kitab.seekers_name")}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t("lal_kitab.enter_full_name")}
                                className={inputClass}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                                {t("lal_kitab.gender")}
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className={selectClass}
                                    suppressHydrationWarning
                                >
                                    <option value="Male">{t("lal_kitab.male")}</option>
                                    <option value="Female">{t("lal_kitab.female")}</option>
                                    <option value="Other">{t("lal_kitab.other")}</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                                {t("lal_kitab.date_of_birth")}
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className={inputClass}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Time of Birth */}
                        <div>
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                                {t("lal_kitab.time_of_birth")}
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className={inputClass}
                                suppressHydrationWarning
                            />
                        </div>
                    </div>

                    {/* City of Birth — full width */}
                    <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                            {t("lal_kitab.city_of_birth")}
                        </label>
                        <div className="relative lk-geo">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                <div className="w-full">
                                    <GeoapifyGeocoderAutocomplete
                                        placeholder={t("lal_kitab.search_city_prompt")}
                                        value={formData.place}
                                        placeSelect={(value: any) => {
                                            if (value && value.properties) {
                                                setFormData({
                                                    ...formData,
                                                    place: value.properties.formatted,
                                                    lat: value.properties.lat,
                                                    lon: value.properties.lon
                                                });
                                            } else {
                                                setFormData({ ...formData, place: '', lat: '', lon: '' });
                                            }
                                        }}
                                    />
                                </div>
                            </GeoapifyContext>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2 flex flex-col items-stretch gap-5">
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.005 }}
                            whileTap={{ scale: loading ? 1 : 0.995 }}
                            className="w-full py-4 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: '#b8962e' }}
                            suppressHydrationWarning
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <BookOpen className="w-4 h-4" />
                                    {t("lal_kitab.unlock_secrets")}
                                </>
                            )}
                        </motion.button>

                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-[#b8962e] transition-colors"
                            >
                                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                                {t("lal_kitab.back_to_result")}
                            </button>
                        )}
                    </div>

                </motion.form>
            </div>
        </div>
    );
};

export default LalKitabForm;