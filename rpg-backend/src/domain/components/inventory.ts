export type Inventory = {
  items: string[]
}

export function addItem(inventory: Inventory, itemId: string): Inventory {
  return { items: [...inventory.items, itemId] }
}

export function removeItem(inventory: Inventory, itemId: string): Inventory {
  const idx = inventory.items.indexOf(itemId)
  if (idx === -1) return inventory
  const items = [...inventory.items]
  items.splice(idx, 1)
  return { items }
}

export function hasItem(inventory: Inventory, itemId: string): boolean {
  return inventory.items.includes(itemId)
}
