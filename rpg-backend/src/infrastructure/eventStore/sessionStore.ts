// Session management — create, join, and manage game sessions

import { Pool } from "pg"
import { GameState, SessionInfo } from "../../domain/entities/entity"
import { generateWorld } from "../../domain/world/worldGen"
import { saveSnapshot } from "./snapshotStore"

const pool = new Pool()

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

  await pool.query(
    `INSERT INTO sessions(id, name, world_seed, created_at, player_ids, current_tick)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [sessionId, name, seed, session.createdAt, JSON.stringify([]), 0]
  )

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
  const res = await pool.query(
    `SELECT * FROM sessions WHERE id = $1`,
    [sessionId]
  )
  if (res.rows.length === 0) return null
  const row = res.rows[0] as {
    id: string; name: string; world_seed: string
    created_at: number; player_ids: string[] | string; current_tick: number
  }
  return {
    sessionId: row.id,
    name: row.name,
    worldSeed: row.world_seed,
    createdAt: row.created_at,
    playerIds: typeof row.player_ids === "string" ? JSON.parse(row.player_ids) : row.player_ids,
    currentTick: row.current_tick
  }
}

export async function listSessions(): Promise<SessionInfo[]> {
  const res = await pool.query(`SELECT * FROM sessions ORDER BY created_at DESC`)
  return res.rows.map(row => {
    const r = row as {
      id: string; name: string; world_seed: string
      created_at: number; player_ids: string[] | string; current_tick: number
    }
    return {
      sessionId: r.id,
      name: r.name,
      worldSeed: r.world_seed,
      createdAt: r.created_at,
      playerIds: typeof r.player_ids === "string" ? JSON.parse(r.player_ids) : r.player_ids,
      currentTick: r.current_tick
    }
  })
}

export async function addPlayerToSession(
  sessionId: string,
  playerId: string
): Promise<void> {
  await pool.query(
    `UPDATE sessions
     SET player_ids = player_ids || $1::jsonb
     WHERE id = $2`,
    [JSON.stringify([playerId]), sessionId]
  )
}

export async function updateSessionTick(
  sessionId: string,
  tick: number
): Promise<void> {
  await pool.query(
    `UPDATE sessions SET current_tick = $1 WHERE id = $2`,
    [tick, sessionId]
  )
}

export async function deleteSession(sessionId: string): Promise<void> {
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId])
}
