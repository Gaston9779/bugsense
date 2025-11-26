# ✅ CODE FIX - AGGIORNAMENTO FILTRO REPOSITORY

## 🎯 PROBLEMI RISOLTI

### **1. ✅ Nome Repository nelle Card File**
**Prima**: Card mostrava solo nome file e path, senza indicare la repository di appartenenza.

**Dopo**: 
- ✅ Aggiunto `📦 {repositoryName}` sotto il path
- ✅ Testo in `text-primary font-semibold` per visibilità
- ✅ Truncate per evitare overflow

**Codice**:
```tsx
<p className="text-xs text-primary font-semibold truncate mt-0.5">
  📦 {file.repositoryName}
</p>
```

---

### **2. ✅ Filtro per Repository Selezionata**
**Prima**: Cliccando "Risolvi con AI" da insights con repo selezionata, mostrava tutti i file di tutte le repo.

**Dopo**:
- ✅ Parametro `?repo=xxx` passato nell'URL
- ✅ File filtrati automaticamente per repository
- ✅ Indicatore "Filtrando per: {repoName}" nell'header
- ✅ Pulsante "Mostra Tutto" per rimuovere filtro

**Flusso**:
```
1. Utente su /insights?repo=csv-backend
2. Clicca "Risolvi con AI" su insight critico
3. Redirect a /code-fix?repo=csv-backend&fileId=xxx
4. Mostra solo file di csv-backend
5. Header: "Filtrando per: csv-backend"
```

---

### **3. ✅ Componente Repository Selector**
**Prima**: Nessun modo di switchare repository dall'editor.

**Dopo**:
- ✅ Componente "Repository Analizzati" sotto l'editor
- ✅ Identico a quello di dashboard/insights
- ✅ Click su repo → filtra file critici
- ✅ Badge "Selezionata" sulla repo attiva
- ✅ Mostra file count e insights count

**Posizione**: Alla fine della pagina, dopo l'editor e le azioni.

---

## 📁 FILE MODIFICATI

### **1. `/app/code-fix/page.tsx`**

**Aggiunte**:
- `selectedRepoId` state
- `allFiles` state (tutti i file non filtrati)
- `repositories` state
- `loadRepositories()` function
- `updateRepoInUrl()` function
- `selectRepo()` function
- Filtro automatico quando `selectedRepoId` cambia
- Lettura `?repo=xxx` dall'URL all'avvio
- Header con indicatore filtro
- Pulsante "Mostra Tutto"
- Nome repository nelle card file
- Componente "Repository Analizzati" alla fine

**Logica Filtro**:
```tsx
useEffect(() => {
  if (selectedRepoId) {
    const filtered = allFiles.filter(f => f.repositoryId === selectedRepoId);
    setCriticalFiles(filtered);
    if (filtered.length > 0) {
      setSelectedFile(filtered[0]);
    }
  } else {
    setCriticalFiles(allFiles);
  }
}, [selectedRepoId, allFiles]);
```

---

### **2. `/app/api/code-fix/critical-files/route.ts`**

**Aggiunte**:
- `repositoryId` nel response
- `repositoryName` nel response

**Response aggiornato**:
```json
{
  "files": [
    {
      "id": "file_123",
      "path": "backend/controllers/projectController.js",
      "fileName": "projectController.js",
      "riskScore": 14.5,
      "complexity": 23,
      "churn": 45,
      "language": "javascript",
      "code": "...",
      "repositoryId": "repo_456",      // ← NUOVO
      "repositoryName": "csv-backend",  // ← NUOVO
      "insights": [...]
    }
  ]
}
```

---

### **3. `/components/insights/insight-row.tsx`**

**Modifica**: Pulsante "Risolvi con AI" passa `?repo=xxx` nell'URL

**Prima**:
```tsx
router.push(`/code-fix?fileId=${insight.file?.id}&insightId=${insight.id}`);
```

**Dopo**:
```tsx
const repoId = insight.repository?.id || new URLSearchParams(window.location.search).get('repo');
const url = repoId 
  ? `/code-fix?fileId=${insight.file?.id}&insightId=${insight.id}&repo=${repoId}`
  : `/code-fix?fileId=${insight.file?.id}&insightId=${insight.id}`;
router.push(url);
```

**Interface aggiornata**:
```tsx
repository: {
  id: string;      // ← AGGIUNTO
  name: string;
}
```

---

### **4. `/components/dashboard/insight-status-card.tsx`**

**Modifica**: Pulsante "Risolvi con AI" passa `?repo=xxx` dall'URL corrente

**Prima**:
```tsx
onClick={() => router.push('/code-fix')}
```

**Dopo**:
```tsx
onClick={() => {
  const repoId = new URLSearchParams(window.location.search).get('repo');
  const url = repoId ? `/code-fix?repo=${repoId}` : '/code-fix';
  router.push(url);
}}
```

---

## 🔄 FLUSSI UTENTE

### **Scenario 1: Da Insights con Repo Selezionata**
```
1. Utente su /insights?repo=csv-backend
2. Vede insights solo di csv-backend
3. Clicca "Risolvi con AI" su insight critico
4. Redirect a /code-fix?repo=csv-backend&fileId=xxx
5. Vede solo file critici di csv-backend
6. Header: "Filtrando per: csv-backend"
7. Sidebar: Solo file di csv-backend con 📦 csv-backend
8. Può cliccare "Mostra Tutto" per vedere tutte le repo
```

### **Scenario 2: Da Insights senza Filtro**
```
1. Utente su /insights (nessun filtro)
2. Vede tutti gli insights
3. Clicca "Risolvi con AI"
4. Redirect a /code-fix (nessun filtro)
5. Vede tutti i file critici di tutte le repo
6. Header: "Risolvi problemi di codice..."
7. Sidebar: File di tutte le repo con 📦 {repoName}
```

### **Scenario 3: Switch Repository dall'Editor**
```
1. Utente su /code-fix (tutti i file)
2. Scorri fino a "Repository Analizzati"
3. Clicca su "csv-backend"
4. URL diventa /code-fix?repo=csv-backend
5. File filtrati automaticamente
6. Header aggiornato: "Filtrando per: csv-backend"
7. Badge "Selezionata" su csv-backend
```

### **Scenario 4: Rimuovi Filtro**
```
1. Utente su /code-fix?repo=csv-backend
2. Clicca "Mostra Tutto" nell'header
3. URL diventa /code-fix
4. Vede tutti i file di tutte le repo
5. Nessun badge "Selezionata" nelle repo
```

---

## 🎨 UI AGGIORNATA

### **Header con Filtro**
```tsx
<p className="text-muted-foreground mt-2">
  {selectedRepoId ? (
    <>
      Filtrando per:{" "}
      <span className="text-primary font-semibold">
        {repositories.find(r => r.id === selectedRepoId)?.name}
      </span>
    </>
  ) : (
    "Risolvi problemi di codice con suggerimenti AI automatici"
  )}
</p>
```

### **Card File con Repository**
```tsx
<div className="flex-1 min-w-0">
  <p className="text-sm font-medium truncate">{file.fileName}</p>
  <p className="text-xs text-muted-foreground truncate">{file.path}</p>
  <p className="text-xs text-primary font-semibold truncate mt-0.5">
    📦 {file.repositoryName}
  </p>
  <div className="flex gap-1 mt-1">
    <Badge variant="destructive">Risk: {file.riskScore.toFixed(1)}</Badge>
    <Badge variant="outline">C: {file.complexity}</Badge>
  </div>
</div>
```

### **Repository Selector**
```tsx
<Card className="mt-6">
  <CardHeader>
    <CardTitle>Repository Analizzati</CardTitle>
    <CardDescription>
      Seleziona una repository per filtrare i file critici
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {repositories.map((repo) => (
        <button
          onClick={() => selectRepo(selectedRepoId === repo.id ? null : repo.id)}
          className={selectedRepoId === repo.id 
            ? "border-primary bg-primary/10 shadow-md" 
            : "border-border hover:border-primary/50"
          }
        >
          <div className="flex items-center gap-2">
            <p className="font-semibold">{repo.name}</p>
            {selectedRepoId === repo.id && (
              <Badge variant="default">Selezionata</Badge>
            )}
          </div>
          <div className="flex gap-4">
            <Badge variant="outline">{repo._count.files} file</Badge>
            <Badge variant="destructive">{repo._count.insights} insights</Badge>
          </div>
        </button>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## ✅ TESTING CHECKLIST

### **1. Filtro da Insights**
```bash
# 1. Vai su /insights
# 2. Seleziona una repository (es. csv-backend)
# 3. Clicca "Risolvi con AI" su un insight critico
# 4. Verifica URL: /code-fix?repo=csv-backend&fileId=xxx
# 5. Verifica header: "Filtrando per: csv-backend"
# 6. Verifica sidebar: Solo file di csv-backend
# 7. Verifica card file: Mostra "📦 csv-backend"
```

### **2. Nome Repository nelle Card**
```bash
# 1. Vai su /code-fix (senza filtro)
# 2. Verifica che ogni card file mostra:
#    - Nome file
#    - Path
#    - 📦 {repositoryName} in blu
#    - Risk Score e Complexity
```

### **3. Switch Repository**
```bash
# 1. Vai su /code-fix
# 2. Scorri fino a "Repository Analizzati"
# 3. Clicca su una repository
# 4. Verifica URL aggiornato: ?repo=xxx
# 5. Verifica file filtrati
# 6. Verifica badge "Selezionata"
# 7. Clicca "Mostra Tutto"
# 8. Verifica tutti i file visibili
```

### **4. Persistenza Filtro**
```bash
# 1. Vai su /insights?repo=csv-backend
# 2. Clicca "Risolvi con AI"
# 3. Sei su /code-fix?repo=csv-backend
# 4. Seleziona un file
# 5. Genera suggerimento AI
# 6. Verifica che il filtro rimane attivo
# 7. Scorri a "Repository Analizzati"
# 8. Verifica badge "Selezionata" su csv-backend
```

---

## 📊 STATO IMPLEMENTAZIONE

| Feature | Status |
|---------|--------|
| **Nome repo nelle card** | ✅ 100% |
| **Filtro per repo** | ✅ 100% |
| **URL sync** | ✅ 100% |
| **Header indicatore** | ✅ 100% |
| **Pulsante "Mostra Tutto"** | ✅ 100% |
| **Repository Selector** | ✅ 100% |
| **Passaggio repo da insights** | ✅ 100% |
| **Passaggio repo da status card** | ✅ 100% |

**Overall**: **100% Complete**

---

## 🎉 RISULTATO FINALE

**Comportamento**:
1. ✅ Visualizzazione generale (tutte le repo) è quella iniziale
2. ✅ Se repo selezionata in insights → filtro automatico in code-fix
3. ✅ Nome repository visibile in ogni card file
4. ✅ Componente "Repository Analizzati" per switchare
5. ✅ URL sync perfetto tra dashboard/insights/code-fix
6. ✅ Pulsante "Mostra Tutto" per rimuovere filtro

**UX**:
- 🎯 Chiaro quale repo stai visualizzando
- 🎯 Facile switchare tra repository
- 🎯 Filtro persistente tra pagine
- 🎯 Nessuna confusione su quale file appartiene a quale repo

---

**🚀 PRONTO PER IL TEST!**

```bash
npm run dev
# Vai su /insights
# Seleziona una repository
# Clicca "Risolvi con AI"
# Verifica filtro attivo in /code-fix
# Testa switch repository dal selector
```
