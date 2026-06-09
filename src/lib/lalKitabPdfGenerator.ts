/**
 * Lal Kitab PDF Report Generator — VaidikTalk
 * 
 * Generates a high-fidelity, comprehensive Lal Kitab analysis report.
 * Features planetary interpretations, remedies, and general rules.
 */

import toast from 'react-hot-toast';

// ── Brand Colors ──
const GOLD: [number, number, number] = [184, 150, 46];
const DARK: [number, number, number] = [28, 21, 9];
const GRAY: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const CREAM: [number, number, number] = [253, 246, 227];
const LIGHT_GOLD: [number, number, number] = [249, 245, 235];

interface LalKitabData {
    planets: Record<string, any>;
    lifeAreaRemedies?: { category: string; text: string; }[];
    generalRules: string[];
    input: {
        name: string;
        date: string;
        time: string;
        place: string;
        lat?: any;
        lon?: any;
    };
}

export const downloadLalKitabPDF = async (data: LalKitabData) => {
    if (typeof window === 'undefined') return;

    const toastId = toast.loading('Synthesizing Lal Kitab Wisdom...', {
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

        // ─── Utility: Clean Text ───
        const clean = (txt: any): string => {
            if (txt === undefined || txt === null) return '-';
            if (typeof txt !== 'string') {
                const val = txt.text || txt.title || txt.description || String(txt);
                return typeof val === 'string' ? clean(val) : String(val);
            }
            return txt
                .replace(/^\(\d+\)\s*/, '')
                .replace(/\s+/g, ' ') // Replace ANY whitespace (tabs, newlines) with single space
                .replace(/\u00A0/g, ' ')
                .trim();
        };

        // ─── Utility: Draw Page Header ───
        const drawHeader = (doc: any) => {
            doc.setFillColor(...GOLD);
            doc.rect(0, 0, pageW, 2, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(...DARK);
            doc.text('VaidikTalk', margin, 12);
            
            doc.setFontSize(8);
            doc.setTextColor(...GOLD);
            doc.text('ANCIENT LAL KITAB ANALYSIS & REMEDIES', margin, 16);
            
            doc.setDrawColor(...LIGHT_GOLD);
            doc.setLineWidth(0.2);
            doc.line(margin, 18, pageW - margin, 18);
        };

        // ─── Utility: Draw Footer ───
        const drawFooter = (doc: any, pageNum: number) => {
            doc.setFontSize(8);
            doc.setTextColor(...GRAY);
            doc.text(`Page ${pageNum}`, pageW - margin - 15, pageH - 10);
            doc.text('© VaidikTalk Premium Astrology Reports', margin, pageH - 10);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.text('Disclaimer: Lal Kitab remedies are based on traditional Vedic texts and should be performed with faith.', margin, pageH - 14);
        };

        // ─── Utility: Check Page ───
        const checkPage = (needed: number) => {
            if (y + needed > pageH - 25) {
                drawFooter(pdf, pdf.getNumberOfPages());
                pdf.addPage();
                y = 25;
                drawHeader(pdf);
            }
        };

        // ═══════════════════════════════════════════════════════════
        // PAGE 1: Intro + General Rules
        // ═══════════════════════════════════════════════════════════
        drawHeader(pdf);
        y = 28;

        // Birth Details Card
        pdf.setFillColor(...LIGHT_GOLD);
        pdf.roundedRect(margin, y, contentW, 25, 3, 3, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...DARK);
        pdf.text('REPORT FOR:', margin + 5, y + 8);
        pdf.setFontSize(14);
        pdf.text(clean(data.input.name), margin + 5, y + 16);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...GRAY);
        const details = `${data.input.date}  |  ${data.input.time}  |  ${data.input.place}`;
        pdf.text(details, margin + 5, y + 21);
        
        if (data.input.lat && data.input.lon) {
            const coords = `Lat: ${data.input.lat}  |  Lon: ${data.input.lon}`;
            pdf.text(coords, margin + 5, y + 25);
            y += 39;
        } else {
            y += 35;
        }

        // General Rules Section
        checkPage(50);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(...DARK);
        pdf.text('The Red Book\'s Personalized Chart Rules', margin, y);
        y += 2;
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, margin + 20, y);
        y += 8;

        (data.generalRules || []).forEach((rule, i) => {
            const text = `${i + 1}. ${clean(rule)}`;
            const lines = pdf.splitTextToSize(text, contentW - 5);
            checkPage(lines.length * 5 + 5);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(...DARK);
            pdf.text(lines, margin + 2, y);
            y += lines.length * 5 + 2;
        });

        // ═══════════════════════════════════════════════════════════
        // PLANETARY ANALYSIS
        // ═══════════════════════════════════════════════════════════
        y += 10;
        const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        
        for (const planet of planetOrder) {
            const pData = data.planets[planet];
            if (!pData) continue;

            checkPage(60);
            
            // Planet Header
            pdf.setFillColor(...GOLD);
            pdf.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
            pdf.setTextColor(...WHITE);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text(`${planet.toUpperCase()} — Lal Kitab Interpretation (House ${pData.house})`, margin + 5, y + 6.5);
            y += 18;

            // Analysis (Using autoTable to prevent text stretching)
            autoTable(pdf, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'plain',
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 0, textColor: DARK, halign: 'left' },
                body: [[clean(pData.analysis)]],
            });
            y = (pdf as any).lastAutoTable.finalY + 8;

            // Benefic vs Malefic Table
            checkPage(50);
            autoTable(pdf, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, lineColor: [214, 200, 154], lineWidth: 0.2 },
                headStyles: { fillColor: [249, 245, 235], textColor: DARK, fontStyle: 'bold', halign: 'center' },
                head: [['Symptoms if Benefic', 'Symptoms if Malefic']],
                body: [[
                    (pData.beneficEffects || []).map((e: any) => `• ${clean(e)}`).join('\n\n'),
                    (pData.maleficEffects || []).map((e: any) => `• ${clean(e)}`).join('\n\n')
                ]],
                columnStyles: {
                    0: { halign: 'left', cellWidth: contentW / 2 },
                    1: { halign: 'left', cellWidth: contentW / 2 }
                }
            });
            y = (pdf as any).lastAutoTable.finalY + 10;

            // Remedies
            checkPage(40);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
            pdf.text(`Remedial Measures for ${planet}`, margin, y);
            y += 6;
            
            (pData.remedies || []).forEach((rem: any, idx: number) => {
                const text = `> ${clean(rem)}`;
                const lines = pdf.splitTextToSize(text, contentW - 5);
                checkPage(lines.length * 5 + 3);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9);
                pdf.text(lines, margin + 2, y);
                y += lines.length * 5 + 2;
            });

            // House Guide (Encyclopedic)
            if (pData.houseGuide && pData.houseGuide.length > 0) {
                y += 5;
                checkPage(50);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9);
                pdf.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
                pdf.text(`${planet} Traditional Placement Guide (All 12 Houses)`, margin, y);
                y += 4;

                const guideRows = [];
                for (let i = 0; i < 12; i += 3) {
                    guideRows.push([
                        `H${i+1}: ${clean(pData.houseGuide[i] || '-')}`,
                        `H${i+2}: ${clean(pData.houseGuide[i+1] || '-')}`,
                        `H${i+3}: ${clean(pData.houseGuide[i+2] || '-')}`
                    ]);
                }

                autoTable(pdf, {
                    startY: y,
                    margin: { left: margin, right: margin },
                    theme: 'grid',
                    styles: { font: 'helvetica', fontSize: 7, cellPadding: 2, lineColor: [230, 220, 180] },
                    body: guideRows,
                    columnStyles: {
                        0: { cellWidth: contentW / 3 },
                        1: { cellWidth: contentW / 3 },
                        2: { cellWidth: contentW / 3 }
                    },
                    didParseCell: (data) => {
                        // Highlight current house
                        const cellHouse = data.row.index * 3 + data.column.index + 1;
                        if (String(cellHouse) === String(pData.house)) {
                            data.cell.styles.fillColor = [249, 245, 235];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                });
                y = (pdf as any).lastAutoTable.finalY + 10;
            }
            
            y += 5;
        }

        // ═══════════════════════════════════════════════════════════
        // LIFE AREA REMEDIES
        // ═══════════════════════════════════════════════════════════
        if (data.lifeAreaRemedies && data.lifeAreaRemedies.length > 0) {
            checkPage(60);
            y += 5;
            pdf.setFillColor(...LIGHT_GOLD);
            pdf.rect(margin, y, contentW, 8, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(...DARK);
            pdf.text('SPECIAL LIFE AREA REMEDIES', margin + 5, y + 5.5);
            y += 15;

            const areaRows = data.lifeAreaRemedies.map(a => [a.category, clean(a.text)]);
            autoTable(pdf, {
                startY: y,
                margin: { left: margin, right: margin },
                theme: 'striped',
                styles: { font: 'helvetica', fontSize: 9, cellPadding: 5 },
                headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold' },
                head: [['Life Area', 'Recommendation']],
                body: areaRows,
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 40 },
                    1: { cellWidth: contentW - 40 }
                }
            });
        }

        // Final Footer on last page
        drawFooter(pdf, pdf.getNumberOfPages());

        // ── Save ──
        pdf.save(`Lal_Kitab_Report_${data.input.name.replace(/\s+/g, '_')}.pdf`);

        toast.success('Wisdom synthesized. Report ready!', { id: toastId, duration: 4000 });

    } catch (error) {
        console.error('PDF Error:', error);
        toast.error('Synthesis failed. Please try again.', { id: toastId });
    }
};
