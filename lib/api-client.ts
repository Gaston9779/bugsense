/**
 * Client-side API helper functions
 */

import { ApiResponse } from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Si è verificato un errore",
    }));
    throw new ApiError(
      error.message || "Si è verificato un errore",
      response.status,
      error.code
    );
  }

  return response.json();
}

export const api = {
  /**
   * Analizza un repository
   */
  async analyzeRepository(repositoryUrl: string): Promise<ApiResponse> {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repositoryUrl }),
    });

    return handleResponse(response);
  },

  /**
   * Ottieni statistiche dashboard
   */
  async getDashboardStats(): Promise<ApiResponse> {
    const response = await fetch("/api/dashboard/stats");
    return handleResponse(response);
  },

  /**
   * Ottieni lista repository
   */
  async getRepositories(): Promise<ApiResponse> {
    const response = await fetch("/api/repositories");
    return handleResponse(response);
  },

  /**
   * Ottieni dettagli repository
   */
  async getRepository(id: string): Promise<ApiResponse> {
    const response = await fetch(`/api/repositories/${id}`);
    return handleResponse(response);
  },

  /**
   * Elimina repository
   */
  async deleteRepository(id: string): Promise<ApiResponse> {
    const response = await fetch(`/api/repositories/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  /**
   * Ottieni file di un repository
   */
  async getRepositoryFiles(repositoryId: string): Promise<ApiResponse> {
    const response = await fetch(`/api/repositories/${repositoryId}/files`);
    return handleResponse(response);
  },

  /**
   * Ottieni insights
   */
  async getInsights(repositoryId?: string): Promise<ApiResponse> {
    const url = repositoryId
      ? `/api/insights?repositoryId=${repositoryId}`
      : "/api/insights";
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * Aggiorna preferenze utente
   */
  async updatePreferences(preferences: any): Promise<ApiResponse> {
    const response = await fetch("/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    return handleResponse(response);
  },
};

export { ApiError };
