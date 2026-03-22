// Faction and politics definitions

export type FactionAlignment = "lawful" | "neutral" | "chaotic"
export type FactionType = "kingdom" | "guild" | "cult" | "clan" | "merchant" | "druidic"

export type FactionRelation = {
  factionId: string
  disposition: number   // -100 (war) to 100 (alliance)
}

export type Faction = {
  id: string
  name: string
  description: string
  type: FactionType
  alignment: FactionAlignment
  relations: FactionRelation[]
  capital?: string          // world tile id of faction's capital
  color: string             // display color (hex)
  reputationThresholds: {
    hostile: number         // below this = hostile
    unfriendly: number
    neutral: number
    friendly: number
    honored: number
    exalted: number         // above this = exalted
  }
  rewards: {
    friendly: string[]      // item IDs unlocked at friendly
    honored: string[]       // item IDs unlocked at honored
    exalted: string[]       // item IDs unlocked at exalted
  }
}

export const FACTIONS: Record<string, Faction> = {
  iron_crown: {
    id: "iron_crown",
    name: "Eiserne Krone",
    description: "Das herrschende Königreich, ordnungsliebend und mächtig.",
    type: "kingdom",
    alignment: "lawful",
    relations: [
      { factionId: "shadow_guild",    disposition: -80 },
      { factionId: "merchants_league",disposition: 40 },
      { factionId: "forest_druids",   disposition: 0 },
      { factionId: "orcish_horde",    disposition: -60 },
      { factionId: "arcane_circle",   disposition: 30 },
      { factionId: "undead_covenant", disposition: -90 },
      { factionId: "mountain_clans",  disposition: 20 },
      { factionId: "sea_brotherhood", disposition: -50 },
      { factionId: "church_of_light", disposition: 70 }
    ],
    capital: "capital_city",
    color: "#C0C0C0",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["iron_sword", "chain_mail"],
      honored: ["steel_sword", "plate_armor"],
      exalted: ["flaming_sword"]
    }
  },
  shadow_guild: {
    id: "shadow_guild",
    name: "Schattengilde",
    description: "Ein verdecktes Netzwerk von Meuchelmördern und Informationshändlern.",
    type: "guild",
    alignment: "chaotic",
    relations: [
      { factionId: "iron_crown",      disposition: -80 },
      { factionId: "merchants_league",disposition: -20 },
      { factionId: "forest_druids",   disposition: 10 },
      { factionId: "orcish_horde",    disposition: -30 },
      { factionId: "arcane_circle",   disposition: -10 },
      { factionId: "undead_covenant", disposition: 20 },
      { factionId: "mountain_clans",  disposition: -20 },
      { factionId: "sea_brotherhood", disposition: 50 },
      { factionId: "church_of_light", disposition: -70 }
    ],
    capital: "shadow_haven",
    color: "#2D2D2D",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["dagger", "smoke_bomb"],
      honored: ["shadow_blade"],
      exalted: ["shadow_blade"]
    }
  },
  merchants_league: {
    id: "merchants_league",
    name: "Händlerliga",
    description: "Mächtige Handelsgilde, die die Wirtschaft des Landes kontrolliert.",
    type: "merchant",
    alignment: "neutral",
    relations: [
      { factionId: "iron_crown",      disposition: 40 },
      { factionId: "shadow_guild",    disposition: -20 },
      { factionId: "forest_druids",   disposition: 20 },
      { factionId: "orcish_horde",    disposition: -40 },
      { factionId: "arcane_circle",   disposition: 30 },
      { factionId: "undead_covenant", disposition: -60 },
      { factionId: "mountain_clans",  disposition: 50 },
      { factionId: "sea_brotherhood", disposition: 10 },
      { factionId: "church_of_light", disposition: 20 }
    ],
    capital: "market_city",
    color: "#FFD700",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["health_potion", "mana_potion"],
      honored: ["greater_health_potion", "greater_mana_potion"],
      exalted: ["arcane_staff"]
    }
  },
  forest_druids: {
    id: "forest_druids",
    name: "Walddruidenorden",
    description: "Hüter des Waldes, im Einklang mit der Natur.",
    type: "druidic",
    alignment: "neutral",
    relations: [
      { factionId: "iron_crown",      disposition: 0 },
      { factionId: "shadow_guild",    disposition: 10 },
      { factionId: "merchants_league",disposition: 20 },
      { factionId: "orcish_horde",    disposition: -20 },
      { factionId: "arcane_circle",   disposition: -10 },
      { factionId: "undead_covenant", disposition: -50 },
      { factionId: "mountain_clans",  disposition: 10 },
      { factionId: "sea_brotherhood", disposition: 0 },
      { factionId: "church_of_light", disposition: 30 }
    ],
    capital: "ancient_grove",
    color: "#228B22",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["red_herb", "blue_mushroom"],
      honored: ["short_bow", "strength_potion"],
      exalted: ["animal_companion"]
    }
  },
  orcish_horde: {
    id: "orcish_horde",
    name: "Ork-Horde",
    description: "Ein kriegerischer Stammesbund aus den östlichen Steppen.",
    type: "clan",
    alignment: "chaotic",
    relations: [
      { factionId: "iron_crown",      disposition: -60 },
      { factionId: "shadow_guild",    disposition: -30 },
      { factionId: "merchants_league",disposition: -40 },
      { factionId: "forest_druids",   disposition: -20 },
      { factionId: "arcane_circle",   disposition: -40 },
      { factionId: "undead_covenant", disposition: -10 },
      { factionId: "mountain_clans",  disposition: -50 },
      { factionId: "sea_brotherhood", disposition: 20 },
      { factionId: "church_of_light", disposition: -70 }
    ],
    capital: "stronghold_peaks",
    color: "#8B0000",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["iron_sword", "leather_armor"],
      honored: ["mace", "plate_armor"],
      exalted: ["ancient_key"]
    }
  },

  // ── Neue Fraktionen ─────────────────────────────────────────────────────────
  arcane_circle: {
    id: "arcane_circle",
    name: "Arkaner Zirkel",
    description: "Eine mächtige Magiergilde und Universität, die arkanes Wissen erforscht und eifersüchtig bewacht. Neutral gegenüber weltlichen Konflikten, solange das Studium ungestört bleibt.",
    type: "guild",
    alignment: "neutral",
    relations: [
      { factionId: "iron_crown",      disposition: 30 },
      { factionId: "shadow_guild",    disposition: -10 },
      { factionId: "merchants_league",disposition: 30 },
      { factionId: "forest_druids",   disposition: -10 },
      { factionId: "orcish_horde",    disposition: -40 },
      { factionId: "undead_covenant", disposition: -30 },
      { factionId: "mountain_clans",  disposition: 10 },
      { factionId: "sea_brotherhood", disposition: -20 },
      { factionId: "church_of_light", disposition: -20 }
    ],
    capital: "arcane_tower",
    color: "#7B2FBE",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["spell_tome_basic", "runestone"],
      honored: ["spell_tome_advanced", "arcane_staff"],
      exalted: ["spell_tome_master"]
    }
  },
  undead_covenant: {
    id: "undead_covenant",
    name: "Untotenkonvent",
    description: "Ein finsterer Nekromantenkultbund, der den Tod selbst als Werkzeug begreift. Feind der Eisernen Krone und der Heiligen Kirche gleichermaßen.",
    type: "cult",
    alignment: "chaotic",
    relations: [
      { factionId: "iron_crown",      disposition: -90 },
      { factionId: "shadow_guild",    disposition: 20 },
      { factionId: "merchants_league",disposition: -60 },
      { factionId: "forest_druids",   disposition: -50 },
      { factionId: "orcish_horde",    disposition: -10 },
      { factionId: "arcane_circle",   disposition: -30 },
      { factionId: "mountain_clans",  disposition: -70 },
      { factionId: "sea_brotherhood", disposition: 10 },
      { factionId: "church_of_light", disposition: -100 }
    ],
    capital: "necropolis",
    color: "#4A0E4E",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["death_essence", "bone_charm"],
      honored: ["necrotic_tome", "soul_binding_ritual"],
      exalted: ["death_magic_grimoire"]
    }
  },
  mountain_clans: {
    id: "mountain_clans",
    name: "Bergklans",
    description: "Die Zwergenstämme der nördlichen Berge — hervorragende Schmiede und stolze Krieger, die ihre Unabhängigkeit gegenüber jedem Königreich verteidigen.",
    type: "clan",
    alignment: "lawful",
    relations: [
      { factionId: "iron_crown",      disposition: 20 },
      { factionId: "shadow_guild",    disposition: -20 },
      { factionId: "merchants_league",disposition: 50 },
      { factionId: "forest_druids",   disposition: 10 },
      { factionId: "orcish_horde",    disposition: -50 },
      { factionId: "arcane_circle",   disposition: 10 },
      { factionId: "undead_covenant", disposition: -70 },
      { factionId: "sea_brotherhood", disposition: -30 },
      { factionId: "church_of_light", disposition: 40 }
    ],
    capital: "ironpeak_hold",
    color: "#8B6914",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["steel_ingot", "iron_pickaxe"],
      honored: ["masterwork_axe", "dwarven_shield"],
      exalted: ["masterwork_plate_armor"]
    }
  },
  sea_brotherhood: {
    id: "sea_brotherhood",
    name: "Seebruderschaft",
    description: "Ein berüchtigter Piratenbund und Schmugglernetzwerk, das die Küstenhäfen und Handelswege auf See kontrolliert. Niemand segelt ohne ihre Erlaubnis.",
    type: "guild",
    alignment: "chaotic",
    relations: [
      { factionId: "iron_crown",      disposition: -50 },
      { factionId: "shadow_guild",    disposition: 50 },
      { factionId: "merchants_league",disposition: 10 },
      { factionId: "forest_druids",   disposition: 0 },
      { factionId: "orcish_horde",    disposition: 20 },
      { factionId: "arcane_circle",   disposition: -20 },
      { factionId: "undead_covenant", disposition: 10 },
      { factionId: "mountain_clans",  disposition: -30 },
      { factionId: "church_of_light", disposition: -60 }
    ],
    capital: "port_haven",
    color: "#1A6B8A",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["smuggled_goods", "sailor_knife"],
      honored: ["exotic_spice", "corsair_blade"],
      exalted: ["sea_chart_legendary"]
    }
  },
  church_of_light: {
    id: "church_of_light",
    name: "Kirche des Lichts",
    description: "Die Heilige Kirche des Lichts verbreitet Glauben und Ordnung im ganzen Land. Erbitterter Feind des Untotenkonvents und der Schattengilde — das Licht duldet keine Schatten.",
    type: "kingdom",
    alignment: "lawful",
    relations: [
      { factionId: "iron_crown",      disposition: 70 },
      { factionId: "shadow_guild",    disposition: -70 },
      { factionId: "merchants_league",disposition: 20 },
      { factionId: "forest_druids",   disposition: 30 },
      { factionId: "orcish_horde",    disposition: -70 },
      { factionId: "arcane_circle",   disposition: -20 },
      { factionId: "undead_covenant", disposition: -100 },
      { factionId: "mountain_clans",  disposition: 40 },
      { factionId: "sea_brotherhood", disposition: -60 }
    ],
    capital: "sanctum_city",
    color: "#F5E642",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["holy_water", "blessed_shield"],
      honored: ["paladin_sword", "holy_tome"],
      exalted: ["sacred_artifact"]
    }
  }
}

export type ReputationStanding =
  | "hostile"
  | "unfriendly"
  | "neutral"
  | "friendly"
  | "honored"
  | "exalted"

export function getReputationStanding(
  factionId: string,
  points: number
): ReputationStanding {
  const faction = FACTIONS[factionId]
  if (!faction) return "neutral"
  if (points < -500) return "hostile"
  if (points < 0) return "unfriendly"
  if (points < 500) return "neutral"
  if (points < 2000) return "friendly"
  if (points < 5000) return "honored"
  return "exalted"
}

export function getFaction(id: string): Faction | undefined {
  return FACTIONS[id]
}

export function getAllFactions(): Faction[] {
  return Object.values(FACTIONS)
}

export function getRelationDisposition(factionA: string, factionB: string): number {
  const faction = FACTIONS[factionA]
  if (!faction) return 0
  return faction.relations.find(r => r.factionId === factionB)?.disposition ?? 0
}
