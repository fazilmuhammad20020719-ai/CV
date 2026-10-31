const PX_TO_MM = 210 / 794;

// 'high': sharpest output; 'small': lighter file for email / upload limits
const QUALITY = {
  high: { canvasScale: 2, jpegQuality: 0.98, photoMaxPx: null },
  small: { canvasScale: 1.5, jpegQuality: 0.82, photoMaxPx: 600 }
};

export function buildPdfFileName(requested, fullName) {
  const base = (requested || '').trim() || `${(fullName || 'Resume').trim()}_CV`;
  const safe = base
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${safe || 'Resume_CV'}.pdf`;
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function isRendered(el) {
  for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  }
  return true;
}

/**
 * Adds an invisible, selectable text layer word-by-word on top of the page image,
 * so ATS parsers and readers can extract the text. Each word is horizontally
 * scaled to cover exactly the area it occupies in the rendered page.
 */
function addTextLayer(pdf, pageEl) {
  const pageRect = pageEl.getBoundingClientRect();
  const walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const styleCache = new Map();

  pdf.setFont('helvetica', 'normal');

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    if (!text || !text.trim()) continue;

    const parent = node.parentElement;
    if (!styleCache.has(parent)) {
      const style = window.getComputedStyle(parent);
      styleCache.set(parent, isRendered(parent) ? style : null);
    }
    const style = styleCache.get(parent);
    if (!style) continue;

    const fontSizePt = parseFloat(style.fontSize) * 0.75;
    const upper = style.textTransform === 'uppercase';
    pdf.setFontSize(fontSizePt);

    const wordRe = /\S+/g;
    let match;
    while ((match = wordRe.exec(text))) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getClientRects()[0];
      if (!rect || rect.width === 0) continue;

      const word = upper ? match[0].toUpperCase() : match[0];
      const x = (rect.left - pageRect.left) * PX_TO_MM;
      const y = (rect.top - pageRect.top) * PX_TO_MM;
      const targetW = rect.width * PX_TO_MM;
      const naturalW = pdf.getTextWidth(word) || targetW;

      pdf.text(word, x, y, {
        baseline: 'top',
        renderingMode: 'invisible',
        horizontalScale: targetW / naturalW
      });
    }
  }
}

/** Adds clickable link annotations over every hyperlink in the page. */
function addLinks(pdf, pageEl) {
  const pageRect = pageEl.getBoundingClientRect();
  pageEl.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    Array.from(a.getClientRects()).forEach((rect) => {
      if (rect.width === 0 || rect.height === 0) return;
      pdf.link(
        (rect.left - pageRect.left) * PX_TO_MM,
        (rect.top - pageRect.top) * PX_TO_MM,
        rect.width * PX_TO_MM,
        rect.height * PX_TO_MM,
        { url: href }
      );
    });
  });
}

/**
 * Draws the original photo bytes into the PDF, clipped to the photo frame and
 * positioned exactly like the preview: `background-size: cover` at the chosen
 * background-position, then scaled by the zoom around that same point.
 */
async function overlayOriginalPhoto(pdf, pageEl, photoMaxPx) {
  const photoEl = pageEl.querySelector('.cv-photo-img');
  const frameEl = pageEl.querySelector('.cv-photo-frame');
  if (!photoEl || !frameEl) return;

  const match = /url\(["']?(.*?)["']?\)/.exec(photoEl.style.backgroundImage || '');
  if (!match) return;

  try {
    const blob = await (await fetch(match[1])).blob();
    let format = blob.type.includes('png') ? 'PNG' : 'JPEG';
    let dataUrl = await readBlobAsDataUrl(blob);

    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = dataUrl;
    });

    // Smaller-file mode: re-encode the photo at a reduced size
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    if (photoMaxPx && longest > photoMaxPx) {
      const ratio = photoMaxPx / longest;
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * ratio);
      c.height = Math.round(img.naturalHeight * ratio);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      dataUrl = c.toDataURL('image/jpeg', 0.88);
      format = 'JPEG';
    }

    const pageRect = pageEl.getBoundingClientRect();
    // Temporarily drop the zoom transform so the frame/photo box measures unscaled
    const prevTransform = photoEl.style.transform;
    photoEl.style.transform = 'none';
    const frameRect = photoEl.getBoundingClientRect();
    photoEl.style.transform = prevTransform;
    const fx = (frameRect.left - pageRect.left) * PX_TO_MM;
    const fy = (frameRect.top - pageRect.top) * PX_TO_MM;
    const fw = frameRect.width * PX_TO_MM;
    const fh = frameRect.height * PX_TO_MM;
    const radius = (parseFloat(window.getComputedStyle(frameEl).borderTopLeftRadius) || 0) * PX_TO_MM;

    const zoom = parseFloat(photoEl.dataset.zoom) || 1;
    const px = (parseFloat(photoEl.dataset.posX ?? 50) || 0) / 100;
    const py = (parseFloat(photoEl.dataset.posY ?? 0) || 0) / 100;

    const coverScale = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
    const baseW = img.naturalWidth * coverScale;
    const baseH = img.naturalHeight * coverScale;
    const baseX = (fw - baseW) * px;
    const baseY = (fh - baseH) * py;
    // Scale around the transform-origin point (px, py of the frame)
    const originX = fw * px;
    const originY = fh * py;
    const dw = baseW * zoom;
    const dh = baseH * zoom;
    const dx = fx + originX + (baseX - originX) * zoom;
    const dy = fy + originY + (baseY - originY) * zoom;

    pdf.saveGraphicsState();
    pdf.roundedRect(fx, fy, fw, fh, radius, radius, null);
    pdf.clip();
    pdf.discardPath();
    pdf.addImage(dataUrl, format, dx, dy, dw, dh, 'cv-photo', 'NONE');
    pdf.restoreGraphicsState();
  } catch (err) {
    // The screenshot already contains the photo, so keep that version if this fails
    console.warn('Full-resolution photo overlay skipped:', err);
  }
}

/**
 * Exports the resume as a high-fidelity, crystal-clear A4 PDF.
 * Uses html2canvas + jsPDF directly to render every page at 2x retina scale,
 * avoiding blank page bugs and ensuring 100% exact vector/raster output.
 */
export async function exportResumeToPdf({ data, fileName, quality = 'high', onStart, onComplete, onError }) {
  const q = QUALITY[quality] || QUALITY.high;
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

    // Locate only the visible paginated CV pages. The preview also renders a hidden
    // measurement copy and a print-only copy, which must not be exported.
    const sourcePages = document.querySelectorAll('.cv-pages-container .cv-page');
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
    const filename = buildPdfFileName(fileName, data?.header?.fullName);

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

      // Render the page canvas (2x scale in high quality for print sharpness)
      const canvas = await html2canvas(pageClone, {
        scale: q.canvasScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123
      });

      const imgData = canvas.toDataURL('image/jpeg', q.jpegQuality);

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

      // Overlay the original portrait file at full resolution so the photo is not
      // downsampled/re-compressed by the page screenshot
      await overlayOriginalPhoto(pdf, pageClone, q.photoMaxPx);

      addTextLayer(pdf, pageClone);
      addLinks(pdf, pageClone);
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
