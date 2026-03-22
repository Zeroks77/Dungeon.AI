import { Pool } from "pg"
import { Event } from "../../domain/entities/entity"

const pool = new Pool()

export async function appendEvents(events: Event[]): Promise<void> {
  for (const evt of events) {
    await pool.query(
      `INSERT INTO events(id, type, tick, entity_id, payload)
       VALUES ($1,$2,$3,$4,$5)`,
      [evt.id, evt.type, evt.tick, evt.entity_id ?? null, JSON.stringify(evt.payload)]
    )
  }
}

export async function loadEvents(afterTick: number): Promise<Event[]> {
  const res = await pool.query(
    `SELECT * FROM events WHERE tick > $1 ORDER BY tick ASC`,
    [afterTick]
  )
  return res.rows as Event[]
}
