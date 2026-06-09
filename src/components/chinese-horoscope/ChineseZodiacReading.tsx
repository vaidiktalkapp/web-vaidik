import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Briefcase, ChevronLeft, Star, Clock, Zap, User } from 'lucide-react';
import { CHINESE_ZODIAC_DATA } from '@/lib/chineseZodiacData';

interface ChineseZodiacReadingData {
    sign: string;
    period: string;
    todayDate: string;
    vibeScore: number;
    vibeName: string;
    prediction: string;
    luckyElements?: {
        color: string;
        time: string;
        number: string;
    };
    profile?: {
        icon: string;
        personality: string;
        strengths: string[];
        weaknesses: string[];
        elementInfo: string;
        compatibility: string[];
    };
}

interface ChineseZodiacReadingProps {
    data: ChineseZodiacReadingData;
    onBack: () => void;
    onPeriodChange: (period: string) => void;
}

const ChineseZodiacReading: React.FC<ChineseZodiacReadingProps> = ({ data, onBack, onPeriodChange }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Normalize sign to Title Case to prevent case-sensitive mismatches that trigger the 'Rat' fallback
    const normalizedSign = data.sign ? data.sign.charAt(0).toUpperCase() + data.sign.slice(1).toLowerCase() : 'Rat';
    
    // Prioritize dynamic API profile (data.profile) over hardcoded data
    const zodiacData = data.profile || CHINESE_ZODIAC_DATA[normalizedSign] || CHINESE_ZODIAC_DATA['Rat'];

    const isUrl = (str: string) => {
        return str && (str.startsWith('http') || str.startsWith('/uploads') || str.includes('.'));
    };

    // Format date for the header: Monday, March 30, 2026
    const renderDateHeader = () => {
        const date = new Date(data.todayDate);

        if (data.period.toLowerCase() === 'weekly') {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(date.setDate(diff));
            const endOfWeek = new Date(date.setDate(startOfWeek.getDate() + 6));

            const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
        }

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!mounted) return <div className="min-h-[600px]" />;

    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 chinese-reading-wrap">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .chinese-reading-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .chinese-reading-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .chinese-reading-wrap h1,
                .chinese-reading-wrap h2 { font-family: 'Playfair Display', Georgia, serif; }
            `}} />

            {/* Top Nav & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <motion.button
                    onClick={onBack}
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-2 text-[#b8962e] text-[12px] font-bold transition-all group uppercase tracking-widest"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Signs</span>
                </motion.button>

                {/* Period Toggle — Minimal Style */}
                <div className="inline-flex items-center p-1 rounded-xl border border-[#d6c89a] bg-transparent">
                    {['daily', 'tomorrow', 'weekly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                                data.period.toLowerCase() === p
                                    ? 'bg-[#b8962e] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-[#b8962e]'
                            }`}
                        >
                            {p === 'daily' ? 'Today' : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-12">
                
                {/* Date Header (Imperial Style) */}
                <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 serif mb-2">
                        {renderDateHeader()}
                    </h2>
                    <div className="w-12 h-[1px] bg-[#d6c89a] mx-auto" />
                </motion.div>

                {/* Unified Reading Card — Minimalist Transparent */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="border border-[#d6c89a] rounded-2xl p-8 md:p-12 relative overflow-hidden bg-transparent"
                >
                    <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                        {/* Animal Icon Block */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border border-[#d6c89a] bg-transparent flex items-center justify-center text-6xl md:text-7xl group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                                {isUrl(zodiacData.icon) ? (
                                    <img 
                                        src={zodiacData.icon} 
                                        alt={data.sign} 
                                        className="w-full h-full object-contain" 
                                    />
                                ) : (
                                    <span>{zodiacData.icon}</span>
                                )}
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b8962e] mb-1">Celestial Sign</p>
                                <p className="text-xl font-bold text-gray-900 serif">{normalizedSign}</p>
                            </div>
                        </div>

                        {/* Narrative Content */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="text-[#b8962e] text-[11px] font-bold uppercase tracking-widest serif">
                                    {data.vibeName} Phase
                                </div>
                                <div className="h-[1px] flex-1 bg-[#d6c89a]/30" />
                            </div>

                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-normal">
                                {data.prediction}
                            </p>
                            
                            <div className="flex items-center gap-2 pt-4 border-t border-[#d6c89a]/20">
                                <Sparkles className="w-3.5 h-3.5 text-[#b8962e]" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{data.vibeScore}% Elemental Qi Alignment</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Auspicious Elements */}
                {data.luckyElements && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                        <div className="border border-[#d6c89a] rounded-2xl p-6 flex items-center justify-between group bg-transparent">
                             <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Lucky Color</p>
                                <p className="text-lg font-bold text-gray-800">{data.luckyElements.color}</p>
                             </div>
                             <div className="w-10 h-10 rounded-full border border-[#d6c89a]/30" style={{ backgroundColor: data.luckyElements.color?.toLowerCase().replace(' ', '') || 'gold' }} />
                        </div>

                        <div className="border border-[#d6c89a] rounded-2xl p-6 flex items-center gap-4 bg-transparent">
                            <div className="p-2.5 bg-amber-50/10 rounded-xl text-[#b8962e]"><Clock className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Auspicious Hour</p>
                                <p className="text-lg font-bold text-gray-800">{data.luckyElements.time}</p>
                            </div>
                        </div>

                        <div className="border border-[#d6c89a] rounded-2xl p-6 flex items-center gap-4 bg-transparent">
                            <div className="p-2.5 bg-amber-50/10 rounded-xl text-[#b8962e]"><Zap className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Fortune Number</p>
                                <p className="text-lg font-bold text-gray-800">{data.luckyElements.number}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Personality Profile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-12 border-t border-[#d6c89a]/30"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <User className="w-4 h-4 text-[#b8962e]" />
                        <h2 className="text-2xl font-semibold text-gray-900 serif tracking-tight">Celestial Personality Profile</h2>
                    </div>

                    <div className="border border-[#d6c89a] rounded-2xl p-8 md:p-10 bg-transparent transition-all">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-6">
                                <p className="text-lg text-gray-700 leading-relaxed serif">
                                    {zodiacData.personality}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#d6c89a]/20">
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Core Strengths</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {zodiacData.strengths.map(s => (
                                                <span key={s} className="px-3 py-1 rounded-full text-emerald-700 bg-emerald-50/30 text-[10px] font-bold uppercase tracking-tighter border border-emerald-100/50">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Shadow Traits</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {zodiacData.weaknesses.map(w => (
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
                                        {zodiacData.elementInfo}
                                    </p>
                                </div>
                                
                                <div className="pt-6 border-t border-[#d6c89a]/10">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#b8962e] mb-4 flex items-center gap-2">
                                        <Heart className="w-3 h-3" /> Binary Synergies
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {zodiacData.compatibility.map(c => (
                                            <span key={c} className="text-[11px] font-bold uppercase tracking-tighter text-gray-700 border border-[#d6c89a]/40 px-3 py-1.5 rounded-lg">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="text-center pt-8">
                    <p className="serif text-[#b8962e]/40 text-[13px] tracking-wide">
                        Guided by celestial movements for the Spirit of {normalizedSign}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChineseZodiacReading;
