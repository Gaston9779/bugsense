"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Plus, Clock } from "lucide-react";
import { AnalyzeRepositoryForm } from "@/components/repositories/analyze-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function RepositoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
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

  const repositories: any[] = [];

  return (
    <div className="container mx-auto py-8 px-4">
      <AnalyzeRepositoryForm />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">I Tuoi Repository</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci e analizza i tuoi repository GitHub
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Repository
        </Button>
      </div>

      {repositories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Github className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nessun repository trovato</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Inizia aggiungendo un repository GitHub per analizzarne la complessità, 
              il churn e i rischi potenziali.
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi il tuo primo repository
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      )}
    </div>
  );
}

function RepositoryCard({ repository }: { repository: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{repository.name}</CardTitle>
          </div>
          <Badge variant="secondary">TypeScript</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {repository.githubUrl}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Ultima analisi:{" "}
              {repository.lastAnalyzed
                ? new Date(repository.lastAnalyzed).toLocaleDateString("it-IT")
                : "Mai"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">0</div>
              <div className="text-xs text-muted-foreground">Risk</div>
            </div>
          </div>

          <Button className="w-full" variant="outline">
            Analizza Repository
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
