"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { InfoModal } from "@/components/ui/info-modal";

interface CorrelationData {
  id: string;
  fileA: string;
  fileB: string;
  score: number;
  lastSeen: string;
}

interface CouplingGraphProps {
  repoId: string;
}

export function CouplingGraph({ repoId }: CouplingGraphProps) {
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorrelations();
  }, [repoId]);

  async function loadCorrelations() {
    setLoading(true);
    try {
      const res = await fetch(`/api/repo/${repoId}/correlations`);
      const data = await res.json();
      setCorrelations(data.correlations || []);
    } catch (e) {
      console.error("[CouplingGraph] Error:", e);
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 10) return "text-red-600 bg-red-50 border-red-200";
    if (score >= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getScoreBadge = (score: number): "destructive" | "default" | "secondary" => {
    if (score >= 10) return "destructive";
    if (score >= 5) return "default";
    return "secondary";
  };

  const formatFileName = (path: string) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (correlations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Coupling & Correlazioni</CardTitle>
            <InfoModal
              title="Coupling & Correlazioni"
              description="Analisi dei file che vengono modificati insieme frequentemente, indicando forte accoppiamento."
              details={[
                "Score indica quante volte i file sono stati modificati nello stesso commit",
                "Accoppiamento alto suggerisce dipendenze strette tra file",
                "File accoppiati dovrebbero essere testati insieme",
                "Considera di refactorare file con score molto alto per ridurre dipendenze",
              ]}
              interpretation={{
                low: "Score 2-4: Accoppiamento normale, modifiche occasionali insieme",
                medium: "Score 5-9: Accoppiamento moderato, monitorare dipendenze",
                high: "Score ≥ 10: Accoppiamento forte, valutare refactoring per ridurre dipendenze",
              }}
            />
          </div>
          <CardDescription>Nessuna correlazione trovata</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>Analizza più commit per identificare file modificati insieme</p>
        </CardContent>
      </Card>
    );
  }

  // Top 10 correlazioni
  const topCorrelations = correlations.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Coupling & Correlazioni</CardTitle>
          <InfoModal
            title="Coupling & Correlazioni"
            description="Analisi dei file che vengono modificati insieme frequentemente, indicando forte accoppiamento."
            details={[
              "Score indica quante volte i file sono stati modificati nello stesso commit",
              "Accoppiamento alto suggerisce dipendenze strette tra file",
              "File accoppiati dovrebbero essere testati insieme",
              "Considera di refactorare file con score molto alto per ridurre dipendenze",
            ]}
            interpretation={{
              low: "Score 2-4: Accoppiamento normale, modifiche occasionali insieme",
              medium: "Score 5-9: Accoppiamento moderato, monitorare dipendenze",
              high: "Score ≥ 10: Accoppiamento forte, valutare refactoring per ridurre dipendenze",
            }}
          />
        </div>
        <CardDescription>
          File modificati frequentemente insieme (top {topCorrelations.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual Network (semplificato con linee) */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
          <div className="grid grid-cols-1 gap-2">
            {topCorrelations.slice(0, 5).map((corr, idx) => (
              <div 
                key={corr.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${getScoreColor(corr.score)}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant={getScoreBadge(corr.score)} className="flex-shrink-0">
                    {corr.score}x
                  </Badge>
                  <span className="font-mono text-xs truncate flex-1">
                    {formatFileName(corr.fileA)}
                  </span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  <span className="font-mono text-xs truncate flex-1">
                    {formatFileName(corr.fileB)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabella completa */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Tutte le Correlazioni</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">File A</th>
                  <th className="text-left p-3 font-semibold">File B</th>
                  <th className="text-center p-3 font-semibold">Score</th>
                  <th className="text-left p-3 font-semibold">Ultima Modifica</th>
                </tr>
              </thead>
              <tbody>
                {topCorrelations.map((corr, idx) => (
                  <tr 
                    key={corr.id}
                    className={`border-t hover:bg-muted/30 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-muted/10"
                    }`}
                  >
                    <td className="p-3 font-mono text-xs truncate max-w-[200px]" title={corr.fileA}>
                      {corr.fileA}
                    </td>
                    <td className="p-3 font-mono text-xs truncate max-w-[200px]" title={corr.fileB}>
                      {corr.fileB}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={getScoreBadge(corr.score)}>
                        {corr.score}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(corr.lastSeen).toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {correlations.length > 10 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Mostrando top 10 di {correlations.length} correlazioni totali
          </p>
        )}
      </CardContent>
    </Card>
  );
}
