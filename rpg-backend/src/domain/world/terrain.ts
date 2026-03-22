// Terrain and tile definitions for the hex-based world map

export type TerrainType =
  | "plains"
  | "forest"
  | "mountain"
  | "desert"
  | "swamp"
  | "ocean"
  | "river"
  | "dungeon_entrance"
  | "dungeon_floor"
  | "dungeon_wall"
  | "town"
  | "road"
  | "cave"
  | "ruins"
  | "volcanic"

export type BiomeType =
  | "temperate"
  | "arctic"
  | "tropical"
  | "arid"
  | "underground"

export type Tile = {
  q: number
  r: number
  terrain: TerrainType
  biome: BiomeType
  elevation: number         // 0–100
  passable: boolean
  transparent: boolean      // blocks line of sight if false
  movementCost: number      // relative cost (1 = normal, 2 = difficult, etc.)
  resourceIds: string[]     // item IDs that can be foraged here
  structureId?: string      // e.g. town, dungeon_room
  factionId?: string        // controlling faction
}

export const TERRAIN_PROPERTIES: Record<TerrainType, {
  passable: boolean
  transparent: boolean
  movementCost: number
  forageable: string[]
  elevationRange: [number, number]
}> = {
  plains:           { passable: true,  transparent: true,  movementCost: 1, forageable: ["red_herb"],          elevationRange: [10, 40] },
  forest:           { passable: true,  transparent: false, movementCost: 2, forageable: ["red_herb", "blue_mushroom", "nightshade"], elevationRange: [15, 50] },
  mountain:         { passable: false, transparent: false, movementCost: 3, forageable: ["cave_crystal"],      elevationRange: [60, 100] },
  desert:           { passable: true,  transparent: true,  movementCost: 2, forageable: [],                   elevationRange: [5, 30] },
  swamp:            { passable: true,  transparent: true,  movementCost: 3, forageable: ["nightshade", "blue_mushroom"], elevationRange: [0, 15] },
  ocean:            { passable: false, transparent: true,  movementCost: 99, forageable: [],                  elevationRange: [0, 5] },
  river:            { passable: false, transparent: true,  movementCost: 99, forageable: [],                  elevationRange: [5, 30] },
  dungeon_entrance: { passable: true,  transparent: true,  movementCost: 1, forageable: [],                   elevationRange: [10, 60] },
  dungeon_floor:    { passable: true,  transparent: true,  movementCost: 1, forageable: [],                   elevationRange: [0, 0] },
  dungeon_wall:     { passable: false, transparent: false, movementCost: 99, forageable: [],                  elevationRange: [0, 0] },
  town:             { passable: true,  transparent: true,  movementCost: 1, forageable: [],                   elevationRange: [10, 40] },
  road:             { passable: true,  transparent: true,  movementCost: 0.5, forageable: [],                 elevationRange: [5, 50] },
  cave:             { passable: true,  transparent: false, movementCost: 2, forageable: ["cave_crystal", "spirit_dust"], elevationRange: [20, 80] },
  ruins:            { passable: true,  transparent: true,  movementCost: 1.5, forageable: [],                 elevationRange: [10, 60] },
  volcanic:         { passable: true,  transparent: true,  movementCost: 2, forageable: ["fire_essence"],     elevationRange: [40, 90] }
}

export function createTile(
  q: number,
  r: number,
  terrain: TerrainType,
  biome: BiomeType,
  elevation: number,
  factionId?: string
): Tile {
  const props = TERRAIN_PROPERTIES[terrain]
  return {
    q, r, terrain, biome, elevation,
    passable: props.passable,
    transparent: props.transparent,
    movementCost: props.movementCost,
    resourceIds: props.forageable,
    factionId
  }
}
