import { useState, useEffect } from "react";
import { detectBrowserLanguage } from "./i18n.js";
import { THEMES, applyTheme } from "./constants/themes.js";
import MainPage from "./pages/MainPage.jsx";
import CompressPage from "./pages/CompressPage.jsx";
import MergePage from "./pages/MergePage.jsx";
import SplitPage from "./pages/SplitPage.jsx";
import ExtractPagesPage from "./pages/ExtractPagesPage.jsx";
import GrayscalePage from "./pages/GrayscalePage.jsx";
import ResizePage from "./pages/ResizePage.jsx";
import CreditsPage from "./pages/CreditsPage.jsx";
import LicensePage from "./pages/LicensePage.jsx";
import "./App.css";

// ============ APP ============
function App() {
  const [currentPage, setCurrentPage] = useState("main");
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState(() => detectBrowserLanguage());

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(THEMES[theme]);
  }, [theme]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
  };

  const handleLangChange = (langCode) => {
    setLang(langCode);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "compress":
        return <CompressPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "merge":
        return <MergePage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "split":
        return <SplitPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "extractPages":
        return (
          <ExtractPagesPage
            onBack={() => setCurrentPage("main")}
            lang={lang}
            setPage={setCurrentPage}
          />
        );
      case "grayscale":
        return <GrayscalePage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "resize":
        return <ResizePage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "credits":
        return <CreditsPage onBack={() => setCurrentPage("main")} lang={lang} />;
      case "license":
        return <LicensePage onBack={() => setCurrentPage("main")} lang={lang} />;
      default:
        return (
          <MainPage
            onSelectFeature={setCurrentPage}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            lang={lang}
            onLangChange={handleLangChange}
          />
        );
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;
