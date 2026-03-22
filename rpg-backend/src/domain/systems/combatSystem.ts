import { GameState, Event } from "../entities/entity"
import { rollDice } from "../../core/rng"

export function processCombat(state: GameState, event: Event): Event[] {
  if (event.type !== "ATTACK_ATTEMPT") return []

  const payload = event.payload as { target: string }
  const attacker = event.entity_id ? state.entities[event.entity_id] : null
  const defender = state.entities[payload.target]

  if (!attacker || !defender) return []

  const attackerCombat = attacker.components.combat as {
    attack: number
    defense: number
  }
  const defenderCombat = defender.components.combat as {
    attack: number
    defense: number
  }
  const defenderHealth = defender.components.health as { hp: number; maxHp: number }

  const seed = `${state.tick}-${attacker.id}-${defender.id}`
  const roll = rollDice("1d20", seed)
  const raw = attackerCombat.attack + roll - defenderCombat.defense
  const damage = Math.max(1, raw)
  const remainingHp = Math.max(0, defenderHealth.hp - damage)

  const events: Event[] = [
    {
      id: crypto.randomUUID(),
      type: "DAMAGE_APPLIED",
      tick: state.tick,
      entity_id: defender.id,
      payload: { target: defender.id, remaining_hp: remainingHp, damage }
    }
  ]

  if (remainingHp === 0) {
    events.push({
      id: crypto.randomUUID(),
      type: "ENTITY_DIED",
      tick: state.tick,
      entity_id: defender.id,
      payload: { entity_id: defender.id }
    })
  }

  return events
}
