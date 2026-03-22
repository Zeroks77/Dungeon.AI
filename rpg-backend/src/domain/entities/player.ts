import { Entity } from "./entity"

export type PlayerComponents = {
  position: { q: number; r: number }
  health: { hp: number; maxHp: number }
  combat: { attack: number; defense: number }
  inventory: { items: string[] }
}

export function createPlayer(id: string, position: { q: number; r: number }): Entity {
  return {
    id,
    type: "player",
    version: 1,
    components: {
      position,
      health: { hp: 100, maxHp: 100 },
      combat: { attack: 10, defense: 5 },
      inventory: { items: [] }
    }
  }
}
