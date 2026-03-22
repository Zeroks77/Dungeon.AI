import { GameState, Event } from "../entities/entity"

export type Effect = {
  id: string
  type: string
  targetId: string
  duration: number
  appliedTick: number
  payload: unknown
}

export function processEffects(state: GameState): Event[] {
  const expired: Event[] = []

  for (const rawEffect of state.effects) {
    const effect = rawEffect as Effect
    if (state.tick >= effect.appliedTick + effect.duration) {
      expired.push({
        id: crypto.randomUUID(),
        type: "EFFECT_EXPIRED",
        tick: state.tick,
        entity_id: effect.targetId,
        payload: { effectId: effect.id }
      })
    }
  }

  return expired
}
