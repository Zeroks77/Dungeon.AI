// Session management — create, join, and manage game sessions

import { GameState, SessionInfo } from "../../domain/entities/entity"
import { generateWorld } from "../../domain/world/worldGen"
import { getDatabase, parseJson } from "../db/sqlite"
import { saveSnapshot } from "./snapshotStore"

const db = getDatabase()

type SessionRow = {
  id: string
  name: string
  world_seed: string
  created_at: number
  player_ids: string
  current_tick: number
}

function mapSessionRow(row: SessionRow): SessionInfo {
  return {
    sessionId: row.id,
    name: row.name,
    worldSeed: row.world_seed,
    createdAt: row.created_at,
    playerIds: parseJson<string[]>(row.player_ids, []),
    currentTick: row.current_tick
  }
}

export async function createSession(
  name: string,
  worldSeed?: string
): Promise<SessionInfo> {
  const sessionId = crypto.randomUUID()
  const seed = worldSeed ?? `world-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const session: SessionInfo = {
    sessionId,
    name,
    worldSeed: seed,
    createdAt: Date.now(),
    playerIds: [],
    currentTick: 0
  }

  db.prepare(
    `INSERT INTO sessions(id, name, world_seed, created_at, player_ids, current_tick)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(sessionId, name, seed, session.createdAt, JSON.stringify([]), 0)

  // Build initial world tiles and save as initial snapshot
  const world = generateWorld(seed, 40)
  const worldTiles: Record<string, unknown> = {}
  for (const [key, tile] of world.tiles) {
    worldTiles[key] = tile
  }

  const initialState: GameState = {
    tick: 0,
    entities: {},
    effects: [],
    sessionId,
    worldSeed: seed,
    worldTiles: worldTiles as GameState["worldTiles"],
    dungeons: {},
    weather: "clear",
    timeOfDay: 8
  }

  await saveSnapshot(initialState)

  return session
}

export async function getSession(sessionId: string): Promise<SessionInfo | null> {
  const row = db.prepare(
    `SELECT id, name, world_seed, created_at, player_ids, current_tick
     FROM sessions
     WHERE id = ?`
  ).get(sessionId) as SessionRow | undefined

  return row ? mapSessionRow(row) : null
}

export async function listSessions(): Promise<SessionInfo[]> {
  const rows = db.prepare(
    `SELECT id, name, world_seed, created_at, player_ids, current_tick
     FROM sessions
     ORDER BY created_at DESC`
  ).all() as SessionRow[]

  return rows.map(mapSessionRow)
}

export async function addPlayerToSession(
  sessionId: string,
  playerId: string
): Promise<void> {
  const session = await getSession(sessionId)
  if (!session) return

  const playerIds = session.playerIds.includes(playerId)
    ? session.playerIds
    : [...session.playerIds, playerId]

  db.prepare(
    `UPDATE sessions
     SET player_ids = ?
     WHERE id = ?`
  ).run(JSON.stringify(playerIds), sessionId)
}

export async function updateSessionTick(
  sessionId: string,
  tick: number
): Promise<void> {
  db.prepare(
    `UPDATE sessions SET current_tick = ? WHERE id = ?`
  ).run(tick, sessionId)
}

export async function deleteSession(sessionId: string): Promise<void> {
  db.prepare(`DELETE FROM session_events WHERE session_id = ?`).run(sessionId)
  db.prepare(`DELETE FROM session_snapshots WHERE session_id = ?`).run(sessionId)
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId)
}
