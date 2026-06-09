'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Festival } from '@/lib/mockFestivals';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

interface FestivalListProps {
    festivals: Festival[];
}

export default function FestivalList({ festivals }: FestivalListProps) {
    const sortedFestivals = [...festivals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFestivals.map((fest, idx) => {
                const festDate = new Date(fest.date);
                const day = festDate.getDate();
                const month = festDate.toLocaleString('default', { month: 'short' });

                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={fest.slug} 
                        className="bg-white border border-[#d6c89a]/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
                    >
                        {/* Top Banner */}
                        <div className="h-2 w-full" style={{ backgroundColor: fest.color }} />
                        
                        <div className="p-6 flex flex-col flex-grow">
                            {/* Header row: Date box + Title */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border" style={{ borderColor: `${fest.color}30`, backgroundColor: `${fest.color}10` }}>
                                    <span className="text-xs font-bold uppercase" style={{ color: fest.color }}>{month}</span>
                                    <span className="text-xl font-bold" style={{ color: fest.color }}>{day}</span>
                                </div>
                                <div className="flex-grow pt-1">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#b8962e] transition-colors">{fest.name}</h3>
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{fest.deity !== 'None' ? fest.deity : 'Cultural Festival'}</span>
                                </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3 flex-grow">
                                {fest.description}
                            </p>
                            
                            {/* Info Badges */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 text-[#b8962e]" /> Tithi: {fest.month} {fest.tithi}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <Clock className="w-3.5 h-3.5 text-[#b8962e]" /> {fest.muhurat?.length > 40 ? fest.muhurat.substring(0, 40) + '…' : fest.muhurat}
                                </div>
                            </div>

                            {/* Action */}
                            <Link href={`/festivals/${fest.slug}`} className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between group/btn text-sm font-semibold text-[#b8962e] hover:text-[#7A1F01] transition-colors">
                                View Full Muhurat & Rituals
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
