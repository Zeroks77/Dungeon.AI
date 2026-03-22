import { GameState, Event, Entity } from "../entities/entity"
import { hexDistance } from "../components/position"

export function processNpcs(state: GameState): Event[] {
  const events: Event[] = []

  for (const entity of Object.values(state.entities)) {
    if (entity.type !== "npc") continue

    const behavior = entity.components.behavior as {
      aggro: boolean
      targetId?: string
    }

    if (!behavior.aggro) continue

    const target = behavior.targetId ? state.entities[behavior.targetId] : null
    if (!target) continue

    const npcPos = entity.components.position as { q: number; r: number }
    const targetPos = target.components.position as { q: number; r: number }
    const dist = hexDistance(npcPos, targetPos)

    if (dist === 1) {
      events.push({
        id: crypto.randomUUID(),
        type: "ATTACK_ATTEMPT",
        tick: state.tick,
        entity_id: entity.id,
        payload: { target: target.id }
      })
    } else if (dist > 1 && dist <= 5) {
      const next = moveToward(npcPos, targetPos)
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
