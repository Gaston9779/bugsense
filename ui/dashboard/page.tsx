"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, GitCommit, AlertTriangle, TrendingUp } from "lucide-react";
import { RepoPicker } from "@/components/repositories/repo-picker";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
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
      <RepoPicker />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Panoramica delle analisi dei tuoi repository
          </p>
        </div>
      </div>

      {/* Statistiche principali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Repository Analizzati"
          value="0"
          icon={<FileCode className="h-4 w-4 text-muted-foreground" />}
          description="Repository totali"
        />
        <MetricCard
          title="File Analizzati"
          value="0"
          icon={<FileCode className="h-4 w-4 text-muted-foreground" />}
          description="File scansionati"
        />
        <MetricCard
          title="Churn Medio"
          value="0"
          icon={<GitCommit className="h-4 w-4 text-muted-foreground" />}
          description="Commit per file"
        />
        <MetricCard
          title="Risk Score Medio"
          value="0"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Score di rischio"
        />
      </div>

      {/* Insights recenti */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Recenti</CardTitle>
          <CardDescription>
            Analisi e raccomandazioni per i tuoi repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun insight disponibile</p>
            <p className="text-sm">Analizza un repository per iniziare</p>
          </div>
        </CardContent>
      </Card>

      {/* Lista repository */}
      <Card>
        <CardHeader>
          <CardTitle>I Tuoi Repository</CardTitle>
          <CardDescription>
            Repository analizzati di recente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun repository analizzato</p>
            <p className="text-sm">Connetti il tuo account GitHub per iniziare</p>
          </div>
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
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
