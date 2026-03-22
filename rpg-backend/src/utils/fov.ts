import { GameState, Entity } from "../domain/entities/entity"
import { hexDistance, Position } from "../domain/components/position"

export function computeFOV(
  pos: Position,
  radius: number,
  state: GameState
): Entity[] {
  return Object.values(state.entities).filter((entity) => {
    const entityPos = entity.components.position as Position | undefined
    if (!entityPos) return false

    return hexDistance(pos, entityPos) <= radius
  })
}
