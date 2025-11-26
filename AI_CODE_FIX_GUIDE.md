# 🤖 AI CODE FIX - GUIDA COMPLETA

## ✅ IMPLEMENTAZIONE GRAFICA COMPLETATA

**Componente**: `/components/code-editor/ai-code-fix.tsx`

**Features**:
- ✅ Split-screen: Codice problematico (rosso) vs Soluzione AI (verde)
- ✅ Pulsante "Genera Suggerimento AI"
- ✅ Loading state
- ✅ Copia codice con feedback
- ✅ Design accattivante con gradiente purple/pink
- ✅ Responsive

---

## 🔧 STEP 1: API per Fetch Codice da GitHub

**File**: `/app/api/files/[id]/code/route.ts`

**Cosa fa**:
1. Recupera info file dal database
2. Verifica ownership
3. Usa GitHub API per scaricare il contenuto
4. Decodifica base64 e ritorna il codice

**Dipendenze**: GitHub access token dell'utente (già disponibile)

---

## 🤖 STEP 2: API per AI Suggestions

**File**: `/app/api/ai/suggest-fix/route.ts`

### **OPZIONE CONSIGLIATA: Hugging Face (GRATUITO)**

**Modello**: `bigcode/starcoder`

**Setup**:
```bash
# 1. Registrati su https://huggingface.co
# 2. Crea API key: https://huggingface.co/settings/tokens
# 3. Aggiungi a .env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
```

**Vantaggi**:
- ✅ Completamente gratuito
- ✅ Specializzato in codice
- ✅ Nessun costo per token
- ✅ Rate limit generoso

**Costo**: $0 (gratis)

---

### **ALTERNATIVA: OpenAI GPT-3.5-turbo**

**Setup**:
```bash
npm install openai
# Aggiungi a .env
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

**Vantaggi**:
- ✅ Qualità eccellente
- ✅ Veloce
- ✅ Affidabile

**Costo**: ~$0.002 per richiesta (molto economico)

---

## 📦 INSTALLAZIONE DIPENDENZE

```bash
# Per Hugging Face (consigliato - gratis)
# Nessuna dipendenza extra necessaria, usa fetch nativo

# Per OpenAI (alternativa - economico)
npm install openai

# Per Anthropic Claude (alternativa)
npm install @anthropic-ai/sdk
```

---

## 🎯 FATTIBILITÀ

### **✅ MOLTO FATTIBILE**

**Motivi**:
1. **Codice già disponibile**: GitHub API fornisce il contenuto
2. **AI gratuiti esistono**: Hugging Face è gratis
3. **UI già implementata**: Componente pronto
4. **Integrazione semplice**: 2 API routes da creare

**Tempo stimato**: 2-3 ore di sviluppo

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### **Backend**:
- [ ] Creare `/app/api/files/[id]/code/route.ts`
- [ ] Creare `/app/api/ai/suggest-fix/route.ts`
- [ ] Registrarsi su Hugging Face
- [ ] Ottenere API key
- [ ] Aggiungere `HUGGINGFACE_API_KEY` a `.env`
- [ ] Testare fetch codice da GitHub
- [ ] Testare AI suggestions

### **Frontend**:
- [x] Componente `AICodeFix` creato
- [ ] Integrare nella pagina Insights
- [ ] Aggiungere pulsante "AI Fix" su file critici
- [ ] Testare UI completa

---

## 🚀 INTEGRAZIONE NELLA UI

### **Dove Aggiungere**:

**Opzione 1: Nella pagina Insights** (consigliato)

Aggiungi sotto ogni insight critico:

```tsx
// /app/insights/page.tsx

import { AICodeFix } from "@/components/code-editor/ai-code-fix";

// Nella lista insights
{insights
  .filter(i => i.severity === "critical")
  .map((insight) => (
    <div key={insight.id} className="space-y-4">
      <InsightRow insight={insight} />
      
      {/* AI Code Fix */}
      <AICodeFix
        fileId={insight.fileId}
        fileName={insight.file.path.split("/").pop()}
        filePath={insight.file.path}
        riskScore={insight.file.riskScore}
        complexity={insight.file.cyclomatic}
      />
    </div>
  ))}
```

**Opzione 2: Pagina dedicata** `/code-fix`

Crea una nuova sezione nel menu con tutti i file critici e AI fix.

---

## 💡 ESEMPIO COMPLETO API

```typescript
// /app/api/ai/suggest-fix/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const HF_API_URL = "https://api-inference.huggingface.co/models/bigcode/starcoder";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, fileName, filePath, riskScore, complexity } = await req.json();

    // Build prompt
    const prompt = `# Refactor this code to reduce complexity

File: ${filePath}
Risk Score: ${riskScore}
Complexity: ${complexity}

## Original Code:
\`\`\`
${code}
\`\`\`

## Refactored Code (reduced complexity, better readability):
\`\`\``;

    // Call Hugging Face
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.2,
          return_full_text: false,
        },
      }),
    });

    const data = await response.json();
    const suggestedCode = data[0].generated_text.split("```")[0].trim();

    return NextResponse.json({
      suggestedCode,
      model: "starcoder",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🎨 DESIGN FEATURES

**Colori**:
- 🔴 Rosso tenue: Codice problematico (`from-red-50`, `border-red-200`)
- 🟢 Verde tenue: Soluzione AI (`from-green-50`, `border-green-200`)
- 🟣 Purple/Pink: Card principale (`from-purple-50 to-pink-50`)

**Icone**:
- `Code2`: Codice originale
- `Sparkles`: AI / Soluzione
- `Copy`: Copia codice
- `Check`: Copiato con successo
- `ArrowRight`: Trasformazione

**Interazioni**:
- Hover su pulsanti
- Animazione spinner durante loading
- Feedback visivo su copia (check verde)
- Scroll indipendente per ogni pannello

---

## 📊 COSTI STIMATI

### **Hugging Face (GRATIS)**
- Costo: $0
- Limite: ~1000 richieste/giorno (gratis)
- Velocità: ~5-10 secondi per risposta

### **OpenAI GPT-3.5-turbo**
- Costo: ~$0.002 per fix
- 1000 fix = ~$2
- Velocità: ~2-3 secondi per risposta

### **Raccomandazione**
Inizia con **Hugging Face** (gratis). Se la qualità non è sufficiente, passa a OpenAI.

---

## ✨ RISULTATO FINALE

**Utente vede**:
1. File critico nella lista insights
2. Pulsante "AI Fix" o card automatica
3. Click → Loading
4. Split-screen: Codice rosso (problema) vs Verde (soluzione)
5. Pulsanti: Copia, Rigenera, Chiudi

**Valore aggiunto**:
- ✅ Aiuta sviluppatori a risolvere problemi
- ✅ Educativo (mostra come migliorare)
- ✅ Velocizza refactoring
- ✅ Aumenta qualità del codice

---

## 🚀 PROSSIMI PASSI

1. **Registrati su Hugging Face** (5 min)
2. **Crea le 2 API routes** (1 ora)
3. **Testa con un file critico** (30 min)
4. **Integra nella UI Insights** (30 min)
5. **Deploy e test finale** (30 min)

**Totale**: ~2.5 ore di lavoro

---

**FEATURE COMPLETAMENTE FATTIBILE E PRONTA PER L'IMPLEMENTAZIONE! 🎉**
