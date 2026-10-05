import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  onProgress?: (progressMessage: string) => void;
}

/**
 * Ensures all images inside the target container are fully loaded before capturing canvas.
 */
async function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  const promises = images.map((img) => {
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      let isResolved = false;
      const done = () => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      };
      img.onload = done;
      img.onerror = done; // Resolve even on error so export never hangs
      setTimeout(done, 3000); // 3s fallback timeout per image
    });
  });
  await Promise.all(promises);
}

/**
 * Triggers PDF file download reliably across browsers, iOS/Android mobile, and iframes.
 */
function triggerPdfDownload(pdf: jsPDF, fileName: string): void {
  try {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 4000);
  } catch (err) {
    console.warn('Blob URL download failed, falling back to pdf.save():', err);
    try {
      pdf.save(fileName);
    } catch (saveErr) {
      console.error('jsPDF save failed:', saveErr);
      const dataUrl = pdf.output('datauristring');
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  }
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

  try {
    onProgress?.('جاري تحضير وتجهيز الصفحات والصور...');

    // Ensure all images are loaded first
    await waitForImagesToLoad(container);

    // Look for distinct page containers first
    let pageElements = Array.from(
      container.querySelectorAll<HTMLElement>('.official-print-page')
    );

    // If no distinct page elements, use container
    if (pageElements.length === 0) {
      pageElements = [container];
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const a4Width = 210;
    const a4Height = 297;
    const marginX = 8;
    const marginY = 8;
    const contentWidth = a4Width - marginX * 2; // 194mm
    const contentHeight = a4Height - marginY * 2; // 281mm

    const html2canvasOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      ignoreElements: (element: Element) => element.classList.contains('no-print'),
      onclone: (clonedDoc: Document) => {
        // Ensure cloned element is visible and properly formatted
        const noPrintEls = clonedDoc.querySelectorAll('.no-print');
        noPrintEls.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      },
    };

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`جاري تحويل الصفحة ${i + 1} من ${pageElements.length} إلى PDF...`);

      const canvas = await html2canvas(pageEl, html2canvasOptions);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const renderedHeight = (imgProps.height * contentWidth) / imgProps.width;

      if (i > 0) {
        pdf.addPage();
      }

      let targetHeight = renderedHeight;
      let targetWidth = contentWidth;
      let posX = marginX;
      let posY = marginY;

      if (renderedHeight > contentHeight) {
        // Scale proportionally to fit on single page if slightly oversized
        const scaleFactor = contentHeight / renderedHeight;
        targetHeight = contentHeight;
        targetWidth = contentWidth * scaleFactor;
        posX = marginX + (contentWidth - targetWidth) / 2;
      }

      pdf.addImage(imgData, 'JPEG', posX, posY, targetWidth, targetHeight, undefined, 'FAST');
    }

    onProgress?.('جاري حفظ وتنزيل ملف الـ PDF...');
    triggerPdfDownload(pdf, fileName);
  } catch (error) {
    console.error('Error during PDF export:', error);
    onProgress?.('جاري فتح نافذة الطباعة كبديل آمن...');
    
    // Fallback to browser print which allows saving to PDF natively
    setTimeout(() => {
      window.print();
    }, 300);
  }
}
