import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface FolderStats {
  path: string;
  avgRisk: number;
  maxRisk: number;
  fileCount: number;
  files: string[];
}

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

    // Ottieni tutti i file con risk score
    const files = await prisma.file.findMany({
      where: { repoId },
      select: {
        path: true,
        riskScore: true,
      },
    });

    // Aggrega per folder
    const folderMap = new Map<string, { risks: number[]; files: string[] }>();

    for (const file of files) {
      const pathParts = file.path.split("/");
      
      // Crea entry per ogni livello di folder
      for (let i = 1; i <= pathParts.length - 1; i++) {
        const folderPath = pathParts.slice(0, i).join("/");
        
        if (!folderMap.has(folderPath)) {
          folderMap.set(folderPath, { risks: [], files: [] });
        }
        
        const entry = folderMap.get(folderPath)!;
        entry.risks.push(file.riskScore || 0);
        entry.files.push(file.path);
      }
    }

    // Calcola statistiche per ogni folder
    const folders: FolderStats[] = Array.from(folderMap.entries()).map(([path, data]) => {
      const avgRisk = data.risks.reduce((a, b) => a + b, 0) / data.risks.length;
      const maxRisk = Math.max(...data.risks);
      
      return {
        path,
        avgRisk,
        maxRisk,
        fileCount: data.files.length,
        files: data.files,
      };
    });

    // Ordina per avgRisk decrescente
    folders.sort((a, b) => b.avgRisk - a.avgRisk);

    return NextResponse.json({ folders });
  } catch (error) {
    console.error("[Folders API] Error:", error);
    return NextResponse.json({ error: "Errore nel recupero folder stats" }, { status: 500 });
  }
}
