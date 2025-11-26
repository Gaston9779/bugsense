"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle, Info, Lightbulb, CheckCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface InsightRowProps {
  insight: {
    id: string;
    message: string;
    severity: "critical" | "warning" | "info";
    confidence?: number; // 0-1
    category?: string;
    repository: {
      id: string;
      name: string;
    };
    file?: {
      id: string;
      path: string;
      riskScore: number;
      cyclomatic: number;
    };
  };
}

export function InsightRow({ insight }: InsightRowProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return { label: "Medium", variant: "default" as const };
    if (confidence >= 0.85) return { label: "High", variant: "default" as const };
    if (confidence >= 0.7) return { label: "Medium", variant: "secondary" as const };
    return { label: "Low", variant: "outline" as const };
  };

  const getSeverityConfig = () => {
    switch (insight.severity) {
      case "critical":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
          badge: "destructive" as const,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          badge: "default" as const,
        };
      default:
        return {
          icon: Info,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          badge: "secondary" as const,
        };
    }
  };

  const getSolutions = () => {
    const message = insight.message.toLowerCase();
    const solutions = [];

    // Complessità critica
    if (message.includes("complessità critica") || message.includes("complessità elevata")) {
      solutions.push({
        icon: Lightbulb,
        title: "Riduci la complessità ciclomatica",
        actions: [
          "Estrai funzioni complesse in sotto-funzioni più piccole e testabili",
          "Usa Early Return per ridurre il nesting di if/else",
          "Applica il principio Single Responsibility: una funzione = una responsabilità",
          "Considera pattern come Strategy o State per logica condizionale complessa",
        ],
      });
    }

    // Churn alto
    if (message.includes("modificati molto frequentemente") || message.includes("alto tasso di modifica")) {
      solutions.push({
        icon: CheckCircle,
        title: "Stabilizza il codice frequentemente modificato",
        actions: [
          "Aggiungi test di regressione completi per prevenire bug futuri",
          "Analizza i commit recenti per identificare pattern di cambiamento",
          "Verifica se il file viola il Single Responsibility Principle",
          "Documenta le ragioni delle modifiche frequenti per il team",
        ],
      });
    }

    // Rischio alto
    if (message.includes("altissimo rischio") || message.includes("rischio medio")) {
      solutions.push({
        icon: AlertTriangle,
        title: "Riduci il risk score",
        actions: [
          "Priorità: Aggiungi test unitari e di integrazione",
          "Pianifica refactoring graduale con code review rigorose",
          "Monitora questo file ad ogni deploy",
          "Considera pair programming per modifiche future",
        ],
      });
    }

    // File grandi
    if (message.includes("molto grandi") || message.includes("file molto grande")) {
      solutions.push({
        icon: Lightbulb,
        title: "Suddividi file grandi",
        actions: [
          "Identifica gruppi di funzioni correlate e spostale in moduli separati",
          "Separa logica di business da logica di presentazione",
          "Estrai costanti e configurazioni in file dedicati",
          "Considera architetture modulari (es. feature folders)",
        ],
      });
    }

    // Suggerimenti generali se nessuna soluzione specifica
    if (solutions.length === 0) {
      if (insight.severity === "critical" || insight.severity === "warning") {
        solutions.push({
          icon: Lightbulb,
          title: "Best practices generali",
          actions: [
            "Rivedi il codice con un collega (code review)",
            "Aggiungi o migliora i test esistenti",
            "Documenta le parti complesse del codice",
            "Monitora le metriche nel tempo per vedere miglioramenti",
          ],
        });
      } else {
        solutions.push({
          icon: CheckCircle,
          title: "Mantieni lo standard",
          actions: [
            "Continua con le best practices attuali",
            "Usa questo codice come riferimento per altri file",
            "Mantieni la copertura dei test alta",
          ],
        });
      }
    }

    return solutions;
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  return (
    <div className={`border rounded-lg overflow-hidden ${expanded ? config.bgColor : ""}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm">{insight.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{insight.repository.name}</p>
            {insight.category && (
              <Badge variant="outline" className="text-xs">
                {insight.category}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {insight.confidence !== undefined && (
            <Badge variant={getConfidenceLabel(insight.confidence).variant} className="text-xs">
              {getConfidenceLabel(insight.confidence).label}
            </Badge>
          )}
          <Badge variant={config.badge}>
            {insight.severity}
          </Badge>
          {(insight.severity === "critical" || insight.severity === "warning") && insight.file && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const repoId = insight.repository?.id || new URLSearchParams(window.location.search).get('repo');
                const url = repoId 
                  ? `/code-fix?fileId=${insight.file?.id}&insightId=${insight.id}&repo=${repoId}`
                  : `/code-fix?fileId=${insight.file?.id}&insightId=${insight.id}`;
                router.push(url);
              }}
              className="ml-2"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Risolvi con AI
            </Button>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-4 bg-background">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span>Come risolvere</span>
          </div>

          <div className="space-y-3">
            {getSolutions().map((solution, idx) => {
              const SolutionIcon = solution.icon;
              return (
                <Card key={idx} className="p-4">
                  <div className="flex gap-3">
                    <SolutionIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-sm">{solution.title}</h4>
                      <ul className="space-y-1">
                        {solution.actions.map((action, actionIdx) => (
                          <li key={actionIdx} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Affronta i problemi uno alla volta e testa frequentemente per evitare regressioni.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
