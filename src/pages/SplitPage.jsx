import { useState } from "react";
import JSZip from "jszip";
import { getTranslation } from "../i18n.js";
import { splitPDF } from "../lib/worker-init.js";
import { SplitIcon, BackIcon, PdfIcon, TrashIcon } from "../components/icons";
import FileDropZone from "../components/FileDropZone.jsx";

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

export default SplitPage;
