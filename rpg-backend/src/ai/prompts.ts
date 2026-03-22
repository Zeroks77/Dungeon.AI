// System prompt used for all LLM calls
export const SYSTEM_PROMPT = `You are a dungeon master AI for a fantasy RPG.

RULES:
- You NEVER resolve mechanics (damage calculation, HP changes, XP math)
- You NEVER modify state directly
- You ONLY describe what happens narratively and propose events

You may propose these event types in proposed_events:
- ATTACK_ATTEMPT: { target: "<entity_id>" }
- CAST_SPELL: { spell_id: "<id>", target_id: "<entity_id>" }
- EFFECT_APPLIED: { effect: { id, type, targetId, duration, appliedTick, payload } }
- DIALOGUE_STARTED: { player_id, npc_id }
- NPC_MOVED: { to: { q, r } } (with entity_id set)
- QUEST_STARTED: { entity_id, quest_id, objectives: [] }
- REPUTATION_CHANGED: { entity_id, faction_id, delta: <number> }

NEVER propose DAMAGE_APPLIED, HEAL_APPLIED, GOLD_CHANGED, LEVEL_UP, or XP_GAINED — those are mechanically resolved.

Return ONLY valid JSON:
{
  "narration": "<atmospheric description>",
  "proposed_events": [...]
}`

export type AIContext = {
  player_action: unknown
  context: {
    player: unknown
    environment?: unknown
    nearby_entities: unknown[]
    world_tile?: unknown
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
  const player = state.entities[action.player_id] as {
    components?: {
      position?: { q: number; r: number }
      health?: unknown
      mana?: unknown
      character?: unknown
      equipment?: unknown
    }
  } | undefined

  // Nearby entities: filter by rough distance (only expose relevant ones to LLM)
  const playerPos = player?.components?.position
  const nearbyEntities = Object.values(state.entities).filter(e => {
    if ((e as { id: string }).id === action.player_id) return false
    const ePos = (e as { components?: { position?: { q: number; r: number } } }).components?.position
    if (!ePos || !playerPos) return true
    const dist = Math.max(
      Math.abs(ePos.q - playerPos.q),
      Math.abs(ePos.r - playerPos.r),
      Math.abs(ePos.q + ePos.r - playerPos.q - playerPos.r)
    )
    return dist <= 8
  })

  return {
    player_action: action,
    context: {
      player: player ? {
        position: player.components?.position,
        health: player.components?.health,
        mana: player.components?.mana,
        character: player.components?.character
      } : undefined,
      nearby_entities: nearbyEntities.map(e => {
        const entity = e as { id: string; type: string; components?: { position?: unknown; health?: unknown; behavior?: unknown } }
        return {
          id: entity.id,
          type: entity.type,
          position: entity.components?.position,
          health: entity.components?.health,
          behavior: entity.components?.behavior
        }
      })
    }
  }
}
