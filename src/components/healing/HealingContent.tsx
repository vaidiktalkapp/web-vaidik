'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wind, Sparkles, ArrowRight, Flower2, Gem, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface CategorySection {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    items: any[];
}

export default function HealingContent() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/healing/items`);
            const data = await res.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch healing items:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories: CategorySection[] = [
        {
            id: 'meditation',
            title: 'Meditation Guidance',
            subtitle: 'Silent journeys & breathing rituals for mental clarity',
            icon: <Wind className="w-5 h-5 text-[#b8962e]" />,
            items: items.filter(i => i.type === 'meditation'),
        },
        {
            id: 'yoga',
            title: 'Yoga Information',
            subtitle: 'Sacred body alignments from the Vedic tradition',
            icon: <Flower2 className="w-5 h-5 text-[#b8962e]" />,
            items: items.filter(i => i.type === 'yoga'),
        },
        {
            id: 'crystal',
            title: 'Crystal Healing Content',
            subtitle: 'Vibrational energy of sacred gems & stones',
            icon: <Gem className="w-5 h-5 text-[#b8962e]" />,
            items: items.filter(i => i.type === 'crystal'),
        },
    ];

    return (
        <div className="min-h-screen bg-[#fffdf5] pb-20">
            <div className="relative pt-10 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-40 pointer-events-none" />
                
                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4 mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b8962e]/10 border border-[#b8962e]/20 text-[#b8962e] text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            Spiritual Wellness
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 serif leading-tight">
                            Healing & Wellness
                        </h1>
                        <p className="text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Meditation • Yoga • Crystal Healing
                        </p>
                    </motion.div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-pulse flex flex-col items-center gap-3">
                                <BookOpen className="w-10 h-10 text-[#b8962e] opacity-20" />
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Loading guides...</span>
                            </div>
                        </div>
                    )}

                    {/* Category Sections */}
                    {!loading && categories.map((cat, catIdx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIdx * 0.1 }}
                            className="mb-10"
                        >
                            <h2 className="text-center text-xl font-bold text-gray-900 serif mb-6 flex items-center justify-center gap-2">
                                {cat.icon}
                                {cat.title.split(' ').map((word, i) => 
                                    i === 0 ? <span key={i}>{word} </span> : <span key={i} className="text-[#b8962e]">{word} </span>
                                )}
                            </h2>

                            {cat.items.length > 0 ? (
                                <div className="border border-[#e8dbb8] rounded-2xl overflow-hidden bg-white">
                                    {cat.items.map((item, idx) => (
                                        <Link 
                                            key={item._id} 
                                            href={`/healing/guides/${item.slug}`}
                                            className={`flex items-center gap-3 px-6 py-4 hover:bg-[#fdf6e3] transition-colors group ${idx < cat.items.length - 1 ? 'border-b border-[#e8dbb8]/30' : ''}`}
                                        >
                                            <span className="w-7 h-7 rounded-lg bg-[#b8962e]/10 text-[#b8962e] font-bold text-xs flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="text-[14px] font-semibold text-[#b8962e] group-hover:text-[#967a26] transition-colors serif flex-1">
                                                {item.title}
                                            </span>
                                            {item.metadata?.duration && (
                                                <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                                                    {item.metadata.duration}
                                                </span>
                                            )}
                                            {item.metadata?.sanskritName && (
                                                <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                                                    {item.metadata.sanskritName}
                                                </span>
                                            )}
                                            {item.metadata?.chakra && (
                                                <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                                                    {item.metadata.chakra} Chakra
                                                </span>
                                            )}
                                            <ArrowRight className="w-3.5 h-3.5 text-[#b8962e] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-[#e8dbb8] border-dashed rounded-2xl bg-white/50 py-8 text-center">
                                    <p className="text-sm text-gray-400 serif">{cat.subtitle}</p>
                                    <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-wider font-bold">Coming soon — Add via Admin Portal</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
