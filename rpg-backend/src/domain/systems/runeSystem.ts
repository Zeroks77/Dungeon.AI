// Rune system — engrave runes into equipped items

import { GameState, Event } from "../entities/entity"
import { getRune } from "../definitions/runes"
import { getItem } from "../definitions/items"
import { EquipSlot } from "../definitions/items"

export function processEngraveRune(state: GameState, event: Event): Event[] {
  if (event.type !== "ENGRAVE_RUNE") return []

  const payload = event.payload as { rune_id: string; slot: EquipSlot }
  const entity = event.entity_id ? state.entities[event.entity_id] : null
  if (!entity) return []

  const rune = getRune(payload.rune_id)
  if (!rune) return []

  // Check level requirement
  const char = entity.components.character as { level?: number } | undefined
  const level = char?.level ?? 1
  if (level < rune.requiredLevel) return []

  // Check that rune slot is valid for this rune
  if (!rune.allowedSlots.includes(payload.slot)) return []

  // Check equipment in the target slot
  const equipment = entity.components.equipment as {
    slots: Record<string, { itemId: string; runeIds: string[] }>
  } | undefined
  if (!equipment) return []

  const equippedItem = equipment.slots[payload.slot]
  if (!equippedItem) return []

  // Check rune slots available on item
  const itemDef = getItem(equippedItem.itemId)
  if (!itemDef) return []
  const maxSlots = itemDef.stats?.runeSlots ?? 0
  if (equippedItem.runeIds.length >= maxSlots) return []

  // Check player has the rune in inventory
  const inv = entity.components.inventory as { items: string[] }
  if (!inv || !inv.items.includes(payload.rune_id)) return []

  const tick = state.tick

  return [
    // Remove rune from inventory
    {
      id: crypto.randomUUID(),
      type: "ITEM_DROPPED",
      tick,
      entity_id: entity.id,
      payload: { player_id: entity.id, item_id: payload.rune_id }
    },
    // Apply rune to equipment slot
    {
      id: crypto.randomUUID(),
      type: "RUNE_ENGRAVED",
      tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, slot: payload.slot, rune_id: payload.rune_id }
    }
  ]
}
