import React, { useRef } from 'react';
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
  Maximize2
} from 'lucide-react';
import { colorThemes } from '../data/resumeData';

export default function Toolbar({
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
  onPrint
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

  const handleFontChange = (fontType) => {
    setData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        fontFamily: fontType
      }
    }));
  };

  const togglePhoto = () => {
    setData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        showPhoto: !prev.header.showPhoto
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
      <div className="cv-nav-left">
        <div className="cv-brand">
          <div className="cv-brand-badge">CV FORMATTER</div>
          <div className="cv-brand-title">Resume Studio</div>
        </div>

        {/* Preset Selector */}
        <div className="cv-preset-selector">
          <span className="cv-pill-label">Resume:</span>
          <button
            className={`cv-preset-btn ${selectedPreset === 'rifkan' ? 'active' : ''}`}
            onClick={() => onSelectPreset('rifkan')}
            title="Load Mohamed Riskan resume with your details and photo"
          >
            Mohamed Riskan
          </button>
          <button
            className={`cv-preset-btn ${selectedPreset === 'asrif' ? 'active' : ''}`}
            onClick={() => onSelectPreset('asrif')}
            title="Load original Asrif Ahamed resume reference"
          >
            Asrif Ahamed
          </button>
        </div>
      </div>

      <div className="cv-nav-center">
        {/* View Mode controls */}
        <div className="cv-btn-group">
          <button
            className={`cv-tool-btn ${pageMode === 'auto' || pageMode === '1-page' ? 'active' : ''}`}
            onClick={() => setPageMode('auto')}
            title="Executive Fit"
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
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="cv-zoom-indicator">{Math.round(scale * 100)}%</span>
          <button
            className="cv-icon-btn"
            onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            className="cv-icon-btn"
            onClick={onFitScreen}
            title="Fit to Screen UI"
          >
            <Maximize2 size={13} />
          </button>
          <button
            className="cv-icon-btn"
            onClick={() => setScale(0.95)}
            title="Reset Zoom (95%)"
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
            <option value="playfair">Serif (Reference)</option>
            <option value="lora">Lora (Editorial)</option>
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

      <div className="cv-nav-right">
        {/* Photo Upload / Toggle */}
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

        <button
          className="cv-action-btn secondary"
          onClick={() => fileInputRef.current.click()}
          title="Upload your own portrait photo"
        >
          <ImageIcon size={15} />
          <span>Photo</span>
        </button>

        <button
          className={`cv-action-btn secondary ${isEditorOpen ? 'active' : ''}`}
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          title="Toggle content editor panel"
        >
          <Edit3 size={15} />
          <span>{isEditorOpen ? 'Close Editor' : 'Edit CV'}</span>
        </button>

        {/* Export / Import Menu */}
        <button
          className="cv-action-btn secondary"
          onClick={exportToJson}
          title="Save resume as JSON backup"
        >
          <Download size={15} />
          <span>Save JSON</span>
        </button>

        {/* Print / Download PDF */}
        <button
          className="cv-action-btn primary"
          onClick={onPrint}
          title="Print to PDF or paper printer"
        >
          <Printer size={16} />
          <span>Print / PDF</span>
        </button>
      </div>
    </header>
  );
}
