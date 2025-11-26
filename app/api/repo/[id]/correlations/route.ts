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

    // Ottieni top 50 correlazioni ordinate per score
    const correlations = await prisma.fileCorrelation.findMany({
      where: { repoId },
      orderBy: { score: "desc" },
      take: 50,
    });

    return NextResponse.json({ correlations });
  } catch (error) {
    console.error("[Correlations API] Error:", error);
    return NextResponse.json({ error: "Errore nel recupero correlazioni" }, { status: 500 });
  }
}
