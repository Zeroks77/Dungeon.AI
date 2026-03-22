// Core domain types for the RPG backend

export type Hex = { q: number; r: number }

export type Entity = {
  id: string
  type: "player" | "npc" | "object"
  version: number
  components: Record<string, unknown>
}

export type WorldTile = {
  q: number
  r: number
  terrain: string
  biome: string
  elevation: number
  passable: boolean
  transparent: boolean
  movementCost: number
  resourceIds: string[]
  structureId?: string
  factionId?: string
}

export type GameState = {
  tick: number
  entities: Record<string, Entity>
  effects: unknown[]
  // World & session data
  sessionId?: string
  worldSeed?: string
  worldTiles?: Record<string, WorldTile>   // key = "q,r"
  dungeons?: Record<string, unknown>       // dungeonId → DungeonState
  weather?: string                         // current weather condition
  timeOfDay?: number                       // 0–23 hour
}

export type Event = {
  id: string
  type: string
  tick: number
  entity_id?: string
  payload: unknown
}

export type ActionRequest = {
  type: string
  player_id: string
  target?: Hex | string
  [key: string]: unknown
}

export type SessionInfo = {
  sessionId: string
  name: string
  worldSeed: string
  createdAt: number
  playerIds: string[]
  currentTick: number
}
