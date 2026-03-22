// World generation — procedural hex-grid world using seeded noise

import { Tile, TerrainType, BiomeType, createTile } from "./terrain"
import { seededRandom } from "../../core/rng"

export type WorldMap = {
  seed: string
  radius: number           // world radius in hex tiles
  tiles: Map<string, Tile> // key = "q,r"
  towns: string[]          // tile keys of towns
  dungeons: string[]       // tile keys of dungeon entrances
}

export function tileKey(q: number, r: number): string {
  return `${q},${r}`
}

export function parseTileKey(key: string): { q: number; r: number } {
  const [q, r] = key.split(",").map(Number)
  return { q, r }
}

// Simple deterministic noise function using seeded RNG
function noiseAt(q: number, r: number, seed: string, scale = 1): number {
  const rng = seededRandom(`noise-${seed}-${Math.floor(q / scale)}-${Math.floor(r / scale)}`)
  return rng()
}

function smoothNoise(q: number, r: number, seed: string): number {
  // Average multiple octaves for smoother terrain
  const coarse = noiseAt(q, r, seed, 8)
  const medium = noiseAt(q, r, seed + "-m", 4)
  const fine = noiseAt(q, r, seed + "-f", 2)
  return coarse * 0.6 + medium * 0.3 + fine * 0.1
}

function classifyTerrain(elevation: number, moisture: number): TerrainType {
  if (elevation < 0.05) return "ocean"
  if (elevation < 0.12) return "swamp"
  if (elevation < 0.15) return "river"
  if (elevation > 0.82) return "mountain"
  if (elevation > 0.72) return "volcanic"
  if (moisture > 0.7 && elevation > 0.2) return "forest"
  if (moisture < 0.25 && elevation < 0.5) return "desert"
  if (elevation > 0.45) return "cave"
  return "plains"
}

function classifyBiome(elevation: number, temperature: number): BiomeType {
  if (elevation < 0.1) return "arid"
  if (temperature < 0.25) return "arctic"
  if (temperature > 0.75 && elevation < 0.5) return "tropical"
  if (elevation > 0.6) return "underground"
  return "temperate"
}

// Generate all hex coordinates within radius using cube coordinates
function hexesInRadius(radius: number): Array<{ q: number; r: number }> {
  const hexes: Array<{ q: number; r: number }> = []
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius, -q + radius)
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r })
    }
  }
  return hexes
}

export function generateWorld(seed: string, radius = 40): WorldMap {
  const rng = seededRandom(seed)
  const tiles = new Map<string, Tile>()
  const towns: string[] = []
  const dungeons: string[] = []

  const hexes = hexesInRadius(radius)

  for (const { q, r } of hexes) {
    const elevation = smoothNoise(q, r, seed)
    const moisture = smoothNoise(q, r, seed + "-moisture")
    const temperature = smoothNoise(q, r, seed + "-temp")

    const terrain = classifyTerrain(elevation, moisture)
    const biome = classifyBiome(elevation, temperature)
    const elevationInt = Math.floor(elevation * 100)

    const tile = createTile(q, r, terrain, biome, elevationInt)
    tiles.set(tileKey(q, r), tile)
  }

  // Place towns on passable plains tiles
  const townCount = Math.floor(radius / 8) + 3
  const plainsHexes = hexes.filter(h => {
    const t = tiles.get(tileKey(h.q, h.r))
    return t?.terrain === "plains" || t?.terrain === "forest"
  })
  const usedTownSpots = new Set<string>()
  for (let i = 0; i < townCount && plainsHexes.length > 0; i++) {
    const idx = Math.floor(rng() * plainsHexes.length)
    const hex = plainsHexes[idx]
    const key = tileKey(hex.q, hex.r)
    if (!usedTownSpots.has(key)) {
      const existing = tiles.get(key)
      if (existing) {
        tiles.set(key, { ...existing, terrain: "town", passable: true })
        towns.push(key)
        usedTownSpots.add(key)
      }
    }
  }

  // Place dungeon entrances on mountain/cave tiles
  const dungeonCount = Math.floor(radius / 10) + 2
  const mountainHexes = hexes.filter(h => {
    const t = tiles.get(tileKey(h.q, h.r))
    return t?.terrain === "mountain" || t?.terrain === "cave"
  })
  for (let i = 0; i < dungeonCount && mountainHexes.length > 0; i++) {
    const idx = Math.floor(rng() * mountainHexes.length)
    const hex = mountainHexes[idx]
    const key = tileKey(hex.q, hex.r)
    const existing = tiles.get(key)
    if (existing && !towns.includes(key)) {
      tiles.set(key, { ...existing, terrain: "dungeon_entrance", passable: true })
      dungeons.push(key)
    }
  }

  // Assign faction territories around towns
  const factionIds = ["iron_crown", "shadow_guild", "merchants_league", "forest_druids", "orcish_horde"]
  towns.forEach((townKey, i) => {
    const factionId = factionIds[i % factionIds.length]
    const { q: tq, r: tr } = parseTileKey(townKey)
    // Paint nearby tiles with faction color
    for (const { q, r } of hexesInRadius(6)) {
      const nearKey = tileKey(tq + q, tr + r)
      const tile = tiles.get(nearKey)
      if (tile && tile.passable && !tile.factionId) {
        tiles.set(nearKey, { ...tile, factionId })
      }
    }
    const townTile = tiles.get(townKey)
    if (townTile) tiles.set(townKey, { ...townTile, factionId })
  })

  return { seed, radius, tiles, towns, dungeons }
}

export function getTile(world: WorldMap, q: number, r: number): Tile | undefined {
  return world.tiles.get(tileKey(q, r))
}

export function isPassable(world: WorldMap, q: number, r: number): boolean {
  return world.tiles.get(tileKey(q, r))?.passable ?? false
}

export function getMovementCost(world: WorldMap, q: number, r: number): number {
  return world.tiles.get(tileKey(q, r))?.movementCost ?? 99
}
