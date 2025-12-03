import { NextRequest, NextResponse } from "next/server";

// Endpoint cron disabilitato temporaneamente perché il modello Prisma
// non è ancora allineato (ScheduledAnalysis vs analysisSchedule).
// Restituiamo comunque 200 per non rompere la build/deploy.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-secret-change-me";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  console.log("[Cron] Scheduled analysis endpoint temporarily disabled (no-op)");

  return NextResponse.json({
    success: true,
    message: "Scheduled analysis temporarily disabled on this deployment",
  });
}
