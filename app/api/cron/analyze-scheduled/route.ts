import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Questo endpoint sarà chiamato da un cron job (es. Vercel Cron)
// Per sicurezza, verifica un token segreto
export async function GET(req: NextRequest) {
  try {
    // Verifica authorization token (da impostare in env)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret-change-me";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    console.log("[Cron] Starting scheduled analysis...");

    // Trova tutte le schedule abilitate con nextRun <= now
    const now = new Date();
    const schedulesToRun = await prisma.analysisSchedule.findMany({
      where: {
        enabled: true,
        nextRun: {
          lte: now,
        },
      },
      include: {
        repository: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`[Cron] Found ${schedulesToRun.length} repositories to analyze`);

    const results = [];

    for (const schedule of schedulesToRun) {
      try {
        console.log(`[Cron] Analyzing ${schedule.repository.name}...`);

        // Chiama l'API di analisi internamente
        const analyzeUrl = `${process.env.NEXTAUTH_URL}/api/analyze`;
        const response = await fetch(analyzeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Passa l'userId per l'autenticazione interna
            "x-user-id": schedule.repository.userId,
          },
          body: JSON.stringify({
            repositoryUrl: schedule.repository.githubUrl,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Aggiorna schedule
          const nextRun = new Date();
          if (schedule.frequency === "weekly") {
            nextRun.setDate(nextRun.getDate() + 7);
          }

          await prisma.analysisSchedule.update({
            where: { id: schedule.id },
            data: {
              lastRun: now,
              nextRun: schedule.frequency === "weekly" ? nextRun : null,
            },
          });

          results.push({
            repoId: schedule.repoId,
            repoName: schedule.repository.name,
            status: "success",
            filesAnalyzed: data.filesAnalyzed,
          });

          console.log(`[Cron] ✓ ${schedule.repository.name} analyzed successfully`);
        } else {
          results.push({
            repoId: schedule.repoId,
            repoName: schedule.repository.name,
            status: "error",
            error: data.error,
          });

          console.error(`[Cron] ✗ ${schedule.repository.name} failed:`, data.error);
        }
      } catch (error: any) {
        results.push({
          repoId: schedule.repoId,
          repoName: schedule.repository.name,
          status: "error",
          error: error.message,
        });

        console.error(`[Cron] ✗ ${schedule.repository.name} error:`, error);
      }
    }

    console.log("[Cron] Completed scheduled analysis");

    return NextResponse.json({
      success: true,
      analyzed: results.length,
      results,
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({ error: "Errore nel cron job" }, { status: 500 });
  }
}
