"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, GitCommit, AlertTriangle, TrendingUp, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";
import { RepoPicker } from "@/components/repositories/repo-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskyFileRow } from "@/components/dashboard/risky-file-row";
import { RiskTrendGraph } from "@/components/dashboard/risk-trend-graph";
import { FolderHeatmap } from "@/components/dashboard/folder-heatmap";
import { CouplingGraph } from "@/components/dashboard/coupling-graph";
import { InfoModal } from "@/components/ui/info-modal";
import { BranchCompare } from "@/components/branch-comparison/branch-compare";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [showAllRiskyFiles, setShowAllRiskyFiles] = useState(false);

  // Funzione per aggiornare l'URL con il repo ID
  const updateRepoInUrl = (repoId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (repoId) {
      params.set('repo', repoId);
    } else {
      params.delete('repo');
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  // Funzione wrapper per setSelectedRepoId che aggiorna anche l'URL
  const selectRepo = (repoId: string | null) => {
    setSelectedRepoId(repoId);
    updateRepoInUrl(repoId);
  };

  async function loadStats(repoId?: string | null) {
    setLoading(true);
    try {
      console.log("[Dashboard] Loading stats for repo:", repoId || "all");
      const url = repoId ? `/api/dashboard/stats?repositoryId=${repoId}` : "/api/dashboard/stats";
      console.log("[Dashboard] Fetching URL:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("[Dashboard] Stats loaded:", data);
      console.log("[Dashboard] Top risky files count:", data.topRiskyFiles?.length || 0);
      if (data.topRiskyFiles?.length > 0) {
        console.log("[Dashboard] Sample file:", data.topRiskyFiles[0]);
      }
      setStats(data);
    } catch (e) {
      console.error("[Dashboard] Error loading stats:", e);
    } finally {
      setLoading(false);
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
        loadStats(repoFromUrl);
      } else if (!repoFromUrl && selectedRepoId !== null) {
        // Se non c'è repo nell'URL ma c'è uno selezionato, resetta
        setSelectedRepoId(null);
        loadStats(null);
      } else {
        // Altrimenti carica con lo stato attuale
        loadStats(selectedRepoId);
      }
    }
  }, [status, router, searchParams]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }
  return (
    <div className="container mx-auto p-6 space-y-8">
      <RepoPicker onRepoAnalyzed={(repoId) => selectRepo(repoId)} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedRepoId ? (
              <>
                Filtrando per:{" "}
                <span className="text-primary font-semibold">
                  {stats?.repositories?.find((r: any) => r.id === selectedRepoId)?.name || "Repository selezionata"}
                </span>
              </>
            ) : (
              "Panoramica delle analisi dei tuoi repository"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedRepoId && (
            <Button variant="outline" size="sm" onClick={() => selectRepo(null)}>
              Mostra Tutto
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => loadStats(selectedRepoId)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Statistiche principali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Repository Analizzati"
          value={stats?.totalRepositories?.toString() || "0"}
          icon={<FileCode className="h-4 w-4 text-muted-foreground" />}
          description="Repository totali"
          infoTitle="Repository Analizzati"
          infoDescription="Numero totale di repository GitHub che hai analizzato con BugSense."
          infoDetails={[
            "Ogni repository viene scansionato per identificare file a rischio",
            "L'analisi include complessità ciclomatica, churn e LOC",
            "Puoi filtrare i dati per singola repository cliccando sulla lista",
          ]}
        />
        <MetricCard
          title="File Analizzati"
          value={stats?.totalFiles?.toString() || "0"}
          icon={<FileCode className="h-4 w-4 text-muted-foreground" />}
          description="File scansionati"
          infoTitle="File Analizzati"
          infoDescription="Numero totale di file sorgente analizzati in tutte le repository."
          infoDetails={[
            "Include solo file con estensioni supportate (.js, .ts, .py, .java, ecc.)",
            "Ogni file viene valutato per complessità, dimensione e frequenza di modifica",
            "File più grandi di 1000 LOC vengono segnalati come potenzialmente problematici",
          ]}
        />
        <MetricCard
          title="Insights Critici"
          value={stats?.criticalInsights?.toString() || "0"}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          description="Richiedono attenzione"
          infoTitle="Insights Critici"
          infoDescription="Numero di problemi critici identificati che richiedono intervento immediato."
          infoDetails={[
            "Insights con severity 'critical' indicano problemi gravi",
            "Include file con complessità >20, churn >10, o risk score >7",
            "Ogni insight include suggerimenti specifici per la risoluzione",
          ]}
          infoInterpretation={{
            low: "0-2 insights critici: Codebase in ottime condizioni",
            medium: "3-5 insights critici: Alcuni file richiedono attenzione",
            high: ">5 insights critici: Refactoring urgente necessario",
          }}
        />
        <MetricCard
          title="Risk Score Medio"
          value={stats?.avgRiskScore?.toFixed(1) || "0"}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Score di rischio"
          colorValue={
            (stats?.avgRiskScore || 0) >= 7 ? "high" :
            (stats?.avgRiskScore || 0) >= 4 ? "medium" : "low"
          }
          infoTitle="Risk Score Medio"
          infoDescription="Punteggio medio di rischio calcolato su tutti i file analizzati."
          infoDetails={[
            "Formula: (complessità * 0.3) + (churn * 0.4) + (LOC/100 * 0.3)",
            "Combina tre metriche chiave: complessità, frequenza modifiche e dimensione",
            "Score più alto indica maggiore probabilità di bug e difficoltà di manutenzione",
          ]}
          infoInterpretation={{
            low: "<4: Codebase sano e ben mantenuto",
            medium: "4-7: Alcuni file necessitano di refactoring",
            high: ">7: Rischio elevato, intervento urgente richiesto",
          }}
        />
      </div>

      {/* File a rischio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>File ad Alto Rischio</CardTitle>
              <InfoModal
                title="File ad Alto Rischio"
                description="Lista dei file con il punteggio di rischio più elevato nel tuo codebase."
                details={[
                  "Ordinati per risk score decrescente (dal più rischioso al meno)",
                  "Ogni file mostra: complessità, churn, LOC e risk score totale",
                  "Clicca su un file per vedere suggerimenti specifici di refactoring",
                  "File con score >7 richiedono intervento immediato",
                ]}
                interpretation={{
                  low: "Risk <4: File ben strutturato, bassa probabilità di bug",
                  medium: "Risk 4-7: Considera refactoring per migliorare manutenibilità",
                  high: "Risk >7: Priorità massima, alto rischio di bug e difficoltà di modifica",
                }}
              />
            </div>
          </div>
          <CardDescription>
            {selectedRepoId 
              ? `File della repository selezionata che richiedono maggiore attenzione`
              : "File che richiedono maggiore attenzione"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.topRiskyFiles && stats.topRiskyFiles.length > 0 ? (
            <>
              <div className="space-y-2">
                {stats.topRiskyFiles
                  .slice(0, showAllRiskyFiles ? undefined : 5)
                  .map((file: any) => (
                    <RiskyFileRow key={file.id} file={file} />
                  ))}
              </div>
              {stats.topRiskyFiles.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRiskyFiles(!showAllRiskyFiles)}
                  className="w-full mt-4 text-muted-foreground hover:text-foreground"
                >
                  {showAllRiskyFiles ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Mostra meno
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Mostra tutti ({stats.topRiskyFiles.length} file)
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold mb-1">Nessun file ad alto rischio</p>
              <p className="text-sm">
                {selectedRepoId 
                  ? "La repository selezionata non ha file ad alto rischio"
                  : "Analizza una repository per vedere i file a rischio"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nuove sezioni avanzate - mostrate solo se c'è una repo selezionata */}
      {selectedRepoId && (
        <>
          {/* Branch Comparison - FEATURE A */}
          <BranchCompare repoId={selectedRepoId} />

          {/* Risk Trend Graph */}
          <RiskTrendGraph repoId={selectedRepoId} />

          {/* Grid con Folder Heatmap e Coupling */}
          <div className="grid gap-6 md:grid-cols-2">
            <FolderHeatmap repoId={selectedRepoId} />
            <CouplingGraph repoId={selectedRepoId} />
          </div>
        </>
      )}

      {/* Lista repository */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Repository Analizzati</CardTitle>
              <InfoModal
                title="Repository Analizzati"
                description="Lista completa delle repository GitHub che hai analizzato con BugSense."
                details={[
                  "Clicca su una repository per filtrare tutti i dati della dashboard",
                  "Ogni repository mostra: numero file analizzati e insights generati",
                  "La repository selezionata è evidenziata con bordo blu",
                  "Usa il pulsante 'Mostra Tutto' per rimuovere il filtro",
                ]}
              />
            </div>
          </div>
          <CardDescription>
            Repository analizzati di recente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.repositories && stats.repositories.length > 0 ? (
            <div className="space-y-3">
              {stats.repositories.map((repo: any) => (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun repository analizzato</p>
              <p className="text-sm">Usa il selettore sopra per analizzare un repository</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
  infoTitle,
  infoDescription,
  infoDetails,
  infoInterpretation,
  colorValue,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  infoTitle?: string;
  infoDescription?: string;
  infoDetails?: string[];
  infoInterpretation?: { low: string; medium: string; high: string };
  colorValue?: "low" | "medium" | "high";
}) {
  const getValueColor = () => {
    if (!colorValue) return "";
    if (colorValue === "low") return "text-green-600";
    if (colorValue === "medium") return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {infoTitle && infoDescription && infoDetails && (
            <InfoModal
              title={infoTitle}
              description={infoDescription}
              details={infoDetails}
              interpretation={infoInterpretation}
            />
          )}
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
