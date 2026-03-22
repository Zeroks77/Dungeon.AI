import { GameState, Event } from "../entities/entity"

export function processRegen(state: GameState): Event[] {
  const events: Event[] = []

  for (const entity of Object.values(state.entities)) {
    const health = entity.components.health as { hp: number; maxHp: number; isDead?: boolean } | undefined

    // Skip dead entities
    if (health?.isDead) continue

    // Mana regeneration for entities that have a mana component
    const mana = entity.components.mana as { mp: number; maxMp: number; regenPerTick: number } | undefined
    if (mana && mana.mp < mana.maxMp) {
      const newMp = Math.min(mana.maxMp, mana.mp + mana.regenPerTick)
      events.push({
        id: crypto.randomUUID(),
        type: "MANA_CHANGED",
        tick: state.tick,
        entity_id: entity.id,
        payload: { entity_id: entity.id, new_mp: newMp }
      })
    }

    // HP regeneration: 1 HP per 10 ticks (out-of-combat)
    if (state.tick % 10 === 0 && health && health.hp > 0 && health.hp < health.maxHp) {
      const newHp = Math.min(health.maxHp, health.hp + 1)
      events.push({
        id: crypto.randomUUID(),
        type: "HEAL_APPLIED",
        tick: state.tick,
        entity_id: entity.id,
        payload: { entity_id: entity.id, new_hp: newHp }
      })
    }
  }

  return events
}

export function processEffectTicks(state: GameState): Event[] {
  const events: Event[] = []

  for (const rawEffect of state.effects) {
    const effect = rawEffect as {
      id: string
      type: string
      targetId: string
      duration: number
      appliedTick: number
      payload?: { value?: number }
    }

    // Expire effects that have run their duration
    if (state.tick > effect.appliedTick + effect.duration) {
      events.push({
        id: crypto.randomUUID(),
        type: "EFFECT_EXPIRED",
        tick: state.tick,
        payload: { effectId: effect.id }
      })
      continue
    }

    const target = state.entities[effect.targetId]
    if (!target) continue

    if (effect.type === "poison") {
      const health = target.components.health as { hp: number; maxHp: number } | undefined
      if (health && health.hp > 0) {
        const damage = effect.payload?.value ?? 5
        const newHp = Math.max(0, health.hp - damage)
        events.push({
          id: crypto.randomUUID(),
          type: "DAMAGE_APPLIED",
          tick: state.tick,
          entity_id: target.id,
          payload: { target: target.id, remaining_hp: newHp, damage, damage_type: "poison" }
        })
        if (newHp === 0) {
          events.push({
            id: crypto.randomUUID(),
            type: "ENTITY_DIED",
            tick: state.tick,
            entity_id: target.id,
            payload: { entity_id: target.id }
          })
        }
      }
    }

    if (effect.type === "regeneration") {
      const health = target.components.health as { hp: number; maxHp: number } | undefined
      if (health && health.hp > 0 && health.hp < health.maxHp) {
        const healAmount = effect.payload?.value ?? 5
        const newHp = Math.min(health.maxHp, health.hp + healAmount)
        events.push({
          id: crypto.randomUUID(),
          type: "HEAL_APPLIED",
          tick: state.tick,
          entity_id: target.id,
          payload: { entity_id: target.id, new_hp: newHp, amount: healAmount }
        })
      }
    }
  }

  return events
}
