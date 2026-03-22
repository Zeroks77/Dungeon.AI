// Deterministic hash utilities

export function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i)
    h |= 0
  }
  return h >>> 0
}

export function hashGameSeed(tick: number, entityId: string, salt = ""): string {
  return `${tick}-${entityId}-${salt}`
}
