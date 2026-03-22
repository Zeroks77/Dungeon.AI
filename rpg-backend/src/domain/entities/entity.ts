// Core domain types for the RPG backend

export type Hex = { q: number; r: number }

export type Entity = {
  id: string
  type: "player" | "npc" | "object"
  version: number
  components: Record<string, unknown>
}

export type GameState = {
  tick: number
  entities: Record<string, Entity>
  effects: unknown[]
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
