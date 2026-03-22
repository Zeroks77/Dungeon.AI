export type Health = {
  hp: number
  maxHp: number
}

export function isDead(health: Health): boolean {
  return health.hp <= 0
}

export function applyDamage(health: Health, amount: number): Health {
  return { ...health, hp: Math.max(0, health.hp - amount) }
}

export function applyHeal(health: Health, amount: number): Health {
  return { ...health, hp: Math.min(health.maxHp, health.hp + amount) }
}
