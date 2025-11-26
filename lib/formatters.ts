/**
 * Utility functions per formattazione numeri e testo
 */

/**
 * Formatta un numero con separatori delle migliaia
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("it-IT").format(num);
}

/**
 * Formatta un numero come percentuale
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

/**
 * Formatta bytes in formato leggibile (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formatta un risk score con colore
 */
export function getRiskScoreColor(score: number): string {
  if (score < 3) return "text-green-600";
  if (score < 7) return "text-yellow-600";
  if (score < 10) return "text-orange-600";
  return "text-red-600";
}

/**
 * Formatta un risk score con label
 */
export function getRiskScoreLabel(score: number): string {
  if (score < 3) return "Basso";
  if (score < 7) return "Medio";
  if (score < 10) return "Alto";
  return "Critico";
}

/**
 * Formatta complessità ciclomatica con label
 */
export function getComplexityLabel(complexity: number): string {
  if (complexity <= 5) return "Semplice";
  if (complexity <= 10) return "Moderata";
  if (complexity <= 15) return "Alta";
  return "Molto Alta";
}

/**
 * Formatta complessità ciclomatica con colore
 */
export function getComplexityColor(complexity: number): string {
  if (complexity <= 5) return "text-green-600";
  if (complexity <= 10) return "text-blue-600";
  if (complexity <= 15) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Tronca testo lungo con ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Formatta un path file rimuovendo prefissi comuni
 */
export function formatFilePath(path: string): string {
  // Rimuovi prefissi comuni come src/, app/, etc
  const cleanPath = path.replace(/^(src\/|app\/|lib\/|components\/)/, "");
  return cleanPath;
}

/**
 * Ottieni iniziali da un nome
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formatta un numero come compatto (1K, 1M, etc)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Calcola la percentuale
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Formatta durata in secondi
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
