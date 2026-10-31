import React, { useState, useEffect, useDeferredValue, useCallback, useRef } from 'react';
import Toolbar from './components/Toolbar';
import ResumePreview from './components/ResumePreview';
import ResumeEditor from './components/ResumeEditor';
import { asrifResumeData, rifkanResumeData, fazilResumeData } from './data/resumeData';
import { exportResumeToPdf, buildPdfFileName } from './utils/exportPdf';
import { loadSaved, save, removeSaved, loadResume, saveResume } from './utils/storage';
import { useHistoryState } from './utils/useHistoryState';
import { Eye, Edit3, Sliders, FileDown, Loader2 } from 'lucide-react';

const PRESET_DATA = {
  asrif: asrifResumeData,
  rifkan: rifkanResumeData,
  fazil: fazilResumeData
};

const savedSettings = loadSaved('settings', {});
const initialPreset = PRESET_DATA[savedSettings.selectedPreset] ? savedSettings.selectedPreset : 'fazil';

export default function App() {
  const {
    state: data,
    setState: setData,
    undo,
    redo,
    reset: resetData,
    canUndo,
    canRedo
  } = useHistoryState(() => loadResume(initialPreset, PRESET_DATA[initialPreset]));
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [pageMode, setPageMode] = useState(savedSettings.pageMode || 'auto');
  const [scale, setScale] = useState(0.85);
  const [spacingDensity, setSpacingDensity] = useState(savedSettings.spacingDensity || 'normal'); // 'compact' | 'normal' | 'spacious'
  const [fontFamily, setFontFamily] = useState(savedSettings.fontFamily || 'playfair'); // 'playfair' | 'lora' | 'inter'
  const [pdfQuality, setPdfQuality] = useState(savedSettings.pdfQuality || 'high'); // 'high' | 'small'
  const [pdfMode, setPdfMode] = useState(savedSettings.pdfMode || 'vector'); // 'vector' (real text PDF) | 'image' (picture download)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Defer preview rendering so editing inputs in drawer is 100% lag-free and instant
  const deferredData = useDeferredValue(data);

  const handleFitScreen = useCallback(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // 794px is A4 sheet width at 96 DPI
      // Available width on mobile minus margins
      const availableWidth = window.innerWidth - 24;
      const targetScale = Math.min(Math.max(availableWidth / 794, 0.28), 0.85);
      setScale(Number(targetScale.toFixed(2)));
    } else {
      const availableHeight = window.innerHeight - 130;
      const targetScale = Math.min(Math.max(availableHeight / 1123, 0.55), 1.1);
      setScale(Number(targetScale.toFixed(2)));
    }
  }, []);

  useEffect(() => {
    handleFitScreen();
    window.addEventListener('resize', handleFitScreen);
    return () => window.removeEventListener('resize', handleFitScreen);
  }, [handleFitScreen, pageMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Autosave the current resume (per preset) shortly after each edit
  const storageWarnedRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!saveResume(selectedPreset, PRESET_DATA[selectedPreset], data) && !storageWarnedRef.current) {
        storageWarnedRef.current = true;
        showToast('Autosave failed: browser storage is full or blocked. Use "JSON" to back up.');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [data, selectedPreset]);

  useEffect(() => {
    save('settings', { selectedPreset, pageMode, spacingDensity, fontFamily, pdfQuality, pdfMode });
  }, [selectedPreset, pageMode, spacingDensity, fontFamily, pdfQuality, pdfMode]);

  const handleSelectPreset = (presetKey) => {
    // Flush the current preset's edits before switching away
    saveResume(selectedPreset, PRESET_DATA[selectedPreset], data);
    setSelectedPreset(presetKey);
    resetData(loadResume(presetKey, PRESET_DATA[presetKey]));
    if (presetKey === 'asrif') {
      setPageMode('two-page');
      showToast('Loaded "Asrif Ahamed" Reference CV (2 Pages)');
    } else if (presetKey === 'rifkan') {
      setPageMode('auto');
      showToast('Loaded "Mohamed Riskan" Resume (with your photo)');
    } else if (presetKey === 'fazil') {
      setPageMode('auto');
      showToast('Loaded "Fazil Muhammad" Resume (Motion Graphics & Video Editor)');
    }
  };

  const handleResetPreset = () => {
    if (!window.confirm('Discard all your edits to this CV and restore the original content?')) return;
    removeSaved(`data:${selectedPreset}`);
    setData(PRESET_DATA[selectedPreset]);
    showToast('Restored the original CV content (Ctrl+Z to undo)');
  };

  // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z undo & redo, also while typing in the editor
  // (controlled inputs can't use the browser's native undo reliably)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const handlePrint = () => {
    window.print();
  };

  // Real (vector) PDF: the browser's own "Save as PDF" renders the print layout
  // with selectable text, embedded fonts and clickable links. Browsers use the
  // page title as the suggested file name.
  const handleSaveRealPdf = () => {
    const prevTitle = document.title;
    document.title = buildPdfFileName(data.pdfFileName, data.header.fullName).replace(/\.pdf$/, '');
    const restoreTitle = () => {
      document.title = prevTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);
    showToast('Choose "Save as PDF" as the printer, then click Save');
    // Let the toast paint before the print dialog blocks the page
    setTimeout(() => {
      window.print();
      restoreTitle();
    }, 150);
  };

  const handleExportPdf = async () => {
    if (pdfMode === 'vector') {
      handleSaveRealPdf();
      return;
    }
    setIsExporting(true);
    await exportResumeToPdf({
      data,
      fileName: data.pdfFileName,
      quality: pdfQuality,
      onStart: () => showToast(pdfQuality === 'small' ? 'Generating compact A4 PDF...' : 'Generating high-res A4 PDF...'),
      onComplete: (filename) => {
        setIsExporting(false);
        showToast(`Downloaded "${filename}"`);
      },
      onError: (err) => {
        setIsExporting(false);
        showToast('Direct export encountered an issue. Opening Print preview...');
        window.print();
      }
    });
  };

  return (
    <div className="cv-app-container">
      {/* Top Application Toolbar */}
      <Toolbar
        data={data}
        setData={setData}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        pageMode={pageMode}
        setPageMode={setPageMode}
        scale={scale}
        setScale={setScale}
        spacingDensity={spacingDensity}
        setSpacingDensity={setSpacingDensity}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        isEditorOpen={isEditorOpen}
        setIsEditorOpen={setIsEditorOpen}
        isMobileToolsOpen={isMobileToolsOpen}
        setIsMobileToolsOpen={setIsMobileToolsOpen}
        onFitScreen={handleFitScreen}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        onResetPreset={handleResetPreset}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main Workspace Area */}
      <div className="cv-workspace">
        <main className={`cv-canvas-area ${isEditorOpen ? 'editor-active' : ''}`}>
          <div className="cv-canvas-inner">
            <ResumePreview
              data={deferredData}
              pageMode={pageMode}
              scale={scale}
              spacingDensity={spacingDensity}
              fontFamily={fontFamily}
            />
          </div>
        </main>

        {/* Slide-out Content Editor Drawer */}
        <ResumeEditor
          data={data}
          setData={setData}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          pdfQuality={pdfQuality}
          setPdfQuality={setPdfQuality}
          pdfMode={pdfMode}
          setPdfMode={setPdfMode}
        />
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly native app bar) */}
      <nav className="cv-mobile-bottom-nav mobile-only">
        <button
          className={`cv-mob-nav-btn ${!isEditorOpen && !isMobileToolsOpen ? 'active' : ''}`}
          onClick={() => {
            setIsEditorOpen(false);
            setIsMobileToolsOpen(false);
            handleFitScreen();
          }}
          title="Fit view to screen"
        >
          <Eye size={18} />
          <span>Fit View</span>
        </button>
        <button
          className={`cv-mob-nav-btn ${isEditorOpen ? 'active' : ''}`}
          onClick={() => {
            setIsMobileToolsOpen(false);
            setIsEditorOpen((prev) => !prev);
          }}
          title="Toggle CV Editor"
        >
          <Edit3 size={18} />
          <span>{isEditorOpen ? 'Preview' : 'Edit CV'}</span>
        </button>
        <button
          className={`cv-mob-nav-btn ${isMobileToolsOpen ? 'active' : ''}`}
          onClick={() => {
            setIsEditorOpen(false);
            setIsMobileToolsOpen((prev) => !prev);
          }}
          title="Customize Theme & Styles"
        >
          <Sliders size={18} />
          <span>Customize</span>
        </button>
        <button
          className="cv-mob-nav-btn cv-mob-export"
          onClick={handleExportPdf}
          disabled={isExporting}
          title="Export high-res PDF"
        >
          {isExporting ? <Loader2 size={18} className="cv-spinner" /> : <FileDown size={18} />}
          <span>{isExporting ? 'Saving...' : 'PDF'}</span>
        </button>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="cv-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
