import { GameState, Event } from "../entities/entity"

/**
 * Scans for player entities that are marked dead and generates PLAYER_RESPAWNED events.
 * This is called each game-loop tick as a safety net (PLAYER_RESPAWNED can also be
 * generated immediately by resolveMechanics in actionProcessor).
 */
export function processRespawn(state: GameState): Event[] {
  const events: Event[] = []

  for (const entity of Object.values(state.entities)) {
    if (entity.type !== "player") continue

    const health = entity.components.health as { hp: number; maxHp: number; isDead?: boolean } | undefined
    if (health?.isDead) {
      events.push({
        id: crypto.randomUUID(),
        type: "PLAYER_RESPAWNED",
        tick: state.tick,
        entity_id: entity.id,
        payload: { entity_id: entity.id, position: { q: 0, r: 0 } }
      })
    }
  }

  return events
}
