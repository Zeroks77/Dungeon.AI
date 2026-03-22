import { GameState, Event, Entity } from "../entities/entity"
import { hexDistance } from "../components/position"

export function processNpcs(state: GameState): Event[] {
  const events: Event[] = []

  // ── Faction-aware aggression & auto-aggro ─────────────────────────────────
  for (const entity of Object.values(state.entities)) {
    if (entity.type !== "npc") continue

    const behavior = entity.components.behavior as {
      aggro: boolean
      targetId?: string
      npcType: string
      factionId?: string
    }

    if (behavior.aggro) continue  // already aggro'd

    const npcPos = entity.components.position as { q: number; r: number }

    // Faction-aware: aggro players with very low reputation towards this NPC's faction
    if (behavior.factionId) {
      for (const other of Object.values(state.entities)) {
        if (other.type !== "player") continue
        const rep = other.components.reputation as { factions: Record<string, number> } | undefined
        const standing = rep?.factions[behavior.factionId] ?? 0
        if (standing < -1000) {
          events.push({
            id: crypto.randomUUID(),
            type: "NPC_AGGRO",
            tick: state.tick,
            entity_id: entity.id,
            payload: { npc_id: entity.id, target_id: other.id }
          })
          break
        }
      }
      continue
    }

    // Auto-aggro: monsters auto-aggro the nearest player within range 5
    if (behavior.npcType === "monster") {
      let nearestPlayer: Entity | null = null
      let nearestDist = Infinity

      for (const other of Object.values(state.entities)) {
        if (other.type !== "player") continue
        const otherPos = other.components.position as { q: number; r: number }
        const dist = hexDistance(npcPos, otherPos)
        if (dist <= 5 && dist < nearestDist) {
          nearestDist = dist
          nearestPlayer = other
        }
      }

      if (nearestPlayer) {
        events.push({
          id: crypto.randomUUID(),
          type: "NPC_AGGRO",
          tick: state.tick,
          entity_id: entity.id,
          payload: { npc_id: entity.id, target_id: nearestPlayer.id }
        })
      }
    }
  }

  // ── Aggro'd NPC movement / attack ─────────────────────────────────────────
  for (const entity of Object.values(state.entities)) {
    if (entity.type !== "npc") continue

    const behavior = entity.components.behavior as {
      aggro: boolean
      targetId?: string
      npcType: string
    }

    if (!behavior.aggro) continue

    const target = behavior.targetId ? state.entities[behavior.targetId] : null
    if (!target) continue

    const npcPos = entity.components.position as { q: number; r: number }
    const targetPos = target.components.position as { q: number; r: number }
    const dist = hexDistance(npcPos, targetPos)

    // Deaggro if target is too far away
    if (dist > 10) {
      events.push({
        id: crypto.randomUUID(),
        type: "NPC_DEAGGRO",
        tick: state.tick,
        entity_id: entity.id,
        payload: { npc_id: entity.id }
      })
      continue
    }

    // Flee if low HP and not a guard-type
    const health = entity.components.health as { hp: number; maxHp: number } | undefined
    const shouldFlee =
      health !== undefined &&
      health.hp / health.maxHp < 0.25 &&
      behavior.npcType !== "guard" &&
      behavior.npcType !== "guard_captain"

    if (dist <= 1) {
      if (shouldFlee) {
        const next = moveAway(npcPos, targetPos)
        events.push({
          id: crypto.randomUUID(),
          type: "NPC_MOVED",
          tick: state.tick,
          entity_id: entity.id,
          payload: { from: npcPos, to: next }
        })
      } else {
        events.push({
          id: crypto.randomUUID(),
          type: "ATTACK_ATTEMPT",
          tick: state.tick,
          entity_id: entity.id,
          payload: { target: target.id }
        })
      }
    } else if (dist <= 5) {
      const next = shouldFlee ? moveAway(npcPos, targetPos) : moveToward(npcPos, targetPos)
      events.push({
        id: crypto.randomUUID(),
        type: "NPC_MOVED",
        tick: state.tick,
        entity_id: entity.id,
        payload: { from: npcPos, to: next }
      })
    }
  }

  return events
}

function moveToward(
  from: { q: number; r: number },
  to: { q: number; r: number }
): { q: number; r: number } {
  const dq = to.q - from.q
  const dr = to.r - from.r
  return {
    q: from.q + Math.sign(dq),
    r: from.r + Math.sign(dr)
  }
}

function moveAway(
  from: { q: number; r: number },
  to: { q: number; r: number }
): { q: number; r: number } {
  const dq = to.q - from.q
  const dr = to.r - from.r
  return {
    q: from.q - Math.sign(dq),
    r: from.r - Math.sign(dr)
  }
}

export function aggroNpc(state: GameState, npcId: string, targetId: string): void {
  const npc = state.entities[npcId]
  if (!npc || npc.type !== "npc") return

  const behavior = npc.components.behavior as {
    aggro: boolean
    targetId?: string
  }
  behavior.aggro = true
  behavior.targetId = targetId
}
