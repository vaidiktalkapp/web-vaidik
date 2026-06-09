import toast from 'react-hot-toast';

// ── Brand Colors ──
const FOREST_GREEN: [number, number, number] = [6, 78, 59];
const OBSIDIAN: [number, number, number] = [15, 23, 42];
const GOLD: [number, number, number] = [184, 150, 46];
const SILVER: [number, number, number] = [148, 163, 184];
const CREAM: [number, number, number] = [253, 246, 227];
const RED: [number, number, number] = [153, 27, 27];

interface ManglikData {
    input: {
        name: string;
        date: string;
        time: string;
        place: string;
    };
    results: {
        is_present: boolean;
        details: string;
    };
}

export const downloadManglikPDF = async (data: ManglikData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Analyzing Martial Alignment...', {
        style: {
            background: '#1c1509', color: '#fdf6e3',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(184,150,46,0.3)',
        },
        iconTheme: { primary: '#b8962e', secondary: '#fdf6e3' },
    });

    try {
        const { jsPDF } = await import('jspdf');
        
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 15;

        const clean = (txt: any): string => {
            if (txt === undefined || txt === null) return '-';
            return String(txt).replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
        };

        let y = 20;

        // ─── 0. Header ───
        pdf.setFillColor(...GOLD);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('MARS ANALYSIS: MANGLIK DOSHA REPORT', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SPECIAL ASTROLOGY AUDIT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. Identity ───
        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clean(data.input.name).toUpperCase(), margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...SILVER);
        pdf.text(`BORN: ${data.input.date} | ${data.input.time} | ${clean(data.input.place)}`, margin, y + 6);
        
        y += 18;

        // ─── 2. Diagnosis Hero ───
        const isPresent = data.results.is_present;
        const statusColor = isPresent ? RED : FOREST_GREEN;

        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...statusColor);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 30, 3, 3, 'FD');

        pdf.setTextColor(...statusColor);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(isPresent ? 'MANGLIK DOSHA DETECTED' : 'NO MANGLIK DOSHA FOUND', pageWidth / 2, y + 12, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...OBSIDIAN);
        const statusDesc = isPresent 
            ? "Your chart indicates the presence of Kuja Dosha (Manglik)."
            : "Your chart exhibits a balanced Mars placement, free from Manglik influence.";
        pdf.text(statusDesc, pageWidth / 2, y + 20, { align: 'center' });

        y += 45;

        // ─── 3. Detailed Analysis ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TECHNICAL OBSERVATIONS', margin, y);
        y += 8;

        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const details = clean(data.results.details);
        const splitDetails = pdf.splitTextToSize(details, pageWidth - (margin * 2));
        pdf.text(splitDetails, margin, y);
        y += (splitDetails.length * 6) + 10;

        // ─── 4. General Wisdom ───
        if (y > pageHeight - 60) {
            pdf.addPage();
            y = 20;
        }

        pdf.setDrawColor(...SILVER);
        pdf.setLineWidth(0.2);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 10;

        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UNDERSTANDING KUJA DOSHA', margin, y);
        y += 8;

        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const wisdom = "In Vedic Astrology, Manglik Dosha occurs when Mars (Mangal) is placed in the 1st, 4th, 7th, 8th, or 12th house of the Lagna chart. While often associated with marital delays, it also grants immense courage, drive, and technical prowess. Remedies and maturity often mitigate its intensity after the age of 28.";
        const splitWisdom = pdf.splitTextToSize(wisdom, pageWidth - (margin * 2));
        pdf.text(splitWisdom, margin, y);

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...SILVER);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_Manglik_${data.input.name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Martial analysis complete!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to align martial energies.', { id: toastId });
    }
};
