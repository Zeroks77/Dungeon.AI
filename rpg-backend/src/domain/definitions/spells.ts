// Spell definitions

import { SpellSchool } from "./classes"
import { DamageType } from "./items"

export type SpellTargetType = "self" | "single_enemy" | "single_ally" | "area" | "cone" | "line"

export type SpellEffect = {
  type: "damage" | "heal" | "restore_mana" | "buff" | "debuff" | "summon" | "teleport" | "stun" | "root" | "silence"
  damageType?: DamageType
  value?: number
  valuePerLevel?: number    // added per caster level above minLevel
  duration?: number         // in ticks (0 = instant)
  attribute?: string
  radius?: number           // for area spells (in hex tiles)
}

export type Spell = {
  id: string
  name: string
  description: string
  school: SpellSchool
  manaCost: number
  castTime: number          // in ticks (0 = instant)
  cooldown: number          // in ticks
  range: number             // max hex distance (0 = self)
  targetType: SpellTargetType
  effects: SpellEffect[]
  requiredLevel: number
  requiredClass: string[]
}

export const SPELLS: Record<string, Spell> = {
  // ── Arcane ────────────────────────────────────────────────────
  arcane_missile: {
    id: "arcane_missile", name: "Arkaner Pfeil", description: "Schießt einen Pfeil aus reiner arkaner Energie.",
    school: "arcane", manaCost: 15, castTime: 0, cooldown: 1, range: 6,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "arcane", value: 18, valuePerLevel: 2 }],
    requiredLevel: 1, requiredClass: ["mage"]
  },
  mana_shield: {
    id: "mana_shield", name: "Manaschutzwall", description: "Absorbiert Schaden auf Kosten von Mana.",
    school: "arcane", manaCost: 30, castTime: 0, cooldown: 20, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "mana_shield", value: 50, duration: 30 }],
    requiredLevel: 1, requiredClass: ["mage"]
  },
  fireball: {
    id: "fireball", name: "Feuerball", description: "Schleudert eine explodierende Feuerkugel ins Zielgebiet.",
    school: "fire", manaCost: 40, castTime: 1, cooldown: 4, range: 8,
    targetType: "area",
    effects: [{ type: "damage", damageType: "fire", value: 45, valuePerLevel: 5, radius: 2 }],
    requiredLevel: 3, requiredClass: ["mage"]
  },
  ice_nova: {
    id: "ice_nova", name: "Eisnova", description: "Explodiert in einer Welle aus gefrorenem Eis.",
    school: "ice", manaCost: 50, castTime: 1, cooldown: 6, range: 0,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "ice", value: 35, valuePerLevel: 4, radius: 3 },
      { type: "root", duration: 3 }
    ],
    requiredLevel: 5, requiredClass: ["mage"]
  },
  chain_lightning: {
    id: "chain_lightning", name: "Kettenblitz", description: "Blitz springt zwischen mehreren Feinden.",
    school: "lightning", manaCost: 60, castTime: 1, cooldown: 8, range: 7,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "lightning", value: 55, valuePerLevel: 6 }],
    requiredLevel: 7, requiredClass: ["mage"]
  },
  meteor_storm: {
    id: "meteor_storm", name: "Meteorsturm", description: "Regnet Meteore auf ein großes Gebiet.",
    school: "fire", manaCost: 120, castTime: 3, cooldown: 20, range: 10,
    targetType: "area",
    effects: [{ type: "damage", damageType: "fire", value: 120, valuePerLevel: 12, radius: 4 }],
    requiredLevel: 10, requiredClass: ["mage"]
  },
  // ── Holy ──────────────────────────────────────────────────────
  heal: {
    id: "heal", name: "Heilung", description: "Stellt Lebenspunkte des Zieles wieder her.",
    school: "holy", manaCost: 25, castTime: 0, cooldown: 2, range: 4,
    targetType: "single_ally",
    effects: [{ type: "heal", value: 40, valuePerLevel: 5 }],
    requiredLevel: 1, requiredClass: ["cleric"]
  },
  holy_smite: {
    id: "holy_smite", name: "Heiliger Schlag", description: "Kanalisiert göttliche Energie in einen vernichtenden Schlag.",
    school: "holy", manaCost: 20, castTime: 0, cooldown: 3, range: 1,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "holy", value: 30, valuePerLevel: 4 }],
    requiredLevel: 1, requiredClass: ["cleric"]
  },
  bless: {
    id: "bless", name: "Segen", description: "Segnet einen Verbündeten und erhöht dessen Kampfkraft.",
    school: "holy", manaCost: 30, castTime: 0, cooldown: 20, range: 4,
    targetType: "single_ally",
    effects: [
      { type: "buff", attribute: "attack", value: 5, duration: 30 },
      { type: "buff", attribute: "defense", value: 3, duration: 30 }
    ],
    requiredLevel: 3, requiredClass: ["cleric"]
  },
  turn_undead: {
    id: "turn_undead", name: "Untote wenden", description: "Vertreibt oder vernichtet Untote in der Nähe.",
    school: "holy", manaCost: 40, castTime: 0, cooldown: 10, range: 0,
    targetType: "area",
    effects: [{ type: "damage", damageType: "holy", value: 60, radius: 3 }],
    requiredLevel: 5, requiredClass: ["cleric"]
  },
  divine_shield: {
    id: "divine_shield", name: "Göttlicher Schild", description: "Hüllt in unzerstörbare göttliche Energie.",
    school: "holy", manaCost: 60, castTime: 0, cooldown: 60, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "divine_shield", value: 1, duration: 5 }],
    requiredLevel: 7, requiredClass: ["cleric"]
  },
  resurrection: {
    id: "resurrection", name: "Auferstehung", description: "Erweckt einen gefallenen Verbündeten.",
    school: "holy", manaCost: 150, castTime: 5, cooldown: 100, range: 2,
    targetType: "single_ally",
    effects: [{ type: "heal", value: 50 }],
    requiredLevel: 10, requiredClass: ["cleric"]
  },
  // ── Shadow ────────────────────────────────────────────────────
  shadow_step: {
    id: "shadow_step", name: "Schattensprung", description: "Teleportiert sich in die Schatten hinter das Ziel.",
    school: "shadow", manaCost: 20, castTime: 0, cooldown: 8, range: 5,
    targetType: "single_enemy",
    effects: [{ type: "teleport" }],
    requiredLevel: 5, requiredClass: ["rogue"]
  },
  poison_blade: {
    id: "poison_blade", name: "Giftklinge", description: "Vergiftet die Waffe für mehrere Schläge.",
    school: "shadow", manaCost: 15, castTime: 0, cooldown: 10, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "poison_weapon", value: 10, duration: 20 }],
    requiredLevel: 3, requiredClass: ["rogue"]
  },
  // ── Nature ────────────────────────────────────────────────────
  aimed_shot: {
    id: "aimed_shot", name: "Gezielter Schuss", description: "Ein präziser Schuss mit erhöhter Trefferchance.",
    school: "nature", manaCost: 10, castTime: 0, cooldown: 2, range: 10,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "physical", value: 20, valuePerLevel: 3 }],
    requiredLevel: 1, requiredClass: ["ranger"]
  },
  multishot: {
    id: "multishot", name: "Mehrfachschuss", description: "Verschießt mehrere Pfeile gleichzeitig.",
    school: "nature", manaCost: 20, castTime: 0, cooldown: 5, range: 8,
    targetType: "area",
    effects: [{ type: "damage", damageType: "physical", value: 15, valuePerLevel: 2, radius: 2 }],
    requiredLevel: 3, requiredClass: ["ranger"]
  },
  // ── Warrior abilities (no mana cost — treated as special attacks) ──
  power_strike: {
    id: "power_strike", name: "Kraftschlag", description: "Ein mächtiger Schlag mit doppelter Wucht.",
    school: "arcane", manaCost: 0, castTime: 0, cooldown: 3, range: 1,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "physical", value: 0, valuePerLevel: 0 }],
    requiredLevel: 1, requiredClass: ["warrior"]
  },
  berserker_rage: {
    id: "berserker_rage", name: "Berserkerrausch", description: "Erhöht Angriff drastisch auf Kosten der Verteidigung.",
    school: "arcane", manaCost: 0, castTime: 0, cooldown: 30, range: 0,
    targetType: "self",
    effects: [
      { type: "buff", attribute: "attack", value: 20, duration: 15 },
      { type: "debuff", attribute: "defense", value: -10, duration: 15 }
    ],
    requiredLevel: 7, requiredClass: ["warrior"]
  }
}

export function getSpell(id: string): Spell | undefined {
  return SPELLS[id]
}

export function getSpellsByClass(classId: string): Spell[] {
  return Object.values(SPELLS).filter(s => s.requiredClass.includes(classId))
}

export function getSpellsBySchool(school: SpellSchool): Spell[] {
  return Object.values(SPELLS).filter(s => s.school === school)
}
