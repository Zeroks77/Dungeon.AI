import { Entity } from "./entity"
import { createMerchantInventory } from "../systems/economySystem"

export type NpcType =
  | "monster"
  | "merchant"
  | "quest_giver"
  | "guard"
  | "guard_captain"
  | "alchemist"
  | "scholar"
  | "shadow_contact"

export type NpcComponents = {
  position: { q: number; r: number }
  health: { hp: number; maxHp: number }
  combat: { attack: number; defense: number }
  behavior: {
    aggro: boolean
    targetId?: string
    npcType: NpcType
    factionId?: string
    dialogueId?: string
    availableQuestIds?: string[]
  }
}

export function createNpc(
  id: string,
  position: { q: number; r: number },
  hp = 50,
  npcType: NpcType = "monster",
  factionId?: string
): Entity {
  return {
    id,
    type: "npc",
    version: 1,
    components: {
      position,
      health: { hp, maxHp: hp },
      combat: { attack: 5, defense: 2 },
      behavior: { aggro: false, npcType, factionId }
    }
  }
}

export function createMerchantNpc(
  id: string,
  position: { q: number; r: number },
  itemIds: string[],
  factionId?: string
): Entity {
  return {
    id,
    type: "npc",
    version: 1,
    components: {
      position,
      health: { hp: 80, maxHp: 80 },
      combat: { attack: 3, defense: 3 },
      behavior: { aggro: false, npcType: "merchant", factionId, dialogueId: "merchant_generic" },
      merchant: {
        inventory: createMerchantInventory(itemIds),
        factionId
      }
    }
  }
}

export function createQuestGiverNpc(
  id: string,
  position: { q: number; r: number },
  questIds: string[],
  npcType: NpcType = "quest_giver",
  factionId?: string
): Entity {
  return {
    id,
    type: "npc",
    version: 1,
    components: {
      position,
      health: { hp: 60, maxHp: 60 },
      combat: { attack: 2, defense: 2 },
      behavior: {
        aggro: false,
        npcType,
        factionId,
        dialogueId: `${npcType}_dialogue`,
        availableQuestIds: questIds
      }
    }
  }
}
