/**
 * Plan Management & Access Control
 * Defines plan limits and feature access
 */

export type PlanType = "free" | "premium" | "pro";

export interface PlanLimits {
  maxRepositories: number;
  maxAnalysesPerDay: number;
  privateRepos: boolean;
  branchComparison: boolean;
  scheduledAnalyses: boolean;
  alertChannels: boolean;
  apiAccess: boolean;
  organizations: boolean;
  pdfReports: boolean;
  advancedInsights: boolean;
  historicalData: boolean; // full timeline
  couplingFull: boolean; // vs top 3
  teamSeats: number;
  retentionMonths: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxRepositories: 2,
    maxAnalysesPerDay: 5,
    privateRepos: false,
    branchComparison: false,
    scheduledAnalyses: false,
    alertChannels: false,
    apiAccess: false,
    organizations: false,
    pdfReports: false,
    advancedInsights: false,
    historicalData: false,
    couplingFull: false,
    teamSeats: 1,
    retentionMonths: 1,
  },
  premium: {
    maxRepositories: 10,
    maxAnalysesPerDay: -1, // unlimited
    privateRepos: true,
    branchComparison: false,
    scheduledAnalyses: false,
    alertChannels: false,
    apiAccess: false,
    organizations: false,
    pdfReports: true,
    advancedInsights: true,
    historicalData: true,
    couplingFull: true,
    teamSeats: 1,
    retentionMonths: 3,
  },
  pro: {
    maxRepositories: 30,
    maxAnalysesPerDay: -1, // unlimited
    privateRepos: true,
    branchComparison: true,
    scheduledAnalyses: true,
    alertChannels: true,
    apiAccess: true,
    organizations: true,
    pdfReports: true,
    advancedInsights: true,
    historicalData: true,
    couplingFull: true,
    teamSeats: 2,
    retentionMonths: 6,
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canAccessFeature(
  userPlan: PlanType,
  feature: keyof Omit<PlanLimits, "maxRepositories" | "maxAnalysesPerDay" | "teamSeats" | "retentionMonths">
): boolean {
  return PLAN_LIMITS[userPlan][feature] === true;
}

export function canAddRepository(userPlan: PlanType, currentRepoCount: number): boolean {
  const limit = PLAN_LIMITS[userPlan].maxRepositories;
  return currentRepoCount < limit;
}

export function canAnalyze(userPlan: PlanType, todayAnalysesCount: number): boolean {
  const limit = PLAN_LIMITS[userPlan].maxAnalysesPerDay;
  if (limit === -1) return true; // unlimited
  return todayAnalysesCount < limit;
}

export function getRequiredPlanForFeature(
  feature: keyof Omit<PlanLimits, "maxRepositories" | "maxAnalysesPerDay" | "teamSeats" | "retentionMonths">
): PlanType {
  if (PLAN_LIMITS.premium[feature]) return "premium";
  if (PLAN_LIMITS.pro[feature]) return "pro";
  return "free";
}

export const PLAN_NAMES: Record<PlanType, string> = {
  free: "Free Tier",
  premium: "Premium Standard",
  pro: "Pro",
};

export const PLAN_PRICES: Record<PlanType, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 9, yearly: 90 },
  pro: { monthly: 24, yearly: 240 },
};
