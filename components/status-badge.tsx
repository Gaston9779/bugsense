import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

type Status = "success" | "pending" | "error" | "warning";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, label, showIcon = true }: StatusBadgeProps) {
  const config = {
    success: {
      variant: "success" as const,
      icon: CheckCircle2,
      defaultLabel: "Completato",
    },
    pending: {
      variant: "secondary" as const,
      icon: Clock,
      defaultLabel: "In attesa",
    },
    error: {
      variant: "destructive" as const,
      icon: XCircle,
      defaultLabel: "Errore",
    },
    warning: {
      variant: "warning" as const,
      icon: AlertCircle,
      defaultLabel: "Attenzione",
    },
  };

  const { variant, icon: Icon, defaultLabel } = config[status];
  const displayLabel = label || defaultLabel;

  return (
    <Badge variant={variant} className="gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  );
}

export function AnalysisStatusBadge({ lastAnalyzed }: { lastAnalyzed: Date | null }) {
  if (!lastAnalyzed) {
    return <StatusBadge status="pending" label="Mai analizzato" />;
  }

  const daysSinceAnalysis = Math.floor(
    (Date.now() - new Date(lastAnalyzed).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceAnalysis <= 7) {
    return <StatusBadge status="success" label="Recente" />;
  }

  if (daysSinceAnalysis <= 30) {
    return <StatusBadge status="warning" label="Da aggiornare" />;
  }

  return <StatusBadge status="error" label="Obsoleto" />;
}
