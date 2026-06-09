import toast from 'react-hot-toast';

// ── Brand Colors ──
const DEEP_SLATE: [number, number, number] = [15, 23, 42];
const STEEL: [number, number, number] = [71, 85, 105];
const GOLD: [number, number, number] = [184, 150, 46];
const INDIGO: [number, number, number] = [49, 46, 129];
const EMERALD: [number, number, number] = [5, 150, 105];
const ROSE: [number, number, number] = [153, 27, 27];
const CREAM: [number, number, number] = [253, 246, 227];

interface SadeSatiData {
    sadeSati: {
        phase: string;
        is_active: boolean;
        natal_moon_sign: string;
        transit_saturn_sign: string;
        details: string;
        life_timeline: Array<{
            type: string;
            shani_rashi: string;
            start_date: string;
            end_date: string;
            phase: string;
        }>;
    };
    input: {
        name: string;
        date: string;
        time: string;
        place?: string;
    };
    panchang?: {
        tithi?: string;
    };
}

export const downloadSadeSatiPDF = async (data: SadeSatiData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Calculating Saturn\'s Orbit...', {
        style: {
            background: '#0f172a', color: '#f8fafc',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(184,150,46,0.3)',
        },
        iconTheme: { primary: '#b8962e', secondary: '#f8fafc' },
    });

    try {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 15;

        const clean = (txt: any): string => {
            if (txt === undefined || txt === null) return '-';
            return String(txt).replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
        };

        let y = 20;

        // ─── 0. Header (Logo/Title) ───
        pdf.setFillColor(...DEEP_SLATE);
        pdf.rect(0, 0, pageWidth, 42, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('SADE SATI: SATURN TRANSIT & KARMIC JOURNEY', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ASTRONOMICAL ANALYSIS', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. Identity ───
        pdf.setTextColor(...DEEP_SLATE);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clean(data.input.name).toUpperCase(), margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...STEEL);
        pdf.text(`BORN: ${data.input.date} at ${data.input.time} | ${clean(data.input.place)}`, margin, y + 6);
        
        y += 18;

        // ─── 2. Current Status Hero ───
        const isIntense = data.sadeSati.phase?.includes('Peak') || data.sadeSati.is_active;
        const statusColor = isIntense ? INDIGO : EMERALD;

        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...statusColor);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 25, 3, 3, 'FD');

        pdf.setTextColor(...statusColor);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.sadeSati.phase || 'NO ACTIVE SADE SATI', pageWidth / 2, y + 10, { align: 'center' });
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...STEEL);
        const statusDesc = data.sadeSati.is_active 
            ? `Saturn is transiting your Moon sign (${data.sadeSati.natal_moon_sign}), indicating a period of growth.`
            : `You are currently in a harmonious period; Saturn is not directly influencing your Moon sign (${data.sadeSati.natal_moon_sign}).`;
        pdf.text(statusDesc, pageWidth / 2, y + 16, { align: 'center' });

        y += 38;

        // ─── 3. Birth Alignment Details ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CELESTIAL ALIGNMENT', margin, y);
        y += 6;

        autoTable(pdf, {
            startY: y,
            body: [
                ['Natal Moon Sign', data.sadeSati.natal_moon_sign, 'Current Saturn', clean(data.sadeSati.transit_saturn_sign)],
                ['Birth Tithi', clean(data.panchang?.tithi), 'Status', data.sadeSati.is_active ? 'ACTIVE' : 'CALM']
            ],
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
            columnStyles: {
                0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 35 },
                1: { cellWidth: (pageWidth - (margin * 2) - 70) / 2 },
                2: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 35 },
                3: { cellWidth: (pageWidth - (margin * 2) - 70) / 2, fontStyle: 'bold' }
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 4. Analysis ───
        pdf.setTextColor(...DEEP_SLATE);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LUNAR TRANSIT PERSPECTIVE', margin, y);
        y += 8;

        pdf.setTextColor(...STEEL);
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        const analysis = clean(data.sadeSati.details);
        const splitAnalysis = pdf.splitTextToSize(analysis, pageWidth - (margin * 2));
        pdf.text(splitAnalysis, margin, y);
        y += (splitAnalysis.length * 5) + 12;

        // ─── 5. Lifetime Timeline ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LIFETIME TRANSIT CALENDAR', margin, y);
        y += 6;

        const timelineData = data.sadeSati.life_timeline.map((p, i) => [
            i + 1,
            p.type,
            p.shani_rashi,
            p.start_date,
            p.end_date,
            p.phase || 'Transit'
        ]);

        autoTable(pdf, {
            startY: y,
            head: [['S.N', 'Type', 'Saturn Rashi', 'From Date', 'To Date', 'Phase']],
            body: timelineData,
            theme: 'striped',
            headStyles: { fillColor: DEEP_SLATE, fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3 },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    const phase = data.cell.raw as string;
                    if (phase === 'Peak') pdf.setTextColor(...ROSE);
                    else if (phase === 'Rising') pdf.setTextColor(...SAPPHIRE);
                    else if (phase === 'Setting') pdf.setTextColor(...EMERALD);
                }
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 6. Karmic Remedies ───
        if (y > pageHeight - 60) { pdf.addPage(); y = 20; }
        
        pdf.setTextColor(...INDIGO);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KARMIC REMEDIES & UPAYAS', margin, y);
        y += 6;

        const remedies = [
            'Worship Lord Shani and Lord Shiva on Saturdays.',
            'Recite Shani Beej Mantra: "Om Pram Preem Proum Sah Shanaischaraya Namah" 108 times.',
            'Light a mustard oil lamp under a Peepal tree in the evening.',
            'Practice charity by donating black lentils (Urad) or oil to the needy.',
            'Maintain ethical conduct, discipline, and avoid impulsive decisions.'
        ];

        remedies.forEach((text, i) => {
            pdf.setTextColor(...STEEL);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`\u2022 ${text}`, margin + 2, y);
            y += 5.5;
        });

        // ─── Footer ───
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(...STEEL);
        pdf.text('Saturn rewards the disciplined and checks the arrogant. May your transit be fruitful.', pageWidth / 2, pageHeight - 15, { align: 'center' });
        
        pdf.setFont('helvetica', 'normal');
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_SadeSati_${data.input.name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Orbit analysis complete!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to resolve Saturn\'s transit.', { id: toastId });
    }
};

const SAPPHIRE: [number, number, number] = [30, 58, 138];
