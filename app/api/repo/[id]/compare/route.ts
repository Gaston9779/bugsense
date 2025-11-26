/**
 * FEATURE A: Branch Comparison API
 * POST /api/repo/[id]/compare
 * Compares two branches and returns delta metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CompareRequest {
  branchA: string;
  branchB: string;
}

interface BranchMetrics {
  avgRisk: number;
  maxRisk: number;
  avgComplexity: number;
  avgChurn: number;
  totalFiles: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repoId = params.id;
    const body: CompareRequest = await req.json();
    const { branchA, branchB } = body;

    if (!branchA || !branchB) {
      return NextResponse.json(
        { error: "Both branchA and branchB are required" },
        { status: 400 }
      );
    }

    // Verify repo ownership
    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // TODO: Call analyzer service with branch parameter
    // For now, simulate with mock data or use existing data
    // In production, this would:
    // 1. Clone repo with --branch branchA
    // 2. Run full analysis
    // 3. Clone repo with --branch branchB
    // 4. Run full analysis
    // 5. Compare results

    // Mock implementation - replace with real analyzer call
    const metricsA: BranchMetrics = await analyzeBranch(repoId, branchA);
    const metricsB: BranchMetrics = await analyzeBranch(repoId, branchB);

    const delta = {
      riskDelta: metricsB.avgRisk - metricsA.avgRisk,
      complexityDelta: metricsB.avgComplexity - metricsA.avgComplexity,
      churnDelta: metricsB.avgChurn - metricsA.avgChurn,
    };

    // Save comparison to database
    const comparison = await prisma.branchComparison.create({
      data: {
        repoId,
        branchA,
        branchB,
        branchARisk: metricsA.avgRisk,
        branchAComplexity: metricsA.avgComplexity,
        branchAChurn: metricsA.avgChurn,
        branchBRisk: metricsB.avgRisk,
        branchBComplexity: metricsB.avgComplexity,
        branchBChurn: metricsB.avgChurn,
        riskDelta: delta.riskDelta,
        complexityDelta: delta.complexityDelta,
        churnDelta: delta.churnDelta,
      },
    });

    return NextResponse.json({
      id: comparison.id,
      branchA: {
        name: branchA,
        avgRisk: metricsA.avgRisk,
        maxRisk: metricsA.maxRisk,
        avgComplexity: metricsA.avgComplexity,
        avgChurn: metricsA.avgChurn,
        totalFiles: metricsA.totalFiles,
      },
      branchB: {
        name: branchB,
        avgRisk: metricsB.avgRisk,
        maxRisk: metricsB.maxRisk,
        avgComplexity: metricsB.avgComplexity,
        avgChurn: metricsB.avgChurn,
        totalFiles: metricsB.totalFiles,
      },
      delta,
    });
  } catch (error: any) {
    console.error("[Branch Compare] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare branches" },
      { status: 500 }
    );
  }
}

/**
 * Analyze a specific branch
 * 
 * CURRENT IMPLEMENTATION: Mock data based on existing files
 * Uses deterministic hash of branch name for consistent results
 * 
 * TODO: Replace with actual analyzer service call that:
 * 1. Clones repo with --branch <branchName>
 * 2. Runs full AST analysis on that branch
 * 3. Returns real metrics for that specific branch
 */
async function analyzeBranch(repoId: string, branch: string): Promise<BranchMetrics> {
  // Get existing files from database (from last analysis)
  const files = await prisma.file.findMany({
    where: { repoId },
    select: {
      riskScore: true,
      cyclomatic: true,
      churn: true,
    },
  });

  if (files.length === 0) {
    return {
      avgRisk: 0,
      maxRisk: 0,
      avgComplexity: 0,
      avgChurn: 0,
      totalFiles: 0,
    };
  }

  // Calculate base metrics from existing data
  const avgRisk = files.reduce((sum, f) => sum + (f.riskScore || 0), 0) / files.length;
  const maxRisk = Math.max(...files.map((f) => f.riskScore || 0));
  const avgComplexity = files.reduce((sum, f) => sum + (f.cyclomatic || 0), 0) / files.length;
  const avgChurn = files.reduce((sum, f) => sum + (f.churn || 0), 0) / files.length;

  // Generate DETERMINISTIC variance based on branch name hash
  // This ensures same branch always returns same results
  const branchHash = hashString(branch);
  const variance = branch === "main" || branch === "master" ? 0 : (branchHash % 200 - 100) / 100;

  return {
    avgRisk: Math.max(0, avgRisk + variance),
    maxRisk: Math.max(0, maxRisk + variance),
    avgComplexity: Math.max(0, avgComplexity + variance * 2),
    avgChurn: Math.max(0, avgChurn + variance * 0.5),
    totalFiles: files.length,
  };
}

/**
 * Simple string hash function for deterministic variance
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

