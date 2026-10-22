import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ResumePreview from './components/ResumePreview';
import ResumeEditor from './components/ResumeEditor';
import { asrifResumeData, rifkanResumeData } from './data/resumeData';

export default function App() {
  const [data, setData] = useState(rifkanResumeData);
  const [selectedPreset, setSelectedPreset] = useState('rifkan');
  const [pageMode, setPageMode] = useState('auto');
  const [scale, setScale] = useState(0.85);
  const [spacingDensity, setSpacingDensity] = useState('normal'); // 'compact' | 'normal' | 'spacious'
  const [fontFamily, setFontFamily] = useState('playfair'); // 'playfair' | 'lora' | 'inter'
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleFitScreen = () => {
    const availableHeight = window.innerHeight - 130;
    const targetScale = Math.min(Math.max(availableHeight / 1123, 0.55), 1.1);
    setScale(Number(targetScale.toFixed(2)));
  };

  useEffect(() => {
    handleFitScreen();
    window.addEventListener('resize', handleFitScreen);
    return () => window.removeEventListener('resize', handleFitScreen);
  }, [pageMode]);

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
        onFitScreen={handleFitScreen}
        onPrint={handlePrint}
      />

      {/* Main Workspace Area */}
      <div className="cv-workspace">
        <main className={`cv-canvas-area ${isEditorOpen ? 'editor-active' : ''}`}>
          <div className="cv-canvas-inner">
            <ResumePreview
              data={data}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="cv-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
