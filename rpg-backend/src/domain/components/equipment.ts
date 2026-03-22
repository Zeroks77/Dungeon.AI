// Equipment component — tracks what is currently equipped in each slot

import { EquipSlot } from "../definitions/items"

export type EquippedItem = {
  itemId: string
  runeIds: string[]   // embedded rune IDs
}

export type Equipment = {
  slots: Partial<Record<EquipSlot, EquippedItem>>
}

export function createEquipment(): Equipment {
  return { slots: {} }
}

export function equip(
  equipment: Equipment,
  slot: EquipSlot,
  itemId: string
): Equipment {
  return {
    slots: {
      ...equipment.slots,
      [slot]: { itemId, runeIds: [] }
    }
  }
}

export function unequip(equipment: Equipment, slot: EquipSlot): Equipment {
  const slots = { ...equipment.slots }
  delete slots[slot]
  return { slots }
}

export function addRuneToSlot(
  equipment: Equipment,
  slot: EquipSlot,
  runeId: string
): Equipment {
  const item = equipment.slots[slot]
  if (!item) return equipment
  return {
    slots: {
      ...equipment.slots,
      [slot]: { ...item, runeIds: [...item.runeIds, runeId] }
    }
  }
}

export function getEquippedItemId(equipment: Equipment, slot: EquipSlot): string | undefined {
  return equipment.slots[slot]?.itemId
}
