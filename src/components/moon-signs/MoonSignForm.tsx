'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Moon, ChevronRight, RotateCcw } from 'lucide-react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { toast } from 'react-hot-toast';

interface MoonSignFormProps {
    onSubmit: (data: any) => void;
    loading: boolean;
    onCancel?: () => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const MOON_SIGNS = [
    { sign: 'Aries Moon', symbol: '♈', traits: 'Bold, impulsive, and emotionally direct. Aries Moon individuals react quickly and feel emotions with great intensity. They need independence and dislike emotional restrictions.' },
    { sign: 'Taurus Moon', symbol: '♉', traits: 'Calm, grounded, and comfort-seeking. Taurus Moon finds emotional security in stability, routine, and sensory pleasures. They are deeply loyal and slow to change.' },
    { sign: 'Gemini Moon', symbol: '♊', traits: 'Curious, communicative, and adaptable. Gemini Moon processes emotions through conversation and intellectual exploration. They need variety and mental stimulation to feel settled.' },
    { sign: 'Cancer Moon', symbol: '♋', traits: 'Deeply nurturing, sensitive, and intuitive. Cancer Moon is the most emotionally connected placement, with strong bonds to home, family, and the past.' },
    { sign: 'Leo Moon', symbol: '♌', traits: 'Warm, expressive, and generous. Leo Moon needs recognition and affection to feel emotionally fulfilled. They bring dramatic flair and heartfelt loyalty to all relationships.' },
    { sign: 'Virgo Moon', symbol: '♍', traits: 'Analytical, thoughtful, and service-oriented. Virgo Moon processes feelings through practicality and finds comfort in order, routine, and being genuinely useful to others.' },
    { sign: 'Libra Moon', symbol: '♎', traits: 'Harmonious, fair-minded, and relationship-focused. Libra Moon seeks emotional balance and dislikes conflict. They feel most at peace when their relationships are in harmony.' },
    { sign: 'Scorpio Moon', symbol: '♏', traits: 'Intense, perceptive, and emotionally deep. Scorpio Moon experiences feelings at a profound level and craves authentic, transformative emotional connections.' },
    { sign: 'Sagittarius Moon', symbol: '♐', traits: 'Optimistic, free-spirited, and philosophical. Sagittarius Moon finds emotional fulfillment through adventure, learning, and the freedom to explore new horizons.' },
    { sign: 'Capricorn Moon', symbol: '♑', traits: 'Disciplined, reserved, and self-reliant. Capricorn Moon manages emotions with practicality and finds security through achievement, responsibility, and long-term goals.' },
    { sign: 'Aquarius Moon', symbol: '♒', traits: 'Independent, progressive, and intellectually driven. Aquarius Moon processes emotions with detachment and finds fulfillment in community, ideas, and humanitarian causes.' },
    { sign: 'Pisces Moon', symbol: '♓', traits: 'Dreamy, empathetic, and spiritually attuned. Pisces Moon absorbs the emotions of those around them and finds peace through creativity, solitude, and spiritual connection.' },
];

const MoonSignForm = ({ onSubmit, loading, onCancel }: MoonSignFormProps) => {
    const now = new Date();
    const formRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        place: '',
        lat: '',
        lon: '',
        tzone: 5.5,
    });

    React.useEffect(() => {
        const browserTzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setFormData(prev => ({ ...prev, tzone: browserTzone }));
    }, []);

    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [ampm, setAmpm] = useState('PM');
    const [unknownTime, setUnknownTime] = useState(false);

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => String(currentYear - i));
    const daysInMonth = month && year
        ? new Date(Number(year), MONTHS.indexOf(month) + 1, 0).getDate()
        : 31;
    const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

    const handleReset = () => {
        const browserTzone = parseFloat((new Date().getTimezoneOffset() / -60).toFixed(1));
        setFormData({ name: '', date: '', time: '', place: '', lat: '', lon: '', tzone: browserTzone });
        setMonth(''); setDay(''); setYear('');
        setHour('12'); setMinute('00'); setAmpm('PM');
        setUnknownTime(false);
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lat || !formData.lon || !formData.place) {
            toast.error('Please search and select your birth city from the list.');
            return;
        }
        if (!month || !day || !year) {
            toast.error('Please select a complete date of birth.');
            return;
        }
        const monthNum = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
        const dateStr = `${year}-${monthNum}-${day}`;
        let timeStr = '';
        if (!unknownTime) {
            let h = parseInt(hour);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            timeStr = `${String(h).padStart(2, '0')}:${minute}`;
        } else {
            timeStr = '12:00';
        }
        onSubmit({ ...formData, date: dateStr, time: timeStr });
    };

    const inputBase = `
        w-full px-4 py-3.5 rounded-lg border border-[#d6c89a]
        bg-transparent text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        text-[15px] font-normal transition-all
    `;

    const selectBase = `
        appearance-none w-full bg-transparent border border-[#d6c89a] rounded-lg
        px-4 py-3.5 pr-10 text-gray-900 text-[15px] font-normal
        focus:outline-none focus:border-[#b8962e] focus:ring-2 focus:ring-[#b8962e]/15
        cursor-pointer transition-all
    `;

    const ChevronDown = () => (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

                .moon-form-wrap * { font-family: 'Source Sans 3', sans-serif; }
                .moon-form-wrap .serif { font-family: 'Playfair Display', Georgia, serif; }
                .moon-form-wrap h1, .moon-form-wrap h2 { font-family: 'Playfair Display', Georgia, serif; }

                /* ── Divider with label ── */
                .section-divider {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 28px;
                }
                .section-divider::before,
                .section-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e5d9a8;
                }

                /* ── Geocoder overrides ── */
                .moon-geo, .moon-geo > div, .moon-geo .geoapify-container { width: 100% !important; }
                .moon-geo .geoapify-autocomplete-input {
                    color: #111827 !important;
                    font-weight: 400;
                    background: transparent !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 8px !important;
                    padding: 14px 16px 14px 42px !important;
                    font-size: 15px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    line-height: 1.5 !important;
                    box-shadow: none !important;
                }
                .moon-geo .geoapify-autocomplete-input::placeholder { color: #9ca3af !important; }
                .moon-geo .geoapify-autocomplete-input:focus {
                    border-color: #b8962e !important;
                    box-shadow: 0 0 0 3px rgba(184,150,46,0.15) !important;
                    outline: none !important;
                }
                .moon-geo .geoapify-autocomplete-items {
                    background-color: #ffffff !important;
                    color: #111827 !important;
                    border: 1px solid #d6c89a !important;
                    border-radius: 10px !important;
                    z-index: 9999 !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
                    font-size: 14px !important;
                    font-family: 'Source Sans 3', sans-serif !important;
                }
                .moon-geo .geoapify-autocomplete-item:hover {
                    background-color: #fdf6e3 !important;
                    color: #7a6010 !important;
                }
                select option { background-color: #ffffff; color: #111827; }
            `}</style>

            <div className="moon-form-wrap">

                {/* ── Page Header ── */}
                <div className="mb-10 pb-8 border-b border-[#d6c89a]">
                    <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-3">
                        <Moon className="w-3.5 h-3.5" />
                        <span className="serif">Moon Sign Calculator</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
                        What Is My Moon Sign?
                    </h1>
                    <p className="text-gray-500 text-[15px] leading-relaxed mb-7 max-w-2xl">
                        If you are unsure of your Moon sign, use our Moon sign calculator to look up in which constellation the Moon was located at the moment of your birth.
                    </p>
                    <motion.button
                        onClick={scrollToForm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-[14px] text-white tracking-wide transition-all"
                        style={{ background: '#b8962e' }}
                        suppressHydrationWarning
                    >
                        <Moon className="w-4 h-4" />
                        Calculate Your Moon Sign
                    </motion.button>
                </div>

                {/* ── SEO Content Sections ── */}
                <div className="space-y-14 mb-16">

                    {/* What is a Moon Sign */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Is a Moon Sign in Astrology?</h2>
                        <div className="space-y-4 text-gray-500 leading-relaxed text-[15px]">
                            <p>
                                In astrology, your Moon sign is determined by the position of the Moon at the exact moment of your birth. While your Sun sign reflects your outer personality and identity, your Moon sign reveals your inner emotional world — how you feel, what makes you feel secure, and how you instinctively respond to the people and situations around you.
                            </p>
                            <p>
                                The Moon moves through all 12 zodiac signs approximately every 28 days, spending roughly 2 to 2.5 days in each sign. This means that even people born on the same day can have different Moon signs depending on the time and place of their birth, which is why an accurate Moon sign calculator requires your birth time and location.
                            </p>
                            <p>
                                Many astrologers consider the Moon sign to be just as important — if not more so — than the Sun sign when it comes to understanding a person's emotional nature, subconscious patterns, and deepest needs. Your Moon sign shapes your relationship with comfort, intimacy, memory, and the way you nurture both yourself and others.
                            </p>
                        </div>
                    </section>

                    {/* Moon Sign vs Sun Sign */}
                    <section className="border-t border-[#d6c89a] pt-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Moon Sign vs Sun Sign — What Is the Difference?</h2>
                        <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                            Most people are familiar with their Sun sign — the zodiac sign determined by the date of birth, which forms the basis of popular horoscopes. However, the Sun sign represents only one dimension of your astrological profile. Your Moon sign adds a crucial emotional and psychological layer to that picture.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    title: 'Sun Sign',
                                    points: [
                                        'Determined by your birth date',
                                        'Represents your core identity and ego',
                                        'Reflects how you present yourself to the world',
                                        'Changes sign once per month',
                                        'The basis of your daily horoscope',
                                    ],
                                },
                                {
                                    title: 'Moon Sign',
                                    points: [
                                        'Determined by birth date, time, and location',
                                        'Represents your emotional inner world',
                                        'Reflects your instincts, habits, and needs',
                                        'Changes sign every 2 to 2.5 days',
                                        'Key to understanding emotional responses',
                                    ],
                                },
                            ].map((col, i) => (
                                <div
                                    key={i}
                                    className="p-5 rounded-xl border border-[#d6c89a] bg-white"
                                >
                                    <p className="font-bold text-[#b8962e] text-[13px] uppercase tracking-wider mb-3">{col.title}</p>
                                    <ul className="space-y-2.5">
                                        {col.points.map((pt, j) => (
                                            <li key={j} className="flex items-start gap-2.5 text-[13px] text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#b8962e] flex-shrink-0 mt-1.5" />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Moon Signs Table */}
                    <section className="border-t border-[#d6c89a] pt-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Moon Signs and Their Emotional Nature</h2>
                        <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                            Each Moon sign carries a distinct emotional quality. Here is a brief profile of all 12 Moon signs and the inner world they represent.
                        </p>
                        <div className="rounded-xl border border-[#d6c89a] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ background: '#ffffff', borderBottom: '1px solid #d6c89a' }}>
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#b8962e] uppercase tracking-widest w-44">Moon Sign</th>
                                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#b8962e] uppercase tracking-widest">Emotional Nature</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ede8d5]">
                                    {MOON_SIGNS.map((m, i) => (
                                        <tr
                                            key={i}
                                            className="transition-colors"
                                            style={{ background: '#ffffff' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#fdf9f0')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                                        >
                                            <td className="px-5 py-4 whitespace-nowrap align-top">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-[#b8962e] text-lg leading-none" style={{ fontFamily: 'Georgia, serif' }}>{m.symbol}</span>
                                                    <span className="font-semibold text-gray-800 text-[14px]">{m.sign}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[13px] text-gray-500 leading-relaxed">{m.traits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Why Moon Sign Matters */}
                    <section className="border-t border-[#d6c89a] pt-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Does Your Moon Sign Matter?</h2>
                        <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                            Understanding your Moon sign can bring meaningful clarity to areas of life that feel confusing or difficult to articulate. It helps explain why you react emotionally the way you do, what environments feel most nourishing to you, and what you truly need beneath the surface to feel safe and content.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                {
                                    title: 'Emotional self-awareness',
                                    desc: 'Your Moon sign illuminates your instinctive emotional reactions and habitual patterns, helping you understand why you feel the way you do in challenging situations.',
                                },
                                {
                                    title: 'Relationship compatibility',
                                    desc: "Moon sign compatibility plays a significant role in emotional connection. When two people's Moon signs are harmonious, they tend to feel naturally understood and emotionally safe with each other.",
                                },
                                {
                                    title: 'Understanding your needs',
                                    desc: 'Each Moon sign has distinct emotional needs. Knowing yours helps you communicate what you require from relationships, work environments, and daily life to feel genuinely fulfilled.',
                                },
                                {
                                    title: 'Identifying comfort patterns',
                                    desc: 'Your Moon sign governs how you self-soothe, what brings you comfort, and what habits you return to when stressed. This awareness can support healthier coping strategies.',
                                },
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#d6c89a] bg-white">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[12px] font-bold text-white"
                                        style={{ background: '#b8962e' }}
                                    >
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-[14px] mb-1">{tip.title}</p>
                                        <p className="text-[13px] text-gray-500 leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* ── Calculator Form ── */}
                <div ref={formRef} className="scroll-mt-8 border-t border-[#d6c89a] pt-10">

                    {/* Form header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-[#b8962e] text-sm font-semibold mb-2">
                            <Moon className="w-3.5 h-3.5" />
                            <span className="serif">Calculator</span>
                        </div>
                        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Calculate Your Moon Sign</h2>
                        <p className="text-gray-500 text-[15px] leading-relaxed">
                            Enter your birth details below to find out your Moon sign instantly.
                        </p>
                    </div>

                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-7"
                    >

                        {/* First Name */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[14px] font-semibold text-gray-700 uppercase tracking-wide">First Name</label>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 text-[12px] text-[#b8962e] hover:text-[#7a6010] font-medium transition-colors"
                                    suppressHydrationWarning
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Type here..."
                                className={inputBase}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#ede8d5]" />

                        {/* City of Birth */}
                        <div>
                            <label className="block text-[14px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                City of Birth
                            </label>
                            <div className="relative moon-geo">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <GeoapifyContext apiKey="47b4a8afc7734a12bd28b482d3dbff76">
                                    <GeoapifyGeocoderAutocomplete
                                        placeholder="Find your city..."
                                        value={formData.place}
                                        placeSelect={(value: any) => {
                                            if (value && value.properties) {
                                                let selectedTzone = formData.tzone;
                                                if (value.properties.timezone && value.properties.timezone.offset_STD_seconds !== undefined) {
                                                    selectedTzone = value.properties.timezone.offset_STD_seconds / 3600;
                                                }
                                                setFormData({
                                                    ...formData,
                                                    place: value.properties.formatted,
                                                    lat: value.properties.lat,
                                                    lon: value.properties.lon,
                                                    tzone: selectedTzone,
                                                });
                                            } else {
                                                setFormData({ ...formData, place: '', lat: '', lon: '' });
                                            }
                                        }}
                                    />
                                </GeoapifyContext>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#ede8d5]" />

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-[14px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                Date of Birth
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <select value={month} onChange={(e) => { setMonth(e.target.value); setDay(''); }} className={selectBase} suppressHydrationWarning>
                                        <option value="">Month</option>
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <div className="relative w-28">
                                    <select value={day} onChange={(e) => setDay(e.target.value)} className={selectBase} suppressHydrationWarning>
                                        <option value="">Day</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <div className="relative w-32">
                                    <select value={year} onChange={(e) => setYear(e.target.value)} className={selectBase} suppressHydrationWarning>
                                        <option value="">Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#ede8d5]" />

                        {/* Time of Birth */}
                        <div>
                            <label className="block text-[14px] font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                Time of Birth
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-24">
                                    <select value={hour} onChange={(e) => setHour(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40 disabled:cursor-not-allowed`} suppressHydrationWarning>
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <span className="text-gray-400 font-semibold text-xl select-none">:</span>
                                <div className="relative w-24">
                                    <select value={minute} onChange={(e) => setMinute(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40 disabled:cursor-not-allowed`} suppressHydrationWarning>
                                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown />
                                </div>
                                <div className="relative w-24">
                                    <select value={ampm} onChange={(e) => setAmpm(e.target.value)} disabled={unknownTime} className={`${selectBase} disabled:opacity-40 disabled:cursor-not-allowed`} suppressHydrationWarning>
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                    <ChevronDown />
                                </div>
                            </div>
                            <label className="flex items-center gap-2.5 mt-4 cursor-pointer group w-fit">
                                <input
                                    type="checkbox"
                                    checked={unknownTime}
                                    onChange={(e) => setUnknownTime(e.target.checked)}
                                    className="w-4 h-4 rounded border-[#d6c89a] accent-[#b8962e] cursor-pointer"
                                    suppressHydrationWarning
                                />
                                <span className="text-[13px] text-gray-500 group-hover:text-gray-700 transition-colors">
                                    I don't know the time of birth
                                </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <div className="pt-2 flex flex-col items-stretch gap-4">
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.005 }}
                                whileTap={{ scale: loading ? 1 : 0.995 }}
                                className="w-full py-4 rounded-lg font-semibold text-[15px] text-white tracking-wide transition-all disabled:opacity-60"
                                style={{ background: '#b8962e' }}
                                suppressHydrationWarning
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Calculating...
                                    </span>
                                ) : (
                                    'Calculate Moon Sign'
                                )}
                            </motion.button>

                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-[#b8962e] transition-colors"
                                    suppressHydrationWarning
                                >
                                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                                    Back to Result
                                </button>
                            )}
                        </div>

                    </motion.form>
                </div>

            </div>
        </div>
    );
};

export default MoonSignForm;