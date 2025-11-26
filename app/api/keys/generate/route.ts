/**
 * FEATURE E: API Key Generation
 * POST /api/keys/generate
 * Generates a new API key for the user
 */

import { NextResponse } from "next/server";
import { withAccessControl } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

interface GenerateKeyRequest {
  name?: string;
}

async function handler(
  req: Request,
  context: { user: { id: string; email: string; plan: string } }
) {
  try {
    const body: GenerateKeyRequest = await req.json();
    const { name = "API Key" } = body;

    // Generate secure random key
    const key = `bs_${randomBytes(32).toString("hex")}`;

    // Save to database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: context.user.id,
        name,
        key,
        active: true,
      },
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      createdAt: apiKey.createdAt,
      message: "API key generated successfully. Save it securely - you won't see it again!",
    });
  } catch (error: any) {
    console.error("[API Keys] Error generating key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate API key" },
      { status: 500 }
    );
  }
}

// PRO-only feature
export const POST = withAccessControl(handler, "apiAccess");
