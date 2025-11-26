/**
 * Utility functions per formattazione date
 */

export function formatDate(date: Date | string | null): string {
  if (!date) return "Mai";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "Mai";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Mai";
  
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Pochi secondi fa";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuti fa`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} giorni fa`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} settimane fa`;
  
  return formatDate(d);
}

export function isRecentlyAnalyzed(date: Date | string | null, thresholdDays: number = 7): boolean {
  if (!date) return false;
  
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffInDays <= thresholdDays;
}
