// Alchemy system — crafting potions from ingredients

import { GameState, Event } from "../entities/entity"
import { getRecipe, canCraft } from "../definitions/recipes"

export function processCraftItem(state: GameState, event: Event): Event[] {
  if (event.type !== "CRAFT_ITEM") return []

  const payload = event.payload as { recipe_id: string }
  const crafter = event.entity_id ? state.entities[event.entity_id] : null
  if (!crafter) return []

  const recipe = getRecipe(payload.recipe_id)
  if (!recipe) return []

  const char = crafter.components.character as { alchemyLevel?: number } | undefined
  const alchemyLevel = char?.alchemyLevel ?? 0
  if (alchemyLevel < recipe.requiredAlchemyLevel) return []

  const inv = crafter.components.inventory as { items: string[] }
  if (!inv) return []

  // Count item quantities in inventory
  const itemCounts: Record<string, number> = {}
  for (const itemId of inv.items) {
    itemCounts[itemId] = (itemCounts[itemId] ?? 0) + 1
  }

  if (!canCraft(itemCounts, recipe)) return []

  const tick = state.tick
  const events: Event[] = []

  // Remove ingredients
  for (const [ingredientId, qty] of Object.entries(recipe.ingredients)) {
    for (let i = 0; i < qty; i++) {
      events.push({
        id: crypto.randomUUID(),
        type: "ITEM_DROPPED",
        tick,
        entity_id: crafter.id,
        payload: { player_id: crafter.id, item_id: ingredientId }
      })
    }
  }

  // Add output items
  for (let i = 0; i < recipe.outputQty; i++) {
    events.push({
      id: crypto.randomUUID(),
      type: "ITEM_PICKED_UP",
      tick,
      entity_id: crafter.id,
      payload: { player_id: crafter.id, item_id: recipe.output }
    })
  }

  // Award small XP for crafting
  events.push({
    id: crypto.randomUUID(),
    type: "XP_GAINED",
    tick,
    entity_id: crafter.id,
    payload: { entity_id: crafter.id, amount: 5 + recipe.requiredAlchemyLevel * 3 }
  })

  return events
}
