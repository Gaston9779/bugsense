import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GitHubClient, githubClient } from "@/lib/github-client";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { access_token: true },
    });

    const client = account?.access_token ? new GitHubClient(account.access_token) : githubClient;

    console.log("[Repos] Fetching repos for user:", session.user.email);

    const repos = await client.listUserRepos({ perPage: 100, visibility: "all" });

    const data = (repos || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      private: !!r.private,
      defaultBranch: r.default_branch,
      updatedAt: r.updated_at,
      language: r.language,
      owner: r.owner?.login,
    }));

    return NextResponse.json({ success: true, repos: data });
  } catch (error) {
    console.error("[Repos] Error: ", error);
    return NextResponse.json({ error: "Errore nel recupero dei repository" }, { status: 500 });
  }
}
