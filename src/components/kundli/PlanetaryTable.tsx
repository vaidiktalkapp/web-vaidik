'use client';

import React from 'react';

interface PlanetaryTableProps {
    planets: any;
}

const PLANET_SYMBOLS: { [key: string]: string } = {
    "Sun": "☉", "Moon": "☽", "Mars": "♂", "Mercury": "☿",
    "Jupiter": "♃", "Venus": "♀", "Saturn": "♄", "Rahu": "☊", "Ketu": "☋",
    "Uranus": "⛢", "Neptune": "♆", "Pluto": "♇", "Ascendant": "ASC"
};

const PlanetaryTable = ({ planets }: PlanetaryTableProps) => {
    return (
        <div className="overflow-x-auto rounded-2xl border border-orange-100 shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
                <thead className="bg-orange-50/50">
                    <tr>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950">Planet</th>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950">D1 Sign</th>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950">D9 Navamsa</th>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950 text-center">Longitude</th>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950 text-center">House</th>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950">Nakshatra</th>
                        <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-orange-950">Relation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                    {planets && Object.entries(planets)
                        .map(([name, data]: any) => (
                        <tr key={name} className="hover:bg-orange-50/30 transition-colors border-b border-orange-50/50">
                            <td className="px-4 py-3 font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                <span className="text-orange-500 font-normal">{PLANET_SYMBOLS[name] || ''}</span>
                                {name}
                                {data.is_retrograde && <span className="text-red-500 text-[10px] ml-1">(R)</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">{data.sign}</td>
                            <td className="px-4 py-3 text-sm text-indigo-700 font-bold">{data.navamsa_sign}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600 text-center whitespace-nowrap">{data.longitude_dms || (data.degree % 30).toFixed(2) + '°'}</td>
                            <td className="px-4 py-3 text-sm text-center font-bold text-orange-600">H{data.house}</td>
                            <td className="px-4 py-3 text-[11px] font-medium text-gray-700">{data.navamsa_sign ? `${data.nakshatra}` : data.nakshatra}</td>
                            <td className="px-4 py-3">
                                <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                                    data.relation === 'Exalted' ? 'bg-green-100 text-green-700' :
                                    data.relation === 'Debilitated' ? 'bg-red-100 text-red-700' :
                                    data.relation === 'Own Sign' ? 'bg-orange-100 text-orange-700' :
                                    data.relation === 'Mooltrikona' ? 'bg-amber-100 text-amber-700' :
                                    data.relation === 'Friendly' ? 'bg-blue-100 text-blue-700' :
                                    data.relation === 'Enemy' ? 'bg-red-50 text-red-400' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {data.relation || 'Neutral'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlanetaryTable;