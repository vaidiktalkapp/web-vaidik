/**
 * Kundli PDF Report Generator — VaidikTalk
 * 
 * Generates a professional, structured PDF report like AstroSage.
 * Uses jsPDF + jspdf-autotable for real text tables — NOT screenshots.
 * 
 * Sections:
 *  1. Birth Details (Name, DOB, Time, Place, Ayanamsha)
 *  2. Core Astrological Identity (Ascendant, Moon Sign, Sun Sign, Nakshatra)
 *  3. Birth Panchang Details (Tithi, Nakshatra, Yoga, Karana, etc.)
 *  4. Planetary Positions & Dignities Table
 *  5. Vimshottari Dasha Timeline
 *  6. Dosha Analysis (Manglik + Kalsarp)
 *  7. Cosmic Insights
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

interface KundliData {
  kundli: any;
  dasha: any;
  panchang: any;
  input: any;
  doshas: any;
  interpretations: any;
}

export const downloadKundliPDF = async (data: KundliData) => {
  if (typeof window === 'undefined') return;

  const toastId = toast.loading('Generating Kundli Report...', {
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
    const pageW = pdf.internal.pageSize.getWidth(); // 210
    const pageH = pdf.internal.pageSize.getHeight(); // 297
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 0; // current Y position

    const { kundli, dasha, panchang, input, doshas, interpretations } = data;

    // ─── Utility: Clean Text ───
    const clean = (txt: any) => {
      if (!txt) return 'N/A';
      return String(txt)
        .replace(/[\n\r\t]+/g, ' ') // Replace newlines/tabs with space
        .replace(/\u00A0/g, ' ')    // Replace non-breaking spaces
        .replace(/\s{2,}/g, ' ')   // Collapse multiple spaces
        .trim();
    };

    // ─── Utility: Check if we need a new page ───
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
    // PAGE 1 — Title + Birth Details + Core Identity + Panchang
    // ═══════════════════════════════════════════════════════════

    // ── Gold accent bar ──
    pdf.setFillColor(...GOLD);
    pdf.rect(0, 0, pageW, 3, 'F');

    // ── Brand Header ──
    y = 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(...DARK);
    pdf.text('VaidikTalk', margin, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...GOLD);
    pdf.text('Vedic Astrology & Spiritual Guidance', margin, y + 5);

    // Report title — right
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...DARK);
    pdf.text('Kundli Report', pageW - margin, y, { align: 'right' });

    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.text(`Generated: ${dateStr}`, pageW - margin, y + 5, { align: 'right' });

    // Separator
    y = 20;
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageW - margin, y);

    // ── Section: Birth Details ──
    y = 26;
    drawSectionTitle(pdf, margin, y, 'BIRTH DETAILS');
    y += 7;

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.5, lineColor: [214, 200, 154], lineWidth: 0.3 },
      headStyles: { fillColor: LIGHT_GOLD, textColor: DARK, fontStyle: 'bold', fontSize: 8 },
      body: [
        ['Name', input.name || 'N/A', 'Date of Birth', input.date || 'N/A'],
        ['Time of Birth', input.time || 'N/A', 'Place of Birth', input.place || 'N/A'],
        ['Ayanamsha', 'Lahiri', 'House System', 'Porphyry'],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [249, 245, 235], cellWidth: 35 },
        1: { cellWidth: 55 },
        2: { fontStyle: 'bold', fillColor: [249, 245, 235], cellWidth: 35 },
        3: { cellWidth: 55 },
      },
    });
    y = (pdf as any).lastAutoTable.finalY + 8;

    // ── Section: Lagna Chart & Navamsa Chart — North Indian Style ──
    drawSectionTitle(pdf, margin, y, 'NORTH INDIAN CHARTS');
    y += 5;

    const chartSize = 82;
    const gap = 6;
    const startX1 = margin;
    const startX2 = margin + chartSize + gap;

    // North D1 on left
    drawNorthIndianChart(pdf, startX1, y, chartSize, kundli, 'D1');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(...DARK);
    pdf.text('Lagna Chart (D1)', startX1 + chartSize / 2, y + chartSize + 4, { align: 'center' });

    // North D9 on right
    drawNorthIndianChart(pdf, startX2, y, chartSize, kundli, 'D9');
    pdf.text('Navamsa Chart (D9)', startX2 + chartSize / 2, y + chartSize + 4, { align: 'center' });

    y += chartSize + 12;

    // ── South Indian Charts ──
    checkPage(100);
    drawSectionTitle(pdf, margin, y, 'SOUTH INDIAN CHARTS');
    y += 5;

    // South D1 on left
    drawSouthIndianChart(pdf, startX1, y, chartSize, kundli, 'D1');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(...DARK);
    pdf.text('Lagna Chart (D1)', startX1 + chartSize / 2, y + chartSize + 4, { align: 'center' });

    // South D9 on right
    drawSouthIndianChart(pdf, startX2, y, chartSize, kundli, 'D9');
    pdf.text('Navamsa Chart (D9)', startX2 + chartSize / 2, y + chartSize + 4, { align: 'center' });

    y += chartSize + 10;

    // ── Section: Core Astrological Identity ──
    checkPage(60); // Robust buffer for heading + table
    drawSectionTitle(pdf, margin, y, 'CORE ASTROLOGICAL IDENTITY');
    y += 7;

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, lineColor: [214, 200, 154], lineWidth: 0.3, halign: 'center' },
      headStyles: { fillColor: LIGHT_GOLD, textColor: DARK, fontStyle: 'bold', fontSize: 8 },
      head: [['Ascendant', 'Moon Sign', 'Sun Sign', 'Nakshatra']],
      body: [[
        clean(kundli.ascendant),
        clean(panchang.moon_sign),
        clean(panchang.sun_sign),
        clean(panchang.nakshatra),
      ]],
      bodyStyles: { fontStyle: 'bold', fontSize: 11 },
    });
    y = (pdf as any).lastAutoTable.finalY + 8;

    // ── Section: Birth Panchang Details ──
    checkPage(60); // Robust buffer
    drawSectionTitle(pdf, margin, y, 'BIRTH PANCHANG DETAILS');
    y += 7;

    const panchangRows: string[][] = [];
    if (panchang.tithi) panchangRows.push(['Tithi', clean(panchang.tithi)]);
    if (panchang.nakshatra) panchangRows.push(['Nakshatra', clean(panchang.nakshatra)]);
    if (panchang.yoga) panchangRows.push(['Yoga', clean(panchang.yoga)]);
    if (panchang.karana) panchangRows.push(['Karana', clean(panchang.karana)]);
    if (panchang.sun_sign) panchangRows.push(['Sun Sign', clean(panchang.sun_sign)]);
    if (panchang.moon_sign) panchangRows.push(['Moon Sign', clean(panchang.moon_sign)]);

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 3.5, lineColor: [214, 200, 154], lineWidth: 0.3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: LIGHT_GOLD, cellWidth: 45 },
      },
      body: panchangRows,
    });
    y = (pdf as any).lastAutoTable.finalY + 8;

    // ═══════════════════════════════════════════════════════════
    // Planetary Positions & Dignities
    // ═══════════════════════════════════════════════════════════
    checkPage(60);
    drawSectionTitle(pdf, margin, y, 'PLANETARY POSITIONS & DIGNITIES');
    y += 7;

    const planetRows: string[][] = [];
    if (kundli.planets) {
      Object.entries(kundli.planets).forEach(([name, p]: any) => {
        const retro = p.is_retrograde ? ' [R]' : '';
        planetRows.push([
          name + retro,
          p.sign || '',
          p.navamsa_sign || '',
          p.longitude_dms || (p.degree ? (p.degree % 30).toFixed(2) + '°' : ''),
          `H${p.house || ''}`,
          p.nakshatra || '',
          p.relation || 'Neutral',
        ]);
      });
    }

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, lineColor: [214, 200, 154], lineWidth: 0.3 },
      headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
      head: [['Planet', 'D1 Sign', 'D9 Navamsa', 'Longitude', 'House', 'Nakshatra', 'Relation']],
      body: planetRows,
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { halign: 'center', font: 'courier' },
        4: { halign: 'center', fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: [255, 253, 245] },
    });
    y = (pdf as any).lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════════════════════════
    // Vimshottari Dasha Timeline
    // ═══════════════════════════════════════════════════════════
    checkPage(40);
    drawSectionTitle(pdf, margin, y, 'VIMSHOTTARI DASHA TIMELINE');
    y += 7;

    if (dasha?.timeline && dasha.timeline.length > 0) {
      const dashaRows: any[][] = [];
      dasha.timeline.forEach((item: any, idx: number) => {
        // Mahadasha header row
        dashaRows.push([
          { content: `Mahadasha ${idx + 1}: ${item.lord}`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: item.is_current ? [184, 150, 46] : [249, 245, 235], textColor: item.is_current ? [255, 255, 255] : DARK, fontSize: 9 } },
          { content: `${item.start} — ${item.end}`, styles: { fontStyle: 'bold', fillColor: item.is_current ? [184, 150, 46] : [249, 245, 235], textColor: item.is_current ? [255, 255, 255] : DARK, halign: 'right', fontSize: 9 } },
        ]);

        // Antardasha sub-rows
        if (item.antardashas && item.antardashas.length > 0) {
          // Show antardashas in pairs
          for (let i = 0; i < item.antardashas.length; i += 2) {
            const a1 = item.antardashas[i];
            const a2 = item.antardashas[i + 1];
            const row: string[] = [
              `   ${a1.lord}`,
              a1.end || '',
              a2 ? `   ${a2.lord}` : '',
              a2 ? (a2.end || '') : '',
            ];
            dashaRows.push(row);
          }
        }
      });

      autoTable(pdf, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, lineColor: [214, 200, 154], lineWidth: 0.2 },
        headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        head: [['Dasha Lord', 'End Date', 'Dasha Lord', 'End Date']],
        body: dashaRows,
      });
      y = (pdf as any).lastAutoTable.finalY + 10;
    }

    // ═══════════════════════════════════════════════════════════
    // Dosha Analysis
    // ═══════════════════════════════════════════════════════════
    checkPage(45);
    drawSectionTitle(pdf, margin, y, 'DOSHA ANALYSIS');
    y += 7;

    // Manglik
    const manglikStatus = doshas?.manglik?.is_present ? 'PRESENT' : 'NOT PRESENT';
    const manglikColor: [number, number, number] = doshas?.manglik?.is_present ? RED : GREEN;

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, lineColor: [214, 200, 154], lineWidth: 0.3, overflow: 'linebreak', halign: 'left' },
      columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold', fillColor: LIGHT_GOLD }, 1: { cellWidth: contentW - 38, halign: 'left' } },
      body: [
        ['Manglik Dosha', { content: manglikStatus, styles: { fontStyle: 'bold', textColor: manglikColor } }],
        ['Analysis', clean(doshas?.manglik?.details)],
      ],
    });
    y = (pdf as any).lastAutoTable.finalY + 5;

    // Kalsarp
    const kalsarpStatus = doshas?.kalsarp?.is_present ? 'PRESENT' : 'NOT PRESENT';
    const kalsarpColor: [number, number, number] = doshas?.kalsarp?.is_present ? RED : GREEN;

    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, lineColor: [214, 200, 154], lineWidth: 0.3, overflow: 'linebreak', halign: 'left' },
      columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold', fillColor: LIGHT_GOLD }, 1: { cellWidth: contentW - 38, halign: 'left' } },
      body: [
        ['Kaal Sarp Dosha', { content: kalsarpStatus, styles: { fontStyle: 'bold', textColor: kalsarpColor } }],
        ['Analysis', clean(doshas?.kalsarp?.details)],
      ],
    });
    y = (pdf as any).lastAutoTable.finalY + 10;

    // ═══════════════════════════════════════════════════════════
    // Cosmic Insights
    // ═══════════════════════════════════════════════════════════
    if (interpretations) {
      checkPage(50);
      drawSectionTitle(pdf, margin, y, 'COSMIC INSIGHTS');
      y += 7;

      const insightRows: any[][] = [];
      if (interpretations.ascendant?.reading) {
        insightRows.push([
          { content: 'Core Identity & Ascendant', styles: { fontStyle: 'bold', fillColor: LIGHT_GOLD, cellWidth: 45 } },
          interpretations.ascendant.reading,
        ]);
      }
      if (interpretations.moon?.reading) {
        insightRows.push([
          { content: 'Emotional Nature', styles: { fontStyle: 'bold', fillColor: LIGHT_GOLD, cellWidth: 45 } },
          interpretations.moon.reading,
        ]);
      }
      if (interpretations.life_path?.reading) {
        insightRows.push([
          { content: 'Life Path & Purpose', styles: { fontStyle: 'bold', fillColor: LIGHT_GOLD, cellWidth: 45 } },
          interpretations.life_path.reading,
        ]);
      }

      if (insightRows.length > 0) {
        autoTable(pdf, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { 
            font: 'helvetica', 
            fontSize: 9, 
            cellPadding: 4, 
            lineColor: [214, 200, 154], 
            lineWidth: 0.3, 
            minCellHeight: 12, 
            overflow: 'linebreak',
            halign: 'left',
            valign: 'top'
          },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold', fillColor: LIGHT_GOLD, halign: 'left' },
            1: { cellWidth: contentW - 40, halign: 'left' },
          },
          body: insightRows.map(row => [row[0], clean(row[1])]),
        });
        y = (pdf as any).lastAutoTable.finalY + 10;
      }
    }

    // ── Draw footer on all pages ──
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      drawFooter(pdf, pageW, pageH, i, totalPages);
    }

    // ── Save ──
    pdf.save(`Kundli_Report_${input.name?.replace(/\s+/g, '_') || 'Report'}.pdf`);

    toast.success('Kundli Report downloaded!', {
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
    console.error('Kundli PDF Error:', error);
    toast.error('Failed to generate PDF.', {
      id: toastId, duration: 4000,
      style: {
        background: '#1c1509', color: '#fdf6e3',
        fontFamily: "'Inter', sans-serif", fontWeight: 600,
        fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
      },
    });
  }
};


// ─── Helper: Section Title ───
function drawSectionTitle(pdf: any, x: number, y: number, title: string) {
  // Gold left accent
  pdf.setFillColor(...GOLD);
  pdf.rect(x, y - 3, 2, 5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text(title, x + 5, y);
}

// ─── Helper: Page Header (for pages 2+) ───
function drawPageHeader(pdf: any, pageW: number, margin: number) {
  pdf.setFillColor(...GOLD);
  pdf.rect(0, 0, pageW, 2, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...DARK);
  pdf.text('VaidikTalk', margin, 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...GOLD);
  pdf.text('Kundli Report', pageW - margin, 8, { align: 'right' });

  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.3);
  pdf.line(margin, 11, pageW - margin, 11);
}

// ─── Helper: Footer ───
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
  pdf.text('This report is auto-generated for personal reference.', pageW / 2, y, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(...DARK);
  const pageLabel = total ? `Page ${current} of ${total}` : `Page ${current}`;
  pdf.text(pageLabel, pageW - 15, y, { align: 'right' });
}

// ─── Helper: Draw North Indian Chart ───
function drawNorthIndianChart(pdf: any, ox: number, oy: number, size: number, kundli: any, chartType: 'D1' | 'D9') {
  const { planets, houses } = kundli;
  const s = size;
  const mid = s / 2;

  const zodiacMap: Record<string, number> = {
    Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
    Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
  };

  // D9 ascendant
  const d9AscSign = planets?.Ascendant?.navamsa_sign || 'Aries';
  const d9AscIdx = zodiacMap[d9AscSign] || 1;

  const getHouseSign = (h: number) => {
    if (chartType === 'D1') return houses?.[h]?.sign || 'Aries';
    const signIdx = ((d9AscIdx + h - 2) % 12) + 1;
    return Object.entries(zodiacMap).find(([_, idx]) => idx === signIdx)?.[0] || 'Aries';
  };

  const getPlanetsInHouse = (h: number) => {
    const houseSign = getHouseSign(h);
    return Object.entries(planets || {})
      .filter(([name, p]: any) => {
        if (name === 'Ascendant') return false;
        const pSign = chartType === 'D1' ? p.sign : p.navamsa_sign;
        return pSign === houseSign;
      })
      .map(([name, p]: any) => {
        const abbr = name.substring(0, 2);
        const retro = p.is_retrograde ? '*' : '';
        return `${abbr}${retro}`;
      });
  };

  // Draw outer box
  pdf.setDrawColor(184, 150, 46);
  pdf.setLineWidth(0.5);
  pdf.rect(ox, oy, s, s);

  // Draw diagonals (corner to corner)
  pdf.setLineWidth(0.3);
  pdf.line(ox, oy, ox + s, oy + s);
  pdf.line(ox + s, oy, ox, oy + s);

  // Draw diamond (midpoints)
  pdf.line(ox + mid, oy, ox, oy + mid);
  pdf.line(ox, oy + mid, ox + mid, oy + s);
  pdf.line(ox + mid, oy + s, ox + s, oy + mid);
  pdf.line(ox + s, oy + mid, ox + mid, oy);

  // House center positions (relative to chart origin, as fractions of size)
  const housePositions: Record<number, { cx: number; cy: number; sx: number; sy: number }> = {
    1:  { cx: 0.50, cy: 0.26, sx: 0.50, sy: 0.07 },
    2:  { cx: 0.25, cy: 0.15, sx: 0.22, sy: 0.06 },
    3:  { cx: 0.12, cy: 0.25, sx: 0.07, sy: 0.22 },
    4:  { cx: 0.26, cy: 0.50, sx: 0.07, sy: 0.50 },
    5:  { cx: 0.12, cy: 0.75, sx: 0.07, sy: 0.78 },
    6:  { cx: 0.25, cy: 0.85, sx: 0.22, sy: 0.94 },
    7:  { cx: 0.50, cy: 0.74, sx: 0.50, sy: 0.93 },
    8:  { cx: 0.75, cy: 0.85, sx: 0.78, sy: 0.94 },
    9:  { cx: 0.88, cy: 0.75, sx: 0.93, sy: 0.78 },
    10: { cx: 0.74, cy: 0.50, sx: 0.93, sy: 0.50 },
    11: { cx: 0.88, cy: 0.25, sx: 0.93, sy: 0.22 },
    12: { cx: 0.75, cy: 0.15, sx: 0.78, sy: 0.06 },
  };

  for (let h = 1; h <= 12; h++) {
    const pos = housePositions[h];
    const sign = getHouseSign(h);
    const signNum = zodiacMap[sign] || h;
    const planetList = getPlanetsInHouse(h);

    // Sign number (small, gold)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(184, 150, 46);
    pdf.text(String(signNum), ox + pos.sx * s, oy + pos.sy * s, { align: 'center' });

    // Planet abbreviations (bold, dark)
    if (planetList.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(28, 21, 9);
      const label = planetList.join(' ');
      pdf.text(label, ox + pos.cx * s, oy + pos.cy * s, { align: 'center', maxWidth: s * 0.2 });
    }
  }
}

// ─── Helper: Draw South Indian Chart ───
function drawSouthIndianChart(pdf: any, ox: number, oy: number, size: number, kundli: any, chartType: 'D1' | 'D9') {
  const { planets, houses } = kundli;
  const s = size;
  const cell = s / 4; // each cell in the 4x4 grid

  // Fixed sign positions in South Indian chart (the sign order is always fixed)
  // Grid: 4 columns x 4 rows, center 2x2 is empty
  const boxes: { name: string; col: number; row: number }[] = [
    { name: 'Pisces', col: 0, row: 0 },
    { name: 'Aries', col: 1, row: 0 },
    { name: 'Taurus', col: 2, row: 0 },
    { name: 'Gemini', col: 3, row: 0 },
    { name: 'Aquarius', col: 0, row: 1 },
    { name: 'Cancer', col: 3, row: 1 },
    { name: 'Capricorn', col: 0, row: 2 },
    { name: 'Leo', col: 3, row: 2 },
    { name: 'Sagittarius', col: 0, row: 3 },
    { name: 'Scorpio', col: 1, row: 3 },
    { name: 'Libra', col: 2, row: 3 },
    { name: 'Virgo', col: 3, row: 3 },
  ];

  const getPlanetsInSign = (sign: string) => {
    const result: string[] = [];
    // Check if Ascendant (Lagnam) is in this sign
    const lagnamSign = chartType === 'D1'
      ? houses?.[1]?.sign
      : planets?.Ascendant?.navamsa_sign;
    if (lagnamSign === sign) result.push('As');

    Object.entries(planets || {}).forEach(([name, p]: any) => {
      if (name === 'Ascendant') return;
      const pSign = chartType === 'D1' ? p.sign : p.navamsa_sign;
      if (pSign === sign) {
        const abbr = name.substring(0, 2);
        const retro = p.is_retrograde ? '*' : '';
        result.push(`${abbr}${retro}`);
      }
    });
    return result;
  };

  // Draw outer box
  pdf.setDrawColor(184, 150, 46);
  pdf.setLineWidth(0.5);
  pdf.rect(ox, oy, s, s);

  // Draw grid lines
  pdf.setLineWidth(0.3);
  // Vertical
  for (let i = 1; i < 4; i++) {
    pdf.line(ox + cell * i, oy, ox + cell * i, oy + s);
  }
  // Horizontal
  for (let i = 1; i < 4; i++) {
    pdf.line(ox, oy + cell * i, ox + s, oy + cell * i);
  }

  // Fill center 2x2 with white (empty area)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(ox + cell, oy + cell, cell * 2, cell * 2, 'F');
  // Border the center
  pdf.setDrawColor(184, 150, 46);
  pdf.setLineWidth(0.3);
  pdf.rect(ox + cell, oy + cell, cell * 2, cell * 2);

  // VaidikTalk watermark in center
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5);
  pdf.setTextColor(184, 150, 46, 80);
  pdf.text('VaidikTalk', ox + s / 2, oy + s / 2, { align: 'center' });

  // Draw sign labels and planets
  for (const box of boxes) {
    const bx = ox + box.col * cell;
    const by = oy + box.row * cell;
    const planetList = getPlanetsInSign(box.name);

    // Sign abbreviation (top-left of cell)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5);
    pdf.setTextColor(184, 150, 46);
    pdf.text(box.name.substring(0, 3), bx + 2, by + 4);

    // Planets (centered in cell)
    if (planetList.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.5);
      pdf.setTextColor(28, 21, 9);

      // Stack planets vertically if many, else show inline
      if (planetList.length <= 3) {
        pdf.text(planetList.join(' '), bx + cell / 2, by + cell / 2 + 1, { align: 'center' });
      } else {
        const line1 = planetList.slice(0, 3).join(' ');
        const line2 = planetList.slice(3).join(' ');
        pdf.text(line1, bx + cell / 2, by + cell / 2 - 1, { align: 'center' });
        pdf.text(line2, bx + cell / 2, by + cell / 2 + 3, { align: 'center' });
      }
    }
  }
}
