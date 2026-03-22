// Character class definitions

export type Attribute = "strength" | "dexterity" | "intelligence" | "wisdom" | "constitution" | "charisma"

export type AttributeModifiers = Record<Attribute, number>

export type SpellSchool = "fire" | "ice" | "lightning" | "arcane" | "holy" | "shadow" | "nature"

export type CharacterClass = {
  id: string
  name: string
  description: string
  hitDie: number            // e.g. 10 = d10 for HP on level-up
  baseAttack: number
  baseDefense: number
  baseHp: number
  baseMana: number
  attributeBonuses: Partial<AttributeModifiers>
  primaryAttributes: Attribute[]
  allowedSpellSchools: SpellSchool[]
  startingItems: string[]   // item IDs from items definition
  abilities: string[]       // ability IDs unlocked at level 1
  levelAbilities: Record<number, string[]>  // abilities unlocked per level
}

export const CHARACTER_CLASSES: Record<string, CharacterClass> = {
  warrior: {
    id: "warrior",
    name: "Krieger",
    description: "Meister des Nahkampfes, gepanzert und unerschütterlich.",
    hitDie: 10,
    baseAttack: 15,
    baseDefense: 10,
    baseHp: 120,
    baseMana: 0,
    attributeBonuses: { strength: 3, constitution: 2 },
    primaryAttributes: ["strength", "constitution"],
    allowedSpellSchools: [],
    startingItems: ["iron_sword", "leather_armor", "health_potion"],
    abilities: ["power_strike", "shield_block"],
    levelAbilities: {
      3: ["whirlwind"],
      5: ["battle_cry"],
      7: ["berserker_rage"],
      10: ["avatar_of_war"]
    }
  },
  mage: {
    id: "mage",
    name: "Magier",
    description: "Zerbrechlich aber vernichtend mächtig.",
    hitDie: 6,
    baseAttack: 5,
    baseDefense: 3,
    baseHp: 60,
    baseMana: 150,
    attributeBonuses: { intelligence: 4, wisdom: 1 },
    primaryAttributes: ["intelligence", "wisdom"],
    allowedSpellSchools: ["fire", "ice", "lightning", "arcane"],
    startingItems: ["wooden_staff", "mage_robes", "mana_potion", "fireball_tome"],
    abilities: ["arcane_missile", "mana_shield"],
    levelAbilities: {
      3: ["fireball"],
      5: ["ice_nova"],
      7: ["chain_lightning"],
      10: ["meteor_storm"]
    }
  },
  rogue: {
    id: "rogue",
    name: "Schurke",
    description: "Meister des Schattens, tödlich aus dem Hinterhalt.",
    hitDie: 8,
    baseAttack: 12,
    baseDefense: 6,
    baseHp: 80,
    baseMana: 30,
    attributeBonuses: { dexterity: 4, charisma: 1 },
    primaryAttributes: ["dexterity", "charisma"],
    allowedSpellSchools: ["shadow"],
    startingItems: ["dagger", "leather_armor", "smoke_bomb"],
    abilities: ["backstab", "stealth"],
    levelAbilities: {
      3: ["poison_blade"],
      5: ["shadow_step"],
      7: ["evasion"],
      10: ["death_mark"]
    }
  },
  cleric: {
    id: "cleric",
    name: "Kleriker",
    description: "Göttlicher Krieger, heilt Verbündete und vernichtet Untote.",
    hitDie: 8,
    baseAttack: 10,
    baseDefense: 8,
    baseHp: 90,
    baseMana: 100,
    attributeBonuses: { wisdom: 3, constitution: 2 },
    primaryAttributes: ["wisdom", "constitution"],
    allowedSpellSchools: ["holy", "shadow"],
    startingItems: ["mace", "chain_mail", "holy_symbol", "health_potion"],
    abilities: ["heal", "holy_smite"],
    levelAbilities: {
      3: ["bless"],
      5: ["turn_undead"],
      7: ["divine_shield"],
      10: ["resurrection"]
    }
  },
  ranger: {
    id: "ranger",
    name: "Waldläufer",
    description: "Meister des Fernkampfes und des Überlebens in der Wildnis.",
    hitDie: 8,
    baseAttack: 11,
    baseDefense: 7,
    baseHp: 85,
    baseMana: 40,
    attributeBonuses: { dexterity: 3, wisdom: 2 },
    primaryAttributes: ["dexterity", "wisdom"],
    allowedSpellSchools: ["nature"],
    startingItems: ["short_bow", "leather_armor", "quiver", "hunting_knife"],
    abilities: ["aimed_shot", "track"],
    levelAbilities: {
      3: ["multishot"],
      5: ["animal_companion"],
      7: ["camouflage"],
      10: ["rain_of_arrows"]
    }
  }
}

export function getClass(id: string): CharacterClass | undefined {
  return CHARACTER_CLASSES[id]
}

export function getAllClasses(): CharacterClass[] {
  return Object.values(CHARACTER_CLASSES)
}
