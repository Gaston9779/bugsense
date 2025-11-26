/**
 * Costanti dell'applicazione BugSense
 */

// Soglie per le metriche
export const THRESHOLDS = {
  complexity: {
    low: 5,
    medium: 10,
    high: 15,
    critical: 20,
  },
  churn: {
    low: 5,
    medium: 10,
    high: 20,
    critical: 30,
  },
  loc: {
    small: 100,
    medium: 300,
    large: 500,
    huge: 1000,
  },
  riskScore: {
    low: 3,
    medium: 7,
    high: 10,
    critical: 15,
  },
} as const;

// Severity levels per insights
export const SEVERITY_LEVELS = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

// Linguaggi supportati
export const SUPPORTED_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "C",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "C#",
  "Swift",
  "Kotlin",
  "Scala",
] as const;

// Estensioni file per linguaggio
export const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  TypeScript: [".ts", ".tsx"],
  JavaScript: [".js", ".jsx", ".mjs"],
  Python: [".py"],
  Java: [".java"],
  "C++": [".cpp", ".cc", ".cxx", ".hpp", ".h"],
  C: [".c", ".h"],
  Go: [".go"],
  Rust: [".rs"],
  Ruby: [".rb"],
  PHP: [".php"],
  "C#": [".cs"],
  Swift: [".swift"],
  Kotlin: [".kt", ".kts"],
  Scala: [".scala"],
};

// Configurazione analisi
export const ANALYSIS_CONFIG = {
  maxFileSize: 1024 * 1024, // 1MB
  excludePatterns: [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "coverage/**",
    "*.test.*",
    "*.spec.*",
    "*.min.*",
  ],
  timeout: 30000, // 30 secondi
} as const;

// Messaggi UI
export const UI_MESSAGES = {
  errors: {
    authentication: "Devi essere autenticato per accedere a questa funzionalità",
    notFound: "Risorsa non trovata",
    serverError: "Si è verificato un errore. Riprova più tardi",
    analysisError: "Errore durante l'analisi del repository",
  },
  success: {
    analysisComplete: "Analisi completata con successo",
    repositoryAdded: "Repository aggiunto con successo",
    settingsSaved: "Impostazioni salvate",
  },
  loading: {
    analyzing: "Analisi in corso...",
    loading: "Caricamento...",
    fetchingData: "Recupero dati...",
  },
} as const;

// Colori per le severity
export const SEVERITY_COLORS = {
  info: "blue",
  warning: "yellow",
  critical: "red",
} as const;

// Limiti applicazione
export const APP_LIMITS = {
  maxRepositories: 50,
  maxFilesPerRepo: 10000,
  maxInsightsPerRepo: 100,
} as const;
