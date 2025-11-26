/**
 * Access Control Middleware
 * Verifies user plan and feature access
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanType, canAccessFeature, PLAN_LIMITS } from "@/lib/plans";
import { NextResponse } from "next/server";

export interface AccessControlResult {
  allowed: boolean;
  user?: {
    id: string;
    email: string;
    plan: PlanType;
  };
  error?: string;
}

/**
 * Verify user is authenticated and has required plan
 */
export async function verifyAccess(requiredFeature?: keyof typeof PLAN_LIMITS.pro): Promise<AccessControlResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      allowed: false,
      error: "Unauthorized - Please sign in",
    };
  }

  // Fetch user with plan
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      plan: true,
    },
  });

  if (!user) {
    return {
      allowed: false,
      error: "User not found",
    };
  }

  const userPlan = (user.plan as PlanType) || "free";

  // If no specific feature required, just check auth
  if (!requiredFeature) {
    return {
      allowed: true,
      user: {
        id: user.id,
        email: user.email || "",
        plan: userPlan,
      },
    };
  }

  // Check feature access
  // TRIAL MODE: Allow all features in development
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasAccess = isDevelopment ? true : canAccessFeature(userPlan, requiredFeature);

  if (!hasAccess) {
    return {
      allowed: false,
      user: {
        id: user.id,
        email: user.email || "",
        plan: userPlan,
      },
      error: `This feature requires a higher plan. Your current plan: ${userPlan}`,
    };
  }

  return {
    allowed: true,
    user: {
      id: user.id,
      email: user.email || "",
      plan: userPlan,
    },
  };
}

/**
 * API Route wrapper with access control
 */
export function withAccessControl(
  handler: (req: Request, context: { user: NonNullable<AccessControlResult["user"]> }) => Promise<Response>,
  requiredFeature?: keyof typeof PLAN_LIMITS.pro
) {
  return async (req: Request, routeContext?: any) => {
    const access = await verifyAccess(requiredFeature);

    if (!access.allowed || !access.user) {
      return NextResponse.json(
        { error: access.error || "Access denied" },
        { status: access.error?.includes("sign in") ? 401 : 403 }
      );
    }

    return handler(req, { user: access.user });
  };
}

/**
 * Check if user can perform action based on daily limits
 */
export async function checkDailyLimit(userId: string, action: "analysis"): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return false;

  const userPlan = (user.plan as PlanType) || "free";
  const limits = PLAN_LIMITS[userPlan];

  if (action === "analysis") {
    if (limits.maxAnalysesPerDay === -1) return true; // unlimited

    // Count analyses today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.repository.count({
      where: {
        userId,
        lastAnalyzed: {
          gte: today,
        },
      },
    });

    return count < limits.maxAnalysesPerDay;
  }

  return false;
}

/**
 * Check repository limit
 */
export async function checkRepositoryLimit(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return false;

  const userPlan = (user.plan as PlanType) || "free";
  const limits = PLAN_LIMITS[userPlan];

  const count = await prisma.repository.count({
    where: { userId },
  });

  return count < limits.maxRepositories;
}
