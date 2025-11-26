/**
 * GET /api/repo/[id]/branches
 * Fetches real branches from GitHub repository
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get repository
    const repo = await prisma.repository.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
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

    // Extract owner/repo from GitHub URL
    // Format: https://github.com/owner/repo
    const urlParts = repo.githubUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repoName = urlParts[1]?.replace(".git", "");

    if (!owner || !repoName) {
      return NextResponse.json(
        { error: "Invalid GitHub URL format" },
        { status: 400 }
      );
    }

    // Fetch branches from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/branches`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[Branches API] GitHub error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch branches from GitHub" },
        { status: response.status }
      );
    }

    const branches = await response.json();

    // Extract branch names
    const branchNames = branches.map((b: any) => b.name);

    return NextResponse.json({
      branches: branchNames,
      defaultBranch: branches.find((b: any) => b.name === "main" || b.name === "master")?.name || branchNames[0],
    });
  } catch (error: any) {
    console.error("[Branches API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
