import { THEMES } from "../constants/themes.js";

// Theme toggle selector (light/dark mode dots)
function ThemeSelector({ currentTheme, onThemeChange }) {
  return (
    <div className="theme-selector">
      {Object.values(THEMES).map((theme) => (
        <button
          key={theme.id}
          className={`theme-dot ${currentTheme === theme.id ? "active" : ""}`}
          style={{ background: theme.preview }}
          onClick={() => onThemeChange(theme.id)}
          title={theme.name}
          aria-label={`Switch to ${theme.name} theme`}
        />
      ))}
    </div>
  );
}

export default ThemeSelector;
