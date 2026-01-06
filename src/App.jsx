import { useState, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { compressPDF, mergePDFs, splitPDF, extractPages, grayscalePDF, resizePDF } from "./lib/worker-init.js";
import "./App.css";

// ============ THEMES ============
const THEMES = {
  dark: {
    id: 'dark',
    name: 'Dark',
    preview: '#1e1e1e',
    colors: {
      // Background colors - VS Code / Teams inspired
      '--bg-primary': '#1e1e1e',
      '--bg-secondary': '#252526',
      '--bg-tertiary': '#2d2d30',
      '--bg-card': '#252526',
      // Accent - professional blue (similar to VS Code/Teams)
      '--accent-primary': '#0078d4',
      '--accent-secondary': '#106ebe',
      '--accent-gradient': '#0078d4',
      '--accent-glow': 'rgba(0, 120, 212, 0.15)',
      // Text colors - brighter for better contrast
      '--text-primary': '#e4e4e4',
      '--text-secondary': '#a0a0a0',
      '--text-muted': '#707070',
      // Feature colors - muted, professional
      '--compress-color': '#3c9a5f',
      '--merge-color': '#0078d4',
      '--split-color': '#c27c0e',
      // Borders
      '--border-color': 'rgba(255, 255, 255, 0.1)',
    }
  },
  light: {
    id: 'light',
    name: 'Light',
    preview: '#ffffff',
    colors: {
      // Background colors - Office / Google Docs inspired
      '--bg-primary': '#f5f5f5',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#e8e8e8',
      '--bg-card': '#ffffff',
      // Accent - professional blue
      '--accent-primary': '#0078d4',
      '--accent-secondary': '#106ebe',
      '--accent-gradient': '#0078d4',
      '--accent-glow': 'rgba(0, 120, 212, 0.1)',
      // Text colors
      '--text-primary': '#1f1f1f',
      '--text-secondary': '#616161',
      '--text-muted': '#8a8a8a',
      // Feature colors
      '--compress-color': '#107c41',
      '--merge-color': '#0078d4',
      '--split-color': '#a4630a',
      // Borders
      '--border-color': 'rgba(0, 0, 0, 0.1)',
    }
  }
};

// Apply theme to document
function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

// ============ THEME SELECTOR ============
function ThemeSelector({ currentTheme, onThemeChange }) {
  return (
    <div className="theme-selector">
      {Object.values(THEMES).map((theme) => (
        <button
          key={theme.id}
          className={`theme-dot ${currentTheme === theme.id ? 'active' : ''}`}
          style={{ background: theme.preview }}
          onClick={() => onThemeChange(theme.id)}
          title={theme.name}
          aria-label={`Switch to ${theme.name} theme`}
        />
      ))}
    </div>
  );
}

// ============ ICONS ============
const CompressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M19 9l-7-6-7 6M5 15l7 6 7-6" />
  </svg>
);

const MergeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="8" y="14" width="8" height="7" rx="1" />
    <path d="M6.5 10v2.5a1 1 0 001 1h9a1 1 0 001-1V10" />
  </svg>
);

const SplitIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="3" width="8" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <path d="M12 10v2.5M8 14l-1.5-1.5M16 14l1.5-1.5" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M9 15h6M9 11h6" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
  </svg>
);

// New feature icons
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const JpegIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <path d="M14 3v4h4" />
  </svg>
);

const ExtractIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 15h6" />
    <path d="M12 12v6" />
  </svg>
);

const GrayscaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M12 22.75V2.75" />
    <path d="M12 22.75A8 8 0 0 0 12 6.75" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

const ResizeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    <rect x="7" y="7" width="10" height="10" rx="1" />
  </svg>
);

// ============ QUALITY SLIDER ============
const QUALITY_LABELS = {
  1: { name: "Screen", desc: "Smallest file, 72 DPI" },
  2: { name: "eBook", desc: "Good balance, 150 DPI" },
  3: { name: "Print", desc: "High quality, 300 DPI" },
  4: { name: "Prepress", desc: "Maximum quality" }
};

function QualitySlider({ value, onChange, disabled }) {
  return (
    <div className={`quality-slider ${disabled ? 'disabled' : ''}`}>
      <label>Compression Quality</label>
      <div className="slider-container">
        <input
          type="range"
          min="1"
          max="4"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
        />
        <div className="slider-labels">
          <span className={value === 1 ? 'active' : ''}>Smallest</span>
          <span className={value === 4 ? 'active' : ''}>Best</span>
        </div>
      </div>
      <div className="quality-info">
        <strong>{QUALITY_LABELS[value].name}</strong>
        <span>{QUALITY_LABELS[value].desc}</span>
      </div>
    </div>
  );
}

// ============ FILE INPUT ============
function FileDropZone({ onFileSelect, accept = ".pdf", multiple = false, label }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      onFileSelect(multiple ? files : files[0]);
    }
  }, [onFileSelect, multiple]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect(multiple ? files : files[0]);
    }
    e.target.value = '';
  };

  return (
    <div
      className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        id="file-input"
      />
      <label htmlFor="file-input">
        <PdfIcon />
        <span>{label || "Drop PDF here or click to browse"}</span>
      </label>
    </div>
  );
}

// ============ MAIN PAGE ============
function MainPage({ onSelectFeature, currentTheme, onThemeChange }) {
  // Note: PNG/JPEG output devices are not available in this WASM build
  // Only pdfwrite device is supported
  const features = [
    { id: 'compress', icon: CompressIcon, title: 'Compress', desc: 'Reduce PDF file size' },
    { id: 'merge', icon: MergeIcon, title: 'Merge', desc: 'Combine multiple PDFs' },
    { id: 'split', icon: SplitIcon, title: 'Split', desc: 'Split PDF into pages' },
    { id: 'extractPages', icon: ExtractIcon, title: 'Extract Pages', desc: 'Extract a range of pages' },
    { id: 'grayscale', icon: GrayscaleIcon, title: 'Grayscale', desc: 'Convert to black & white' },
    { id: 'resize', icon: ResizeIcon, title: 'Resize', desc: 'Change page size (A4, Letter...)' },
  ];

  return (
    <div className="main-page">
      <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

      <header className="hero">
        <h1>
          <span className="logo-icon">🛠️</span>
          PDF Tools by PWA Suite
        </h1>
        <p className="tagline">Browser-based PDF tools powered by Ghostscript WASM</p>
      </header>

      <div className="features-grid">
        {features.map(({ id, icon: Icon, title, desc }) => (
          <button
            key={id}
            className="feature-card"
            onClick={() => onSelectFeature(id)}
          >
            <div className="feature-icon">
              <Icon />
            </div>
            <h2>{title}</h2>
            <p>{desc}</p>
          </button>
        ))}
      </div>

      <footer className="credits">
        <p>
          <strong>Privacy First:</strong> All processing happens in your browser. No files are uploaded to any server. No cookies, no tracking.
        </p>
        <p className="footer-links">
          <button className="link-btn" onClick={() => onSelectFeature('license')}>LICENSE, NO WARRANTY AND LIABILITY LIMITATION</button>
          {" - "}
          <a href="https://github.com/pwasuite/pdftools" target="_blank" rel="noopener noreferrer">Open Source (on GitHub)</a>
          {" - "}
          <button className="link-btn" onClick={() => onSelectFeature('credits')}>Credits and Special Thanks</button>
        </p>
        <p className="footer-links">
          <a href="https://pdf.pwasuite.com/" target="_blank" rel="noopener noreferrer">PDF Tools</a>
          {" by "}
          <a href="https://pwasuite.com/" target="_blank" rel="noopener noreferrer">PWA Suite</a>
        </p>
      </footer>
    </div>
  );
}

// ============ COMPRESS PAGE ============
function CompressPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(2);
  const [status, setStatus] = useState('idle'); // idle, processing, done, error
  const [result, setResult] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus('idle');
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const response = await compressPDF(file, quality);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        // Convert array back to Uint8Array and create blob
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file.name.replace('.pdf', '-compressed.pdf'),
          size: data.length
        });
        setStatus('done');
      } else {
        throw new Error('No output received');
      }
    } catch (error) {
      console.error('Compression error:', error);
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="feature-page compress-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1><CompressIcon /> Compress PDF</h1>
      </header>

      <div className="page-content">
        {status === 'idle' && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label="Drop PDF to compress" />
        )}

        {file && status !== 'done' && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <QualitySlider value={quality} onChange={setQuality} disabled={status === 'processing'} />

            <button
              className="action-btn primary"
              onClick={handleCompress}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <>
                  <span className="spinner"></span>
                  Compressing...
                </>
              ) : (
                '🚀 Compress PDF'
              )}
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>✅ Compression Complete!</h3>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">Original</span>
                  <span className="value">{(originalSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">Compressed</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-item savings">
                  <span className="label">Saved</span>
                  <span className="value">{Math.round((1 - result.size / originalSize) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                📥 Download {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                🔄 Compress Another
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="result-section">
            <div className="result-card error">
              <h3>❌ Compression Failed</h3>
              <p>An error occurred during compression. Please try again.</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MERGE PAGE ============
function MergePage({ onBack }) {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(2);
  const [enableCompression, setEnableCompression] = useState(true);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleAddFiles = (newFiles) => {
    const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
    setFiles(prev => [...prev, ...filesToAdd.map(f => ({
      file: f,
      id: Date.now() + Math.random()
    }))]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === files.length - 1)) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + direction]] = [newFiles[index + direction], newFiles[index]];
    setFiles(newFiles);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, draggedItem);
    setFiles(newFiles);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setStatus('processing');
    try {
      const response = await mergePDFs(files, enableCompression, quality);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // 1. Generate Timestamp Suffix
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

        // 2. Identify Common Prefix
        const filenames = files.map(f => f.file.name);
        let prefix = filenames[0];
        // Find common prefix
        for (let i = 1; i < filenames.length; i++) {
          while (filenames[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            if (prefix === '') break;
          }
        }

        // Validate prefix (letters, numbers, underscores only)
        let finalPrefix = '';
        if (prefix && /^[a-zA-Z0-9_]+$/.test(prefix)) {
          finalPrefix = prefix;
        }

        // Construct Filename
        // Logic: [Prefix]-[merge]_[Timestamp].pdf
        let baseName = 'merge';
        if (finalPrefix) {
          baseName = `${finalPrefix}-${baseName}`;
        }
        const finalName = `${baseName}_${timestamp}.pdf`;

        setResult({
          url,
          name: finalName,
          size: data.length
        });
        setStatus('done');
      } else {
        throw new Error('No output received');
      }
    } catch (error) {
      console.error('Merge error:', error);
      setStatus('error');
    }
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFiles([]);
    setStatus('idle');
    setResult(null);
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="feature-page merge-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1><MergeIcon /> Merge PDFs</h1>
      </header>

      <div className="page-content">
        {status !== 'done' && (
          <>
            <FileDropZone
              onFileSelect={handleAddFiles}
              multiple={true}
              label={files.length === 0 ? "Drop PDFs to merge" : "Drop more PDFs to add"}
            />

            {files.length > 0 && (
              <div className="files-list">
                <h3>Files to merge ({files.length})</h3>
                <p className="list-hint">Drag to reorder or use arrows</p>
                <ul>
                  {files.map((f, index) => (
                    <li
                      key={f.id}
                      className={`file-item ${dragIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="drag-handle">⋮⋮</span>
                      <span className="file-order">{index + 1}</span>
                      <span className="file-icon"><PdfIcon /></span>
                      <span className="filename">{f.file.name}</span>
                      <span className="filesize">({(f.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <div className="file-actions">
                        <button onClick={() => moveFile(index, -1)} disabled={index === 0}>↑</button>
                        <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>↓</button>
                        <button onClick={() => removeFile(f.id)} className="delete-btn"><TrashIcon /></button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="total-size">
                  Total: {(totalSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}

            {files.length >= 2 && (
              <div className="merge-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={enableCompression}
                    onChange={(e) => setEnableCompression(e.target.checked)}
                    disabled={status === 'processing'}
                  />
                  <span>Enable compression</span>
                </label>

                {enableCompression && (
                  <QualitySlider value={quality} onChange={setQuality} disabled={status === 'processing'} />
                )}

                <button
                  className="action-btn primary"
                  onClick={handleMerge}
                  disabled={status === 'processing'}
                >
                  {status === 'processing' ? (
                    <>
                      <span className="spinner"></span>
                      Merging...
                    </>
                  ) : (
                    `🔗 Merge ${files.length} PDFs`
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {status === 'done' && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>✅ Merge Complete!</h3>
              <p>Successfully merged {files.length} files</p>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">Combined Input</span>
                  <span className="value">{(totalSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">Output</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                📥 Download {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                🔄 Merge More Files
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="result-section">
            <div className="result-card error">
              <h3>❌ Merge Failed</h3>
              <p>An error occurred during merging. Please try again.</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SPLIT PAGE ============
function SplitPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus('idle');
    setResult(null);
  };

  const handleSplit = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const response = await splitPDF(file);

      if (response.outputs && response.outputs.length > 0) {
        // Convert each page's data array to Uint8Array and create blob URLs
        const pages = response.outputs.map(output => {
          const data = new Uint8Array(output.data);
          const blob = new Blob([data], { type: 'application/pdf' });
          return {
            name: output.name,
            data: data,
            url: URL.createObjectURL(blob)
          };
        });
        setResult({
          pages,
          pageCount: pages.length,
          originalName: file.name.replace('.pdf', '')
        });
        setStatus('done');
      } else {
        throw new Error('No output received');
      }
    } catch (error) {
      console.error('Split error:', error);
      setStatus('error');
    }
  };

  const getPageSuffix = (index, total) => {
    const pageNum = index + 1;
    const width = String(total).length;
    return `-p${String(pageNum).padStart(width, '0')}`;
  };

  const downloadSinglePage = (page, index) => {
    const link = document.createElement('a');
    link.href = page.url;
    const suffix = getPageSuffix(index, result.pageCount);
    link.download = `${result.originalName}${suffix}.pdf`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();

    result.pages.forEach((page, index) => {
      const suffix = getPageSuffix(index, result.pageCount);
      const filename = `${result.originalName}${suffix}.pdf`;
      zip.file(filename, page.data);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.originalName}_pages.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="feature-page split-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1><SplitIcon /> Split PDF</h1>
      </header>

      <div className="page-content">
        {status === 'idle' && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label="Drop PDF to split into pages" />
        )}

        {file && status !== 'done' && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <p className="split-info">
              Each page will be extracted as a separate PDF file.
              You can download them individually or as a ZIP archive.
            </p>

            <button
              className="action-btn primary"
              onClick={handleSplit}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <>
                  <span className="spinner"></span>
                  Splitting...
                </>
              ) : (
                '✂️ Split PDF'
              )}
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>✅ Split Complete!</h3>
              <p>Extracted {result.pageCount} pages</p>
            </div>

            <div className="split-results">
              <button className="action-btn primary download-zip" onClick={downloadAllAsZip}>
                📦 Download All as ZIP
              </button>

              <div className="pages-grid">
                {result.pages.map((page, index) => (
                  <div key={index} className="page-item">
                    <div className="page-preview">
                      <PdfIcon />
                      <span>Page {index + 1}</span>
                    </div>
                    <button
                      className="page-download"
                      onClick={() => downloadSinglePage(page, index)}
                    >
                      📥
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="action-btn secondary" onClick={reset}>
              🔄 Split Another PDF
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="result-section">
            <div className="result-card error">
              <h3>❌ Split Failed</h3>
              <p>An error occurred during splitting. Please try again.</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function ExtractPagesPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus('idle');
    setResult(null);
    setFirstPage(1);
    setLastPage(1);
  };

  const handleExtract = async () => {
    if (!file || firstPage < 1 || lastPage < firstPage) return;

    setStatus('processing');
    try {
      const response = await extractPages(file, firstPage, lastPage);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const rangeStr = firstPage === lastPage
          ? `page_${firstPage}`
          : `pages_${firstPage}-${lastPage}`;

        setResult({
          url,
          name: `${file.name.replace('.pdf', '')}_${rangeStr}.pdf`,
          size: data.length,
          pageCount: lastPage - firstPage + 1
        });
        setStatus('done');
      } else {
        throw new Error('No output received');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setFirstPage(1);
    setLastPage(1);
  };

  return (
    <div className="feature-page extract-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1><ExtractIcon /> Extract Pages</h1>
      </header>

      <div className="page-content">
        {status === 'idle' && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label="Drop PDF to extract pages from" />
        )}

        {file && status !== 'done' && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <div className="page-range">
              <label>Page Range</label>
              <div className="range-inputs">
                <div className="range-input">
                  <span>From page:</span>
                  <input
                    type="number"
                    min="1"
                    value={firstPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFirstPage(val);
                      if (val > lastPage) setLastPage(val);
                    }}
                    disabled={status === 'processing'}
                  />
                </div>
                <div className="range-input">
                  <span>To page:</span>
                  <input
                    type="number"
                    min={firstPage}
                    value={lastPage}
                    onChange={(e) => setLastPage(parseInt(e.target.value) || firstPage)}
                    disabled={status === 'processing'}
                  />
                </div>
              </div>
              <p className="range-hint">
                Will extract {lastPage - firstPage + 1} page{lastPage !== firstPage ? 's' : ''}
              </p>
            </div>

            <button
              className="action-btn primary"
              onClick={handleExtract}
              disabled={status === 'processing' || firstPage < 1 || lastPage < firstPage}
            >
              {status === 'processing' ? (
                <>
                  <span className="spinner"></span>
                  Extracting...
                </>
              ) : (
                '📄 Extract Pages'
              )}
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>✅ Extraction Complete!</h3>
              <p>Extracted {result.pageCount} page{result.pageCount !== 1 ? 's' : ''}</p>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">Original</span>
                  <span className="value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">Extracted</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                📥 Download {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                🔄 Extract From Another PDF
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="result-section">
            <div className="result-card error">
              <h3>❌ Extraction Failed</h3>
              <p>An error occurred during extraction. Make sure page numbers are valid.</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ GRAYSCALE PAGE ============
function GrayscalePage({ onBack }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus('idle');
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const response = await grayscalePDF(file);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        setResult({
          url,
          name: `${file.name.replace('.pdf', '')}_gray.pdf`,
          size: data.length
        });
        setStatus('done');
      } else {
        throw new Error('No output received');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="feature-page grayscale-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1><GrayscaleIcon /> Grayscale PDF</h1>
      </header>

      <div className="page-content">
        {status === 'idle' && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label="Drop PDF to convert to grayscale" />
        )}

        {file && status !== 'done' && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <div className="info-box">
              <p>ℹ️ Converts all colors to shades of gray. Useful for printing or reducing file size.</p>
            </div>

            <button
              className="action-btn primary"
              onClick={handleConvert}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <>
                  <span className="spinner"></span>
                  Converting...
                </>
              ) : (
                '💧 Convert to Grayscale'
              )}
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>✅ Conversion Complete!</h3>
              <p>Your PDF is now in black & white.</p>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">Original</span>
                  <span className="value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">Grayscale</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                📥 Download {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                🔄 Convert Another PDF
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="result-section">
            <div className="result-card error">
              <h3>❌ Conversion Failed</h3>
              <p>An error occurred during conversion. Please try again.</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ RESIZE PAGE ============
function ResizePage({ onBack }) {
  const [file, setFile] = useState(null);
  const [paperSize, setPaperSize] = useState('a4');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus('idle');
    setResult(null);
  };

  const handleResize = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const response = await resizePDF(file, paperSize);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        setResult({
          url,
          name: `${file.name.replace('.pdf', '')}_${paperSize}.pdf`,
          size: data.length
        });
        setStatus('done');
      } else {
        throw new Error('No output received');
      }
    } catch (error) {
      console.error('Resize error:', error);
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
  };

  const paperSizes = [
    { value: 'a4', label: 'A4 (210 x 297 mm)' },
    { value: 'letter', label: 'Letter (8.5 x 11 in)' },
    { value: 'legal', label: 'Legal (8.5 x 14 in)' },
    { value: 'a3', label: 'A3 (297 x 420 mm)' },
    { value: 'ledger', label: 'Ledger (11 x 17 in)' },
    { value: '11x17', label: '11x17 (11 x 17 in)' },
    { value: 'a5', label: 'A5 (148 x 210 mm)' },
    { value: 'a6', label: 'A6 (105 x 148 mm)' },
  ];

  return (
    <div className="feature-page resize-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1><ResizeIcon /> Resize PDF</h1>
      </header>

      <div className="page-content">
        {status === 'idle' && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label="Drop PDF to resize" />
        )}

        {file && status !== 'done' && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <div className="resize-options">
              <label>Target Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                disabled={status === 'processing'}
                className="paper-select"
              >
                {paperSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              <p className="range-hint">
                Pages will be scaled to fit the selected size.
              </p>
              <p className="warning-hint">
                ⚠️ This feature does not work with all files. Please double check the result.
              </p>
            </div>

            <button
              className="action-btn primary"
              onClick={handleResize}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <>
                  <span className="spinner"></span>
                  Resizing...
                </>
              ) : (
                '📏 Resize PDF'
              )}
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>✅ Resize Complete!</h3>
              <p>Your PDF has been resized to {paperSize.toUpperCase()}.</p>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">Original</span>
                  <span className="value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">Resized</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                📥 Download {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                🔄 Resize Another PDF
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="result-section">
            <div className="result-card error">
              <h3>❌ Resize Failed</h3>
              <p>An error occurred during resizing. Please try again.</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ CREDITS PAGE ============
function CreditsPage({ onBack }) {
  return (
    <div className="feature-page credits-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1>❤️ Credits and Special Thanks</h1>
      </header>

      <div className="page-content">
        <div className="credits-section">
          <h2>Core Technology</h2>
          <div className="credit-card">
            <h3>Ghostscript</h3>
            <p>This application is powered by <a href="https://ghostscript.com/" target="_blank" rel="noopener noreferrer">Ghostscript</a>, a powerful interpreter for PostScript and PDF files.</p>
          </div>
          <div className="credit-card">
            <h3>WASM Port</h3>
            <p>WASM compilation and port by <a href="https://github.com/ochachacha/ps-wasm" target="_blank" rel="noopener noreferrer">@ochachacha</a></p>
          </div>
          <div className="credit-card">
            <h3>Original Project</h3>
            <p>Based on <a href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm" target="_blank" rel="noopener noreferrer">ghostscript-pdf-compress.wasm</a> by Laurent Meyer</p>
          </div>
        </div>

        <div className="credits-section">
          <h2>Thank Him For Everything!</h2>
          <p className="dependencies-note">
            You may use this software with your own beliefs but I don't believe in atheism. <a href="https://www.biblegateway.com/passage/?search=1%20Thessalonians%205%3A18%2CExodus%2031%3A1-5&version=NKJV" target="_blank" rel="noopener noreferrer">Special thanks</a> to God.
          </p>
        </div>

        <div className="credits-section">
          <h2>Built With</h2>
          <div className="credit-card tech-stack">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <div>
                <h4><a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a></h4>
                <p>UI library for building the interface</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">⚡</span>
              <div>
                <h4><a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite</a></h4>
                <p>Fast build tool and dev server</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">📦</span>
              <div>
                <h4><a href="https://stuk.github.io/jszip/" target="_blank" rel="noopener noreferrer">JSZip</a></h4>
                <p>Library for managing ZIP files in the browser</p>
              </div>
            </div>
          </div>
        </div>

        <div className="credits-section">
          <h2>Dependencies</h2>
          <p className="dependencies-note">
            Uses various dependencies including JSZip to manage ZIP files in the browser, enabling bulk downloads of split PDF pages.
          </p>
        </div>

        <div className="credits-section">
          <h2>AI Tools</h2>
          <p className="dependencies-note">
            Tools such as Google Antigravity and models such as Gemini and Anthropic Claude Opus have been used extensively to increase productivity on this project.
            <br /><br />
            <strong>Note:</strong> Using this website does NOT involve using any AI tools. All processing is done locally on your device and your information stays in your browser.
          </p>
        </div>

        <div className="credits-section">
          <h2>Open Source</h2>
          <p>
            This project is open source. View the source code, report issues, or contribute on{' '}
            <a href="https://github.com/pwasuite/pdftools" target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ LICENSE PAGE ============
function LicensePage({ onBack }) {
  const licenseText = `GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Preamble

The GNU Affero General Public License is a free, copyleft license for
software and other kinds of works, specifically designed to ensure
cooperation with the community in the case of network server software.

The licenses for most software and other practical works are designed
to take away your freedom to share and change the works.  By contrast,
our General Public Licenses are intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users.

When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
them if you wish), that you receive source code or can get it if you
want it, that you can change the software or use pieces of it in new
free programs, and that you know you can do these things.

Developers that use our General Public Licenses protect your rights
with two steps: (1) assert copyright on the software, and (2) offer
you this License which gives you legal permission to copy, distribute
and/or modify the software.

A secondary benefit of defending all users' freedom is that
improvements made in alternate versions of the program, if they
receive widespread use, become available for other developers to
incorporate.  Many developers of free software are heartened and
encouraged by the resulting cooperation.  However, in the case of
software used on network servers, this result may fail to come about.
The GNU General Public License permits making a modified version and
letting the public access it on a server without ever releasing its
source code to the public.

The GNU Affero General Public License is designed specifically to
ensure that, in such cases, the modified source code becomes available
to the community.  It requires the operator of a network server to
provide the source code of the modified version running there to the
users of that server.  Therefore, public use of a modified version, on
a publicly accessible server, gives the public access to the source
code of the modified version.

An older license, called the Affero General Public License and
published by Affero, was designed to accomplish similar goals.  This is
a different license, not a version of the Affero GPL, but Affero has
released a new version of the Affero GPL which permits relicensing under
this license.

The precise terms and conditions for copying, distribution and
modification follow.

TERMS AND CONDITIONS

0. Definitions.

"This License" refers to version 3 of the GNU Affero General Public License.

"Copyright" also means copyright-like laws that apply to other kinds of
works, such as semiconductor masks.

"The Program" refers to any copyrightable work licensed under this
License.  Each licensee is addressed as "you".  "Licensees" and
"recipients" may be individuals or organizations.

To "modify" a work means to copy from or adapt all or part of the work
in a fashion requiring copyright permission, other than the making of an
exact copy.  The resulting work is called a "modified version" of the
earlier work or a work "based on" the earlier work.

A "covered work" means either the unmodified Program or a work based
on the Program.

To "propagate" a work means to do anything with it that, without
permission, would make you directly or secondarily liable for
infringement under applicable copyright law, except executing it on a
computer or modifying a private copy.  Propagation includes copying,
distribution (with or without modification), making available to the
public, and in some countries other activities as well.

To "convey" a work means any kind of propagation that enables other
parties to make or receive copies.  Mere interaction with a user through
a computer network, with no transfer of a copy, is not conveying.

An interactive user interface displays "Appropriate Legal Notices"
to the extent that it includes a convenient and prominently visible
feature that (1) displays an appropriate copyright notice, and (2)
tells the user that there is no warranty for the work (except to the
extent that warranties are provided), that licensees may convey the
work under this License, and how to view a copy of this License.  If
the interface presents a list of user commands or options, such as a
menu, a prominent item in the list meets this criterion.

1. Source Code.

The "source code" for a work means the preferred form of the work
for making modifications to it.  "Object code" means any non-source
form of a work.

A "Standard Interface" means an interface that either is an official
standard defined by a recognized standards body, or, in the case of
interfaces specified for a particular programming language, one that
is widely used among developers working in that language.

The "System Libraries" of an executable work include anything, other
than the work as a whole, that (a) is included in the normal form of
packaging a Major Component, but which is not part of that Major
Component, and (b) serves only to enable use of the work with that
Major Component, or to implement a Standard Interface for which an
implementation is available to the public in source code form.  A
"Major Component", in this context, means a major essential component
(kernel, window system, and so on) of the specific operating system
(if any) on which the executable work runs, or a compiler used to
produce the work, or an object code interpreter used to run it.

The "Corresponding Source" for a work in object code form means all
the source code needed to generate, install, and (for an executable
work) run the object code and to modify the work, including scripts to
control those activities.  However, it does not include the work's
System Libraries, or general-purpose tools or generally available free
programs which are used unmodified in performing those activities but
which are not part of the work.  For example, Corresponding Source
includes interface definition files associated with source files for
the work, and the source code for shared libraries and dynamically
linked subprograms that the work is specifically designed to require,
such as by intimate data communication or control flow between those
subprograms and other parts of the work.

The Corresponding Source need not include anything that users
can regenerate automatically from other parts of the Corresponding
Source.

The Corresponding Source for a work in source code form is that
same work.

2. Basic Permissions.

All rights granted under this License are granted for the term of
copyright on the Program, and are irrevocable provided the stated
conditions are met.  This License explicitly affirms your unlimited
permission to run the unmodified Program.  The output from running a
covered work is covered by this License only if the output, given its
content, constitutes a covered work.  This License acknowledges your
rights of fair use or other equivalent, as provided by copyright law.

You may make, run and propagate covered works that you do not
convey, without conditions so long as your license otherwise remains
in force.  You may convey covered works to others for the sole purpose
of having them make modifications exclusively for you, or provide you
with facilities for running those works, provided that you comply with
the terms of this License in conveying all material for which you do
not control copyright.  Those thus making or running the covered works
for you must do so exclusively on your behalf, under your direction
and control, on terms that prohibit them from making any copies of
your copyrighted material outside their relationship with you.

Conveying under any other circumstances is permitted solely under
the conditions stated below.  Sublicensing is not allowed; section 10
makes it unnecessary.

3. Protecting Users' Legal Rights From Anti-Circumvention Law.

No covered work shall be deemed part of an effective technological
measure under any applicable law fulfilling obligations under article
11 of the WIPO copyright treaty adopted on 20 December 1996, or
similar laws prohibiting or restricting circumvention of such
measures.

When you convey a covered work, you waive any legal power to forbid
circumvention of technological measures to the extent such circumvention
is effected by exercising rights under this License with respect to
the covered work, and you disclaim any intention to limit operation or
modification of the work as a means of enforcing, against the work's
users, your or third parties' legal rights to forbid circumvention of
technological measures.

4. Conveying Verbatim Copies.

You may convey verbatim copies of the Program's source code as you
receive it, in any medium, provided that you conspicuously and
appropriately publish on each copy an appropriate copyright notice;
keep intact all notices stating that this License and any
non-permissive terms added in accord with section 7 apply to the code;
keep intact all notices of the absence of any warranty; and give all
recipients a copy of this License along with the Program.

You may charge any price or no price for each copy that you convey,
and you may offer support or warranty protection for a fee.

5. Conveying Modified Source Versions.

You may convey a work based on the Program, or the modifications to
produce it from the Program, in the form of source code under the
terms of section 4, provided that you also meet all of these conditions:

  a) The work must carry prominent notices stating that you modified
  it, and giving a relevant date.

  b) The work must carry prominent notices stating that it is
  released under this License and any conditions added under section
  7.  This requirement modifies the requirement in section 4 to
  "keep intact all notices".

  c) You must license the entire work, as a whole, under this
  License to anyone who comes into possession of a copy.  This
  License will therefore apply, along with any applicable section 7
  additional terms, to the whole of the work, and all its parts,
  regardless of how they are packaged.  This License gives no
  permission to license the work in any other way, but it does not
  invalidate such permission if you have separately received it.

  d) If the work has interactive user interfaces, each must display
  Appropriate Legal Notices; however, if the Program has interactive
  interfaces that do not display Appropriate Legal Notices, your
  work need not make them do so.

A compilation of a covered work with other separate and independent
works, which are not by their nature extensions of the covered work,
and which are not combined with it such as to form a larger program,
in or on a volume of a storage or distribution medium, is called an
"aggregate" if the compilation and its resulting copyright are not
used to limit the access or legal rights of the compilation's users
beyond what the individual works permit.  Inclusion of a covered work
in an aggregate does not cause this License to apply to the other
parts of the aggregate.

6. Conveying Non-Source Forms.

You may convey a covered work in object code form under the terms
of sections 4 and 5, provided that you also convey the
machine-readable Corresponding Source under the terms of this License,
in one of these ways:

  a) Convey the object code in, or embodied in, a physical product
  (including a physical distribution medium), accompanied by the
  Corresponding Source fixed on a durable physical medium
  customarily used for software interchange.

  b) Convey the object code in, or embodied in, a physical product
  (including a physical distribution medium), accompanied by a
  written offer, valid for at least three years and valid for as
  long as you offer spare parts or customer support for that product
  model, to give anyone who possesses the object code either (1) a
  copy of the Corresponding Source for all the software in the
  product that is covered by this License, on a durable physical
  medium customarily used for software interchange, for a price no
  more than your reasonable cost of physically performing this
  conveying of source, or (2) access to copy the
  Corresponding Source from a network server at no charge.

  c) Convey individual copies of the object code with a copy of the
  written offer to provide the Corresponding Source.  This
  alternative is allowed only occasionally and noncommercially, and
  only if you received the object code with such an offer, in accord
  with subsection 6b.

  d) Convey the object code by offering access from a designated
  place (gratis or for a charge), and offer equivalent access to the
  Corresponding Source in the same way through the same place at no
  further charge.  You need not require recipients to copy the
  Corresponding Source along with the object code.  If the place to
  copy the object code is a network server, the Corresponding Source
  may be on a different server (operated by you or a third party)
  that supports equivalent copying facilities, provided you maintain
  clear directions next to the object code saying where to find the
  Corresponding Source.  Regardless of what server hosts the
  Corresponding Source, you remain obligated to ensure that it is
  available for as long as needed to satisfy these requirements.

  e) Convey the object code using peer-to-peer transmission, provided
  you inform other peers where the object code and Corresponding
  Source of the work are being offered to the general public at no
  charge under subsection 6d.

A separable portion of the object code, whose source code is excluded
from the Corresponding Source as a System Library, need not be
included in conveying the object code work.

A "User Product" is either (1) a "consumer product", which means any
tangible personal property which is normally used for personal, family,
or household purposes, or (2) anything designed or sold for incorporation
into a dwelling.  In determining whether a product is a consumer product,
doubtful cases shall be resolved in favor of coverage.  For a particular
product received by a particular user, "normally used" refers to a
typical or common use of that class of product, regardless of the status
of the particular user or of the way in which the particular user
actually uses, or expects or is expected to use, the product.  A product
is a consumer product regardless of whether the product has substantial
commercial, industrial or non-consumer uses, unless such uses represent
the only significant mode of use of the product.

"Installation Information" for a User Product means any methods,
procedures, authorization keys, or other information required to install
and execute modified versions of a covered work in that User Product from
a modified version of its Corresponding Source.  The information must
suffice to ensure that the continued functioning of the modified object
code is in no case prevented or interfered with solely because
modification has been made.

If you convey an object code work under this section in, or with, or
specifically for use in, a User Product, and the conveying occurs as
part of a transaction in which the right of possession and use of the
User Product is transferred to the recipient in perpetuity or for a
fixed term (regardless of how the transaction is characterized), the
Corresponding Source conveyed under this section must be accompanied
by the Installation Information.  But this requirement does not apply
if neither you nor any third party retains the ability to install
modified object code on the User Product (for example, the work has
been installed in ROM).

The requirement to provide Installation Information does not include a
requirement to continue to provide support service, warranty, or updates
for a work that has been modified or installed by the recipient, or for
the User Product in which it has been modified or installed.  Access to a
network may be denied when the modification itself materially and
adversely affects the operation of the network or violates the rules and
protocols for communication across the network.

Corresponding Source conveyed, and Installation Information provided,
in accord with this section must be in a format that is publicly
documented (and with an implementation available to the public in
source code form), and must require no special password or key for
unpacking, reading or copying.

7. Additional Terms.

"Additional permissions" are terms that supplement the terms of this
License by making exceptions from one or more of its conditions.
Additional permissions that are applicable to the entire Program shall
be treated as though they were included in this License, to the extent
that they are valid under applicable law.  If additional permissions
apply only to part of the Program, that part may be used separately
under those permissions, but the entire Program remains governed by
this License without regard to the additional permissions.

When you convey a copy of a covered work, you may at your option
remove any additional permissions from that copy, or from any part of
it.  (Additional permissions may be written to require their own
removal in certain cases when you modify the work.)  You may place
additional permissions on material, added by you to a covered work,
for which you have or can give appropriate copyright permission.

Notwithstanding any other provision of this License, for material you
add to a covered work, you may (if authorized by the copyright holders of
that material) supplement the terms of this License with terms:

  a) Disclaiming warranty or limiting liability differently from the
  terms of sections 15 and 16 of this License; or

  b) Requiring preservation of specified reasonable legal notices or
  author attributions in that material or in the Appropriate Legal
  Notices displayed by works containing it; or

  c) Prohibiting misrepresentation of the origin of that material, or
  requiring that modified versions of such material be marked in
  reasonable ways as different from the original version; or

  d) Limiting the use for publicity purposes of names of licensors or
  authors of the material; or

  e) Declining to grant rights under trademark law for use of some
  trade names, trademarks, or service marks; or

  f) Requiring indemnification of licensors and authors of that
  material by anyone who conveys the material (or modified versions of
  it) with contractual assumptions of liability to the recipient, for
  any liability that these contractual assumptions directly impose on
  those licensors and authors.

All other non-permissive additional terms are considered "further
restrictions" within the meaning of section 10.  If the Program as you
received it, or any part of it, contains a notice stating that it is
governed by this License along with a term that is a further
restriction, you may remove that term.  If a license document contains
a further restriction but permits relicensing or conveying under this
License, you may add to a covered work material governed by the terms
of that license document, provided that the further restriction does
not survive such relicensing or conveying.

If you add terms to a covered work in accord with this section, you
must place, in the relevant source files, a statement of the
additional terms that apply to those files, or a notice indicating
where to find the applicable terms.

Additional terms, permissive or non-permissive, may be stated in the
form of a separately written license, or stated as exceptions;
the above requirements apply either way.

8. Termination.

You may not propagate or modify a covered work except as expressly
provided under this License.  Any attempt otherwise to propagate or
modify it is void, and will automatically terminate your rights under
this License (including any patent licenses granted under the third
paragraph of section 11).

However, if you cease all violation of this License, then your
license from a particular copyright holder is reinstated (a)
provisionally, unless and until the copyright holder explicitly and
finally terminates your license, and (b) permanently, if the copyright
holder fails to notify you of the violation by some reasonable means
prior to 60 days after the cessation.

Moreover, your license from a particular copyright holder is
reinstated permanently if the copyright holder notifies you of the
violation by some reasonable means, this is the first time you have
received notice of violation of this License (for any work) from that
copyright holder, and you cure the violation prior to 30 days after
your receipt of the notice.

Termination of your rights under this section does not terminate the
licenses of parties who have received copies or rights from you under
this License.  If your rights have been terminated and not permanently
reinstated, you do not qualify to receive new licenses for the same
material under section 10.

9. Acceptance Not Required for Having Copies.

You are not required to accept this License in order to receive or
run a copy of the Program.  Ancillary propagation of a covered work
occurring solely as a consequence of using peer-to-peer transmission
to receive a copy likewise does not require acceptance.  However,
nothing other than this License grants you permission to propagate or
modify any covered work.  These actions infringe copyright if you do
not accept this License.  Therefore, by modifying or propagating a
covered work, you indicate your acceptance of this License to do so.

10. Automatic Licensing of Downstream Recipients.

Each time you convey a covered work, the recipient automatically
receives a license from the original licensors, to run, modify and
propagate that work, subject to this License.  You are not responsible
for enforcing compliance by third parties with this License.

An "entity transaction" is a transaction transferring control of an
organization, or substantially all assets of one, or subdividing an
organization, or merging organizations.  If propagation of a covered
work results from an entity transaction, each party to that
transaction who receives a copy of the work also receives whatever
licenses to the work the party's predecessor in interest had or could
give under the previous paragraph, plus a right to possession of the
Corresponding Source of the work from the predecessor in interest, if
the predecessor has it or can get it with reasonable efforts.

You may not impose any further restrictions on the exercise of the
rights granted or affirmed under this License.  For example, you may
not impose a license fee, royalty, or other charge for exercise of
rights granted under this License, and you may not initiate litigation
(including a cross-claim or counterclaim in a lawsuit) alleging that
any patent claim is infringed by making, using, selling, offering for
sale, or importing the Program or any portion of it.

11. Patents.

A "contributor" is a copyright holder who authorizes use under this
License of the Program or a work on which the Program is based.  The
work thus licensed is called the contributor's "contributor version".

A contributor's "essential patent claims" are all patent claims
owned or controlled by the contributor, whether already acquired or
hereafter acquired, that would be infringed by some manner, permitted
by this License, of making, using, or selling its contributor version,
but do not include claims that would be infringed only as a
consequence of further modification of the contributor version.  For
purposes of this definition, "control" includes the right to grant
patent sublicenses in a manner consistent with the requirements of
this License.

Each contributor grants you a non-exclusive, worldwide, royalty-free
patent license under the contributor's essential patent claims, to
make, use, sell, offer for sale, import and otherwise run, modify and
propagate the contents of its contributor version.

In the following three paragraphs, a "patent license" is any express
agreement or commitment, however denominated, not to enforce a patent
(such as an express permission to practice a patent or covenant not to
sue for patent infringement).  To "grant" such a patent license to a
party means to make such an agreement or commitment not to enforce a
patent against the party.

If you convey a covered work, knowingly relying on a patent license,
and the Corresponding Source of the work is not available for anyone
to copy, free of charge and under the terms of this License, through a
publicly available network server or other readily accessible means,
then you must either (1) cause the Corresponding Source to be so
available, or (2) arrange to deprive yourself of the benefit of the
patent license for this particular work, or (3) arrange, in a manner
consistent with the requirements of this License, to extend the patent
license to downstream recipients.  "Knowingly relying" means you have
actual knowledge that, but for the patent license, your conveying the
covered work in a country, or your recipient's use of the covered work
in a country, would infringe one or more identifiable patents in that
country that you have reason to believe are valid.

If, pursuant to or in connection with a single transaction or
arrangement, you convey, or propagate by procuring conveyance of, a
covered work, and grant a patent license to some of the parties
receiving the covered work authorizing them to use, propagate, modify
or convey a specific copy of the covered work, then the patent license
you grant is automatically extended to all recipients of the covered
work and works based on it.

A patent license is "discriminatory" if it does not include within
the scope of its coverage, prohibits the exercise of, or is
conditioned on the non-exercise of one or more of the rights that are
specifically granted under this License.  You may not convey a covered
work if you are a party to an arrangement with a third party that is
in the business of distributing software, under which you make payment
to the third party based on the extent of your activity of conveying
the work, and under which the third party grants, to any of the
parties who would receive the covered work from you, a discriminatory
patent license (a) in connection with copies of the covered work
conveyed by you (or copies made from those copies), or (b) primarily
for and in connection with specific products or compilations that
contain the covered work, unless you entered into that arrangement,
or that patent license was granted, prior to 28 March 2007.

Nothing in this License shall be construed as excluding or limiting
any implied license or other defenses to infringement that may
otherwise be available to you under applicable patent law.

12. No Surrender of Others' Freedom.

If conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot convey a
covered work so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you may
not convey it at all.  For example, if you agree to terms that obligate you
to collect a royalty for further conveying from those to whom you convey
the Program, the only way you could satisfy both those terms and this
License would be to refrain entirely from conveying the Program.

13. Remote Network Interaction; Use with the GNU General Public License.

Notwithstanding any other provision of this License, if you modify the
Program, your modified version must prominently offer all users
interacting with it remotely through a computer network (if your version
supports such interaction) an opportunity to receive the Corresponding
Source of your version by providing access to the Corresponding Source
from a network server at no charge, through some standard or customary
means of facilitating copying of software.  This Corresponding Source
shall include the Corresponding Source for any work covered by version 3
of the GNU General Public License that is incorporated pursuant to the
following paragraph.

Notwithstanding any other provision of this License, you have
permission to link or combine any covered work with a work licensed
under version 3 of the GNU General Public License into a single
combined work, and to convey the resulting work.  The terms of this
License will continue to apply to the part which is the covered work,
but the work with which it is combined will remain governed by version
3 of the GNU General Public License.

14. Revised Versions of this License.

The Free Software Foundation may publish revised and/or new versions of
the GNU Affero General Public License from time to time.  Such new versions
will be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

Each version is given a distinguishing version number.  If the
Program specifies that a certain numbered version of the GNU Affero General
Public License "or any later version" applies to it, you have the
option of following the terms and conditions either of that numbered
version or of any later version published by the Free Software
Foundation.  If the Program does not specify a version number of the
GNU Affero General Public License, you may choose any version ever published
by the Free Software Foundation.

If the Program specifies that a proxy can decide which future
versions of the GNU Affero General Public License can be used, that proxy's
public statement of acceptance of a version permanently authorizes you
to choose that version for the Program.

Later license versions may give you additional or different
permissions.  However, no additional obligations are imposed on any
author or copyright holder as a result of your choosing to follow a
later version.

15. Disclaimer of Warranty.

THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

16. Limitation of Liability.

IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS
THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY
GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE
USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF
DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD
PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS),
EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES.

17. Interpretation of Sections 15 and 16.

If the disclaimer of warranty and limitation of liability provided
above cannot be given local legal effect according to their terms,
reviewing courts shall apply local law that most closely approximates
an absolute waiver of all civil liability in connection with the
Program, unless a warranty or assumption of liability accompanies a
copy of the Program in return for a fee.

END OF TERMS AND CONDITIONS`;

  return (
    <div className="feature-page license-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1>📜 License</h1>
      </header>

      <div className="page-content">
        <div className="license-container">
          <pre>{licenseText}</pre>
        </div>
      </div>
    </div>
  );
}

// ============ APP ============
function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [theme, setTheme] = useState('dark');

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(THEMES[theme]);
  }, [theme]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'compress':
        return <CompressPage onBack={() => setCurrentPage('main')} />;
      case 'merge':
        return <MergePage onBack={() => setCurrentPage('main')} />;
      case 'split':
        return <SplitPage onBack={() => setCurrentPage('main')} />;
      case 'extractPages':
        return <ExtractPagesPage onBack={() => setCurrentPage('main')} />;
      case 'grayscale':
        return <GrayscalePage onBack={() => setCurrentPage('main')} />;
      case 'resize':
        return <ResizePage onBack={() => setCurrentPage('main')} />;
      case 'credits':
        return <CreditsPage onBack={() => setCurrentPage('main')} />;
      case 'license':
        return <LicensePage onBack={() => setCurrentPage('main')} />;
      default:
        return <MainPage onSelectFeature={setCurrentPage} currentTheme={theme} onThemeChange={handleThemeChange} />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;
