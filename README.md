# 🐛 BugSense

**BugSense** è un analizzatore di repository GitHub che calcola metriche di qualità del codice per aiutarti a identificare file a rischio e migliorare la manutenibilità del tuo codebase.

## 🎯 Funzionalità

- **Complessità Ciclomatica**: Analisi della complessità del codice per ogni file
- **Churn Analysis**: Tracciamento della frequenza di modifiche e commit
- **Correlazione tra File**: Identifica pattern e dipendenze nel tuo codice
- **Risk Score**: Calcolo automatico del rischio per ogni file
- **Insights Personalizzati**: Raccomandazioni specifiche per il tuo progetto
- **Integrazione GitHub**: OAuth e accesso diretto ai tuoi repository

## 🏗️ Architettura

Il progetto è strutturato in moduli indipendenti:

```
bugsense/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── analyze/       # Endpoint analisi repository
│   │   └── auth/          # NextAuth endpoints
│   ├── layout.tsx         # Layout principale
│   └── page.tsx           # Homepage
├── collector/             # Modulo raccolta dati da GitHub
├── analyzer/              # Modulo analisi complessità e LOC
├── insights/              # Modulo generazione insights e risk score
├── ui/                    # Componenti UI e dashboard
│   └── dashboard/         # Dashboard principale
├── components/            # Componenti UI riutilizzabili (shadcn/ui)
├── lib/                   # Utilities e configurazioni
│   ├── auth.ts           # Configurazione NextAuth
│   ├── prisma.ts         # Client Prisma
│   └── utils.ts          # Utility functions
└── prisma/               # Schema database e migrazioni
    └── schema.prisma     # Definizione modelli
```

## 🚀 Setup Iniziale

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura il database PostgreSQL

Assicurati di avere PostgreSQL installato e in esecuzione, poi crea un database:

```bash
createdb bugsense
```

### 3. Configura le variabili d'ambiente

Copia il file `.env.example` in `.env` e compila i valori:

```bash
cp .env.example .env
```

Valori richiesti:
- `DATABASE_URL`: URL di connessione PostgreSQL
- `NEXTAUTH_SECRET`: Genera con `openssl rand -base64 32`
- `GITHUB_ID` e `GITHUB_SECRET`: Crea una GitHub OAuth App su https://github.com/settings/developers

### 4. Inizializza il database

```bash
npm run db:push
```

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📊 Database Schema

### Users
- `id`: ID univoco utente
- `email`: Email utente
- `name`: Nome utente
- Relazioni: Account GitHub, Sessioni, Repository

### Repositories
- `id`: ID univoco repository
- `user_id`: Riferimento all'utente
- `name`: Nome repository
- `github_url`: URL GitHub
- `last_analyzed`: Timestamp ultima analisi

### Files
- `id`: ID univoco file
- `repo_id`: Riferimento al repository
- `path`: Percorso file
- `language`: Linguaggio di programmazione
- `cyclomatic`: Complessità ciclomatica
- `loc`: Lines of Code
- `churn`: Numero di modifiche
- `risk_score`: Score di rischio calcolato

### Insights
- `id`: ID univoco insight
- `repo_id`: Riferimento al repository
- `message`: Messaggio insight
- `severity`: Livello di gravità (info/warning/critical)

## 🔧 Scripts Disponibili

```bash
# Sviluppo
npm run dev          # Avvia server sviluppo
npm run build        # Build per produzione
npm run start        # Avvia server produzione
npm run lint         # Esegui linting

# Database
npm run db:generate  # Genera Prisma Client
npm run db:push      # Sincronizza schema con DB
npm run db:migrate   # Crea nuova migration
npm run db:studio    # Apri Prisma Studio
```

## 🎨 Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Autenticazione**: NextAuth.js (GitHub OAuth)
- **UI Components**: Radix UI
- **Icons**: Lucide React

## 🔮 Roadmap

### Fase 1: MVP (Attuale)
- [x] Setup progetto Next.js 14
- [x] Configurazione Tailwind + shadcn/ui
- [x] Schema database Prisma
- [x] Autenticazione GitHub OAuth
- [x] API route `/api/analyze`
- [x] Struttura moduli (collector, analyzer, insights)
- [x] Dashboard UI base

### Fase 2: Implementazione Core
- [ ] Implementare collector per clonare repository
- [ ] Implementare analyzer per calcolare complessità ciclomatica
- [ ] Implementare calcolo churn da Git history
- [ ] Implementare generazione insights
- [ ] Calcolo e salvataggio risk score

### Fase 3: UI e UX
- [ ] Dashboard interattiva con grafici
- [ ] Visualizzazione file ad alto rischio
- [ ] Dettaglio per singolo repository
- [ ] Filtri e ordinamento
- [ ] Export report (PDF/CSV)

### Fase 4: Features Avanzate
- [ ] Analisi trend temporali
- [ ] Correlazione tra file
- [ ] Suggerimenti di refactoring
- [ ] Integrazione CI/CD
- [ ] Notifiche via email/webhook

## 📝 Note di Sviluppo

### Calcolo Risk Score

Il risk score viene calcolato con la seguente formula:

```
risk_score = (cyclomatic * 0.3) + (churn * 0.4) + (loc/100 * 0.3)
```

Questa formula bilancia:
- **30%** complessità ciclomatica (quanto è complesso il codice)
- **40%** churn (quanto spesso viene modificato)
- **30%** lines of code (dimensione del file)

### Linguaggi Supportati

Attualmente il sistema riconosce:
- TypeScript/JavaScript
- Python
- Java
- C/C++
- Go
- Rust
- Ruby
- PHP

## 🤝 Contribuire

Questo progetto è in fase di sviluppo attivo. Contributi, issue e feature request sono benvenuti!

## 📄 Licenza

MIT

---

**Sviluppato con ❤️ usando Vibe Coding**
