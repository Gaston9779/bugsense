"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function DemoPage() {
  const [url, setUrl] = useState("https://github.com/vercel/next.js");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/demo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">BugSense Demo</h1>
        <p className="text-muted-foreground">
          Testa l'analisi repository senza login
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analizza Repository GitHub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1"
            />
            <Button onClick={analyze} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              Analizza
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                Analisi Completata!
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">File Analizzati</div>
                  <div className="text-2xl font-bold">{result.filesAnalyzed}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Insights Generati</div>
                  <div className="text-2xl font-bold">{result.insightsGenerated}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Complessità Media</div>
                  <div className="text-2xl font-bold">{result.avgComplexity?.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Risk Score Medio</div>
                  <div className="text-2xl font-bold">{result.avgRiskScore?.toFixed(1)}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Per usare tutte le funzionalità,{" "}
          <a href="/" className="text-primary hover:underline">
            configura GitHub OAuth
          </a>
        </p>
      </div>
    </div>
  );
}
