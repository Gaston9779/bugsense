"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoModal } from "@/components/ui/info-modal";

interface FolderData {
  path: string;
  avgRisk: number;
  maxRisk: number;
  fileCount: number;
  files: string[];
}

interface FolderHeatmapProps {
  repoId: string;
}

export function FolderHeatmap({ repoId }: FolderHeatmapProps) {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFolders();
  }, [repoId]);

  async function loadFolders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/repo/${repoId}/folders`);
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (e) {
      console.error("[FolderHeatmap] Error:", e);
    } finally {
      setLoading(false);
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 7) return "bg-red-500";
    if (risk >= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskBadgeVariant = (risk: number): "destructive" | "default" | "secondary" => {
    if (risk >= 7) return "destructive";
    if (risk >= 4) return "default";
    return "secondary";
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  // Costruisci albero gerarchico
  const buildTree = () => {
    const tree: { [key: string]: FolderData & { children: string[] } } = {};
    
    folders.forEach((folder) => {
      tree[folder.path] = { ...folder, children: [] };
    });

    // Trova figli per ogni folder
    folders.forEach((folder) => {
      const parentPath = folder.path.split("/").slice(0, -1).join("/");
      if (parentPath && tree[parentPath]) {
        tree[parentPath].children.push(folder.path);
      }
    });

    return tree;
  };

  const tree = buildTree();
  const rootFolders = folders.filter((f) => !f.path.includes("/") || f.path.split("/").length === 1);

  const renderFolder = (folder: FolderData, level: number = 0) => {
    const isExpanded = expanded.has(folder.path);
    const children = tree[folder.path]?.children || [];
    const folderName = folder.path.split("/").pop() || folder.path;

    return (
      <div key={folder.path} className="mb-1">
        <button
          onClick={() => toggleExpand(folder.path)}
          className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
          )}

          <span className="font-mono text-sm flex-1 truncate">{folderName}</span>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-xs">
              {folder.fileCount} file{folder.fileCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant={getRiskBadgeVariant(folder.avgRisk)} className="text-xs min-w-[60px] justify-center">
              {folder.avgRisk.toFixed(1)}
            </Badge>
            <div 
              className={`h-3 w-16 rounded-full ${getRiskColor(folder.avgRisk)}`}
              style={{ opacity: 0.6 }}
            />
          </div>
        </button>

        {isExpanded && children.length > 0 && (
          <div className="ml-4 border-l-2 border-muted">
            {children.map((childPath) => {
              const childFolder = folders.find((f) => f.path === childPath);
              return childFolder ? renderFolder(childFolder, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (folders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Heatmap Directory</CardTitle>
            <InfoModal
              title="Heatmap Directory"
              description="Visualizzazione gerarchica del rischio aggregato per ogni directory del progetto."
              details={[
                "Ogni folder mostra il rischio medio calcolato sui file contenuti",
                "Clicca su una folder per espandere/collassare i sotto-folder",
                "Il numero indica quanti file sono presenti nella directory",
                "La barra colorata rappresenta visivamente il livello di rischio",
              ]}
              interpretation={{
                low: "Verde (<4): Directory con codice sano e ben mantenuto",
                medium: "Giallo (4-7): Directory che necessita attenzione moderata",
                high: "Rosso (≥ 7): Directory critica, refactoring urgente richiesto",
              }}
            />
          </div>
          <CardDescription>Nessuna directory trovata</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>Seleziona una repository per vedere l'heatmap delle directory</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Heatmap Directory</CardTitle>
          <InfoModal
            title="Heatmap Directory"
            description="Visualizzazione gerarchica del rischio aggregato per ogni directory del progetto."
            details={[
              "Ogni folder mostra il rischio medio calcolato sui file contenuti",
              "Clicca su una folder per espandere/collassare i sotto-folder",
              "Il numero indica quanti file sono presenti nella directory",
              "La barra colorata rappresenta visivamente il livello di rischio",
            ]}
            interpretation={{
              low: "Verde (<4): Directory con codice sano e ben mantenuto",
              medium: "Giallo (4-7): Directory che necessita attenzione moderata",
              high: "Rosso (≥ 7): Directory critica, refactoring urgente richiesto",
            }}
          />
        </div>
        <CardDescription>
          Visualizzazione ad albero del rischio per directory
        </CardDescription>
        <div className="flex items-center gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Basso (&lt;4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Medio (4-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Alto (≥7)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto">
        <div className="space-y-1">
          {rootFolders.map((folder) => renderFolder(folder))}
        </div>
      </CardContent>
    </Card>
  );
}
