import { GameState, Event } from "../entities/entity"
import { rollDice } from "../../core/rng"
import { computeDerivedStats, applyDamageResistance } from "./statsSystem"
import { DamageType } from "../definitions/items"

export function processCombat(state: GameState, event: Event): Event[] {
  if (event.type !== "ATTACK_ATTEMPT") return []

  const payload = event.payload as { target: string }
  const attacker = event.entity_id ? state.entities[event.entity_id] : null
  const defender = state.entities[payload.target]

  if (!attacker || !defender) return []

  const attackerStats = computeDerivedStats(attacker)
  const defenderStats = computeDerivedStats(defender)
  const defenderHealth = defender.components.health as { hp: number; maxHp: number }

  const seed = `${state.tick}-${attacker.id}-${defender.id}`
  const roll = rollDice("1d20", seed)

  // Check for critical hit
  const critRng = rollDice("1d100", seed + "-crit")
  const isCrit = critRng / 100 < attackerStats.critChance

  // Base damage from attack stat + d20 roll - defender defense
  const baseRaw = attackerStats.attack + roll - defenderStats.defense
  let damage = Math.max(1, baseRaw)

  // Apply critical multiplier
  if (isCrit) {
    damage = Math.floor(damage * attackerStats.critMultiplier)
  }

  // Add elemental damage from equipped weapon
  const equipment = attacker.components.equipment as {
    slots: Record<string, { itemId: string }>
  } | undefined
  let primaryDamageType: DamageType = "physical"

  if (equipment?.slots["mainhand"]) {
    const { getItem } = require("../definitions/items")
    const itemDef = getItem(equipment.slots["mainhand"].itemId)
    if (itemDef?.stats?.damageType) {
      primaryDamageType = itemDef.stats.damageType as DamageType
    }
  }

  // Add elemental bonus damage
  const elemBonus = attackerStats.elementalDamage[primaryDamageType] ?? 0
  damage += elemBonus

  // Apply defender resistances
  damage = applyDamageResistance(damage, primaryDamageType, defenderStats)

  const remainingHp = Math.max(0, defenderHealth.hp - damage)

  const events: Event[] = [
    {
      id: crypto.randomUUID(),
      type: "DAMAGE_APPLIED",
      tick: state.tick,
      entity_id: defender.id,
      payload: {
        target: defender.id,
        remaining_hp: remainingHp,
        damage,
        damage_type: primaryDamageType,
        is_crit: isCrit
      }
    }
  ]

  // Lifesteal — attacker heals a fraction of damage dealt
  if (attackerStats.lifesteal > 0) {
    const healAmount = Math.max(1, Math.floor(damage * attackerStats.lifesteal))
    const attackerHealth = attacker.components.health as { hp: number; maxHp: number }
    const newHp = Math.min(attackerStats.maxHp, attackerHealth.hp + healAmount)
    events.push({
      id: crypto.randomUUID(),
      type: "HEAL_APPLIED",
      tick: state.tick,
      entity_id: attacker.id,
      payload: { entity_id: attacker.id, new_hp: newHp, amount: healAmount }
    })
  }

  // Reflect damage — defender reflects fraction back to attacker
  if (defenderStats.reflectDamage > 0) {
    const reflected = Math.max(1, Math.floor(damage * defenderStats.reflectDamage))
    const attackerHealth = attacker.components.health as { hp: number; maxHp: number }
    const newHp = Math.max(0, attackerHealth.hp - reflected)
    events.push({
      id: crypto.randomUUID(),
      type: "DAMAGE_APPLIED",
      tick: state.tick,
      entity_id: attacker.id,
      payload: { target: attacker.id, remaining_hp: newHp, damage: reflected, damage_type: "physical" }
    })
  }

  if (remainingHp === 0) {
    events.push({
      id: crypto.randomUUID(),
      type: "ENTITY_DIED",
      tick: state.tick,
      entity_id: defender.id,
      payload: { entity_id: defender.id, killed_by: attacker.id }
    })
  }

  return events
}
