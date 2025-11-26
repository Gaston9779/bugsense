/**
 * GitHub API Client
 * Wrapper per interazioni con GitHub API
 */

import { GitHubRepository, GitHubFile } from "@/types";

class GitHubClient {
  private token: string | undefined;
  private baseUrl = "https://api.github.com";

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Ottieni informazioni su un repository
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const data = await this.fetch(`/repos/${owner}/${repo}`);

    return {
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      url: data.html_url,
      defaultBranch: data.default_branch,
      language: data.language,
      size: data.size,
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Ottieni il contenuto di un file
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubFile> {
    const params = ref ? `?ref=${ref}` : "";
    const data = await this.fetch(`/repos/${owner}/${repo}/contents/${path}${params}`);

    if (data.type !== "file") {
      throw new Error(`${path} is not a file`);
    }

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path: data.path,
      content,
      size: data.size,
      sha: data.sha,
    };
  }

  /**
   * Ottieni lista file in un repository (ricorsivamente)
   */
  async getRepositoryFiles(
    owner: string,
    repo: string,
    path: string = "",
    ref?: string
  ): Promise<string[]> {
    const params = ref ? `?ref=${ref}` : "";
    const data = await this.fetch(`/repos/${owner}/${repo}/contents/${path}${params}`);

    if (!Array.isArray(data)) {
      return [];
    }

    const files: string[] = [];

    for (const item of data) {
      if (item.type === "file") {
        files.push(item.path);
      } else if (item.type === "dir") {
        // Ricorsivamente ottieni file dalla directory
        const subFiles = await this.getRepositoryFiles(owner, repo, item.path, ref);
        files.push(...subFiles);
      }
    }

    return files;
  }

  /**
   * Ottieni commit history per un file
   */
  async getFileCommits(
    owner: string,
    repo: string,
    path: string
  ): Promise<number> {
    try {
      const data = await this.fetch(
        `/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=100`
      );
      return Array.isArray(data) ? data.length : 0;
    } catch (error) {
      console.error(`Error fetching commits for ${path}:`, error);
      return 0;
    }
  }

  /**
   * Ottieni lista dei linguaggi nel repository
   */
  async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    return this.fetch(`/repos/${owner}/${repo}/languages`);
  }

  /**
   * Lista repository dell'utente autenticato
   */
  async listUserRepos(options?: { perPage?: number; page?: number; visibility?: "all" | "public" | "private" }) {
    const per_page = options?.perPage ?? 50;
    const page = options?.page ?? 1;
    const visibility = options?.visibility ?? "all";
    const q = `?per_page=${per_page}&page=${page}&visibility=${visibility}`;
    return this.fetch(`/user/repos${q}`);
  }

  /**
   * Verifica se un repository esiste ed è accessibile
   */
  async repositoryExists(owner: string, repo: string): Promise<boolean> {
    try {
      await this.getRepository(owner, repo);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const githubClient = new GitHubClient();

// Export class per custom instances
export { GitHubClient };
