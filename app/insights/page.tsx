"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle, TrendingUp, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { InsightRow } from "@/components/insights/insight-row";
import { InsightStatusCard } from "@/components/dashboard/insight-status-card";

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [insights, setInsights] = useState<any[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  // Funzione per aggiornare l'URL con il repo ID
  const updateRepoInUrl = (repoId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (repoId) {
      params.set('repo', repoId);
    } else {
      params.delete('repo');
    }
    router.push(`/insights?${params.toString()}`);
  };

  // Funzione wrapper per setSelectedRepoId che aggiorna anche l'URL
  const selectRepo = (repoId: string | null) => {
    setSelectedRepoId(repoId);
    updateRepoInUrl(repoId);
  };

  async function loadInsights(repoId?: string | null) {
    setLoading(true);
    try {
      console.log("[Insights Page] Fetching insights for repo:", repoId || "all");
      const url = repoId ? `/api/insights?repositoryId=${repoId}` : "/api/insights";
      const res = await fetch(url);
      const data = await res.json();
      console.log("[Insights Page] Response:", data);
      console.log("[Insights Page] Insights count:", data.insights?.length || 0);
      setInsights(data.insights || []);
    } catch (e) {
      console.error("[Insights Page] Error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadRepositories() {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setRepositories(data.repositories || []);
    } catch (e) {
      console.error("[Insights Page] Error loading repos:", e);
    }
  }

  // Leggi repo ID dall'URL e carica dati
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    
    if (status === "authenticated") {
      const repoFromUrl = searchParams.get('repo');
      
      // Se c'è un repo nell'URL e non è già selezionato, aggiorna lo stato
      if (repoFromUrl && repoFromUrl !== selectedRepoId) {
        setSelectedRepoId(repoFromUrl);
        loadInsights(repoFromUrl);
      } else if (!repoFromUrl && selectedRepoId !== null) {
        // Se non c'è repo nell'URL ma c'è uno selezionato, resetta
        setSelectedRepoId(null);
        loadInsights(null);
      } else {
        // Altrimenti carica con lo stato attuale
        loadInsights(selectedRepoId);
      }
      
      // Carica sempre la lista repository
      loadRepositories();
    }
  }, [status, router, searchParams]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground mt-2">
            {selectedRepoId ? (
              <>
                Insights per:{" "}
                <span className="text-primary font-semibold">
                  {repositories.find((r: any) => r.id === selectedRepoId)?.name || "Repository selezionata"}
                </span>
              </>
            ) : (
              "Analisi e raccomandazioni per migliorare la qualità del codice"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedRepoId && (
            <Button variant="outline" size="sm" onClick={() => selectRepo(null)}>
              Mostra Tutto
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => loadInsights(selectedRepoId)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nessun insight disponibile</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Analizza un repository dalla Dashboard per generare insights automatici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Insight Status Card - Grande e Avvincente */}
          <InsightStatusCard
            criticalCount={insights.filter(i => i.severity === "critical").length}
            warningCount={insights.filter(i => i.severity === "warning").length}
            infoCount={insights.filter(i => i.severity === "info").length}
            totalCount={insights.length}
          />

          {/* Insights List */}
          <div className="space-y-3">
            {insights.map((insight: any) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </div>

          {/* Lista repository */}
          {repositories.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Repository Analizzati</CardTitle>
                <CardDescription>
                  Seleziona una repository per filtrare gli insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repositories.map((repo: any) => (
                    <button
                      key={repo.id}
                      onClick={() => selectRepo(selectedRepoId === repo.id ? null : repo.id)}
                      className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:bg-muted/50 ${
                        selectedRepoId === repo.id 
                          ? "border-primary bg-primary/10 shadow-md" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{repo.name}</p>
                          {selectedRepoId === repo.id && (
                            <Badge variant="default" className="text-xs">Selezionata</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {repo.lastAnalyzed ? `Analizzato: ${new Date(repo.lastAnalyzed).toLocaleDateString()}` : "Mai analizzato"}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Badge variant="outline">{repo._count.files} file</Badge>
                        <Badge variant={repo._count.insights > 0 ? "destructive" : "secondary"}>
                          {repo._count.insights} insights
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
