import toast from 'react-hot-toast';

// ── Brand Colors ──
const FOREST_GREEN: [number, number, number] = [6, 78, 59];
const OBSIDIAN: [number, number, number] = [15, 23, 42];
const GOLD: [number, number, number] = [184, 150, 46];
const SILVER: [number, number, number] = [148, 163, 184];
const ROSE: [number, number, number] = [153, 27, 27];
const CREAM: [number, number, number] = [253, 246, 227];

interface KaalSarpData {
    doshas: {
        is_present: boolean;
        type: string;
    };
    input: {
        name: string;
        date: string;
        place?: string;
    };
    typeData?: {
        meaning: string;
        description: string;
        effects: string[];
        remedies: string[];
    };
}

export const downloadKaalSarpPDF = async (data: KaalSarpData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Decoding Serpent Energy...', {
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
        pdf.setFillColor(...FOREST_GREEN);
        pdf.rect(0, 0, pageWidth, 42, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('KAAL SARP DOSHA: CELESTIAL AXIS ANALYSIS', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KARMA & DESTINY REPORT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. Identity ───
        pdf.setTextColor(...OBSIDIAN);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clean(data.input.name).toUpperCase(), margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...SILVER);
        pdf.text(`BORN: ${data.input.date} | ${clean(data.input.place)}`, margin, y + 6);
        
        y += 18;

        // ─── 2. Diagnosis Hero ───
        const isPresent = data.doshas.is_present;
        const statusColor = isPresent ? ROSE : FOREST_GREEN;

        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...statusColor);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 25, 3, 3, 'FD');

        pdf.setTextColor(...statusColor);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(isPresent ? `${data.doshas.type.toUpperCase()} KAAL SARP YOGA FOUND` : 'NO KAAL SARP DOSHA DETECTED', pageWidth / 2, y + 10, { align: 'center' });
        
        pdf.setFontSize(9.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...OBSIDIAN);
        const statusDesc = isPresent 
            ? `Your birth chart contains the ${data.doshas.type} Kaal Sarp alignment.`
            : "Your chart exhibits a balanced planetary distribution, free from the Kaal Sarp yoga influence.";
        pdf.text(statusDesc, pageWidth / 2, y + 16, { align: 'center' });

        y += 38;

        // ─── 3. Specific Type Analysis ───
        if (isPresent && data.typeData) {
            pdf.setTextColor(...GOLD);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('YOGA CHARACTERISTICS', margin, y);
            y += 6;

            pdf.setTextColor(...OBSIDIAN);
            pdf.setFontSize(9.5);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Formation: ${clean(data.typeData.meaning)}`, margin, y);
            y += 8;

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...OBSIDIAN);
            const desc = clean(data.typeData.description);
            const splitDesc = pdf.splitTextToSize(desc, pageWidth - (margin * 2));
            pdf.text(splitDesc, margin, y);
            y += (splitDesc.length * 5) + 8;

            // Effects
            checkPage(40);
            pdf.setTextColor(...GOLD);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('POTENTIAL EFFECTS', margin, y);
            y += 6;

            data.typeData.effects.forEach((effect, i) => {
                checkPage(6);
                pdf.setTextColor(...OBSIDIAN);
                pdf.setFontSize(8.5);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`• ${clean(effect)}`, margin + 2, y);
                y += 5;
            });

            y += 10;

            // Remedies
            checkPage(50);
            pdf.setFillColor(...CREAM);
            pdf.roundedRect(margin, y, pageWidth - (margin * 2), 65, 2, 2, 'F');
            pdf.setTextColor(...FOREST_GREEN);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SPIRITUAL REMEDIES (UPAYAS)', margin + 5, y + 8);
            
            y += 15;
            data.typeData.remedies.slice(0, 7).forEach((remedy, i) => {
                pdf.setTextColor(...OBSIDIAN);
                pdf.setFontSize(8.5);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`${i + 1}. ${clean(remedy)}`, margin + 7, y);
                y += 5.5;
            });
        }

        y += 15;

        // ─── 4. General Wisdom ───
        checkPage(40);
        pdf.setDrawColor(...SILVER);
        pdf.setLineWidth(0.2);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 8;

        pdf.setTextColor(...FOREST_GREEN);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THE VEDIC PERSPECTIVE', margin, y);
        y += 6;

        pdf.setTextColor(...STEEL);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'italic');
        const wisdom = "Kaal Sarp Yoga is formed through the Rahu-Ketu axis. While it can bring challenges, it also bestows immense resilience and strength. With right action (Karma) and spiritual practice, the native can transform any astrological barrier into a stepping stone for success.";
        const splitWisdom = pdf.splitTextToSize(wisdom, pageWidth - (margin * 2));
        pdf.text(splitWisdom, margin, y);

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...SILVER);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_KaalSarp_${data.input.name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Serpent axis decoded!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to align serpent energy.', { id: toastId });
    }
};

const STEEL: [number, number, number] = [71, 85, 105];
