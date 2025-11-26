"use client";

import { Bug } from "lucide-react";

interface AnalysisLoaderProps {
  message?: string;
}

export function AnalysisLoader({ message = "Analizzando repository..." }: AnalysisLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Logo BugSense che gira */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative rounded-full bg-primary/10 p-8">
            <Bug className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: "2s" }} />
          </div>
        </div>

        {/* Messaggio */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">BugSense</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          
          {/* Barra di progresso animata */}
          <div className="w-64 h-1 bg-muted rounded-full overflow-hidden mt-4">
            <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
