// Dungeon generator — BSP-based procedural dungeon room layout

import { Tile, createTile } from "./terrain"
import { tileKey } from "./worldGen"
import { seededRandom } from "../../core/rng"

export type DungeonRoom = {
  id: string
  centerQ: number
  centerR: number
  width: number           // in tiles
  height: number
  connections: string[]   // connected room IDs
  lootTable: string[]     // item IDs that can drop here
  enemyTable: string[]    // npc type IDs that spawn here
  isBossRoom: boolean
}

export type Dungeon = {
  id: string
  name: string
  seed: string
  depth: number           // dungeon floor level
  tiles: Map<string, Tile>
  rooms: DungeonRoom[]
  entranceQ: number
  entranceR: number
  bossRoomId?: string
}

const DUNGEON_LOOT_TIERS: Record<number, string[]> = {
  1: ["health_potion", "red_herb", "iron_sword"],
  2: ["mana_potion", "blue_mushroom", "cave_crystal"],
  3: ["greater_health_potion", "steel_sword", "chain_mail"],
  4: ["fire_essence", "spirit_dust", "nightshade"],
  5: ["flaming_sword", "shadow_blade", "arcane_staff", "dragon_scale"]
}

const DUNGEON_ENEMY_TIERS: Record<number, string[]> = {
  1: ["goblin", "skeleton", "rat"],
  2: ["orc_warrior", "zombie", "spider"],
  3: ["troll", "wraith", "dark_mage"],
  4: ["vampire", "golem", "dragon_spawn"],
  5: ["lich", "ancient_dragon", "demon_lord"]
}

function getLootForDepth(depth: number): string[] {
  const tier = Math.min(5, Math.ceil(depth / 2))
  return DUNGEON_LOOT_TIERS[tier] ?? DUNGEON_LOOT_TIERS[1]
}

function getEnemiesForDepth(depth: number): string[] {
  const tier = Math.min(5, Math.ceil(depth / 2))
  return DUNGEON_ENEMY_TIERS[tier] ?? DUNGEON_ENEMY_TIERS[1]
}

function generateRoomId(dungeonId: string, index: number): string {
  return `${dungeonId}_room_${index}`
}

// Carve a rectangular room into the tile map (axial offset approximation)
function carveRoom(
  tiles: Map<string, Tile>,
  centerQ: number,
  centerR: number,
  halfW: number,
  halfH: number,
  depth: number
): void {
  for (let dq = -halfW; dq <= halfW; dq++) {
    for (let dr = -halfH; dr <= halfH; dr++) {
      const key = tileKey(centerQ + dq, centerR + dr)
      tiles.set(key, createTile(centerQ + dq, centerR + dr, "dungeon_floor", "underground", depth))
    }
  }
}

// Carve a corridor between two rooms
function carveCorridor(
  tiles: Map<string, Tile>,
  q1: number, r1: number,
  q2: number, r2: number,
  depth: number
): void {
  let q = q1
  let r = r1
  while (q !== q2 || r !== r2) {
    tiles.set(tileKey(q, r), createTile(q, r, "dungeon_floor", "underground", depth))
    if (q !== q2) q += q < q2 ? 1 : -1
    else if (r !== r2) r += r < r2 ? 1 : -1
  }
  tiles.set(tileKey(q2, r2), createTile(q2, r2, "dungeon_floor", "underground", depth))
}

export function generateDungeon(
  id: string,
  name: string,
  seed: string,
  entranceQ: number,
  entranceR: number,
  depth: number,
  roomCount = 8
): Dungeon {
  const rng = seededRandom(`dungeon-${seed}-${depth}`)
  const tiles = new Map<string, Tile>()
  const rooms: DungeonRoom[] = []

  const spread = 6 + depth * 2

  // Place dungeon entrance
  tiles.set(tileKey(entranceQ, entranceR), createTile(entranceQ, entranceR, "dungeon_entrance", "underground", depth))

  // Generate rooms
  for (let i = 0; i < roomCount; i++) {
    const dq = Math.floor((rng() - 0.5) * spread * 2)
    const dr = Math.floor((rng() - 0.5) * spread * 2)
    const centerQ = entranceQ + dq
    const centerR = entranceR + dr
    const halfW = 2 + Math.floor(rng() * 3)
    const halfH = 2 + Math.floor(rng() * 3)
    const isBossRoom = i === roomCount - 1

    carveRoom(tiles, centerQ, centerR, halfW, halfH, depth)

    rooms.push({
      id: generateRoomId(id, i),
      centerQ,
      centerR,
      width: halfW * 2 + 1,
      height: halfH * 2 + 1,
      connections: [],
      lootTable: getLootForDepth(depth),
      enemyTable: getEnemiesForDepth(depth),
      isBossRoom
    })
  }

  // Connect rooms with corridors (chain connection)
  for (let i = 0; i < rooms.length - 1; i++) {
    const a = rooms[i]
    const b = rooms[i + 1]
    carveCorridor(tiles, a.centerQ, a.centerR, b.centerQ, b.centerR, depth)
    a.connections.push(b.id)
    b.connections.push(a.id)
  }

  // Surround floor tiles with walls (all adjacent tiles that are not floor)
  const floorKeys = new Set(tiles.keys())
  const wallCandidates = new Set<string>()
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]]
  for (const key of floorKeys) {
    const [q, r] = key.split(",").map(Number)
    for (const [dq, dr] of directions) {
      const neighborKey = tileKey(q + dq, r + dr)
      if (!floorKeys.has(neighborKey)) {
        wallCandidates.add(neighborKey)
      }
    }
  }
  for (const key of wallCandidates) {
    const [q, r] = key.split(",").map(Number)
    tiles.set(key, createTile(q, r, "dungeon_wall", "underground", depth))
  }

  const bossRoom = rooms.find(r => r.isBossRoom)

  return {
    id, name, seed, depth, tiles, rooms,
    entranceQ, entranceR,
    bossRoomId: bossRoom?.id
  }
}

export function getDungeonTile(dungeon: Dungeon, q: number, r: number): Tile | undefined {
  return dungeon.tiles.get(tileKey(q, r))
}
