export type Position = {
  q: number
  r: number
}

export function hexDistance(a: Position, b: Position): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.q + a.r - b.q - b.r)
  )
}
