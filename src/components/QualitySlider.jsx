import { getTranslation } from "../i18n.js";

// Quality slider for PDF compression settings
function QualitySlider({ value, onChange, disabled, lang }) {
  const t = getTranslation(lang);

  const QUALITY_LABELS = {
    1: { name: t("screen"), desc: t("screenDesc") },
    2: { name: t("ebook"), desc: t("ebookDesc") },
    3: { name: t("print"), desc: t("printDesc") },
    4: { name: t("prepress"), desc: t("prepressDesc") },
  };

  return (
    <div className={`quality-slider ${disabled ? "disabled" : ""}`}>
      <label>{t("compressionQuality")}</label>
      <div className="slider-container">
        <input
          type="range"
          min="1"
          max="4"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
        />
        <div className="slider-labels">
          <span className={value === 1 ? "active" : ""}>{t("smallest")}</span>
          <span className={value === 4 ? "active" : ""}>{t("best")}</span>
        </div>
      </div>
      <div className="quality-info">
        <strong>{QUALITY_LABELS[value].name}</strong>
        <span>{QUALITY_LABELS[value].desc}</span>
      </div>
    </div>
  );
}

export default QualitySlider;
