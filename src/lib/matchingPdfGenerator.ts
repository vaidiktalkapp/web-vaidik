/**
 * Horoscope Matching PDF Report Generator — VaidikTalk
 * 
 * Generates a professional, structured compatibility report (Ashtakoot/Dashakoot).
 * Uses jsPDF + jspdf-autotable.
 */

import toast from 'react-hot-toast';

// ── Brand Colors ──
const GOLD: [number, number, number] = [184, 150, 46];
const DARK: [number, number, number] = [28, 21, 9];
const GRAY: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const CREAM: [number, number, number] = [253, 246, 227];
const LIGHT_GOLD: [number, number, number] = [249, 245, 235];
const GREEN: [number, number, number] = [22, 163, 74];
const RED: [number, number, number] = [220, 38, 38];

interface MatchingData {
  result: any;
  inputData: any;
}

export const downloadMatchingPDF = async (data: MatchingData) => {
  if (typeof window === 'undefined') return;

  const toastId = toast.loading('Generating Compatibility Report...', {
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

    const { result, inputData } = data;
    const { boy = {}, girl = {}, system } = inputData || {};
    const { 
      scores = {}, 
      details = {}, 
      total = 0, 
      max_scores = {}, 
      manglik_status = {}, 
      conclusion = "" 
    } = result || {};
    const isSouth = system === 'south_indian';

    // ─── Utility: Clean Text ───
    const clean = (txt: any) => {
      if (!txt === undefined || txt === null) return '-';
      return String(txt)
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    // ─── Utility: Check Page ───
    const checkPage = (needed: number) => {
      if (y + needed > pageH - 25) {
        drawFooter(pdf, pageW, pageH, pdf.getNumberOfPages());
        pdf.addPage();
        y = 12;
        drawPageHeader(pdf, pageW, margin);
        y = 22;
      }
    };

    // ═══════════════════════════════════════════════════════════
    // PAGE 1 — Header + Birth Details Comparison
    // ═══════════════════════════════════════════════════════════
    pdf.setFillColor(...GOLD);
    pdf.rect(0, 0, pageW, 3, 'F');

    y = 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(...DARK);
    pdf.text('VaidikTalk', margin, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...GOLD);
    pdf.text('Vedic Compatibility & Relationship Analysis', margin, y + 5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...DARK);
    pdf.text('Horoscope Matching Report', pageW - margin, y, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.text(`System: ${isSouth ? 'South Indian' : 'North Indian'}`, pageW - margin, y + 5, { align: 'right' });

    y = 20;
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageW - margin, y);

    // ── Section: Couples Birth Details ──
    y = 28;
    drawSectionTitle(pdf, margin, y, 'BIRTH PARTICULARS');
    y += 7;

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.5, lineColor: [214, 200, 154], lineWidth: 0.3 },
      headStyles: { fillColor: LIGHT_GOLD, textColor: DARK, fontStyle: 'bold', fontSize: 8, halign: 'center' },
      head: [['Attribute', `Boy: ${clean(boy?.name)}`, `Girl: ${clean(girl?.name)}`]],
      body: [
        ['Date of Birth', clean(boy?.date), clean(girl?.date)],
        ['Time of Birth', clean(boy?.time), clean(girl?.time)],
        ['Place of Birth', clean(boy?.place), clean(girl?.place)],
        ['Raasi (Moon Sign)', clean(details?.bhakoot?.boy || '-'), clean(details?.bhakoot?.girl || '-')],
        ['Raasi Lord', clean(details?.maitri?.boy || '-'), clean(details?.maitri?.girl || '-')],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [249, 245, 235], cellWidth: 40 },
        1: { halign: 'center', cellWidth: (contentW - 40) / 2 },
        2: { halign: 'center', cellWidth: (contentW - 40) / 2 },
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 10;

    // ── Section: Compatibility Score (Highlights) ──
    checkPage(40);
    const scoreColor = total >= 18 ? GREEN : RED;
    
    pdf.setFillColor(...LIGHT_GOLD);
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, y, contentW, 25, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    pdf.text('TOTAL COMPATIBILITY SCORE (GUNA MILAN)', margin + 5, y + 10);

    pdf.setFontSize(22);
    pdf.setTextColor(...scoreColor);
    pdf.text(`${total} / 36`, margin + 5, y + 20);

    pdf.setFontSize(9);
    pdf.setTextColor(...DARK);
    pdf.text('VERDICT:', pageW - margin - 50, y + 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...DARK);
    const verdict = total >= 25 ? 'Excellent' : total >= 18 ? 'Good' : 'Average';
    pdf.text(verdict, pageW - margin - 50, y + 17);

    y += 35;

    // ── Section: Guna Milan Breakdown Table ──
    checkPage(80);
    drawSectionTitle(pdf, margin, y, 'ASHTAKOOT / GUNA MILAN ANALYSIS');
    y += 7;

    const kootRows: any[] = [];
    if (isSouth) {
        kootRows.push(['Dina (Tara)', max_scores?.dina || 3, scores?.dina || 0, 'Health & Well-being']);
        kootRows.push(['Gana', max_scores?.gana || 4, scores?.gana || 0, 'Temperament']);
        kootRows.push(['Yoni', max_scores?.yoni || 4, scores?.yoni || 0, 'Intimacy']);
        kootRows.push(['Rasi', max_scores?.rasi || 7, scores?.rasi || 0, 'Lineage Growth']);
        kootRows.push(['Rasyadhipati', max_scores?.maitri || 5, scores?.maitri || 0, 'Friendship']);
        kootRows.push(['Rajju', max_scores?.rajju || 5, scores?.rajju || 0, 'Longevity']);
        kootRows.push(['Vedha', max_scores?.vedha || 2, scores?.vedha || 0, 'Obstacles']);
        kootRows.push(['Vashya', max_scores?.vashya || 2, scores?.vashya || 0, 'Dominance']);
        kootRows.push(['Mahendra', max_scores?.mahendra || 2, scores?.mahendra || 0, 'Wealth & Progeny']);
        kootRows.push(['Stree Deergha', max_scores?.stree || 2, scores?.stree || 0, 'Prosperity']);
    } else {
        kootRows.push(['Varna', max_scores?.varna || 1, scores?.varna || 0, 'Work/Ego']);
        kootRows.push(['Vashya', max_scores?.vashya || 2, scores?.vashya || 0, 'Dominance/Attraction']);
        kootRows.push(['Tara', max_scores?.tara || 3, scores?.tara || 0, 'Destiny/Wealth']);
        kootRows.push(['Yoni', max_scores?.yoni || 4, scores?.yoni || 0, 'Nature/Guns']);
        kootRows.push(['Maitri', max_scores?.maitri || 5, scores?.maitri || 0, 'Friendship']);
        kootRows.push(['Gana', max_scores?.gana || 6, scores?.gana || 0, 'Temperament']);
        kootRows.push(['Bhakoot', max_scores?.bhakoot || 7, scores?.bhakoot || 0, 'Love Compatibility']);
        kootRows.push(['Nadi', max_scores?.nadi || 8, scores?.nadi || 0, 'Health & Progeny']);
    }

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.5, lineColor: [214, 200, 154], lineWidth: 0.3, halign: 'left' },
      headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 8.5 },
      head: [['Koota / Guna', 'Max Points', 'Obtained', 'Area of Influence']],
      body: kootRows,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
        3: { cellWidth: contentW - 90 },
      },
      alternateRowStyles: { fillColor: [255, 253, 245] },
    });
    y = (pdf as any).lastAutoTable.finalY + 12;

    // ── Section: Manglik Compatibility ──
    checkPage(50);
    drawSectionTitle(pdf, margin, y, 'MANGLIK DOSHA COMPATIBILITY');
    y += 7;

    const boyManglik = manglik_status?.boy?.is_present ? 'Manglik' : 'Non-Manglik';
    const girlManglik = manglik_status?.girl?.is_present ? 'Manglik' : 'Non-Manglik';
    const compatText = manglik_status?.details || 'Manglik compatibility analysis completed.';

    autoTable(pdf, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, lineColor: [214, 200, 154], lineWidth: 0.3, overflow: 'linebreak' },
        body: [
            [
                { content: 'Boy\'s Status', styles: { fontStyle: 'bold', fillColor: LIGHT_GOLD, cellWidth: 35 } },
                { content: boyManglik, styles: { textColor: manglik_status?.boy?.is_present ? RED : GREEN, fontStyle: 'bold' } },
                { content: 'Girl\'s Status', styles: { fontStyle: 'bold', fillColor: LIGHT_GOLD, cellWidth: 35 } },
                { content: girlManglik, styles: { textColor: manglik_status?.girl?.is_present ? RED : GREEN, fontStyle: 'bold' } },
            ],
            [
                { content: 'Conclusion', styles: { fontStyle: 'bold', fillColor: LIGHT_GOLD } },
                { content: clean(compatText), colSpan: 3, styles: { halign: 'left' } }
            ]
        ]
    });
    y = (pdf as any).lastAutoTable.finalY + 12;

    // ── Section: Final Conclusion ──
    checkPage(40);
    drawSectionTitle(pdf, margin, y, 'ASTROLOGICAL CONCLUSION');
    y += 7;

    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    const splitConclusion = pdf.splitTextToSize(clean(conclusion || "Based on the cumulative analysis of Ashtakoota and Manglik factors, this match is evaluated as favorable for a long-term relationship."), contentW);
    pdf.text(splitConclusion, margin, y);
    
    // ── Footer ──
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        drawFooter(pdf, pageW, pageH, i, totalPages);
    }

    // ── Save ──
    pdf.save(`Horoscope_Matching_${boy?.name || 'Report'}_${girl?.name || ''}.pdf`);

    toast.success('Matching Report downloaded!', {
      id: toastId, duration: 3000,
      style: {
        background: '#1c1509', color: '#fdf6e3',
        fontFamily: "'Inter', sans-serif", fontWeight: 600,
        fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
        border: '1px solid rgba(184,150,46,0.3)',
      },
      iconTheme: { primary: '#22c55e', secondary: '#fdf6e3' },
    });

  } catch (error) {
    console.error('Matching PDF Error:', error);
    toast.error('Failed to generate PDF.', { id: toastId });
  }
};

function drawSectionTitle(pdf: any, x: number, y: number, title: string) {
  pdf.setFillColor(...GOLD);
  pdf.rect(x, y - 3, 2, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text(title, x + 5, y);
}

function drawPageHeader(pdf: any, pageW: number, margin: number) {
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, pageW, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text('VaidikTalk', margin, 8);
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.3);
  pdf.line(margin, 11, pageW - margin, 11);
}

function drawFooter(pdf: any, pageW: number, pageH: number, current: number, total?: number) {
  const y = pageH - 8;
  pdf.setDrawColor(214, 200, 154);
  pdf.setLineWidth(0.3);
  pdf.line(15, y - 3, pageW - 15, y - 3);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...GOLD);
  pdf.text('www.vaidiktalk.com', 15, y);
  pdf.setFontSize(6);
  pdf.setTextColor(...GRAY);
  pdf.text('This report is auto-generated for compatible matching references.', pageW / 2, y, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(...DARK);
  const pageLabel = total ? `Page ${current} of ${total}` : `Page ${current}`;
  pdf.text(pageLabel, pageW - 15, y, { align: 'right' });
}
