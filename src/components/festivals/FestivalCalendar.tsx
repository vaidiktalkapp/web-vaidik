'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, Sparkles, Clock } from 'lucide-react';
import { Festival } from '@/lib/mockFestivals';
import Link from 'next/link';

interface FestivalCalendarProps {
    festivals: Festival[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function FestivalCalendar({ festivals }: FestivalCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const nextMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setSelectedDay(null); };
    const prevMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); setSelectedDay(null); };
    const jumpToToday = () => { const now = new Date(); setCurrentDate(now); setSelectedDay(now.getDate()); };

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

    // Prev month filler days
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    const prevDays = Array.from({ length: firstDay }, (_, i) => prevMonthLastDate - firstDay + i + 1);
    // Next month filler days
    const nextBlanks = (7 - ((firstDay + daysInMonth) % 7)) % 7;
    const nextDays = Array.from({ length: nextBlanks }, (_, i) => i + 1);

    const getFestivalsForDay = (d: number) => {
        const ds = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return festivals.filter(f => f.date === ds);
    };

    // Selected day festivals
    const selectedFestivals = selectedDay ? getFestivalsForDay(selectedDay) : [];
    const selectedDate = selectedDay ? new Date(currentYear, currentMonth, selectedDay) : null;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

            {/* ── LEFT: Calendar Grid ── */}
            <div className="xl:col-span-8 space-y-4">
                {/* Month Navigator Bar */}
                <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-1 px-1 py-1 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.05)' }}>
                        <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-[#f5e9c8] transition-all text-gray-600 hover:text-[#7a6010] active:scale-95">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="px-4 text-center min-w-[130px]">
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#b8962e]">{currentYear}</div>
                            <div className="text-base font-semibold text-gray-900 leading-none">{MONTH_NAMES[currentMonth]}</div>
                        </div>
                        <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-[#f5e9c8] transition-all text-gray-600 hover:text-[#7a6010] active:scale-95">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 mx-1" style={{ background: '#d6c89a' }} />
                        <button onClick={jumpToToday} className="px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all active:scale-95 text-white" style={{ background: '#b8962e' }}>
                            Today
                        </button>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#d6c89a]" style={{ background: '#fffdf5' }}>
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#b8962e' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7">
                        {/* Prev month filler */}
                        {prevDays.map(day => (
                            <div key={`prev-${day}`} className="aspect-square p-2 flex flex-col items-start border-r border-b border-[#e9ddb8] opacity-30" style={{ background: 'rgba(184,150,46,0.02)' }}>
                                <span className="text-[10px] font-medium text-gray-400 self-end">{day}</span>
                            </div>
                        ))}

                        {/* Current month days */}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const isToday = isCurrentMonth && today.getDate() === day;
                            const isSelected = selectedDay === day;
                            const dayFests = getFestivalsForDay(day);
                            const hasFest = dayFests.length > 0;

                            return (
                                <motion.button
                                    key={day}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedDay(day)}
                                    className="cal-day-btn relative aspect-square p-2 flex flex-col items-start justify-between border-r border-b border-[#e9ddb8] transition-all overflow-hidden text-left"
                                    style={{
                                        background: isSelected
                                            ? 'rgba(184,150,46,0.1)'
                                            : isToday
                                            ? 'rgba(184,150,46,0.05)'
                                            : 'transparent',
                                        boxShadow: isSelected ? 'inset 0 0 0 1.5px #b8962e' : undefined,
                                    }}
                                >
                                    {/* Date number */}
                                    <span
                                        className="text-[13px] font-semibold self-end z-10"
                                        style={{
                                            color: isToday ? '#b8962e' : isSelected ? '#7a6010' : '#374151',
                                            fontWeight: isToday ? 700 : undefined,
                                        }}
                                    >
                                        {day}
                                    </span>

                                    {/* Festival name snippet (like tithi/nakshatra in astrology cal) */}
                                    <div className="w-full z-10">
                                        {hasFest ? (
                                            <>
                                                <div className="text-[9px] font-semibold truncate leading-tight" style={{ color: dayFests[0].color }}>
                                                    {dayFests[0].name}
                                                </div>
                                                {dayFests.length > 1 && (
                                                    <div className="text-[8px] font-medium truncate uppercase tracking-tight" style={{ color: '#b8962e' }}>
                                                        +{dayFests.length - 1} more
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-[9px] text-gray-300 font-medium">—</div>
                                        )}
                                    </div>

                                    {/* Dot indicators */}
                                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-10">
                                        {dayFests.map(f => (
                                            <div key={f.slug} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                                        ))}
                                        {hasFest && dayFests[0].isMajor && <Star className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                    </div>
                                </motion.button>
                            );
                        })}

                        {/* Next month filler */}
                        {nextDays.map(day => (
                            <div key={`next-${day}`} className="aspect-square p-2 flex flex-col items-start border-r border-b border-[#e9ddb8] opacity-30" style={{ background: 'rgba(184,150,46,0.02)' }}>
                                <span className="text-[10px] font-medium text-gray-400 self-end">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-5 py-3 px-5 rounded-lg border border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.04)' }}>
                    <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Major Festival</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#b8962e' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Festival Day</span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Selected Day Panel ── */}
            <div className="xl:col-span-4">
                <AnimatePresence mode="wait">
                    {selectedDay && selectedFestivals.length > 0 ? (
                        <motion.div
                            key={`${currentMonth}-${selectedDay}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-xl overflow-hidden border border-[#d6c89a]"
                        >
                            {/* Panel header */}
                            <div className="px-5 py-4 border-b border-[#d6c89a]" style={{ background: 'rgba(184,150,46,0.08)' }}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <CalendarIcon className="w-4 h-4 text-[#b8962e]" />
                                    <span className="text-[13px] font-semibold text-gray-800">Festival Details</span>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            <div className="p-4 space-y-5 max-h-[65vh] overflow-y-auto" style={{ background: '#fffdf5' }}>
                                {selectedFestivals.map(fest => (
                                    <div key={fest.slug}>
                                        {/* Festival Name + Badge */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-3 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: fest.color }} />
                                            <div>
                                                <h4 className="text-base font-bold text-gray-900 leading-tight">{fest.name}</h4>
                                                <span className="text-[11px] text-gray-500">{fest.deity}</span>
                                            </div>
                                            {fest.isMajor && (
                                                <span className="ml-auto text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Major</span>
                                            )}
                                        </div>

                                        {/* Details rows (same style as panchang PRow) */}
                                        <div className="space-y-0">
                                            <div className="flex items-start justify-between py-2.5 border-b border-[#e9ddb8] gap-3">
                                                <span className="text-[12px] font-semibold uppercase tracking-wide shrink-0" style={{ color: '#b8962e', minWidth: '90px' }}>Tithi</span>
                                                <span className="text-[13px] font-medium text-gray-900 text-right leading-snug">{fest.tithi || '--'}</span>
                                            </div>
                                            <div className="flex items-start justify-between py-2.5 border-b border-[#e9ddb8] gap-3">
                                                <span className="text-[12px] font-semibold uppercase tracking-wide shrink-0" style={{ color: '#6b7280', minWidth: '90px' }}>Month</span>
                                                <span className="text-[13px] font-medium text-gray-900 text-right leading-snug">{fest.month || '--'}</span>
                                            </div>
                                            <div className="flex items-start justify-between py-2.5 border-b border-[#e9ddb8] gap-3">
                                                <span className="text-[12px] font-semibold uppercase tracking-wide shrink-0" style={{ color: '#b8962e', minWidth: '90px' }}>Muhurat</span>
                                                <span className="text-[13px] font-medium text-gray-900 text-right leading-snug">{fest.muhurat || '--'}</span>
                                            </div>
                                            <div className="flex items-start justify-between py-2.5 gap-3">
                                                <span className="text-[12px] font-semibold uppercase tracking-wide shrink-0" style={{ color: '#6b7280', minWidth: '90px' }}>Deity</span>
                                                <span className="text-[13px] font-medium text-gray-900 text-right leading-snug">{fest.deity || '--'}</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-[12px] text-gray-600 leading-relaxed mt-3 mb-3">{fest.description}</p>

                                        {/* CTA */}
                                        <Link
                                            href={`/festivals/${fest.slug}`}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                            style={{ background: fest.color }}
                                        >
                                            <Sparkles className="w-3 h-3" /> View Full Rituals & Muhurat
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl flex flex-col items-center justify-center p-10 text-center min-h-[400px] border border-dashed border-[#d6c89a]"
                            style={{ background: 'rgba(184,150,46,0.03)' }}
                        >
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border border-[#d6c89a]"
                                style={{ background: 'rgba(184,150,46,0.06)' }}
                            >
                                <CalendarIcon className="w-6 h-6 text-[#b8962e] opacity-50" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-gray-700 mb-1">Select a Festival Day</h3>
                            <p className="text-[13px] text-gray-400">Click any highlighted date to view festival details</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .cal-day-btn:hover { background: rgba(184,150,46,0.06) !important; }
            `}</style>
        </div>
    );
}
