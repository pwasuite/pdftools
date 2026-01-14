import { useState } from "react";
import { getTranslation } from "../i18n.js";
import { mergePDFs } from "../lib/worker-init.js";
import { MergeIcon, BackIcon, PdfIcon, TrashIcon } from "../components/icons";
import FileDropZone from "../components/FileDropZone.jsx";
import FileNameDisplay from "../components/FileNameDisplay.jsx";
import QualitySlider from "../components/QualitySlider.jsx";

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

export default MergePage;
