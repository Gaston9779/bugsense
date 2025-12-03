"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { InfoModal } from "@/components/ui/info-modal";

interface HistoryData {
  id: string;
  avgRisk: number;
  maxRisk: number;
  highRiskCount: number;
  totalFiles: number;
  avgComplexity: number;
  createdAt: string;
}

interface RiskTrendGraphProps {
  repoId: string;
}

export function RiskTrendGraph({ repoId }: RiskTrendGraphProps) {
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [repoId]);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/repo/${repoId}/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      console.error("[RiskTrendGraph] Error:", e);
    } finally {
      setLoading(false);
    }
  }

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

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Rischio nel Tempo</CardTitle>
            <InfoModal
              title="Rischio nel Tempo"
              description="Grafico storico che mostra l&apos;evoluzione del rischio della repository nel tempo."
              details={[
                "Linea gialla: Rischio medio di tutti i file ad ogni analisi",
                "Linea rossa tratteggiata: Rischio massimo rilevato",
                "Barre rosse: Numero di file critici (risk score ≥ 7)",
                "Ogni punto rappresenta un&apos;analisi completa della repository",
              ]}
              interpretation={{
                low: "Trend discendente: Miglioramento della qualità del codice",
                medium: "Trend stabile: Qualità costante, monitorare regolarmente",
                high: "Trend ascendente: Peggioramento, intervento necessario",
              }}
            />
          </div>
          <CardDescription>Nessun dato storico disponibile</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>Analizza la repository più volte per vedere l&apos;evoluzione del rischio</p>
        </CardContent>
      </Card>
    );
  }

  // Prepara dati per il grafico
  const chartData = history.map((h, idx) => ({
    name: `#${idx + 1}`,
    date: new Date(h.createdAt).toLocaleDateString("it-IT", { 
      day: "2-digit", 
      month: "short" 
    }),
    avgRisk: parseFloat(h.avgRisk.toFixed(2)),
    maxRisk: parseFloat(h.maxRisk.toFixed(2)),
    highRiskCount: h.highRiskCount,
  }));

  // Calcola trend
  const getTrend = () => {
    if (history.length < 2) return "stable";
    const latest = history[history.length - 1].avgRisk;
    const previous = history[history.length - 2].avgRisk;
    const diff = latest - previous;
    
    if (diff > 0.5) return "up";
    if (diff < -0.5) return "down";
    return "stable";
  };

  const trend = getTrend();
  const latestAvgRisk = history[history.length - 1]?.avgRisk || 0;
  const latestHighRiskCount = history[history.length - 1]?.highRiskCount || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Rischio nel Tempo</CardTitle>
            <InfoModal
              title="Rischio nel Tempo"
              description="Grafico storico che mostra l&apos;evoluzione del rischio della repository nel tempo."
              details={[
                "Linea gialla: Rischio medio di tutti i file ad ogni analisi",
                "Linea rossa tratteggiata: Rischio massimo rilevato",
                "Barre rosse: Numero di file critici (risk score ≥ 7)",
                "Ogni punto rappresenta un&apos;analisi completa della repository",
              ]}
              interpretation={{
                low: "Trend discendente: Miglioramento della qualità del codice",
                medium: "Trend stabile: Qualità costante, monitorare regolarmente",
                high: "Trend ascendente: Peggioramento, intervento necessario",
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Rischio Medio</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{latestAvgRisk.toFixed(1)}</p>
                {trend === "up" && <TrendingUp className="h-5 w-5 text-red-500" />}
                {trend === "down" && <TrendingDown className="h-5 w-5 text-green-500" />}
                {trend === "stable" && <Minus className="h-5 w-5 text-gray-500" />}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">File Critici</p>
              <p className="text-2xl font-bold text-red-500">{latestHighRiskCount}</p>
            </div>
          </div>
        </div>
        <CardDescription>
          Evoluzione del rischio nelle ultime {history.length} analisi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: "Risk Score", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: "File Critici", angle: 90, position: "insideRight", style: { fontSize: 12 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px"
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="avgRisk" 
              stroke="#F59E0B" 
              strokeWidth={2}
              name="Rischio Medio"
              dot={{ fill: "#F59E0B", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="maxRisk" 
              stroke="#EF4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Rischio Massimo"
              dot={{ fill: "#EF4444", r: 4 }}
            />
            <Bar 
              yAxisId="right"
              dataKey="highRiskCount" 
              fill="#EF4444" 
              opacity={0.3}
              name="File Critici (≥7)"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
