import { buildState } from "../domain/events/applyEvent"
import { GameState } from "../domain/entities/entity"
import { loadEvents } from "../infrastructure/eventStore/eventStore"
import { loadLatestSnapshot } from "../infrastructure/eventStore/snapshotStore"

export async function loadStateForSession(sessionId: string): Promise<GameState> {
  const snapshot = await loadLatestSnapshot(sessionId)
  const baseState: GameState = snapshot ?? {
    tick: 0,
    entities: {},
    effects: [],
    sessionId,
    weather: "clear",
    timeOfDay: 8
  }
  const events = await loadEvents(baseState.tick, sessionId)
  const state = buildState(baseState, events)
  state.sessionId = sessionId
  return state
}