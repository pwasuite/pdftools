import { useState, useEffect } from "react";
import { getTranslation } from "../i18n.js";
import { BackIcon } from "../components/icons";

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

export default LicensePage;
