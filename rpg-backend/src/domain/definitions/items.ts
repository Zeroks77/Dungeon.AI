// Item definitions — the item catalog

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary"
export type ItemType = "weapon" | "armor" | "potion" | "ingredient" | "rune" | "quest" | "misc"
export type DamageType = "physical" | "fire" | "ice" | "lightning" | "poison" | "holy" | "shadow" | "arcane"
export type EquipSlot = "mainhand" | "offhand" | "head" | "chest" | "legs" | "feet" | "hands" | "ring" | "amulet" | "back"

export type ItemStats = {
  attack?: number
  defense?: number
  hpBonus?: number
  manaBonus?: number
  strengthBonus?: number
  dexterityBonus?: number
  intelligenceBonus?: number
  wisdomBonus?: number
  constitutionBonus?: number
  charismaBonus?: number
  damageType?: DamageType
  damageBonus?: number
  speed?: number
  critChance?: number       // 0.0–1.0
  critMultiplier?: number   // default 2.0
  runeSlots?: number        // how many runes can be embedded
}

export type ItemEffect = {
  type: "heal" | "restore_mana" | "buff" | "debuff" | "antidote" | "teleport"
  value?: number
  duration?: number         // in ticks; omit for instant
  attribute?: string
}

export type ItemDefinition = {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  slot?: EquipSlot
  weight: number            // in kg
  value: number             // base gold value
  stackable: boolean
  maxStack: number
  stats?: ItemStats
  effects?: ItemEffect[]
  requiredLevel?: number
  requiredClass?: string[]
  twoHanded?: boolean
}

export const ITEMS: Record<string, ItemDefinition> = {
  // ── Weapons ──────────────────────────────────────────────────
  dagger: {
    id: "dagger", name: "Dolch", description: "Schnell und tödlich in geschickten Händen.",
    type: "weapon", rarity: "common", slot: "mainhand", weight: 0.5, value: 10,
    stackable: false, maxStack: 1,
    stats: { attack: 5, damageType: "physical", critChance: 0.15, critMultiplier: 2.5, runeSlots: 1 }
  },
  iron_sword: {
    id: "iron_sword", name: "Eisenschwert", description: "Ein solides Schwert aus Eisen.",
    type: "weapon", rarity: "common", slot: "mainhand", weight: 2.5, value: 25,
    stackable: false, maxStack: 1,
    stats: { attack: 10, damageType: "physical", runeSlots: 2 }
  },
  steel_sword: {
    id: "steel_sword", name: "Stahlschwert", description: "Ein gut ausbalanciertes Stahlschwert.",
    type: "weapon", rarity: "uncommon", slot: "mainhand", weight: 2.2, value: 80,
    stackable: false, maxStack: 1, requiredLevel: 5,
    stats: { attack: 16, damageType: "physical", critChance: 0.1, runeSlots: 2 }
  },
  mace: {
    id: "mace", name: "Streitkolben", description: "Wuchtig, gut gegen Rüstungen.",
    type: "weapon", rarity: "common", slot: "mainhand", weight: 3.0, value: 20,
    stackable: false, maxStack: 1,
    stats: { attack: 9, damageType: "physical", runeSlots: 1 }
  },
  wooden_staff: {
    id: "wooden_staff", name: "Holzstab", description: "Fokussiert magische Energie.",
    type: "weapon", rarity: "common", slot: "mainhand", weight: 1.5, value: 15,
    stackable: false, maxStack: 1,
    stats: { attack: 4, manaBonus: 20, intelligenceBonus: 2, runeSlots: 3 }
  },
  arcane_staff: {
    id: "arcane_staff", name: "Arkaner Stab", description: "Verstärkt arkane Zauber erheblich.",
    type: "weapon", rarity: "rare", slot: "mainhand", weight: 1.8, value: 200,
    stackable: false, maxStack: 1, requiredLevel: 8, requiredClass: ["mage"],
    stats: { attack: 8, manaBonus: 50, intelligenceBonus: 5, damageBonus: 12, runeSlots: 4 }
  },
  short_bow: {
    id: "short_bow", name: "Kurzbogen", description: "Flink und präzise.",
    type: "weapon", rarity: "common", slot: "mainhand", weight: 1.0, value: 20,
    stackable: false, maxStack: 1, twoHanded: true,
    stats: { attack: 8, damageType: "physical", critChance: 0.12, runeSlots: 1 }
  },
  hunting_knife: {
    id: "hunting_knife", name: "Jagdmesser", description: "Praktisch im Nahkampf und beim Überleben.",
    type: "weapon", rarity: "common", slot: "offhand", weight: 0.4, value: 8,
    stackable: false, maxStack: 1,
    stats: { attack: 4, damageType: "physical", critChance: 0.1 }
  },
  flaming_sword: {
    id: "flaming_sword", name: "Flammenschwert", description: "Eine Klinge, die stets in magischen Flammen brennt.",
    type: "weapon", rarity: "epic", slot: "mainhand", weight: 2.3, value: 800,
    stackable: false, maxStack: 1, requiredLevel: 12,
    stats: { attack: 20, damageType: "fire", damageBonus: 10, critChance: 0.12, runeSlots: 3 }
  },
  shadow_blade: {
    id: "shadow_blade", name: "Schattenklinge", description: "Geschmiedet aus erstarrter Dunkelheit.",
    type: "weapon", rarity: "epic", slot: "mainhand", weight: 0.8, value: 900,
    stackable: false, maxStack: 1, requiredLevel: 14, requiredClass: ["rogue"],
    stats: { attack: 18, damageType: "shadow", critChance: 0.25, critMultiplier: 3.0, runeSlots: 3 }
  },
  // ── Armor ─────────────────────────────────────────────────────
  leather_armor: {
    id: "leather_armor", name: "Lederrüstung", description: "Leichte und flexible Rüstung.",
    type: "armor", rarity: "common", slot: "chest", weight: 5.0, value: 20,
    stackable: false, maxStack: 1,
    stats: { defense: 5, runeSlots: 1 }
  },
  chain_mail: {
    id: "chain_mail", name: "Kettenhemd", description: "Mittelschwere Rüstung aus Eisenringen.",
    type: "armor", rarity: "common", slot: "chest", weight: 10.0, value: 60,
    stackable: false, maxStack: 1, requiredLevel: 3,
    stats: { defense: 10, strengthBonus: 1, runeSlots: 2 }
  },
  plate_armor: {
    id: "plate_armor", name: "Plattenrüstung", description: "Schwere Rüstung für die Front.",
    type: "armor", rarity: "uncommon", slot: "chest", weight: 18.0, value: 200,
    stackable: false, maxStack: 1, requiredLevel: 7, requiredClass: ["warrior", "cleric"],
    stats: { defense: 18, constitutionBonus: 2, runeSlots: 3 }
  },
  mage_robes: {
    id: "mage_robes", name: "Magierkutte", description: "Flüstert mit arkaner Energie.",
    type: "armor", rarity: "common", slot: "chest", weight: 1.0, value: 30,
    stackable: false, maxStack: 1,
    stats: { defense: 2, manaBonus: 30, intelligenceBonus: 2, runeSlots: 2 }
  },
  iron_helmet: {
    id: "iron_helmet", name: "Eisenhelm", description: "Schützt den Kopf zuverlässig.",
    type: "armor", rarity: "common", slot: "head", weight: 3.0, value: 25,
    stackable: false, maxStack: 1,
    stats: { defense: 4, hpBonus: 10, runeSlots: 1 }
  },
  // ── Potions ───────────────────────────────────────────────────
  health_potion: {
    id: "health_potion", name: "Heiltrank", description: "Stellt 50 Lebenspunkte wieder her.",
    type: "potion", rarity: "common", weight: 0.3, value: 15,
    stackable: true, maxStack: 10,
    effects: [{ type: "heal", value: 50 }]
  },
  greater_health_potion: {
    id: "greater_health_potion", name: "Großer Heiltrank", description: "Stellt 150 Lebenspunkte wieder her.",
    type: "potion", rarity: "uncommon", weight: 0.3, value: 50,
    stackable: true, maxStack: 5,
    effects: [{ type: "heal", value: 150 }]
  },
  mana_potion: {
    id: "mana_potion", name: "Manatrank", description: "Stellt 60 Manapunkte wieder her.",
    type: "potion", rarity: "common", weight: 0.3, value: 20,
    stackable: true, maxStack: 10,
    effects: [{ type: "restore_mana", value: 60 }]
  },
  greater_mana_potion: {
    id: "greater_mana_potion", name: "Großer Manatrank", description: "Stellt 150 Manapunkte wieder her.",
    type: "potion", rarity: "uncommon", weight: 0.3, value: 60,
    stackable: true, maxStack: 5,
    effects: [{ type: "restore_mana", value: 150 }]
  },
  antidote: {
    id: "antidote", name: "Antidot", description: "Heilt Vergiftung.",
    type: "potion", rarity: "common", weight: 0.2, value: 10,
    stackable: true, maxStack: 10,
    effects: [{ type: "antidote" }]
  },
  strength_potion: {
    id: "strength_potion", name: "Stärketrank", description: "Erhöht Stärke für 60 Ticks.",
    type: "potion", rarity: "uncommon", weight: 0.3, value: 40,
    stackable: true, maxStack: 5,
    effects: [{ type: "buff", attribute: "strength", value: 5, duration: 60 }]
  },
  // ── Ingredients (Alchemie) ────────────────────────────────────
  red_herb: {
    id: "red_herb", name: "Rotes Kraut", description: "Heilende Pflanze, findet sich in Wäldern.",
    type: "ingredient", rarity: "common", weight: 0.1, value: 3,
    stackable: true, maxStack: 20
  },
  blue_mushroom: {
    id: "blue_mushroom", name: "Blaupilz", description: "Leuchtet schwach, manahaltig.",
    type: "ingredient", rarity: "common", weight: 0.1, value: 4,
    stackable: true, maxStack: 20
  },
  cave_crystal: {
    id: "cave_crystal", name: "Höhlenkristall", description: "Fokussiert magische Energie.",
    type: "ingredient", rarity: "uncommon", weight: 0.2, value: 15,
    stackable: true, maxStack: 10
  },
  nightshade: {
    id: "nightshade", name: "Nachtschatten", description: "Hochgiftig, in Schattengebieten wachsend.",
    type: "ingredient", rarity: "uncommon", weight: 0.1, value: 8,
    stackable: true, maxStack: 10
  },
  fire_essence: {
    id: "fire_essence", name: "Feueressenz", description: "Destillierte Flamme aus Vulkankristallen.",
    type: "ingredient", rarity: "rare", weight: 0.2, value: 40,
    stackable: true, maxStack: 5
  },
  spirit_dust: {
    id: "spirit_dust", name: "Geisterstaub", description: "Sterbliche Überreste aufgelöster Geister.",
    type: "ingredient", rarity: "rare", weight: 0.1, value: 35,
    stackable: true, maxStack: 5
  },
  quiver: {
    id: "quiver", name: "Köcher", description: "Trägt Pfeile für den Bogen.",
    type: "armor", rarity: "common", slot: "offhand", weight: 0.5, value: 5,
    stackable: false, maxStack: 1
  },
  smoke_bomb: {
    id: "smoke_bomb", name: "Rauchbombe", description: "Erzeugt eine Rauchwolke zur Flucht.",
    type: "misc", rarity: "common", weight: 0.2, value: 12,
    stackable: true, maxStack: 5
  },
  holy_symbol: {
    id: "holy_symbol", name: "Heiliges Symbol", description: "Kanal für göttliche Macht.",
    type: "misc", rarity: "common", slot: "offhand", weight: 0.3, value: 15,
    stackable: false, maxStack: 1,
    stats: { wisdomBonus: 1, manaBonus: 10 }
  },
  fireball_tome: {
    id: "fireball_tome", name: "Feuerball-Zauberbuch", description: "Enthält die Formel für den Feuerball.",
    type: "misc", rarity: "common", weight: 0.5, value: 25,
    stackable: false, maxStack: 1
  },
  // ── Quest Items ───────────────────────────────────────────────
  ancient_key: {
    id: "ancient_key", name: "Uralter Schlüssel", description: "Öffnet etwas Verborgenes.",
    type: "quest", rarity: "uncommon", weight: 0.1, value: 0,
    stackable: false, maxStack: 1
  },
  dragon_scale: {
    id: "dragon_scale", name: "Drachenschuppe", description: "Schuppe eines mächtigen Drachens.",
    type: "quest", rarity: "epic", weight: 0.5, value: 500,
    stackable: false, maxStack: 1
  }
}

export function getItem(id: string): ItemDefinition | undefined {
  return ITEMS[id]
}

export function getAllItems(): ItemDefinition[] {
  return Object.values(ITEMS)
}

export function getItemsByType(type: ItemType): ItemDefinition[] {
  return Object.values(ITEMS).filter(i => i.type === type)
}
