# Architettura BugSense

Questo documento descrive l'architettura tecnica e le decisioni di design di BugSense.

## Overview

BugSense è un'applicazione web full-stack costruita con Next.js 14 che analizza repository GitHub per calcolare metriche di qualità del codice e generare insights automatici.

## Stack Tecnologico

### Frontend
- **Next.js 14**: Framework React con App Router per routing e rendering
- **TypeScript**: Type safety e developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library basata su Radix UI
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Endpoint serverless
- **Prisma**: ORM per database access
- **PostgreSQL**: Database relazionale
- **NextAuth.js**: Autenticazione e gestione sessioni

### Autenticazione
- **GitHub OAuth**: Single Sign-On con GitHub
- **NextAuth.js**: Session management
- **Database sessions**: Sessioni persistite in database

## Architettura dei Moduli

### 1. Collector Module (`collector/`)

Responsabile della raccolta dati dai repository GitHub.

```typescript
// Funzioni principali
- collectRepositoryFiles(): Scarica file dal repository
- collectFileHistory(): Calcola churn (numero modifiche)
```

**Flusso:**
1. Riceve URL repository GitHub
2. Usa GitHub API per accedere ai contenuti
3. Scarica file rilevanti (esclude node_modules, build, etc)
4. Raccoglie Git history per calcolare churn
5. Ritorna array di FileData

**Tecnologie Pianificate:**
- GitHub REST API
- Octokit.js per API client
- Simple-git per Git operations

### 2. Analyzer Module (`analyzer/`)

Analizza il codice per calcolare metriche di complessità.

```typescript
// Funzioni principali
- analyzeCyclomaticComplexity(): Calcola complessità ciclomatica
- countLinesOfCode(): Conta LOC
- analyzeFile(): Analisi completa file
- detectLanguage(): Identifica linguaggio
```

**Metriche Calcolate:**
- **Complessità Ciclomatica**: Numero di path logici
- **LOC (Lines of Code)**: Linee di codice (esclude commenti)
- **Language Detection**: Basato su estensione file

**Algoritmi:**
```
Complessità Ciclomatica:
- Parser AST per linguaggio
- Conta decisioni (if, while, for, case, etc)
- Formula: E - N + 2P (E=edges, N=nodes, P=components)

LOC:
- Split per linee
- Rimuovi commenti e linee vuote
- Count risultante
```

**Librarie Pianificate:**
- `typhonjs-escomplex` per JS/TS
- Custom parsers per altri linguaggi

### 3. Insights Module (`insights/`)

Genera insights automatici basati sulle metriche.

```typescript
// Funzioni principali
- calculateRiskScore(): Calcola score di rischio
- generateInsights(): Genera insights automatici
- generatePersonalizedInsights(): Personalizza per utente
```

**Formula Risk Score:**
```
riskScore = (cyclomatic * 0.3) + (churn * 0.4) + (loc/100 * 0.3)

Pesi:
- 30% complessità (quanto è complesso)
- 40% churn (quanto cambia)
- 30% dimensione (quanto è grande)
```

**Tipi di Insights:**
1. **Critical**: File con risk score > 10
2. **Warning**: Alta complessità O alto churn
3. **Info**: Suggerimenti generali

**Regole di Generazione:**
```typescript
if (cyclomatic > 10) → "Alta complessità"
if (churn > 20) → "File modificato frequentemente"
if (riskScore > 10) → "File ad alto rischio"
if (cyclomatic > 8 && churn > 15) → "Considera refactoring"
```

## Data Flow

### Analisi Repository

```
┌─────────────┐
│   User      │
│  Click      │
│  "Analyze"  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  POST /api/     │
│  analyze        │
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│  Collector         │
│  - Clone repo      │
│  - List files      │
│  - Get history     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Analyzer          │
│  - Calculate       │
│    complexity      │
│  - Count LOC       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Save to DB        │
│  (Files table)     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Insights Gen      │
│  - Calc risk       │
│  - Generate        │
│    insights        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Save Insights     │
│  (Insights table)  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Return to User    │
│  Show results      │
└────────────────────┘
```

## Database Schema

```prisma
User
├── id (PK)
├── email
├── name
├── image
└── repos (1:N)

Repository
├── id (PK)
├── userId (FK)
├── name
├── githubUrl
├── lastAnalyzed
├── files (1:N)
└── insights (1:N)

File
├── id (PK)
├── repoId (FK)
├── path
├── language
├── cyclomatic
├── loc
├── churn
└── riskScore

Insight
├── id (PK)
├── repoId (FK)
├── message
└── severity
```

## API Architecture

### RESTful Endpoints

```
Authentication:
GET  /api/auth/session
POST /api/auth/signin
POST /api/auth/signout

Repositories:
GET    /api/repositories
POST   /api/repositories
GET    /api/repositories/:id
DELETE /api/repositories/:id
GET    /api/repositories/:id/files

Analysis:
POST /api/analyze

Insights:
GET /api/insights

User:
GET /api/user/preferences
PUT /api/user/preferences
```

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Security

### Autenticazione
- GitHub OAuth con scope `read:user user:email repo`
- Session-based auth con NextAuth
- Sessions persistite in database
- CSRF protection integrato

### Autorizzazione
- Middleware protegge route autenticate
- API routes verificano session
- Users possono accedere solo ai propri dati

### Data Protection
- Variabili sensibili in .env
- Secrets non committati in Git
- Database credentials protetti
- GitHub tokens criptati

## Performance

### Ottimizzazioni Pianificate
- Background jobs per analisi lunghe
- Caching risultati analisi
- Incremental analysis (solo file modificati)
- Database indexing su query frequenti
- CDN per assets statici

### Scalabilità
- Serverless architecture (Vercel/Netlify)
- Connection pooling per database
- Rate limiting su API
- Queue system per analisi (Bull/BullMQ)

## Monitoring & Logging

### Pianificato
- Error tracking (Sentry)
- Analytics (Vercel Analytics)
- Performance monitoring (Vercel Speed Insights)
- Audit logs per azioni critiche
- Health check endpoints

## Development Workflow

```
1. Feature branch da main
2. Sviluppo locale con hot reload
3. Commit con conventional commits
4. Push e apri PR
5. Code review
6. Merge su main
7. Auto-deploy su staging
8. Manual deploy su production
```

## Deployment

### Vercel (Recommended)
- Automatic deployments da Git
- Preview deployments per PR
- Environment variables configurate
- PostgreSQL su Supabase/Neon

### Alternative
- Self-hosted con Docker
- AWS (EC2 + RDS)
- Railway/Render

## Future Improvements

### Technical Debt
- Aggiungere comprehensive test suite
- Implementare error boundaries
- Aggiungere retry logic per API calls
- Implementare optimistic UI updates

### Features
- Real-time analysis progress con WebSockets
- Multi-repository comparison
- Historical trend analysis
- Team collaboration features
- Custom rules engine
- Plugin system per custom analyzers

## Decisioni di Design

### Perché Next.js App Router?
- Server Components per performance
- Built-in API routes
- File-based routing
- ISR e SSG support
- Ottimo DX

### Perché Prisma?
- Type-safe database access
- Migrations automatiche
- Ottimo con TypeScript
- Great developer experience

### Perché PostgreSQL?
- Relational data model
- ACID compliance
- Mature ecosystem
- Ottimo per analytics queries

### Perché NextAuth?
- Standard de-facto per Next.js
- Multi-provider support
- Session management incluso
- Security best practices

---

Questo documento verrà aggiornato man mano che l'architettura evolve.
