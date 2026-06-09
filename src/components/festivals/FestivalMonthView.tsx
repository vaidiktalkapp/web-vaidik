'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Festival } from '@/lib/mockFestivals';
import Link from 'next/link';

interface FestivalMonthViewProps {
    festivals: Festival[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function FestivalMonthView({ festivals }: FestivalMonthViewProps) {
    const sorted = [...festivals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by month
    const grouped: Record<string, Festival[]> = {};
    sorted.forEach(f => {
        const d = new Date(f.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(f);
    });

    const monthKeys = Object.keys(grouped).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
    });

    return (
        <div className="space-y-8">
            {monthKeys.map((key, mIdx) => {
                const [year, monthStr] = key.split('-');
                const monthIndex = parseInt(monthStr);
                const items = grouped[key];

                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: mIdx * 0.04 }}
                        className="bg-white border border-[#d6c89a]/40 rounded-2xl overflow-hidden shadow-sm"
                    >
                        {/* Month Header */}
                        <div className="flex items-center bg-gradient-to-r from-[#7A1F01] to-[#922501] px-6 py-3.5">
                            <h3 className="text-base font-bold text-white tracking-wide serif">
                                {MONTH_NAMES[monthIndex]} {year}
                            </h3>
                            <span className="ml-auto text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full">
                                {items.length} festival{items.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] border-b border-gray-200 bg-[#fdfaf3]">
                            <div className="px-6 py-2.5 text-[11px] font-bold text-[#b8962e] uppercase tracking-widest">
                                Date
                            </div>
                            <div className="px-6 py-2.5 text-[11px] font-bold text-[#b8962e] uppercase tracking-widest">
                                Festivals
                            </div>
                        </div>

                        {/* Festival Rows */}
                        <div className="divide-y divide-gray-100">
                            {items.map((fest, idx) => {
                                const d = new Date(fest.date);
                                const dayNum = d.getDate();
                                const dayName = DAY_NAMES[d.getDay()];

                                return (
                                    <div key={fest.slug} className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] hover:bg-[#fdfaf3] transition-colors group">
                                        <div className="px-6 py-3.5 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">{dayNum}</span>
                                            <span className="text-sm text-gray-500">{dayName}</span>
                                        </div>
                                        <div className="px-6 py-3.5 flex items-center gap-3 flex-wrap">
                                            <Link href={`/festivals/${fest.slug}`} className="flex items-center gap-2 group/link">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fest.color }} />
                                                <span className="text-sm font-bold group-hover/link:underline transition-all" style={{ color: fest.color }}>
                                                    {fest.name}
                                                </span>
                                            </Link>
                                            {fest.isMajor && (
                                                <span className="text-[9px] font-bold bg-[#b8962e]/10 text-[#b8962e] px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                                                    Major
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
