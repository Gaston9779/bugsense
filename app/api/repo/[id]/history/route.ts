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
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const repoId = params.id;

    // Verifica che la repo appartenga all'utente
    const repo = await prisma.repository.findFirst({
      where: { id: repoId, userId: session.user.id },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository non trovata" }, { status: 404 });
    }

    // Ottieni ultimi 20 snapshot storici
    const history = await prisma.repoAnalysisHistory.findMany({
      where: { repoId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Inverti per avere ordine cronologico (più vecchio → più recente)
    const chronological = history.reverse();

    return NextResponse.json({ history: chronological });
  } catch (error) {
    console.error("[History API] Error:", error);
    return NextResponse.json({ error: "Errore nel recupero storico" }, { status: 500 });
  }
}
