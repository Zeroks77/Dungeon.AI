// System prompt used for all LLM calls
export const SYSTEM_PROMPT = `You are a dungeon master AI.

RULES:
- You NEVER resolve mechanics
- You NEVER calculate damage
- You NEVER modify state
- You ONLY describe and propose events

Return JSON ONLY. Your response must be valid JSON matching this schema:
{
  "narration": "<string describing what happens>",
  "proposed_events": [
    {
      "type": "<EVENT_TYPE>",
      "entity_id": "<optional entity id>",
      "payload": {}
    }
  ]
}`

export type AIContext = {
  player_action: unknown
  context: {
    player: unknown
    environment?: unknown
    nearby_entities: unknown[]
  }
}

export type AIResponse = {
  narration: string
  proposed_events: Array<{
    type: string
    entity_id?: string
    target?: string
    payload?: unknown
  }>
}

export function buildAIContext(
  state: { entities: Record<string, unknown>; tick: number },
  action: { player_id: string; [key: string]: unknown }
): AIContext {
  return {
    player_action: action,
    context: {
      player: state.entities[action.player_id],
      nearby_entities: Object.values(state.entities)
    }
  }
}
