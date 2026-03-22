import { Pool } from "pg"
import { GameState } from "../../domain/entities/entity"

const pool = new Pool()

export async function saveSnapshot(state: GameState): Promise<void> {
  await pool.query(
    `INSERT INTO snapshots(tick, state)
     VALUES ($1,$2)
     ON CONFLICT (tick) DO UPDATE SET state = EXCLUDED.state`,
    [state.tick, JSON.stringify(state)]
  )
}

export async function loadLatestSnapshot(): Promise<GameState | null> {
  const res = await pool.query(
    `SELECT * FROM snapshots ORDER BY tick DESC LIMIT 1`
  )

  if (res.rows.length === 0) return null

  const row = res.rows[0] as { tick: number; state: GameState }
  return typeof row.state === "string"
    ? (JSON.parse(row.state) as GameState)
    : row.state
}
