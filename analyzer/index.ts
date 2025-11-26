/**
 * Analyzer Module
 * Responsabile dell'analisi di complessità e metriche del codice
 */

export interface AnalysisResult {
  path: string;
  cyclomatic: number;
  loc: number;
  language: string;
}

/**
 * Calcola la complessità ciclomatica di un file
 */
export async function analyzeCyclomaticComplexity(
  content: string,
  language: string
): Promise<number> {
  // TODO: Implementare calcolo complessità ciclomatica
  // Usare librerie come:
  // - typhonjs-escomplex per JavaScript/TypeScript
  // - radon per Python
  // - Altri parser specifici per linguaggio
  console.log("Analyzing complexity for language:", language);
  return 0;
}

/**
 * Conta le linee di codice (LOC)
 */
export function countLinesOfCode(content: string): number {
  const lines = content.split("\n");
  // Rimuovi linee vuote e commenti (implementazione base)
  return lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith("//") && !trimmed.startsWith("#");
  }).length;
}

/**
 * Analizza un file completo
 */
export async function analyzeFile(
  content: string,
  path: string,
  language: string
): Promise<AnalysisResult> {
  const cyclomatic = await analyzeCyclomaticComplexity(content, language);
  const loc = countLinesOfCode(content);

  return {
    path,
    cyclomatic,
    loc,
    language,
  };
}

/**
 * Identifica il linguaggio di programmazione da un percorso file
 */
export function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    go: "Go",
    rs: "Rust",
    rb: "Ruby",
    php: "PHP",
  };

  return languageMap[ext || ""] || "Unknown";
}
