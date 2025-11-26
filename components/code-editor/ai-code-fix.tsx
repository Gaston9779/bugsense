"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Loader2,
  AlertTriangle,
  FileCode
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AICodeFixProps {
  fileId: string;
  fileName: string;
  filePath: string;
  riskScore: number;
  complexity: number;
}

export function AICodeFix({ fileId, fileName, filePath, riskScore, complexity }: AICodeFixProps) {
  const [loading, setLoading] = useState(false);
  const [originalCode, setOriginalCode] = useState<string | null>(null);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedSuggested, setCopiedSuggested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCodeAndSuggestion() {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch original code from GitHub
      const codeRes = await fetch(`/api/files/${fileId}/code`);
      if (!codeRes.ok) throw new Error("Failed to fetch code");
      const codeData = await codeRes.json();
      setOriginalCode(codeData.code);

      // Step 2: Get AI suggestion
      const aiRes = await fetch(`/api/ai/suggest-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeData.code,
          fileName,
          filePath,
          riskScore,
          complexity,
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to get AI suggestion");
      const aiData = await aiRes.json();
      setSuggestedCode(aiData.suggestedCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(code: string, type: "original" | "suggested") {
    navigator.clipboard.writeText(code);
    if (type === "original") {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedSuggested(true);
      setTimeout(() => setCopiedSuggested(false), 2000);
    }
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Code Fix</CardTitle>
              <CardDescription>
                Ottieni suggerimenti automatici per migliorare il codice
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-purple-300">
            Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground">{filePath}</span>
          <div className="ml-auto flex gap-2">
            <Badge variant="outline" className="text-xs">
              Risk: {riskScore.toFixed(1)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Complexity: {complexity}
            </Badge>
          </div>
        </div>

        {!originalCode && !loading && (
          <Button
            onClick={fetchCodeAndSuggestion}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Genera Suggerimento AI
          </Button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm text-muted-foreground">
              Analizzando il codice e generando suggerimenti...
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Code Comparison */}
        {originalCode && suggestedCode && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-red-500" />
                  <h4 className="text-sm font-semibold">Codice Problematico</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(originalCode, "original")}
                >
                  {copiedOriginal ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <pre className="p-4 bg-red-50 border-2 border-red-200 rounded-lg overflow-x-auto text-xs font-mono max-h-[500px] overflow-y-auto">
                  <code>{originalCode}</code>
                </pre>
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    Problematico
                  </Badge>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-purple-500" />
            </div>

            {/* Suggested Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <h4 className="text-sm font-semibold">Soluzione AI</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestedCode, "suggested")}
                >
                  {copiedSuggested ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative">
                <pre className="p-4 bg-green-50 border-2 border-green-200 rounded-lg overflow-x-auto text-xs font-mono max-h-[500px] overflow-y-auto">
                  <code>{suggestedCode}</code>
                </pre>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                    Suggerito
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {originalCode && suggestedCode && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setOriginalCode(null);
                setSuggestedCode(null);
              }}
              className="flex-1"
            >
              Chiudi
            </Button>
            <Button
              onClick={fetchCodeAndSuggestion}
              variant="outline"
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Rigenera
            </Button>
            <Button
              onClick={() => copyToClipboard(suggestedCode, "suggested")}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copia Soluzione
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
