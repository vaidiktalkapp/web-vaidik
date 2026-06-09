'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, ChevronRight, RotateCcw, User, Calendar, Clock, Users } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';
import { moonSignStorage } from '@/lib/moonSignStorage';

interface RashiFormProps {
    onSubmit: (data: any) => void;
    loading: boolean;
    onCancel?: () => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const RashiForm = ({ onSubmit, loading, onCancel }: RashiFormProps) => {
    const now = new Date();
    const formRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        tzone: 5.5,
    });

    React.useEffect(() => {
        const browserTzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setFormData(prev => ({ ...prev, tzone: browserTzone }));
    }, []);

    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [ampm, setAmpm] = useState('PM');
    const [unknownTime, setUnknownTime] = useState(false);

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => String(currentYear - i));
    const daysInMonth = month && year
        ? new Date(Number(year), MONTHS.indexOf(month) + 1, 0).getDate()
        : 31;
    const daysArr = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

    const handleReset = () => {
        const browserTzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setFormData({ name: '', gender: 'Male', date: '', time: '', place: '', lat: '', lon: '', tzone: browserTzone });
        setMonth(''); setDay(''); setYear('');
        setHour('12'); setMinute('00'); setAmpm('PM');
        setUnknownTime(false);
        
        moonSignStorage.clearLastViewed();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lat || !formData.lon || !formData.place) {
            toast.error('Please search and select your birth city.');
            return;
        }
        if (!month || !day || !year) {
            toast.error('Please select a complete birth date.');
            return;
        }

        const monthNum = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
        const dateStr = `${year}-${monthNum}-${day}`;
        let timeStr = '12:00';
        if (!unknownTime) {
            let h = parseInt(hour);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            timeStr = `${String(h).padStart(2, '0')}:${minute}`;
        }

        onSubmit({ ...formData, date: dateStr, time: timeStr });
    };

    const inputBase = `
        w-full px-3.5 py-2.5 rounded-xl border border-[#d6c89a]
        bg-white text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/10
        text-[14px] font-medium transition-all
    `;

    const selectBase = `
        appearance-none w-full bg-white border border-[#d6c89a] rounded-xl
        px-3.5 py-2.5 pr-10 text-gray-900 text-[14px] font-medium
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/10
        cursor-pointer transition-all
    `;

    const ChevronDown = () => (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto px-4" ref={formRef}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
                .rashi-form-container * { font-family: 'Source Sans 3', sans-serif; }
                .rashi-form-container .serif { font-family: 'Playfair Display', serif; }
                
                /* Geocoder styling integration */
                .rashi-geo .geoapify-autocomplete-input {
                    color: #111827 !important;
                    background: #fff !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 12px !important;
                    padding: 10px 14px 10px 38px !important;
                    font-size: 14px !important;
                    width: 100% !important;
                }
                .rashi-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.1) !important;
                }
            `}</style>

            <div className="rashi-form-container bg-[#fdfaf3] rounded-3xl border border-[#d6c89a] shadow-xl overflow-hidden">
                <div className="p-6 md:p-8">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 text-[#b8962e] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
                            <Sparkles className="w-4 h-4" />
                            <span>Vedic Astrology Essentials</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 serif">Vedic Rashi Calculator</h1>
                        <p className="text-gray-500 text-[14px] max-w-lg mx-auto leading-relaxed">
                            Discover your Janma Rashi and traditional Vedic traits based on classical astrology scriptures.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8" suppressHydrationWarning>
                        
                        {/* Name & Gender Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-widest">
                                    <User className="w-4 h-4 text-[#b8962e]" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className={inputBase}
                                    suppressHydrationWarning
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-widest">
                                    <Users className="w-4 h-4 text-[#b8962e]" /> Gender
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className={selectBase}
                                        suppressHydrationWarning
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown />
                                </div>
                            </div>
                        </div>

                        {/* Date of Birth Container */}
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-widest">
                                <Calendar className="w-4 h-4 text-[#b8962e]" /> Birth Date
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="relative">
                                    <select value={month} onChange={(e) => { setMonth(e.target.value); setDay(''); }} className={selectBase} suppressHydrationWarning>
                                        <option value="">Month</option>
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <div className="relative">
                                    <select value={day} onChange={(e) => setDay(e.target.value)} className={selectBase} suppressHydrationWarning>
                                        <option value="">Day</option>
                                        {daysArr.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <div className="relative">
                                    <select value={year} onChange={(e) => setYear(e.target.value)} className={selectBase} suppressHydrationWarning>
                                        <option value="">Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                            </div>
                        </div>

                        {/* Time of Birth */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-widest">
                                    <Clock className="w-4 h-4 text-[#b8962e]" /> Birth Time
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={unknownTime}
                                        onChange={(e) => setUnknownTime(e.target.checked)}
                                        className="w-4 h-4 rounded border-[#d6c89a] accent-[#b8962e]"
                                    />
                                    <span className="text-xs text-gray-500 group-hover:text-[#b8962e] transition-colors">Unknown Time</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <select value={hour} onChange={(e) => setHour(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <span className="text-gray-300 font-bold">:</span>
                                <div className="relative flex-1">
                                    <select value={minute} onChange={(e) => setMinute(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <div className="relative w-28">
                                    <select value={ampm} onChange={(e) => setAmpm(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                    <ChevronDown />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2.5">
                            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-widest">
                                <MapPin className="w-4 h-4 text-[#b8962e]" /> Birth Location
                            </label>
                            <div className="relative rashi-geo">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                    <GeoapifyGeocoderAutocomplete
                                        placeholder="Search birth city..."
                                        value={formData.place}
                                        placeSelect={(value: any) => {
                                            if (value && value.properties) {
                                                setFormData({
                                                    ...formData,
                                                    place: value.properties.formatted,
                                                    lat: value.properties.lat,
                                                    lon: value.properties.lon,
                                                    tzone: value.properties.timezone?.offset_STD_seconds ? value.properties.timezone.offset_STD_seconds / 3600 : 5.5,
                                                });
                                            }
                                        }}
                                    />
                                </GeoapifyContext>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-3 rounded-2xl bg-[#7A1F01] hover:bg-[#5a1701] text-white font-bold text-base transition-all shadow-lg shadow-red-900/10 disabled:opacity-60 flex items-center justify-center gap-3"
                                suppressHydrationWarning
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing Heavens...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Reveal My Janma Rashi
                                    </>
                                )}
                            </motion.button>
                            
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="py-2 text-sm text-gray-400 hover:text-[#b8962e] font-medium transition-colors flex items-center gap-2"
                                    suppressHydrationWarning
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Details
                                </button>
                                
                                {onCancel && (
                                    <>
                                        <div className="w-px h-4 bg-gray-300"></div>
                                        <button
                                            type="button"
                                            onClick={onCancel}
                                            className="py-2 text-sm text-gray-400 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
                                            suppressHydrationWarning
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default RashiForm;
