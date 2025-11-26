/**
 * Types condivisi per l'applicazione BugSense
 */

// Repository types
export type Repository = {
  id: string;
  userId: string;
  name: string;
  githubUrl: string;
  lastAnalyzed: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RepositoryWithStats = Repository & {
  _count: {
    files: number;
    insights: number;
  };
  avgRiskScore?: number;
  criticalInsightsCount?: number;
};

// File types
export type FileMetrics = {
  id: string;
  repoId: string;
  path: string;
  language: string | null;
  cyclomatic: number | null;
  loc: number | null;
  churn: number | null;
  riskScore: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FileWithRepository = FileMetrics & {
  repository: Repository;
};

// Insight types
export type Insight = {
  id: string;
  repoId: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
};

export type InsightWithRepository = Insight & {
  repository: Repository;
};

// Analysis types
export interface AnalysisRequest {
  repositoryUrl: string;
  branch?: string;
}

export interface AnalysisResult {
  repositoryId: string;
  filesAnalyzed: number;
  insightsGenerated: number;
  avgComplexity: number;
  avgRiskScore: number;
  duration: number;
}

export interface AnalysisProgress {
  stage: "cloning" | "analyzing" | "generating_insights" | "complete";
  progress: number;
  currentFile?: string;
  message: string;
}

// Dashboard types
export interface DashboardStats {
  totalRepositories: number;
  totalFiles: number;
  avgChurn: number;
  avgRiskScore: number;
  criticalInsights: number;
  recentlyAnalyzed: Repository[];
  topRiskyFiles: FileMetrics[];
}

// Settings types
export interface UserPreferences {
  focus: "quality" | "stability" | "performance" | "balanced";
  riskThreshold: number;
  emailNotifications: boolean;
  autoAnalyze: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter and Sort types
export type SortOrder = "asc" | "desc";

export interface FileFilters {
  language?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
  minComplexity?: number;
  maxComplexity?: number;
}

export interface RepositoryFilters {
  lastAnalyzedAfter?: Date;
  hasInsights?: boolean;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: Date;
  value: number;
}

// GitHub types
export interface GitHubRepository {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  language: string | null;
  size: number;
  updatedAt: Date;
}

export interface GitHubFile {
  path: string;
  content: string;
  size: number;
  sha: string;
}
