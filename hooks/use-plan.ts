"use client";

import { useSession } from "next-auth/react";
import { PlanType, canAccessFeature, PLAN_LIMITS, getPlanLimits } from "@/lib/plans";
import { useMemo } from "react";

export function usePlan() {
  const { data: session } = useSession();

  const plan: PlanType = useMemo(() => {
    // @ts-ignore - plan field exists after migration
    return (session?.user?.plan as PlanType) || "free";
  }, [session]);

  const limits = useMemo(() => getPlanLimits(plan), [plan]);

  const hasAccess = useMemo(
    () => (feature: keyof Omit<typeof PLAN_LIMITS.pro, 'maxRepositories' | 'maxAnalysesPerDay' | 'teamSeats' | 'retentionMonths'>) => {
      return canAccessFeature(plan, feature);
    },
    [plan]
  );

  const isPro = plan === "pro";
  const isPremium = plan === "premium" || plan === "pro";
  const isFree = plan === "free";

  return {
    plan,
    limits,
    hasAccess,
    isPro,
    isPremium,
    isFree,
  };
}
