import { GameState, Entity } from "../entities/entity"
import { computeFOV } from "../../utils/fov"

export function getVisibleEntities(
  observerId: string,
  state: GameState,
  radius = 5
): Entity[] {
  const observer = state.entities[observerId]
  if (!observer) return []

  const pos = observer.components.position as { q: number; r: number }
  return computeFOV(pos, radius, state)
}
