import { ActionRequest, Event, GameState } from "../domain/entities/entity"
import {
  loadLatestSnapshot
} from "../infrastructure/eventStore/snapshotStore"
import { loadEvents, appendEvents } from "../infrastructure/eventStore/eventStore"
import { buildState, applyEvents } from "../domain/events/applyEvent"
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
  }

  // Award XP when an entity dies
  for (const evt of primaryEvents) {
    if (evt.type === "ENTITY_DIED") {
      const dead = state.entities[(evt.payload as { entity_id: string }).entity_id]
      if (dead && dead.type === "npc") {
        const xp = getXPReward(dead, state.tick)
        // Give XP to whoever was near — simplified: give to attacker (entity_id on ENTITY_DIED = who killed)
        if (evt.entity_id) {
          derived.push({
            id: crypto.randomUUID(),
            type: "XP_GAINED",
            tick: state.tick,
            entity_id: evt.entity_id,
            payload: { entity_id: evt.entity_id, amount: xp }
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

  const primaryEvents = [...playerEvents, ...aiEvents]
  const validPrimary = primaryEvents.filter(validateEvent)

  // Apply primary events to get updated state for mechanical resolution
  applyEvents(state, validPrimary)

  // Resolve mechanical consequences
  const mechanicalEvents = resolveMechanics(state, validPrimary)
  const validMechanical = mechanicalEvents.filter(validateEvent)

  applyEvents(state, validMechanical)

  const allValid = [...validPrimary, ...validMechanical]
  await appendEvents(allValid)

  return {
    events: allValid,
    narration: aiResponse.narration
  }
}
