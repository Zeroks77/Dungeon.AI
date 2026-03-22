// Faction system — reputation changes, political events

import { GameState, Event } from "../entities/entity"
import { getReputationStanding, getRelationDisposition, FACTIONS } from "../definitions/factions"

export function processReputationChange(state: GameState, event: Event): Event[] {
  if (event.type !== "REPUTATION_CHANGED") return []

  const payload = event.payload as {
    entity_id: string
    faction_id: string
    delta: number
  }
  const entity = state.entities[payload.entity_id]
  if (!entity) return []

  const rep = entity.components.reputation as {
    factions: Record<string, number>
  } | undefined
  if (!rep) return []

  const current = rep.factions[payload.faction_id] ?? 0
  const newRep = Math.max(-10000, Math.min(10000, current + payload.delta))
  const oldStanding = getReputationStanding(payload.faction_id, current)
  const newStanding = getReputationStanding(payload.faction_id, newRep)

  const events: Event[] = []

  // Apply reputation to allies/enemies of the faction (ripple effect)
  const faction = FACTIONS[payload.faction_id]
  if (faction) {
    for (const relation of faction.relations) {
      const ripple = Math.floor(payload.delta * (relation.disposition / 200))
      if (ripple !== 0) {
        events.push({
          id: crypto.randomUUID(),
          type: "REPUTATION_CHANGED",
          tick: state.tick,
          entity_id: payload.entity_id,
          payload: {
            entity_id: payload.entity_id,
            faction_id: relation.factionId,
            delta: ripple
          }
        })
      }
    }
  }

  // If standing changed, notify
  if (oldStanding !== newStanding) {
    events.push({
      id: crypto.randomUUID(),
      type: "STANDING_CHANGED",
      tick: state.tick,
      entity_id: payload.entity_id,
      payload: {
        entity_id: payload.entity_id,
        faction_id: payload.faction_id,
        old_standing: oldStanding,
        new_standing: newStanding
      }
    })
  }

  return events
}

export function isFactionHostile(
  entity: { components: Record<string, unknown> },
  factionId: string
): boolean {
  const rep = entity.components.reputation as {
    factions: Record<string, number>
  } | undefined
  if (!rep) return false
  const points = rep.factions[factionId] ?? 0
  return getReputationStanding(factionId, points) === "hostile"
}

export function isFactionFriendly(
  entity: { components: Record<string, unknown> },
  factionId: string
): boolean {
  const rep = entity.components.reputation as {
    factions: Record<string, number>
  } | undefined
  if (!rep) return false
  const points = rep.factions[factionId] ?? 0
  const standing = getReputationStanding(factionId, points)
  return standing === "friendly" || standing === "honored" || standing === "exalted"
}
