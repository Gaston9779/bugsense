# API Documentation

Documentazione completa delle API di BugSense.

## Autenticazione

Tutte le API protette richiedono autenticazione tramite NextAuth session.

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  return new Response("Unauthorized", { status: 401 });
}
```

## Endpoints

### POST /api/analyze

Avvia l'analisi di un repository GitHub.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/username/repo",
  "branch": "main" // opzionale
}
```

**Response:**
```json
{
  "status": "ok",
  "repositoryId": "clx123...",
  "message": "Analisi avviata"
}
```

**Status Codes:**
- 200: Analisi avviata con successo
- 401: Non autenticato
- 400: URL repository non valido
- 500: Errore interno

---

### GET /api/repositories

Ottieni tutti i repository dell'utente autenticato.

**Response:**
```json
{
  "repositories": [
    {
      "id": "clx123...",
      "name": "my-repo",
      "githubUrl": "https://github.com/user/my-repo",
      "lastAnalyzed": "2024-01-20T10:30:00Z",
      "_count": {
        "files": 42,
        "insights": 5
      }
    }
  ]
}
```

---

### GET /api/repositories/:id

Ottieni dettagli di un repository specifico.

**Response:**
```json
{
  "repository": {
    "id": "clx123...",
    "name": "my-repo",
    "githubUrl": "https://github.com/user/my-repo",
    "lastAnalyzed": "2024-01-20T10:30:00Z",
    "files": [],
    "insights": []
  }
}
```

---

### DELETE /api/repositories/:id

Elimina un repository e tutti i dati associati.

**Response:**
```json
{
  "success": true,
  "message": "Repository eliminato"
}
```

---

### GET /api/repositories/:id/files

Ottieni tutti i file analizzati di un repository.

**Query Parameters:**
- `sortBy`: field per ordinamento (riskScore, cyclomatic, churn, loc)
- `order`: asc | desc
- `minRiskScore`: filtro risk score minimo
- `language`: filtra per linguaggio

**Response:**
```json
{
  "files": [
    {
      "id": "clx456...",
      "path": "src/index.ts",
      "language": "TypeScript",
      "cyclomatic": 12,
      "loc": 250,
      "churn": 15,
      "riskScore": 8.5
    }
  ]
}
```

---

### GET /api/insights

Ottieni tutti gli insights.

**Query Parameters:**
- `repositoryId`: filtra per repository
- `severity`: filtra per severity (info, warning, critical)

**Response:**
```json
{
  "insights": [
    {
      "id": "clx789...",
      "repoId": "clx123...",
      "message": "File ad alto rischio: src/complex.ts",
      "severity": "critical",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

---

### GET /api/dashboard/stats

Ottieni statistiche per la dashboard.

**Response:**
```json
{
  "totalRepositories": 5,
  "totalFiles": 420,
  "avgChurn": 12.5,
  "avgRiskScore": 6.2,
  "criticalInsights": 3,
  "recentlyAnalyzed": [],
  "topRiskyFiles": []
}
```

---

### PUT /api/user/preferences

Aggiorna le preferenze utente.

**Request Body:**
```json
{
  "focus": "quality",
  "riskThreshold": 10,
  "emailNotifications": true
}
```

**Response:**
```json
{
  "success": true,
  "preferences": { ... }
}
```

## Error Responses

Tutte le API possono ritornare errori nel seguente formato:

```json
{
  "error": {
    "message": "Descrizione errore",
    "code": "ERROR_CODE"
  }
}
```

### Codici Errore Comuni

- `UNAUTHORIZED`: Utente non autenticato
- `FORBIDDEN`: Accesso negato alla risorsa
- `NOT_FOUND`: Risorsa non trovata
- `VALIDATION_ERROR`: Dati di input non validi
- `RATE_LIMIT_EXCEEDED`: Troppi richieste
- `INTERNAL_ERROR`: Errore interno del server

## Rate Limiting

Le API sono limitate a:
- 100 richieste/minuto per utente autenticato
- 10 analisi/ora per utente

## Webhooks (Future)

BugSense supporterà webhook per eventi:
- `analysis.completed`: Analisi completata
- `insight.created`: Nuovo insight critico generato
- `repository.deleted`: Repository eliminato
