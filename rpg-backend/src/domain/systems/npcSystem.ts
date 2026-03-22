import { GameState, Event, Entity } from "../entities/entity"
import { hexDistance } from "../components/position"
import { findPath } from "../../utils/pathfinding"

// Maximum detection ranges per NPC type
const AGGRO_RANGE: Record<string, number> = {
  goblin: 4,
  orc: 5,
  troll: 3,
  dragon: 8,
  skeleton: 4,
  zombie: 3,
  bandit: 5,
  wolf: 6,
  default: 4
}

const PATROL_RADIUS = 3

export function processNpcs(state: GameState): Event[] {
  const events: Event[] = []
  const tick = state.tick

  const players = Object.values(state.entities).filter(e => e.type === "player")

  // ── Faction-aware aggression & auto-aggro ─────────────────────────────────
  for (const entity of Object.values(state.entities)) {
    if (entity.type !== "npc") continue

    const behavior = entity.components.behavior as {
      npcType?: string
      aggro: boolean
      targetId?: string
      factionId?: string
      homeQ?: number
      homeR?: number
      patrolPath?: Array<{ q: number; r: number }>
      patrolIdx?: number
    } | undefined

    if (!behavior) continue

    // Non-aggressive NPC types: skip combat behaviour
    const npcType = behavior.npcType ?? "goblin"
    if (["merchant", "quest_giver", "alchemist", "scholar", "guard_captain", "shadow_contact"].includes(npcType)) {
      continue
    }

    const health = entity.components.health as { hp: number; maxHp: number } | undefined
    if (health && health.hp <= 0) continue

    const npcPos = entity.components.position as { q: number; r: number }
    const aggroRange = AGGRO_RANGE[npcType] ?? AGGRO_RANGE["default"]

    // Faction-aware aggro: aggro players with very low reputation towards this NPC's faction
    if (!behavior.aggro && behavior.factionId) {
      for (const other of Object.values(state.entities)) {
        if (other.type !== "player") continue
        const rep = other.components.reputation as { factions: Record<string, number> } | undefined
        const standing = rep?.factions[behavior.factionId] ?? 0
        if (standing < -1000) {
          behavior.aggro = true
          behavior.targetId = other.id
          events.push({
            id: crypto.randomUUID(),
            type: "NPC_AGGROED",
            tick,
            entity_id: entity.id,
            payload: { npc_id: entity.id, target_id: other.id }
          })
          break
        }
      }
    }

    // Range-based auto-aggro for non-faction NPCs
    if (!behavior.aggro) {
      const nearestPlayer = findNearestPlayer(npcPos, players, aggroRange)
      if (nearestPlayer) {
        behavior.aggro = true
        behavior.targetId = nearestPlayer.id
        events.push({
          id: crypto.randomUUID(),
          type: "NPC_AGGROED",
          tick,
          entity_id: entity.id,
          payload: { npc_id: entity.id, target_id: nearestPlayer.id }
        })
      }
    }

    if (behavior.aggro && behavior.targetId) {
      const target = state.entities[behavior.targetId]

      // Target died or doesn't exist — de-aggro and return home
      if (!target || (target.components.health as { hp: number } | undefined)?.hp === 0) {
        behavior.aggro = false
        behavior.targetId = undefined
        const home = behavior.homeQ !== undefined
          ? { q: behavior.homeQ, r: behavior.homeR! }
          : npcPos

        if (hexDistance(npcPos, home) > 1) {
          const next = moveToward(npcPos, home, entity, state)
          events.push({
            id: crypto.randomUUID(),
            type: "NPC_MOVED",
            tick,
            entity_id: entity.id,
            payload: { from: npcPos, to: next }
          })
        }
        continue
      }

      const targetPos = target.components.position as { q: number; r: number }
      const dist = hexDistance(npcPos, targetPos)

      // Flee if low HP and not a guard-type
      const shouldFlee =
        health !== undefined &&
        health.hp / health.maxHp < 0.25 &&
        npcType !== "guard" &&
        npcType !== "guard_captain"

      // Deaggro if target is too far away
      if (dist > 10) {
        behavior.aggro = false
        behavior.targetId = undefined
        continue
      }

      if (dist <= 1) {
        if (shouldFlee) {
          const next = moveAway(npcPos, targetPos)
          events.push({
            id: crypto.randomUUID(),
            type: "NPC_MOVED",
            tick,
            entity_id: entity.id,
            payload: { from: npcPos, to: next }
          })
        } else {
          events.push({
            id: crypto.randomUUID(),
            type: "ATTACK_ATTEMPT",
            tick,
            entity_id: entity.id,
            payload: { target: target.id }
          })
        }
      } else if (dist <= aggroRange + 2) {
        const next = shouldFlee ? moveAway(npcPos, targetPos) : moveToward(npcPos, targetPos, entity, state)
        events.push({
          id: crypto.randomUUID(),
          type: "NPC_MOVED",
          tick,
          entity_id: entity.id,
          payload: { from: npcPos, to: next }
        })
      } else {
        // Target too far — de-aggro
        behavior.aggro = false
        behavior.targetId = undefined
      }
    } else if (!behavior.aggro) {
      // Patrol behaviour — only every 5 ticks to reduce event spam
      if (tick % 5 === 0) {
        const patrol = getNextPatrolStep(entity, tick)
        if (patrol) {
          events.push({
            id: crypto.randomUUID(),
            type: "NPC_MOVED",
            tick,
            entity_id: entity.id,
            payload: { from: npcPos, to: patrol }
          })
        }
      }
    }
  }

  return events
}

function findNearestPlayer(
  npcPos: { q: number; r: number },
  players: Entity[],
  range: number
): Entity | undefined {
  let nearest: Entity | undefined
  let minDist = Infinity

  for (const player of players) {
    const pHealth = player.components.health as { hp: number } | undefined
    if (pHealth && pHealth.hp <= 0) continue

    const pPos = player.components.position as { q: number; r: number } | undefined
    if (!pPos) continue

    const dist = hexDistance(npcPos, pPos)
    if (dist <= range && dist < minDist) {
      minDist = dist
      nearest = player
    }
  }

  return nearest
}

function moveToward(
  from: { q: number; r: number },
  to: { q: number; r: number },
  entity: Entity,
  state: GameState
): { q: number; r: number } {
  // Try pathfinding first; fall back to direct step
  const path = findPath(from, to, state)
  if (path.length >= 2) return path[1]

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

function getNextPatrolStep(
  entity: Entity,
  tick: number
): { q: number; r: number } | null {
  const behavior = entity.components.behavior as {
    homeQ?: number
    homeR?: number
    patrolPath?: Array<{ q: number; r: number }>
    patrolIdx?: number
  } | undefined

  if (!behavior) return null

  const pos = entity.components.position as { q: number; r: number }
  const home = behavior.homeQ !== undefined
    ? { q: behavior.homeQ, r: behavior.homeR! }
    : pos

  // Generate simple patrol points around home if none set
  if (!behavior.patrolPath || behavior.patrolPath.length === 0) {
    behavior.patrolPath = [
      home,
      { q: home.q + PATROL_RADIUS, r: home.r },
      { q: home.q, r: home.r + PATROL_RADIUS },
      { q: home.q - PATROL_RADIUS, r: home.r },
      { q: home.q, r: home.r - PATROL_RADIUS }
    ]
    behavior.patrolIdx = 0
  }

  const idx = behavior.patrolIdx ?? 0
  const target = behavior.patrolPath[idx % behavior.patrolPath.length]

  if (hexDistance(pos, target) <= 1) {
    behavior.patrolIdx = (idx + 1) % behavior.patrolPath.length
    return null
  }

  const dq = target.q - pos.q
  const dr = target.r - pos.r
  return { q: pos.q + Math.sign(dq), r: pos.r + Math.sign(dr) }
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
