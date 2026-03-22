// Character component — class, race, attributes, level, XP

import { Attribute } from "../definitions/classes"

export type Attributes = Record<Attribute, number>

export type Character = {
  classId: string
  raceId: string
  level: number
  experience: number
  experienceToNextLevel: number
  attributes: Attributes
  gold: number
  alchemyLevel: number    // 0–10
  knownSpells: string[]   // spell IDs
  knownAbilities: string[]
}

// XP required to reach next level (simple quadratic curve)
export function xpForLevel(level: number): number {
  return Math.floor(100 * level * level * 0.8)
}

export function createBaseAttributes(): Attributes {
  return {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    wisdom: 10,
    constitution: 10,
    charisma: 10
  }
}

// Attribute modifier (D&D-style: (attr - 10) / 2 rounded down)
export function attrMod(value: number): number {
  return Math.floor((value - 10) / 2)
}

export function createCharacter(
  classId: string,
  raceId: string,
  extraAttributes: Partial<Attributes> = {}
): Character {
  const base = createBaseAttributes()
  const attrs: Attributes = { ...base, ...extraAttributes }

  return {
    classId,
    raceId,
    level: 1,
    experience: 0,
    experienceToNextLevel: xpForLevel(1),
    attributes: attrs,
    gold: 50,
    alchemyLevel: 0,
    knownSpells: [],
    knownAbilities: []
  }
}
