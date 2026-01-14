import { useState, useCallback } from "react";
import { PdfIcon } from "./icons";

// File drop zone component with drag & drop support
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

export default FileDropZone;
