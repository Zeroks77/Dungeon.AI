// Rune definitions — embed into weapons and armor for bonus effects

import { DamageType, EquipSlot } from "./items"

export type RuneTier = "minor" | "major" | "grand" | "ancient"

export type RuneEffect = {
  type: "add_attack" | "add_defense" | "add_hp" | "add_mana" | "add_attribute" |
        "elemental_damage" | "lifesteal" | "manasteal" | "crit_chance" |
        "elemental_resistance" | "speed" | "reflect_damage" | "spell_penetration" |
        "dodge" | "resurrect" | "burn"
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

export type RuneCombo = {
  id: string
  name: string
  description: string
  requiredRunes: string[]   // rune IDs that must all be present on same item
  bonusEffect: RuneEffect   // extra effect granted by the combination
  tier: RuneTier            // minimum tier of the combo
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
  minor_lightning: {
    id: "minor_lightning", name: "Kleine Blitzrune", description: "Fügt 5 Blitzschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "lightning" },
    value: 25, requiredLevel: 1
  },
  minor_holy: {
    id: "minor_holy", name: "Kleine Heilige Rune", description: "Fügt 5 Heiligschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "holy" },
    value: 25, requiredLevel: 1
  },
  minor_shadow: {
    id: "minor_shadow", name: "Kleine Schattensrune", description: "Fügt 5 Schattenschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "shadow" },
    value: 25, requiredLevel: 1
  },
  minor_nature: {
    id: "minor_nature", name: "Kleine Naturrune", description: "Fügt 5 Naturschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "nature" },
    value: 25, requiredLevel: 1
  },
  minor_death: {
    id: "minor_death", name: "Kleine Todesrune", description: "Fügt 5 Todesschaden zu Angriffen hinzu.",
    tier: "minor", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 5, damageType: "death" },
    value: 25, requiredLevel: 1
  },
  minor_speed: {
    id: "minor_speed", name: "Kleine Geschwindigkeitsrune", description: "Erhöht Geschwindigkeit um 1.",
    tier: "minor", allowedSlots: ["feet", "legs", "ring"],
    effect: { type: "speed", value: 1 },
    value: 20, requiredLevel: 1
  },
  minor_wisdom: {
    id: "minor_wisdom", name: "Kleine Weisheitsrune", description: "Erhöht Weisheit um 2.",
    tier: "minor", allowedSlots: ["head", "amulet", "ring"],
    effect: { type: "add_attribute", value: 2, attribute: "wisdom" },
    value: 20, requiredLevel: 1
  },
  minor_strength: {
    id: "minor_strength", name: "Kleine Stärkungsrune", description: "Erhöht Stärke um 2.",
    tier: "minor", allowedSlots: ["mainhand", "hands", "ring"],
    effect: { type: "add_attribute", value: 2, attribute: "strength" },
    value: 20, requiredLevel: 1
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
  major_vitality: {
    id: "major_vitality", name: "Vitalitätsstärkung", description: "Erhöht HP um 50.",
    tier: "major", allowedSlots: ["chest", "head", "legs", "feet", "hands", "ring", "amulet"],
    effect: { type: "add_hp", value: 50 },
    value: 70, requiredLevel: 5
  },
  major_arcane: {
    id: "major_arcane", name: "Arkane Rune", description: "Erhöht Mana um 40.",
    tier: "major", allowedSlots: ["mainhand", "ring", "amulet"],
    effect: { type: "add_mana", value: 40 },
    value: 70, requiredLevel: 5
  },
  major_speed: {
    id: "major_speed", name: "Geschwindigkeitsrune", description: "Erhöht Geschwindigkeit um 2.",
    tier: "major", allowedSlots: ["feet", "legs", "ring"],
    effect: { type: "speed", value: 2 },
    value: 85, requiredLevel: 5
  },
  lightning_resistance: {
    id: "lightning_resistance", name: "Blitzresistenz", description: "Reduziert Blitzschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "lightning" },
    value: 90, requiredLevel: 5
  },
  shadow_resistance: {
    id: "shadow_resistance", name: "Schattenresistenz", description: "Reduziert Schattenschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "shadow" },
    value: 90, requiredLevel: 5
  },
  holy_resistance: {
    id: "holy_resistance", name: "Heiligenresistenz", description: "Reduziert Heiligschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "holy" },
    value: 90, requiredLevel: 5
  },
  nature_resistance: {
    id: "nature_resistance", name: "Naturresistenz", description: "Reduziert Naturschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "nature" },
    value: 90, requiredLevel: 5
  },
  death_resistance: {
    id: "death_resistance", name: "Todesresistenz", description: "Reduziert Todesschaden um 20%.",
    tier: "major", allowedSlots: ["chest", "head", "back", "ring", "amulet"],
    effect: { type: "elemental_resistance", value: 0.20, damageType: "death" },
    value: 90, requiredLevel: 5
  },
  manasteal: {
    id: "manasteal", name: "Manavorrat-Raub", description: "Stiehlt 6% des gegnerischen Manas bei jedem Treffer.",
    tier: "major", allowedSlots: ["mainhand", "offhand", "ring"],
    effect: { type: "manasteal", value: 0.06 },
    value: 110, requiredLevel: 6
  },
  spell_penetration: {
    id: "spell_penetration", name: "Zauberurchdringung", description: "Reduziert Elementarresistenz des Gegners um 15%.",
    tier: "major", allowedSlots: ["mainhand", "amulet"],
    effect: { type: "spell_penetration", value: 0.15 },
    value: 130, requiredLevel: 7
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
  grand_defense: {
    id: "grand_defense", name: "Große Verteidigungsverstärkung", description: "Erhöht Verteidigung um 20.",
    tier: "grand", allowedSlots: ["chest", "head", "legs", "feet", "hands", "back"],
    effect: { type: "add_defense", value: 20 },
    value: 240, requiredLevel: 10
  },
  grand_arcane: {
    id: "grand_arcane", name: "Große Arkane Rune", description: "Erhöht Mana um 120.",
    tier: "grand", allowedSlots: ["mainhand", "ring", "amulet"],
    effect: { type: "add_mana", value: 120 },
    value: 230, requiredLevel: 10
  },
  grand_speed: {
    id: "grand_speed", name: "Große Geschwindigkeitsrune", description: "Erhöht Geschwindigkeit um 3.",
    tier: "grand", allowedSlots: ["feet", "legs", "ring"],
    effect: { type: "speed", value: 3 },
    value: 260, requiredLevel: 10
  },
  grand_lifesteal: {
    id: "grand_lifesteal", name: "Großer Lebensraub", description: "Stiehlt 12% des ausgeteilten Schadens als LP.",
    tier: "grand", allowedSlots: ["mainhand", "offhand", "ring"],
    effect: { type: "lifesteal", value: 0.12 },
    value: 320, requiredLevel: 12
  },
  grand_crit: {
    id: "grand_crit", name: "Große Kritische Trefferrune", description: "Erhöht kritische Trefferchance um 15%.",
    tier: "grand", allowedSlots: ["mainhand", "offhand", "ring"],
    effect: { type: "crit_chance", value: 0.15 },
    value: 300, requiredLevel: 11
  },
  grand_reflect: {
    id: "grand_reflect", name: "Große Schadensreflektion", description: "Reflektiert 20% des erhaltenen Schadens.",
    tier: "grand", allowedSlots: ["chest", "back"],
    effect: { type: "reflect_damage", value: 0.20 },
    value: 350, requiredLevel: 12
  },
  grand_fire: {
    id: "grand_fire", name: "Große Feuerrune", description: "Fügt 30 Feuerschaden zu Angriffen hinzu.",
    tier: "grand", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 30, damageType: "fire" },
    value: 280, requiredLevel: 10
  },
  grand_ice: {
    id: "grand_ice", name: "Große Eisrune", description: "Fügt 30 Eisschaden zu Angriffen hinzu.",
    tier: "grand", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 30, damageType: "ice" },
    value: 280, requiredLevel: 10
  },
  grand_lightning: {
    id: "grand_lightning", name: "Große Blitzrune", description: "Fügt 30 Blitzschaden zu Angriffen hinzu.",
    tier: "grand", allowedSlots: ["mainhand", "offhand"],
    effect: { type: "elemental_damage", value: 30, damageType: "lightning" },
    value: 280, requiredLevel: 10
  },
  // ── Ancient Runes ─────────────────────────────────────────────
  ancient_power: {
    id: "ancient_power", name: "Urmächtige Kraft", description: "Erhöht Angriff und Stärke erheblich.",
    tier: "ancient", allowedSlots: ["mainhand"],
    effect: { type: "add_attack", value: 35 },
    value: 1000, requiredLevel: 18
  },
  ancient_ward: {
    id: "ancient_ward", name: "Uralte Schutzrune", description: "Massiver Verteidigungsbonus.",
    tier: "ancient", allowedSlots: ["chest"],
    effect: { type: "add_defense", value: 30 },
    value: 1000, requiredLevel: 18
  },
  ancient_wisdom: {
    id: "ancient_wisdom", name: "Uralte Weisheit", description: "Erhöht Weisheit um 8 und Intelligenz um 5.",
    tier: "ancient", allowedSlots: ["head", "amulet"],
    effect: { type: "add_attribute", value: 8, attribute: "wisdom" },
    value: 1200, requiredLevel: 18
  },
  ancient_speed: {
    id: "ancient_speed", name: "Uralte Eile", description: "Erhöht Geschwindigkeit um 4 und kritische Trefferchance um 10%.",
    tier: "ancient", allowedSlots: ["feet", "ring"],
    effect: { type: "speed", value: 4 },
    value: 1100, requiredLevel: 18
  },
  ancient_void: {
    id: "ancient_void", name: "Uralte Leere", description: "Schattenresistenz +50% und Schattenschaden +25.",
    tier: "ancient", allowedSlots: ["chest", "amulet"],
    effect: { type: "elemental_resistance", value: 0.50, damageType: "shadow" },
    value: 1300, requiredLevel: 20
  },
  ancient_phoenix: {
    id: "ancient_phoenix", name: "Uralter Phönix", description: "Einmalige Auferstehung pro Kampf mit 30% LP.",
    tier: "ancient", allowedSlots: ["amulet", "ring"],
    effect: { type: "resurrect", value: 0.30 },
    value: 1500, requiredLevel: 20
  },
  ancient_titan: {
    id: "ancient_titan", name: "Uralter Titan", description: "Erhöht HP um 200 und Verteidigung um 20.",
    tier: "ancient", allowedSlots: ["chest"],
    effect: { type: "add_hp", value: 200 },
    value: 1400, requiredLevel: 20
  }
}

// ── Rune Combination System ───────────────────────────────────────────────────
// When all requiredRunes are engraved on the same item, the bonusEffect is also applied.

export const RUNE_COMBOS: Record<string, RuneCombo> = {
  steam_burst: {
    id: "steam_burst",
    name: "Dampfstoß",
    description: "Feuer und Eis erzeugen überwältigenden Dampf, der die Ausweichrate erhöht.",
    requiredRunes: ["minor_fire", "minor_ice"],
    bonusEffect: { type: "dodge", value: 0.08 },
    tier: "minor"
  },
  plasma_strike: {
    id: "plasma_strike",
    name: "Plasmaschlag",
    description: "Feuer und Blitz verschmelzen zu Plasma und verursachen Brennschaden.",
    requiredRunes: ["minor_fire", "minor_lightning"],
    bonusEffect: { type: "burn", value: 5 },
    tier: "minor"
  },
  volcanic_fury: {
    id: "volcanic_fury",
    name: "Vulkanische Wut",
    description: "Zwei Feuerrune entfachen einen Vulkan — zusätzlich 20 Feuerschaden.",
    requiredRunes: ["minor_fire", "grand_fire"],
    bonusEffect: { type: "elemental_damage", value: 20, damageType: "fire" },
    tier: "grand"
  },
  soul_reaper: {
    id: "soul_reaper",
    name: "Seelenreaper",
    description: "Lebensraub und kritische Treffer ernten Seelen — Lebensraub bei Krit verdoppelt.",
    requiredRunes: ["lifesteal", "crit_rune"],
    bonusEffect: { type: "lifesteal", value: 0.06 },
    tier: "major"
  },
  assassin: {
    id: "assassin",
    name: "Meuchelmörder",
    description: "Angriff und kritische Treffer machen den Träger zum Meuchelmörder.",
    requiredRunes: ["major_attack", "crit_rune"],
    bonusEffect: { type: "crit_chance", value: 0.05 },
    tier: "major"
  },
  fortress: {
    id: "fortress",
    name: "Festung",
    description: "Verteidigung und Vitalität verbinden sich zur uneinnehmlichen Festung.",
    requiredRunes: ["major_defense", "major_vitality"],
    bonusEffect: { type: "add_hp", value: 30 },
    tier: "major"
  },
  lethal_tempo: {
    id: "lethal_tempo",
    name: "Tödliches Tempo",
    description: "Geschwindigkeit und kritische Treffer steigern sich gegenseitig.",
    requiredRunes: ["major_speed", "crit_rune"],
    bonusEffect: { type: "crit_chance", value: 0.05 },
    tier: "major"
  },
  grand_soul_reaper: {
    id: "grand_soul_reaper",
    name: "Großer Seelenreaper",
    description: "Großer Lebensraub und große Krit-Rune — unbändige Seelenernte.",
    requiredRunes: ["grand_lifesteal", "grand_crit"],
    bonusEffect: { type: "lifesteal", value: 0.08 },
    tier: "grand"
  },
  eternal_bastion: {
    id: "eternal_bastion",
    name: "Ewige Bastion",
    description: "Große Verteidigung und große Vitalität bilden ein ewiges Bollwerk.",
    requiredRunes: ["grand_defense", "grand_vitality"],
    bonusEffect: { type: "add_defense", value: 10 },
    tier: "grand"
  },
  storm_caller: {
    id: "storm_caller",
    name: "Sturmrufer",
    description: "Große Blitz- und Feuerrune entfachen einen vernichtenden Sturm.",
    requiredRunes: ["grand_lightning", "grand_fire"],
    bonusEffect: { type: "elemental_damage", value: 15, damageType: "lightning" },
    tier: "grand"
  },
  void_walker: {
    id: "void_walker",
    name: "Leerengeher",
    description: "Uralte Leere und Schattensrune öffnen den Weg durch die Dunkelheit.",
    requiredRunes: ["ancient_void", "minor_shadow"],
    bonusEffect: { type: "elemental_damage", value: 25, damageType: "shadow" },
    tier: "ancient"
  },
  titan_phoenix: {
    id: "titan_phoenix",
    name: "Titanphönix",
    description: "Titan und Phönix — nahezu unzerstörbar und wiedergeboren aus der Asche.",
    requiredRunes: ["ancient_titan", "ancient_phoenix"],
    bonusEffect: { type: "add_hp", value: 50 },
    tier: "ancient"
  },
  arcane_overflow: {
    id: "arcane_overflow",
    name: "Arkaner Überlauf",
    description: "Große und kleine arkane Runen überfluten den Geist mit unbegrenzter Macht.",
    requiredRunes: ["grand_arcane", "minor_arcane"],
    bonusEffect: { type: "spell_penetration", value: 0.10 },
    tier: "grand"
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

export function getRuneCombo(id: string): RuneCombo | undefined {
  return RUNE_COMBOS[id]
}

export function getAllRuneCombos(): RuneCombo[] {
  return Object.values(RUNE_COMBOS)
}

/** Returns all combos whose requiredRunes are all present in the given list of engraved rune IDs. */
export function checkRuneCombos(engravings: string[]): RuneCombo[] {
  const engravedSet = new Set(engravings)
  return Object.values(RUNE_COMBOS).filter(combo =>
    combo.requiredRunes.every(r => engravedSet.has(r))
  )
}
