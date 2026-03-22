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
    description: "Anpassungsfähig und ehrgeizig – Menschen gedeihen in jeder Umgebung und meistern jede Klasse.",
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
    description: "Anmutig und weise, mit einem tiefen Gespür für Magie und Natur. Elfen schlafen nie, sondern versinken in Trance.",
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
    description: "Zäh und ausdauernd, Meister des Bergbaus und der Schmiedekunst. Zwerge trotzen Gift und Furcht.",
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
    description: "Brutal und furchteinflößend, geboren für den Kampf. Orks überwältigen ihre Feinde durch rohe Stärke.",
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
    description: "Klein aber wendig, mit viel Glück und einem charmanten Wesen. Halblinge entgehen fast jedem Missgeschick.",
    attributeBonuses: { dexterity: 3, charisma: 2 },
    bonusHp: -10,
    bonusMana: 20,
    speed: 4,
    traits: ["lucky", "nimble", "brave", "naturally_stealthy"],
    resistances: ["fear"],
    weaknesses: [],
    visionRange: 5,
    favoredClasses: ["rogue", "ranger"]
  },
  tiefling: {
    id: "tiefling",
    name: "Teufelskind",
    description: "Nachfahren dämonischer Ahnen – Teufelskinder tragen das Höllenfeuer in ihrem Blut. Charismatisch, listig und von Feuer unberührt.",
    attributeBonuses: { charisma: 3, intelligence: 2 },
    bonusHp: 0,
    bonusMana: 25,
    speed: 4,
    traits: ["darkvision", "infernal_legacy", "hellish_rebuke"],
    resistances: ["fire"],
    weaknesses: ["holy"],
    visionRange: 6,
    favoredClasses: ["mage", "warlock", "rogue"]
  },
  gnome: {
    id: "gnome",
    name: "Gnom",
    description: "Erfinderisch und neugierig – Gnome sind Meister der Illusionsmagie und technischer Tüfteleien. Klein und flink, aber von scharfem Verstand.",
    attributeBonuses: { intelligence: 3, wisdom: 2 },
    bonusHp: -5,
    bonusMana: 35,
    speed: 3,
    traits: ["gnome_cunning", "illusion_affinity", "tinker", "darkvision"],
    resistances: ["magic", "charm"],
    weaknesses: ["physical"],
    visionRange: 6,
    favoredClasses: ["mage", "cleric", "rogue"]
  },
  dragonborn: {
    id: "dragonborn",
    name: "Drachengeborener",
    description: "Mit Drachenschuppen und dem Blut uralter Drachen gesegnet. Drachengeborene beherrschen einen elementaren Atemstrahl und sind nahezu unerschütterlich.",
    attributeBonuses: { strength: 3, constitution: 2, charisma: 1 },
    bonusHp: 20,
    bonusMana: 10,
    speed: 4,
    traits: ["draconic_ancestry", "breath_weapon", "draconic_resilience"],
    resistances: ["fire", "ice", "lightning"],
    weaknesses: [],
    visionRange: 5,
    favoredClasses: ["warrior", "paladin", "mage"]
  },
  dark_elf: {
    id: "dark_elf",
    name: "Dunkelelfe",
    description: "Tief in den Unterwelten geboren – Dunkelelfen sind meisterhafte Schleicher und düstere Magier. Immunität gegen Gift, übernatürliche Dunkelsicht, doch grelles Licht schwächt ihre Sinne.",
    attributeBonuses: { dexterity: 3, intelligence: 2, charisma: 1 },
    bonusHp: -5,
    bonusMana: 30,
    speed: 5,
    traits: ["superior_darkvision", "poison_immunity", "sunlight_sensitivity", "drow_magic", "trance"],
    resistances: ["poison", "charm"],
    weaknesses: ["radiant"],
    visionRange: 9,
    favoredClasses: ["rogue", "mage", "ranger"]
  },
  half_orc: {
    id: "half_orc",
    name: "Halbork",
    description: "Aus menschlichem und orkischem Blut geboren – ausgeglichener als ein reinblütiger Ork, mit ungebrochener Willenskraft. Einmal pro Kampf überlebt ein Halbork einen tödlichen Treffer mit 1 TP.",
    attributeBonuses: { strength: 3, constitution: 2, dexterity: 1 },
    bonusHp: 25,
    bonusMana: -10,
    speed: 4,
    traits: ["relentless_endurance", "savage_attacks", "menacing"],
    resistances: ["physical"],
    weaknesses: ["holy"],
    visionRange: 5,
    favoredClasses: ["warrior", "ranger", "rogue"]
  },
  undead: {
    id: "undead",
    name: "Untoter",
    description: "Zwischen Leben und Tod gefangen – Untote werden durch Heilungsmagie nicht geheilt, doch Todesmagie stärkt sie. Kein Schlaf, kein Gift, kein Hunger kann ihnen etwas anhaben.",
    attributeBonuses: { constitution: 3, strength: 2 },
    bonusHp: 20,
    bonusMana: 20,
    speed: 3,
    traits: ["undead_fortitude", "death_magic_healing", "no_sleep", "no_hunger", "necrotic_absorption"],
    resistances: ["poison", "necrotic", "fear", "cold"],
    weaknesses: ["holy", "radiant", "healing"],
    visionRange: 6,
    favoredClasses: ["necromancer", "warrior", "warlock"]
  },
  fae: {
    id: "fae",
    name: "Feenwesen",
    description: "Aus dem Reich der Träume entsprungen – Feenwesen bezaubern mit übernatürlichem Charisma und flinker Magie. Zerbrechlich, doch immun gegen Traummanipulation und magische Betäubung.",
    attributeBonuses: { charisma: 4, dexterity: 2 },
    bonusHp: -15,
    bonusMana: 40,
    speed: 6,
    traits: ["fae_charm", "dream_resistance", "magical_glamour", "fae_step"],
    resistances: ["charm", "sleep", "psychic"],
    weaknesses: ["cold_iron", "physical"],
    visionRange: 6,
    favoredClasses: ["mage", "warlock", "bard"]
  },
  lizardfolk: {
    id: "lizardfolk",
    name: "Echsenvolk",
    description: "Schuppenhäutige Krieger aus den Sümpfen – ihr natürlicher Rüstungspanzer schützt ohne Ausrüstung. Geschickte Schwimmer, kälteangepasst und mit giftigem Biss gesegnet.",
    attributeBonuses: { constitution: 3, strength: 2, wisdom: 1 },
    bonusHp: 25,
    bonusMana: -5,
    speed: 4,
    traits: ["natural_armor", "hold_breath", "swimmer", "venomous_bite", "cold_adaptation"],
    resistances: ["cold", "poison"],
    weaknesses: ["fire"],
    visionRange: 5,
    favoredClasses: ["warrior", "ranger", "druid"]
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
