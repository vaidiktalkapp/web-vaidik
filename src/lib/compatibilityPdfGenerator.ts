import toast from 'react-hot-toast';

// ── Brand Colors ──
const NAVY: [number, number, number] = [17, 24, 39];
const GOLD: [number, number, number] = [184, 150, 46];
const MAROON: [number, number, number] = [122, 31, 1];
const BLUE: [number, number, number] = [37, 99, 235];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT_GOLD: [number, number, number] = [249, 245, 235];
const DARK_GOLD: [number, number, number] = [160, 124, 30];

export interface CompatibilityData {
    type: 'love' | 'name';
    loveResult?: any;
    nameResult?: any;
    aiReport?: any;
}

/**
 * Specialized PDF Report Generator for Compatibility Tools
 * Supports both Zodiac Love Matching and Numerology Name Matching
 */
export const downloadCompatibilityPDF = async (data: CompatibilityData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Architecting your cosmic report...', {
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
        const contentWidth = pageWidth - (margin * 2);

        // ─── Utility: Clean Text ───
        const clean = (txt: any): string => {
            if (txt === undefined || txt === null) return '-';
            return String(txt).replace(/\s+/g, ' ').trim();
        };

        const checkPage = (addedHeight: number) => {
            if (y + addedHeight > pageHeight - 20) {
                pdf.addPage();
                y = 20;
                drawPageHeader(pdf, pageWidth, margin);
                return true;
            }
            return false;
        };

        const drawPageHeader = (p: any, pw: number, m: number) => {
            p.setFillColor(...GOLD);
            p.rect(0, 0, pw, 2, 'F');
            p.setFont('helvetica', 'bold');
            p.setFontSize(10);
            p.setTextColor(...NAVY);
            p.text('VaidikTalk', m, 8);
            p.setDrawColor(...GOLD);
            p.setLineWidth(0.3);
            p.line(m, 10, pw - m, 10);
        };

        const drawFooter = (p: any, pw: number, ph: number, m: number) => {
            p.setFont('helvetica', 'normal');
            p.setFontSize(8);
            p.setTextColor(...GRAY);
            p.text('www.vaidiktalk.com', m, ph - 10);
            p.text('Auto-generated compatibility reference report.', pw / 2, ph - 10, { align: 'center' });
            p.text(`Page ${p.getNumberOfPages()}`, pw - m, ph - 10, { align: 'right' });
        };

        let y = 0;

        // ═══════════════════════════════════════════════════════════
        // HEADER STRIP
        // ═══════════════════════════════════════════════════════════
        pdf.setFillColor(...NAVY);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('VaidikTalk', margin, 18);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setCharSpace(0.5);
        const subTitle = data.type === 'love' ? 'COSMIC ZODIAC COMPATIBILITY ANALYSIS' : 'SACRED NAME VIBRATION MATCHING';
        pdf.text(subTitle, margin, 26);
        pdf.setCharSpace(0); // Reset after header

        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROFESSIONAL PARTNERSHIP REPORT', pageWidth - margin, 22, { align: 'right' });

        y = 50;

        if (data.type === 'love') {
            const res = data.loveResult!;
            const ai = data.aiReport;

            // ── Section 1: The Couple ──
            pdf.setTextColor(...NAVY);
            pdf.setFontSize(14);
            pdf.text('RELATIONSHIP OVERVIEW', margin, y);
            y += 8;

            // Names and Signs
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(clean(res.name1 || 'Person 1'), margin, y);
            pdf.text(clean(res.name2 || 'Person 2'), pageWidth - margin, y, { align: 'right' });
            
            y += 6;
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GOLD);
            // Non-standard fonts don't support symbols like ♈, using just names
            pdf.text(`${res.sign1.name} (${res.sign1.element})`, margin, y);
            pdf.text(`${res.sign2.name} (${res.sign2.element})`, pageWidth - margin, y, { align: 'right' });

            y += 12;

            // Overall Score Ring (Drawn as a summary box)
            pdf.setFillColor(...LIGHT_GOLD);
            pdf.setDrawColor(...GOLD);
            pdf.roundedRect(margin, y, contentWidth, 25, 3, 3, 'FD');
            
            pdf.setTextColor(...NAVY);
            pdf.setFontSize(10);
            pdf.text('OVERALL COMPATIBILITY SCORE', margin + 8, y + 10);
            
            pdf.setFontSize(24);
            const color: [number, number, number] = res.score >= 70 ? [21, 128, 61] : [184, 150, 46];
            pdf.setTextColor(...color); // Greenish or Gold
            pdf.text(`${res.score}%`, margin + 8, y + 20);
            
            pdf.setFontSize(11);
            pdf.setTextColor(...NAVY);
            // Move level down to align better with score baseline
            pdf.text(res.level.toUpperCase(), pageWidth - margin - 8, y + 20, { align: 'right' });

            y += 35;

            // ── Section 2: Dimensional Analysis ──
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...NAVY);
            pdf.text('COMPATIBILITY DIMENSIONS', margin, y);
            y += 6;

            const categoryData = [
                ['Dimension', 'Score', 'Focus Area'],
                ['Emotional Strength', `${res.emotional}%`, 'Heart Connection & Empathy'],
                ['Romantic Chemistry', `${res.romance}%`, 'Passion & Sexual Spark'],
                ['Intellectual Bonding', `${res.intellectual}%`, 'Conversation & Shared Ideas'],
                ['Communication', `${res.communication}%`, 'Understanding & Transparency'],
                ['Physical Connection', `${res.physical}%`, 'Energy & Lifestyle Synergy'],
                ['Long-term Stability', `${res.longTerm}%`, 'Resilience & Commitment'],
                ['Spiritual Alignment', `${res.spiritual}%`, 'Soul Path & Beliefs']
            ];

            autoTable(pdf, {
                startY: y,
                head: [categoryData[0]],
                body: categoryData.slice(1),
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 4 },
                headStyles: { fillColor: GOLD, textColor: [255, 255, 255] },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 55 }, // Increased for long names like "Intellectual Bonding"
                    1: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
                    2: { textColor: GRAY }
                },
                margin: { left: margin }
            });
            y = (pdf as any).lastAutoTable.finalY + 12;

            // ── Section 3: Deep Insights ──
            const insightText = ai?.deepInsight || res.pairInsight;
            const chemistryText = ai?.chemistry || res.chemistry;
            
            checkPage(40);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...NAVY);
            pdf.text('COSMIC INSIGHTS', margin, y);
            y += 6;

            autoTable(pdf, {
                startY: y,
                body: [
                    [{ content: 'Relationship Dynamic', styles: { fontStyle: 'bold', fillColor: [249, 245, 235] } }],
                    [clean(insightText)],
                    [{ content: 'Romantic Chemistry', styles: { fontStyle: 'bold', fillColor: [249, 245, 235] } }],
                    [clean(chemistryText)]
                ],
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 5, lineColor: [233, 221, 184] },
                margin: { left: margin }
            });
            y = (pdf as any).lastAutoTable.finalY + 12;

            // ── Section 4: Advice & Balance ──
            checkPage(30);
            pdf.setFillColor(253, 246, 227); // Cream
            pdf.roundedRect(margin, y, contentWidth, 30, 2, 2, 'F');
            pdf.setTextColor(...MAROON);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('COSMIC ADVICE FOR HARMONY', margin + 5, y + 8);
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const adviceLines = pdf.splitTextToSize(clean(ai?.advice || res.advice), contentWidth - 10);
            pdf.text(adviceLines, margin + 5, y + 15);
            
        } else if (data.type === 'name') {
            const res = data.nameResult!;
            const ai = data.aiReport;

            // ── Section 1: Numerological Match ──
            pdf.setTextColor(...NAVY);
            pdf.setFontSize(14);
            pdf.text('VIBRATIONAL SUMMARY', margin, y);
            y += 8;

            pdf.setFillColor(...LIGHT_GOLD);
            pdf.setDrawColor(...GOLD);
            pdf.roundedRect(margin, y, contentWidth, 25, 3, 3, 'FD');
            
            pdf.setTextColor(...NAVY);
            pdf.setFontSize(10);
            pdf.text('NAME COMPATIBILITY SCORE', margin + 8, y + 10);
            
            pdf.setFontSize(24);
            pdf.setTextColor(...MAROON);
            pdf.text(`${res.score}%`, margin + 8, y + 20);
            
            pdf.setFontSize(12);
            pdf.setTextColor(...NAVY);
            pdf.text(res.level.toUpperCase(), pageWidth - margin - 8, y + 20, { align: 'right' });

            y += 35;

            // ── Section 2: Individual Namanks ──
            const individualData = [
                ['Attribute', clean(res.name1), clean(res.name2)],
                ['Chaldean Number', res.num1, res.num2],
                ['Archetype', res.archetype1.title, res.archetype2.title],
                ['Ruling Planet', res.archetype1.planet, res.archetype2.planet],
                ['Zodiac Sign', res.rashi1.name, res.rashi2.name]
            ];

            autoTable(pdf, {
                startY: y,
                head: [individualData[0]],
                body: individualData.slice(1),
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 5 },
                headStyles: { fillColor: NAVY, textColor: [255, 255, 255] },
                columnStyles: {
                    0: { fontStyle: 'bold', fillColor: [249, 250, 251], cellWidth: 40 },
                    1: { halign: 'center' },
                    2: { halign: 'center' }
                },
                margin: { left: margin }
            });
            y = (pdf as any).lastAutoTable.finalY + 15;

            // ── Section 3: Sacred Archetypes ──
            checkPage(50);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...GOLD);
            pdf.text('COSMIC ARCHETYPES', margin, y);
            y += 6;

            const archs = [
                { name: res.name1, arch: res.archetype1 },
                { name: res.name2, arch: res.archetype2 }
            ];

            for (const item of archs) {
                checkPage(40);
                pdf.setFillColor(249, 250, 251);
                pdf.rect(margin, y, contentWidth, 8, 'F');
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...NAVY);
                pdf.text(`${item.name} - ${item.arch.title}`, margin + 3, y + 5.5);
                y += 10;

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(60, 60, 60);
                const descLines = pdf.splitTextToSize(clean(item.arch.description), contentWidth);
                pdf.text(descLines, margin, y);
                y += (descLines.length * 4) + 6;
                
                if (item.arch.inLove) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(...MAROON);
                    pdf.text('In Relationships:', margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(80, 80, 80);
                    const loveLines = pdf.splitTextToSize(clean(item.arch.inLove), contentWidth - 30);
                    pdf.text(loveLines, margin + 30, y);
                    y += (loveLines.length * 4) + 8;
                }
            }

            // ── Section 4: Connection Insight ──
            checkPage(30);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...NAVY);
            pdf.text('SACRED CONNECTION INSIGHT', margin, y);
            y += 6;

            const insight = ai?.deepInsight || res.relationshipInsight;
            autoTable(pdf, {
                startY: y,
                body: [[clean(insight)]],
                theme: 'plain',
                styles: { fontSize: 11, cellPadding: 3 },
                columnStyles: { 0: { cellWidth: contentWidth } },
                margin: { left: margin }
            });
        }

        // ── Final Footer on all pages ──
        const totalP = pdf.getNumberOfPages();
        for (let i = 1; i <= totalP; i++) {
            pdf.setPage(i);
            drawFooter(pdf, pageWidth, pageHeight, margin);
        }

        const fileName = data.type === 'love' ? 
            `Compatibility_${clean(data.loveResult.name1)}_${clean(data.loveResult.name2)}` : 
            `NameMatch_${clean(data.nameResult.name1)}_${clean(data.nameResult.name2)}`;
            
        pdf.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
        toast.success('Your compatibility report is ready!', { id: toastId });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        toast.error('Failed to generate report.', { id: toastId });
    }
};
