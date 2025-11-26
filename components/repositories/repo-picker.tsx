"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Github, Loader2, Play, RefreshCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnalysisLoader } from "@/components/ui/analysis-loader";

interface RepoPickerProps {
  onRepoAnalyzed?: (repoId: string) => void;
}

interface RepoItem {
  id: number;
  name: string;
  fullName: string;
  url: string;
  private: boolean;
  defaultBranch: string;
  owner: string;
}

export function RepoPicker({ onRepoAnalyzed }: RepoPickerProps = {}) {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function loadRepos() {
    setLoading(true);
    setMsg(null);
    try {
      console.log("[RepoPicker] Fetching user repos...");
      const res = await fetch("/api/github/repos");
      console.log("[RepoPicker] Response status:", res.status);
      const data = await res.json();
      console.log("[RepoPicker] Response data:", data);
      if (!res.ok) throw new Error(data?.error || "Errore caricamento repository");
      const repoList = data.repos || [];
      setRepos(repoList);
      console.log("[RepoPicker] Loaded repos:", repoList.length, repoList);
      if (repoList.length === 0) {
        setMsg({ type: "error", text: "Nessun repository trovato. Verifica i permessi GitHub OAuth." });
      }
    } catch (e: any) {
      console.error("[RepoPicker] Error loading repos:", e);
      setMsg({ type: "error", text: e.message || "Errore nel caricamento repository" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRepos();
  }, []);

  async function startAnalysis() {
    if (!selected) return;
    setLoadingAnalyze(true);
    setMsg({ type: "success", text: "Analisi in corso... Questo potrebbe richiedere alcuni minuti." });
    try {
      console.log("[RepoPicker] Starting analysis for:", selected);
      const startTime = Date.now();
      // Converti owner/repo in URL completo
      const repoUrl = `https://github.com/${selected}`;
      console.log("[RepoPicker] Full URL:", repoUrl);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: repoUrl }),
      });
      const data = await res.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      if (!res.ok) throw new Error(data?.error || "Errore durante l'analisi");
      console.log("[RepoPicker] Analysis completed:", data);
      setMsg({ 
        type: "success", 
        text: `✅ Analisi completata in ${duration}s! ${data.filesAnalyzed || 0} file analizzati, ${data.insightsGenerated || 0} insights generati.` 
      });
      // Notifica il parent component dell'ID della repo analizzata
      if (onRepoAnalyzed && data.repositoryId) {
        onRepoAnalyzed(data.repositoryId);
      }
      // Ricarica la pagina dopo 2 secondi per mostrare i nuovi dati
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error("[RepoPicker] Error analyzing:", e);
      setMsg({ type: "error", text: e.message || "Errore durante l'analisi" });
    } finally {
      setLoadingAnalyze(false);
    }
  }

  return (
    <>
      {loadingAnalyze && <AnalysisLoader message="Analizzando repository... Questo potrebbe richiedere qualche minuto." />}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Analizza Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={selected} onValueChange={setSelected} disabled={loading}>
              <SelectTrigger className="md:col-span-2">
                <SelectValue placeholder={loading ? "Caricamento..." : "Scegli un repository"} />
              </SelectTrigger>
              <SelectContent>
                {repos.map((r) => (
                  <SelectItem key={r.id} value={r.fullName}>
                    {r.owner}/{r.name} {r.private ? "(private)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={startAnalysis} disabled={loadingAnalyze || !selected} className="gap-2">
              {loadingAnalyze ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Avvia Analisi
            </Button>
          </div>

          {msg && (
            <div className={`flex items-center gap-2 text-sm ${msg.type === "error" ? "text-red-600" : "text-green-700"}`}>
              {msg.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{msg.text}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
