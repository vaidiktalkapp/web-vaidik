import toast from 'react-hot-toast';

// ── Brand Colors ──
const GOLD: [number, number, number] = [184, 150, 46];
const NAVY: [number, number, number] = [17, 24, 39];
const GRAY: [number, number, number] = [107, 114, 128];
const CREAM: [number, number, number] = [253, 246, 227];
const ROSE: [number, number, number] = [225, 29, 72];
const LIGHT_ROSE: [number, number, number] = [255, 241, 242];

interface LoveHoroscopeData {
    name: string;
    keyPlacements: {
        venus: string;
        mars: string;
        jupiter: string;
        moon: string;
        marriageLord: string;
    };
    loveLanguage: string;
    romanticArchetype: {
        title: string;
        description: string;
    };
    sections: { title: string; content: string }[];
    soulmateTraits: string[];
    timingInsight: string;
    input?: {
        name: string;
        date: string;
        time: string;
        place: string;
        lat?: any;
        lon?: any;
    };
}

export const downloadLoveHoroscopePDF = async (data: LoveHoroscopeData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Calculating Romantic Alignments...', {
        style: {
            background: '#1c1509', color: '#fdf6e3',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(225,29,72,0.3)',
        },
        iconTheme: { primary: '#e11d48', secondary: '#fdf6e3' },
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
            return txt.replace(/\s+/g, ' ').trim();
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
        pdf.setFillColor(...ROSE);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('DIVINE LOVE & ROMANCE HOROSCOPE', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PERSONAL SOUL DESTINY REPORT', pageWidth - margin, 25, { align: 'right' });

        y = 50;

        // ─── 1. Seeker Profile Card ───
        pdf.setFillColor(...LIGHT_ROSE);
        pdf.setDrawColor(...ROSE);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 35, 3, 3, 'FD');
        
        pdf.setTextColor(...ROSE);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SOUL PROFILE', margin + 5, y + 8);
        
        pdf.setTextColor(...NAVY);
        pdf.setFontSize(14);
        pdf.text(data.name.toUpperCase(), margin + 5, y + 16);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...GRAY);
        if (data.input) {
            const details = `${data.input.date}  |  ${data.input.time}  |  ${data.input.place}`;
            pdf.text(details, margin + 5, y + 24);
            if (data.input.lat && data.input.lon) {
                pdf.text(`Lat: ${data.input.lat}  |  Lon: ${data.input.lon}`, margin + 5, y + 29);
            }
        } else {
            pdf.text('General Personal Analysis', margin + 5, y + 24);
        }
        
        y += 45;

        // ─── 2. Romantic Archetype ───
        checkPage(50);
        pdf.setTextColor(...ROSE);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LUNAR ROMANTIC ARCHETYPE', margin, y);
        y += 8;

        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...GOLD);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 30, 2, 2, 'FD');

        pdf.setTextColor(...NAVY);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clean(data.romanticArchetype.title).toUpperCase(), margin + 5, y + 10);

        pdf.setTextColor(...GRAY);
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        const archDesc = clean(data.romanticArchetype.description);
        const splitArch = pdf.splitTextToSize(archDesc, pageWidth - (margin * 2) - 15);
        pdf.text(splitArch, margin + 5, y + 17);

        y += 40;

        // ─── 3. Celestial Love Placements ───
        pdf.setTextColor(...ROSE);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CELESTIAL LOVE CONFIGURATIONS', margin, y);
        y += 8;

        const placements = data.keyPlacements;
        const placementData = [
            ['Venus', clean(placements.venus), 'Mars', clean(placements.mars)],
            ['Moon', clean(placements.moon), 'Jupiter', clean(placements.jupiter)],
            ['Marriage', clean(placements.marriageLord), 'Connection', clean(data.loveLanguage)],
        ];

        autoTable(pdf, {
            startY: y,
            body: placementData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.5 },
            columnStyles: {
                0: { fillColor: [255, 241, 242], fontStyle: 'bold', cellWidth: 35 },
                2: { fillColor: [255, 241, 242], fontStyle: 'bold', cellWidth: 35 },
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 4. Analysis Sections ───
        for (const section of data.sections) {
            checkPage(40);
            pdf.setTextColor(...ROSE);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(clean(section.title).toUpperCase(), margin, y);
            y += 6;

            autoTable(pdf, {
                startY: y,
                body: [[clean(section.content)]],
                theme: 'plain',
                styles: { font: 'helvetica', fontSize: 10, cellPadding: 1 },
                columnStyles: { 0: { cellWidth: pageWidth - (margin * 2) } }
            });
            y = (pdf as any).lastAutoTable.finalY + 12;
        }

        // ─── 5. Soulmate Signatures & Karmic Timing ───
        checkPage(60);
        
        // Soulmate Card
        pdf.setFillColor(...GOLD);
        pdf.rect(margin, y, (pageWidth - (margin * 2)) / 2 - 2, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text('SOULMATE SIGNATURES', margin + 5, y + 5.5);
        
        const traits = (data.soulmateTraits || []).map(t => `• ${clean(t)}`);
        autoTable(pdf, {
            startY: y + 8,
            body: [[traits.join('\n\n')]],
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 5 },
            columnStyles: { 0: { cellWidth: (pageWidth - (margin * 2)) / 2 - 2 } },
            margin: { left: margin }
        });

        // Timing Card
        const sideStartX = margin + (pageWidth - (margin * 2)) / 2 + 2;
        pdf.setFillColor(...ROSE);
        pdf.rect(sideStartX, y, (pageWidth - (margin * 2)) / 2 - 2, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text('KARMIC TIMING', sideStartX + 5, y + 5.5);

        autoTable(pdf, {
            startY: y + 8,
            body: [[`WHEN WILL UNION MANIFEST?\n\n${clean(data.timingInsight)}`]],
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 5 },
            columnStyles: { 0: { cellWidth: (pageWidth - (margin * 2)) / 2 - 2 } },
            margin: { left: sideStartX }
        });

        y = (pdf as any).lastAutoTable.finalY + 20;

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...GRAY);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_LoveHoroscope_${data.name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Romantic report synthesized!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Cosmic alignment failed.', { id: toastId });
    }
};
