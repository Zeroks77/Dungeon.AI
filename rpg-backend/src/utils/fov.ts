import { GameState, Entity } from "../domain/entities/entity"
import { hexDistance, Position } from "../domain/components/position"

// Symmetric shadowcasting FOV for hex grids
// Uses ray-casting from observer to each candidate tile
export function computeFOV(
  pos: Position,
  radius: number,
  state: GameState
): Entity[] {
  return Object.values(state.entities).filter((entity) => {
    const entityPos = entity.components.position as Position | undefined
    if (!entityPos) return false
    if (hexDistance(pos, entityPos) > radius) return false
    return hasLineOfSight(pos, entityPos, state)
  })
}

// Cast a ray from `from` to `to`, checking each tile along the way for opaqueness
export function hasLineOfSight(
  from: Position,
  to: Position,
  state: GameState
): boolean {
  const steps = hexDistance(from, to)
  if (steps === 0) return true

  for (let i = 1; i < steps; i++) {
    const t = i / steps
    // Linearly interpolate in cube coordinates
    const q = Math.round(lerp(from.q, to.q, t))
    const r = Math.round(lerp(from.r, to.r, t))
    if (!isTileTransparent(q, r, state)) return false
  }

  return true
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function isTileTransparent(q: number, r: number, state: GameState): boolean {
  // Check world tiles for transparency
  if (state.worldTiles) {
    const key = `${q},${r}`
    const tile = state.worldTiles[key]
    if (tile) return tile.transparent
  }
  // Default: transparent (open world)
  return true
}

export function getVisibleTileKeys(
  pos: Position,
  radius: number,
  state: GameState
): Set<string> {
  const visible = new Set<string>()
  const rng = radius

  // Check all tiles within radius
  for (let dq = -rng; dq <= rng; dq++) {
    const r1 = Math.max(-rng, -dq - rng)
    const r2 = Math.min(rng, -dq + rng)
    for (let dr = r1; dr <= r2; dr++) {
      const candidate: Position = { q: pos.q + dq, r: pos.r + dr }
      if (hasLineOfSight(pos, candidate, state)) {
        visible.add(`${candidate.q},${candidate.r}`)
      }
    }
  }

  return visible
}
