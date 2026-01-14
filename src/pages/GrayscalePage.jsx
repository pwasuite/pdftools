import { useState } from "react";
import { getTranslation } from "../i18n.js";
import { grayscalePDF } from "../lib/worker-init.js";
import { GrayscaleIcon, BackIcon, PdfIcon, TrashIcon } from "../components/icons";
import FileDropZone from "../components/FileDropZone.jsx";

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

export default GrayscalePage;
