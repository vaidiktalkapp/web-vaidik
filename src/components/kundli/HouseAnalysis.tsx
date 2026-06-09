'use client';

import React from 'react';
import { Home } from 'lucide-react';

interface HouseAnalysisProps {
    houses: any;
    planets: any;
}

const HouseAnalysis = ({ houses, planets }: HouseAnalysisProps) => {
    // Group planets by house
    const planetsByHouse: { [key: number]: any[] } = {};
    if (planets) {
        Object.entries(planets).forEach(([name, data]: any) => {
            const h = data.house;
            if (!planetsByHouse[h]) planetsByHouse[h] = [];
            planetsByHouse[h].push({ name, ...data });
        });
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-900 mb-6 flex items-center gap-2">
                <Home className="w-4 h-4" />
                House Representation & Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(houses).map(([num, data]: any) => (
                    <div key={num} className="bg-white rounded-3xl p-5 border border-orange-100 shadow-sm hover:border-orange-200 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">
                                    {num}
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black text-gray-900 leading-tight">{data.sign}</h4>
                                    <p className="text-[11px] font-black text-orange-700 uppercase tracking-tighter">Lord: {data.lord}</p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-[12px] font-medium text-gray-700 leading-relaxed mb-4 min-h-[2.5rem]">
                            {data.theme}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-orange-50">
                            {planetsByHouse[parseInt(num)]?.length > 0 ? (
                                planetsByHouse[parseInt(num)].map((p: any) => (
                                    <div key={p.name} className="flex flex-col gap-0.5 px-3 py-1.5 bg-orange-50/50 rounded-xl border border-orange-100 hover:bg-orange-100/50 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-900 text-[11px] font-black">{p.name}</span>
                                            <span className="text-orange-600 text-[9px] font-bold">{Math.floor(p.degree)}°</span>
                                        </div>
                                        {p.relation && p.relation !== 'Neutral' && (
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${
                                                p.relation === 'Exalted' ? 'text-green-600' : 
                                                p.relation === 'Debilitated' ? 'text-red-500' : 'text-orange-700'
                                            }`}>
                                                {p.relation}
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-2 px-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                    <span className="text-[10px] text-gray-400">This house is empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HouseAnalysis;