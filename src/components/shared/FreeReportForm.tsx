'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { birthDetailsStore } from '@/lib/birthDetailsStore';

interface FreeReportFormProps {
    title: string;
    subtitle?: string;
    onSubmit: (data: any) => void;
    loading: boolean;
    buttonText?: string;
    compact?: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const FreeReportForm = ({ title, subtitle, onSubmit, loading, buttonText = 'Generate Report', compact = false }: FreeReportFormProps) => {
    const { user, isAuthenticated, getProfileBirthDetails } = useAuth();
    const now = new Date();
    const formRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        tzone: 5.5,
        gender: 'Male',
    });

    const [unknownTime, setUnknownTime] = useState(false);
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [second, setSecond] = useState('00');
    const [ampm, setAmpm] = useState('PM');

    // Load initial data
    React.useEffect(() => {
        const browserTzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        
        // Try to get data from cross-tool store
        const stored = birthDetailsStore.get();
        if (stored) {
            setFormData({
                name: stored.name,
                date: stored.date,
                time: stored.time,
                place: stored.place,
                lat: String(stored.lat),
                lon: String(stored.lon),
                tzone: stored.tzone || browserTzone,
                gender: stored.gender || 'Male'
            });

            // Parse Date
            if (stored.date) {
                const parts = stored.date.split('-');
                if (parts.length === 3) {
                    setYear(parts[0]);
                    setMonth(MONTHS[parseInt(parts[1]) - 1]);
                    setDay(parts[2]);
                }
            }

            // Parse Time
            if (stored.time) {
                const timeParts = stored.time.split(':');
                if (timeParts.length >= 2) {
                    let h = parseInt(timeParts[0]);
                    setMinute(timeParts[1]);
                    if (timeParts.length >= 3) setSecond(timeParts[2]);
                    
                    if (h === 0) {
                        setHour('12');
                        setAmpm('AM');
                    } else if (h === 12) {
                        setHour('12');
                        setAmpm('PM');
                    } else if (h > 12) {
                        setHour(String(h - 12).padStart(2, '0'));
                        setAmpm('PM');
                    } else {
                        setHour(String(h).padStart(2, '0'));
                        setAmpm('AM');
                    }
                }
            }
        } else {
            setFormData(prev => ({ ...prev, tzone: browserTzone }));
        }
    }, []);

    const handleFillFromProfile = () => {
        const profile = getProfileBirthDetails();
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: profile.name || prev.name,
                place: profile.place || prev.place,
                gender: profile.gender || prev.gender
            }));

            if (profile.date) {
                const parts = profile.date.split('-');
                if (parts.length === 3) {
                    setYear(parts[0]);
                    setMonth(MONTHS[parseInt(parts[1]) - 1]);
                    setDay(parts[2]);
                }
            }

            if (profile.time) {
                const timeParts = profile.time.split(':');
                if (timeParts.length >= 2) {
                    let h = parseInt(timeParts[0]);
                    setMinute(timeParts[1]);
                    if (h === 0) { setHour('12'); setAmpm('AM'); }
                    else if (h === 12) { setHour('12'); setAmpm('PM'); }
                    else if (h > 12) { setHour(String(h - 12).padStart(2, '0')); setAmpm('PM'); }
                    else { setHour(String(h).padStart(2, '0')); setAmpm('AM'); }
                }
            }
            toast.success('Filled details from your profile');
        }
    };

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => String(currentYear - i));
    const daysInMonth = month && year
        ? new Date(Number(year), MONTHS.indexOf(month) + 1, 0).getDate()
        : 31;
    const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

    const handleReset = () => {
        const browserTzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setFormData({ name: '', date: '', time: '', place: '', lat: '', lon: '', tzone: browserTzone, gender: 'Male' });
        setMonth(''); setDay(''); setYear('');
        setHour('12'); setMinute('00'); setSecond('00'); setAmpm('PM');
        setUnknownTime(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lat || !formData.lon || !formData.place) {
            toast.error('Please search and select your birth city from the list.');
            return;
        }
        if (!month || !day || !year) {
            toast.error('Please select a complete date of birth.');
            return;
        }
        const monthNum = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
        const dateStr = `${year}-${monthNum}-${day}`;
        let timeStr = '';
        if (!unknownTime) {
            let h = parseInt(hour);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            timeStr = `${String(h).padStart(2, '0')}:${minute}:${second}`;
        } else {
            timeStr = '12:00:00';
        }
        onSubmit({ ...formData, date: dateStr, time: timeStr });
        
        // Save to cross-tool store
        birthDetailsStore.save({
            ...formData,
            date: dateStr,
            time: timeStr
        });
    };

    const inputBase = `
        w-full px-4 ${compact ? 'py-2.5' : 'py-3.5'} rounded-lg border border-[#d6c89a]
        bg-white text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

    const selectBase = `
        appearance-none w-full bg-white border border-[#d6c89a] rounded-lg
        px-4 ${compact ? 'py-2.5' : 'py-3.5'} pr-10 text-gray-900 text-[15px] font-normal
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
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
        <div className={`w-full max-w-2xl mx-auto bg-white rounded-2xl ${compact ? 'p-6 md:p-8' : 'p-8 md:p-12'} border border-[#d6c89a] shadow-sm`} suppressHydrationWarning>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .report-form-wrap { font-family: 'Source Sans 3', sans-serif; }
                .report-form-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                
                .report-geo .geoapify-autocomplete-input {
                    color: #111827 !important;
                    font-weight: 400;
                    background: white !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 8px !important;
                    padding: ${compact ? '10px 16px 10px 42px' : '14px 16px 14px 42px'} !important;
                    font-size: 15px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .report-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                }
            `}</style>
            
            <div className="report-form-wrap">
                <div className={`${compact ? 'mb-6' : 'text-center mb-10'}`}>
                    {!compact && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf6e3] text-[#b8962e] text-[10px] font-black uppercase tracking-widest mb-4 border border-[#d6c89a]/30">
                            <Sparkles className="w-3.5 h-3.5" /> Birth Analysis
                        </div>
                    )}
                    <h2 className={`${compact ? 'text-xl' : 'text-3xl'} font-semibold text-gray-900 mb-2 serif`}>{title}</h2>
                    {subtitle && <p className="text-gray-500 text-[14px] leading-relaxed">{subtitle}</p>}
                </div>

                <form onSubmit={handleSubmit} className={`${compact ? 'space-y-4' : 'space-y-6'}`}>
                    <div className={compact ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-6'}>
                        {/* Name */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">First Name</label>
                                 {!compact && (
                                    <div className="flex items-center gap-3">
                                        {isAuthenticated && (
                                            <button 
                                                type="button" 
                                                onClick={handleFillFromProfile} 
                                                className="flex items-center gap-1.5 text-[11px] text-[#b8962e] hover:text-[#7a6010] font-bold transition-colors"
                                                suppressHydrationWarning
                                            >
                                                <Sparkles className="w-3 h-3" /> Use My Profile
                                            </button>
                                        )}
                                        <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors" suppressHydrationWarning>
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Type here..."
                                className={inputBase}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Gender</label>
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

                    {/* Place */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Birth Place</label>
                        <div className="relative report-geo">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                <GeoapifyGeocoderAutocomplete
                                    placeholder="Find your city..."
                                    value={formData.place}
                                    placeSelect={(value: any) => {
                                        if (value && value.properties) {
                                            let selectedTzone = formData.tzone;
                                            if (value.properties.timezone && value.properties.timezone.offset_STD_seconds !== undefined) {
                                                selectedTzone = value.properties.timezone.offset_STD_seconds / 3600;
                                            }
                                            setFormData({
                                                ...formData,
                                                place: value.properties.formatted,
                                                lat: value.properties.lat,
                                                lon: value.properties.lon,
                                                tzone: selectedTzone,
                                            });
                                        }
                                    }}
                                />
                            </GeoapifyContext>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Birth Date</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <select value={month} onChange={(e) => { setMonth(e.target.value); setDay(''); }} className={selectBase} suppressHydrationWarning>
                                    <option value="">Month</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown />
                            </div>
                            <div className="relative w-24 md:w-28">
                                <select value={day} onChange={(e) => setDay(e.target.value)} className={selectBase} suppressHydrationWarning>
                                    <option value="">Day</option>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDown />
                            </div>
                            <div className="relative w-28 md:w-32">
                                <select value={year} onChange={(e) => setYear(e.target.value)} className={selectBase} suppressHydrationWarning>
                                    <option value="">Year</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown />
                            </div>
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Birth Time</label>
                        <div className="flex items-center gap-2">
                            <div className="relative w-24">
                                <select value={hour} onChange={(e) => setHour(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <ChevronDown />
                            </div>
                            <span className="text-gray-300 font-bold text-xl">:</span>
                            <div className="relative w-24">
                                <select value={minute} onChange={(e) => setMinute(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                    {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown />
                            </div>
                            <span className="text-gray-300 font-bold text-xl">:</span>
                            <div className="relative w-24">
                                <select value={second} onChange={(e) => setSecond(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                    {MINUTES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown />
                            </div>
                            <div className="relative w-24">
                                <select value={ampm} onChange={(e) => setAmpm(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40`} suppressHydrationWarning>
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                                <ChevronDown />
                            </div>
                        </div>
                        <label className="flex items-center gap-2.5 mt-4 cursor-pointer group w-fit">
                            <input
                                type="checkbox"
                                checked={unknownTime}
                                onChange={(e) => setUnknownTime(e.target.checked)}
                                className="w-4 h-4 rounded border-[#d6c89a] accent-[#b8962e] cursor-pointer"
                            />
                            <span className="text-[13px] text-gray-500 group-hover:text-gray-700 transition-colors">
                                I don't know the time of birth
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        className="w-full py-4 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-3"
                        style={{ background: '#b8962e' }}
                        suppressHydrationWarning
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {buttonText} <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default FreeReportForm;
