import toast from 'react-hot-toast';

// ── Brand Colors ──
const NAVY: [number, number, number] = [17, 24, 39];
const JADE: [number, number, number] = [22, 101, 52];
const CRIMSON: [number, number, number] = [153, 27, 27];
const GOLD: [number, number, number] = [184, 150, 46];
const GRAY: [number, number, number] = [107, 114, 128];
const CREAM: [number, number, number] = [253, 246, 227];

interface ChineseHoroscopeData {
    userName: string;
    animal: string;
    element: string;
    destinyPath: string;
    personality: {
        traits: string[];
        shadows: string[];
    };
    fengShuiTip: string;
    luckyElements: {
        color: string;
        direction: string;
        careerField: string;
    };
}

export const downloadChineseHoroscopePDF = async (data: ChineseHoroscopeData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Calculating Celestial Alignment...', {
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
        pdf.setFillColor(...NAVY);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('PERSONAL CHINESE DESTINY ANALYSIS', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('IMPERIAL LUNAR REPORT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. The Celestial Animal Header ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THE CELESTIAL ALIGNMENT', margin, y);
        y += 8;

        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...GOLD);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 25, 3, 3, 'FD');

        pdf.setTextColor(...NAVY);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const titleStr = `THE ${data.element.toUpperCase()} ${data.animal.toUpperCase()}`;
        pdf.text(titleStr, pageWidth / 2, y + 12, { align: 'center' });

        pdf.setTextColor(...GOLD);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('BORN FOR LEGACY · YEAR OF TRANSFORMATION', pageWidth / 2, y + 19, { align: 'center' });

        y += 35;

        // ─── 2. Destiny Path ───
        checkPage(50);
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DESTINY ARC', margin, y);
        y += 6;

        pdf.setTextColor(...NAVY);
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'normal');
        const greeting = `Greetings ${clean(data.userName)}, your path as a ${data.element} ${data.animal} is one of profound significance.`;
        const splitGreeting = pdf.splitTextToSize(greeting, pageWidth - (margin * 2));
        pdf.text(splitGreeting, margin, y);
        y += (splitGreeting.length * 5) + 2;

        pdf.setTextColor(...GRAY);
        pdf.setFontSize(10);
        const path = clean(data.destinyPath);
        const splitPath = pdf.splitTextToSize(path, pageWidth - (margin * 2));
        pdf.text(splitPath, margin, y);
        y += (splitPath.length * 5) + 15;

        // ─── 3. Virtues & Shadows Grid ───
        checkPage(60);
        
        autoTable(pdf, {
            startY: y,
            head: [['VIRTUES OF POWER', 'SHADOWS TO BALANCE']],
            body: [[
                (data.personality.traits || []).map(t => `• ${clean(t)}`).join('\n\n'),
                (data.personality.shadows || []).map(t => `• ${clean(t)}`).join('\n\n')
            ]],
            theme: 'grid',
            headStyles: { fillColor: NAVY, textColor: [255,255,255], fontSize: 10, halign: 'center' },
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 6 },
            columnStyles: {
                0: { textColor: JADE },
                1: { textColor: CRIMSON }
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 4. Feng Shui Tip ───
        checkPage(40);
        pdf.setFillColor(...CREAM);
        pdf.setDrawColor(...GOLD);
        pdf.roundedRect(margin, y, pageWidth - (margin * 2), 30, 2, 2, 'FD');

        pdf.setTextColor(...GOLD);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('GRAND MASTER\'S FENG SHUI TIP', margin + 5, y + 8);
        
        pdf.setTextColor(...NAVY);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        const tip = `"${clean(data.fengShuiTip)}"`;
        const splitTip = pdf.splitTextToSize(tip, pageWidth - (margin * 2) - 15);
        pdf.text(splitTip, pageWidth / 2, y + 17, { align: 'center' });

        y += 40;

        // ─── 5. Lucky Elements Grid ───
        checkPage(40);
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROSPERITY MARKERS', margin, y);
        y += 6;

        const luckyData = [
            ['Lucky Color', clean(data.luckyElements.color)],
            ['Prosperity Direction', clean(data.luckyElements.direction)],
            ['Abundance Path', clean(data.luckyElements.careerField)],
        ];

        autoTable(pdf, {
            startY: y,
            body: luckyData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 50 },
                1: { cellWidth: pageWidth - (margin * 2) - 50 }
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 20;

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...GRAY);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_ChineseDestiny_${data.userName.replace(/\s+/g, '_')}.pdf`);
        toast.success('Destiny report ready!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to align celestial energy.', { id: toastId });
    }
};
