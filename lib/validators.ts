import { z } from "zod";

/**
 * Schema di validazione per i dati dell'applicazione
 */

// Validazione URL GitHub
export const githubUrlSchema = z.string().refine(
  (url) => {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
    return regex.test(url);
  },
  {
    message: "URL GitHub non valido. Formato atteso: https://github.com/username/repository",
  }
);

// Validazione nome repository
export const repositoryNameSchema = z
  .string()
  .min(1, "Il nome del repository è obbligatorio")
  .max(100, "Il nome del repository è troppo lungo")
  .regex(/^[\w.-]+$/, "Il nome può contenere solo lettere, numeri, trattini e punti");

// Validazione path file
export const filePathSchema = z
  .string()
  .min(1, "Il path del file è obbligatorio")
  .max(500, "Il path del file è troppo lungo");

// Validazione severity
export const severitySchema = z.enum(["info", "warning", "critical"]);

// Schema per creare un repository
export const createRepositorySchema = z.object({
  name: repositoryNameSchema,
  githubUrl: githubUrlSchema,
});

// Schema per aggiornare preferenze utente
export const updatePreferencesSchema = z.object({
  focus: z.enum(["quality", "stability", "performance", "balanced"]).optional(),
  riskThreshold: z.number().min(1).max(100).optional(),
  emailNotifications: z.boolean().optional(),
});

// Schema per file metrics
export const fileMetricsSchema = z.object({
  path: filePathSchema,
  language: z.string(),
  cyclomatic: z.number().min(0),
  loc: z.number().min(0),
  churn: z.number().min(0),
  riskScore: z.number().min(0),
});

// Schema per insight
export const insightSchema = z.object({
  message: z.string().min(1).max(500),
  severity: severitySchema,
  filePath: filePathSchema.optional(),
  metric: z.string().optional(),
});

// Helper per validare dati
export function validateGithubUrl(url: string): { success: boolean; error?: string } {
  try {
    githubUrlSchema.parse(url);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Errore di validazione" };
  }
}

export function extractGithubInfo(url: string): { owner: string; repo: string } | null {
  const regex = /^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)$/;
  const match = url.match(regex);
  
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""), // Rimuovi .git se presente
  };
}

// Validazione formato email
export const emailSchema = z.string().email("Email non valida");

// Validazione token GitHub
export const githubTokenSchema = z
  .string()
  .regex(/^gh[ps]_[a-zA-Z0-9]{36,}$/, "Token GitHub non valido");

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type FileMetrics = z.infer<typeof fileMetricsSchema>;
export type InsightInput = z.infer<typeof insightSchema>;
