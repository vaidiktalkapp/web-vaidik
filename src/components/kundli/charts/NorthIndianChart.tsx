'use client';

import React from 'react';

interface NorthIndianChartProps {
    data: {
        planets: any;
        houses: any;
        ascendant?: string; // D1 Ascendant sign
    };
    chartType?: 'D1' | 'D9' | 'Bhav';
}

const NorthIndianChart = ({ data, chartType = 'D1' }: NorthIndianChartProps) => {
    if (!data || !data.planets || !data.houses) {
        return <div className="aspect-square w-full max-w-[400px] flex items-center justify-center border-2 border-dashed border-orange-100 rounded-2xl text-orange-300 text-xs font-bold uppercase tracking-widest">Awaiting Cosmic Data...</div>;
    }

    const { planets, houses } = data;

    // Standard Vedic zodiac mapping
    const zodiacMap: Record<string, number> = {
        "Aries": 1, "Taurus": 2, "Gemini": 3, "Cancer": 4, "Leo": 5, "Virgo": 6,
        "Libra": 7, "Scorpio": 8, "Sagittarius": 9, "Capricorn": 10, "Aquarius": 11, "Pisces": 12
    };

    // Calculate D9 Ascendant Sign and House mapping
    const d9AscSign = planets["Ascendant"]?.navamsa_sign || "Aries";
    const d9AscSignIdx = zodiacMap[d9AscSign];

    const getHouseSign = (houseNum: number) => {
        if (chartType === 'D1') {
            return houses[houseNum]?.sign || "Aries";
        } else {
            // In D9, House 1 starts with the D9 Ascendant sign
            const signIdx = ((d9AscSignIdx + houseNum - 2) % 12) + 1;
            // Find sign name from index
            return Object.entries(zodiacMap).find(([_, idx]) => idx === signIdx)?.[0] || "Aries";
        }
    };

    const getPlanetsInHouse = (houseNum: number) => {
        if (chartType === 'Bhav') {
            return Object.entries(planets)
                .filter(([name, p]: any) => {
                    if (name === "Ascendant") return false;
                    return p.bhav_house === houseNum;
                })
                .map(([name, p]: any) => ({
                    short: name.substring(0, 2),
                    deg: Math.floor(p.degree),
                    isRetro: p.is_retrograde
                }));
        }

        const houseSign = getHouseSign(houseNum);
        
        return Object.entries(planets)
            .filter(([name, p]: any) => {
                if (name === "Ascendant") return false;
                const pSign = (chartType === 'D1' ? p.sign : p.navamsa_sign);
                return pSign === houseSign;
            })
            .map(([name, p]: any) => ({
                short: name.substring(0, 2),
                deg: Math.floor(p.degree),
                isRetro: p.is_retrograde
            }));
    };

    // SVG coordinates for house centers (x, y) and sign positions (sx, sy)
    const renderHouse = (h: number, sign: string, planetsList: any[]) => {
        const positions: Record<number, { x: number, y: number, sx: number, sy: number }> = {
            1: { x: 150, y: 80, sx: 150, sy: 20 },
            2: { x: 75, y: 45, sx: 65, sy: 18 },
            3: { x: 35, y: 75, sx: 20, sy: 65 },
            4: { x: 80, y: 150, sx: 20, sy: 150 },
            5: { x: 35, y: 225, sx: 20, sy: 235 },
            6: { x: 75, y: 255, sx: 65, sy: 282 },
            7: { x: 150, y: 220, sx: 150, sy: 285 },
            8: { x: 225, y: 255, sx: 235, sy: 282 },
            9: { x: 265, y: 225, sx: 282, sy: 235 },
            10: { x: 220, y: 150, sx: 280, sy: 150 },
            11: { x: 265, y: 75, sx: 282, sy: 65 },
            12: { x: 225, y: 45, sx: 235, sy: 18 },
        };

        const pos = positions[h];
        if (!pos) return null;

        // Calculate dynamic vertical centering for planets
        const lineHeight = 12;
        const totalHeight = (planetsList.length - 1) * lineHeight;
        const startY = pos.y - (totalHeight / 2);

        return (
            <g key={h}>
                {/* Sign Number */}
                <text
                    x={pos.sx} y={pos.sy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-extrabold fill-orange-800/60"
                >
                    {zodiacMap[sign] || sign}
                </text>

                {/* Planets - Center aligned within the house area */}
                <text
                    x={pos.x} y={startY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-black fill-gray-900"
                >
                    {planetsList.map((p, i) => (
                        <tspan key={i} x={pos.x} dy={i === 0 ? 0 : lineHeight}>
                            {p.short}
                            <tspan baselineShift="3" dx="1.5" className="text-[7px] font-bold fill-gray-400">
                                {p.deg}
                                {p.isRetro ? '*' : ''}
                            </tspan>
                        </tspan>
                    ))}
                </text>
            </g>
        );
    };

    return (
        <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-orange-50/10 rounded-2xl border-2 border-orange-100/50 p-4 shadow-sm">
            <svg viewBox="0 0 300 300" className="w-full h-full">
                {/* Outer Box */}
                <rect x="0" y="0" width="300" height="300" fill="none" stroke="#FB923C" strokeWidth="2" strokeOpacity="0.4" />

                {/* Diagonal Lines */}
                <line x1="0" y1="0" x2="300" y2="300" stroke="#FB923C" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="300" y1="0" x2="0" y2="300" stroke="#FB923C" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Diamond Lines */}
                <line x1="150" y1="0" x2="0" y2="150" stroke="#FB923C" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="0" y1="150" x2="150" y2="300" stroke="#FB923C" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="150" y1="300" x2="300" y2="150" stroke="#FB923C" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="300" y1="150" x2="150" y2="0" stroke="#FB923C" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Render Houses */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
                    const sign = getHouseSign(houseNum);
                    const planetsList = getPlanetsInHouse(houseNum);
                    return renderHouse(houseNum, sign, planetsList);
                })}
            </svg>
        </div>
    );
};

export default NorthIndianChart;
