"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  FileCode,
  Download,
  RefreshCcw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CriticalFile {
  id: string;
  path: string;
  fileName: string;
  riskScore: number;
  complexity: number;
  churn: number;
  code: string;
  repositoryId: string;
  repositoryName: string;
  insights: Array<{
    id: string;
    message: string;
    severity: string;
  }>;
}

export default function CodeFixPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [criticalFiles, setCriticalFiles] = useState<CriticalFile[]>([]);
  const [allFiles, setAllFiles] = useState<CriticalFile[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<CriticalFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedSuggested, setCopiedSuggested] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Read repo ID from URL on mount
  useEffect(() => {
    const repoFromUrl = searchParams.get('repo');
    if (repoFromUrl) {
      setSelectedRepoId(repoFromUrl);
    }
  }, [searchParams]);

  // Load critical files and repositories
  useEffect(() => {
    if (status === "authenticated") {
      loadCriticalFiles();
      loadRepositories();
    }
  }, [status]);

  // Filter files when repo selection changes
  useEffect(() => {
    if (selectedRepoId) {
      const filtered = allFiles.filter(f => f.repositoryId === selectedRepoId);
      setCriticalFiles(filtered);
      // Auto-select first file of filtered list
      if (filtered.length > 0) {
        setSelectedFile(filtered[0]);
      } else {
        setSelectedFile(null);
      }
    } else {
      setCriticalFiles(allFiles);
      // Auto-select first file of all files
      if (allFiles.length > 0 && !selectedFile) {
        setSelectedFile(allFiles[0]);
      }
    }
  }, [selectedRepoId, allFiles]);

  // Auto-select file from URL params
  useEffect(() => {
    const fileId = searchParams.get("fileId");
    if (fileId && criticalFiles.length > 0) {
      const file = criticalFiles.find(f => f.id === fileId);
      if (file) {
        setSelectedFile(file);
      }
    }
  }, [searchParams, criticalFiles]);

  async function loadCriticalFiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/code-fix/critical-files");
      const data = await res.json();
      setAllFiles(data.files || []);
      
      // Filter by repo if selected
      if (selectedRepoId) {
        const filtered = data.files.filter((f: CriticalFile) => f.repositoryId === selectedRepoId);
        setCriticalFiles(filtered);
        if (filtered.length > 0) {
          setSelectedFile(filtered[0]);
        }
      } else {
        setCriticalFiles(data.files || []);
        if (data.files?.length > 0 && !selectedFile) {
          setSelectedFile(data.files[0]);
        }
      }
    } catch (error) {
      console.error("Error loading critical files:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRepositories() {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setRepositories(data.repositories || []);
    } catch (error) {
      console.error("Error loading repositories:", error);
    }
  }

  function updateRepoInUrl(repoId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (repoId) {
      params.set('repo', repoId);
    } else {
      params.delete('repo');
    }
    router.push(`/code-fix?${params.toString()}`);
  }

  function selectRepo(repoId: string | null) {
    setSelectedRepoId(repoId);
    updateRepoInUrl(repoId);
    setSuggestedCode(null);
  }

  async function generateAIFix() {
    if (!selectedFile) return;

    setGeneratingFix(true);
    setSuggestedCode(null);

    try {
      const res = await fetch("/api/ai/suggest-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedFile.code,
          fileName: selectedFile.fileName,
          filePath: selectedFile.path,
          riskScore: selectedFile.riskScore,
          complexity: selectedFile.complexity,
          insights: selectedFile.insights,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate AI fix");

      const data = await res.json();
      setSuggestedCode(data.suggestedCode);
    } catch (error: any) {
      console.error("Error generating AI fix:", error);
      // Mock fallback per ora
      setSuggestedCode(generateMockFix(selectedFile));
    } finally {
      setGeneratingFix(false);
    }
  }

  function generateMockFix(file: CriticalFile): string {
    return `// ✨ AI-Suggested Refactoring for ${file.fileName}
// Risk Score: ${file.riskScore.toFixed(1)} → Target: <4.0
// Complexity: ${file.complexity} → Target: <10

${file.code}

// 🔧 Suggested Improvements:
// 1. Extract complex functions into smaller, testable units
// 2. Reduce nested if/else statements with early returns
// 3. Add JSDoc comments for better documentation
// 4. Consider using design patterns (Strategy, Factory)
// 5. Add unit tests to prevent regressions

// 💡 Next Steps:
// - Review the suggestions above
// - Apply changes incrementally
// - Run tests after each change
// - Monitor metrics to verify improvements`;
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

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-500" />
            AI Code Fix
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedRepoId ? (
              <>
                Filtrando per:{" "}
                <span className="text-primary font-semibold">
                  {repositories.find((r: any) => r.id === selectedRepoId)?.name || "Repository selezionata"}
                </span>
              </>
            ) : (
              "Risolvi problemi di codice con suggerimenti AI automatici"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedRepoId && (
            <Button variant="outline" size="sm" onClick={() => selectRepo(null)}>
              Mostra Tutto
            </Button>
          )}
          <Button variant="outline" onClick={loadCriticalFiles}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      {criticalFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileCode className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nessun file critico trovato</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Analizza una repository dalla Dashboard per identificare file che richiedono refactoring.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar: File List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">File Critici</CardTitle>
              <CardDescription className="text-xs">
                {criticalFiles.length} {criticalFiles.length === 1 ? 'file' : 'file'} da refactorare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {criticalFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setSelectedFile(file);
                    setSuggestedCode(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedFile?.id === file.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-border hover:border-purple-200 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FileCode className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                      <p className="text-xs text-primary font-semibold truncate mt-0.5">
                        📦 {file.repositoryName}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="destructive" className="text-xs">
                          Risk: {file.riskScore.toFixed(1)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          C: {file.complexity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main: Code Editor */}
          <div className="lg:col-span-3 space-y-6">
            {selectedFile && (
              <>
                {/* File Info */}
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                          <Sparkles className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{selectedFile.fileName}</CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {selectedFile.path}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                        Powered by AI
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="flex gap-3">
                      <Badge variant="outline" className="text-sm">
                        Risk Score: {selectedFile.riskScore.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        Complexity: {selectedFile.complexity}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        Churn: {selectedFile.churn}
                      </Badge>
                    </div>

                    {/* Insights */}
                    {selectedFile.insights.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Problemi Rilevati
                        </h4>
                        <div className="space-y-1">
                          {selectedFile.insights.map((insight) => (
                            <Alert key={insight.id} className="py-2">
                              <AlertDescription className="text-xs">
                                {insight.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    {!suggestedCode && (
                      <Button
                        onClick={generateAIFix}
                        disabled={generatingFix}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        size="lg"
                      >
                        {generatingFix ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generando suggerimenti...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Genera Suggerimento AI
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Code Comparison */}
                {suggestedCode && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Original Code */}
                    <Card className="border-2 border-red-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-red-500" />
                            <CardTitle className="text-sm">Codice Problematico</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(selectedFile.code, "original")}
                          >
                            {copiedOriginal ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="p-4 bg-red-50 border border-red-200 rounded-lg overflow-x-auto text-xs font-mono max-h-[600px] overflow-y-auto">
                          <code>{selectedFile.code}</code>
                        </pre>
                      </CardContent>
                    </Card>

                    {/* Suggested Code */}
                    <Card className="border-2 border-green-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-green-500" />
                            <CardTitle className="text-sm">Soluzione AI</CardTitle>
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
                      </CardHeader>
                      <CardContent>
                        <pre className="p-4 bg-green-50 border border-green-200 rounded-lg overflow-x-auto text-xs font-mono max-h-[600px] overflow-y-auto">
                          <code>{suggestedCode}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Actions */}
                {suggestedCode && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSuggestedCode(null)}
                      className="flex-1"
                    >
                      Chiudi
                    </Button>
                    <Button
                      onClick={generateAIFix}
                      variant="outline"
                      className="flex-1"
                      disabled={generatingFix}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Rigenera
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(suggestedCode, "suggested")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copia Soluzione
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Repository Selector */}
      {repositories.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Repository Analizzati</CardTitle>
            <CardDescription>
              Seleziona una repository per filtrare i file critici
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repositories.map((repo: any) => (
                <button
                  key={repo.id}
                  onClick={() => selectRepo(selectedRepoId === repo.id ? null : repo.id)}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:bg-muted/50 ${
                    selectedRepoId === repo.id 
                      ? "border-primary bg-primary/10 shadow-md" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{repo.name}</p>
                      {selectedRepoId === repo.id && (
                        <Badge variant="default" className="text-xs">Selezionata</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {repo.lastAnalyzed ? `Analizzato: ${new Date(repo.lastAnalyzed).toLocaleDateString()}` : "Mai analizzato"}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Badge variant="outline">{repo._count.files} file</Badge>
                    <Badge variant={repo._count.insights > 0 ? "destructive" : "secondary"}>
                      {repo._count.insights} insights
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
