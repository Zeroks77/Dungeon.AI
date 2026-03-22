import { GameState, Event } from "../entities/entity"
import { findPath } from "../../utils/pathfinding"

export function processMovement(state: GameState, event: Event): Event[] {
  if (event.type !== "PLAYER_MOVED" && event.type !== "NPC_MOVED") return []

  const payload = event.payload as { to: { q: number; r: number } }
  const entity = event.entity_id ? state.entities[event.entity_id] : null

  if (!entity) return []

  const from = entity.components.position as { q: number; r: number }
  const path = findPath(from, payload.to, state)

  if (path.length < 2) return []

  return [event]
}
