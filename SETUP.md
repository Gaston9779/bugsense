# 🚀 Guida Setup BugSense

Questa guida ti aiuterà a configurare BugSense in pochi minuti.

## Prerequisiti

- Node.js 18+ installato
- PostgreSQL installato e in esecuzione
- Account GitHub per OAuth

## Step 1: Installazione Dipendenze

Le dipendenze sono già installate. Se necessario, esegui:

```bash
npm install
```

## Step 2: Configurazione Database PostgreSQL

### Crea il database

```bash
# Usando psql
psql -U postgres
CREATE DATABASE bugsense;
\q

# Oppure usando createdb
createdb bugsense
```

### Configura la stringa di connessione

Crea un file `.env` nella root del progetto:

```bash
cp .env.example .env
```

Modifica il file `.env` e aggiorna `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bugsense?schema=public"
```

Sostituisci `username` e `password` con le tue credenziali PostgreSQL.

## Step 3: Configurazione GitHub OAuth

### Crea una GitHub OAuth App

1. Vai su https://github.com/settings/developers
2. Clicca su "New OAuth App"
3. Compila i campi:
   - **Application name**: BugSense Dev
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Clicca "Register application"
5. Copia il **Client ID**
6. Genera e copia il **Client Secret**

### Configura le variabili d'ambiente

Aggiungi al file `.env`:

```env
GITHUB_ID="il-tuo-client-id"
GITHUB_SECRET="il-tuo-client-secret"
```

### Genera NextAuth Secret

```bash
openssl rand -base64 32
```

Aggiungi il risultato al file `.env`:

```env
NEXTAUTH_SECRET="il-secret-generato"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Inizializza il Database

Esegui Prisma per creare le tabelle:

```bash
npm run db:push
```

Questo comando:
- Legge lo schema Prisma
- Crea tutte le tabelle nel database
- Genera il Prisma Client

Per verificare il database, puoi usare Prisma Studio:

```bash
npm run db:studio
```

## Step 5: Avvia l'Applicazione

```bash
npm run dev
```

L'applicazione sarà disponibile su: **http://localhost:3000**

## Step 6: Primo Accesso

1. Apri http://localhost:3000
2. Clicca su "Accedi" nella navbar
3. Clicca "Continua con GitHub"
4. Autorizza l'applicazione
5. Verrai reindirizzato alla homepage autenticato

## 📁 Struttura File .env Completa

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bugsense?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Optional: GitHub Personal Access Token
GITHUB_TOKEN="your-github-pat"
```

## 🔧 Comandi Utili

```bash
# Sviluppo
npm run dev          # Avvia server sviluppo
npm run build        # Build produzione
npm run start        # Avvia server produzione

# Database
npm run db:generate  # Genera Prisma Client
npm run db:push      # Sincronizza schema con DB (dev)
npm run db:migrate   # Crea migration (produzione)
npm run db:studio    # Apri Prisma Studio

# Linting
npm run lint         # Esegui ESLint
```

## 🐛 Troubleshooting

### Errore: "Cannot connect to database"

- Verifica che PostgreSQL sia in esecuzione
- Controlla la stringa `DATABASE_URL` nel file `.env`
- Verifica username e password

### Errore: "OAuth error"

- Verifica che `GITHUB_ID` e `GITHUB_SECRET` siano corretti
- Controlla che il callback URL sia esattamente: `http://localhost:3000/api/auth/callback/github`
- Verifica che `NEXTAUTH_SECRET` sia presente nel `.env`

### Errore: "Prisma Client not found"

```bash
npm run db:generate
```

### Errore: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Verifica Setup

Per verificare che tutto funzioni:

1. ✅ Server si avvia senza errori
2. ✅ Homepage carica correttamente
3. ✅ Login GitHub funziona
4. ✅ Dopo login, vedi avatar nella navbar
5. ✅ Dashboard è accessibile
6. ✅ Nessun errore nella console

## 🎯 Prossimi Passi

Dopo il setup, il progetto è pronto per implementare:

1. **Collector**: Logica per scaricare repository da GitHub
2. **Analyzer**: Calcolo complessità ciclomatica
3. **Insights**: Generazione automatica insights
4. **Dashboard**: Grafici e visualizzazioni

Consulta il `README.md` per la roadmap completa.

## 📚 Risorse

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Buon coding! 🚀**
