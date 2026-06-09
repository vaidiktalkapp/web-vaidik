import toast from 'react-hot-toast';

// ── Brand Colors ──
const GOLD: [number, number, number] = [184, 150, 46];
const DARK: [number, number, number] = [28, 21, 9];
const GRAY: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const CREAM: [number, number, number] = [253, 246, 227];
const LIGHT_GOLD: [number, number, number] = [249, 245, 235];

interface CelebrityPdfData {
    profile: {
        name: string;
        category: string;
        birthDate: string;
        birthTime: string;
        birthPlace: string;
        summary: string;
        image?: string;
        content?: string;
    };
    kundliData: any;
}

export const downloadCelebrityPDF = async (data: CelebrityPdfData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Accessing Celestial Records...', {
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
        const autoTable = (await import('jspdf-autotable')).default;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentW = pageW - margin * 2;
        let y = 0;

        const { profile, kundliData } = data;
        const { kundli, dasha, panchang, doshas } = kundliData;

        const clean = (txt: any) => {
            if (!txt) return 'N/A';
            return String(txt).replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
        };

        const drawSectionTitle = (title: string, yPos: number) => {
            pdf.setFillColor(...GOLD);
            pdf.rect(margin, yPos - 3, 2, 5, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(...DARK);
            pdf.text(title, margin + 5, yPos);
        };

        // ─── 0. Hero Header ───
        pdf.setFillColor(...DARK);
        pdf.rect(0, 0, pageW, 60, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.text('CELEBRITY DESTINY', margin, 25);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GOLD);
        pdf.text('CELESTIAL LEGACY & BIRTH CHART ANALYSIS', margin, 32);

        // Right side stamp
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.5);
        pdf.rect(pageW - 45, 15, 30, 30);
        pdf.setFontSize(7);
        pdf.text('VERIFIED', pageW - 30, 25, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('VAIDIK', pageW - 30, 32, { align: 'center' });
        pdf.setFontSize(7);
        pdf.text('TALK', pageW - 30, 37, { align: 'center' });

        y = 75;

        // ─── 1. Celebrity Identity ───
        pdf.setTextColor(...DARK);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(profile.name.toUpperCase(), margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...GOLD);
        pdf.text(`${profile.category.toUpperCase()} | CELESTIAL ALIGNMENT`, margin, y + 6);
        
        y += 18;

        // Summary
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        const summaryText = clean(profile.summary);
        const splitSummary = pdf.splitTextToSize(summaryText, contentW);
        pdf.text(splitSummary, margin, y);
        y += (splitSummary.length * 5) + 10;

        // ─── 2. Astrological Stats ───
        drawSectionTitle('CORE ASTROLOGICAL IDENTITY', y);
        y += 7;

        autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, lineColor: [214, 200, 154], lineWidth: 0.3, halign: 'center' },
            headStyles: { fillColor: LIGHT_GOLD, textColor: DARK, fontStyle: 'bold', fontSize: 8 },
            head: [['Ascendant', 'Moon Sign', 'Sun Sign', 'Nakshatra']],
            body: [[
                clean(kundli.ascendant),
                clean(panchang.moon_sign),
                clean(panchang.sun_sign),
                clean(panchang.nakshatra),
            ]],
            bodyStyles: { fontStyle: 'bold', fontSize: 11 },
        });
        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 3. Lagna Chart (D1) ───
        // I'll skip drawing the full complex chart in this first pass to keep it reliable, 
        // but I will add the planetary positions table.
        
        drawSectionTitle('PLANETARY POSITIONS & DIGNITIES', y);
        y += 7;

        const planetRows: string[][] = [];
        Object.entries(kundli.planets).forEach(([name, p]: any) => {
            planetRows.push([
                name,
                p.sign || '',
                p.degree ? (p.degree % 30).toFixed(2) + '°' : '',
                `House ${p.house || ''}`,
                p.nakshatra || '',
                p.relation || 'Neutral',
            ]);
        });

        autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, lineColor: [214, 200, 154], lineWidth: 0.3 },
            headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
            head: [['Planet', 'Sign', 'Degree', 'House', 'Nakshatra', 'Relation']],
            body: planetRows,
            alternateRowStyles: { fillColor: [255, 253, 245] },
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 4. Detailed Legacy Analysis ───
        if (y > pageH - 80) {
            pdf.addPage();
            y = 25;
        }

        drawSectionTitle('CELESTIAL LEGACY ANALYSIS', y);
        y += 7;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(...DARK);
        const legacyText = clean(profile.content);
        const splitLegacy = pdf.splitTextToSize(legacyText, contentW);
        pdf.text(splitLegacy, margin, y);

        // ─── Footer ───
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(...GRAY);
            pdf.text(`VaidikTalk Premium Celebrity Report | Page ${i} of ${totalPages}`, pageW / 2, pageH - 10, { align: 'center' });
        }

        pdf.save(`Celebrity_Horoscope_${profile.name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Cosmic legacy downloaded!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to summon cosmic records.', { id: toastId });
    }
};
