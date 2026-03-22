import { GameState } from "../../domain/entities/entity"
import { getDatabase, parseJson } from "../db/sqlite"

const db = getDatabase()

function requireSessionId(state: GameState): string {
  if (!state.sessionId) {
    throw new Error("SESSION_ID_REQUIRED")
  }
  return state.sessionId
}

export async function saveSnapshot(state: GameState): Promise<void> {
  const sessionId = requireSessionId(state)

  db.prepare(
    `INSERT INTO session_snapshots(session_id, tick, state)
     VALUES (?, ?, ?)
     ON CONFLICT(session_id, tick) DO UPDATE SET
       state = excluded.state`
  ).run(sessionId, state.tick, JSON.stringify(state))
}

export async function loadLatestSnapshot(sessionId: string): Promise<GameState | null> {
  const row = db.prepare(
    `SELECT state FROM session_snapshots
     WHERE session_id = ?
     ORDER BY tick DESC
     LIMIT 1`
  ).get(sessionId) as { state: string } | undefined

  if (!row) return null

  return parseJson(row.state, null as unknown as GameState)
}
