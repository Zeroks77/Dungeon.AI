# Dungeon.AI RPG Backend

TypeScript backend for a session-based RPG simulation with:

- Express HTTP API
- WebSocket state updates
- Tick-based game loop
- SQLite persistence for events, snapshots, and sessions

## Voraussetzungen

- Node.js 20+
- npm 10+

Keine externe Datenbank ist notwendig. Das Projekt legt beim Start automatisch eine lokale SQLite-Datei an.

## Installation

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. SQLite-Datei und Tabellen einmalig initialisieren:

```bash
npm run db:init
```

Standardmaessig wird die Datei unter `data/dungeon-ai.sqlite` angelegt.

Optional kannst du den Pfad selbst setzen:

```powershell
$env:DB_FILE="./data/local-dev.sqlite"
```

Weitere optionale Variablen:

```powershell
$env:API_PORT="3000"
$env:WS_PORT="3001"
$env:OPENAI_API_KEY="dein_api_key"
```

In `cmd.exe` waere die Syntax stattdessen:

```bat
set API_PORT=3000
set WS_PORT=3001
set OPENAI_API_KEY=dein_api_key
```

Ohne `OPENAI_API_KEY` startet der Server trotzdem. KI-Narration verwendet dann einen einfachen lokalen Fallback statt OpenAI.

## Server starten

Der Entwicklungsstart startet den HTTP-Server, den WebSocket-Server und die Game-Loop zusammen:

```bash
npm run dev
```

Wichtig: Wenn `npm run dev` mit `ts-node konnte nicht gefunden werden` fehlschlaegt, wurden die Node-Abhaengigkeiten noch nicht installiert. In dem Fall zuerst `npm install` ausfuehren.

Fuer einen Build und Start aus dem kompilierten Output:

```bash
npm run build
npm start
```

## Verfuegbare Skripte

- `npm run dev` startet `src/core/gameLoop.ts`
- `npm run db:init` initialisiert die SQLite-Datei und das Schema
- `npm run build` kompiliert TypeScript nach `dist/`
- `npm start` startet den kompilierten Server aus `dist/`
- `npm test` fuehrt Jest-Tests aus
- `npm run lint` fuehrt ESLint auf `src/` aus

## Webserver verwenden

Standardports:

- HTTP API: `http://localhost:3000`
- WebSocket: `ws://localhost:3001`

Health-Check:

```bash
curl http://localhost:3000/health
```

Session anlegen:

```bash
curl -X POST http://localhost:3000/sessions ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Session\"}"
```

Alle Sessions laden:

```bash
curl http://localhost:3000/sessions
```

## Relevante Endpunkte

- `GET /health`
- `POST /sessions`
- `GET /sessions`
- `GET /sessions/:id`
- `DELETE /sessions/:id`
- `POST /sessions/:sessionId/players`
- `GET /sessions/:sessionId/players/:playerId`
- `GET /sessions/:sessionId/players/:playerId/visible-tiles`
- `GET /sessions/:sessionId/state`
- `POST /actions`

Fuer `POST /actions` muss der Request jetzt eine `session_id` enthalten.
Optional kann er auch `locale` enthalten, damit Narration und spaetere UI-Texte sprachspezifisch verarbeitet werden koennen.

## Projektstruktur

- `src/core/` Game-Loop, RNG, Validierung
- `src/domain/` ECS-Domain, Events, Systeme, Weltgenerierung
- `src/infrastructure/api/` Express API
- `src/infrastructure/websocket/` WebSocket-Server
- `src/infrastructure/eventStore/` SQLite-Zugriff
- `src/infrastructure/db/` SQLite-Verbindung und Initialisierung
- `src/i18n/` Sprachdateien und i18n-Katalog fuer UI und DM-LLM-Kontext
- `db/schema.sqlite.sql` SQLite-Schema
- `mockups/dungeon-ui.html` standalone Frontend-Idee ohne Backend-Anbindung

## Hinweise

- Der Einstiegspunkt fuer die Laufzeit ist `src/core/gameLoop.ts`.
- Beim direkten Start werden API-Server und WebSocket-Server zusammen mit der Game-Loop initialisiert.
- Die SQLite-Datenbank wird automatisch geoeffnet und das Schema beim Start geladen.