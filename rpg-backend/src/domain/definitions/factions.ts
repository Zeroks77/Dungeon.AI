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
      { factionId: "shadow_guild", disposition: -80 },
      { factionId: "merchants_league", disposition: 40 },
      { factionId: "forest_druids", disposition: 0 },
      { factionId: "orcish_horde", disposition: -60 }
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
      { factionId: "iron_crown", disposition: -80 },
      { factionId: "merchants_league", disposition: -20 },
      { factionId: "forest_druids", disposition: 10 },
      { factionId: "orcish_horde", disposition: -30 }
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
      { factionId: "iron_crown", disposition: 40 },
      { factionId: "shadow_guild", disposition: -20 },
      { factionId: "forest_druids", disposition: 20 },
      { factionId: "orcish_horde", disposition: -40 }
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
      { factionId: "iron_crown", disposition: 0 },
      { factionId: "shadow_guild", disposition: 10 },
      { factionId: "merchants_league", disposition: 20 },
      { factionId: "orcish_horde", disposition: -20 }
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
      { factionId: "iron_crown", disposition: -60 },
      { factionId: "shadow_guild", disposition: -30 },
      { factionId: "merchants_league", disposition: -40 },
      { factionId: "forest_druids", disposition: -20 }
    ],
    capital: "stronghold_peaks",
    color: "#8B0000",
    reputationThresholds: { hostile: -500, unfriendly: -100, neutral: 0, friendly: 500, honored: 2000, exalted: 5000 },
    rewards: {
      friendly: ["iron_sword", "leather_armor"],
      honored: ["mace", "plate_armor"],
      exalted: ["ancient_key"]
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
