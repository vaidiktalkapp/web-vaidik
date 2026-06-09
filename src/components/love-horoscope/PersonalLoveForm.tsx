'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, User, Calendar, Clock, MapPin, ChevronRight, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';
import { kundliStorage } from '@/lib/kundliStorage';

const GeoapifyGeocoderAutocomplete = dynamic(
    () => import('@geoapify/react-geocoder-autocomplete').then(mod => mod.GeoapifyGeocoderAutocomplete),
    { ssr: false }
);

interface PersonalLoveFormProps {
    onSubmit: (data: any) => void;
    loading: boolean;
}

const PersonalLoveForm: React.FC<PersonalLoveFormProps> = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        tzone: 5.5
    });

    const [hasExistingProfile, setHasExistingProfile] = useState(false);

    useEffect(() => {
        // SMART AUTO-FILL: Check if user has a profile from Kundli
        const savedData = kundliStorage.getData();
        if (savedData && savedData.input) {
            setHasExistingProfile(true);
            setFormData(prev => ({
                ...prev,
                ...savedData.input
            }));
        }

        // Default timezone
        const tz = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setFormData(prev => ({ ...prev, tzone: prev.tzone || tz }));
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            date: '',
            time: '',
            place: '',
            lat: '',
            lon: '',
            tzone: 5.5
        });
        setHasExistingProfile(false);
    };

    const inputClass = `
        w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

    return (
        <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
            <div className="w-full max-w-2xl mx-auto px-4 mt-6 love-form-wrap">
                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                    
                    .love-form-wrap * { font-family: 'Source Sans 3', sans-serif; }
                    .love-form-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }

                    .love-geo .geoapify-autocomplete-input {
                        color: #111827 !important;
                        background: transparent !important;
                        border: 1px solid #d6c89a !important;
                        border-radius: 8px !important;
                        padding: 14px 16px 14px 42px !important;
                        font-size: 15px !important;
                        width: 100% !important;
                    }
                    .love-geo .geoapify-autocomplete-input:focus {
                        border-color: #b8962e !important;
                        box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    }
                    .love-geo .geoapify-autocomplete-items {
                        background-color: #fffdf5 !important;
                        border: 1px solid #d6c89a !important;
                        border-radius: 10px !important;
                        z-index: 9999 !important;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                    }
                `}} />

                <div className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
                    <span className="text-base serif">♥</span>
                    <span className="serif">Personalized Love Reading</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-5 leading-tight serif">
                    Reveal Your Heart's Path
                </h2>
                <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto">
                    Enter your birth details to discover your <em className="serif text-gray-700 not-">celestial patterns</em> and romantic future.
                </p>
            </div>

                {hasExistingProfile && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-5 bg-[#fffdf5] border border-[#d6c89a] rounded-xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#f5e9c8] flex items-center justify-center text-[#7a6010]">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Welcome back, {formData.name || 'Seeker'}!</h4>
                                <p className="text-xs text-[#b8962e] font-medium">Your celestial profile is ready.</p>
                            </div>
                        </div>
                        <button 
                            onClick={resetForm}
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-gray-400 hover:text-[#b8962e] transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Change
                        </button>
                    </motion.div>
                )}

                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formData.lat || !formData.lon) {
                            toast.error('Please search and select your birth city from the list.');
                            return;
                        }
                        onSubmit(formData);
                    }}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className={`${inputClass} pl-11`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 ml-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#b8962e]" /> Birth Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 ml-1 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#b8962e]" /> Birth Time
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className={inputClass}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 ml-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#b8962e]" /> Birth Place
                            </label>
                            <div className="relative love-geo z-[100]">
                                <div className="absolute left-4 top-[14px] z-10 pointer-events-none text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <GeoapifyGeocoderAutocomplete
                                    placeholder="Search your birth city"
                                    value={formData.place}
                                    limit={5}
                                    placeSelect={(value: any) => {
                                        if (value && value.properties) {
                                            setFormData({
                                                ...formData,
                                                place: value.properties.formatted,
                                                lat: value.properties.lat,
                                                lon: value.properties.lon,
                                                tzone: value.properties.timezone?.offset_STD_seconds ? (value.properties.timezone.offset_STD_seconds / 3600) : formData.tzone
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            type="submit"
                            disabled={loading || !formData.lat}
                            className={`
                                w-full py-4 rounded-lg font-semibold text-white tracking-wide text-[15px]
                                flex items-center justify-center gap-3 transition-all
                                ${loading || !formData.lat ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#b8962e] hover:bg-[#7a6010] shadow-lg shadow-[#b8962e]/10'}
                            `}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Reveal Love Reading</span>
                                </>
                            )}
                        </motion.button>
                        <p className="text-center text-[11px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold"> Secure & Private Celestial Analysis </p>
                    </div>
                </form>
            </div>
        </GeoapifyContext>
    );
};

export default PersonalLoveForm;
