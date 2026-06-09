'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Calendar, Clock, MapPin, User, Sparkles, BookOpen, 
    RotateCcw, Share2, Download, Star, Shield, Zap
} from 'lucide-react';
import { RASHI_CLASSICS } from '@/lib/rashiClassics';

interface RashiResultProps {
    data: any;
    onReset: () => void;
}

const RashiResult = ({ data, onReset }: RashiResultProps) => {
    const sign = data.moonSign || 'Capricorn'; // Defaults to Capricorn for demo if missing
    const classicsData = RASHI_CLASSICS[sign] || RASHI_CLASSICS['Capricorn'];
    
    // Format date for display
    const dateObj = new Date(data.input?.date || Date.now());
    const displayDate = dateObj.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Day of the week
    const displayDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 pb-8">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
                .rashi-res * { font-family: 'Source Sans 3', sans-serif; }
                .rashi-res .serif { font-family: 'Playfair Display', serif; }
            `}</style>

            <div className="rashi-res space-y-6">
                
                {/* ── TOP ACTION BAR ── */}
                <div className="flex justify-between items-center bg-white p-2.5 px-4 rounded-xl border border-gray-200 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-sm uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-[#b8962e]" />
                        <span>Vedic Rashi Report</span>
                    </div>
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fdf6e3] text-[#b8962e] font-bold rounded-lg border border-[#e5d5b0] hover:bg-[#b8962e] justify-center hover:text-white transition-all text-xs uppercase"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        New Calculation
                    </button>
                </div>

                {/* ── HERO SECTION (Professional Theme) ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7A1F01] to-[#5a1701] shadow-lg text-white"
                >
                    {/* Subtle ornamental overlay */}
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
                           <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none"/>
                           <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke="white" strokeWidth="1"/>
                        </svg>
                    </div>

                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Circle Symbol */}
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-white/10 border-2 border-[#b8962e] flex items-center justify-center relative shadow-inner backdrop-blur-sm">
                            <span className="text-[40px] md:text-[48px] text-[#e5d5b0] leading-none drop-shadow-md">{classicsData.symbol}</span>
                            <div className="absolute -bottom-1.5 -right-1.5 bg-[#7A1F01] rounded-full p-1.5 shadow-sm border border-[#b8962e]">
                                <Sparkles className="w-3.5 h-3.5 text-[#e5d5b0]" />
                            </div>
                        </div>

                        {/* Sign Names & Details */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 opacity-80 text-[11px] font-bold tracking-[0.2em] uppercase">
                                <span>Janma Rashi</span>
                                <span>•</span>
                                <span>Vedic Moon Sign</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-[#e5d5b0] serif leading-tight mb-1 tracking-wide">
                                {classicsData.sanskritName}
                            </h3>
                            <p className="text-lg md:text-xl font-medium text-white/90 tracking-tight mb-4">
                                {classicsData.englishName}
                            </p>
                            
                            {/* Birth Data Strip */}
                            <div className="inline-flex flex-wrap items-center justify-center md:justify-start gap-4 bg-white/10 px-4 py-2 rounded-lg text-[13px] border border-white/10 font-semibold backdrop-blur-sm">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#b8962e]" />
                                    <span>{displayDate}</span>
                                </div>
                                <div className="w-px h-3 bg-white/30 hidden sm:block"></div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#b8962e]" />
                                    <span>{data.input?.time || 'Unknown'} {data.input?.time?.includes(':') ? '' : 'PM'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── CLASSICS SECTION (Professional & Compact) ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                    className="bg-white rounded-2xl border border-[#d6c89a] shadow-sm overflow-hidden"
                >
                    <div className="p-6 md:p-8 space-y-6">
                        
                        {/* Title Box */}
                        <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 serif tracking-tight mb-1">
                                    Classical Interpretation
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">{sign} Rasi according to ancient scriptures</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#7A1F01] bg-[#7A1F01]/5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest border border-[#7A1F01]/10">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Vedic Texts</span>
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium">
                            {classicsData.classics.split('. ').filter(s => s.trim().length > 0).map((sentence, idx) => (
                                <p key={idx} className="mb-3">
                                    {sentence.trim()}.
                                </p>
                            ))}
                        </div>

                        {/* Quick References - Compact Professional Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 mt-6">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#e5d5b0] transition-colors group">
                                <div className="p-2 rounded-lg bg-[#7A1F01]/5 text-[#7A1F01] group-hover:bg-[#7A1F01] group-hover:text-white transition-colors">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block font-bold text-[11px] uppercase tracking-widest text-gray-900 mb-0.5">Strength</span>
                                    <p className="text-[13px] text-gray-600 leading-snug font-medium">{classicsData.traits?.strength}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#e5d5b0] transition-colors group">
                                <div className="p-2 rounded-lg bg-[#b8962e]/10 text-[#b8962e] group-hover:bg-[#b8962e] group-hover:text-white transition-colors">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block font-bold text-[11px] uppercase tracking-widest text-gray-900 mb-0.5">Power</span>
                                    <p className="text-[13px] text-gray-600 leading-snug font-medium">{classicsData.traits?.power}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#e5d5b0] transition-colors group">
                                <div className="p-2 rounded-lg bg-[#5e4922]/5 text-[#5e4922] group-hover:bg-[#5e4922] group-hover:text-white transition-colors">
                                    <Star className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block font-bold text-[11px] uppercase tracking-widest text-gray-900 mb-0.5">Insight</span>
                                    <p className="text-[13px] text-gray-600 leading-snug font-medium">{classicsData.traits?.insight}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── BOTTOM ACTIONS ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-5 py-2.5 text-gray-600 font-bold rounded-xl hover:bg-white hover:text-gray-900 transition-all text-sm border border-transparent hover:border-gray-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Recalculate
                    </button>
                    <div className="flex gap-2.5 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#b8962e] border border-[#e5d5b0] font-bold rounded-xl hover:bg-[#b8962e] hover:text-white transition-all text-sm shadow-sm group">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7A1F01] text-white border border-[#7A1F01] font-bold rounded-xl hover:bg-[#5a1701] transition-all text-sm shadow-sm opacity-90 hover:opacity-100 group">
                            <Download className="w-4 h-4" />
                            <span>Report</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RashiResult;
