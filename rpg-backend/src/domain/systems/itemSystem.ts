// Item system — use items, equip/unequip, item effects

import { GameState, Event } from "../entities/entity"
import { getItem } from "../definitions/items"

export function processUseItem(state: GameState, event: Event): Event[] {
  if (event.type !== "USE_ITEM") return []

  const payload = event.payload as { item_id: string; target_id?: string }
  const user = event.entity_id ? state.entities[event.entity_id] : null
  if (!user) return []

  const inv = user.components.inventory as { items: string[] }
  if (!inv || !inv.items.includes(payload.item_id)) return []

  const itemDef = getItem(payload.item_id)
  if (!itemDef || !itemDef.effects || itemDef.effects.length === 0) return []

  const tick = state.tick
  const targetId = payload.target_id ?? user.id
  const target = state.entities[targetId]
  if (!target) return []

  const resultEvents: Event[] = []

  for (const effect of itemDef.effects) {
    if (effect.type === "heal") {
      const health = target.components.health as { hp: number; maxHp: number }
      if (!health) continue
      const newHp = Math.min(health.maxHp, health.hp + (effect.value ?? 0))
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "HEAL_APPLIED",
        tick,
        entity_id: targetId,
        payload: { entity_id: targetId, new_hp: newHp, amount: effect.value ?? 0 }
      })
    }

    if (effect.type === "restore_mana") {
      const mana = target.components.mana as { mp: number; maxMp: number }
      if (!mana) continue
      const newMp = Math.min(mana.maxMp, mana.mp + (effect.value ?? 0))
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "MANA_CHANGED",
        tick,
        entity_id: targetId,
        payload: { entity_id: targetId, new_mp: newMp }
      })
    }

    if (effect.type === "buff") {
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "EFFECT_APPLIED",
        tick,
        entity_id: targetId,
        payload: {
          effect: {
            id: crypto.randomUUID(),
            type: "buff",
            targetId,
            duration: effect.duration ?? 0,
            appliedTick: tick,
            payload: { attribute: effect.attribute, value: effect.value }
          }
        }
      })
    }

    if (effect.type === "antidote") {
      resultEvents.push({
        id: crypto.randomUUID(),
        type: "EFFECT_EXPIRED",
        tick,
        entity_id: targetId,
        payload: { effectId: "poison", targetId }
      })
    }
  }

  // Consume the item (stackable: reduce by 1; non-stackable: remove)
  resultEvents.push({
    id: crypto.randomUUID(),
    type: "ITEM_DROPPED",
    tick,
    entity_id: user.id,
    payload: { player_id: user.id, item_id: payload.item_id }
  })

  return resultEvents
}

export function processEquipItem(state: GameState, event: Event): Event[] {
  if (event.type !== "EQUIP_ITEM") return []

  const payload = event.payload as { item_id: string; slot: string }
  const entity = event.entity_id ? state.entities[event.entity_id] : null
  if (!entity) return []

  const inv = entity.components.inventory as { items: string[] }
  if (!inv || !inv.items.includes(payload.item_id)) return []

  const itemDef = getItem(payload.item_id)
  if (!itemDef || !itemDef.slot) return []

  return [
    {
      id: crypto.randomUUID(),
      type: "ITEM_EQUIPPED",
      tick: state.tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, item_id: payload.item_id, slot: itemDef.slot }
    }
  ]
}

export function processUnequipItem(state: GameState, event: Event): Event[] {
  if (event.type !== "UNEQUIP_ITEM") return []

  const payload = event.payload as { slot: string }
  const entity = event.entity_id ? state.entities[event.entity_id] : null
  if (!entity) return []

  return [
    {
      id: crypto.randomUUID(),
      type: "ITEM_UNEQUIPPED",
      tick: state.tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, slot: payload.slot }
    }
  ]
}
