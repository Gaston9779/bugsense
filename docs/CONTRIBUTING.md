# Contributing to BugSense

Grazie per il tuo interesse nel contribuire a BugSense! 🎉

## Getting Started

1. Fork il repository
2. Clona il tuo fork:
   ```bash
   git clone https://github.com/tuo-username/bugsense.git
   cd bugsense
   ```

3. Installa le dipendenze:
   ```bash
   npm install
   ```

4. Configura l'ambiente (vedi `SETUP.md`)

5. Crea un branch per la tua feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## Struttura del Progetto

```
bugsense/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Custom components
├── lib/             # Utility functions e configurazioni
│   ├── hooks/       # Custom React hooks
│   └── ...          # Helpers, validators, etc
├── prisma/          # Database schema
├── collector/       # GitHub data collection
├── analyzer/        # Code analysis logic
├── insights/        # Insights generation
├── ui/             # Feature-specific UI components
└── types/          # TypeScript type definitions
```

## Linee Guida per il Codice

### TypeScript

- Usa TypeScript per tutti i nuovi file
- Evita `any`, usa tipi specifici
- Esporta tipi da `types/index.ts`

```typescript
// ✅ Buono
interface UserData {
  id: string;
  name: string;
}

// ❌ Evitare
const userData: any = { ... };
```

### React Components

- Usa functional components con hooks
- Preferisci named exports per components
- Usa "use client" solo quando necessario

```typescript
// ✅ Buono
export function MyComponent({ data }: Props) {
  return <div>{data}</div>;
}

// ❌ Evitare
export default ({ data }: any) => <div>{data}</div>;
```

### Styling

- Usa Tailwind CSS per lo styling
- Usa componenti shadcn/ui quando possibile
- Mantieni classi ordinate con `cn()` utility

```typescript
// ✅ Buono
<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary",
  className
)}>

// ❌ Evitare
<div className="flex items-center gap-2" style={{ ... }}>
```

### Database

- Tutte le modifiche allo schema vanno in `prisma/schema.prisma`
- Usa migration per modifiche in produzione
- Testa le modifiche con `db:push` in dev

```bash
# Development
npm run db:push

# Production
npm run db:migrate
```

## Testing

Al momento non abbiamo test automatizzati, ma pianifichiamo di aggiungere:
- Unit tests con Jest
- Integration tests con Playwright
- E2E tests per flussi principali

## Commit Messages

Usa conventional commits:

```
feat: add repository filtering
fix: correct risk score calculation
docs: update API documentation
style: format code with prettier
refactor: simplify analyzer module
test: add tests for insights generation
chore: update dependencies
```

## Pull Request Process

1. Assicurati che il codice compili senza errori
2. Aggiorna la documentazione se necessario
3. Descrivi le modifiche nel PR
4. Collega issue rilevanti
5. Aspetta review prima di fare merge

### PR Template

```markdown
## Descrizione
Breve descrizione delle modifiche

## Tipo di Modifica
- [ ] Bug fix
- [ ] Nuova feature
- [ ] Breaking change
- [ ] Documentazione

## Testing
Come hai testato le modifiche?

## Screenshots
Se applicabile, aggiungi screenshot

## Checklist
- [ ] Il codice compila senza errori
- [ ] Ho testato le modifiche
- [ ] Ho aggiornato la documentazione
- [ ] Ho seguito le linee guida del codice
```

## Aree di Contributo

### High Priority

- [ ] Implementare collector per GitHub API
- [ ] Implementare analyzer per calcolo complessità
- [ ] Aggiungere grafici e visualizzazioni
- [ ] Sistema di code per analisi asincrone
- [ ] Test suite completa

### Medium Priority

- [ ] Dark mode toggle
- [ ] Export report (PDF/CSV)
- [ ] Notifiche email
- [ ] Webhook per CI/CD
- [ ] Supporto per altri Git providers (GitLab, Bitbucket)

### Documentation

- [ ] Tutorial video
- [ ] Esempi di utilizzo
- [ ] FAQ
- [ ] Troubleshooting guide

## Domande?

Apri una issue o contattaci su:
- GitHub Discussions
- Email: contribute@bugsense.io

## Licenza

Contribuendo a BugSense, accetti che i tuoi contributi saranno sotto licenza MIT.
