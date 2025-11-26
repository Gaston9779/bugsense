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

    console.log("[Insights] Fetching for user:", session.user.email, "repo:", repositoryId || "all");

    const where: any = {
      repository: { userId: session.user.id },
    };

    if (repositoryId) {
      where.repoId = repositoryId;
    }

    const insights = await prisma.insight.findMany({
      where,
      include: {
        repository: { select: { name: true, githubUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    console.log("[Insights] Found:", insights.length, "insights");
    console.log("[Insights] Sample:", insights.slice(0, 2));

    // Ordina manualmente per severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const sortedInsights = insights.sort((a, b) => {
      const orderA = severityOrder[a.severity as keyof typeof severityOrder] ?? 3;
      const orderB = severityOrder[b.severity as keyof typeof severityOrder] ?? 3;
      return orderA - orderB;
    });

    return NextResponse.json({ insights: sortedInsights });
  } catch (error) {
    console.error("[Insights] Error:", error);
    return NextResponse.json({ error: "Errore nel recupero insights" }, { status: 500 });
  }
}
