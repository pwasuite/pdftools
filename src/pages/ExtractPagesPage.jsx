import { useState, useEffect, useCallback, useRef } from "react";
import { getTranslation } from "../i18n.js";
import { extractPages, getPageCount } from "../lib/worker-init.js";
import { ExtractIcon, BackIcon, PdfIcon, TrashIcon } from "../components/icons";
import FileDropZone from "../components/FileDropZone.jsx";

function ExtractPagesPage({ onBack, lang, setPage }) {
  const t = getTranslation(lang);
  const [file, setFile] = useState(null);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  // Page count detection state
  const [pageCount, setPageCount] = useState(null);
  const [pageCountStatus, setPageCountStatus] = useState("idle"); // idle, detecting, detected, failed
  const abortControllerRef = useRef(null);

  // Cleanup function to abort page count detection
  const abortPageCountDetection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Start page count detection when file is selected
  const detectPageCount = useCallback(
    async (selectedFile) => {
      abortPageCountDetection();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setPageCountStatus("detecting");
      setPageCount(null);

      try {
        const response = await getPageCount(selectedFile, controller.signal);
        if (response.pageCount) {
          setPageCount(response.pageCount);
          setPageCountStatus("detected");
          // Auto-set lastPage to page count on first detection
          setLastPage(response.pageCount);
        } else {
          setPageCountStatus("failed");
        }
      } catch (error) {
        if (error.name === "AbortError") {
          // Detection was cancelled, don't update state
          return;
        }
        console.error("Page count detection error:", error);
        setPageCountStatus("failed");
      }
    },
    [abortPageCountDetection]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortPageCountDetection();
    };
  }, [abortPageCountDetection]);

  const handleFileSelect = (selectedFile) => {
    abortPageCountDetection();
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
    setFirstPage(1);
    setLastPage(1);
    setPageCount(null);
    setPageCountStatus("idle");
    // Start page count detection in background
    detectPageCount(selectedFile);
  };

  const handleExtract = async () => {
    if (!file || firstPage < 1 || lastPage < firstPage) return;

    // Abort any ongoing page count detection
    abortPageCountDetection();

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
    abortPageCountDetection();
    setFile(null);
    setStatus("idle");
    setResult(null);
    setFirstPage(1);
    setLastPage(1);
    setPageCount(null);
    setPageCountStatus("idle");
  };

  // Handle back with cleanup
  const handleBack = () => {
    abortPageCountDetection();
    onBack();
  };

  // Compute maximum end page (use pageCount if known, or don't restrict if unknown)
  const maxEndPage = pageCount || undefined;

  // Helper to determine if we're extracting all pages
  const isExtractingAllPages = pageCount && firstPage === 1 && lastPage === pageCount;

  // Render dynamic status/helper line
  const renderStatusLine = () => {
    // If still detecting
    if (pageCountStatus === "detecting") {
      return <p className="range-hint status-detecting">⏳ {t("detectingPageCount")}</p>;
    }

    // If extracting all pages - suggest split feature
    if (isExtractingAllPages) {
      return (
        <p className="range-hint status-tip">
          💡 {t("extractingAllPagesTip")}{" "}
          <button type="button" className="link-btn" onClick={() => setPage("split")}>
            {t("splitFeature")}
          </button>
          .
        </p>
      );
    }

    // If page count is known, show start/end info with reset links
    if (pageCount) {
      const startInfo =
        firstPage === 1 ? (
          <span>{t("startsFromBeginning")}</span>
        ) : (
          <button type="button" className="link-btn" onClick={() => setFirstPage(1)}>
            {t("resetStartToOne")}
          </button>
        );

      const endInfo =
        lastPage === pageCount ? (
          <span>{t("endsAtLastPage")}</span>
        ) : (
          <button type="button" className="link-btn" onClick={() => setLastPage(pageCount)}>
            {t("resetEndToLast")}
          </button>
        );

      return (
        <p className="range-hint status-info">
          {t("pageCountDetected")} {pageCount} — {startInfo} / {endInfo}
        </p>
      );
    }

    // If failed to detect
    if (pageCountStatus === "failed") {
      return <p className="range-hint status-warning">⚠️ {t("pageCountFailed")}</p>;
    }

    return null;
  };

  return (
    <div className="feature-page extract-page">
      <header className="page-header">
        <button className="back-btn" onClick={handleBack}>
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
                    max={maxEndPage}
                    value={firstPage}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 1;
                      if (val < 1) val = 1;
                      if (pageCount && val > pageCount) val = pageCount;
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
                    max={maxEndPage}
                    value={lastPage}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || firstPage;
                      if (val < firstPage) val = firstPage;
                      if (pageCount && val > pageCount) val = pageCount;
                      setLastPage(val);
                    }}
                    disabled={status === "processing"}
                  />
                </div>
              </div>
              <p className="range-hint">
                {t("willExtract")} {lastPage - firstPage + 1}{" "}
                {lastPage !== firstPage ? t("pages") : t("page")}
              </p>
              {renderStatusLine()}
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

export default ExtractPagesPage;
