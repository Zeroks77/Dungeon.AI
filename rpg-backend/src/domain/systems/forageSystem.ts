// Foraging system — collect resources from terrain tiles

import { GameState, Event } from "../entities/entity"
import { seededRandom } from "../../core/rng"
import { TERRAIN_PROPERTIES, TerrainType } from "../world/terrain"

export type ForagePayload = {
  player_id: string
}

export function processForage(state: GameState, event: Event): Event[] {
  if (event.type !== "FORAGE") return []

  const player = event.entity_id ? state.entities[event.entity_id] : null
  if (!player) return []

  const pos = player.components.position as { q: number; r: number }
  const tileKey = `${pos.q},${pos.r}`

  // Look up the current tile
  const tile = state.worldTiles?.[tileKey]
  if (!tile) return []

  const terrain = tile.terrain as TerrainType
  const terrainProps = TERRAIN_PROPERTIES[terrain]
  if (!terrainProps || terrainProps.forageable.length === 0) return []

  const rng = seededRandom(`forage-${state.tick}-${player.id}-${tileKey}`)
  const tick = state.tick
  const events: Event[] = []

  // Base success chance: 60%, modified by wisdom
  const char = player.components.character as { attributes?: { wisdom?: number } } | undefined
  const wisdom = char?.attributes?.wisdom ?? 10
  const wisMod = Math.floor((wisdom - 10) / 2)
  const successChance = Math.min(0.95, 0.6 + wisMod * 0.05)

  if (rng() > successChance) {
    // Forage failed
    events.push({
      id: crypto.randomUUID(),
      type: "FORAGE_FAILED",
      tick,
      entity_id: player.id,
      payload: { player_id: player.id, tile_key: tileKey, reason: "nothing_found" }
    })
    return events
  }

  // Pick a random forageable item from the tile
  const items = tile.resourceIds.length > 0 ? tile.resourceIds : terrainProps.forageable
  const itemIdx = Math.floor(rng() * items.length)
  const itemId = items[itemIdx]

  // Quantity: 1–3 depending on luck
  const qty = Math.floor(rng() * 3) + 1

  for (let i = 0; i < qty; i++) {
    events.push({
      id: crypto.randomUUID(),
      type: "ITEM_PICKED_UP",
      tick,
      entity_id: player.id,
      payload: { player_id: player.id, item_id: itemId }
    })
  }

  events.push({
    id: crypto.randomUUID(),
    type: "FORAGE_SUCCESS",
    tick,
    entity_id: player.id,
    payload: { player_id: player.id, item_id: itemId, quantity: qty, tile_key: tileKey }
  })

  // Small XP for foraging
  events.push({
    id: crypto.randomUUID(),
    type: "XP_GAINED",
    tick,
    entity_id: player.id,
    payload: { entity_id: player.id, amount: 5 }
  })

  return events
}
