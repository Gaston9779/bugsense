"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Github, BarChart3, FileCode, AlertTriangle, CheckCircle2, ArrowRight, Gitlab } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
              BugSense
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
              Analizza i tuoi repository GitHub per individuare complessità,
              churn e rischi potenziali
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-12">
            <FeatureCard
              icon={<FileCode className="h-8 w-8 text-blue-600" />}
              title="Complessità"
              description="Calcola la complessità ciclomatica e LOC per ogni file"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-green-600" />}
              title="Churn Analysis"
              description="Monitora la frequenza di commit e modifiche"
            />
            <FeatureCard
              icon={<AlertTriangle className="h-8 w-8 text-orange-600" />}
              title="Risk Score"
              description="Identifica i file più a rischio del tuo codebase"
            />
            <FeatureCard
              icon={<Github className="h-8 w-8 text-purple-600" />}
              title="GitHub Integration"
              description="Integrazione diretta con i tuoi repository"
            />
          </div>

          {/* CTA */}
          {status === "loading" ? (
            <div className="flex items-center gap-2 mt-8">
              <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
            </div>
          ) : session ? (
            <Card className="mt-8 p-6 bg-white dark:bg-slate-800 border-2 border-primary/20 shadow-lg max-w-md w-full">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-lg">Accesso Effettuato</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Benvenuto, <span className="font-semibold text-foreground">{session.user?.name}</span>
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {session.user?.email}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button asChild className="flex-1" size="lg">
                  <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link href="/plans">Vedi Plans</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="gap-2" onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
                  <Github className="h-5 w-5" />
                  Accedi con GitHub
                </Button>
                <Button size="lg" className="gap-2" variant="outline" onClick={() => signIn("gitlab", { callbackUrl: "/dashboard" })}>
                  <Gitlab className="h-5 w-5" />
                  Accedi con GitLab
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="gap-2" variant="outline" onClick={() => signIn("bitbucket", { callbackUrl: "/dashboard" })}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
                  </svg>
                  Accedi con Bitbucket
                </Button>
                <Button size="lg" className="gap-2" variant="outline" onClick={() => signIn("azure-devops", { callbackUrl: "/dashboard" })}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 8.5v7l6.5 4V24l7-5-11-3.5v-7L0 8.5zm24 0l-7-5v4.5L6.5 4v3.5l11 3.5v7l7-4.5v-7z"/>
                  </svg>
                  Accedi con Azure
                </Button>
              </div>
              <Button size="lg" variant="ghost" asChild className="mt-2">
                <Link href="/plans">Scopri di più</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
        {description}
      </p>
    </div>
  );
}
