import { GameState } from "../domain/entities/entity"
import { Position } from "../domain/components/position"

export function findPath(
  start: Position,
  target: Position,
  // TODO: use state for terrain/collision checking once map data is available
  _state: GameState
): Position[] {
  // Simplified A* for hex grids — moves one step at a time toward target
  if (start.q === target.q && start.r === target.r) {
    return [start]
  }

  const path: Position[] = [start]
  let current = { ...start }

  const maxSteps = 50
  let steps = 0

  while ((current.q !== target.q || current.r !== target.r) && steps < maxSteps) {
    const dq = target.q - current.q
    const dr = target.r - current.r

    const next: Position = {
      q: current.q + Math.sign(dq),
      r: current.r + Math.sign(dr)
    }

    path.push(next)
    current = next
    steps++
  }

  return path
}
