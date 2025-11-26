"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, Lightbulb, Code2, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RiskyFileRowProps {
  file: {
    id: string;
    path: string;
    cyclomatic: number;
    riskScore: number;
    loc: number;
    churn: number;
    repository: {
      name: string;
    };
  };
}

export function RiskyFileRow({ file }: RiskyFileRowProps) {
  const [expanded, setExpanded] = useState(false);

  const getRiskColor = (score: number) => {
    if (score >= 7) return "text-red-600";
    if (score >= 4) return "text-orange-500";
    return "text-yellow-600";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 7) return "ALTO";
    if (score >= 4) return "MEDIO";
    return "BASSO";
  };

  const getSuggestions = () => {
    const suggestions = [];
    const isHighComplexity = file.cyclomatic > 10;
    const isVeryHighComplexity = file.cyclomatic > 20;
    const isHighChurn = file.churn > 5;
    const isVeryHighChurn = file.churn > 10;
    const isLargeFile = file.loc > 500;
    const isMediumFile = file.loc > 300;

    // Complessità molto alta - CRITICO
    if (isVeryHighComplexity) {
      suggestions.push({
        icon: AlertTriangle,
        title: `Complessità ciclomatica critica: ${file.cyclomatic}`,
        description: `Questo file ha una complessità estremamente alta. È molto difficile da comprendere, testare e mantenere. Richiede refactoring immediato.`,
        actions: [
          `Identifica le funzioni con più di 5-6 branch condizionali`,
          `Estrai ogni blocco logico in funzioni con nomi descrittivi`,
          `Usa Early Return per ridurre nesting`,
          `Considera State Pattern per logica condizionale complessa`,
        ],
      });
    } else if (isHighComplexity) {
      suggestions.push({
        icon: Code2,
        title: `Complessità elevata: ${file.cyclomatic}`,
        description: `La complessità è sopra la soglia raccomandata (10). Questo rende il codice più fragile e difficile da testare.`,
        actions: [
          `Spezza funzioni lunghe in sotto-funzioni più piccole`,
          `Riduci if/else annidati usando guard clauses`,
          `Considera lookup tables invece di lunghi switch/case`,
        ],
      });
    }

    // Churn molto alto - File instabile
    if (isVeryHighChurn) {
      suggestions.push({
        icon: GitBranch,
        title: `File molto instabile: ${file.churn} modifiche`,
        description: `Questo file viene modificato troppo spesso, indicando possibili problemi di design o requisiti poco chiari.`,
        actions: [
          `Analizza i commit recenti per identificare pattern di cambiamento`,
          `Verifica se il file ha troppe responsabilità (viola SRP)`,
          `Aggiungi test di regressione per ogni modifica`,
          `Considera di estrarre parti volatili in moduli separati`,
        ],
      });
    } else if (isHighChurn) {
      suggestions.push({
        icon: GitBranch,
        title: `File modificato frequentemente: ${file.churn} volte`,
        description: `Modifiche frequenti possono indicare accoppiamento con altre parti del sistema.`,
        actions: [
          `Aggiungi test unitari completi per questo file`,
          `Documenta le ragioni delle modifiche frequenti`,
          `Valuta se il file ha dipendenze eccessive`,
        ],
      });
    }

    // File molto grande
    if (isLargeFile) {
      suggestions.push({
        icon: AlertTriangle,
        title: `File molto grande: ${file.loc} righe`,
        description: `File sopra le 500 righe sono difficili da navigare e spesso violano il Single Responsibility Principle.`,
        actions: [
          `Identifica gruppi di funzioni correlate e spostale in moduli separati`,
          `Separa logica di business da logica di presentazione`,
          `Estrai costanti e configurazioni in file dedicati`,
          `Considera architetture modulari (es. feature folders)`,
        ],
      });
    } else if (isMediumFile) {
      suggestions.push({
        icon: Code2,
        title: `File di medie dimensioni: ${file.loc} righe`,
        description: `Sopra le 300 righe, considera di suddividere il file per migliorare la manutenibilità.`,
        actions: [
          `Raggruppa funzioni correlate in moduli tematici`,
          `Estrai utility functions in file separati`,
        ],
      });
    }

    // Combinazione pericolosa: alta complessità + alto churn
    if (isHighComplexity && isHighChurn) {
      suggestions.push({
        icon: AlertTriangle,
        title: "Combinazione ad alto rischio",
        description: `File complesso E frequentemente modificato = altissima probabilità di bug. Questo è un hotspot critico.`,
        actions: [
          `PRIORITÀ MASSIMA: Aggiungi test di integrazione completi`,
          `Pianifica refactoring graduale con code review rigorose`,
          `Monitora questo file ad ogni deploy`,
          `Considera pair programming per modifiche future`,
        ],
      });
    }

    // Se nessun problema specifico, suggerimenti generali basati su risk score
    if (suggestions.length === 0) {
      if (file.riskScore > 4) {
        suggestions.push({
          icon: Lightbulb,
          title: "Rischio medio rilevato",
          description: `Risk score: ${file.riskScore.toFixed(1)}. Il file è monitorabile ma non critico.`,
          actions: [
            `Mantieni la copertura dei test sopra l'80%`,
            `Aggiungi commenti per logica non ovvia`,
            `Monitora le metriche nel tempo`,
          ],
        });
      } else {
        suggestions.push({
          icon: Lightbulb,
          title: "File in buone condizioni",
          description: `Risk score: ${file.riskScore.toFixed(1)}. Il file rispetta le best practices.`,
          actions: [
            `Mantieni questo standard di qualità`,
            `Usa questo file come riferimento per altri`,
            `Continua con code review regolari`,
          ],
        });
      }
    }

    return suggestions;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="font-mono text-sm truncate">{file.path}</p>
            <p className="text-xs text-muted-foreground">{file.repository.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Complessità</div>
            <div className="font-semibold">{file.cyclomatic}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">LOC</div>
            <div className="font-semibold text-muted-foreground">{file.loc}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Churn</div>
            <div className="font-semibold text-muted-foreground">{file.churn}</div>
          </div>
          <div className="text-right min-w-[80px]">
            <div className="text-xs text-muted-foreground">Risk</div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${getRiskColor(file.riskScore)}`}>
                {file.riskScore?.toFixed(1)}
              </span>
              <Badge 
                variant={file.riskScore >= 7 ? "destructive" : file.riskScore >= 4 ? "default" : "secondary"}
                className="text-xs"
              >
                {getRiskLevel(file.riskScore)}
              </Badge>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t bg-muted/30 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span>Suggerimenti per ridurre il rischio</span>
          </div>

          <div className="space-y-3">
            {getSuggestions().map((suggestion, idx) => {
              const Icon = suggestion.icon;
              return (
                <Card key={idx} className="p-4 bg-background">
                  <div className="flex gap-3">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <ul className="space-y-1 mt-2">
                        {suggestion.actions.map((action, actionIdx) => (
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
              💡 <strong>Tip:</strong> Inizia dalle modifiche più semplici e testa frequentemente per evitare regressioni.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
