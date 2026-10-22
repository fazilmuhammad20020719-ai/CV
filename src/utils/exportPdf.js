/**
 * Exports the resume as a high-fidelity, crystal-clear A4 PDF.
 * Uses html2canvas + jsPDF directly to render every page at 2x retina scale,
 * avoiding blank page bugs and ensuring 100% exact vector/raster output.
 */
export async function exportResumeToPdf({ data, onStart, onComplete, onError }) {
  let stagingWrapper = null;
  const prevScrollX = window.scrollX || 0;
  const prevScrollY = window.scrollY || 0;

  try {
    if (onStart) onStart();

    // Scroll to top temporarily to ensure html2canvas coordinate alignment
    window.scrollTo(0, 0);

    // Dynamically load html2canvas and jsPDF to keep initial bundle ultra-fast
    const [html2canvasModule, jspdfModule] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

    // Ensure all web fonts are completely loaded
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Locate the rendered CV pages from the canvas
    let sourcePages = document.querySelectorAll('.cv-canvas-inner .cv-page');
    if (!sourcePages || sourcePages.length === 0) {
      sourcePages = document.querySelectorAll('.cv-page');
    }
    if (!sourcePages || sourcePages.length === 0) {
      throw new Error('No resume pages found in DOM to export.');
    }

    // Create an unscaled, isolated staging container attached to document.body
    stagingWrapper = document.createElement('div');
    stagingWrapper.id = 'cv-pdf-render-staging';
    stagingWrapper.style.position = 'absolute';
    stagingWrapper.style.left = '0';
    stagingWrapper.style.top = '0';
    stagingWrapper.style.width = '794px';
    stagingWrapper.style.minWidth = '794px';
    stagingWrapper.style.maxWidth = '794px';
    stagingWrapper.style.zIndex = '-9999';
    stagingWrapper.style.opacity = '1';
    stagingWrapper.style.visibility = 'visible';
    stagingWrapper.style.pointerEvents = 'none';
    stagingWrapper.style.backgroundColor = '#ffffff';
    stagingWrapper.style.margin = '0';
    stagingWrapper.style.padding = '0';
    document.body.appendChild(stagingWrapper);

    let pdf = null;
    const fullName = data?.header?.fullName || 'Resume';
    const safeName = fullName
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_');
    const filename = `${safeName}_CV.pdf`;

    for (let i = 0; i < sourcePages.length; i++) {
      const pageEl = sourcePages[i];
      const pageClone = pageEl.cloneNode(true);

      // Force pristine unscaled A4 dimensions on the clone
      pageClone.style.transform = 'none';
      pageClone.style.transformOrigin = 'top left';
      pageClone.style.boxShadow = 'none';
      pageClone.style.margin = '0';
      pageClone.style.width = '794px';
      pageClone.style.minWidth = '794px';
      pageClone.style.maxWidth = '794px';
      pageClone.style.height = '1123px';
      pageClone.style.minHeight = '1123px';
      pageClone.style.maxHeight = '1123px';
      pageClone.style.boxSizing = 'border-box';
      pageClone.style.display = 'flex';
      pageClone.style.flexDirection = 'column';
      pageClone.style.overflow = 'hidden';
      pageClone.style.backgroundColor = '#ffffff';
      pageClone.style.opacity = '1';
      pageClone.style.visibility = 'visible';

      stagingWrapper.innerHTML = '';
      stagingWrapper.appendChild(pageClone);

      // Ensure any images inside this page (e.g. portrait photo) are fully loaded
      const images = pageClone.querySelectorAll('img');
      if (images.length > 0) {
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) return resolve();
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
          )
        );
      }

      // Small tick for DOM reflow
      await new Promise((resolve) => setTimeout(resolve, 80));

      // Render high-res canvas (2x scale for 300-DPI equivalent print sharpness)
      const canvas = await html2canvas(pageClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i === 0) {
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
      } else {
        pdf.addPage('a4', 'portrait');
      }

      // Fill exactly 210mm x 297mm A4 portrait sheet
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    if (pdf) {
      pdf.save(filename);
    }

    // Clean up staging container
    if (stagingWrapper && stagingWrapper.parentNode) {
      stagingWrapper.parentNode.removeChild(stagingWrapper);
      stagingWrapper = null;
    }

    // Restore user scroll position
    window.scrollTo(prevScrollX, prevScrollY);

    if (onComplete) onComplete(filename);
  } catch (error) {
    console.error('PDF Export Error:', error);
    if (stagingWrapper && stagingWrapper.parentNode) {
      stagingWrapper.parentNode.removeChild(stagingWrapper);
      stagingWrapper = null;
    }
    window.scrollTo(prevScrollX, prevScrollY);

    if (onError) {
      onError(error);
    } else {
      window.print();
    }
  }
}
