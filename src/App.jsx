import React, { useState, useEffect, useDeferredValue, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import ResumePreview from './components/ResumePreview';
import ResumeEditor from './components/ResumeEditor';
import { asrifResumeData, rifkanResumeData } from './data/resumeData';
import { exportResumeToPdf } from './utils/exportPdf';
import { Eye, Edit3, Sliders, FileDown, Loader2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(rifkanResumeData);
  const [selectedPreset, setSelectedPreset] = useState('rifkan');
  const [pageMode, setPageMode] = useState('auto');
  const [scale, setScale] = useState(0.85);
  const [spacingDensity, setSpacingDensity] = useState('normal'); // 'compact' | 'normal' | 'spacious'
  const [fontFamily, setFontFamily] = useState('playfair'); // 'playfair' | 'lora' | 'inter'
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

  const handleSelectPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'asrif') {
      setData(asrifResumeData);
      setPageMode('two-page');
      showToast('Loaded "Asrif Ahamed" Reference CV (2 Pages)');
    } else if (presetKey === 'rifkan') {
      setData(rifkanResumeData);
      setPageMode('auto');
      showToast('Loaded "Mohamed Riskan" Resume (with your photo)');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    await exportResumeToPdf({
      data,
      onStart: () => showToast('Generating high-res A4 PDF...'),
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
