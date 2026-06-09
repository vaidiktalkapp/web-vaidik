/**
 * Professional PDF Report Generator for VaidikTalk
 * 
 * Uses a print-window approach instead of html2canvas screenshots.
 * This produces REAL TEXT PDFs with proper tables, selectable text,
 * clean formatting, and professional page breaks — like AstroSage.
 *
 * Flow: Clone content → Open print window → Add branded header/footer
 *       → Apply print-optimized CSS → window.print() → Save as PDF
 */

import toast from 'react-hot-toast';

interface PDFOptions {
  filename: string;
  title?: string;
  subtitle?: string;
}

const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  @page {
    size: A4;
    margin: 18mm 12mm 20mm 12mm;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1a1a1a;
    background: #fff;
    font-size: 11px;
    line-height: 1.5;
    padding: 0;
  }

  /* ── Brand Header ── */
  .pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 10px;
    margin-bottom: 16px;
    border-bottom: 2px solid #b8962e;
  }
  .pdf-header .brand {
    font-size: 16px;
    font-weight: 700;
    color: #1c1509;
    letter-spacing: 0.5px;
  }
  .pdf-header .tagline {
    font-size: 8px;
    color: #b8962e;
    font-weight: 500;
    letter-spacing: 0.3px;
    margin-top: 2px;
  }
  .pdf-header .report-info {
    text-align: right;
  }
  .pdf-header .report-title {
    font-size: 13px;
    font-weight: 700;
    color: #1c1509;
  }
  .pdf-header .report-meta {
    font-size: 8px;
    color: #6b7280;
    margin-top: 2px;
  }

  /* ── Footer ── */
  .pdf-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 12mm;
    border-top: 1px solid #d6c89a;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7px;
    color: #6b7280;
    background: #fff;
  }
  .pdf-footer .website { color: #b8962e; font-weight: 600; }

  /* ── Content cleanup for print ── */
  .pdf-content {
    padding-bottom: 30px;
  }

  /* Hide buttons, navigation, interactive elements */
  button, .no-print, [role="button"] {
    display: none !important;
  }

  /* Force clean backgrounds */
  .pdf-content > * {
    background: #fff !important;
    box-shadow: none !important;
  }

  /* Keep colored badges/labels visible */
  .pdf-content span, .pdf-content small, .pdf-content label {
    print-color-adjust: exact !important;
  }

  /* Clean up rounded cards for print */
  .pdf-content div {
    border-radius: 4px !important;
    box-shadow: none !important;
  }

  /* Tables look clean */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    page-break-inside: avoid;
  }
  th, td {
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    text-align: left;
    font-size: 10px;
  }
  th {
    background: #f9f5eb !important;
    font-weight: 700;
    color: #1c1509;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Section headers */
  h1 { font-size: 18px; color: #1c1509; margin-bottom: 8px; }
  h2 { font-size: 14px; color: #1c1509; margin-bottom: 6px; page-break-after: avoid; }
  h3 { font-size: 12px; color: #1c1509; margin-bottom: 4px; page-break-after: avoid; }

  /* Prevent orphan text */
  p, li { orphans: 3; widows: 3; }

  /* Page break control */
  .page-break-before { page-break-before: always; }
  .page-break-after { page-break-after: always; }
  .no-break { page-break-inside: avoid; }

  /* Grid layouts → clean for print */
  .grid { display: grid !important; }

  /* Images */
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }

  /* SVG charts */
  svg {
    max-width: 100% !important;
    page-break-inside: avoid;
  }

  /* Animation cleanup */
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }

  /* Links → show as plain text */
  a { color: #1c1509; text-decoration: none; }

  /* Sticky/fixed → make static */
  [style*="sticky"], [style*="fixed"] {
    position: static !important;
  }

  /* Backdrop blur → remove */
  [style*="backdrop"] {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
`;

/**
 * Opens a clean print window with the report content and triggers print dialog.
 * The user can then save as PDF from the browser's print dialog.
 * This produces REAL TEXT PDFs, not screenshots.
 */
export const downloadAsPDF = async (elementId: string, options: PDFOptions) => {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return;
  }

  const toastId = toast.loading('Preparing your report...', {
    style: {
      background: '#1c1509', color: '#fdf6e3',
      fontFamily: "'Inter', sans-serif", fontWeight: 600,
      fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
      border: '1px solid rgba(184,150,46,0.3)',
    },
    iconTheme: { primary: '#b8962e', secondary: '#fdf6e3' },
  });

  try {
    // Clone the content
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove buttons and no-print elements from clone
    clone.querySelectorAll('button, .no-print, [role="button"]').forEach(el => el.remove());

    // Remove sticky/fixed positioning
    clone.querySelectorAll('[class*="sticky"], [class*="fixed"]').forEach(el => {
      (el as HTMLElement).style.position = 'static';
    });

    // Build date string
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    // Build the print HTML
    const printHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${options.title || 'VaidikTalk Report'}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <!-- Header -->
  <div class="pdf-header">
    <div>
      <div class="brand">VaidikTalk</div>
      <div class="tagline">Vedic Astrology & Spiritual Guidance</div>
    </div>
    <div class="report-info">
      <div class="report-title">${options.title || 'Report'}</div>
      <div class="report-meta">${options.subtitle ? options.subtitle + '  •  ' : ''}${dateStr}</div>
    </div>
  </div>

  <!-- Report Content -->
  <div class="pdf-content">
    ${clone.innerHTML}
  </div>

  <!-- Footer -->
  <div class="pdf-footer">
    <span class="website">www.vaidiktalk.com</span>
    <span>Auto-generated report for personal reference</span>
  </div>
</body>
</html>`;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error('Please allow pop-ups to download PDF.', {
        id: toastId, duration: 4000,
        style: {
          background: '#1c1509', color: '#fdf6e3',
          fontFamily: "'Inter', sans-serif", fontWeight: 600,
          fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
        },
      });
      return;
    }

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for fonts and images to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        // Close after print dialog
        printWindow.onafterprint = () => printWindow.close();

        toast.success('Report ready! Save as PDF from the print dialog.', {
          id: toastId, duration: 4000,
          style: {
            background: '#1c1509', color: '#fdf6e3',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
            border: '1px solid rgba(184,150,46,0.3)',
          },
          iconTheme: { primary: '#22c55e', secondary: '#fdf6e3' },
        });
      }, 800); // Allow fonts to load
    };
  } catch (error) {
    console.error('PDF Generation Error:', error);
    toast.error('Failed to generate PDF. Please try again.', {
      id: toastId, duration: 4000,
      style: {
        background: '#1c1509', color: '#fdf6e3',
        fontFamily: "'Inter', sans-serif", fontWeight: 600,
        fontSize: '14px', borderRadius: '12px', padding: '14px 20px',
      },
    });
  }
};
