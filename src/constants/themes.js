// Theme configuration for PDF Tools app
// Light and dark themes with CSS custom properties

export const THEMES = {
  dark: {
    id: "dark",
    name: "Dark",
    preview: "#1e1e1e",
    colors: {
      // Background colors - VS Code / Teams inspired
      "--bg-primary": "#1e1e1e",
      "--bg-secondary": "#252526",
      "--bg-tertiary": "#2d2d30",
      "--bg-card": "#252526",
      // Accent - professional blue (similar to VS Code/Teams)
      "--accent-primary": "#0078d4",
      "--accent-secondary": "#106ebe",
      "--accent-gradient": "#0078d4",
      "--accent-glow": "rgba(0, 120, 212, 0.15)",
      // Text colors - brighter for better contrast
      "--text-primary": "#e4e4e4",
      "--text-secondary": "#a0a0a0",
      "--text-muted": "#707070",
      // Feature colors - muted, professional
      "--compress-color": "#3c9a5f",
      "--merge-color": "#0078d4",
      "--split-color": "#c27c0e",
      // Borders
      "--border-color": "rgba(255, 255, 255, 0.1)",
    },
  },
  light: {
    id: "light",
    name: "Light",
    preview: "#ffffff",
    colors: {
      // Background colors - Office / Google Docs inspired
      "--bg-primary": "#f5f5f5",
      "--bg-secondary": "#ffffff",
      "--bg-tertiary": "#e8e8e8",
      "--bg-card": "#ffffff",
      // Accent - professional blue
      "--accent-primary": "#0078d4",
      "--accent-secondary": "#106ebe",
      "--accent-gradient": "#0078d4",
      "--accent-glow": "rgba(0, 120, 212, 0.1)",
      // Text colors
      "--text-primary": "#1f1f1f",
      "--text-secondary": "#616161",
      "--text-muted": "#8a8a8a",
      // Feature colors
      "--compress-color": "#107c41",
      "--merge-color": "#0078d4",
      "--split-color": "#a4630a",
      // Borders
      "--border-color": "rgba(0, 0, 0, 0.1)",
    },
  },
};

// Apply theme to document root
export function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}
