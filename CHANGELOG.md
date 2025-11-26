# Changelog

Tutte le modifiche importanti al progetto BugSense verranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Implementazione collector GitHub API
- Calcolo complessità ciclomatica reale
- Generazione insights automatica
- Grafici e visualizzazioni interattive
- Export report PDF/CSV
- Sistema di notifiche
- Test suite completa

## [0.1.0] - 2024-01-20

### Added - Bootstrap Iniziale

#### Core Features
- Progetto Next.js 14 con App Router e TypeScript
- Autenticazione GitHub OAuth con NextAuth.js
- Database PostgreSQL con Prisma ORM
- Tailwind CSS e shadcn/ui per styling

#### Pagine
- Homepage con landing page moderna
- Pagina login personalizzata
- Dashboard con metriche (placeholder)
- Gestione repository
- Visualizzazione insights
- Pagina impostazioni utente

#### Componenti UI
- Button, Card, Badge, Avatar
- DropdownMenu, Input, Tabs, Select
- Skeleton loaders
- Navbar con autenticazione
- Footer con link utili
- MetricsCard, EmptyState, LoadingState
- FileList per visualizzazione file analizzati

#### Moduli Backend
- `collector/`: Struttura per raccolta dati GitHub
- `analyzer/`: Logica per analisi complessità
- `insights/`: Generazione insights e risk score
- Schema Prisma completo (User, Repository, File, Insight)

#### API Routes
- `/api/auth/[...nextauth]`: Autenticazione
- `/api/analyze`: Endpoint analisi (placeholder)

#### Utilities e Helpers
- Validators con Zod
- Formatters per numeri, date, metriche
- Constants per soglie e configurazioni
- Custom hooks (useToast, useAsync)
- API client per chiamate backend
- Date utilities
- TypeScript types condivisi

#### Documentazione
- README.md completo
- SETUP.md con istruzioni dettagliate
- API.md con documentazione API
- CONTRIBUTING.md per contributors
- Script di setup automatizzato

#### Configurazione
- ESLint per code quality
- Prettier per code formatting
- VSCode settings e extensions
- Middleware per protezione route
- Prisma Client generato

### Infrastructure
- File .env.example con tutte le variabili
- .gitignore configurato
- npm scripts per development e database
- Struttura cartelle modulare e scalabile

---

## Note sulla Versione 0.1.0

Questa è la versione iniziale di bootstrap del progetto. Include tutta l'infrastruttura
necessaria e l'UI, ma la logica di analisi reale non è ancora implementata.

### Cosa Funziona
✅ Login con GitHub OAuth  
✅ Navigazione tra le pagine  
✅ UI responsive e moderna  
✅ Database schema pronto  
✅ Struttura modulare completa  

### Cosa Manca
⏳ Integrazione GitHub API per clonare repository  
⏳ Calcolo reale complessità ciclomatica  
⏳ Analisi churn da Git history  
⏳ Generazione automatica insights  
⏳ Grafici e visualizzazioni dati  
⏳ Sistema di background jobs  

### Breaking Changes
Nessuno (prima release)

### Migration Notes
Esegui `npm run db:push` per creare le tabelle nel database.

---

[Unreleased]: https://github.com/yourusername/bugsense/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/bugsense/releases/tag/v0.1.0
