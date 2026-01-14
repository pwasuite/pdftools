import { useState, useEffect, useRef } from "react";

// Filename display with auto-detect truncation and expand toggle
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
      {isExpanded && isTruncated && <div className="filename-full">{filename}</div>}
    </div>
  );
}

export default FileNameDisplay;
