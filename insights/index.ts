/**
 * Insights Module
 * Responsabile della generazione di insights personalizzati
 */

export interface InsightData {
  message: string;
  severity: "info" | "warning" | "critical";
  confidence: number; // 0-1, quanto siamo sicuri dell'insight
  category: "complexity" | "churn" | "coupling" | "size";
  filePath?: string;
  metric?: string;
}

export interface FileMetrics {
  path: string;
  cyclomatic: number;
  loc: number;
  churn: number;
  risk: number;
}

/**
 * Calcola il risk score per un file
 * Formula: (cyclomatic * 0.3) + (churn * 0.4) + (loc/100 * 0.3)
 */
export function calculateRiskScore(metrics: {
  cyclomatic: number;
  churn: number;
  loc: number;
}): number {
  const complexityScore = metrics.cyclomatic * 0.3;
  const churnScore = metrics.churn * 0.4;
  const locScore = (metrics.loc / 100) * 0.3;

  return parseFloat((complexityScore + churnScore + locScore).toFixed(2));
}

/**
 * Genera insights basati sulle metriche dei file
 */
export function generateInsights(files: FileMetrics[]): InsightData[] {
  const insights: InsightData[] = [];

  // Analisi complessità critica
  const veryHighComplexityFiles = files.filter((f) => f.cyclomatic > 20);
  if (veryHighComplexityFiles.length > 0) {
    const topFile = veryHighComplexityFiles.sort((a, b) => b.cyclomatic - a.cyclomatic)[0];
    insights.push({
      message: `🔴 ${veryHighComplexityFiles.length} file con complessità critica (>20). Il peggiore: ${topFile.path} (${topFile.cyclomatic}). Refactoring urgente necessario.`,
      severity: "critical",
      confidence: 0.9, // Alta confidenza: metrica oggettiva
      category: "complexity",
    });
  }

  // Analisi complessità alta
  const highComplexityFiles = files.filter((f) => f.cyclomatic > 10 && f.cyclomatic <= 20);
  if (highComplexityFiles.length > 0) {
    insights.push({
      message: `⚠️ ${highComplexityFiles.length} file con complessità elevata (10-20). Considera di suddividere funzioni complesse in moduli più piccoli.`,
      severity: "warning",
      confidence: 0.85,
      category: "complexity",
    });
  }

  // Analisi churn critico
  const veryHighChurnFiles = files.filter((f) => f.churn > 10);
  if (veryHighChurnFiles.length > 0) {
    const topFile = veryHighChurnFiles.sort((a, b) => b.churn - a.churn)[0];
    insights.push({
      message: `🔴 ${veryHighChurnFiles.length} file modificati molto frequentemente (>10 commit). ${topFile.path} ha ${topFile.churn} modifiche. Possibile instabilità del codice.`,
      severity: "critical",
      confidence: 0.8, // Buona confidenza: pattern storico chiaro
      category: "churn",
    });
  }

  // Analisi churn alto
  const highChurnFiles = files.filter((f) => f.churn > 5 && f.churn <= 10);
  if (highChurnFiles.length > 0) {
    insights.push({
      message: `⚠️ ${highChurnFiles.length} file con alto tasso di modifica (5-10 commit). Aggiungi test per prevenire regressioni.`,
      severity: "warning",
      confidence: 0.75,
      category: "churn",
    });
  }

  // Analisi rischio critico
  const criticalFiles = files.filter((f) => f.risk > 7);
  if (criticalFiles.length > 0) {
    const topFile = criticalFiles.sort((a, b) => b.risk - a.risk)[0];
    insights.push({
      message: `🔴 ${criticalFiles.length} file ad altissimo rischio (>7). ${topFile.path} ha risk score ${topFile.risk.toFixed(1)}. Priorità massima per refactoring.`,
      severity: "critical",
      confidence: 0.95, // Altissima confidenza: risk score è formula consolidata
      category: "complexity", // Risk è combinazione, ma prevalentemente complexity
    });
  }

  // Analisi rischio medio
  const mediumRiskFiles = files.filter((f) => f.risk > 4 && f.risk <= 7);
  if (mediumRiskFiles.length > 0) {
    insights.push({
      message: `⚠️ ${mediumRiskFiles.length} file a rischio medio (4-7). Pianifica refactoring graduale.`,
      severity: "warning",
      confidence: 0.8,
      category: "complexity",
    });
  }

  // Analisi file grandi
  const largeFiles = files.filter((f) => f.loc > 500);
  if (largeFiles.length > 0) {
    const topFile = largeFiles.sort((a, b) => b.loc - a.loc)[0];
    insights.push({
      message: `⚠️ ${largeFiles.length} file molto grandi (>500 LOC). ${topFile.path} ha ${topFile.loc} righe. Considera di suddividere in moduli più piccoli.`,
      severity: "warning",
      confidence: 0.7, // Media confidenza: LOC non sempre indica problema
      category: "size",
    });
  }

  // Correlazione complessità + churn
  const correlatedFiles = files.filter((f) => f.cyclomatic > 8 && f.churn > 5);
  if (correlatedFiles.length > 0) {
    insights.push({
      message: `⚠️ ${correlatedFiles.length} file hanno sia alta complessità che alto churn. Questi file sono particolarmente fragili e richiedono attenzione.`,
      severity: "warning",
      confidence: 0.9, // Alta confidenza: correlazione forte
      category: "coupling",
    });
  }

  // Insight positivo se tutto ok
  if (criticalFiles.length === 0 && veryHighComplexityFiles.length === 0) {
    insights.push({
      message: `✅ Nessun file critico rilevato. Il codebase è in buone condizioni. Continua con le best practices!`,
      severity: "info",
      confidence: 0.6, // Media confidenza: assenza di problemi non garantisce qualità
      category: "complexity",
    });
  }

  // Suggerimenti generali
  const avgComplexity = files.reduce((sum, f) => sum + f.cyclomatic, 0) / files.length;
  if (avgComplexity > 5) {
    insights.push({
      message: `💡 La complessità media è ${avgComplexity.toFixed(1)}. Target ideale: <5. Applica principi SOLID e pattern di design.`,
      severity: "info",
      confidence: 0.65,
      category: "complexity",
    });
  }

  return insights;
}

/**
 * Genera insights personalizzati per l'utente
 */
export function generatePersonalizedInsights(
  files: FileMetrics[],
  userPreferences?: { focus?: "quality" | "stability" | "performance" }
): InsightData[] {
  const baseInsights = generateInsights(files);

  // TODO: Aggiungere logica per personalizzazione basata su preferenze utente
  // e storico delle analisi precedenti

  return baseInsights;
}
