// Rune definitions — embed into weapons and armor for bonus effects

import { DamageType, EquipSlot } from "./items"

export type RuneTier = "minor" | "major" | "grand" | "ancient"

export type RuneEffect = {
  type: "add_attack" | "add_defense" | "add_hp" | "add_mana" | "add_attribute" |
        "elemental_damage" | "lifesteal" | "manasteal" | "crit_chance" |
        "elemental_resistance" | "speed" | "reflect_damage"
  value: number
  damageType?: DamageType
  attribute?: string
}

export type Rune = {
  id: string
  name: string
  description: string
  tier: RuneTier
  allowedSlots: EquipSlot[]   // which item slots accept this rune
  effect: RuneEffect
  value: number               // gold cost to purchase/sell
  requiredLevel: number
}

export const RUNES: Record<string, Rune> = {
  // ── Minor Runes ───────────────────────────────────────────────
  minor_attack: {
    id: "minor_attack", name: "Kleine Angriffsverstärkung", description: "Erhöht Angriff um 3.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "add_attack", value: 3 },
    value: 20, requiredLevel: 1
  },
  minor_defense: {
    id: "minor_defense", name: "Kleine Verteidigungsverstärkung", description: "Erhöht Verteidigung um 3.",
    tier: "minor", allowedSlots: ["chest", "head", "legs", "feet", "hands", "back"],
    effect: { type: "add_defense", value: 3 },
    value: 20, requiredLevel: 1
  },
  minor_vitality: {
    id: "minor_vitality", name: "Kleine Vitalitätsstärkung", description: "Erhöht HP um 20.",
    tier: "minor", allowedSlots: ["chest", "head", "legs", "feet", "hands", "ring", "amulet"],
    effect: { type: "add_hp", value: 20 },
    value: 15, requiredLevel: 1
  },
  minor_arcane: {
    id: "minor_arcane", name: "Kleine Arkane Rune", description: "Erhöht Mana um 15.",
    tier: "minor", allowedSlots: ["mainhand", "ring", "amulet"],
    effect: { type: "add_mana", value: 15 },
    value: 15, requiredLevel: 1
  },
  minor_fire: {
    id: "minor_fire", name: "Kleine Feuerrune", description: "Fügt 5 Feuerschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "fire" },
    value: 25, requiredLevel: 1
  },
  minor_ice: {
    id: "minor_ice", name: "Kleine Eisrune", description: "Fügt 5 Eisschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "ice" },
    value: 25, requiredLevel: 1
  },
  // ── Major Runes ───────────────────────────────────────────────
  major_attack: {
    id: "major_attack", name: "Angriffsverstärkung", description: "Erhöht Angriff um 8.",
    tier: "major", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "add_attack", value: 8 },
    value: 80, requiredLevel: 5
  },
  major_defense: {
    id: "major_defense", name: "Verteidigungsverstärkung", description: "Erhöht Verteidigung um 8.",
    tier: "major", allowedSlots: ["chest", "head", "legs", "feet", "hands", "back"],
    effect: { type: "add_defense", value: 8 },
    value: 80, requiredLevel: 5
  },
  lifesteal: {
    id: "lifesteal", name: "Lebensraub", description: "Stiehlt 8% des ausgeteilten Schadens als LP.",
    tier: "major", allowedSlots: ["mainhand", "offhand", "ring"],
    effect: { type: "lifesteal", value: 0.08 },
    value: 120, requiredLevel: 6
  },
  crit_rune: {
    id: "crit_rune", name: "Kritische Trefferrune", description: "Erhöht kritische Trefferchance um 8%.",
    tier: "major", allowedSlots: ["mainhand", "offhand", "ring"],
    effect: { type: "crit_chance", value: 0.08 },
    value: 100, requiredLevel: 5
  },
  fire_resistance: {
    id: "fire_resistance", name: "Feuerresistenz", description: "Reduziert Feuerschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "fire" },
    value: 90, requiredLevel: 5
  },
  ice_resistance: {
    id: "ice_resistance", name: "Eisresistenz", description: "Reduziert Eisschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "ice" },
    value: 90, requiredLevel: 5
  },
  // ── Grand Runes ───────────────────────────────────────────────
  grand_attack: {
    id: "grand_attack", name: "Große Angriffsverstärkung", description: "Erhöht Angriff um 18.",
    tier: "grand", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "add_attack", value: 18 },
    value: 250, requiredLevel: 10
  },
  grand_vitality: {
    id: "grand_vitality", name: "Große Vitalitätsstärkung", description: "Erhöht HP um 80.",
    tier: "grand", allowedSlots: ["chest", "head", "legs", "feet", "hands", "ring", "amulet"],
    effect: { type: "add_hp", value: 80 },
    value: 200, requiredLevel: 10
  },
  reflect: {
    id: "reflect", name: "Schadensreflektion", description: "Reflektiert 15% des erhaltenen Schadens.",
    tier: "grand", allowedSlots: ["chest", "back"],
    effect: { type: "reflect_damage", value: 0.15 },
    value: 300, requiredLevel: 12
  },
  // ── Ancient Runes ─────────────────────────────────────────────
  ancient_power: {
    id: "ancient_power", name: "Urmächtige Kraft", description: "Erhöht Angriff und Stärke erheblich.",
    tier: "ancient", allowedSlots: ["mainhand"],
    effect: { type: "add_attack", value: 35 },
    value: 1000, requiredLevel: 18
  },
  ancient_ward: {
    id: "ancient_ward", name: "Uralte Schutzrune", description: "Massiver Verteidigungsbonus + HP.",
    tier: "ancient", allowedSlots: ["chest"],
    effect: { type: "add_defense", value: 30 },
    value: 1000, requiredLevel: 18
  }
}

export function getRune(id: string): Rune | undefined {
  return RUNES[id]
}

export function getAllRunes(): Rune[] {
  return Object.values(RUNES)
}

export function getRunesForSlot(slot: EquipSlot): Rune[] {
  return Object.values(RUNES).filter(r => r.allowedSlots.includes(slot))
}
