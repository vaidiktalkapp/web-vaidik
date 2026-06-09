import toast from 'react-hot-toast';

// ── Brand Colors ──
const VEDIC_MAROON: [number, number, number] = [127, 29, 29];
const OBSIDIAN: [number, number, number] = [15, 23, 42];
const GOLD: [number, number, number] = [184, 150, 46];
const SILVER: [number, number, number] = [148, 163, 184];
const CREAM: [number, number, number] = [253, 246, 227];
const WHITE: [number, number, number] = [255, 255, 255];

interface PanchangData {
    location: string;
    date: string;
    panchang: {
        tithi: string;
        nakshatra: string;
        yoga: string;
        karana: string;
        day: string;
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
    };
    auspicious: {
        abhijit: string;
        amrit_kaal: string;
    };
    inauspicious: {
        rahu_kaal: string;
        gulika_kaal: string;
        yamaganda: string;
    };
}

export const downloadPanchangPDF = async (data: PanchangData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Aligning Vedic Calendars...', {
        style: {
            background: '#450a0a', color: '#fef2f2',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(184,150,46,0.3)',
        },
        iconTheme: { primary: '#b8962e', secondary: '#fef2f2' },
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

        // ─── 0. Header (Vedic Brand) ───
        pdf.setFillColor(...VEDIC_MAROON);
        pdf.rect(0, 0, pageWidth, 42, 'F');
        
        pdf.setTextColor(...WHITE);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('DAILY VEDIC EPHEMERIS: PANCHANG ANALYSIS', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AUTHENTIC ASTROLOGY AUDIT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. Identity & Location ───
        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DAILY PANCHANG GUIDE', margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...SILVER);
        pdf.text(`LOCATION: ${clean(data.location)} | DATE: ${data.date}`, margin, y + 6);
        
        y += 18;

        // ─── 2. Sun & Moon Timings (Hero Section) ───
        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 35, 3, 3, 'FD');

        const colW = (pageWidth - (margin * 2)) / 4;
        pdf.setFontSize(8);
        pdf.setTextColor(...GOLD);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SUNRISE', margin + colW/2, y + 10, { align: 'center' });
        pdf.text('SUNSET', margin + colW*1.5, y + 10, { align: 'center' });
        pdf.text('MOONRISE', margin + colW*2.5, y + 10, { align: 'center' });
        pdf.text('MOONSET', margin + colW*3.5, y + 10, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setTextColor(...VEDIC_MAROON);
        pdf.text(data.panchang.sunrise, margin + colW/2, y + 22, { align: 'center' });
        pdf.text(data.panchang.sunset, margin + colW*1.5, y + 22, { align: 'center' });
        pdf.text(data.panchang.moonrise, margin + colW*2.5, y + 22, { align: 'center' });
        pdf.text(data.panchang.moonset, margin + colW*3.5, y + 22, { align: 'center' });

        y += 45;

        // ─── 3. Core Panchang Table ───
        pdf.setTextColor(...VEDIC_MAROON);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PANCHANG ELEMENTS', margin, y);
        y += 6;

        autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'striped',
            headStyles: { fillColor: VEDIC_MAROON, textColor: WHITE, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 4 },
            body: [
                ['Tithi (Lunar Day)', clean(data.panchang.tithi)],
                ['Nakshatra (Lunar Mansion)', clean(data.panchang.nakshatra)],
                ['Yoga (Luni-Solar Day)', clean(data.panchang.yoga)],
                ['Karana (Half Lunar Day)', clean(data.panchang.karana)],
                ['Vara (Weekday)', clean(data.panchang.day)]
            ],
        });

        y = (pdf as any).lastAutoTable.finalY + 12;

        // ─── 4. Auspicious & Inauspicious Timings ───
        pdf.setTextColor(...VEDIC_MAROON);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AUSPICIOUS & MUHURAT TIMINGS', margin, y);
        y += 6;

        autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'grid',
            headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            head: [['Timing Name', 'Window Details', 'Nature']],
            body: [
                ['Abhijit Muhurat', clean(data.auspicious.abhijit), 'Auspicious'],
                ['Amrit Kaal', clean(data.auspicious.amrit_kaal), 'Auspicious'],
                ['Rahu Kaal', clean(data.inauspicious.rahu_kaal), 'Inauspicious'],
                ['Gulika Kaal', clean(data.inauspicious.gulika_kaal), 'Inauspicious'],
                ['Yamaganda', clean(data.inauspicious.yamaganda), 'Inauspicious']
            ],
            columnStyles: {
                2: { fontStyle: 'bold' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    if (data.cell.raw === 'Auspicious') data.cell.styles.textColor = [22, 101, 52];
                    if (data.cell.raw === 'Inauspicious') data.cell.styles.textColor = [153, 27, 27];
                }
            }
        });

        // ─── Footer ───
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(...SILVER);
            pdf.text(`VaidikTalk Premium Vedic Report | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        pdf.save(`VaidikTalk_Panchang_${data.date.replace(/\s+/g, '_')}.pdf`);
        toast.success('Vedic calendar archived!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to align with Vedic time.', { id: toastId });
    }
};
