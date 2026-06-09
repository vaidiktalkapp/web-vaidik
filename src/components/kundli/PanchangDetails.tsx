'use client';

import React from 'react';
import { Moon, Sun, Wind, Droplets, Flame } from 'lucide-react';

interface PanchangDetailsProps {
    panchang: any;
}

const PanchangDetails = ({ panchang }: PanchangDetailsProps) => {
    const items = [
        { label: 'Tithi', value: panchang.tithi, icon: Moon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Nakshatra', value: panchang.nakshatra, icon: Sun, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Yoga', value: panchang.yoga, icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Karana', value: panchang.karana, icon: Droplets, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Sun Sign', value: panchang.sun_sign, icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Moon Sign', value: panchang.moon_sign, icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {items.map((item, i) => (
                <div key={i} className={`${item.bg} p-4 rounded-2xl border border-transparent hover:border-orange-200 transition-all flex flex-col items-center justify-center text-center gap-2 group`}>
                    <div className={`${item.color} p-2 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                        <p className={`text-sm font-bold ${item.color.replace('text-', 'text-gray-900')}`}>{item.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PanchangDetails;