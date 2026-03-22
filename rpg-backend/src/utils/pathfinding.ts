import { GameState } from "../domain/entities/entity"
import { Position } from "../domain/components/position"
import { WorldMap, isPassable, getMovementCost } from "../domain/world/worldGen"

// Hex neighbor directions (flat-top axial)
const HEX_DIRS: Position[] = [
  { q: 1, r: 0 }, { q: -1, r: 0 },
  { q: 0, r: 1 }, { q: 0, r: -1 },
  { q: 1, r: -1 }, { q: -1, r: 1 }
]

function posKey(p: Position): string {
  return `${p.q},${p.r}`
}

function hexDist(a: Position, b: Position): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.q + a.r - b.q - b.r)
  )
}

// A* pathfinding with optional terrain awareness via WorldMap
export function findPath(
  start: Position,
  target: Position,
  _state: GameState,
  world?: WorldMap
): Position[] {
  if (start.q === target.q && start.r === target.r) {
    return [start]
  }

  type Node = { pos: Position; g: number; f: number }
  const open = new Map<string, Node>()
  const closed = new Set<string>()
  const cameFrom = new Map<string, string>()

  const startKey = posKey(start)
  open.set(startKey, { pos: start, g: 0, f: hexDist(start, target) })

  const MAX_ITERATIONS = 500
  let iterations = 0

  while (open.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++

    // Pick node with lowest f
    let currentKey = ""
    let lowestF = Infinity
    for (const [key, node] of open) {
      if (node.f < lowestF) {
        lowestF = node.f
        currentKey = key
      }
    }

    const current = open.get(currentKey)!
    open.delete(currentKey)
    closed.add(currentKey)

    if (currentKey === posKey(target)) {
      // Reconstruct path
      const path: Position[] = []
      let k: string | null = currentKey
      while (k) {
        const parts = k.split(",").map(Number)
        path.unshift({ q: parts[0], r: parts[1] })
        k = cameFrom.get(k) ?? null
      }
      return path
    }

    for (const dir of HEX_DIRS) {
      const neighbor: Position = { q: current.pos.q + dir.q, r: current.pos.r + dir.r }
      const neighborKey = posKey(neighbor)

      if (closed.has(neighborKey)) continue

      // Terrain passability check
      if (world && !isPassable(world, neighbor.q, neighbor.r)) continue

      const moveCost = world ? getMovementCost(world, neighbor.q, neighbor.r) : 1
      const tentativeG = current.g + moveCost

      const existing = open.get(neighborKey)
      if (!existing || tentativeG < existing.g) {
        cameFrom.set(neighborKey, currentKey)
        open.set(neighborKey, {
          pos: neighbor,
          g: tentativeG,
          f: tentativeG + hexDist(neighbor, target)
        })
      }
    }
  }

  // No path found — return single step toward target
  const dq = target.q - start.q
  const dr = target.r - start.r
  return [start, { q: start.q + Math.sign(dq), r: start.r + Math.sign(dr) }]
}
