import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Users, Compass, ChevronLeft, Star, Clock, Zap, User } from 'lucide-react';

interface Section {
    title: string;
    content: string;
}

interface ZodiacResultData {
    sign: string;
    period: string;
    todayDate: string;
    vibeScore: string;
    vibeName: string;
    sections: Section[];
    relationshipAdvice?: {
        title: string;
        content: string;
    };
    luckyElements?: {
        color: string;
        time: string;
        number: string;
    };
    profile?: {
        sign: string;
        icon: string;
        lovePersonality: string;
        strengths: string[];
        weaknesses: string[];
        elementInfo: string;
        compatibility: string[];
    };
}

interface ZodiacResultProps {
    data: ZodiacResultData;
    onBack: () => void;
    onPeriodChange: (period: string) => void;
}

const ZodiacResult: React.FC<ZodiacResultProps> = ({ data, onBack, onPeriodChange }) => {
    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 zodiac-result-wrap">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .zodiac-result-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .zodiac-result-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .zodiac-result-wrap h1,
                .zodiac-result-wrap h2 { font-family: 'Playfair Display', Georgia, serif; }
            `}} />

            {/* Top Nav */}
            <div className="flex justify-between items-center mb-6">
                <motion.button
                    onClick={onBack}
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#b8962e] text-[13px] font-semibold transition-all group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </motion.button>

                {/* Daily / Tomorrow / Weekly Toggle */}
                <div className="inline-flex items-center p-1 rounded-xl border border-[#d6c89a]" style={{ backgroundColor: 'rgba(184,150,46,0.06)' }}>
                    <button
                        onClick={() => onPeriodChange('daily')}
                        className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            data.period.toLowerCase() === 'daily'
                                ? 'bg-[#b8962e] text-white shadow-sm'
                                : 'text-gray-500 hover:text-[#b8962e]'
                        }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => onPeriodChange('tomorrow')}
                        className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            data.period.toLowerCase() === 'tomorrow'
                                ? 'bg-[#b8962e] text-white shadow-sm'
                                : 'text-gray-500 hover:text-[#b8962e]'
                        }`}
                    >
                        Tomorrow
                    </button>
                    <button
                        onClick={() => onPeriodChange('weekly')}
                        className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            data.period.toLowerCase() === 'weekly'
                                ? 'bg-[#b8962e] text-white shadow-sm'
                                : 'text-gray-500 hover:text-[#b8962e]'
                        }`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            <div className="space-y-6">

                {/* Hero Header — tight and proportional */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="pb-6 border-b border-[#d6c89a]/40"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-[1px] bg-[#b8962e]/30" />
                        <span className="serif text-[#b8962e] text-sm font-semibold">
                            {data.period.toLowerCase() === 'weekly' 
                                ? 'Weekly Celestial Outlook' 
                                : data.period.toLowerCase() === 'tomorrow' 
                                ? "Tomorrow's Love Forecast" 
                                : 'Daily Love Insight'}
                        </span>
                        <div className="w-8 h-[1px] bg-[#b8962e]/30" />
                    </div>

                    {/* Sign name — properly sized, not giant */}
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 leading-none mb-4">
                        {data.sign}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-rose-400">
                            <Heart className="w-3.5 h-3.5 fill-rose-200" />
                            <span>Luck: {data.vibeScore}%</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-[#d6c89a]" />
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#b8962e]">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Vibe: {data.vibeName}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Relationship Advice */}
                {data.relationshipAdvice && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-6 border border-[#d6c89a]/50 bg-transparent"
                    >
                        <div className="flex items-center gap-2 text-[#b8962e] mb-3">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                                {data.relationshipAdvice.title}
                            </span>
                        </div>
                        <p className="text-lg md:text-xl font-semibold text-gray-900 leading-snug serif">
                            "{data.relationshipAdvice.content}"
                        </p>
                    </motion.div>
                )}

                {/* Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {data.sections.map((section, index) => (
                        <motion.section
                            key={section.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            className={index === 0 ? 'md:col-span-2 pb-6 border-b border-[#d6c89a]/30' : ''}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#d6c89a]/40 text-[#b8962e] flex-shrink-0 bg-transparent"
                                >
                                    {section.title.toLowerCase().includes('overview') && <Compass className="w-3.5 h-3.5" />}
                                    {section.title.toLowerCase().includes('committed') && <Users className="w-3.5 h-3.5" />}
                                    {section.title.toLowerCase().includes('singles') && <Heart className="w-3.5 h-3.5" />}
                                </div>
                                <h2 className="text-[17px] font-semibold text-gray-900">
                                    {section.title}
                                </h2>
                            </div>
                            <p className="text-[14px] text-gray-600 leading-relaxed">
                                {section.content}
                            </p>
                        </motion.section>
                    ))}
                </div>

                {/* Lucky Elements */}
                {data.luckyElements && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#d6c89a]/30"
                    >
                        <div className="rounded-xl border border-[#d6c89a]/40 p-4 flex items-center gap-3 bg-transparent">
                            <div className="w-8 h-8 rounded-full border border-[#d6c89a]/40 flex items-center justify-center bg-transparent flex-shrink-0">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: data.luckyElements.color?.toLowerCase() }} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Lucky Color</p>
                                <p className="text-[13px] font-semibold text-gray-900">{data.luckyElements.color}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#d6c89a]/40 p-4 flex items-center gap-3 bg-transparent">
                            <div className="w-8 h-8 rounded-full border border-[#d6c89a]/40 flex items-center justify-center bg-transparent flex-shrink-0">
                                <Clock className="w-3.5 h-3.5 text-[#b8962e]" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Divine Timing</p>
                                <p className="text-[13px] font-semibold text-gray-900">{data.luckyElements.time}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#d6c89a]/40 p-4 flex items-center gap-3 bg-transparent">
                            <div className="w-8 h-8 rounded-full border border-[#d6c89a]/40 flex items-center justify-center bg-transparent flex-shrink-0">
                                <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-200" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Destiny Number</p>
                                <p className="text-[13px] font-semibold text-gray-900">{data.luckyElements.number}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Personality Profile */}
                {data.profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-12 border-t border-[#d6c89a]/30"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <User className="w-4 h-4 text-[#b8962e]" />
                            <h2 className="text-2xl font-semibold text-gray-900 serif tracking-tight">Celestial Love Profile</h2>
                        </div>

                        <div className="border border-[#d6c89a] rounded-2xl p-8 md:p-10 bg-transparent transition-all">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-6">
                                    <p className="text-lg text-gray-700 leading-relaxed serif">
                                        {data.profile.lovePersonality}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#d6c89a]/20">
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Core Strengths</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {data.profile.strengths?.map(s => (
                                                    <span key={s} className="px-3 py-1 rounded-full text-emerald-700 bg-emerald-50/30 text-[10px] font-bold uppercase tracking-tighter border border-emerald-100/50">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Shadow Traits</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {data.profile.weaknesses?.map(w => (
                                                    <span key={w} className="px-3 py-1 rounded-full text-rose-700 bg-rose-50/30 text-[10px] font-bold uppercase tracking-tighter border border-rose-100/50">{w}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 lg:border-l lg:border-[#d6c89a]/20 lg:pl-12">
                                    <div className="pt-6 border-t border-[#d6c89a]/10">
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#b8962e] mb-4 flex items-center gap-2">
                                            <Star className="w-3 h-3" /> Celestial Essence
                                        </h4>
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed serif">
                                            {data.profile.elementInfo}
                                        </p>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-[#d6c89a]/10">
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#b8962e] mb-4 flex items-center gap-2">
                                            <Heart className="w-3 h-3" /> Binary Synergies
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data.profile.compatibility?.map(c => (
                                                <span key={c} className="text-[11px] font-bold uppercase tracking-tighter text-gray-700 border border-[#d6c89a]/40 px-3 py-1.5 rounded-lg">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Footer */}
                <div className="text-center pt-3 border-t border-[#d6c89a]/30">
                    <p className="serif text-[#b8962e]/60 text-sm">
                        {data.period.toLowerCase() === 'weekly' 
                            ? 'Profound guidance for the week ahead' 
                            : `Divine guidance for ${data.todayDate}`}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ZodiacResult;