'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Sparkles, User, ChevronRight, Globe } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';

interface KundliFormProps {
    onSubmit: (data: any) => void;
    loading: boolean;
}

const KundliForm = ({ onSubmit, loading }: KundliFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        tzone: parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1)),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation for location
        if (!formData.lat || !formData.lon || !formData.place) {
            toast.error('Please search and select your birth city from the list.');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <style jsx global>{`
                .geoapify-autocomplete-input {
                    color: #111827 !important; /* text-gray-900 */
                    font-weight: 500;
                }
                .geoapify-autocomplete-items {
                    background-color: white !important;
                    color: #111827 !important;
                    border: 1px solid #fed7aa !important; /* border-orange-200 */
                    border-top: none;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    z-index: 9999 !important;
                    position: absolute !important;
                    width: 100% !important;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                }
                .geoapify-autocomplete-item {
                    padding: 10px 15px !important;
                }
                .geoapify-autocomplete-item:hover {
                    background-color: #fff7ed !important; /* bg-orange-50 */
                }
            `}</style>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl border border-orange-100"
            >
                {/* Header Sub-section */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-center">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Generate Your Kundli</h2>
                    <p className="text-orange-100 text-xs">Enter birth details for accurate planetary calculations</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-orange-500" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-900"
                                suppressHydrationWarning={true}
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                Gender
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium bg-white text-gray-900"
                                suppressHydrationWarning={true}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-900"
                                suppressHydrationWarning={true}
                            />
                        </div>

                        {/* Time of Birth */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                Time of Birth
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-900"
                                suppressHydrationWarning={true}
                            />
                        </div>
                    </div>

                    {/* Birth Place */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            Place of Birth
                        </label>
                        <div className="relative z-[100]">
                            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                <div className="w-full rounded-xl border-2 border-orange-100 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 outline-none transition-all bg-white text-gray-900">
                                    <GeoapifyGeocoderAutocomplete
                                        placeholder="Search your birth city..."
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

                    <button
                        type="submit"
                        disabled={loading}
                        suppressHydrationWarning={true}
                        className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white font-black py-3 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                Generate Birth Chart
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="bg-orange-50 p-4 border-t border-orange-100">
                    <p className="text-[10px] text-orange-800 text-center font-bold uppercase tracking-widest">
                        ✨ Private & Confidential • Accurate Vedic Calculations ✨
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default KundliForm;
