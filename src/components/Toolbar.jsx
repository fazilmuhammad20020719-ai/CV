import React, { useRef, memo } from 'react';
import {
  Printer,
  Eye,
  LayoutGrid,
  FileText,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Upload,
  Download,
  Image as ImageIcon,
  Edit3,
  Sliders,
  Check,
  Maximize2,
  FileDown,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import { colorThemes } from '../data/resumeData';

function Toolbar({
  data,
  setData,
  selectedPreset,
  onSelectPreset,
  pageMode,
  setPageMode,
  scale,
  setScale,
  spacingDensity,
  setSpacingDensity,
  fontFamily,
  setFontFamily,
  isEditorOpen,
  setIsEditorOpen,
  onFitScreen,
  onPrint,
  onExportPdf,
  isExporting = false,
  isMobileToolsOpen = false,
  setIsMobileToolsOpen = () => {}
}) {
  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setData((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            photoUrl: uploadEvent.target.result,
            showPhoto: true
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (themeObj) => {
    setData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        bannerColor: themeObj.hex,
        bannerSubColor: themeObj.subHex
      }
    }));
  };

  const handleCustomColor = (e) => {
    const val = e.target.value;
    setData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        bannerColor: val
      }
    }));
  };

  const exportToJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.header.fullName.replace(/\s+/g, '_')}_CV.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setData(parsed);
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="cv-top-nav">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handlePhotoUpload}
      />
      <input
        type="file"
        ref={jsonInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={importFromJson}
      />

      {/* Main Top Bar */}
      <div className="cv-nav-bar-row">
        {/* Left Section: Brand & Preset */}
        <div className="cv-nav-left">
          <div className="cv-brand">
            <div className="cv-brand-badge">CV FORMATTER</div>
            <div className="cv-brand-title">Resume Studio</div>
          </div>

          {/* Desktop Preset Buttons */}
          <div className="cv-preset-selector desktop-only">
            <span className="cv-pill-label">Preset:</span>
            <button
              className={`cv-preset-btn ${selectedPreset === 'rifkan' ? 'active' : ''}`}
              onClick={() => onSelectPreset('rifkan')}
              title="Load Mohamed Riskan resume"
            >
              Mohamed Riskan
            </button>
            <button
              className={`cv-preset-btn ${selectedPreset === 'asrif' ? 'active' : ''}`}
              onClick={() => onSelectPreset('asrif')}
              title="Load Asrif Ahamed resume"
            >
              Asrif Ahamed
            </button>
          </div>

          {/* Mobile Preset Quick Switcher */}
          <button
            className="cv-mobile-preset-pill mobile-only"
            onClick={() => onSelectPreset(selectedPreset === 'rifkan' ? 'asrif' : 'rifkan')}
            title="Tap to switch resume preset"
          >
            <Sparkles size={12} className="cv-pill-icon" />
            <span className="cv-pill-name">
              {selectedPreset === 'rifkan' ? 'Riskan' : 'Asrif'}
            </span>
            <span className="cv-pill-switch">Switch</span>
          </button>
        </div>

        {/* Center Section: Desktop Controls Only */}
        <div className="cv-nav-center desktop-only">
          {/* View Mode controls */}
          <div className="cv-btn-group">
            <button
              className={`cv-tool-btn ${pageMode === 'auto' || pageMode === '1-page' ? 'active' : ''}`}
              onClick={() => setPageMode('auto')}
              title="Single Page Fit"
            >
              <FileText size={15} />
              <span>Fit Page</span>
            </button>
            <button
              className={`cv-tool-btn ${pageMode === 'two-page' ? 'active' : ''}`}
              onClick={() => setPageMode('two-page')}
              title="Two Page Grid View"
            >
              <LayoutGrid size={15} />
              <span>2 Pages</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="cv-zoom-group">
            <button
              className="cv-icon-btn"
              onClick={() => setScale((s) => Math.max(0.3, Number((s - 0.1).toFixed(2))))}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="cv-zoom-indicator">{Math.round(scale * 100)}%</span>
            <button
              className="cv-icon-btn"
              onClick={() => setScale((s) => Math.min(1.5, Number((s + 0.1).toFixed(2))))}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              className="cv-icon-btn"
              onClick={onFitScreen}
              title="Fit to Screen"
            >
              <Maximize2 size={13} />
            </button>
            <button
              className="cv-icon-btn"
              onClick={() => setScale(0.95)}
              title="Reset Zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Theme Swatches */}
          <div className="cv-theme-swatches">
            <Palette size={15} className="cv-theme-icon" />
            {colorThemes.map((th, i) => (
              <button
                key={i}
                className={`cv-swatch ${data.theme.bannerColor === th.hex ? 'active' : ''}`}
                style={{ backgroundColor: th.hex }}
                title={th.name}
                onClick={() => handleThemeChange(th)}
              >
                {data.theme.bannerColor === th.hex && <Check size={11} color="#fff" />}
              </button>
            ))}
            <label className="cv-custom-color-picker" title="Custom color picker">
              <input
                type="color"
                value={data.theme.bannerColor}
                onChange={handleCustomColor}
              />
            </label>
          </div>

          {/* Font Selector */}
          <div className="cv-select-group">
            <select
              className="cv-toolbar-select"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              title="Resume Typography"
            >
              <option value="playfair">Playfair Serif</option>
              <option value="lora">Lora Editorial</option>
              <option value="inter">Modern Sans</option>
            </select>
          </div>

          {/* Spacing Density */}
          <div className="cv-select-group">
            <select
              className="cv-toolbar-select"
              value={spacingDensity}
              onChange={(e) => setSpacingDensity(e.target.value)}
              title="Page Spacing Density"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="cv-nav-right">
          {/* Mobile Tools Drawer Toggle */}
          <button
            className={`cv-action-btn secondary mobile-only ${isMobileToolsOpen ? 'active' : ''}`}
            onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
            title="Toggle styling and tools"
          >
            <Sliders size={15} />
            <span>Tools</span>
          </button>

          {/* Photo Button (Desktop) */}
          <button
            className="cv-action-btn secondary desktop-only"
            onClick={() => fileInputRef.current.click()}
            title="Upload portrait photo"
          >
            <ImageIcon size={15} />
            <span>Photo</span>
          </button>

          {/* Edit CV Button */}
          <button
            className={`cv-action-btn edit-toggle-btn ${isEditorOpen ? 'active' : ''}`}
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            title="Open resume content editor"
          >
            <Edit3 size={15} />
            <span>{isEditorOpen ? 'Close' : 'Edit CV'}</span>
          </button>

          {/* Save JSON (Desktop) */}
          <button
            className="cv-action-btn secondary desktop-only"
            onClick={exportToJson}
            title="Save JSON backup"
          >
            <Download size={15} />
            <span>JSON</span>
          </button>

          {/* Direct PDF Export */}
          <button
            className="cv-action-btn export-btn"
            onClick={onExportPdf}
            disabled={isExporting}
            title="Export high-resolution PDF"
          >
            {isExporting ? (
              <Loader2 size={15} className="cv-spinner" />
            ) : (
              <FileDown size={15} />
            )}
            <span className="export-text">{isExporting ? 'Exporting...' : 'PDF'}</span>
          </button>

          {/* Print Button (Desktop) */}
          <button
            className="cv-action-btn primary desktop-only"
            onClick={onPrint}
            title="Print resume"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Mobile Tools Tray (Slide-down customization panel) */}
      {isMobileToolsOpen && (
        <div className="cv-mobile-tools-tray mobile-only">
          <div className="cv-tray-header">
            <span className="cv-tray-title">Customization & Tools</span>
            <button
              className="cv-tray-close"
              onClick={() => setIsMobileToolsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="cv-tray-content">
            {/* View Mode & Zoom Row */}
            <div className="cv-tray-row">
              <span className="cv-tray-label">View & Zoom:</span>
              <div className="cv-tray-cluster">
                <div className="cv-btn-group">
                  <button
                    className={`cv-tool-btn ${pageMode === 'auto' || pageMode === '1-page' ? 'active' : ''}`}
                    onClick={() => setPageMode('auto')}
                  >
                    1 Page
                  </button>
                  <button
                    className={`cv-tool-btn ${pageMode === 'two-page' ? 'active' : ''}`}
                    onClick={() => setPageMode('two-page')}
                  >
                    2 Pages
                  </button>
                </div>

                <div className="cv-zoom-group">
                  <button
                    className="cv-icon-btn"
                    onClick={() => setScale((s) => Math.max(0.3, Number((s - 0.08).toFixed(2))))}
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="cv-zoom-indicator">{Math.round(scale * 100)}%</span>
                  <button
                    className="cv-icon-btn"
                    onClick={() => setScale((s) => Math.min(1.5, Number((s + 0.08).toFixed(2))))}
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    className="cv-icon-btn"
                    onClick={onFitScreen}
                    title="Fit to Screen"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Color Palette Swatches */}
            <div className="cv-tray-row">
              <span className="cv-tray-label">Color Theme:</span>
              <div className="cv-tray-swatches-scroll">
                {colorThemes.map((th, i) => (
                  <button
                    key={i}
                    className={`cv-swatch ${data.theme.bannerColor === th.hex ? 'active' : ''}`}
                    style={{ backgroundColor: th.hex }}
                    title={th.name}
                    onClick={() => handleThemeChange(th)}
                  >
                    {data.theme.bannerColor === th.hex && <Check size={12} color="#fff" />}
                  </button>
                ))}
                <label className="cv-custom-color-picker" title="Custom color picker">
                  <input
                    type="color"
                    value={data.theme.bannerColor}
                    onChange={handleCustomColor}
                  />
                </label>
              </div>
            </div>

            {/* Typography & Spacing */}
            <div className="cv-tray-row cv-tray-two-col">
              <div className="cv-tray-col">
                <span className="cv-tray-label">Typography:</span>
                <select
                  className="cv-toolbar-select"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <option value="playfair">Playfair Serif</option>
                  <option value="lora">Lora Editorial</option>
                  <option value="inter">Modern Sans</option>
                </select>
              </div>

              <div className="cv-tray-col">
                <span className="cv-tray-label">Density:</span>
                <select
                  className="cv-toolbar-select"
                  value={spacingDensity}
                  onChange={(e) => setSpacingDensity(e.target.value)}
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="cv-tray-actions">
              <button
                className="cv-tray-action-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <ImageIcon size={14} />
                <span>Upload Photo</span>
              </button>
              <button
                className="cv-tray-action-btn"
                onClick={exportToJson}
              >
                <Download size={14} />
                <span>Save JSON</span>
              </button>
              <button
                className="cv-tray-action-btn"
                onClick={() => jsonInputRef.current.click()}
              >
                <Upload size={14} />
                <span>Import JSON</span>
              </button>
              <button
                className="cv-tray-action-btn"
                onClick={onPrint}
              >
                <Printer size={14} />
                <span>Print Dialog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Toolbar);
