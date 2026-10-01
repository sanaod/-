import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  onProgress?: (progressMessage: string) => void;
}

/**
 * Exports the official lesson plan to high-resolution A4 PDF using jsPDF and html2canvas.
 * Supports distinct page-by-page rendering (via .official-print-page) to avoid cutting tables or lines.
 */
export async function exportLessonPlanToPdf(
  container: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const { fileName = 'خطة_درس_معتمدة.pdf', onProgress } = options;

  onProgress?.('جاري تحضير وتجهيز الصفحات...');

  // Look for distinct page containers first
  const pageElements = Array.from(
    container.querySelectorAll<HTMLElement>('.official-print-page')
  );

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const a4Width = 210;
  const a4Height = 297;
  const marginX = 10;
  const marginY = 10;
  const contentWidth = a4Width - marginX * 2; // 190mm
  const contentHeight = a4Height - marginY * 2; // 277mm

  if (pageElements.length > 0) {
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`جاري معالجة الصفحة ${i + 1} من ${pageElements.length}...`);

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const renderedHeight = (imgProps.height * contentWidth) / imgProps.width;

      if (i > 0) {
        pdf.addPage();
      }

      // If rendered height fits within margin, center vertically if slightly smaller
      let targetHeight = renderedHeight;
      let targetWidth = contentWidth;
      let posX = marginX;
      let posY = marginY;

      if (renderedHeight > contentHeight) {
        // Proportionally scale to fit on single A4 sheet
        const scaleFactor = contentHeight / renderedHeight;
        targetHeight = contentHeight;
        targetWidth = contentWidth * scaleFactor;
        posX = marginX + (contentWidth - targetWidth) / 2;
      }

      pdf.addImage(imgData, 'JPEG', posX, posY, targetWidth, targetHeight, undefined, 'FAST');
    }
  } else {
    // Single container fallback with smart height slicing
    onProgress?.('جاري تصوير الوثيقة بجودة عالية...');
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfContentHeight = (imgProps.height * contentWidth) / imgProps.width;

    let heightLeft = pdfContentHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', marginX, marginY, contentWidth, pdfContentHeight, undefined, 'FAST');
    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfContentHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginX, position + marginY, contentWidth, pdfContentHeight, undefined, 'FAST');
      heightLeft -= contentHeight;
    }
  }

  onProgress?.('جاري حفظ ملف الـ PDF...');
  pdf.save(fileName);
}
