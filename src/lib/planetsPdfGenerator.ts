import toast from 'react-hot-toast';

// ── Brand Colors ──
const SPACE_BLUE: [number, number, number] = [30, 58, 138];
const DEEP_BLUE: [number, number, number] = [23, 37, 84];
const GOLD: [number, number, number] = [184, 150, 46];
const SILVER: [number, number, number] = [148, 163, 184];
const WHITE: [number, number, number] = [255, 255, 255];

interface PlanetsPdfData {
    location: string;
    date: string;
    positions: Array<{
        name: string;
        sign: string;
        degree: string;
        house: number;
        is_retrograde: boolean;
    }>;
    transits: Array<{
        planet: string;
        from: string;
        to: string;
        date: string;
    }>;
}

export const downloadPlanetsPDF = async (data: PlanetsPdfData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Synchronizing Ephemeris...', {
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

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 15;
        let y = 0;

        // ─── 0. Hero Header ───
        pdf.setFillColor(...SPACE_BLUE);
        pdf.rect(0, 0, pageWidth, 50, 'F');
        
        pdf.setTextColor(...WHITE);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.text('PLANETARY EPHEMERIS', margin, 25);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GOLD);
        pdf.text('VaidikTalk Real-time Celestial Monitor', margin, 32);

        pdf.setTextColor(...WHITE);
        pdf.setFontSize(8);
        pdf.text(`OBSERVATION POINT: ${data.location.toUpperCase()}`, margin, 42);
        pdf.text(`TIMESTAMP: ${data.date}`, pageWidth - margin, 42, { align: 'right' });

        y = 65;

        // ─── 1. Current Positions Table ───
        pdf.setTextColor(...DEEP_BLUE);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CURRENT PLANETARY POSITIONS', margin, y);
        y += 7;

        const planetRows = data.positions.map(p => [
            p.name,
            p.sign,
            p.degree,
            `House ${p.house}`,
            p.is_retrograde ? 'YES' : 'NO'
        ]);

        autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'striped',
            headStyles: { fillColor: SPACE_BLUE, textColor: WHITE, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            head: [['Planet', 'Zodiac Sign', 'Exact Degree', 'House', 'Retrograde']],
            body: planetRows,
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 2. Recent Transits Table ───
        if (y > pageHeight - 60) {
            pdf.addPage();
            y = 20;
        }

        pdf.setTextColor(...DEEP_BLUE);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RECENT CELESTIAL TRANSITS (INGRESS)', margin, y);
        y += 7;

        const transitRows = data.transits.map(t => [
            t.planet,
            t.from,
            t.to,
            t.date
        ]);

        autoTable(pdf, {
            startY: y,
            margin: { left: margin, right: margin },
            theme: 'grid',
            headStyles: { fillColor: GOLD, textColor: DEEP_BLUE, fontStyle: 'bold' },
            styles: { fontSize: 8.5, cellPadding: 3 },
            head: [['Planet', 'Exit Sign', 'Enter Sign', 'Ingress Date']],
            body: transitRows,
        });

        // ─── Footer ───
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(...SILVER);
            pdf.text(`VaidikTalk Premium Astrology Report | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        pdf.save(`Planetary_Positions_${data.location.replace(/\s+/g, '_')}.pdf`);
        toast.success('Celestial data archived!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to sync with celestial bodies.', { id: toastId });
    }
};
