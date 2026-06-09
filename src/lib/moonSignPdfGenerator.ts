import toast from 'react-hot-toast';

// ── Brand Colors ──
const GOLD: [number, number, number] = [184, 150, 46];
const CREAM: [number, number, number] = [253, 246, 227];
const NAVY: [number, number, number] = [17, 24, 39];
const GRAY: [number, number, number] = [107, 114, 128];
const EMERALD: [number, number, number] = [22, 163, 74];
const ROSE: [number, number, number] = [225, 29, 72];
const LIGHT_GOLD: [number, number, number] = [249, 245, 235];

interface MoonSignData {
    moonSign: string;
    sanskritName?: string;
    symbol?: string;
    element?: string;
    quality?: string;
    rulingPlanet?: string;
    overview?: string;
    strengths?: string[];
    weaknesses?: string[];
    personalityTraits?: { title: string; description: string; emoji?: string }[];
    emotionalNature?: string;
    compatibility?: {
        bestMatches: string[];
        goodMatches: string[];
        challengingMatches: string[];
    };
    luckyAttributes?: {
        color: string;
        number: string;
        day: string;
        gemstone: string;
        metal: string;
        direction: string;
    };
    nakshatraInsight?: string;
    moonMantra?: string;
    rawAstro?: {
        moonNakshatra?: string;
        moonHouse?: string | number;
        moonDegree?: string | number;
    };
    input: {
        name: string;
        date: string;
        time: string;
        place: string;
        lat?: any;
        lon?: any;
    };
}

export const downloadMoonSignPDF = async (data: MoonSignData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Calculating Lunar Alignment...', {
        style: {
            background: '#111827', color: '#fdf6e3',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(184,150,46,0.3)',
        },
        iconTheme: { primary: '#b8962e', secondary: '#fdf6e3' },
    });

    try {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;

    // ─── Utility: Clean Text ───
    const clean = (txt: any): string => {
        if (txt === undefined || txt === null) return '-';
        if (typeof txt !== 'string') {
            const val = txt.text || txt.title || txt.description || String(txt);
            return typeof val === 'string' ? clean(val) : String(val);
        }
        return txt
            .replace(/\s+/g, ' ')
            .replace(/[\t\r\n]/g, ' ')
            .trim();
    };

    const checkPage = (addedHeight: number) => {
        if (y + addedHeight > pageHeight - 20) {
            pdf.addPage();
            y = 20;
            return true;
        }
        return false;
    };

    let y = 20;

    // ─── 0. Header (Logo/Title) ───
    pdf.setFillColor(...GOLD);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('VaidikTalk', margin, 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('YOUR LUNAR DESTINY REVEALED', margin, 28);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MOON SIGN (RASHI) REPORT', pageWidth - margin, 25, { align: 'right' });

    y = 50;
    // ... rest of the card drawing ...
    // (Rest of the previous code was correct, just need to change the autoTable calls)

    // ─── 2. Celestial Identity ───
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CELESTIAL IDENTITY', margin, y);
    y += 8;

    const identityData = [
        ['Sign', clean(data.moonSign), 'Ruling Planet', clean(data.rulingPlanet)],
        ['Sanskrit', clean(data.sanskritName), 'Nakshatra', clean(data.rawAstro?.moonNakshatra)],
        ['Element', clean(data.element), 'Moon House', `${data.rawAstro?.moonHouse || '-'}th`],
        ['Quality', clean(data.quality), 'Moon Degree', `${data.rawAstro?.moonDegree ? Number(data.rawAstro.moonDegree).toFixed(2) : '-'}°`],
    ];

    autoTable(pdf, {
        startY: y,
        head: [],
        body: identityData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 35 },
            1: { cellWidth: 55 },
            2: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 35 },
            3: { cellWidth: 55 }
        },
        margin: { left: margin }
    });

    y = (pdf as any).lastAutoTable.finalY + 15;

    // ─── 3. Soul Analysis ───
    checkPage(60);
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(12);
    pdf.text('SOUL ANALYSIS', margin, y);
    y += 6;

    autoTable(pdf, {
        startY: y,
        body: [[clean(data.overview)]],
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 0 },
        columnStyles: { 0: { cellWidth: pageWidth - (margin * 2) } }
    });

    y = (pdf as any).lastAutoTable.finalY + 15;

    // ─── 4. Divine Gifts & Karmic Lessons ───
    checkPage(50);
    const strengths = (data.strengths || []).map(s => `• ${clean(s)}`);
    const weaknesses = (data.weaknesses || []).map(w => `• ${clean(w)}`);

    autoTable(pdf, {
        startY: y,
        head: [['DIVINE GIFTS (STRENGTHS)', 'KARMIC LESSONS (WEAKNESSES)']],
        body: [[strengths.join('\n\n'), weaknesses.join('\n\n')]],
        theme: 'grid',
        headStyles: { fillColor: GOLD, textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
            0: { textColor: EMERALD },
            1: { textColor: ROSE }
        }
    });

    y = (pdf as any).lastAutoTable.finalY + 15;

    // ─── 5. Personality Traits Grid ───
    checkPage(80);
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CORE PERSONALITY TRAITS', margin, y);
    y += 8;

    const traitData = data.personalityTraits || [];
    const traitsPerRow = 2; // 2 cards per row looks best in PDF
    
    for (let i = 0; i < traitData.length; i += traitsPerRow) {
        checkPage(30);
        const chunk = traitData.slice(i, i + traitsPerRow);
        const bodyContent = chunk.map(t => [
            `${clean(t.title).toUpperCase()}\n${clean(t.description)}`
        ]);

        autoTable(pdf, {
            startY: y,
            body: [bodyContent.map(c => c[0])], // Draw horizontally
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 5, minCellHeight: 25 },
            columnStyles: {
                0: { cellWidth: (pageWidth - (margin * 2)) / 2, fontStyle: 'normal' },
                1: { cellWidth: (pageWidth - (margin * 2)) / 2, fontStyle: 'normal' }
            },
            didParseCell: (d) => { 
                // Hide the text rendered by autoTable itself so we can draw our own in didDrawCell
                d.cell.styles.textColor = [255, 255, 255];
            },
            didDrawCell: (hookData) => {
                if (hookData.column.index < chunk.length) {
                    const trait = chunk[hookData.column.index];
                    const { x, y: cellY, width, height } = hookData.cell;
                    
                    // Re-draw background to clear previous text if needed, 
                    // but autoTable already drew it. Let's just draw bold text over.
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(9);
                    pdf.setTextColor(...GOLD);
                    pdf.text(clean(trait.title).toUpperCase(), x + 5, cellY + 8);
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8.5);
                    pdf.setTextColor(...NAVY);
                    const descLines = pdf.splitTextToSize(clean(trait.description), width - 10);
                    pdf.text(descLines, x + 5, cellY + 14);
                }
            }
        });
        y = (pdf as any).lastAutoTable.finalY + 4;
    }

    y += 10;

    // ─── 6. Emotional Landscape ───
    checkPage(60);
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(12);
    pdf.text('EMOTIONAL LANDSCAPE', margin, y);
    y += 6;

    autoTable(pdf, {
        startY: y,
        body: [[clean(data.emotionalNature)]],
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 0 },
        columnStyles: { 0: { cellWidth: pageWidth - (margin * 2) } }
    });

    y = (pdf as any).lastAutoTable.finalY + 15;

    // ─── 7. Compatibility & Lucky Factors ───
    checkPage(80);
    
    // Compatibility Table
    const comp = data.compatibility;
    const compatData = [
        ['Divine Unions', clean(comp?.bestMatches?.join(', '))],
        ['Good Allies', clean(comp?.goodMatches?.join(', '))],
        ['Growth Partners', clean(comp?.challengingMatches?.join(', '))],
    ];

    autoTable(pdf, {
        startY: y,
        head: [['RASHI COMPATIBILITY', '']],
        body: compatData,
        theme: 'grid',
        headStyles: { fillColor: ROSE, textColor: 255 },
        styles: { font: 'helvetica', fontSize: 9 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: pageWidth - (margin * 2) - 40 }
        }
    });

    y = (pdf as any).lastAutoTable.finalY + 10;

    // Lucky Factors
    const lucky = data.luckyAttributes;
    const luckyData = [
        ['Lucky Color', clean(lucky?.color), 'Lucky Number', clean(lucky?.number)],
        ['Lucky Day', clean(lucky?.day), 'Lucky Gem', clean(lucky?.gemstone)],
        ['Lucky Metal', clean(lucky?.metal), 'Lucky Direction', clean(lucky?.direction)],
    ];

    autoTable(pdf, {
        startY: y,
        head: [['LUCKY ATTRIBUTES', '', '', '']],
        body: luckyData,
        theme: 'grid',
        headStyles: { fillColor: GOLD, textColor: 255 },
        styles: { font: 'helvetica', fontSize: 9 },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [249, 250, 251] },
            2: { fontStyle: 'bold', fillColor: [249, 250, 251] }
        }
    });

    y = (pdf as any).lastAutoTable.finalY + 15;

    // ─── 8. Nakshatra Essence ───
    checkPage(40);
    pdf.setFillColor(...LIGHT_GOLD);
    pdf.setDrawColor(...GOLD);
    pdf.roundedRect(margin, y, pageWidth - (margin * 2), 25, 3, 3, 'FD');

    pdf.setTextColor(...GOLD);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NAKSHATRA ESSENCE', margin + 5, y + 8);
    
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const insight = clean(data.nakshatraInsight);
    const splitInsight = pdf.splitTextToSize(`"${insight}"`, pageWidth - (margin * 2) - 20);
    pdf.text(splitInsight, pageWidth / 2, y + 16, { align: 'center' });

    y += 35;

    // ─── 9. Sacred Mantra Card ───
    checkPage(40);
    pdf.setFillColor(...CREAM);
    pdf.setDrawColor(...GOLD);
    pdf.roundedRect(margin, y, pageWidth - (margin * 2), 35, 4, 4, 'FD');

    pdf.setTextColor(...GOLD);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SACRED MOON MANTRA', pageWidth / 2, y + 10, { align: 'center' });
    
    pdf.setTextColor(...NAVY);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(clean(data.moonMantra).toUpperCase(), pageWidth / 2, y + 22, { align: 'center' });

    pdf.setTextColor(...GOLD);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Chant 108 times for lunar alignment and emotional peace.', pageWidth / 2, y + 29, { align: 'center' });

    // ─── Footer ───
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save(`VaidikTalk_MoonSign_${data.input.name.replace(/\s+/g, '_')}.pdf`);
    toast.success('Moon report ready!', { id: toastId });
} catch (error) {
    console.error('PDF error:', error);
    toast.error('Failed to generate report.', { id: toastId });
}
};
