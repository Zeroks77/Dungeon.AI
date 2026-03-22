// Race definitions

import { Attribute, AttributeModifiers } from "./classes"

export type Race = {
  id: string
  name: string
  description: string
  attributeBonuses: Partial<AttributeModifiers>
  bonusHp: number
  bonusMana: number
  speed: number           // movement range per turn (hex tiles)
  traits: string[]        // passive trait IDs
  resistances: string[]   // damage types resisted (25% reduction)
  weaknesses: string[]    // damage types taken as extra (25% more)
  visionRange: number     // default FOV radius
  favoredClasses: string[]
}

export const RACES: Record<string, Race> = {
  human: {
    id: "human",
    name: "Mensch",
    description: "Anpassungsfähig und ehrgeizig – Menschen gedeihen in jeder Umgebung.",
    attributeBonuses: { strength: 1, dexterity: 1, intelligence: 1, wisdom: 1, constitution: 1, charisma: 1 },
    bonusHp: 10,
    bonusMana: 10,
    speed: 4,
    traits: ["adaptable", "extra_feat"],
    resistances: [],
    weaknesses: [],
    visionRange: 5,
    favoredClasses: ["warrior", "mage", "rogue", "cleric", "ranger"]
  },
  elf: {
    id: "elf",
    name: "Elf",
    description: "Anmutig und weise, mit einem tiefen Gespür für Magie und Natur.",
    attributeBonuses: { dexterity: 2, intelligence: 2, wisdom: 1, charisma: 1 },
    bonusHp: 0,
    bonusMana: 30,
    speed: 5,
    traits: ["elven_sight", "trance", "weapon_familiarity"],
    resistances: ["charm", "sleep"],
    weaknesses: [],
    visionRange: 7,
    favoredClasses: ["mage", "ranger"]
  },
  dwarf: {
    id: "dwarf",
    name: "Zwerg",
    description: "Zäh und ausdauernd, Meister des Bergbaus und der Schmiedekunst.",
    attributeBonuses: { constitution: 3, strength: 2 },
    bonusHp: 30,
    bonusMana: -10,
    speed: 3,
    traits: ["darkvision", "poison_resistance", "stonecunning", "smith_expertise"],
    resistances: ["poison", "fear"],
    weaknesses: ["magic"],
    visionRange: 6,
    favoredClasses: ["warrior", "cleric"]
  },
  orc: {
    id: "orc",
    name: "Ork",
    description: "Brutal und furchteinflößend, geboren für den Kampf.",
    attributeBonuses: { strength: 4, constitution: 2 },
    bonusHp: 40,
    bonusMana: -20,
    speed: 4,
    traits: ["relentless", "intimidating_presence", "savage_attacks"],
    resistances: ["physical"],
    weaknesses: ["holy"],
    visionRange: 4,
    favoredClasses: ["warrior"]
  },
  halfling: {
    id: "halfling",
    name: "Halbling",
    description: "Klein aber wendig, mit viel Glück und einem charmanten Wesen.",
    attributeBonuses: { dexterity: 3, charisma: 2 },
    bonusHp: -10,
    bonusMana: 20,
    speed: 4,
    traits: ["lucky", "nimble", "brave", "naturally_stealthy"],
    resistances: ["fear"],
    weaknesses: [],
    visionRange: 5,
    favoredClasses: ["rogue", "ranger"]
  }
}

export function getRace(id: string): Race | undefined {
  return RACES[id]
}

export function getAllRaces(): Race[] {
  return Object.values(RACES)
}

export function computeRaceAttributeBonus(raceId: string, attr: Attribute): number {
  const race = RACES[raceId]
  if (!race) return 0
  return (race.attributeBonuses as Partial<AttributeModifiers>)[attr] ?? 0
}
