import { useState } from "react";
import { getTranslation } from "../i18n.js";
import { compressPDF } from "../lib/worker-init.js";
import { CompressIcon, BackIcon, PdfIcon, TrashIcon } from "../components/icons";
import FileDropZone from "../components/FileDropZone.jsx";
import QualitySlider from "../components/QualitySlider.jsx";

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

export default CompressPage;
