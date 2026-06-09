import toast from 'react-hot-toast';

// ── Brand Colors ──
const FOREST_GREEN: [number, number, number] = [6, 78, 59];
const OBSIDIAN: [number, number, number] = [15, 23, 42];
const GOLD: [number, number, number] = [184, 150, 46];
const SILVER: [number, number, number] = [148, 163, 184];
const CREAM: [number, number, number] = [253, 246, 227];
const STEEL: [number, number, number] = [71, 85, 105];

interface RahuKaalData {
    location: string;
    date: string;
    rahuToday: string;
    weeklyRahu: Array<{
        date: string;
        day: string;
        rahu_kaal: string;
        is_today?: boolean;
    }>;
}

export const downloadRahuKaalPDF = async (data: RahuKaalData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Calculating Inauspicious Windows...', {
        style: {
            background: '#064e3b', color: '#f0fdf4',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(184,150,46,0.3)',
        },
        iconTheme: { primary: '#b8962e', secondary: '#f0fdf4' },
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
        pdf.setFillColor(...FOREST_GREEN);
        pdf.rect(0, 0, pageWidth, 42, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('DAILY TRANSIT MONITOR: RAHU KAAL ANALYSIS', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PRECISION ASTROLOGY REPORT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. Identity & Location ───
        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DAILY RAHU KAAL GUIDE', margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...SILVER);
        pdf.text(`LOCATION: ${clean(data.location)} | DATE: ${data.date}`, margin, y + 6);
        
        y += 18;

        // ─── 2. Today's Hero Window ───
        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 30, 3, 3, 'FD');

        pdf.setTextColor(...FOREST_GREEN);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TODAY\'S INAUSPICIOUS WINDOW', pageWidth / 2, y + 10, { align: 'center' });
        
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...OBSIDIAN);
        pdf.text(data.rahuToday || '--:-- to --:--', pageWidth / 2, y + 20, { align: 'center' });

        y += 45;

        // ─── 3. Weekly Schedule Table ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('7-DAY TRANSIT SCHEDULE', margin, y);
        y += 6;

        autoTable(pdf, {
            startY: y,
            head: [['Date', 'Day', 'Rahu Kaal Window']],
            body: data.weeklyRahu.map(item => [
                item.date,
                item.day,
                item.rahu_kaal
            ]),
            margin: { left: margin, right: margin },
            headStyles: { 
                fillColor: FOREST_GREEN, 
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: OBSIDIAN
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            }
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 4. Educational Content ───
        if (y > pageHeight - 60) {
            pdf.addPage();
            y = 20;
        }

        pdf.setTextColor(...FOREST_GREEN);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UNDERSTANDING RAHU KAAL', margin, y);
        y += 8;

        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const content = [
            "Rahu Kaal is a specific period of the day that is considered inauspicious for starting any new venture, signing documents, or performing sacred rituals.",
            "• Origin: It is one of the eight segments of the day between sunrise and sunset.",
            "• Impact: Actions initiated during this time are believed to face obstacles or lack divine support.",
            "• Exceptions: Ongoing activities or daily routines are not affected by Rahu Kaal."
        ];
        
        content.forEach(line => {
            const splitLine = pdf.splitTextToSize(line, pageWidth - (margin * 2));
            pdf.text(splitLine, margin, y);
            y += (splitLine.length * 5);
        });

        y += 10;

        pdf.setTextColor(...GOLD);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        const wisdom = "Precision is the key to Vedic living. By aligning your important actions with auspicious timings (Muhurats) and avoiding windows like Rahu Kaal, you synchronize your efforts with the natural flow of the universe.";
        const splitWisdom = pdf.splitTextToSize(wisdom, pageWidth - (margin * 2));
        pdf.text(splitWisdom, margin, y);

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...SILVER);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_RahuKaal_${data.date.replace(/[^0-9]/g, '_')}.pdf`);
        toast.success('Rahu Kaal report generated!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to calculate celestial windows.', { id: toastId });
    }
};
