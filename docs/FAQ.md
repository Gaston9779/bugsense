# FAQ - Domande Frequenti

## Generale

### Cos'è BugSense?
BugSense è uno strumento di analisi statica del codice che analizza repository GitHub per identificare file complessi, a rischio e che necessitano di refactoring. Calcola metriche come complessità ciclomatica, churn e risk score.

### È gratuito?
Al momento BugSense è in fase beta. Il piano di pricing definitivo sarà annunciato prima del rilascio v1.0.

### Quali linguaggi sono supportati?
Attualmente supportiamo:
- TypeScript/JavaScript
- Python
- Java
- C/C++
- Go
- Rust
- Ruby
- PHP

Il supporto per altri linguaggi è in roadmap.

### I miei dati sono al sicuro?
Sì. Non memorizziamo il codice sorgente, solo le metriche calcolate. Tutte le comunicazioni sono criptate e seguiamo le best practice di security.

## Setup & Configurazione

### Come configuro GitHub OAuth?
1. Vai su https://github.com/settings/developers
2. Crea una nuova OAuth App
3. Usa `http://localhost:3000/api/auth/callback/github` come callback URL
4. Copia Client ID e Secret nel file `.env`

Guida dettagliata: `SETUP.md`

### Ho bisogno di PostgreSQL?
Sì, BugSense richiede PostgreSQL per memorizzare i dati. Puoi usare:
- PostgreSQL locale
- Servizi cloud (Supabase, Neon, Railway)
- Docker container

### Posso usare un altro database?
Tecnicamente sì, Prisma supporta altri database, ma consigliamo PostgreSQL per performance ottimali.

### Errore "Cannot connect to database"
Verifica:
1. PostgreSQL è in esecuzione
2. La stringa `DATABASE_URL` nel `.env` è corretta
3. Il database esiste
4. Le credenziali sono corrette

```bash
# Testa la connessione
psql -h localhost -U postgres -d bugsense
```

## Utilizzo

### Come analizzo un repository?
1. Accedi con GitHub
2. Vai su "Repository"
3. Clicca "Aggiungi Repository"
4. Inserisci l'URL del repository
5. Clicca "Analizza"

**Nota**: Nella versione attuale (v0.1.0) l'analisi reale non è ancora implementata.

### Quanto tempo richiede un'analisi?
Dipende dalla dimensione del repository:
- Piccolo (< 100 file): 30-60 secondi
- Medio (100-500 file): 2-5 minuti
- Grande (> 500 file): 5-15 minuti

### Posso analizzare repository privati?
Sì, se hai dato i permessi corretti durante l'OAuth. BugSense richiede lo scope `repo` per accedere ai repository privati.

### Come funziona il risk score?
Il risk score è calcolato con la formula:
```
risk_score = (complessità * 0.3) + (churn * 0.4) + (LOC/100 * 0.3)
```

Valori:
- 0-3: Basso rischio
- 3-7: Medio rischio
- 7-10: Alto rischio
- 10+: Critico

### Cosa significa "churn"?
Churn è il numero di volte che un file è stato modificato. File con alto churn potrebbero indicare:
- Frequenti bug fix
- Feature instabili
- Mancanza di test
- Design non ottimale

### Come interpreto la complessità ciclomatica?
Valori tipici:
- 1-5: Semplice, facile da testare
- 6-10: Moderata, ancora gestibile
- 11-15: Alta, considera refactoring
- 16+: Molto alta, difficile da mantenere

## Troubleshooting

### L'applicazione non si avvia
```bash
# Verifica Node.js version (richiede 18+)
node -v

# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install

# Verifica .env
cat .env
```

### Errore "Prisma Client not found"
```bash
npm run db:generate
```

### OAuth non funziona
Verifica:
1. `GITHUB_ID` e `GITHUB_SECRET` nel `.env`
2. Callback URL esattamente: `http://localhost:3000/api/auth/callback/github`
3. `NEXTAUTH_SECRET` è configurato
4. `NEXTAUTH_URL` è corretto

### Le modifiche CSS non si applicano
```bash
# Riavvia il server dev
# Ctrl+C per fermare
npm run dev
```

### Database migration errors
```bash
# Reset database (ATTENZIONE: elimina tutti i dati)
npx prisma migrate reset

# O ricrea da zero
npx prisma db push --force-reset
```

## Features

### Posso esportare i risultati?
Non ancora, ma è previsto nella v0.3.0:
- Export PDF
- Export CSV
- Export JSON

### C'è un'API pubblica?
Non ancora. L'API pubblica è pianificata per v0.4.0.

### Supportate webhook?
Webhook support è previsto per v0.4.0.

### Posso integrare con CI/CD?
Integration CI/CD è in roadmap per v0.4.0.

### C'è un'app mobile?
Non al momento, ma l'interfaccia web è responsive.

## Account & Billing

### Come elimino il mio account?
Vai su Impostazioni → Zona Pericolo → Elimina Account

**Attenzione**: Questa azione è irreversibile.

### Come elimino i miei dati?
Impostazioni → Zona Pericolo → Elimina Tutti i Dati

### BugSense salva il mio codice?
No, memorizziamo solo:
- Metriche calcolate (complessità, LOC, churn)
- Path dei file
- Insights generati

Non salviamo il contenuto effettivo dei file.

## Contribuire

### Come posso contribuire?
Vedi `CONTRIBUTING.md` per dettagli completi:
1. Fork il repository
2. Crea un branch feature
3. Fai le modifiche
4. Apri un Pull Request

### Dove segnalo bug?
Apri una issue su GitHub con:
- Descrizione del problema
- Steps per riprodurlo
- Screenshot (se applicabile)
- Versione BugSense

### Posso proporre nuove features?
Assolutamente! Apri una GitHub Discussion o una issue con label `enhancement`.

## Performance & Limiti

### Quanti repository posso analizzare?
Limite attuale: 50 repository per utente

### Quante analisi posso fare?
Rate limit: 10 analisi/ora per utente

### File massimi per repository?
Limite: 10,000 file per repository

### Dimensione massima file?
File > 1MB vengono skippati automaticamente.

## Support

### Come ottengo supporto?
1. Consulta questa FAQ
2. Leggi la documentazione
3. Apri una GitHub Issue
4. Email: support@bugsense.io

### C'è una community?
Sì! Unisciti a:
- GitHub Discussions
- Discord (coming soon)
- Twitter: @bugsense

### Offrite supporto enterprise?
Contattaci a enterprise@bugsense.io per discutere:
- SLA personalizzati
- Supporto prioritario
- On-premise deployment
- Custom features

---

**Non trovi la risposta?** Apri una issue su GitHub o contattaci!
