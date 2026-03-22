// Deterministic seeded random number generator

export function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i)
  }

  return () => {
    h = Math.imul(1664525, h) + 1013904223
    return (h >>> 0) / 4294967296
  }
}

export function rollDice(formula: string, seed: string): number {
  const rng = seededRandom(seed)
  const parts = formula.split("d")
  const count = parseInt(parts[0], 10)
  const sides = parseInt(parts[1], 10)

  if (isNaN(count) || isNaN(sides) || count < 1 || sides < 1) {
    throw new Error(`Invalid dice formula: ${formula}`)
  }

  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(rng() * sides) + 1
  }

  return total
}
