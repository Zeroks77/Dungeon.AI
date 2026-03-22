import { ActionRequest, Event, GameState } from "../domain/entities/entity"
import {
  loadLatestSnapshot
} from "../infrastructure/eventStore/snapshotStore"
import { loadEvents, appendEvents } from "../infrastructure/eventStore/eventStore"
import { buildState, applyEvents } from "../domain/events/applyEvent"
import { validateAction, validateEvent } from "./validation"
import { buildAIContext } from "../ai/prompts"
import { callLLM } from "../ai/llmClient"

export function derivePlayerEvents(action: ActionRequest, tick: number): Event[] {
  switch (action.type) {
    case "MOVE":
      return [
        {
          id: crypto.randomUUID(),
          type: "PLAYER_MOVED",
          tick,
          entity_id: action.player_id,
          payload: {
            to: action.target
          }
        }
      ]

    default:
      return []
  }
}

export async function processAction(actionRequest: ActionRequest): Promise<{
  events: Event[]
  narration: string
}> {
  const snapshot = await loadLatestSnapshot()

  const baseState: GameState = snapshot ?? {
    tick: 0,
    entities: {},
    effects: []
  }

  const events = await loadEvents(baseState.tick)
  const state = buildState(baseState, events)

  validateAction(actionRequest, state)

  const context = buildAIContext(state, actionRequest)

  const aiResponse = await callLLM(context)

  const tick = state.tick + 1

  const playerEvents = derivePlayerEvents(actionRequest, tick)

  const aiEvents: Event[] = aiResponse.proposed_events.map((e) => ({
    id: crypto.randomUUID(),
    type: e.type,
    tick,
    entity_id: e.entity_id,
    payload: e.payload ?? (e.target ? { target: e.target } : {})
  }))

  const eventsToApply = [...playerEvents, ...aiEvents]
  const valid = eventsToApply.filter(validateEvent)

  applyEvents(state, valid)

  await appendEvents(valid)

  return {
    events: valid,
    narration: aiResponse.narration
  }
}
