export type Combat = {
  attack: number
  defense: number
}

export function calculateDamage(attacker: Combat, defender: Combat): number {
  const raw = attacker.attack - defender.defense
  return Math.max(1, raw)
}
