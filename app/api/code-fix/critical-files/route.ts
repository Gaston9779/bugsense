/**
 * GET /api/code-fix/critical-files
 * Returns critical files with their code content and insights
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's GitHub access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 401 }
      );
    }

    // Get critical files (risk score > 7 or complexity > 15)
    const criticalFiles = await prisma.file.findMany({
      where: {
        repository: {
          userId: session.user.id,
        },
        OR: [
          { riskScore: { gte: 7 } },
          { cyclomatic: { gte: 15 } },
        ],
      },
      include: {
        repository: {
          include: {
            insights: {
              where: {
                severity: {
                  in: ["critical", "warning"],
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            },
          },
        },
      },
      orderBy: {
        riskScore: "desc",
      },
      take: 20, // Limit to top 20 critical files
    });

    // Fetch code content for each file
    const filesWithCode = await Promise.all(
      criticalFiles.map(async (file) => {
        try {
          // Extract owner/repo from GitHub URL
          const urlParts = file.repository.githubUrl
            .replace("https://github.com/", "")
            .split("/");
          const owner = urlParts[0];
          const repo = urlParts[1]?.replace(".git", "");

          if (!owner || !repo) {
            console.error(`Invalid GitHub URL for file ${file.id}`);
            return null;
          }

          // Fetch file content from GitHub
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (!response.ok) {
            console.error(`Failed to fetch file ${file.path} from GitHub`);
            return null;
          }

          const data = await response.json();
          const code = Buffer.from(data.content, "base64").toString("utf-8");

          return {
            id: file.id,
            path: file.path,
            fileName: file.path.split("/").pop() || file.path,
            riskScore: file.riskScore || 0,
            complexity: file.cyclomatic || 0,
            churn: file.churn || 0,
            language: file.language,
            code,
            repositoryId: file.repository.id,
            repositoryName: file.repository.name,
            insights: file.repository.insights.map((insight: any) => ({
              id: insight.id,
              message: insight.message,
              severity: insight.severity,
            })),
          };
        } catch (error) {
          console.error(`Error fetching code for file ${file.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (failed fetches)
    const validFiles = filesWithCode.filter((f) => f !== null);

    return NextResponse.json({
      files: validFiles,
      count: validFiles.length,
    });
  } catch (error: any) {
    console.error("[Critical Files API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch critical files" },
      { status: 500 }
    );
  }
}
