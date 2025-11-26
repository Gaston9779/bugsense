# BugSense - Roadmap Funzionalità

## ✅ MVP Completato
- [x] Autenticazione GitHub OAuth
- [x] Analisi repository (complessità, churn, LOC, risk score)
- [x] Dashboard con metriche e file a rischio
- [x] Insights con suggerimenti specifici
- [x] Filtro per repository
- [x] Sincronizzazione stato tra pagine

---

## 🚀 Funzionalità Prioritarie (MVP+)

### 5) Analisi Automatica Ricorrente
**Obiettivo**: Aumentare retention automatizzando le analisi

**Implementazione**:
1. **Tabella `AnalysisSchedule`**:
   ```prisma
   model AnalysisSchedule {
     id           String   @id @default(cuid())
     repoId       String   @unique
     frequency    String   // "weekly", "manual"
     lastRun      DateTime?
     nextRun      DateTime?
     enabled      Boolean  @default(true)
     repository   Repository @relation(fields: [repoId], references: [id])
   }
   ```

2. **Cron Job** (Next.js API Route + Vercel Cron):
   - `/api/cron/analyze-scheduled` (chiamato settimanalmente)
   - Trova repo con `nextRun <= now()`
   - Esegue analisi
   - Aggiorna `lastRun` e `nextRun`

3. **UI**:
   - Toggle "Analisi automatica" in RepoPicker
   - Badge "Ultima analisi: X giorni fa"
   - Pulsante "Rianalizza ora"

**File da creare/modificare**:
- `prisma/schema.prisma` → Aggiungi `AnalysisSchedule`
- `app/api/cron/analyze-scheduled/route.ts` → Cron job
- `app/api/schedule/route.ts` → Gestione schedule
- `components/repositories/repo-picker.tsx` → UI schedule

---

### 6) Supporto Linguaggi (JS/TS + Python)
**Obiettivo**: Metriche più accurate per linguaggi specifici

**Implementazione**:
1. **Metriche specifiche per linguaggio**:
   - **JavaScript/TypeScript**:
     - Complessità ciclomatica (già fatto)
     - Dependency count (import/require)
     - Async/await usage
   - **Python**:
     - Complessità ciclomatica
     - Indentation depth
     - Decorator count

2. **Parser migliorato**:
   ```typescript
   // analyzer/language-specific/
   - javascript.ts
   - python.ts
   - index.ts (dispatcher)
   ```

3. **Insights specifici**:
   - "Troppe dipendenze in questo modulo JS"
   - "Indentazione eccessiva in Python (>4 livelli)"

**File da creare/modificare**:
- `analyzer/language-specific/` → Parser specifici
- `analyzer/index.ts` → Dispatcher
- `insights/index.ts` → Insights per linguaggio

---

## ⭐ Funzionalità Post-MVP

### 7) Timeline Debito Tecnico
**Obiettivo**: Mostrare evoluzione del rischio nel tempo

**Implementazione**:
1. **Tabella `AnalysisSnapshot`**:
   ```prisma
   model AnalysisSnapshot {
     id              String   @id @default(cuid())
     repoId          String
     timestamp       DateTime @default(now())
     avgRiskScore    Float
     totalFiles      Int
     criticalFiles   Int
     repository      Repository @relation(fields: [repoId], references: [id])
   }
   ```

2. **Salva snapshot** ad ogni analisi

3. **Grafico** (Recharts):
   - Linea temporale rischio medio
   - Barre file critici
   - Confronto settimana/mese

**File da creare**:
- `components/dashboard/risk-timeline.tsx`
- `app/api/timeline/route.ts`

---

### 8) Comparazione tra Branch
**Obiettivo**: Capire impatto feature branch

**Implementazione**:
1. **UI**: Dropdown "Confronta con branch"
2. **API**: `/api/compare?repo=X&base=main&compare=feature`
3. **Analisi diff**:
   - File aggiunti/modificati/rimossi
   - Delta risk score
   - Nuovi file ad alto rischio

**File da creare**:
- `app/api/compare/route.ts`
- `components/dashboard/branch-compare.tsx`

---

### 9) File Explorer con Heatmap
**Obiettivo**: Vista ad albero con colori rischio

**Implementazione**:
1. **Struttura ad albero**:
   ```typescript
   interface FileNode {
     name: string;
     path: string;
     type: 'file' | 'directory';
     riskScore?: number;
     children?: FileNode[];
   }
   ```

2. **Colori**:
   - Verde: risk < 4
   - Arancione: 4 <= risk < 7
   - Rosso: risk >= 7

3. **UI**: Albero espandibile con icone colorate

**File da creare**:
- `components/explorer/file-tree.tsx`
- `app/explorer/page.tsx`
- `lib/file-tree-builder.ts`

---

### 10) Simulazione Impatto Modifiche
**Obiettivo**: Prevedere effetto di modifiche

**Implementazione**:
1. **Analisi dipendenze**:
   - Trova import/require
   - Costruisci grafo dipendenze

2. **Euristica impatto**:
   ```
   Se modifichi file A:
   - File B, C, D lo importano
   - Rischio aumenta del 10% su B, C, D
   ```

3. **UI**: 
   - Input: "Quale file vuoi modificare?"
   - Output: Lista file impattati con delta rischio

**File da creare**:
- `lib/dependency-graph.ts`
- `lib/impact-simulator.ts`
- `components/simulator/impact-view.tsx`
- `app/simulator/page.tsx`

---

## 📊 Schema Database Completo (Futuro)

```prisma
model AnalysisSchedule {
  id           String      @id @default(cuid())
  repoId       String      @unique
  frequency    String      // "weekly", "manual"
  lastRun      DateTime?
  nextRun      DateTime?
  enabled      Boolean     @default(true)
  repository   Repository  @relation(fields: [repoId], references: [id])
}

model AnalysisSnapshot {
  id              String      @id @default(cuid())
  repoId          String
  timestamp       DateTime    @default(now())
  avgRiskScore    Float
  totalFiles      Int
  criticalFiles   Int
  repository      Repository  @relation(fields: [repoId], references: [id])
}

model FileDependency {
  id          String   @id @default(cuid())
  repoId      String
  sourceFile  String
  targetFile  String
  importType  String   // "import", "require", etc.
  repository  Repository @relation(fields: [repoId], references: [id])
}
```

---

## 🎯 Priorità Implementazione

1. **Ora**: Analisi automatica ricorrente (5)
2. **Subito dopo**: Supporto linguaggi (6)
3. **Settimana prossima**: Timeline debito tecnico (7)
4. **Dopo**: Comparazione branch (8)
5. **Dopo**: File Explorer (9)
6. **Ultimo**: Simulazione impatto (10)
