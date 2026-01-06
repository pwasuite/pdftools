// ============ INTERNATIONALIZATION ============

export const LANGUAGES = {
  en: { code: "en", name: "English" },
  fr: { code: "fr", name: "Français" },
};

export const translations = {
  en: {
    // Main page
    appTitle: "PDF Tools by PWA Suite",
    tagline: "Browser-based PDF tools powered by Ghostscript WASM",
    privacyFirst: "Privacy First:",
    privacyDesc:
      "All processing happens in your browser. No files are uploaded to any server. No cookies, no tracking.",
    licenseLink: "LICENSE, NO WARRANTY AND LIABILITY LIMITATION",
    openSource: "Open Source (on GitHub)",
    credits: "Credits and Special Thanks",
    by: "by",

    // Features
    compress: "Compress",
    compressDesc: "Reduce PDF file size",
    merge: "Merge",
    mergeDesc: "Combine multiple PDFs",
    split: "Split",
    splitDesc: "Split PDF into pages",
    extractPages: "Extract Pages",
    extractPagesDesc: "Extract a range of pages",
    grayscale: "Grayscale",
    grayscaleDesc: "Convert to black & white",
    resize: "Resize",
    resizeDesc: "Change page size (A4, Letter...)",

    // Common UI
    back: "Back",
    dropPdf: "Drop PDF here or click to select",
    dropPdfs: "Drop PDFs here or click to select",
    dropPdfToCompress: "Drop PDF to compress",
    dropPdfToSplit: "Drop PDF to split",
    dropPdfToExtract: "Drop PDF to extract pages",
    dropPdfToGrayscale: "Drop PDF to convert",
    dropPdfToResize: "Drop PDF to resize",
    addMoreFiles: "Add more files",
    processing: "Processing...",
    compressing: "Compressing...",
    merging: "Merging...",
    splitting: "Splitting...",
    extracting: "Extracting...",
    converting: "Converting...",
    resizing: "Resizing...",

    // Quality settings
    compressionQuality: "Compression Quality",
    quality: "Quality",
    smallest: "Smallest",
    best: "Best",
    screen: "Screen",
    screenDesc: "Smallest file, 72 DPI",
    ebook: "eBook",
    ebookDesc: "Good balance, 150 DPI",
    print: "Print",
    printDesc: "High quality, 300 DPI",
    prepress: "Prepress",
    prepressDesc: "Maximum quality",

    // Compress page
    compressPdf: "Compress PDF",
    compressAction: "🚀 Compress PDF",
    compressionComplete: "✅ Compression Complete!",
    compressionFailed: "❌ Compression Failed",
    errorOccurred: "An error occurred during compression. Please try again.",
    original: "Original",
    compressed: "Compressed",
    saved: "Saved",
    download: "📥 Download",
    compressAnother: "🔄 Compress Another",
    tryAgain: "Try Again",

    // Merge page
    mergePdfs: "Merge PDFs",
    filesSelected: "files selected",
    noFilesSelected: "No files selected",
    dragToReorder: "Drag to reorder",
    alsoCompress: "Also compress merged PDF",
    mergeAction: "🔗 Merge PDFs",
    mergeComplete: "✅ Merge Complete!",
    mergeFailed: "❌ Merge Failed",
    mergeError: "An error occurred during merge. Please try again.",
    mergedFile: "Merged file",
    mergeAnother: "🔄 Merge More Files",
    selectAtLeastTwo: "Select at least 2 PDF files to merge",

    // Split page
    splitPdf: "Split PDF",
    splitComplete: "✅ Split Complete!",
    splitFailed: "❌ Split Failed",
    splitError: "An error occurred during split. Please try again.",
    pagesExtracted: "pages extracted",
    downloadAll: "📦 Download All (ZIP)",
    splitAnother: "🔄 Split Another PDF",
    splitAction: "✂️ Split into Pages",
    splitInfo:
      "Each page will be extracted as a separate PDF file. You can download them individually or as a ZIP archive.",

    // Extract pages
    extractPagesTitle: "Extract Pages",
    pageRange: "Page Range",
    fromPage: "From page",
    toPage: "To page",
    extractAction: "📄 Extract Pages",
    extractComplete: "✅ Extraction Complete!",
    extractFailed: "❌ Extraction Failed",
    extractError: "An error occurred during extraction. Please try again.",
    extractedFile: "Extracted file",
    extractAnother: "🔄 Extract More Pages",
    willExtract: "Will extract",
    page: "page",
    pages: "pages",

    // Grayscale page
    grayscalePdf: "Grayscale PDF",
    grayscaleAction: "🎨 Convert to Grayscale",
    grayscaleComplete: "✅ Conversion Complete!",
    grayscaleSuccess: "Your PDF is now in black & white.",
    grayscaleFailed: "❌ Conversion Failed",
    grayscaleError: "An error occurred during conversion. Please try again.",
    convertedFile: "Converted file",
    grayscaleAnother: "🔄 Convert Another",
    grayscaleInfo:
      "Converts all colors to shades of gray. Useful for printing or reducing file size.",

    // Resize page
    resizePdf: "Resize PDF",
    targetSize: "Target paper size",
    resizeAction: "📐 Resize PDF",
    resizeComplete: "✅ Resize Complete!",
    resizeSuccess: "Your PDF has been resized to",
    resizeFailed: "❌ Resize Failed",
    resizeError: "An error occurred during resize. Please try again.",
    resizedFile: "Resized file",
    resizeAnother: "🔄 Resize Another",
    resizeHint: "Pages will be scaled to fit the selected size.",
    resizeWarning: "This feature does not work with all files. Please double check the result.",

    // Credits page
    creditsTitle: "❤️ Credits and Special Thanks",
    coretech: "Core Technology",
    coretechDesc:
      "This application uses Ghostscript compiled to WebAssembly, allowing powerful PDF processing directly in your browser without any server-side processing.",
    wasmPort: "WASM Port",
    wasmPortDesc: "WASM compilation and port by",
    originalProject: "Original Project",
    originalProjectDesc: "Based on",
    originalProjectBy: "by Laurent Meyer",
    builtWith: "Built With",
    reactDesc: "UI library for building the interface",
    viteDesc: "Fast build tool and dev server",
    jszipDesc: "Library for managing ZIP files in the browser",
    dependencies: "Dependencies",
    dependenciesNote:
      "This project also uses JSZip for creating ZIP archives, and various build tools including Vite and React.",
    aiTools: "AI Tools",
    aiToolsDesc:
      "Tools like Google Antigravity, Gemini, and Anthropic Claude Opus were used for productivity during this project development.",
    aiToolsPrivacy:
      "Using this website does NOT involve using any AI tools. All processing is done locally on your device and your information stays in your browser.",
    thankHim: "Thank Him For Everything!",
    thankHimDesc: "You may use this software with your own beliefs but I don't believe in atheism.",
    specialThanks: "Special thanks",
    toGod: "to God.",
    openSourceSection: "Open Source",
    openSourceDesc:
      "This project is open source and available on GitHub. Contributions and feedback are welcome!",
    viewOnGithub: "View on GitHub",

    // License page
    licenseTitle: "📜 License",
  },

  fr: {
    // Main page
    appTitle: "Outils PDF par PWA Suite",
    tagline: "Outils PDF dans le navigateur propulsés par Ghostscript WASM",
    privacyFirst: "Confidentialité d'abord :",
    privacyDesc:
      "Tout le traitement se fait dans votre navigateur. Aucun fichier n'est envoyé à un serveur. Pas de cookies, pas de suivi.",
    licenseLink: "LICENCE, AUCUNE GARANTIE ET LIMITATION DE RESPONSABILITÉ",
    openSource: "Code source ouvert (sur GitHub)",
    credits: "Crédits et remerciements",
    by: "par",

    // Features
    compress: "Compresser",
    compressDesc: "Réduire la taille du fichier PDF",
    merge: "Fusionner",
    mergeDesc: "Combiner plusieurs PDF",
    split: "Diviser",
    splitDesc: "Diviser le PDF en pages",
    extractPages: "Extraire des pages",
    extractPagesDesc: "Extraire une plage de pages",
    grayscale: "Niveaux de gris",
    grayscaleDesc: "Convertir en noir et blanc",
    resize: "Redimensionner",
    resizeDesc: "Changer la taille de page (A4, Letter...)",

    // Common UI
    back: "Retour",
    dropPdf: "Déposez un PDF ici ou cliquez pour sélectionner",
    dropPdfs: "Déposez des PDF ici ou cliquez pour sélectionner",
    dropPdfToCompress: "Déposez un PDF à compresser",
    dropPdfToSplit: "Déposez un PDF à diviser",
    dropPdfToExtract: "Déposez un PDF pour extraire des pages",
    dropPdfToGrayscale: "Déposez un PDF à convertir",
    dropPdfToResize: "Déposez un PDF à redimensionner",
    addMoreFiles: "Ajouter plus de fichiers",
    processing: "Traitement en cours...",
    compressing: "Compression en cours...",
    merging: "Fusion en cours...",
    splitting: "Division en cours...",
    extracting: "Extraction en cours...",
    converting: "Conversion en cours...",
    resizing: "Redimensionnement en cours...",

    // Quality settings
    compressionQuality: "Qualité de compression",
    quality: "Qualité",
    smallest: "Plus petit",
    best: "Meilleur",
    screen: "Écran",
    screenDesc: "Fichier le plus petit, 72 DPI",
    ebook: "eBook",
    ebookDesc: "Bon équilibre, 150 DPI",
    print: "Impression",
    printDesc: "Haute qualité, 300 DPI",
    prepress: "Prépresse",
    prepressDesc: "Qualité maximale",

    // Compress page
    compressPdf: "Compresser PDF",
    compressAction: "🚀 Compresser le PDF",
    compressionComplete: "✅ Compression terminée !",
    compressionFailed: "❌ Échec de la compression",
    errorOccurred: "Une erreur s'est produite lors de la compression. Veuillez réessayer.",
    original: "Original",
    compressed: "Compressé",
    saved: "Économisé",
    download: "📥 Télécharger",
    compressAnother: "🔄 Compresser un autre",
    tryAgain: "Réessayer",

    // Merge page
    mergePdfs: "Fusionner des PDF",
    filesSelected: "fichiers sélectionnés",
    noFilesSelected: "Aucun fichier sélectionné",
    dragToReorder: "Glisser pour réorganiser",
    alsoCompress: "Compresser aussi le PDF fusionné",
    mergeAction: "🔗 Fusionner les PDF",
    mergeComplete: "✅ Fusion terminée !",
    mergeFailed: "❌ Échec de la fusion",
    mergeError: "Une erreur s'est produite lors de la fusion. Veuillez réessayer.",
    mergedFile: "Fichier fusionné",
    mergeAnother: "🔄 Fusionner d'autres fichiers",
    selectAtLeastTwo: "Sélectionnez au moins 2 fichiers PDF à fusionner",

    // Split page
    splitPdf: "Diviser PDF",
    splitComplete: "✅ Division terminée !",
    splitFailed: "❌ Échec de la division",
    splitError: "Une erreur s'est produite lors de la division. Veuillez réessayer.",
    pagesExtracted: "pages extraites",
    downloadAll: "📦 Télécharger tout (ZIP)",
    splitAnother: "🔄 Diviser un autre PDF",
    splitAction: "✂️ Diviser en pages",
    splitInfo:
      "Chaque page sera extraite en tant que fichier PDF séparé. Vous pouvez les télécharger individuellement ou en archive ZIP.",

    // Extract pages
    extractPagesTitle: "Extraire des pages",
    pageRange: "Plage de pages",
    fromPage: "De la page",
    toPage: "À la page",
    extractAction: "📄 Extraire les pages",
    extractComplete: "✅ Extraction terminée !",
    extractFailed: "❌ Échec de l'extraction",
    extractError: "Une erreur s'est produite lors de l'extraction. Veuillez réessayer.",
    extractedFile: "Fichier extrait",
    extractAnother: "🔄 Extraire d'autres pages",
    willExtract: "Extraira",
    page: "page",
    pages: "pages",

    // Grayscale page
    grayscalePdf: "PDF en niveaux de gris",
    grayscaleAction: "🎨 Convertir en niveaux de gris",
    grayscaleComplete: "✅ Conversion terminée !",
    grayscaleSuccess: "Votre PDF est maintenant en noir et blanc.",
    grayscaleFailed: "❌ Échec de la conversion",
    grayscaleError: "Une erreur s'est produite lors de la conversion. Veuillez réessayer.",
    convertedFile: "Fichier converti",
    grayscaleAnother: "🔄 Convertir un autre",
    grayscaleInfo:
      "Convertit toutes les couleurs en nuances de gris. Utile pour l'impression ou la réduction de la taille du fichier.",

    // Resize page
    resizePdf: "Redimensionner PDF",
    targetSize: "Taille de papier cible",
    resizeAction: "📐 Redimensionner le PDF",
    resizeComplete: "✅ Redimensionnement terminé !",
    resizeSuccess: "Votre PDF a été redimensionné en",
    resizeFailed: "❌ Échec du redimensionnement",
    resizeError: "Une erreur s'est produite lors du redimensionnement. Veuillez réessayer.",
    resizedFile: "Fichier redimensionné",
    resizeAnother: "🔄 Redimensionner un autre",
    resizeHint: "Les pages seront mises à l'échelle pour s'adapter à la taille sélectionnée.",
    resizeWarning:
      "Cette fonctionnalité ne fonctionne pas avec tous les fichiers. Veuillez vérifier le résultat.",

    // Credits page
    creditsTitle: "❤️ Crédits et remerciements",
    coretech: "Technologie principale",
    coretechDesc:
      "Cette application utilise Ghostscript compilé en WebAssembly, permettant un traitement PDF puissant directement dans votre navigateur sans aucun traitement côté serveur.",
    wasmPort: "Port WASM",
    wasmPortDesc: "Compilation et portage WASM par",
    originalProject: "Projet original",
    originalProjectDesc: "Basé sur",
    originalProjectBy: "par Laurent Meyer",
    builtWith: "Construit avec",
    reactDesc: "Bibliothèque UI pour construire l'interface",
    viteDesc: "Outil de build rapide et serveur de développement",
    jszipDesc: "Bibliothèque pour gérer les fichiers ZIP dans le navigateur",
    dependencies: "Dépendances",
    dependenciesNote:
      "Ce projet utilise également JSZip pour créer des archives ZIP, et divers outils de construction incluant Vite et React.",
    aiTools: "Outils IA",
    aiToolsDesc:
      "Des outils comme Google Antigravity, Gemini et Anthropic Claude Opus ont été utilisés pour la productivité lors du développement de ce projet.",
    aiToolsPrivacy:
      "L'utilisation de ce site web n'implique PAS l'utilisation d'outils IA. Tout le traitement est effectué localement sur votre appareil et vos informations restent dans votre navigateur.",
    thankHim: "Remerciez-le pour toutes choses !",
    thankHimDesc:
      "Vous pouvez utiliser ce logiciel avec vos propres croyances mais je ne crois pas en l'athéisme.",
    specialThanks: "Remerciements spéciaux",
    toGod: "à Dieu.",
    openSourceSection: "Code source ouvert",
    openSourceDesc:
      "Ce projet est open source et disponible sur GitHub. Les contributions et commentaires sont les bienvenus !",
    viewOnGithub: "Voir sur GitHub",

    // License page
    licenseTitle: "📜 Licence",
  },
};

// Get translation function
export function getTranslation(lang) {
  const t = translations[lang] || translations.en;
  return (key) => t[key] || translations.en[key] || key;
}

// Detect browser language
export function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const shortLang = browserLang.split("-")[0];
  return LANGUAGES[shortLang] ? shortLang : "en";
}
