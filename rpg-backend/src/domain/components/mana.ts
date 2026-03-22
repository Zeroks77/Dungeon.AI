// Mana component — for spellcasting classes

export type Mana = {
  mp: number
  maxMp: number
  regenPerTick: number    // mana regenerated each tick
}

export function createMana(maxMp: number): Mana {
  return { mp: maxMp, maxMp, regenPerTick: Math.max(1, Math.floor(maxMp / 100)) }
}

export function useMana(mana: Mana, amount: number): Mana | null {
  if (mana.mp < amount) return null   // not enough mana
  return { ...mana, mp: mana.mp - amount }
}

export function regenMana(mana: Mana): Mana {
  return { ...mana, mp: Math.min(mana.maxMp, mana.mp + mana.regenPerTick) }
}

export function hasMana(mana: Mana, amount: number): boolean {
  return mana.mp >= amount
}
