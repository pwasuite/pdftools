import { getTranslation } from "../i18n.js";
import { BackIcon } from "../components/icons";

function CreditsPage({ onBack, lang }) {
  const t = getTranslation(lang);
  return (
    <div className="feature-page credits-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <BackIcon />
          <span>{t("back")}</span>
        </button>
        <h1>{t("creditsTitle")}</h1>
      </header>

      <div className="page-content">
        <div className="credits-section">
          <h2>{t("coretech")}</h2>
          <div className="credit-card">
            <h3>Ghostscript</h3>
            <p>{t("coretechDesc")}</p>
          </div>
          <div className="credit-card">
            <h3>{t("wasmPort")}</h3>
            <p>
              {t("wasmPortDesc")}{" "}
              <a
                href="https://github.com/ochachacha/ps-wasm"
                target="_blank"
                rel="noopener noreferrer"
              >
                @ochachacha
              </a>
            </p>
          </div>
          <div className="credit-card">
            <h3>{t("originalProject")}</h3>
            <p>
              {t("originalProjectDesc")}{" "}
              <a
                href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm"
                target="_blank"
                rel="noopener noreferrer"
              >
                ghostscript-pdf-compress.wasm
              </a>{" "}
              {t("originalProjectBy")}
            </p>
          </div>
        </div>

        <div className="credits-section">
          <h2>{t("thankHim")}</h2>
          <p className="dependencies-note">
            {t("thankHimDesc")}{" "}
            <a
              href="https://www.biblegateway.com/passage/?search=1%20Thessalonians%205%3A18%2CExodus%2031%3A1-5&version=NKJV"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("specialThanks")}
            </a>{" "}
            {t("toGod")}
          </p>
        </div>

        <div className="credits-section">
          <h2>{t("builtWith")}</h2>
          <div className="credit-card tech-stack">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <div>
                <h4>
                  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                    React
                  </a>
                </h4>
                <p>{t("reactDesc")}</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">⚡</span>
              <div>
                <h4>
                  <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
                    Vite
                  </a>
                </h4>
                <p>{t("viteDesc")}</p>
              </div>
            </div>
            <div className="tech-item">
              <span className="tech-icon">📦</span>
              <div>
                <h4>
                  <a href="https://stuk.github.io/jszip/" target="_blank" rel="noopener noreferrer">
                    JSZip
                  </a>
                </h4>
                <p>{t("jszipDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="credits-section">
          <h2>{t("dependencies")}</h2>
          <p className="dependencies-note">{t("dependenciesNote")}</p>
        </div>

        <div className="credits-section">
          <h2>{t("aiTools")}</h2>
          <p className="dependencies-note">
            {t("aiToolsDesc")}
            <br />
            <br />
            <strong>Note:</strong> {t("aiToolsPrivacy")}
          </p>
        </div>

        <div className="credits-section">
          <h2>{t("openSourceSection")}</h2>
          <p>
            {t("openSourceDesc")}{" "}
            <a
              href="https://github.com/pwasuite/pdftools"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("viewOnGithub")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreditsPage;
