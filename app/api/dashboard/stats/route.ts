import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repositoryId = searchParams.get("repositoryId");

    console.log("[Dashboard Stats] Fetching for user:", session.user.email, "repo:", repositoryId || "all");

    // Sempre mostra TUTTE le repo dell'utente
    const repos = await prisma.repository.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { files: true, insights: true },
        },
      },
      orderBy: { lastAnalyzed: "desc" },
    });

    const fileWhere: any = repositoryId 
      ? { repoId: repositoryId }
      : { repository: { userId: session.user.id } };

    const totalFiles = await prisma.file.count({
      where: fileWhere,
    });

    const avgRiskScore = await prisma.file.aggregate({
      where: fileWhere,
      _avg: { riskScore: true },
    });

    const insightWhere: any = repositoryId
      ? { repoId: repositoryId }
      : { repository: { userId: session.user.id } };

    const criticalInsights = await prisma.insight.count({
      where: {
        ...insightWhere,
        severity: "critical",
      },
    });

    const topRiskyFiles = await prisma.file.findMany({
      where: fileWhere,
      orderBy: { riskScore: "desc" },
      take: 10,
      include: { repository: { select: { name: true } } },
    });

    const payload = {
      totalRepositories: repos.length,
      totalFiles,
      avgRiskScore: avgRiskScore._avg.riskScore || 0,
      criticalInsights,
      repositories: repos,
      topRiskyFiles,
    };

    console.log("[Dashboard Stats] Returning:", payload);

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[Dashboard Stats] Error:", error);
    return NextResponse.json({ error: "Errore nel recupero statistiche" }, { status: 500 });
  }
}
