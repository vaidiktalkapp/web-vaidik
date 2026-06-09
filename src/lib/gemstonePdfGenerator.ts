import toast from 'react-hot-toast';

// ── Brand Colors ──
const NAVY: [number, number, number] = [17, 24, 39];
const GOLD: [number, number, number] = [184, 150, 46];
const EMERALD: [number, number, number] = [5, 150, 105];
const RUBY: [number, number, number] = [153, 27, 27];
const SAPPHIRE: [number, number, number] = [37, 99, 235];
const GRAY: [number, number, number] = [107, 114, 128];
const CREAM: [number, number, number] = [253, 246, 227];

interface GemstoneData {
    gemstones: Array<{
        gemstone: string;
        planet: string;
        role: string;
        is_recommended: boolean;
        metal: string;
        finger: string;
    }>;
    input: {
        name: string;
        date: string;
        place?: string;
    };
    settings?: {
        gemstones?: Record<string, any>;
        gemstoneRoleDescriptions?: Record<string, string>;
    };
}

export const downloadGemstonePDF = async (data: GemstoneData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Aligning Gemstone Vibrations...', {
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
            if (typeof txt !== 'string') return String(txt);
            return txt.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
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
        pdf.setFillColor(...NAVY);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('JEWELS OF DESTINY: VEDIC GEMSTONE ANALYSIS', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DIVINE REMEDIAL REPORT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. Identity & Intro ───
        pdf.setTextColor(...NAVY);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clean(data.input.name).toUpperCase(), margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text(`BORN: ${data.input.date} | ${clean(data.input.place)}`, margin, y + 6);
        
        y += 18;

        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ASTROLOGICAL SUMMARY', margin, y);
        y += 6;

        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...GOLD);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 20, 2, 2, 'FD');

        pdf.setTextColor(...NAVY);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const primaryStone = data.gemstones.filter(g => g.is_recommended)[0];
        const summaryMsg = primaryStone 
            ? `Your most auspicious gemstone is ${primaryStone.gemstone}.`
            : "Gemstone recommendations based on your unique Janam Kundli.";
        pdf.text(summaryMsg, pageWidth / 2, y + 12, { align: 'center' });

        y += 35;

        // ─── 2. Gemstone Deep-Dive ───
        const roleDescriptions: Record<string, string> = {
            'Life Stone': 'A life stone is a gem for the Lagna lord. Wearing it removes obstacles and blesses one with happiness, success and prosperity.',
            'Lucky Stone': "Based on the 5th house lord, this stone keeps luck ticking and brings pleasant surprises.",
            'Fortune Stone': 'Based on the 9th house lord. Known to make fortune work for you when you need it most.',
            'Bhagya Stone': 'Based on the 9th house lord. Known to make fortune work for you when you need it most.'
        };

        const staticDetails: Record<string, any> = {
            'Ruby': { hindi: 'Manik', weight: '3–5 Carats', mantra: 'Om Hraam Hreem Hroum Sah Suryaya Namah', day: 'Sunday' },
            'Pearl': { hindi: 'Moti', weight: '2–4 Carats', mantra: 'Om Shram Shreem Shroum Sah Chandraya Namah', day: 'Monday' },
            'Red Coral': { hindi: 'Moonga', weight: '3–5 Carats', mantra: 'Om Kraam Kreem Kroum Sah Bhaumaya Namah', day: 'Tuesday' },
            'Emerald': { hindi: 'Panna', weight: '3–5 Carats', mantra: 'Om Braam Breem Broum Sah Budhaya Namah', day: 'Wednesday' },
            'Yellow Sapphire': { hindi: 'Pukhraj', weight: '2–4 Carats', mantra: 'Om Graam Greem Groum Sah Gurave Namah', day: 'Thursday' },
            'Diamond': { hindi: 'Heera', weight: '0.5–1 Carat', mantra: 'Om Draam Dreem Droum Sah Shukraya Namah', day: 'Friday' },
            'Blue Sapphire': { hindi: 'Neelam', weight: '2–4 Carats', mantra: 'Om Praam Preem Proum Sah Shanaischaraya Namah', day: 'Saturday' },
            'Gomed': { hindi: 'Hessonite', weight: '3–5 Carats', mantra: 'Om Bhraam Bhreem Bhroum Sah Rahave Namah', day: 'Saturday' },
            "Cat's Eye": { hindi: 'Lehsunia', weight: '3–5 Carats', mantra: 'Om Sraam Sreem Sroum Sah Ketave Namah', day: 'Tuesday' }
        };

        for (const gem of data.gemstones) {
            checkPage(80);
            
            const accent = gem.role === 'Life Stone' ? SAPPHIRE : gem.role === 'Lucky Stone' ? GOLD : EMERALD;
            const roleName = gem.role === 'Fortune Stone' ? 'Bhagya Stone' : gem.role;

            pdf.setTextColor(...accent);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(roleName.toUpperCase(), margin, y);
            
            if (gem.is_recommended) {
                pdf.setFillColor(...EMERALD);
                pdf.roundedRect(margin + 50, y - 5, 25, 6, 1, 1, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(7);
                pdf.text('RECOMMENDED', margin + 62.5, y - 1, { align: 'center' });
            }

            y += 8;

            pdf.setTextColor(...GRAY);
            pdf.setFontSize(9.5);
            pdf.setFont('helvetica', 'normal');
            const desc = roleDescriptions[gem.role] || '';
            const splitDesc = pdf.splitTextToSize(desc, pageWidth - (margin * 2));
            pdf.text(splitDesc, margin, y);
            y += (splitDesc.length * 5) + 3;

            const details = staticDetails[gem.gemstone] || { hindi: '', weight: 'Consult Expert', mantra: 'Consult Expert', day: 'Consult Expert' };
            
            autoTable(pdf, {
                startY: y,
                body: [
                    ['Recommended Gemstone', `${gem.gemstone} ${details.hindi ? `(${details.hindi})` : ''}`],
                    ['Ruling Planet', gem.planet],
                    ['Estimated Weight', details.weight],
                    ['Best Day to Wear', details.day],
                    ['Finger to Wear On', clean(gem.finger)],
                    ['Recommended Metal', clean(gem.metal)],
                    ['Sacred Mantra', details.mantra],
                ],
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.5 },
                columnStyles: {
                    0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 45 },
                    1: { cellWidth: pageWidth - (margin * 2) - 45 }
                },
                margin: { left: margin }
            });

            y = (pdf as any).lastAutoTable.finalY + 15;
        }

        // ─── 3. Purification Guide ───
        checkPage(50);
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PURIFICATION & WEARING RITUALS', margin, y);
        y += 6;

        const rituals = [
            'Wear within 2 hours of sunrise on the designated day.',
            'Purify with raw milk and Gangajal (Holly Water) before wearing.',
            'The stone must touch the skin directly for maximum astrological impact.',
            'Chant the recommended Beej Mantra 108 times while wearing initially.',
            'Avoid wearing incompatible gemstones together (refer to disclaimer).'
        ];

        rituals.forEach((text, i) => {
            pdf.setTextColor(...NAVY);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${i + 1}. ${text}`, margin + 2, y);
            y += 6;
        });

        y += 12;

        // ─── Disclaimer ───
        checkPage(30);
        pdf.setDrawColor(...RUBY);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 5;
        
        pdf.setTextColor(...RUBY);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('IMPORTANT DISCLAIMER', margin, y);
        y += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        const disclaimer = "Astrological findings and recommendations are for guidance. Consult with a qualified Vedic astrologer before making life-altering decisions based on remedial gemstones. Purity and clarity of the stone are essential for desired results.";
        const splitDisc = pdf.splitTextToSize(disclaimer, pageWidth - (margin * 2));
        pdf.text(splitDisc, margin, y);

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...GRAY);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_Gemstone_${data.input.name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Gemstone analysis ready!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to align jewel vibrations.', { id: toastId });
    }
};
