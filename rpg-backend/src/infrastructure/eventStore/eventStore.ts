import { Event } from "../../domain/entities/entity"
import { getDatabase, parseJson } from "../db/sqlite"

const db = getDatabase()
const insertEvent = db.prepare(
  `INSERT INTO session_events(session_id, id, type, tick, entity_id, payload)
   VALUES (?, ?, ?, ?, ?, ?)`
)

export async function appendEvents(events: Event[], sessionId: string): Promise<void> {
  for (const evt of events) {
    insertEvent.run(
      sessionId,
      evt.id,
      evt.type,
      evt.tick,
      evt.entity_id ?? null,
      JSON.stringify(evt.payload)
    )
  }
}

export async function loadEvents(afterTick: number, sessionId: string): Promise<Event[]> {
  const sessionRows = db.prepare(
    `SELECT id, type, tick, entity_id, payload
     FROM session_events
     WHERE session_id = ? AND tick > ?
     ORDER BY tick ASC`
  ).all(sessionId, afterTick) as Array<{
    id: string
    type: string
    tick: number
    entity_id: string | null
    payload: string
  }>

  return sessionRows.map(row => ({
    id: row.id,
    type: row.type,
    tick: row.tick,
    entity_id: row.entity_id ?? undefined,
    payload: parseJson(row.payload, {})
  }))
}
