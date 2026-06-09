'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Calendar, RotateCcw } from 'lucide-react';

interface ChineseZodiacFormProps {
    onSubmit: (data: { name: string; date: string }) => void;
    loading: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ChineseZodiacForm = ({ onSubmit, loading }: ChineseZodiacFormProps) => {
    const [name, setName] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

    const daysInMonth = month && year
        ? new Date(Number(year), MONTHS.indexOf(month) + 1, 0).getDate()
        : 31;
    const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

    if (!mounted) return <div className="min-h-[400px]" />; // Prevent mismatch during hydration

    const handleReset = () => {
        setName(''); setDay(''); setMonth(''); setYear('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const monthNum = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
        const dateStr = `${year}-${monthNum}-${day}`;
        onSubmit({ name, date: dateStr });
    };

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

    const ChevronDown = () => (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-[#b8962e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto px-4 mt-6 cz-form-wrap">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .cz-form-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .cz-form-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .cz-form-wrap select option { background: #fffdf5; }
            `}} />

            {/* Header — mirrors PersonalLoveForm exactly */}
            <div className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
                    <span className="text-base serif">☯</span>
                    <span className="serif">Personalized Lunar Reading</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-5 leading-tight serif">
                    Reveal Your Lunar Destiny
                </h2>
                <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto">
                    Enter your birth details to discover your <em className="serif text-gray-700 not-">celestial animal sign</em> and hidden character.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Full Name */}
                <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className={`${inputClass} pl-11`}
                        />
                    </div>
                </div>

                {/* Birth Date — day / month / year selects */}
                <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5 ml-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#b8962e]" /> Date of Birth
                    </label>

                    <div className="grid grid-cols-12 gap-3">
                        {/* Month */}
                        <div className="col-span-6 md:col-span-5 relative">
                            <select
                                required
                                value={month}
                                onChange={(e) => { setMonth(e.target.value); setDay(''); }}
                                className={selectClass}
                            >
                                <option value="">Month</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <ChevronDown />
                        </div>

                        {/* Day */}
                        <div className="col-span-3 relative">
                            <select
                                required
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Day</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown />
                        </div>

                        {/* Year */}
                        <div className="col-span-3 md:col-span-4 relative">
                            <select
                                required
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    <p className="mt-3 text-[13px] text-gray-400 text-center serif">
                        We use this to calculate your exact Lunar New Year position.
                    </p>
                </div>

                {/* Reset link */}
                <div className="flex justify-end -mt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-gray-400 hover:text-[#b8962e] transition-colors tracking-widest"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                </div>

                {/* Submit — same style as PersonalLoveForm */}
                <div className="pt-2">
                    <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full py-4 rounded-lg font-semibold text-white tracking-wide text-[15px]
                            flex items-center justify-center gap-3 transition-all
                            ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#b8962e] hover:bg-[#7a6010] shadow-lg shadow-[#b8962e]/10'}
                        `}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>Reveal My Lunar Destiny</span>
                            </>
                        )}
                    </motion.button>

                    <p className="text-center text-[11px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
                        Secure & Private Celestial Analysis
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ChineseZodiacForm;