import { ActionRequest, Event, GameState } from "../domain/entities/entity"
import { appendEvents } from "../infrastructure/eventStore/eventStore"
import { applyEvents } from "../domain/events/applyEvent"
import { validateAction, validateEvent } from "./validation"
import { buildAIContext } from "../ai/prompts"
import { callLLM } from "../ai/llmClient"
import { processCombat } from "../domain/systems/combatSystem"
import { processCastSpell } from "../domain/systems/spellSystem"
import { processUseItem, processEquipItem, processUnequipItem } from "../domain/systems/itemSystem"
import { processBuyItem, processSellItem } from "../domain/systems/economySystem"
import { processCraftItem } from "../domain/systems/alchemySystem"
import { processEngraveRune } from "../domain/systems/runeSystem"
import { processReputationChange } from "../domain/systems/factionSystem"
import { processGainXP, getXPReward } from "../domain/systems/progressionSystem"
import { processQuestProgress } from "../domain/systems/questSystem"
import { processTalk, processDialogueChoice } from "../domain/systems/dialogueSystem"
import { processForage } from "../domain/systems/forageSystem"
import { loadStateForSession } from "./sessionState"

export function derivePlayerEvents(action: ActionRequest, tick: number): Event[] {
  switch (action.type) {
    case "MOVE":
      return [
        {
          id: crypto.randomUUID(),
          type: "PLAYER_MOVED",
          tick,
          entity_id: action.player_id,
          payload: { to: action.target }
        }
      ]

    case "ATTACK":
      return [
        {
          id: crypto.randomUUID(),
          type: "ATTACK_ATTEMPT",
          tick,
          entity_id: action.player_id,
          payload: { target: action.target }
        }
      ]

    case "CAST_SPELL":
      return [
        {
          id: crypto.randomUUID(),
          type: "CAST_SPELL",
          tick,
          entity_id: action.player_id,
          payload: {
            spell_id: action.spell_id,
            target_id: action.target,
            target_q: (action.target_pos as { q?: number } | undefined)?.q,
            target_r: (action.target_pos as { r?: number } | undefined)?.r
          }
        }
      ]

    case "USE_ITEM":
      return [
        {
          id: crypto.randomUUID(),
          type: "USE_ITEM",
          tick,
          entity_id: action.player_id,
          payload: { item_id: action.item_id, target_id: action.target }
        }
      ]

    case "EQUIP_ITEM":
      return [
        {
          id: crypto.randomUUID(),
          type: "EQUIP_ITEM",
          tick,
          entity_id: action.player_id,
          payload: { item_id: action.item_id, slot: action.slot }
        }
      ]

    case "UNEQUIP_ITEM":
      return [
        {
          id: crypto.randomUUID(),
          type: "UNEQUIP_ITEM",
          tick,
          entity_id: action.player_id,
          payload: { slot: action.slot }
        }
      ]

    case "BUY_ITEM":
      return [
        {
          id: crypto.randomUUID(),
          type: "BUY_ITEM",
          tick,
          entity_id: action.player_id,
          payload: { item_id: action.item_id, merchant_id: action.merchant_id, quantity: action.quantity ?? 1 }
        }
      ]

    case "SELL_ITEM":
      return [
        {
          id: crypto.randomUUID(),
          type: "SELL_ITEM",
          tick,
          entity_id: action.player_id,
          payload: { item_id: action.item_id, merchant_id: action.merchant_id, quantity: action.quantity ?? 1 }
        }
      ]

    case "CRAFT_ITEM":
      return [
        {
          id: crypto.randomUUID(),
          type: "CRAFT_ITEM",
          tick,
          entity_id: action.player_id,
          payload: { recipe_id: action.recipe_id }
        }
      ]

    case "ENGRAVE_RUNE":
      return [
        {
          id: crypto.randomUUID(),
          type: "ENGRAVE_RUNE",
          tick,
          entity_id: action.player_id,
          payload: { rune_id: action.rune_id, slot: action.slot }
        }
      ]

    case "TALK":
      return [
        {
          id: crypto.randomUUID(),
          type: "DIALOGUE_STARTED",
          tick,
          entity_id: action.player_id,
          payload: { player_id: action.player_id, npc_id: action.target }
        }
      ]

    case "DIALOGUE_CHOICE":
      return [
        {
          id: crypto.randomUUID(),
          type: "DIALOGUE_CHOICE",
          tick,
          entity_id: action.player_id,
          payload: {
            npc_id: action.npc_id,
            dialogue_tree_id: action.dialogue_tree_id,
            node_id: action.node_id,
            option_id: action.option_id
          }
        }
      ]

    case "FORAGE":
      return [
        {
          id: crypto.randomUUID(),
          type: "FORAGE",
          tick,
          entity_id: action.player_id,
          payload: { player_id: action.player_id }
        }
      ]

    case "CREATE_PLAYER":
      return [
        {
          id: crypto.randomUUID(),
          type: "PLAYER_SPAWNED",
          tick,
          entity_id: action.player_id,
          payload: {
            player_id: action.player_id,
            class_id: action.class_id as string,
            race_id: action.race_id as string,
            position: { q: 0, r: 0 }
          }
        }
      ]

    default:
      return []
  }
}

// Resolve mechanical consequences of primary events (combat, spells, items, etc.)
function resolveMechanics(state: GameState, primaryEvents: Event[]): Event[] {
  const derived: Event[] = []
  for (const evt of primaryEvents) {
    derived.push(...processCombat(state, evt))
    derived.push(...processCastSpell(state, evt))
    derived.push(...processUseItem(state, evt))
    derived.push(...processEquipItem(state, evt))
    derived.push(...processUnequipItem(state, evt))
    derived.push(...processBuyItem(state, evt))
    derived.push(...processSellItem(state, evt))
    derived.push(...processCraftItem(state, evt))
    derived.push(...processEngraveRune(state, evt))
    derived.push(...processReputationChange(state, evt))
    derived.push(...processGainXP(state, evt))
    derived.push(...processQuestProgress(state, evt))
    derived.push(...processTalk(state, evt))
    derived.push(...processDialogueChoice(state, evt))
    derived.push(...processForage(state, evt))
  }

  // Award XP when an entity dies
  for (const evt of primaryEvents) {
    if (evt.type === "ENTITY_DIED") {
      const dead = state.entities[(evt.payload as { entity_id: string }).entity_id]
      if (dead && dead.type === "npc") {
        const xp = getXPReward(dead, state.tick)
        // killed_by field contains who killed the entity
        const killerId = (evt.payload as { killed_by?: string }).killed_by ?? evt.entity_id
        if (killerId) {
          derived.push({
            id: crypto.randomUUID(),
            type: "XP_GAINED",
            tick: state.tick,
            entity_id: killerId,
            payload: { entity_id: killerId, amount: xp }
          })
        }
      }
    }
  }

  // Generate PLAYER_RESPAWNED for any ENTITY_DIED targeting a player (from derived events)
  const derivedSnapshot = [...derived]
  for (const evt of derivedSnapshot) {
    if (evt.type === "ENTITY_DIED") {
      const deadId = (evt.payload as { entity_id: string }).entity_id
      const dead = state.entities[deadId]
      if (dead?.type === "player") {
        derived.push({
          id: crypto.randomUUID(),
          type: "PLAYER_RESPAWNED",
          tick: state.tick,
          entity_id: dead.id,
          payload: { entity_id: dead.id, position: { q: 0, r: 0 } }
        })
      }
    }
  }

  return derived
}

// processAction now accepts an optional pre-loaded state for efficiency (game loop usage)
export async function processAction(
  actionRequest: ActionRequest,
  existingState?: GameState
): Promise<{
  events: Event[]
  narration: string
  state: GameState
}> {
  let state = existingState

  if (!state) {
    if (!actionRequest.session_id) {
      throw new Error("SESSION_ID_REQUIRED")
    }

    state = await loadStateForSession(actionRequest.session_id)
  }

  state.sessionId = state.sessionId ?? actionRequest.session_id

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

  const primaryEvents = [...playerEvents, ...aiEvents]
  const validPrimary = primaryEvents.filter(validateEvent)

  // Apply primary events to get updated state for mechanical resolution
  applyEvents(state, validPrimary)

  // Resolve mechanical consequences
  const mechanicalEvents = resolveMechanics(state, validPrimary)
  const validMechanical = mechanicalEvents.filter(validateEvent)

  applyEvents(state, validMechanical)

  const allValid = [...validPrimary, ...validMechanical]
  if (!state.sessionId) {
    throw new Error("SESSION_ID_REQUIRED")
  }

  await appendEvents(allValid, state.sessionId)

  return {
    events: allValid,
    narration: aiResponse.narration,
    state
  }
}
