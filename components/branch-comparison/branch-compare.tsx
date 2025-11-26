"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus, GitBranch, Loader2, ArrowLeftRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BranchCompareProps {
  repoId: string;
}

interface ComparisonResult {
  branchA: {
    name: string;
    avgRisk: number;
    maxRisk: number;
    avgComplexity: number;
    avgChurn: number;
    totalFiles: number;
  };
  branchB: {
    name: string;
    avgRisk: number;
    maxRisk: number;
    avgComplexity: number;
    avgChurn: number;
    totalFiles: number;
  };
  delta: {
    riskDelta: number;
    complexityDelta: number;
    churnDelta: number;
  };
}

export function BranchCompare({ repoId }: BranchCompareProps) {
  const [branches, setBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchA, setBranchA] = useState<string>("");
  const [branchB, setBranchB] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch real branches from GitHub
  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoadingBranches(true);
        const res = await fetch(`/api/repo/${repoId}/branches`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch branches");
        }

        setBranches(data.branches || []);
        
        // Auto-select default branch as branchA
        if (data.defaultBranch) {
          setBranchA(data.defaultBranch);
        }
      } catch (err: any) {
        console.error("Error fetching branches:", err);
        setError(err.message);
      } finally {
        setLoadingBranches(false);
      }
    }

    fetchBranches();
  }, [repoId]);

  async function handleCompare() {
    if (!branchA || !branchB) {
      setError("Seleziona entrambi i branch");
      return;
    }

    if (branchA === branchB) {
      setError("Seleziona branch diversi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/repo/${repoId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchA, branchB }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante il confronto");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Branch Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Confronta Branch
          </CardTitle>
          <CardDescription>
            Confronta due branch per vedere come cambiano le metriche di rischio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBranches ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Caricamento branch...</span>
            </div>
          ) : branches.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nessun branch trovato per questa repository. Verifica che la repository sia accessibile.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Branch A (base)</label>
                <Select value={branchA} onValueChange={setBranchA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona branch base" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const temp = branchA;
                  setBranchA(branchB);
                  setBranchB(temp);
                }}
                className="hidden sm:flex"
                title="Inverti branch"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Branch B (confronto)</label>
                <Select value={branchB} onValueChange={setBranchB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona branch da confrontare" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCompare} disabled={loading || !branchA || !branchB} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confronto...
                  </>
                ) : (
                  "Confronta"
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {result && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Risk Score */}
          <MetricComparisonCard
            title="Risk Score"
            branchA={result.branchA.name}
            branchB={result.branchB.name}
            valueA={result.branchA.avgRisk}
            valueB={result.branchB.avgRisk}
            delta={result.delta.riskDelta}
            format={(v) => v.toFixed(2)}
          />

          {/* Complexity */}
          <MetricComparisonCard
            title="Complessità Media"
            branchA={result.branchA.name}
            branchB={result.branchB.name}
            valueA={result.branchA.avgComplexity}
            valueB={result.branchB.avgComplexity}
            delta={result.delta.complexityDelta}
            format={(v) => v.toFixed(1)}
          />

          {/* Churn */}
          <MetricComparisonCard
            title="Churn Medio"
            branchA={result.branchA.name}
            branchB={result.branchB.name}
            valueA={result.branchA.avgChurn}
            valueB={result.branchB.avgChurn}
            delta={result.delta.churnDelta}
            format={(v) => v.toFixed(1)}
          />
        </div>
      )}
    </div>
  );
}

interface MetricComparisonCardProps {
  title: string;
  branchA: string;
  branchB: string;
  valueA: number;
  valueB: number;
  delta: number;
  format: (value: number) => string;
}

function MetricComparisonCard({
  title,
  branchA,
  branchB,
  valueA,
  valueB,
  delta,
  format,
}: MetricComparisonCardProps) {
  const isImprovement = delta < 0;
  const isNeutral = Math.abs(delta) < 0.1;

  const deltaColor = isNeutral ? "text-muted-foreground" : isImprovement ? "text-green-600" : "text-red-600";
  const deltaBg = isNeutral ? "bg-muted" : isImprovement ? "bg-green-50" : "bg-red-50";
  const DeltaIcon = isNeutral ? Minus : isImprovement ? TrendingDown : TrendingUp;

  // Color coding for metric values (like in dashboard)
  const getValueColor = (value: number, metricType: string) => {
    if (metricType === "Risk Score") {
      if (value >= 7) return "text-red-600 font-bold";
      if (value >= 4) return "text-orange-500 font-semibold";
      return "text-green-600 font-medium";
    }
    if (metricType === "Complessità Media") {
      if (value >= 15) return "text-red-600 font-bold";
      if (value >= 10) return "text-orange-500 font-semibold";
      return "text-green-600 font-medium";
    }
    if (metricType === "Churn Medio") {
      if (value >= 10) return "text-red-600 font-bold";
      if (value >= 5) return "text-orange-500 font-semibold";
      return "text-green-600 font-medium";
    }
    return "text-foreground";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch A */}
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-xs mb-1">
              {branchA}
            </Badge>
            <p className={`text-2xl ${getValueColor(valueA, title)}`}>
              {format(valueA)}
            </p>
          </div>
        </div>

        {/* Delta */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${deltaBg}`}>
          <DeltaIcon className={`h-5 w-5 ${deltaColor}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${deltaColor}`}>
              {isImprovement ? "Miglioramento" : isNeutral ? "Stabile" : "Peggioramento"}
            </p>
            <p className={`text-xs ${deltaColor}`}>
              {delta > 0 ? "+" : ""}
              {format(delta)}
            </p>
          </div>
        </div>

        {/* Branch B */}
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-xs mb-1">
              {branchB}
            </Badge>
            <p className={`text-2xl ${getValueColor(valueB, title)}`}>
              {format(valueB)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
