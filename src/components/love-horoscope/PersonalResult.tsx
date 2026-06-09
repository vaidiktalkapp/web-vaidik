import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Star, Shield, Search, Clock, Award, ChevronLeft, Zap, Moon, Download, Loader2 } from 'lucide-react';
import { downloadLoveHoroscopePDF } from '@/lib/loveHoroscopePdfGenerator';
import PaidPDFButton from '@/components/shared/PaidPDFButton';

interface ResultSection {
    title: string;
    content: string;
}

interface PersonalResultData {
    name: string;
    keyPlacements: {
        venus: string;
        mars: string;
        jupiter: string;
        moon: string;
        marriageLord: string;
    };
    loveLanguage: string;
    romanticArchetype: {
        title: string;
        description: string;
    };
    sections: ResultSection[];
    soulmateTraits: string[];
    timingInsight: string;
    input?: any;
}

interface PersonalResultProps {
    data: PersonalResultData;
    onBack: () => void;
    onReset: () => void;
}

const PersonalResult: React.FC<PersonalResultProps> = ({ data, onBack, onReset }) => {
    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await downloadLoveHoroscopePDF(data);
        } catch (error) {
            console.error('PDF error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    // SAFE DATA MAPPING: Handle legacy data structures gracefully
    const placements = data.keyPlacements || {
        venus: (data as any).venusPlacement || 'Analysis Pending',
        mars: (data as any).marsPlacement || 'Analysis Pending',
        jupiter: 'Analysis Pending',
        moon: 'Analysis Pending',
        marriageLord: 'Analysis Pending'
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 love-personal-wrap">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
                .love-personal-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .love-personal-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
            `}} />

            {/* Top Nav */}
            <div className="flex justify-between items-center mb-8">
                <motion.button
                    onClick={onBack}
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#b8962e] text-[13px] font-semibold transition-all group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </motion.button>
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={onReset}
                        className="text-[13px] font-semibold text-gray-400 hover:text-rose-500 transition-colors"
                    >
                        Reset Analysis
                    </motion.button>
                    <PaidPDFButton 
                        toolKey="love-horoscope"
                        reportName="Love Horoscope Report"
                        downloadFn={handleDownload}
                        variant="outline"
                        className="px-4 py-1.5 rounded-xl text-[12px] border-[#b8962e] text-[#b8962e] hover:bg-[#b8962e] hover:text-white"
                    />
                </div>
            </div>

            <div className="space-y-8">

                {/* Hero: Romantic Archetype */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-8 border-b border-[#d6c89a]/40"
                >
                    {/* Label — small, not italic */}
                    <div className="flex items-center gap-2 text-[#b8962e] text-xs font-semibold uppercase tracking-widest mb-3">
                        <Star className="w-3.5 h-3.5" />
                        <span>Soul Destiny Portrait</span>
                    </div>

                    {/* Archetype Title — sized down, not italic */}
                    <h1 className="serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
                        {data.romanticArchetype.title}
                    </h1>

                    {/* Description — normal weight, not italic, smaller */}
                    <p className="text-[15px] text-gray-600 leading-relaxed max-w-2xl mb-8">
                        {data.romanticArchetype.description}
                    </p>

                    {/* Celestial Placements */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <PlacementBox icon={Heart}  label="Venus"    value={placements.venus}         sub="Aura"    />
                        <PlacementBox icon={Zap}    label="Mars"     value={placements.mars}          sub="Drive"   />
                        <PlacementBox icon={Moon}   label="Moon"     value={placements.moon}          sub="Soul"    />
                        <PlacementBox icon={Award}  label="Jupiter"  value={placements.jupiter}       sub="Flow"    />
                        <PlacementBox icon={Shield} label="Marriage" value={placements.marriageLord}  sub="Destiny" customSpan="col-span-2 lg:col-span-1" />
                    </div>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Analysis Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {data.sections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="pb-6 border-b border-[#d6c89a]/30 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#d6c89a]/50 text-[#b8962e] bg-transparent flex-shrink-0">
                                        {idx === 0 && <Heart className="w-3.5 h-3.5" />}
                                        {idx === 1 && <Shield className="w-3.5 h-3.5" />}
                                        {idx === 2 && <Search className="w-3.5 h-3.5" />}
                                        {idx === 3 && <Sparkles className="w-3.5 h-3.5" />}
                                    </div>
                                    {/* Section title — serif but NOT italic */}
                                    <h3 className="serif text-[17px] font-semibold text-gray-900 tracking-tight">
                                        {section.title}
                                    </h3>
                                </div>
                                {/* Body — plain, clear, readable */}
                                <p className="text-[14px] text-gray-600 leading-relaxed">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5 lg:sticky lg:top-32 h-fit">

                        {/* Soulmate Signatures — gold accent kept */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-2xl p-6 text-white relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #b8962e, #7a6010)' }}
                        >
                            <Sparkles className="absolute -top-3 -right-3 w-16 h-16 opacity-10 rotate-12" />
                            {/* Not italic — better readability on colored bg */}
                            <h4 className="serif text-sm font-bold mb-5 pb-4 border-b border-white/20 tracking-wide">
                                Soulmate Signatures
                            </h4>
                            <div className="space-y-3">
                                {data.soulmateTraits.map((trait, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                                        <span className="text-[13px] font-medium">{trait}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Karmic Timing */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl border border-[#d6c89a] p-6 bg-transparent"
                        >
                            <div className="flex items-center gap-2 mb-3 text-rose-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Karmic Timing</span>
                            </div>
                            <h5 className="serif text-[15px] font-semibold text-gray-900 mb-3">
                                When will union manifest?
                            </h5>
                            {/* Timing text — not italic, just a left border */}
                            <p className="text-[13px] text-gray-600 leading-relaxed border-l-2 border-[#d6c89a] pl-3">
                                {data.timingInsight}
                            </p>
                        </motion.div>

                        {/* Love Language */}
                        <div className="rounded-2xl border border-[#d6c89a] p-5 text-center bg-transparent">
                            <p className="text-[#b8962e] text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">
                                Primary Connection
                            </p>
                            <p className="text-[14px] text-gray-800 font-semibold">
                                {data.loveLanguage}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-5 border-t border-[#d6c89a]/30">
                    <p className="text-[#b8962e]/60 text-sm">
                        Divine analysis formulated for {data.name}
                    </p>
                </div>

            </div>
        </div>
    );
};

function PlacementBox({ icon: Icon, label, value, sub, customSpan = "" }: any) {
    return (
        <div className={`flex flex-col items-center p-3 rounded-xl border border-[#d6c89a] bg-transparent text-center ${customSpan}`}>
            <Icon className="w-3.5 h-3.5 text-[#b8962e] mb-1.5" />
            <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">{label}</p>
            <p className="text-[12px] font-semibold text-gray-900 leading-tight">{value}</p>
            <p className="text-[9px] font-medium text-[#b8962e]/60 uppercase tracking-wide mt-0.5">{sub}</p>
        </div>
    );
}

export default PersonalResult;