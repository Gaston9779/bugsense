"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface InsightStatusCardProps {
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
}

export function InsightStatusCard({ 
  criticalCount, 
  warningCount, 
  infoCount, 
  totalCount 
}: InsightStatusCardProps) {
  const router = useRouter();
  
  // Determina lo stato generale
  const getStatus = () => {
    if (criticalCount === 0 && warningCount === 0 && totalCount === 0) {
      return "no-insights";
    }
    if (criticalCount === 0 && warningCount === 0) {
      return "excellent";
    }
    if (criticalCount === 0 && warningCount <= 3) {
      return "good";
    }
    if (criticalCount <= 2 && warningCount <= 5) {
      return "moderate";
    }
    return "critical";
  };

  const status = getStatus();

  // Configurazioni per ogni stato
  const statusConfig = {
    "no-insights": {
      icon: Sparkles,
      iconColor: "text-blue-500",
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      title: "Nessuna analisi disponibile",
      subtitle: "Inizia analizzando una repository",
      description: "Seleziona una repository dalla lista qui sotto e clicca su 'Analizza' per ottenere insights dettagliati sulla qualità del codice.",
      badge: null,
      badgeColor: "",
    },
    "excellent": {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      title: "Codebase eccellente! 🎉",
      subtitle: "Nessun problema critico rilevato",
      description: "Il tuo codice è in ottime condizioni. Continua con le best practices e mantieni questa qualità nel tempo.",
      badge: "Eccellente",
      badgeColor: "bg-green-100 text-green-700 border-green-300",
    },
    "good": {
      icon: Shield,
      iconColor: "text-blue-500",
      bgGradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      title: "Buona qualità del codice",
      subtitle: `${warningCount} ${warningCount === 1 ? 'avviso' : 'avvisi'} da verificare`,
      description: "Il codebase è generalmente sano. Gli avvisi rilevati sono minori e possono essere risolti gradualmente.",
      badge: "Buono",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-300",
    },
    "moderate": {
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
      title: "Attenzione richiesta",
      subtitle: `${criticalCount} ${criticalCount === 1 ? 'problema critico' : 'problemi critici'}, ${warningCount} ${warningCount === 1 ? 'avviso' : 'avvisi'}`,
      description: "Alcuni file richiedono refactoring. Prioritizza i problemi critici per migliorare la manutenibilità del codice.",
      badge: "Moderato",
      badgeColor: "bg-orange-100 text-orange-700 border-orange-300",
    },
    "critical": {
      icon: XCircle,
      iconColor: "text-red-500",
      bgGradient: "bg-gradient-to-br from-red-50 to-rose-50",
      borderColor: "border-red-200",
      title: "Intervento urgente necessario",
      subtitle: `${criticalCount} ${criticalCount === 1 ? 'problema critico' : 'problemi critici'} rilevati`,
      description: "Il codebase presenta criticità significative. È fortemente consigliato un refactoring immediato dei file ad alto rischio.",
      badge: "Critico",
      badgeColor: "bg-red-100 text-red-700 border-red-300",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgGradient} border-2 ${config.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
            <Icon className={`h-8 w-8 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {config.title}
              </h3>
              {config.badge && (
                <Badge 
                  variant="outline" 
                  className={`${config.badgeColor} border font-semibold`}
                >
                  {config.badge}
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-gray-700">
              {config.subtitle}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              {config.description}
            </p>

            {/* Stats (solo se ci sono insights) */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between gap-4 pt-3">
                <div className="flex items-center gap-4">
                  {criticalCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-medium text-gray-700">
                        {criticalCount} critici
                      </span>
                    </div>
                  )}
                  {warningCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-xs font-medium text-gray-700">
                        {warningCount} avvisi
                      </span>
                    </div>
                  )}
                  {infoCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-gray-700">
                        {infoCount} info
                      </span>
                    </div>
                  )}
                </div>
                
                {/* AI Fix Button per stati critici/moderati */}
                {(status === "critical" || status === "moderate") && (
                  <Button
                    onClick={() => {
                      const repoId = new URLSearchParams(window.location.search).get('repo');
                      const url = repoId ? `/code-fix?repo=${repoId}` : '/code-fix';
                      router.push(url);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Risolvi con AI
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
