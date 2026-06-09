'use client';

import React from 'react';

interface SouthIndianChartProps {
    data: {
        planets: any;
        houses: any;
    };
    chartType?: 'D1' | 'D9' | 'Bhav';
}

const SouthIndianChart = ({ data, chartType = 'D1' }: SouthIndianChartProps) => {
    if (!data || !data.planets || !data.houses) {
        return <div className="aspect-square w-full max-w-[400px] flex items-center justify-center border-2 border-dashed border-orange-100 rounded-2xl text-orange-300 text-xs font-bold uppercase tracking-widest">Awaiting Cosmic Data...</div>;
    }

    const { planets, houses } = data;

    // Fixed order of signs in South Indian chart
    const signPositions: Record<string, number> = {
        "Pisces": 0, "Aries": 1, "Taurus": 2, "Gemini": 3,
        "Cancer": 7, "Leo": 11, "Virgo": 15, "Libra": 14,
        "Scorpio": 13, "Sagittarius": 12, "Capricorn": 8, "Aquarius": 4
    };

    const boxes = [
        { name: "Pisces", x: 0, y: 0 }, { name: "Aries", x: 75, y: 0 }, { name: "Taurus", x: 150, y: 0 }, { name: "Gemini", x: 225, y: 0 },
        { name: "Cancer", x: 225, y: 75 }, { name: "Leo", x: 225, y: 150 }, { name: "Virgo", x: 225, y: 225 },
        { name: "Libra", x: 150, y: 225 }, { name: "Scorpio", x: 75, y: 225 }, { name: "Sagittarius", x: 0, y: 225 },
        { name: "Capricorn", x: 0, y: 150 }, { name: "Aquarius", x: 0, y: 75 }
    ];

    const getPlanetsInSign = (sign: string) => {
        const signPlanets = Object.entries(planets)
            .filter(([name, p]: any) => {
                if (name === "Ascendant") return false;
                const pSign = (chartType === 'D1' ? p.sign : p.navamsa_sign);
                return pSign === sign;
            })
            .map(([name, p]: any) => ({
                short: name.substring(0, 2),
                deg: Math.floor(p.degree),
                isRetro: p.is_retrograde
            }));

        // Check if Ascendant (Lagnam) is in this sign
        const lagnamSign = (chartType === 'D1'
            ? houses[1]?.sign
            : planets["Ascendant"]?.navamsa_sign);

        if (lagnamSign === sign) {
            signPlanets.unshift({ short: 'As', deg: NaN, isRetro: false }); // Ascendant marker
        }

        return signPlanets;
    };

    return (
        <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-orange-50/30 rounded-2xl border-2 border-orange-100 p-4 shadow-inner">
            <svg viewBox="0 0 300 300" className="w-full h-full">
                {/* 4x4 Grid Outline */}
                <rect x="0" y="0" width="300" height="300" fill="none" stroke="#FB923C" strokeWidth="2" />

                {/* Vertical Lines */}
                <line x1="75" y1="0" x2="75" y2="300" stroke="#FB923C" strokeWidth="1" />
                <line x1="150" y1="0" x2="150" y2="300" stroke="#FB923C" strokeWidth="1" />
                <line x1="225" y1="0" x2="225" y2="300" stroke="#FB923C" strokeWidth="1" />

                {/* Horizontal Lines */}
                <line x1="0" y1="75" x2="300" y2="75" stroke="#FB923C" strokeWidth="1" />
                <line x1="0" y1="150" x2="300" y2="150" stroke="#FB923C" strokeWidth="1" />
                <line x1="0" y1="225" x2="300" y2="225" stroke="#FB923C" strokeWidth="1" />

                {/* Empty Middle 2x2 */}
                <rect x="76" y="76" width="148" height="148" fill="white" />
                <text x="150" y="150" textAnchor="middle" className="text-sm font-black fill-orange-600 opacity-20 uppercase tracking-widest">
                    VaidikTalk
                </text>

                {/* Render Boxes */}
                {boxes.map((box, i) => {
                    const pInSign = getPlanetsInSign(box.name);
                    return (
                        <g key={i}>
                            {/* Sign Label */}
                            <text x={box.x + 5} y={box.y + 15} className="text-[8px] font-bold fill-orange-700 opacity-50 uppercase">
                                {box.name.substring(0, 3)}
                            </text>
                            {/* Planets list */}
                            {(() => {
                                const lineHeight = 13.5;
                                const totalHeight = (pInSign.length - 1) * lineHeight;
                                const startY = box.y + 37.5 - (totalHeight / 2) + 4; // Adjusted for better baseline centering

                                return (
                                    <text x={box.x + 37.5} y={startY} textAnchor="middle" className="text-[10.5px] font-black fill-gray-900">
                                        {pInSign.map((p, idx) => (
                                            <tspan key={idx} x={box.x + 37.5} dy={idx === 0 ? 0 : lineHeight} className={p.short === 'As' ? 'fill-orange-600' : ''}>
                                                {p.short}
                                                {!isNaN(p.deg) && (
                                                    <tspan baselineShift="3" className="text-[6.5px] font-bold fill-gray-400">
                                                        {p.deg}
                                                        {p.isRetro ? '*' : ''}
                                                    </tspan>
                                                )}
                                            </tspan>
                                        ))}
                                    </text>
                                );
                            })()}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default SouthIndianChart;
