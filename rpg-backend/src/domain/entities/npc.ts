import { Entity } from "./entity"

export type NpcComponents = {
  position: { q: number; r: number }
  health: { hp: number; maxHp: number }
  combat: { attack: number; defense: number }
  behavior: { aggro: boolean; targetId?: string }
}

export function createNpc(
  id: string,
  position: { q: number; r: number },
  hp = 50
): Entity {
  return {
    id,
    type: "npc",
    version: 1,
    components: {
      position,
      health: { hp, maxHp: hp },
      combat: { attack: 5, defense: 2 },
      behavior: { aggro: false }
    }
  }
}
