// Progression system — XP, level-up, stat gains

import { GameState, Event, Entity } from "../entities/entity"
import { getClass } from "../definitions/classes"
import { getRace } from "../definitions/races"
import { xpForLevel } from "../components/character"
import { seededRandom } from "../../core/rng"

export function processGainXP(state: GameState, event: Event): Event[] {
  if (event.type !== "XP_GAINED") return []

  const payload = event.payload as { entity_id: string; amount: number }
  const entity = state.entities[payload.entity_id]
  if (!entity) return []

  const char = entity.components.character as {
    level: number
    experience: number
    experienceToNextLevel: number
    classId: string
    raceId: string
  } | undefined
  if (!char) return []

  const newXP = char.experience + payload.amount
  const events: Event[] = []

  // Check for level up
  if (newXP >= char.experienceToNextLevel) {
    const newLevel = char.level + 1
    const newXPToNext = xpForLevel(newLevel)
    events.push(...generateLevelUpEvents(entity, newLevel, newXPToNext, state.tick))
  }

  events.push({
    id: crypto.randomUUID(),
    type: "CHARACTER_UPDATED",
    tick: state.tick,
    entity_id: payload.entity_id,
    payload: {
      entity_id: payload.entity_id,
      updates: { experience: newXP }
    }
  })

  return events
}

function generateLevelUpEvents(
  entity: Entity,
  newLevel: number,
  newXPToNext: number,
  tick: number
): Event[] {
  const char = entity.components.character as {
    classId: string
    raceId: string
    level: number
  }
  const classDef = getClass(char.classId)
  const raceDef = getRace(char.raceId)
  if (!classDef || !raceDef) return []

  // Calculate HP gain from hit die + constitution modifier
  const constAttr = (entity.components.character as { attributes?: { constitution?: number } }).attributes?.constitution ?? 10
  const conMod = Math.floor((constAttr - 10) / 2)
  const hpGain = Math.ceil(classDef.hitDie / 2) + conMod

  // Check for new class abilities at this level
  const newAbilities: string[] = classDef.levelAbilities[newLevel] ?? []

  const events: Event[] = [
    {
      id: crypto.randomUUID(),
      type: "LEVEL_UP",
      tick,
      entity_id: entity.id,
      payload: {
        entity_id: entity.id,
        new_level: newLevel,
        new_xp_to_next: newXPToNext,
        hp_gain: hpGain,
        new_abilities: newAbilities
      }
    }
  ]

  // HP gain event
  const health = entity.components.health as { hp: number; maxHp: number } | undefined
  if (health) {
    events.push({
      id: crypto.randomUUID(),
      type: "HEAL_APPLIED",
      tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, new_hp: health.hp + hpGain, amount: hpGain }
    })
  }

  return events
}

export function getXPReward(entity: Entity, tick = 0): number {
  const char = entity.components.character as { level?: number } | undefined
  const level = char?.level ?? 1
  const rng = seededRandom(`xp-${entity.id}-${tick}`)
  return Math.floor(20 * level * (1 + rng() * 0.4))
}
