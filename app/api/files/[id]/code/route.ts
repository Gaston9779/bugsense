/**
 * GET /api/files/[id]/code
 * Fetches file content from GitHub
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

    // Get file info from database
    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        repository: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Verify ownership
    if (file.repository.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    const urlParts = file.repository.githubUrl
      .replace("https://github.com/", "")
      .split("/");
    const owner = urlParts[0];
    const repo = urlParts[1]?.replace(".git", "");

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Invalid GitHub URL format" },
        { status: 400 }
      );
    }

    // Fetch file content from GitHub API
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
      const error = await response.json();
      console.error("[File Code API] GitHub error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch file from GitHub" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Decode base64 content
    const code = Buffer.from(data.content, "base64").toString("utf-8");

    return NextResponse.json({
      code,
      fileName: file.path.split("/").pop(),
      filePath: file.path,
      language: file.language,
      size: data.size,
      sha: data.sha,
    });
  } catch (error: any) {
    console.error("[File Code API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch code" },
      { status: 500 }
    );
  }
}
