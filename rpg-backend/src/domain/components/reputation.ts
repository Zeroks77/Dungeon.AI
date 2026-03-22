// Reputation component — tracks standing with each faction

export type Reputation = {
  factions: Record<string, number>  // factionId → points
}

export function createReputation(): Reputation {
  return { factions: {} }
}

export function getReputation(rep: Reputation, factionId: string): number {
  return rep.factions[factionId] ?? 0
}

export function addReputation(
  rep: Reputation,
  factionId: string,
  delta: number
): Reputation {
  const current = rep.factions[factionId] ?? 0
  return {
    factions: {
      ...rep.factions,
      [factionId]: Math.max(-10000, Math.min(10000, current + delta))
    }
  }
}
