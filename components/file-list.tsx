import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCode, AlertTriangle } from "lucide-react";
import {
  getRiskScoreColor,
  getRiskScoreLabel,
  getComplexityLabel,
  formatNumber,
} from "@/lib/formatters";
import { FileMetrics } from "@/types";

interface FileListProps {
  files: FileMetrics[];
  onFileClick?: (file: FileMetrics) => void;
}

export function FileList({ files, onFileClick }: FileListProps) {
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nessun file analizzato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileCard key={file.id} file={file} onClick={onFileClick} />
      ))}
    </div>
  );
}

function FileCard({
  file,
  onClick,
}: {
  file: FileMetrics;
  onClick?: (file: FileMetrics) => void;
}) {
  const riskScore = file.riskScore || 0;
  const complexity = file.cyclomatic || 0;

  return (
    <Card
      className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={() => onClick?.(file)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FileCode className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-mono truncate">
                {file.path}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {file.language && (
                  <Badge variant="outline" className="text-xs">
                    {file.language}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatNumber(file.loc || 0)} LOC
                </span>
              </div>
            </div>
          </div>
          {riskScore >= 10 && (
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Complessità</div>
            <div className="font-semibold">{complexity}</div>
            <div className="text-xs text-muted-foreground">
              {getComplexityLabel(complexity)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Churn</div>
            <div className="font-semibold">{file.churn || 0}</div>
            <div className="text-xs text-muted-foreground">modifiche</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
            <div className={`font-semibold ${getRiskScoreColor(riskScore)}`}>
              {riskScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getRiskScoreLabel(riskScore)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
