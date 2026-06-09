import toast from 'react-hot-toast';

// ── Brand Colors ──
const NAVY: [number, number, number] = [17, 24, 39];
const GOLD: [number, number, number] = [184, 150, 46];
const MAROON: [number, number, number] = [122, 31, 1];
const BLUE: [number, number, number] = [37, 99, 235];
const GRAY: [number, number, number] = [107, 114, 128];
const CREAM: [number, number, number] = [253, 246, 227];

interface NumerologyData {
    namaank: number;
    bhagyaank: number;
    moolaank: number;
    inputName: string;
    inputDob: string;
    attributeData: {
        sign?: string;
        alphabets?: string;
        gemstone?: string;
        days?: string;
        numbers?: string;
        direction?: string;
        colour?: string;
        planet?: string;
        deity?: string;
        fast?: string;
        dates?: string;
        descriptionMoolaank?: string;
        descriptionBhagyaank?: string;
        descriptionNamaank?: string;
    };
}

export const downloadNumerologyPDF = async (data: NumerologyData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Calculating Vibrational Alignment...', {
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
        pdf.text('SACRED CHALDEAN NUMEROLOGY ANALYSIS', margin, 28);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PERSONAL VIBRATIONAL REPORT', pageWidth - margin, 25, { align: 'right' });

        y = 55;

        // ─── 1. The Trinity Numbers ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THE NUMEROLOGICAL TRINITY', margin, y);
        y += 8;

        const trinityData = [
            [
                { val: data.moolaank, label: 'RADICAL NUMBER', color: GOLD },
                { val: data.bhagyaank, label: 'DESTINY NUMBER', color: MAROON },
                { val: data.namaank, label: 'NAME NUMBER', color: BLUE }
            ]
        ];

        // Draw Trinity Boxes Manually for High Impact
        const boxW = (pageWidth - (margin * 2) - 10) / 3;
        trinityData[0].forEach((box, i) => {
            const bx = margin + (i * (boxW + 5));
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(...box.color);
            pdf.roundedRect(bx, y, boxW, 30, 3, 3, 'FD');
            
            pdf.setTextColor(...box.color);
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text(String(box.val), bx + (boxW / 2), y + 18, { align: 'center' });
            
            pdf.setFontSize(7);
            pdf.setTextColor(...GRAY);
            pdf.text(box.label, bx + (boxW / 2), y + 25, { align: 'center' });
        });

        y += 45;

        // ─── 2. Personal Particulars ───
        pdf.setTextColor(...NAVY);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.inputName.toUpperCase(), margin, y);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text(`BORN: ${data.inputDob.split('-').reverse().join('-')}`, margin, y + 6);
        
        y += 15;

        // ─── 3. Attribute Matrix ───
        pdf.setTextColor(...GOLD);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SACRED CORRESPONDENCES', margin, y);
        y += 6;

        const attr = data.attributeData;
        const matrixData = [
            ['Favourable Sign', clean(attr.sign), 'Gemstone', clean(attr.gemstone)],
            ['Auspicious Day', clean(attr.days), 'Ruling Planet', clean(attr.planet)],
            ['Direction', clean(attr.direction), 'Auspicious Color', clean(attr.colour)],
            ['Deity', clean(attr.deity), 'Fasting Day', clean(attr.fast)],
        ];

        autoTable(pdf, {
            startY: y,
            body: matrixData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
            columnStyles: {
                0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 35 },
                2: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 35 },
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 10;

        autoTable(pdf, {
            startY: y,
            body: [
                ['Favourable Alphabets', clean(attr.alphabets)],
                ['Favourable Numbers', clean(attr.numbers)],
                ['Auspicious Dates', clean(attr.dates)],
            ],
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
            columnStyles: {
                0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 50 },
            },
            margin: { left: margin }
        });

        y = (pdf as any).lastAutoTable.finalY + 15;

        // ─── 4. Vibrational Analysis ───
        const analysis = [
            { title: 'RADICAL ANALYSIS (SELF)', val: data.moolaank, desc: attr.descriptionMoolaank, color: GOLD },
            { title: 'DESTINY ANALYSIS (PATH)', val: data.bhagyaank, desc: attr.descriptionBhagyaank, color: MAROON },
            { title: 'NAME VIBRATION (AURA)', val: data.namaank, desc: attr.descriptionNamaank, color: BLUE },
        ];

        for (const sec of analysis) {
            checkPage(40);
            pdf.setTextColor(...sec.color);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${sec.title} - ${sec.val}`, margin, y);
            y += 6;

            autoTable(pdf, {
                startY: y,
                body: [[clean(sec.desc)]],
                theme: 'plain',
                styles: { font: 'helvetica', fontSize: 10, cellPadding: 1 },
                columnStyles: { 0: { cellWidth: pageWidth - (margin * 2) } }
            });
            y = (pdf as any).lastAutoTable.finalY + 15;
        }

        // ─── Footer ───
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...GRAY);
        pdf.text('Copyright © 2026 VaidikTalk. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`VaidikTalk_Numerology_${data.inputName.replace(/\s+/g, '_')}.pdf`);
        toast.success('Numerology report ready!', { id: toastId });

    } catch (error) {
        console.error('PDF error:', error);
        toast.error('Failed to calculate vibrations.', { id: toastId });
    }
};
