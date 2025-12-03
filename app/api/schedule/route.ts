import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Ottieni schedule per una repo
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");

    if (!repoId) {
      return NextResponse.json({ error: "repoId richiesto" }, { status: 400 });
    }

    // Verifica che la repo appartenga all'utente
    const repo = await prisma.repository.findFirst({
      where: { id: repoId, userId: session.user.id },
      include: { schedule: true },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository non trovata" }, { status: 404 });
    }

    return NextResponse.json({ schedule: repo.schedule });
  } catch (error) {
    console.error("[Schedule GET] Error:", error);
    return NextResponse.json({ error: "Errore nel recupero schedule" }, { status: 500 });
  }
}

// POST: Crea o aggiorna schedule
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const { repoId, frequency, enabled } = body;

    if (!repoId) {
      return NextResponse.json({ error: "repoId richiesto" }, { status: 400 });
    }

    // Verifica che la repo appartenga all'utente
    const repo = await prisma.repository.findFirst({
      where: { id: repoId, userId: session.user.id },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository non trovata" }, { status: 404 });
    }

    // Calcola nextRun se enabled
    let nextRun = null;
    if (enabled && frequency === "weekly") {
      nextRun = new Date();
      nextRun.setDate(nextRun.getDate() + 7); // +7 giorni
    }

    // Upsert schedule (ScheduledAnalysis model)
    const schedule = await prisma.scheduledAnalysis.upsert({
      where: { repoId },
      create: {
        repoId,
        userId: session.user.id,
        frequency: frequency || "manual",
        active: enabled ?? false,
        nextRun,
      },
      update: {
        frequency: frequency || "manual",
        active: enabled ?? false,
        nextRun,
      },
    });

    console.log("[Schedule POST] Updated:", schedule);

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("[Schedule POST] Error:", error);
    return NextResponse.json({ error: "Errore nell'aggiornamento schedule" }, { status: 500 });
  }
}
