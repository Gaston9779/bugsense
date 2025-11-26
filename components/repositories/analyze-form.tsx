"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function AnalyzeRepositoryForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function onAnalyze() {
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Inserisci un URL GitHub valido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Errore durante l'analisi");
      }
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Errore durante l'analisi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
            />
          </div>
          <Button className="gap-2" onClick={onAnalyze} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            {loading ? "Analisi in corso..." : "Analizza"}
          </Button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {result && result.success && (
          <div className="mt-4 text-sm flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Analisi completata. File analizzati: {result.filesAnalyzed}, insights: {" "}
              {result.insightsGenerated}. Avg complexity: {result.avgComplexity.toFixed(1)}, Avg
              risk: {result.avgRiskScore.toFixed(1)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
