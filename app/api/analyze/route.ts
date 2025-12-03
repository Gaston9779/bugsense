import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateGithubUrl, extractGithubInfo } from "@/lib/validators";
import { githubClient, GitHubClient } from "@/lib/github-client";
import { analyzeCyclomaticComplexity, countLinesOfCode, detectLanguage } from "@/analyzer";
import { calculateRiskScore, generateInsights } from "@/insights";

// Analizza correlazioni tra file basandosi sui commit
async function analyzeFileCorrelations(
  client: GitHubClient,
  owner: string,
  repo: string,
  repoId: string
) {
  // Nota: la versione corrente di GitHubClient non espone più l'istanza Octokit.
  // Per evitare errori di build e mantenere l'analisi principale funzionante,
  // questa funzione è temporaneamente disabilitata.
  console.log("[Correlations] Skipped: GitHubClient does not expose raw Octokit in this build");
}

// Limit analysis to avoid heavy requests in dev
const MAX_FILES = 50;
const INCLUDE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".java",
  ".go",
  ".rs",
  ".rb",
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    console.log("[Analyze] Incoming request by user:", session.user.email, body);
    const repositoryUrl: string | undefined = body?.repositoryUrl;
    const branch: string | undefined = body?.branch;

    const { success, error } = validateGithubUrl(repositoryUrl || "");
    if (!success || !repositoryUrl) {
      return NextResponse.json(
        { error: error || "URL repository GitHub non valido" },
        { status: 400 }
      );
    }

    const info = extractGithubInfo(repositoryUrl);
    if (!info) {
      return NextResponse.json({ error: "URL repository non valido" }, { status: 400 });
    }
    console.log("[Analyze] Parsed repo:", info.owner + "/" + info.repo, "branch:", branch || "default");

    // Use user's GitHub OAuth access token if available
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { access_token: true },
    });
    const client = account?.access_token ? new GitHubClient(account.access_token) : githubClient;
    console.log("[Analyze] Using token:", account?.access_token ? "user_oauth" : process.env.GITHUB_TOKEN ? "env_pat" : "none");

    // Ensure repository exists or is accessible
    const exists = await client.repositoryExists(info.owner, info.repo);
    if (!exists) {
      return NextResponse.json(
        { error: "Repository non trovato o non accessibile" },
        { status: 404 }
      );
    }

    // Upsert repository for this user
    const repoRecord = await prisma.repository.upsert({
      where: { userId_githubUrl: { userId: session.user.id, githubUrl: repositoryUrl } },
      update: { updatedAt: new Date() },
      create: {
        userId: session.user.id,
        name: info.repo,
        githubUrl: repositoryUrl,
        lastAnalyzed: null,
      },
    });
    console.log("[Analyze] Upserted repository record:", repoRecord.id);

    // Collect files list
    const allFiles = await client.getRepositoryFiles(info.owner, info.repo, "", branch);
    console.log("[Analyze] Files fetched:", allFiles.length);
    const targetFiles = allFiles
      .filter((p) => INCLUDE_EXTENSIONS.some((ext) => p.endsWith(ext)))
      .slice(0, MAX_FILES);

    let filesAnalyzed = 0;
    let insightsGenerated = 0;
    let complexitySum = 0;
    let riskSum = 0;

    // Clean previous analysis for simplicity in dev
    await prisma.file.deleteMany({ where: { repoId: repoRecord.id } });
    await prisma.insight.deleteMany({ where: { repoId: repoRecord.id } });
    console.log("[Analyze] Cleared previous analysis for repo:", repoRecord.id);

    for (const path of targetFiles) {
      try {
        const file = await client.getFileContent(info.owner, info.repo, path, branch);
        const languageName = detectLanguage(path);
        const language = languageName || null;
        const loc = countLinesOfCode(file.content);
        const cyclomatic = await analyzeCyclomaticComplexity(file.content, languageName);
        const churn = await client.getFileCommits(info.owner, info.repo, path);
        const riskScore = calculateRiskScore({ cyclomatic, churn, loc });

        const fileRecord = await prisma.file.create({
          data: {
            repoId: repoRecord.id,
            path,
            language,
            cyclomatic,
            loc,
            churn,
            riskScore,
          },
        });

        // Non generiamo insights per singolo file qui
        // Li genereremo tutti insieme alla fine

        filesAnalyzed += 1;
        complexitySum += cyclomatic;
        riskSum += riskScore;
      } catch (e) {
        console.warn("[Analyze] Skipping file due to error:", path, e);
        continue;
      }
    }

    // Genera insights basati su TUTTI i file analizzati
    console.log("[Analyze] Generating insights for all files...");
    const analyzedFiles = await prisma.file.findMany({
      where: { repoId: repoRecord.id },
      select: { path: true, cyclomatic: true, loc: true, churn: true, riskScore: true },
    });

    const insights = generateInsights(
      analyzedFiles.map((f) => ({
        path: f.path,
        cyclomatic: f.cyclomatic || 0,
        loc: f.loc || 0,
        churn: f.churn || 0,
        risk: f.riskScore || 0,
      }))
    );

    console.log(`[Analyze] Generated ${insights.length} insights`);
    if (insights.length > 0) {
      console.log("[Analyze] Sample insights:", insights.slice(0, 3));
    }

    // Salva insights nel database
    if (insights.length > 0) {
      const insightData = insights.map((i) => ({
        repoId: repoRecord.id,
        message: i.message,
        severity: i.severity,
        confidence: i.confidence,
        category: i.category,
      }));
      console.log("[Analyze] Saving insights to DB:", insightData.length);
      await prisma.insight.createMany({
        data: insightData,
      });
      insightsGenerated = insights.length;
      console.log("[Analyze] Insights saved successfully");
    }

    const avgComplexity = filesAnalyzed ? complexitySum / filesAnalyzed : 0;
    const avgRiskScore = filesAnalyzed ? riskSum / filesAnalyzed : 0;

    // Calcola maxRisk e highRiskCount
    const maxRisk = await prisma.file.aggregate({
      where: { repoId: repoRecord.id },
      _max: { riskScore: true },
    });

    const highRiskCount = await prisma.file.count({
      where: {
        repoId: repoRecord.id,
        riskScore: { gte: 7 },
      },
    });

    // Salva snapshot storico
    console.log("[Analyze] Saving historical snapshot...");
    await prisma.repoAnalysisHistory.create({
      data: {
        repoId: repoRecord.id,
        avgRisk: avgRiskScore,
        maxRisk: maxRisk._max.riskScore || 0,
        highRiskCount,
        totalFiles: filesAnalyzed,
        avgComplexity,
      },
    });

    // Analizza correlazioni tra file (commit che modificano più file insieme)
    console.log("[Analyze] Analyzing file correlations...");
    await analyzeFileCorrelations(client, info.owner, info.repo, repoRecord.id);

    await prisma.repository.update({
      where: { id: repoRecord.id },
      data: { lastAnalyzed: new Date() },
    });

    const payload = {
      success: true,
      repositoryId: repoRecord.id,
      filesAnalyzed,
      insightsGenerated,
      avgComplexity,
      avgRiskScore,
    };
    console.log("[Analyze] Completed:", payload);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Errore durante l'analisi:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
