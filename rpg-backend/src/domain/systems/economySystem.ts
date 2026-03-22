// Economy system — trading with merchants, gold management

import { GameState, Event, Entity } from "../entities/entity"
import { getItem } from "../definitions/items"

export type MerchantInventoryEntry = {
  itemId: string
  stock: number           // -1 = unlimited
  buyMultiplier: number   // price for player to buy (e.g. 1.2 = 20% markup)
  sellMultiplier: number  // price player gets when selling (e.g. 0.5 = 50% of base)
}

export function getBuyPrice(itemId: string, merchant: Entity): number {
  const itemDef = getItem(itemId)
  if (!itemDef) return 0
  const merchantData = merchant.components.merchant as {
    inventory: MerchantInventoryEntry[]
    factionId?: string
  } | undefined
  const entry = merchantData?.inventory.find(e => e.itemId === itemId)
  const multiplier = entry?.buyMultiplier ?? 1.3
  return Math.ceil(itemDef.value * multiplier)
}

export function getSellPrice(itemId: string, merchant: Entity): number {
  const itemDef = getItem(itemId)
  if (!itemDef) return 0
  const merchantData = merchant.components.merchant as {
    inventory: MerchantInventoryEntry[]
  } | undefined
  const entry = merchantData?.inventory.find(e => e.itemId === itemId)
  const multiplier = entry?.sellMultiplier ?? 0.5
  return Math.floor(itemDef.value * multiplier)
}

export function processBuyItem(state: GameState, event: Event): Event[] {
  if (event.type !== "BUY_ITEM") return []

  const payload = event.payload as { item_id: string; merchant_id: string; quantity?: number }
  const buyer = event.entity_id ? state.entities[event.entity_id] : null
  const merchant = state.entities[payload.merchant_id]
  if (!buyer || !merchant) return []

  const qty = payload.quantity ?? 1
  const pricePerUnit = getBuyPrice(payload.item_id, merchant)
  const totalPrice = pricePerUnit * qty

  const char = buyer.components.character as { gold: number } | undefined
  if (!char || char.gold < totalPrice) return []

  const merchantData = merchant.components.merchant as {
    inventory: MerchantInventoryEntry[]
  } | undefined
  const entry = merchantData?.inventory.find(e => e.itemId === payload.item_id)
  if (!entry) return []
  if (entry.stock !== -1 && entry.stock < qty) return []

  const tick = state.tick
  const events: Event[] = []

  // Deduct gold
  events.push({
    id: crypto.randomUUID(),
    type: "GOLD_CHANGED",
    tick,
    entity_id: buyer.id,
    payload: { entity_id: buyer.id, delta: -totalPrice, new_gold: char.gold - totalPrice }
  })

  // Add items to inventory
  for (let i = 0; i < qty; i++) {
    events.push({
      id: crypto.randomUUID(),
      type: "ITEM_PICKED_UP",
      tick,
      entity_id: buyer.id,
      payload: { player_id: buyer.id, item_id: payload.item_id }
    })
  }

  // Update merchant stock
  if (entry.stock !== -1) {
    events.push({
      id: crypto.randomUUID(),
      type: "MERCHANT_STOCK_CHANGED",
      tick,
      entity_id: merchant.id,
      payload: { merchant_id: merchant.id, item_id: payload.item_id, delta: -qty }
    })
  }

  return events
}

export function processSellItem(state: GameState, event: Event): Event[] {
  if (event.type !== "SELL_ITEM") return []

  const payload = event.payload as { item_id: string; merchant_id: string; quantity?: number }
  const seller = event.entity_id ? state.entities[event.entity_id] : null
  const merchant = state.entities[payload.merchant_id]
  if (!seller || !merchant) return []

  const inv = seller.components.inventory as { items: string[] }
  if (!inv || !inv.items.includes(payload.item_id)) return []

  const qty = payload.quantity ?? 1
  const pricePerUnit = getSellPrice(payload.item_id, merchant)
  const totalPrice = pricePerUnit * qty

  const char = seller.components.character as { gold: number } | undefined
  if (!char) return []

  const tick = state.tick

  return [
    {
      id: crypto.randomUUID(),
      type: "ITEM_DROPPED",
      tick,
      entity_id: seller.id,
      payload: { player_id: seller.id, item_id: payload.item_id }
    },
    {
      id: crypto.randomUUID(),
      type: "GOLD_CHANGED",
      tick,
      entity_id: seller.id,
      payload: { entity_id: seller.id, delta: totalPrice, new_gold: char.gold + totalPrice }
    }
  ]
}

export function createMerchantInventory(
  itemIds: string[],
  buyMultiplier = 1.3,
  sellMultiplier = 0.5
): MerchantInventoryEntry[] {
  return itemIds.map(id => ({
    itemId: id,
    stock: -1,
    buyMultiplier,
    sellMultiplier
  }))
}
