import { useState, useCallback, useEffect, useRef } from "react";
import JSZip from "jszip";
import {
  compressPDF,
  mergePDFs,
  splitPDF,
  extractPages,
  grayscalePDF,
  resizePDF,
} from "./lib/worker-init.js";
import { LANGUAGES, getTranslation, detectBrowserLanguage } from "./i18n.js";
import "./App.css";

// ============ THEMES ============
const THEMES = {
  dark: {
    id: "dark",
    name: "Dark",
    preview: "#1e1e1e",
    colors: {
      // Background colors - VS Code / Teams inspired
      "--bg-primary": "#1e1e1e",
      "--bg-secondary": "#252526",
      "--bg-tertiary": "#2d2d30",
      "--bg-card": "#252526",
      // Accent - professional blue (similar to VS Code/Teams)
      "--accent-primary": "#0078d4",
      "--accent-secondary": "#106ebe",
      "--accent-gradient": "#0078d4",
      "--accent-glow": "rgba(0, 120, 212, 0.15)",
      // Text colors - brighter for better contrast
      "--text-primary": "#e4e4e4",
      "--text-secondary": "#a0a0a0",
      "--text-muted": "#707070",
      // Feature colors - muted, professional
      "--compress-color": "#3c9a5f",
      "--merge-color": "#0078d4",
      "--split-color": "#c27c0e",
      // Borders
      "--border-color": "rgba(255, 255, 255, 0.1)",
    },
  },
  light: {
    id: "light",
    name: "Light",
    preview: "#ffffff",
    colors: {
      // Background colors - Office / Google Docs inspired
      "--bg-primary": "#f5f5f5",
      "--bg-secondary": "#ffffff",
      "--bg-tertiary": "#e8e8e8",
      "--bg-card": "#ffffff",
      // Accent - professional blue
      "--accent-primary": "#0078d4",
      "--accent-secondary": "#106ebe",
      "--accent-gradient": "#0078d4",
      "--accent-glow": "rgba(0, 120, 212, 0.1)",
      // Text colors
      "--text-primary": "#1f1f1f",
      "--text-secondary": "#616161",
      "--text-muted": "#8a8a8a",
      // Feature colors
      "--compress-color": "#107c41",
      "--merge-color": "#0078d4",
      "--split-color": "#a4630a",
      // Borders
      "--border-color": "rgba(0, 0, 0, 0.1)",
    },
  },
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
          className={`theme-dot ${currentTheme === theme.id ? "active" : ""}`}
          style={{ background: theme.preview }}
          onClick={() => onThemeChange(theme.id)}
          title={theme.name}
          aria-label={`Switch to ${theme.name} theme`}
        />
      ))}
    </div>
  );
}

// ============ LANGUAGE SELECTOR ============
function LanguageSelector({ currentLang, onLangChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (langCode) => {
    onLangChange(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".language-selector")) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  const currentLangData = LANGUAGES[currentLang] || LANGUAGES.en;
  const otherLang = currentLang === "en" ? "fr" : "en";

  return (
    <div className={`language-selector ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(!isOpen)}>
      <span className="lang-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l6 6M4 14h8M5.5 14l2-6h1l2 6" />
          <path d="M14 5h6M17 5v9M14 9h6" />
        </svg>
      </span>
      <span className="lang-text">
        {currentLang}/{otherLang}
      </span>
      <span className="lang-arrow">▼</span>

      {isOpen && (
        <div className="language-dropdown">
          {Object.values(LANGUAGES).map((lang) => (
            <div
              key={lang.code}
              className={`language-option ${currentLang === lang.code ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(lang.code);
              }}
            >
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ICONS ============
const CompressIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18M19 9l-7-6-7 6M5 15l7 6 7-6" />
  </svg>
);

const MergeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="8" y="14" width="8" height="7" rx="1" />
    <path d="M6.5 10v2.5a1 1 0 001 1h9a1 1 0 001-1V10" />
  </svg>
);

const SplitIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="3" width="8" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <path d="M12 10v2.5M8 14l-1.5-1.5M16 14l1.5-1.5" />
  </svg>
);

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
  </svg>
);

// New feature icons
const ImageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const JpegIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <path d="M14 3v4h4" />
  </svg>
);

const ExtractIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 15h6" />
    <path d="M12 12v6" />
  </svg>
);

const GrayscaleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M12 22.75V2.75" />
    <path d="M12 22.75A8 8 0 0 0 12 6.75" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

const ResizeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    <rect x="7" y="7" width="10" height="10" rx="1" />
  </svg>
);

// ============ QUALITY SLIDER ============
function QualitySlider({ value, onChange, disabled, lang }) {
  const t = getTranslation(lang);

  const QUALITY_LABELS = {
    1: { name: t("screen"), desc: t("screenDesc") },
    2: { name: t("ebook"), desc: t("ebookDesc") },
    3: { name: t("print"), desc: t("printDesc") },
    4: { name: t("prepress"), desc: t("prepressDesc") },
  };

  return (
    <div className={`quality-slider ${disabled ? "disabled" : ""}`}>
      <label>{t("compressionQuality")}</label>
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
          <span className={value === 1 ? "active" : ""}>{t("smallest")}</span>
          <span className={value === 4 ? "active" : ""}>{t("best")}</span>
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

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
      if (files.length > 0) {
        onFileSelect(multiple ? files : files[0]);
      }
    },
    [onFileSelect, multiple]
  );

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
    e.target.value = "";
  };

  return (
    <div
      className={`file-drop-zone ${isDragging ? "dragging" : ""}`}
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
function MainPage({ onSelectFeature, currentTheme, onThemeChange, lang, onLangChange }) {
  const t = getTranslation(lang);

  // Note: PNG/JPEG output devices are not available in this WASM build
  // Only pdfwrite device is supported
  const features = [
    { id: "compress", icon: CompressIcon, title: t("compress"), desc: t("compressDesc") },
    { id: "merge", icon: MergeIcon, title: t("merge"), desc: t("mergeDesc") },
    { id: "split", icon: SplitIcon, title: t("split"), desc: t("splitDesc") },
    {
      id: "extractPages",
      icon: ExtractIcon,
      title: t("extractPages"),
      desc: t("extractPagesDesc"),
    },
    { id: "grayscale", icon: GrayscaleIcon, title: t("grayscale"), desc: t("grayscaleDesc") },
    { id: "resize", icon: ResizeIcon, title: t("resize"), desc: t("resizeDesc") },
  ];

  return (
    <div className="main-page">
      <div className="top-bar">
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
        <LanguageSelector currentLang={lang} onLangChange={onLangChange} />
      </div>

      <header className="hero">
        <h1>
          <span className="logo-icon">🛠️</span>
          {t("appTitle")}
        </h1>
        <p className="tagline">{t("tagline")}</p>
      </header>

      <div className="features-grid">
        {features.map(({ id, icon: Icon, title, desc }) => (
          <button key={id} className="feature-card" onClick={() => onSelectFeature(id)}>
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
          <strong>{t("privacyFirst")}</strong> {t("privacyDesc")}
        </p>
        <p className="footer-links">
          <button className="link-btn" onClick={() => onSelectFeature("license")}>
            {t("licenseLink")}
          </button>
          {" - "}
          <a href="https://github.com/pwasuite/pdftools" target="_blank" rel="noopener noreferrer">
            {t("openSource")}
          </a>
          {" - "}
          <button className="link-btn" onClick={() => onSelectFeature("credits")}>
            {t("credits")}
          </button>
        </p>
        <p className="footer-links">
          <a href="https://pdf.pwasuite.com/" target="_blank" rel="noopener noreferrer">
            PDF Tools
          </a>
          {" " + t("by") + " "}
          <a href="https://pwasuite.com/" target="_blank" rel="noopener noreferrer">
            PWA Suite
          </a>
        </p>
        <p className="version-info">
          {__APP_VERSION__}
          {!["pdf.pwasuite.com"].includes(window.location.hostname) && ` - run from ${window.location.origin}${window.location.pathname}`}
          {(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) && " - installed application"}
        </p>
      </footer>
    </div>
  );
}

// ============ COMPRESS PAGE ============
function CompressPage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(2);
  const [status, setStatus] = useState("idle"); // idle, processing, done, error
  const [result, setResult] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus("idle");
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setStatus("processing");
    try {
      const response = await compressPDF(file, quality);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        // Convert array back to Uint8Array and create blob
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file.name.replace(".pdf", "-compressed.pdf"),
          size: data.length,
        });
        setStatus("done");
      } else {
        throw new Error("No output received");
      }
    } catch (error) {
      console.error("Compression error:", error);
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
  };

  return (
    <div className="feature-page compress-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>
          <CompressIcon /> {t("compressPdf")}
        </h1>
      </header>

      <div className="page-content">
        {status === "idle" && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label={t("dropPdfToCompress")} />
        )}

        {file && status !== "done" && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <QualitySlider
              value={quality}
              onChange={setQuality}
              disabled={status === "processing"}
              lang={lang}
            />

            <button
              className="action-btn primary"
              onClick={handleCompress}
              disabled={status === "processing"}
            >
              {status === "processing" ? (
                <>
                  <span className="spinner"></span>
                  {t("compressing")}
                </>
              ) : (
                t("compressAction")
              )}
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>{t("compressionComplete")}</h3>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">{t("original")}</span>
                  <span className="value">{(originalSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">{t("compressed")}</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-item savings">
                  <span className="label">{t("saved")}</span>
                  <span className="value">
                    {Math.round((1 - result.size / originalSize) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                {t("download")} {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                {t("compressAnother")}
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="result-section">
            <div className="result-card error">
              <h3>{t("compressionFailed")}</h3>
              <p>{t("errorOccurred")}</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ FILENAME DISPLAY (with auto-detect truncation) ============
function FileNameDisplay({ filename, isExpanded, onToggle }) {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const { scrollWidth, clientWidth } = textRef.current;
        setIsTruncated(scrollWidth > clientWidth);
      }
    };

    checkTruncation();
    // Re-check on window resize
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [filename]);

  return (
    <div className="filename-wrapper">
      <div className="filename-row">
        <span ref={textRef} className="filename-text">
          {filename}
        </span>
        {isTruncated && (
          <button
            className="filename-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title={isExpanded ? "Collapse" : "Show full name"}
          >
            {isExpanded ? "▲" : "…"}
          </button>
        )}
      </div>
      {isExpanded && isTruncated && (
        <div className="filename-full">{filename}</div>
      )}
    </div>
  );
}

// ============ MERGE PAGE ============
function MergePage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(2);
  const [enableCompression, setEnableCompression] = useState(true);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [expandedFileId, setExpandedFileId] = useState(null);

  const handleAddFiles = (newFiles) => {
    const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
    setFiles((prev) => [
      ...prev,
      ...filesToAdd.map((f) => ({
        file: f,
        id: Date.now() + Math.random(),
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === files.length - 1))
      return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + direction]] = [newFiles[index + direction], newFiles[index]];
    setFiles(newFiles);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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

    setStatus("processing");
    try {
      const response = await mergePDFs(files, enableCompression, quality);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        // 1. Generate Timestamp Suffix
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

        // 2. Identify Common Prefix
        const filenames = files.map((f) => f.file.name);
        let prefix = filenames[0];
        // Find common prefix
        for (let i = 1; i < filenames.length; i++) {
          while (filenames[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            if (prefix === "") break;
          }
        }

        // Validate prefix (letters, numbers, underscores only)
        let finalPrefix = "";
        if (prefix && /^[a-zA-Z0-9_]+$/.test(prefix)) {
          finalPrefix = prefix;
        }

        // Construct Filename
        // Logic: [Prefix]-[merge]_[Timestamp].pdf
        let baseName = "merge";
        if (finalPrefix) {
          baseName = `${finalPrefix}-${baseName}`;
        }
        const finalName = `${baseName}_${timestamp}.pdf`;

        setResult({
          url,
          name: finalName,
          size: data.length,
        });
        setStatus("done");
      } else {
        throw new Error("No output received");
      }
    } catch (error) {
      console.error("Merge error:", error);
      setStatus("error");
    }
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFiles([]);
    setStatus("idle");
    setResult(null);
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="feature-page merge-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>
          <MergeIcon /> {t("mergePdfs")}
        </h1>
      </header>

      <div className="page-content">
        {status !== "done" && (
          <>
            <FileDropZone
              onFileSelect={handleAddFiles}
              multiple={true}
              label={files.length === 0 ? t("dropPdfs") : t("addMoreFiles")}
            />

            {files.length > 0 && (
              <div className="files-list">
                <h3>
                  {files.length} {t("filesSelected")}
                </h3>
                <p className="list-hint">{t("dragToReorder")}</p>
                <ul>
                  {files.map((f, index) => (
                    <li
                      key={f.id}
                      className={`file-item ${dragIndex === index ? "dragging" : ""} ${dragOverIndex === index ? "drag-over" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="drag-handle">⋮⋮</span>
                      <span className="file-order">{index + 1}</span>
                      <span className="file-icon">
                        <PdfIcon />
                      </span>
                      <FileNameDisplay
                        filename={f.file.name}
                        isExpanded={expandedFileId === f.id}
                        onToggle={() => setExpandedFileId(expandedFileId === f.id ? null : f.id)}
                      />
                      <span className="filesize">
                        ({(f.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <div className="file-actions">
                        <button onClick={() => moveFile(index, -1)} disabled={index === 0}>
                          ↑
                        </button>
                        <button
                          onClick={() => moveFile(index, 1)}
                          disabled={index === files.length - 1}
                        >
                          ↓
                        </button>
                        <button onClick={() => removeFile(f.id)} className="delete-btn">
                          <TrashIcon />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="total-size">Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            )}

            {files.length >= 2 && (
              <div className="merge-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={enableCompression}
                    onChange={(e) => setEnableCompression(e.target.checked)}
                    disabled={status === "processing"}
                  />
                  <span>{t("alsoCompress")}</span>
                </label>

                {enableCompression && (
                  <QualitySlider
                    value={quality}
                    onChange={setQuality}
                    disabled={status === "processing"}
                    lang={lang}
                  />
                )}

                <button
                  className="action-btn primary"
                  onClick={handleMerge}
                  disabled={status === "processing"}
                >
                  {status === "processing" ? (
                    <>
                      <span className="spinner"></span>
                      {t("merging")}
                    </>
                  ) : (
                    t("mergeAction")
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {status === "done" && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>{t("mergeComplete")}</h3>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">{t("original")}</span>
                  <span className="value">{(totalSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">{t("mergedFile")}</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                {t("download")} {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                {t("mergeAnother")}
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="result-section">
            <div className="result-card error">
              <h3>{t("mergeFailed")}</h3>
              <p>{t("mergeError")}</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SPLIT PAGE ============
function SplitPage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
  };

  const handleSplit = async () => {
    if (!file) return;

    setStatus("processing");
    try {
      const response = await splitPDF(file);

      if (response.outputs && response.outputs.length > 0) {
        // Convert each page's data array to Uint8Array and create blob URLs
        const pages = response.outputs.map((output) => {
          const data = new Uint8Array(output.data);
          const blob = new Blob([data], { type: "application/pdf" });
          return {
            name: output.name,
            data: data,
            url: URL.createObjectURL(blob),
          };
        });
        setResult({
          pages,
          pageCount: pages.length,
          originalName: file.name.replace(".pdf", ""),
        });
        setStatus("done");
      } else {
        throw new Error("No output received");
      }
    } catch (error) {
      console.error("Split error:", error);
      setStatus("error");
    }
  };

  const getPageSuffix = (index, total) => {
    const pageNum = index + 1;
    const width = String(total).length;
    return `-p${String(pageNum).padStart(width, "0")}`;
  };

  const downloadSinglePage = (page, index) => {
    const link = document.createElement("a");
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

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.originalName}_pages.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
  };

  return (
    <div className="feature-page split-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>
          <SplitIcon /> {t("splitPdf")}
        </h1>
      </header>

      <div className="page-content">
        {status === "idle" && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label={t("dropPdfToSplit")} />
        )}

        {file && status !== "done" && (
          <div className="file-selected">
            <div className="selected-file">
              <PdfIcon />
              <span className="filename">{file.name}</span>
              <span className="filesize">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button className="remove-btn" onClick={reset}>
                <TrashIcon />
              </button>
            </div>

            <p className="split-info">{t("splitInfo")}</p>

            <button
              className="action-btn primary"
              onClick={handleSplit}
              disabled={status === "processing"}
            >
              {status === "processing" ? (
                <>
                  <span className="spinner"></span>
                  {t("splitting")}
                </>
              ) : (
                t("splitAction")
              )}
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>{t("splitComplete")}</h3>
              <p>
                {result.pageCount} {t("pagesExtracted")}
              </p>
            </div>

            <div className="split-results">
              <button className="action-btn primary download-zip" onClick={downloadAllAsZip}>
                {t("downloadAll")}
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
              {t("splitAnother")}
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="result-section">
            <div className="result-card error">
              <h3>{t("splitFailed")}</h3>
              <p>{t("splitError")}</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExtractPagesPage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [file, setFile] = useState(null);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
    setFirstPage(1);
    setLastPage(1);
  };

  const handleExtract = async () => {
    if (!file || firstPage < 1 || lastPage < firstPage) return;

    setStatus("processing");
    try {
      const response = await extractPages(file, firstPage, lastPage);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const rangeStr =
          firstPage === lastPage ? `page_${firstPage}` : `pages_${firstPage}-${lastPage}`;

        setResult({
          url,
          name: `${file.name.replace(".pdf", "")}_${rangeStr}.pdf`,
          size: data.length,
          pageCount: lastPage - firstPage + 1,
        });
        setStatus("done");
      } else {
        throw new Error("No output received");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setFirstPage(1);
    setLastPage(1);
  };

  return (
    <div className="feature-page extract-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>
          <ExtractIcon /> {t("extractPagesTitle")}
        </h1>
      </header>

      <div className="page-content">
        {status === "idle" && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label={t("dropPdfToExtract")} />
        )}

        {file && status !== "done" && (
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
              <label>{t("pageRange")}</label>
              <div className="range-inputs">
                <div className="range-input">
                  <span>{t("fromPage")}:</span>
                  <input
                    type="number"
                    min="1"
                    value={firstPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFirstPage(val);
                      if (val > lastPage) setLastPage(val);
                    }}
                    disabled={status === "processing"}
                  />
                </div>
                <div className="range-input">
                  <span>{t("toPage")}:</span>
                  <input
                    type="number"
                    min={firstPage}
                    value={lastPage}
                    onChange={(e) => setLastPage(parseInt(e.target.value) || firstPage)}
                    disabled={status === "processing"}
                  />
                </div>
              </div>
              <p className="range-hint">
                {t("willExtract")} {lastPage - firstPage + 1}{" "}
                {lastPage !== firstPage ? t("pages") : t("page")}
              </p>
            </div>

            <button
              className="action-btn primary"
              onClick={handleExtract}
              disabled={status === "processing" || firstPage < 1 || lastPage < firstPage}
            >
              {status === "processing" ? (
                <>
                  <span className="spinner"></span>
                  {t("extracting")}
                </>
              ) : (
                t("extractAction")
              )}
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>{t("extractComplete")}</h3>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">{t("original")}</span>
                  <span className="value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">{t("extractedFile")}</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                {t("download")} {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                {t("extractAnother")}
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="result-section">
            <div className="result-card error">
              <h3>{t("extractFailed")}</h3>
              <p>{t("extractError")}</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ GRAYSCALE PAGE ============
function GrayscalePage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus("processing");
    try {
      const response = await grayscalePDF(file);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setResult({
          url,
          name: `${file.name.replace(".pdf", "")}_gray.pdf`,
          size: data.length,
        });
        setStatus("done");
      } else {
        throw new Error("No output received");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
  };

  return (
    <div className="feature-page grayscale-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>
          <GrayscaleIcon /> {t("grayscalePdf")}
        </h1>
      </header>

      <div className="page-content">
        {status === "idle" && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label={t("dropPdfToGrayscale")} />
        )}

        {file && status !== "done" && (
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
              <p>ℹ️ {t("grayscaleInfo")}</p>
            </div>

            <button
              className="action-btn primary"
              onClick={handleConvert}
              disabled={status === "processing"}
            >
              {status === "processing" ? (
                <>
                  <span className="spinner"></span>
                  {t("converting")}
                </>
              ) : (
                t("grayscaleAction")
              )}
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>{t("grayscaleComplete")}</h3>
              <p>{t("grayscaleSuccess")}</p>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">{t("original")}</span>
                  <span className="value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">{t("convertedFile")}</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                {t("download")} {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                {t("grayscaleAnother")}
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="result-section">
            <div className="result-card error">
              <h3>{t("grayscaleFailed")}</h3>
              <p>{t("grayscaleError")}</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ RESIZE PAGE ============
function ResizePage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [file, setFile] = useState(null);
  const [paperSize, setPaperSize] = useState("a4");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
  };

  const handleResize = async () => {
    if (!file) return;

    setStatus("processing");
    try {
      const response = await resizePDF(file, paperSize);

      if (response.outputs && response.outputs.length > 0) {
        const output = response.outputs[0];
        const data = new Uint8Array(output.data);
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setResult({
          url,
          name: `${file.name.replace(".pdf", "")}_${paperSize}.pdf`,
          size: data.length,
        });
        setStatus("done");
      } else {
        throw new Error("No output received");
      }
    } catch (error) {
      console.error("Resize error:", error);
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
  };

  const paperSizes = [
    { value: "a4", label: "A4 (210 x 297 mm)" },
    { value: "letter", label: "Letter (8.5 x 11 in)" },
    { value: "legal", label: "Legal (8.5 x 14 in)" },
    { value: "a3", label: "A3 (297 x 420 mm)" },
    { value: "ledger", label: "Ledger (11 x 17 in)" },
    { value: "11x17", label: "11x17 (11 x 17 in)" },
    { value: "a5", label: "A5 (148 x 210 mm)" },
    { value: "a6", label: "A6 (105 x 148 mm)" },
  ];

  return (
    <div className="feature-page resize-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>
          <ResizeIcon /> {t("resizePdf")}
        </h1>
      </header>

      <div className="page-content">
        {status === "idle" && !file && (
          <FileDropZone onFileSelect={handleFileSelect} label={t("dropPdfToResize")} />
        )}

        {file && status !== "done" && (
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
              <label>{t("targetSize")}</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                disabled={status === "processing"}
                className="paper-select"
              >
                {paperSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              <p className="range-hint">{t("resizeHint")}</p>
              <p className="warning-hint">⚠️ {t("resizeWarning")}</p>
            </div>

            <button
              className="action-btn primary"
              onClick={handleResize}
              disabled={status === "processing"}
            >
              {status === "processing" ? (
                <>
                  <span className="spinner"></span>
                  {t("resizing")}
                </>
              ) : (
                t("resizeAction")
              )}
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="result-section">
            <div className="result-card success">
              <h3>{t("resizeComplete")}</h3>
              <p>
                {t("resizeSuccess")} {paperSize.toUpperCase()}.
              </p>
              <div className="size-comparison">
                <div className="size-item">
                  <span className="label">{t("original")}</span>
                  <span className="value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="size-arrow">→</div>
                <div className="size-item">
                  <span className="label">{t("resizedFile")}</span>
                  <span className="value">{(result.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <a href={result.url} download={result.name} className="action-btn primary">
                {t("download")} {result.name}
              </a>
              <button className="action-btn secondary" onClick={reset}>
                {t("resizeAnother")}
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="result-section">
            <div className="result-card error">
              <h3>{t("resizeFailed")}</h3>
              <p>{t("resizeError")}</p>
            </div>
            <button className="action-btn secondary" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ CREDITS PAGE ============
function CreditsPage({ onBack, lang }) {
  const t = getTranslation(lang);
  return (
    <div className="feature-page credits-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>{t("creditsTitle")}</h1>
      </header>

      <div className="page-content">
        <div className="credits-section">
          <h2>{t("coretech")}</h2>
          <div className="credit-card">
            <h3>Ghostscript</h3>
            <p>{t("coretechDesc")}</p>
          </div>
          <div className="credit-card">
            <h3>{t("wasmPort")}</h3>
            <p>
              {t("wasmPortDesc")}{" "}
              <a
                href="https://github.com/ochachacha/ps-wasm"
                target="_blank"
                rel="noopener noreferrer"
              >
                @ochachacha
              </a>
            </p>
          </div>
          <div className="credit-card">
            <h3>{t("originalProject")}</h3>
            <p>
              {t("originalProjectDesc")}{" "}
              <a
                href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm"
                target="_blank"
                rel="noopener noreferrer"
              >
                ghostscript-pdf-compress.wasm
              </a>{" "}
              {t("originalProjectBy")}
            </p>
          </div>
        </div>

        <div className="credits-section">
          <h2>{t("thankHim")}</h2>
          <p className="dependencies-note">
            {t("thankHimDesc")}{" "}
            <a
              href="https://www.biblegateway.com/passage/?search=1%20Thessalonians%205%3A18%2CExodus%2031%3A1-5&version=NKJV"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("specialThanks")}
            </a>{" "}
            {t("toGod")}
          </p>
        </div>

        <div className="credits-section">
          <h2>{t("builtWith")}</h2>
          <div className="credit-card tech-stack">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <div>
                <h4>
                  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                    React
                  </a>
                </h4>
                <p>{t("reactDesc")}</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">⚡</span>
              <div>
                <h4>
                  <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
                    Vite
                  </a>
                </h4>
                <p>{t("viteDesc")}</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">📦</span>
              <div>
                <h4>
                  <a href="https://stuk.github.io/jszip/" target="_blank" rel="noopener noreferrer">
                    JSZip
                  </a>
                </h4>
                <p>{t("jszipDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="credits-section">
          <h2>{t("dependencies")}</h2>
          <p className="dependencies-note">{t("dependenciesNote")}</p>
        </div>

        <div className="credits-section">
          <h2>{t("aiTools")}</h2>
          <p className="dependencies-note">
            {t("aiToolsDesc")}
            <br />
            <br />
            <strong>Note:</strong> {t("aiToolsPrivacy")}
          </p>
        </div>

        <div className="credits-section">
          <h2>{t("openSourceSection")}</h2>
          <p>
            {t("openSourceDesc")}{" "}
            <a
              href="https://github.com/pwasuite/pdftools"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("viewOnGithub")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ LICENSE PAGE ============
function LicensePage({ onBack, lang }) {
  const t = getTranslation(lang);
  const [licenseText, setLicenseText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/LICENSE.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load license file");
        }
        return response.text();
      })
      .then((text) => {
        setLicenseText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading license:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="feature-page license-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>{t("licenseTitle")}</h1>
      </header>

      <div className="page-content">
        <div className="license-container">
          {loading && <div className="loading-spinner">Loading license...</div>}
          {error && <div className="error-message">Failed to load license: {error}</div>}
          {!loading && !error && <pre>{licenseText}</pre>}
        </div>
      </div>
    </div>
  );
}

// ============ APP ============
function App() {
  const [currentPage, setCurrentPage] = useState("main");
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState(() => detectBrowserLanguage());

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(THEMES[theme]);
  }, [theme]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
  };

  const handleLangChange = (langCode) => {
    setLang(langCode);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "compress":
        return <CompressPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "merge":
        return <MergePage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "split":
        return <SplitPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "extractPages":
        return <ExtractPagesPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "grayscale":
        return <GrayscalePage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "resize":
        return <ResizePage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "credits":
        return <CreditsPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "license":
        return <LicensePage onBack={() => setCurrentPage("main")} lang={lang} />;
      default:
        return (
          <MainPage
            onSelectFeature={setCurrentPage}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            lang={lang}
            onLangChange={handleLangChange}
          />
        );
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;
