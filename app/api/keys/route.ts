/**
 * FEATURE E: API Keys Management
 * GET /api/keys - List user's API keys
 * DELETE /api/keys - Revoke an API key
 */

import { NextRequest, NextResponse } from "next/server";
import { withAccessControl } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";

async function getHandler(
  req: Request,
  context: { user: { id: string; email: string; plan: string } }
) {
  try {
    const keys = await prisma.apiKey.findMany({
      where: {
        userId: context.user.id,
      },
      select: {
        id: true,
        name: true,
        key: true,
        active: true,
        lastUsed: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mask keys (show only last 8 characters)
    const maskedKeys = keys.map((k) => ({
      ...k,
      key: `bs_${"*".repeat(56)}${k.key.slice(-8)}`,
    }));

    return NextResponse.json({ keys: maskedKeys });
  } catch (error: any) {
    console.error("[API Keys] Error fetching keys:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

async function deleteHandler(
  req: Request,
  context: { user: { id: string; email: string; plan: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
    }

    // Verify ownership
    const key = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: context.user.id,
      },
    });

    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Soft delete (deactivate)
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { active: false },
    });

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (error: any) {
    console.error("[API Keys] Error revoking key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revoke API key" },
      { status: 500 }
    );
  }
}

// PRO-only feature
export const GET = withAccessControl(getHandler, "apiAccess");
export const DELETE = withAccessControl(deleteHandler, "apiAccess");
