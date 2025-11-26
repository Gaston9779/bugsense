# 🔬 ANALYZER SERVICE - SPIEGAZIONE COMPLETA

## 📊 A. COS'È L'ANALYZER E COME FUNZIONA

### **Analyzer Service (Produzione)**

L'**Analyzer** è un **servizio separato** che esegue l'analisi statica del codice.

#### **Workflow Completo**:

```
1. USER clicca "Analizza" su una repository
   ↓
2. Frontend chiama POST /api/analyze
   ↓
3. Backend chiama Analyzer Service (Railway)
   ↓
4. Analyzer:
   - Clona la repository da GitHub
   - Scansiona tutti i file (.js, .ts, .py, etc.)
   - Per ogni file:
     * Parsing AST (Abstract Syntax Tree)
     * Calcola Complessità Ciclomatica (McCabe)
     * Conta Lines of Code (LOC)
     * Analizza Git History per Churn
     * Calcola Risk Score
   ↓
5. Analyzer salva i risultati nel database PostgreSQL
   ↓
6. Frontend mostra i risultati nella Dashboard
```

---

### **Metriche Calcolate**

#### **1. Complessità Ciclomatica (McCabe)**
Misura il numero di percorsi indipendenti nel codice.

**Formula**: Conta:
- `if`, `else`, `elif`
- `for`, `while` loops
- `case` statements
- `&&`, `||` operatori logici
- `try/catch` blocks

**Esempio**:
```javascript
function example(x) {
  if (x > 0) {        // +1
    return x * 2;
  } else if (x < 0) { // +1
    return x * -1;
  } else {
    return 0;
  }
}
// Complessità = 3
```

**Soglie**:
- 🟢 **0-10**: Semplice
- 🟠 **10-15**: Moderato
- 🔴 **15+**: Complesso (refactoring consigliato)

---

#### **2. Lines of Code (LOC)**
Conta le linee di codice effettive (esclusi commenti e linee vuote).

**Soglie**:
- 🟢 **0-200**: File piccolo
- 🟠 **200-500**: File medio
- 🔴 **500+**: File grande (split consigliato)

---

#### **3. Churn**
Frequenza con cui un file viene modificato.

**Formula**: 
```
Churn = Numero di commit che modificano il file negli ultimi 6 mesi
```

**Perché è importante**: 
- Alto churn = file instabile, spesso modificato
- Potrebbe indicare bug frequenti o design instabile

**Soglie**:
- 🟢 **0-5**: Stabile
- 🟠 **5-10**: Moderato
- 🔴 **10+**: Molto instabile

---

#### **4. Risk Score**
Metrica composita che combina le altre.

**Formula**:
```
Risk Score = (Complessità * 0.3) + (Churn * 0.4) + (LOC/100 * 0.3)
```

**Perché questa formula**:
- **Churn (40%)**: Peso maggiore perché indica instabilità reale
- **Complessità (30%)**: Indica difficoltà di manutenzione
- **LOC (30%)**: Dimensione del file

**Soglie**:
- 🟢 **0-4**: Basso rischio
- 🟠 **4-7**: Rischio moderato
- 🔴 **7+**: Alto rischio (priorità refactoring)

---

### **Dove Gira l'Analyzer**

**Ambiente**: Railway (servizio separato dal frontend)

**Perché separato**:
- Operazioni CPU-intensive (parsing AST)
- Clonazione repository (richiede spazio disco)
- Scalabilità indipendente
- Timeout lunghi (analisi può durare minuti)

**Endpoint**: `https://analyzer.railway.app/analyze` (esempio)

---

## 🔍 B. COSA USA IL BRANCH COMPARISON

### **Implementazione Attuale: MOCK DATA**

Il Branch Comparison **NON chiama l'analyzer reale**. Ecco cosa fa:

```typescript
async function analyzeBranch(repoId: string, branch: string) {
  // 1. Prende i file GIÀ ANALIZZATI dal database
  const files = await prisma.file.findMany({
    where: { repoId },
  });

  // 2. Calcola metriche medie dai file esistenti
  const avgRisk = files.reduce((sum, f) => sum + f.riskScore, 0) / files.length;
  
  // 3. Aggiunge varianza DETERMINISTICA basata sul nome del branch
  const branchHash = hashString(branch); // "casavi" → sempre lo stesso numero
  const variance = (branchHash % 200 - 100) / 100; // -1.0 a +1.0
  
  // 4. Ritorna metriche modificate
  return {
    avgRisk: avgRisk + variance,
    // ...
  };
}
```

---

### **Perché Ricevevi Risultati Diversi**

**Prima** ❌:
```typescript
const variance = Math.random() * 2 - 1; // ← CASUALE ogni volta!
```

**Dopo** ✅:
```typescript
const branchHash = hashString(branch); // ← DETERMINISTICO
const variance = (branchHash % 200 - 100) / 100;
```

**Ora**:
- `casavi` → sempre lo stesso hash → sempre la stessa varianza
- `main` → sempre varianza = 0 (branch base)
- 5 chiamate consecutive → 5 risultati **identici** ✅

---

### **Come Funziona l'Hash Deterministico**

```typescript
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
  }
  return Math.abs(hash);
}

// Esempi:
hashString("casavi")  → 12345678 (sempre lo stesso)
hashString("main")    → 87654321 (sempre lo stesso)
hashString("develop") → 11223344 (sempre lo stesso)
```

---

## 🚀 IMPLEMENTAZIONE REALE (TODO)

### **Come Dovrebbe Funzionare in Produzione**

```typescript
async function analyzeBranch(repoId: string, branch: string) {
  // 1. Chiama l'analyzer service con parametro branch
  const response = await fetch('https://analyzer.railway.app/analyze', {
    method: 'POST',
    body: JSON.stringify({
      repoId,
      branch, // ← Specifica quale branch analizzare
    }),
  });

  // 2. Analyzer clona la repo su quel branch specifico
  // git clone --branch casavi https://github.com/user/repo

  // 3. Analyzer esegue analisi completa su quel branch
  // - Parsing AST di tutti i file
  // - Calcolo metriche
  // - Git history per churn

  // 4. Ritorna metriche REALI per quel branch
  const metrics = await response.json();
  
  return {
    avgRisk: metrics.avgRisk,        // ← Dati REALI
    avgComplexity: metrics.avgComplexity,
    avgChurn: metrics.avgChurn,
    // ...
  };
}
```

---

### **Modifiche Necessarie all'Analyzer**

**File**: `analyzer/main.py` (o equivalente)

```python
# Attuale
def analyze_repository(repo_url):
    # Clona branch default (main)
    git.clone(repo_url)
    # ...

# Modificato
def analyze_repository(repo_url, branch="main"):
    # Clona branch specifico
    git.clone(repo_url, branch=branch)  # ← Aggiunto parametro
    # Resto dell'analisi rimane uguale
    # ...
```

---

## 📊 CONFRONTO: MOCK vs REALE

| Aspetto | Mock (Attuale) | Reale (Produzione) |
|---------|----------------|-------------------|
| **Dati** | File già analizzati + varianza | Analisi fresh del branch |
| **Tempo** | Istantaneo (~100ms) | 30-120 secondi |
| **Accuratezza** | Approssimativa | 100% accurata |
| **Costo** | Gratis | CPU + Storage |
| **Branch** | Simula differenze | Analizza branch reale |

---

## 🎨 COLORI AGGIUNTI

Ho aggiunto la colorazione ai numeri delle metriche:

### **Risk Score**
- 🟢 **0-4**: Verde (basso rischio)
- 🟠 **4-7**: Arancione (rischio moderato)
- 🔴 **7+**: Rosso (alto rischio)

### **Complessità Media**
- 🟢 **0-10**: Verde (semplice)
- 🟠 **10-15**: Arancione (moderato)
- 🔴 **15+**: Rosso (complesso)

### **Churn Medio**
- 🟢 **0-5**: Verde (stabile)
- 🟠 **5-10**: Arancione (moderato)
- 🔴 **10+**: Rosso (instabile)

**Implementazione**:
```typescript
const getValueColor = (value: number, metricType: string) => {
  if (metricType === "Risk Score") {
    if (value >= 7) return "text-red-600 font-bold";
    if (value >= 4) return "text-orange-500 font-semibold";
    return "text-green-600 font-medium";
  }
  // ...
};
```

---

## ✅ RISULTATO FINALE

**Ora quando confronti branch**:
1. ✅ Risultati **consistenti** (stesso branch = stessi numeri)
2. ✅ Numeri **colorati** (rosso/arancione/verde)
3. ✅ Delta **visivo** (miglioramento/peggioramento)

**Esempio**:
```
casavi → main (5 chiamate consecutive)

Chiamata 1: Risk 2.63 → 2.29 (Miglioramento -0.34) ✅
Chiamata 2: Risk 2.63 → 2.29 (Miglioramento -0.34) ✅ IDENTICO
Chiamata 3: Risk 2.63 → 2.29 (Miglioramento -0.34) ✅ IDENTICO
Chiamata 4: Risk 2.63 → 2.29 (Miglioramento -0.34) ✅ IDENTICO
Chiamata 5: Risk 2.63 → 2.29 (Miglioramento -0.34) ✅ IDENTICO
```

---

## 🔮 PROSSIMI PASSI

### **Per Implementazione Reale**:

1. **Estendere Analyzer Service**
   - Aggiungere parametro `branch` all'endpoint
   - Modificare git clone per usare `--branch`
   - Testare con branch diversi

2. **Aggiornare API Compare**
   - Sostituire `analyzeBranch()` mock con chiamata reale
   - Gestire timeout lunghi (30-120s)
   - Aggiungere caching dei risultati

3. **Ottimizzazioni**
   - Cache risultati per branch (evitare ri-analisi)
   - Queue system per analisi multiple
   - Progress indicator per utente

---

**Last Updated**: 2024-11-25 23:20 UTC
**Status**: Mock Implementation with Deterministic Results ✅
