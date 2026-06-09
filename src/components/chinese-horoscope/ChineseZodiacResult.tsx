'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowLeft, Share2, Download, Loader2 } from 'lucide-react';
import { downloadChineseHoroscopePDF } from '@/lib/chineseHoroscopePdfGenerator';
import { toast } from 'react-hot-toast';

interface ChineseZodiacResultProps {
    data: {
        userName: string;
        animal: string;
        element: string;
        destinyPath: string;
        personality: {
            traits: string[];
            shadows: string[];
        };
        fengShuiTip: string;
        luckyElements: {
            color: string;
            direction: string;
            careerField: string;
        };
    };
    userName: string;
    onReset: () => void;
}

const fade: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};

const COLOR_DOT_MAP: Record<string, string> = {
    gold: '#b8860b',
    silver: '#9e9e9e',
    red: '#c0392b',
    white: '#cccccc',
    black: '#333333',
    blue: '#2563eb',
    green: '#16a34a',
    purple: '#7c3aed',
    yellow: '#ca8a04',
    orange: '#ea580c',
};

function getDotColor(colorName: string): string {
    return COLOR_DOT_MAP[colorName?.toLowerCase()] ?? '#8B4A0E';
}

const ChineseZodiacResult = ({ data, userName, onReset }: ChineseZodiacResultProps) => {
    const [mounted, setMounted] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await downloadChineseHoroscopePDF(data);
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Failed to generate PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="min-h-[800px]" />;

    return (
        <div
            style={{
                fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
                maxWidth: 860,
                margin: '0 auto',
                padding: '1.5rem 1rem 3rem',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
                .czr * { box-sizing: border-box; }
                .czr-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: transparent; cursor: pointer;
                    font-family: inherit; transition: opacity 0.15s;
                }
                .czr-btn:hover { opacity: 0.65; }
            `}</style>

            <div className="czr">

                {/* Top bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                    }}
                >
                    <button
                        className="czr-btn"
                        onClick={onReset}
                        style={{
                            border: '0.5px solid rgba(0,0,0,0.15)',
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 13,
                            color: '#666',
                        }}
                    >
                        <ArrowLeft size={14} />
                        Recalculate
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="czr-btn"
                            style={{
                                border: '0.5px solid rgba(0,0,0,0.15)',
                                borderRadius: 8,
                                padding: '6px 14px',
                                fontSize: 13,
                                color: '#666',
                            }}
                        >
                            <Share2 size={14} />
                            Share
                        </button>
                        <button
                            disabled={isDownloading}
                            onClick={handleDownload}
                            className="czr-btn"
                            style={{
                                border: '0.5px solid rgba(0,0,0,0.15)',
                                borderRadius: 8,
                                padding: '6px 14px',
                                fontSize: 13,
                                color: '#666',
                                opacity: isDownloading ? 0.5 : 1,
                            }}
                        >
                            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {isDownloading ? 'Exporting...' : 'Download'}
                        </button>
                    </div>
                </motion.div>

                {/* Main card */}
                <div
                    style={{
                        background: '#fff',
                        border: '0.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 20,
                        overflow: 'hidden',
                    }}
                >

                    {/* ── HERO HEADER ── */}
                    <motion.div
                        custom={0} variants={fade} initial="hidden" animate="show"
                        style={{
                            padding: '2.5rem 2.5rem 2rem',
                            borderBottom: '0.5px solid rgba(0,0,0,0.07)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>
                            <p style={{
                                fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
                                textTransform: 'uppercase', color: '#999', margin: '0 0 10px',
                            }}>
                                Personal Destiny
                            </p>
                            <h1 style={{
                                fontFamily: "'DM Serif Display', Georgia, serif",
                                fontSize: 'clamp(28px, 5vw, 42px)',
                                fontWeight: 400,
                                margin: '0 0 8px',
                                color: '#111',
                                lineHeight: 1.15,
                            }}>
                                The {data.element}{' '}
                                <span style={{ color: '#8B4A0E' }}>{data.animal}</span>
                            </h1>
                            <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
                                Born for legacy · Year of transformation
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            {[
                                { label: 'Element', value: data.element },
                                { label: 'Animal', value: data.animal },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    style={{
                                        background: '#fafafa',
                                        border: '0.5px solid rgba(0,0,0,0.08)',
                                        borderRadius: 12,
                                        padding: '10px 18px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 3px', fontWeight: 500 }}>
                                        {label}
                                    </p>
                                    <p style={{ fontSize: 16, fontWeight: 500, color: '#111', margin: 0 }}>
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── DESTINY ARC ── */}
                    <motion.div
                        custom={1} variants={fade} initial="hidden" animate="show"
                        style={{
                            padding: '2rem 2.5rem',
                            borderBottom: '0.5px solid rgba(0,0,0,0.07)',
                        }}
                    >
                        <p style={{
                            fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
                            textTransform: 'uppercase', color: '#130000ff', margin: '0 0 14px',
                        }}>
                            Destiny arc
                        </p>
                        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: '0 0 8px' }}>
                            Greetings{' '}
                            <strong style={{ color: '#111', fontWeight: 500 }}>
                                {userName || data.userName || 'Seeker'}
                            </strong>
                            , your path as a {data.element} {data.animal} is one of profound significance.
                        </p>
                        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                            {data.destinyPath}
                        </p>
                    </motion.div>

                    {/* ── TRAITS & SHADOWS ── */}
                    <motion.div
                        custom={2} variants={fade} initial="hidden" animate="show"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            borderBottom: '0.5px solid rgba(0,0,0,0.07)',
                        }}
                    >
                        {/* Virtues */}
                        <div style={{
                            padding: '2rem 2.5rem',
                            borderRight: '0.5px solid rgba(0,0,0,0.07)',
                        }}>
                            <p style={{
                                fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
                                textTransform: 'uppercase', color: '#999', margin: '0 0 14px',
                            }}>
                                Virtues of power
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                {data.personality.traits.map((trait, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1a1a1a' }}>
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: '#2c7a4b', flexShrink: 0, display: 'block',
                                        }} />
                                        {trait}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shadows */}
                        <div style={{ padding: '2rem 2.5rem' }}>
                            <p style={{
                                fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
                                textTransform: 'uppercase', color: '#999', margin: '0 0 14px',
                            }}>
                                Shadows to balance
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                {data.personality.shadows.map((shadow, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1a1a1a' }}>
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: '#b93e3e', flexShrink: 0, display: 'block',
                                        }} />
                                        {shadow}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── FENG SHUI TIP ── */}
                    <motion.div
                        custom={3} variants={fade} initial="hidden" animate="show"
                        style={{
                            padding: '2rem 2.5rem',
                            borderBottom: '0.5px solid rgba(0,0,0,0.07)',
                            background: '#fafafa',
                        }}
                    >
                        <p style={{
                            fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
                            textTransform: 'uppercase', color: '#999', margin: '0 0 10px',
                        }}>
                            Grand master's feng shui tip
                        </p>
                        <p style={{
                            fontSize: 15,
                            color: '#444',
                            lineHeight: 1.8,
                            margin: 0,
                            fontStyle: 'normal',
                            fontFamily: "'DM Serif Display', Georgia, serif",
                        }}>
                            "{data.fengShuiTip}"
                        </p>
                    </motion.div>

                    {/* ── LUCKY ELEMENTS ── */}
                    <motion.div
                        custom={4} variants={fade} initial="hidden" animate="show"
                        style={{
                            padding: '1.75rem 2.5rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 12,
                        }}
                    >
                        {[
                            {
                                label: 'Lucky color',
                                value: data.luckyElements.color,
                                dot: getDotColor(data.luckyElements.color),
                            },
                            {
                                label: 'Prosperity direction',
                                value: data.luckyElements.direction,
                                dot: null,
                            },
                            {
                                label: 'Abundance path',
                                value: data.luckyElements.careerField,
                                dot: null,
                            },
                        ].map(({ label, value, dot }) => (
                            <div
                                key={label}
                                style={{
                                    background: '#fafafa',
                                    border: '0.5px solid rgba(0,0,0,0.08)',
                                    borderRadius: 12,
                                    padding: '1rem',
                                }}
                            >
                                <p style={{
                                    fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                                    textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px',
                                }}>
                                    {label}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {dot && (
                                        <span style={{
                                            width: 12, height: 12, borderRadius: '50%',
                                            background: dot, flexShrink: 0, display: 'block',
                                        }} />
                                    )}
                                    <p style={{ fontSize: 15, fontWeight: 500, color: '#111', margin: 0 }}>
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default ChineseZodiacResult;