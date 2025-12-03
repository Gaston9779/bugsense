import { NextRequest, NextResponse } from "next/server";
import { validateGithubUrl, extractGithubInfo } from "@/lib/validators";
import { githubClient } from "@/lib/github-client";
import { analyzeCyclomaticComplexity, countLinesOfCode, detectLanguage } from "@/analyzer";
import { calculateRiskScore, generateInsights } from "@/insights";

const MAX_FILES = 20;
const INCLUDE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".java"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const repositoryUrl: string | undefined = body?.repositoryUrl;

    const { success, error } = validateGithubUrl(repositoryUrl || "");
    if (!success || !repositoryUrl) {
      return NextResponse.json(
        { error: error || "URL repository non valido" },
        { status: 400 }
      );
    }

    const info = extractGithubInfo(repositoryUrl);
    if (!info) {
      return NextResponse.json({ error: "URL non valido" }, { status: 400 });
    }

    const exists = await githubClient.repositoryExists(info.owner, info.repo);
    if (!exists) {
      return NextResponse.json(
        { error: "Repository non trovato o non accessibile" },
        { status: 404 }
      );
    }

    const allFiles = await githubClient.getRepositoryFiles(info.owner, info.repo);
    const targetFiles = allFiles
      .filter((p) => INCLUDE_EXTENSIONS.some((ext) => p.endsWith(ext)))
      .slice(0, MAX_FILES);

    let filesAnalyzed = 0;
    let insightsGenerated = 0;
    let complexitySum = 0;
    let riskSum = 0;

    for (const path of targetFiles) {
      try {
        const file = await githubClient.getFileContent(info.owner, info.repo, path);
        const languageName = detectLanguage(path);
        const loc = countLinesOfCode(file.content);
        const cyclomatic = await analyzeCyclomaticComplexity(file.content, languageName);
        const churn = await githubClient.getFileCommits(info.owner, info.repo, path);
        const riskScore = calculateRiskScore({ cyclomatic, churn, loc });

        const insights = generateInsights([{ path, cyclomatic, loc, churn, risk: riskScore }]);
        insightsGenerated += insights.length;

        filesAnalyzed += 1;
        complexitySum += cyclomatic;
        riskSum += riskScore;
      } catch (e) {
        continue;
      }
    }

    const avgComplexity = filesAnalyzed ? complexitySum / filesAnalyzed : 0;
    const avgRiskScore = filesAnalyzed ? riskSum / filesAnalyzed : 0;

    return NextResponse.json({
      success: true,
      filesAnalyzed,
      insightsGenerated,
      avgComplexity,
      avgRiskScore,
    });
  } catch (error) {
    console.error("Errore:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
