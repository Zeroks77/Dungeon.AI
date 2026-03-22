import { Entity } from "./entity"
import { getClass } from "../definitions/classes"
import { getRace } from "../definitions/races"
import { createBaseAttributes, xpForLevel } from "../components/character"
import { createEquipment } from "../components/equipment"

export type PlayerComponents = {
  position: { q: number; r: number }
  health: { hp: number; maxHp: number }
  mana: { mp: number; maxMp: number; regenPerTick: number }
  combat: { attack: number; defense: number }
  inventory: { items: string[] }
  equipment: ReturnType<typeof createEquipment>
  character: {
    classId: string
    raceId: string
    level: number
    experience: number
    experienceToNextLevel: number
    attributes: ReturnType<typeof createBaseAttributes>
    gold: number
    alchemyLevel: number
    knownSpells: string[]
    knownAbilities: string[]
  }
  reputation: { factions: Record<string, number> }
  questLog: { active: unknown[]; completed: string[] }
}

export function createPlayer(
  id: string,
  position: { q: number; r: number },
  classId = "warrior",
  raceId = "human"
): Entity {
  const classDef = getClass(classId)
  const raceDef = getRace(raceId)

  const baseAttrs = createBaseAttributes()

  // Apply class attribute bonuses
  if (classDef) {
    for (const [attr, bonus] of Object.entries(classDef.attributeBonuses)) {
      (baseAttrs as Record<string, number>)[attr] = (baseAttrs as Record<string, number>)[attr] + (bonus ?? 0)
    }
  }
  // Apply race attribute bonuses
  if (raceDef) {
    for (const [attr, bonus] of Object.entries(raceDef.attributeBonuses)) {
      (baseAttrs as Record<string, number>)[attr] = (baseAttrs as Record<string, number>)[attr] + (bonus ?? 0)
    }
  }

  const baseHp = (classDef?.baseHp ?? 100) + (raceDef?.bonusHp ?? 0)
  const baseMana = Math.max(0, (classDef?.baseMana ?? 0) + (raceDef?.bonusMana ?? 0))
  const baseAttack = classDef?.baseAttack ?? 10
  const baseDefense = classDef?.baseDefense ?? 5

  const uniqueStartingItems = [...new Set(classDef?.startingItems ?? [])]

  return {
    id,
    type: "player",
    version: 1,
    components: {
      position,
      health: { hp: baseHp, maxHp: baseHp },
      mana: { mp: baseMana, maxMp: baseMana, regenPerTick: Math.max(1, Math.floor(baseMana / 100)) },
      combat: { attack: baseAttack, defense: baseDefense },
      inventory: { items: uniqueStartingItems },
      equipment: createEquipment(),
      character: {
        classId,
        raceId,
        level: 1,
        experience: 0,
        experienceToNextLevel: xpForLevel(1),
        attributes: baseAttrs,
        gold: 50,
        alchemyLevel: 0,
        knownSpells: [...(classDef?.abilities ?? [])],
        knownAbilities: [...(classDef?.abilities ?? [])]
      },
      reputation: { factions: {} },
      questLog: { active: [], completed: [] }
    }
  }
}
