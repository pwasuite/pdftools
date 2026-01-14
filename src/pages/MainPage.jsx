import { getTranslation } from "../i18n.js";
import {
  CompressIcon,
  MergeIcon,
  SplitIcon,
  ExtractIcon,
  GrayscaleIcon,
  ResizeIcon,
} from "../components/icons";
import ThemeSelector from "../components/ThemeSelector.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";

// Main landing page with feature cards
function MainPage({ onSelectFeature, currentTheme, onThemeChange, lang, onLangChange }) {
  const t = getTranslation(lang);

  // Note: PNG/JPEG output devices are not available in this WASM build
  // Only pdfwrite device is supported
  const features = [
    { id: "compress", icon: CompressIcon, title: t("compress"), desc: t("compressDesc") },
    { id: "merge", icon: MergeIcon, title: t("merge"), desc: t("mergeDesc") },
    { id: "split", icon: SplitIcon, title: t("split"), desc: t("splitDesc") },
    {
      id: "extractPages",
      icon: ExtractIcon,
      title: t("extractPages"),
      desc: t("extractPagesDesc"),
    },
    { id: "grayscale", icon: GrayscaleIcon, title: t("grayscale"), desc: t("grayscaleDesc") },
    { id: "resize", icon: ResizeIcon, title: t("resize"), desc: t("resizeDesc") },
  ];

  return (
    <div className="main-page">
      <div className="top-bar">
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
        <LanguageSelector currentLang={lang} onLangChange={onLangChange} />
      </div>

      <header className="hero">
        <h1>
          <span className="logo-icon">🛠️</span>
          {t("appTitle")}
        </h1>
        <p className="tagline">{t("tagline")}</p>
      </header>

      <div className="features-grid">
        {features.map(({ id, icon: Icon, title, desc }) => (
          <button key={id} className="feature-card" onClick={() => onSelectFeature(id)}>
            <div className="feature-icon">
              <Icon />
            </div>
            <h2>{title}</h2>
            <p>{desc}</p>
          </button>
        ))}
      </div>

      <footer className="credits">
        <p>
          <strong>{t("privacyFirst")}</strong> {t("privacyDesc")}
        </p>
        <p className="footer-links">
          <button className="link-btn" onClick={() => onSelectFeature("license")}>
            {t("licenseLink")}
          </button>
          {" - "}
          <a href="https://github.com/pwasuite/pdftools" target="_blank" rel="noopener noreferrer">
            {t("openSource")}
          </a>
          {" - "}
          <button className="link-btn" onClick={() => onSelectFeature("credits")}>
            {t("credits")}
          </button>
        </p>
        <p className="footer-links">
          <a href="https://pdf.pwasuite.com/" target="_blank" rel="noopener noreferrer">
            PDF Tools
          </a>
          {" " + t("by") + " "}
          <a href="https://pwasuite.com/" target="_blank" rel="noopener noreferrer">
            PWA Suite
          </a>
        </p>
        <p className="version-info">
          {import.meta.env.DEV && "dev server - "}
          {__APP_VERSION__}
          {!["pdf.pwasuite.com"].includes(window.location.hostname) &&
            ` - run from ${window.location.origin}${window.location.pathname}`}
          {(window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone) &&
            " - installed application"}
        </p>
      </footer>
    </div>
  );
}

export default MainPage;
