import { useState, useEffect } from "react";
import { LANGUAGES } from "../i18n.js";

// Language selector dropdown (EN/FR toggle)
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

export default LanguageSelector;
