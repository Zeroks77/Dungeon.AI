// Express HTTP server — REST API for game actions and session management

import express, { Request, Response, NextFunction } from "express"
import { handleAction } from "./actionController"
import {
  createSession,
  getSession,
  listSessions,
  addPlayerToSession,
  deleteSession
} from "../eventStore/sessionStore"
import { createPlayer } from "../../domain/entities/player"
import { saveSnapshot } from "../eventStore/snapshotStore"
import { getVisibleTileKeys } from "../../utils/fov"
import { loadStateForSession } from "../../core/sessionState"

const app = express()
app.use(express.json())

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: Date.now() })
})

// ── Sessions ──────────────────────────────────────────────────────────────────
app.post("/sessions", async (req: Request, res: Response) => {
  const { name, worldSeed } = req.body as { name?: string; worldSeed?: string }
  if (!name) return res.status(400).json({ error: "name is required" })
  const session = await createSession(name, worldSeed)
  return res.status(201).json(session)
})

app.get("/sessions", async (_req: Request, res: Response) => {
  const sessions = await listSessions()
  return res.json(sessions)
})

app.get("/sessions/:id", async (req: Request, res: Response) => {
  const id = req.params["id"] as string
  const session = await getSession(id)
  if (!session) return res.status(404).json({ error: "Session not found" })
  return res.json(session)
})

app.delete("/sessions/:id", async (req: Request, res: Response) => {
  await deleteSession(req.params["id"] as string)
  return res.status(204).send()
})

// ── Players ───────────────────────────────────────────────────────────────────
app.post("/sessions/:sessionId/players", async (req: Request, res: Response) => {
  const sessionId = req.params["sessionId"] as string
  const { playerId, classId, raceId, startQ, startR } = req.body as {
    playerId?: string
    classId?: string
    raceId?: string
    startQ?: number
    startR?: number
  }

  if (!playerId) return res.status(400).json({ error: "playerId is required" })

  const session = await getSession(sessionId)
  if (!session) return res.status(404).json({ error: "Session not found" })

  const state = await loadStateForSession(sessionId)

  if (state.entities[playerId]) {
    return res.status(409).json({ error: "Player already exists" })
  }

  const player = createPlayer(
    playerId,
    { q: startQ ?? 0, r: startR ?? 0 },
    classId ?? "warrior",
    raceId ?? "human"
  )
  state.entities[playerId] = player
  await saveSnapshot(state)
  await addPlayerToSession(sessionId, playerId)

  return res.status(201).json({ player })
})

app.get("/sessions/:sessionId/players/:playerId", async (req: Request, res: Response) => {
  const sessionId = req.params["sessionId"] as string
  const playerId = req.params["playerId"] as string
  const session = await getSession(sessionId)
  if (!session) return res.status(404).json({ error: "Session not found" })

  const state = await loadStateForSession(sessionId)
  const player = state.entities[playerId]
  if (!player) return res.status(404).json({ error: "Player not found" })
  return res.json({ player })
})

// ── Actions ───────────────────────────────────────────────────────────────────
app.post("/actions", (req: Request, res: Response) => {
  const result = handleAction(req as unknown as { body: unknown })
  return res.status(result.status).json(result.body)
})

// ── Visibility (FOV) ─────────────────────────────────────────────────────────
app.get("/sessions/:sessionId/players/:playerId/visible-tiles", async (req: Request, res: Response) => {
  const sessionId = req.params["sessionId"] as string
  const playerId = req.params["playerId"] as string
  const radius = parseInt((req.query["radius"] as string) ?? "6", 10)

  const session = await getSession(sessionId)
  if (!session) return res.status(404).json({ error: "Session not found" })

  const state = await loadStateForSession(sessionId)

  const player = state.entities[playerId]
  if (!player) return res.status(404).json({ error: "Player not found" })

  const pos = player.components.position as { q: number; r: number }
  const visibleKeys = getVisibleTileKeys(pos, radius, state)
  const tiles: Record<string, unknown> = {}
  for (const key of visibleKeys) {
    if (state.worldTiles?.[key]) tiles[key] = state.worldTiles[key]
  }

  return res.json({ visible_tiles: tiles, count: visibleKeys.size })
})

// ── State query ───────────────────────────────────────────────────────────────
app.get("/sessions/:sessionId/state", async (req: Request, res: Response) => {
  const sessionId = req.params["sessionId"] as string
  const session = await getSession(sessionId)
  if (!session) return res.status(404).json({ error: "Session not found" })

  const state = await loadStateForSession(sessionId)
  // Strip large world tiles from state response
  const { worldTiles: _wt, ...stateWithoutTiles } = state
  return res.json(stateWithoutTiles)
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[API] Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = parseInt(process.env.API_PORT ?? "3000", 10)

export function startApiServer(): void {
  app.listen(PORT, () => {
    console.log(`[API] HTTP server listening on port ${PORT}`)
  })
}

export { app }
