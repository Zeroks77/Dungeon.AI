// Spell system — casting, mana checks, spell effects

import { GameState, Event, Entity } from "../entities/entity"
import { getSpell } from "../definitions/spells"
import { rollDice } from "../../core/rng"
import { hexDistance } from "../components/position"

export type CastSpellPayload = {
  spell_id: string
  target_id?: string
  target_q?: number
  target_r?: number
}

export function processCastSpell(state: GameState, event: Event): Event[] {
  if (event.type !== "CAST_SPELL") return []

  const payload = event.payload as CastSpellPayload
  const caster = event.entity_id ? state.entities[event.entity_id] : null
  if (!caster) return []

  const spell = getSpell(payload.spell_id)
  if (!spell) return []

  // Mana check
  const mana = caster.components.mana as { mp: number; maxMp: number } | undefined
  if (spell.manaCost > 0) {
    if (!mana || mana.mp < spell.manaCost) return []
  }

  // Range check (if target entity)
  if (payload.target_id) {
    const target = state.entities[payload.target_id]
    if (!target) return []
    const casterPos = caster.components.position as { q: number; r: number }
    const targetPos = target.components.position as { q: number; r: number }
    if (casterPos && targetPos && spell.range > 0) {
      if (hexDistance(casterPos, targetPos) > spell.range) return []
    }
  }

  const tick = state.tick
  const resultEvents: Event[] = []

  // Deduct mana
  if (spell.manaCost > 0 && mana) {
    resultEvents.push({
      id: crypto.randomUUID(),
      type: "MANA_CHANGED",
      tick,
      entity_id: caster.id,
      payload: { entity_id: caster.id, new_mp: mana.mp - spell.manaCost }
    })
  }

  // Process each effect
  for (const effect of spell.effects) {
    const seed = `spell-${state.tick}-${caster.id}-${spell.id}`

    if (effect.type === "damage" && payload.target_id) {
      const target = state.entities[payload.target_id]
      if (!target) continue
      const targetHealth = target.components.health as { hp: number; maxHp: number }
      const baseDamage = (effect.value ?? 0) + (effect.valuePerLevel ?? 0) * getEntityLevel(caster)
      const roll = rollDice("1d6", seed)
      const damage = Math.max(1, baseDamage + roll)
      const remainingHp = Math.max(0, targetHealth.hp - damage)

      resultEvents.push({
        id: crypto.randomUUID(),
        type: "DAMAGE_APPLIED",
        tick,
        entity_id: target.id,
        payload: { target: target.id, remaining_hp: remainingHp, damage, damage_type: effect.damageType }
      })

      if (remainingHp === 0) {
        resultEvents.push({
          id: crypto.randomUUID(),
          type: "ENTITY_DIED",
          tick,
          entity_id: target.id,
          payload: { entity_id: target.id }
        })
      }
    }

    if (effect.type === "heal") {
      const targetId = payload.target_id ?? caster.id
      const target = state.entities[targetId]
      if (!target) continue
      const targetHealth = target.components.health as { hp: number; maxHp: number }
      const healAmount = (effect.value ?? 0) + (effect.valuePerLevel ?? 0) * getEntityLevel(caster)
      const newHp = Math.min(targetHealth.maxHp, targetHealth.hp + healAmount)

      resultEvents.push({
        id: crypto.randomUUID(),
        type: "HEAL_APPLIED",
        tick,
        entity_id: targetId,
        payload: { entity_id: targetId, new_hp: newHp, amount: healAmount }
      })
    }

    if (effect.type === "restore_mana") {
      const targetId = payload.target_id ?? caster.id
      const target = state.entities[targetId]
      if (!target) continue
      const targetMana = target.components.mana as { mp: number; maxMp: number }
      if (!targetMana) continue
      const restoreAmount = effect.value ?? 0
      const newMp = Math.min(targetMana.maxMp, targetMana.mp + restoreAmount)

      resultEvents.push({
        id: crypto.randomUUID(),
        type: "MANA_CHANGED",
        tick,
        entity_id: targetId,
        payload: { entity_id: targetId, new_mp: newMp }
      })
    }

    if (effect.type === "buff" || effect.type === "debuff") {
      const targetId = payload.target_id ?? caster.id
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "EFFECT_APPLIED",
        tick,
        entity_id: targetId,
        payload: {
          effect: {
            id: crypto.randomUUID(),
            type: effect.type,
            targetId,
            duration: effect.duration ?? 0,
            appliedTick: tick,
            payload: { attribute: effect.attribute, value: effect.value }
          }
        }
      })
    }

    if (effect.type === "stun" || effect.type === "root" || effect.type === "silence") {
      const targetId = payload.target_id ?? caster.id
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "EFFECT_APPLIED",
        tick,
        entity_id: targetId,
        payload: {
          effect: {
            id: crypto.randomUUID(),
            type: effect.type,
            targetId,
            duration: effect.duration ?? 2,
            appliedTick: tick,
            payload: {}
          }
        }
      })
    }

    if (effect.type === "teleport" && payload.target_id) {
      const target = state.entities[payload.target_id]
      if (!target) continue
      const targetPos = target.components.position as { q: number; r: number }
      // Teleport caster behind target (simplified: 1 hex offset)
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "PLAYER_MOVED",
        tick,
        entity_id: caster.id,
        payload: { to: { q: targetPos.q + 1, r: targetPos.r } }
      })
    }
  }

  return resultEvents
}

function getEntityLevel(entity: Entity): number {
  const char = entity.components.character as { level?: number } | undefined
  return char?.level ?? 1
}
