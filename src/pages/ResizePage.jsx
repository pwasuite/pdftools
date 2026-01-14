import { useState } from "react";
import { getTranslation } from "../i18n.js";
import { resizePDF } from "../lib/worker-init.js";
import { ResizeIcon, BackIcon, PdfIcon, TrashIcon } from "../components/icons";
import FileDropZone from "../components/FileDropZone.jsx";

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

export default ResizePage;
