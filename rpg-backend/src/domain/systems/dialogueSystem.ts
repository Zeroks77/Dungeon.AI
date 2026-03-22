// Dialogue system — processes TALK action and DIALOGUE_CHOICE events

import { GameState, Event } from "../entities/entity"
import {
  getDialogueTreeForNpcType,
  getDialogueNode,
  getAvailableOptions,
  DialogueAction
} from "../definitions/dialogues"
import { startQuest } from "./questSystem"

export type TalkPayload = {
  npc_id: string
}

export type DialogueChoicePayload = {
  npc_id: string
  dialogue_tree_id: string
  node_id: string
  option_id: string
}

export function processTalk(state: GameState, event: Event): Event[] {
  if (event.type !== "DIALOGUE_STARTED") return []

  const payload = event.payload as { player_id: string; npc_id: string }
  const player = state.entities[payload.player_id]
  const npc = state.entities[payload.npc_id]
  if (!player || !npc) return []

  const behavior = npc.components.behavior as { npcType?: string; dialogueId?: string } | undefined
  const npcType = behavior?.npcType ?? "merchant"
  const tree = getDialogueTreeForNpcType(npcType)
  if (!tree) return []

  const greetingNode = tree.nodes[tree.greeting]
  if (!greetingNode) return []

  const questLog = player.components.questLog as {
    active: Array<{ questId: string }>
    completed: string[]
  } | undefined
  const inv = player.components.inventory as { items: string[] } | undefined
  const rep = player.components.reputation as { factions: Record<string, number> } | undefined
  const char = player.components.character as { level?: number } | undefined

  const availableOptions = getAvailableOptions(
    greetingNode,
    questLog ?? { active: [], completed: [] },
    inv?.items ?? [],
    rep?.factions ?? {},
    char?.level ?? 1
  )

  return [
    {
      id: crypto.randomUUID(),
      type: "DIALOGUE_NODE_SHOWN",
      tick: state.tick,
      entity_id: payload.player_id,
      payload: {
        player_id: payload.player_id,
        npc_id: payload.npc_id,
        tree_id: tree.id,
        node_id: greetingNode.id,
        npc_text: greetingNode.npcText,
        options: availableOptions
      }
    }
  ]
}

export function processDialogueChoice(state: GameState, event: Event): Event[] {
  if (event.type !== "DIALOGUE_CHOICE") return []

  const payload = event.payload as DialogueChoicePayload
  const player = state.entities[event.entity_id ?? ""]
  if (!player) return []

  const tree = getDialogueTreeForNpcType(payload.dialogue_tree_id)
    ?? Object.values(require("../definitions/dialogues").DIALOGUE_TREES)
      .find((t: unknown) => (t as { id: string }).id === payload.dialogue_tree_id) as
        import("../definitions/dialogues").DialogueTree | undefined

  if (!tree) return []

  const node = getDialogueNode(tree.id, payload.node_id)
  if (!node) return []

  const option = node.options.find(o => o.id === payload.option_id)
  if (!option) return []

  const tick = state.tick
  const events: Event[] = []

  // Execute dialogue actions
  if (option.actions) {
    for (const action of option.actions) {
      events.push(...executeDialogueAction(action, player.id, state, tick))
    }
  }

  // Move to next node or end dialogue
  if (option.nextNodeId) {
    const nextNode = tree.nodes[option.nextNodeId]
    if (nextNode) {
      const questLog = player.components.questLog as {
        active: Array<{ questId: string }>
        completed: string[]
      } | undefined
      const inv = player.components.inventory as { items: string[] } | undefined
      const rep = player.components.reputation as { factions: Record<string, number> } | undefined
      const char = player.components.character as { level?: number } | undefined

      const availableOptions = getAvailableOptions(
        nextNode,
        questLog ?? { active: [], completed: [] },
        inv?.items ?? [],
        rep?.factions ?? {},
        char?.level ?? 1
      )

      events.push({
        id: crypto.randomUUID(),
        type: nextNode.isEnd ? "DIALOGUE_ENDED" : "DIALOGUE_NODE_SHOWN",
        tick,
        entity_id: player.id,
        payload: {
          player_id: player.id,
          npc_id: payload.npc_id,
          tree_id: tree.id,
          node_id: nextNode.id,
          npc_text: nextNode.npcText,
          options: nextNode.isEnd ? [] : availableOptions
        }
      })
    }
  } else {
    events.push({
      id: crypto.randomUUID(),
      type: "DIALOGUE_ENDED",
      tick,
      entity_id: player.id,
      payload: { player_id: player.id, npc_id: payload.npc_id }
    })
  }

  return events
}

function executeDialogueAction(
  action: DialogueAction,
  playerId: string,
  state: GameState,
  tick: number
): Event[] {
  const events: Event[] = []

  if (action.type === "start_quest" && action.questId) {
    const player = state.entities[playerId]
    if (player) {
      const questLog = player.components.questLog as {
        active: Array<{ questId: string }>
        completed: string[]
      }
      // Don't start if already active or completed
      const alreadyActive = questLog?.active.some(q => q.questId === action.questId)
      const alreadyDone = questLog?.completed.includes(action.questId!)
      if (!alreadyActive && !alreadyDone) {
        events.push(startQuest(playerId, action.questId, tick))
      }
    }
  }

  if (action.type === "give_item" && action.itemId) {
    events.push({
      id: crypto.randomUUID(),
      type: "ITEM_PICKED_UP",
      tick,
      entity_id: playerId,
      payload: { player_id: playerId, item_id: action.itemId }
    })
  }

  if (action.type === "take_item" && action.itemId) {
    events.push({
      id: crypto.randomUUID(),
      type: "ITEM_DROPPED",
      tick,
      entity_id: playerId,
      payload: { player_id: playerId, item_id: action.itemId }
    })
  }

  if (action.type === "reputation_change" && action.factionId && action.delta !== undefined) {
    events.push({
      id: crypto.randomUUID(),
      type: "REPUTATION_CHANGED",
      tick,
      entity_id: playerId,
      payload: { entity_id: playerId, faction_id: action.factionId, delta: action.delta }
    })
  }

  if (action.type === "give_gold" && action.amount !== undefined) {
    const player = state.entities[playerId]
    const char = player?.components.character as { gold?: number } | undefined
    const newGold = (char?.gold ?? 0) + action.amount
    events.push({
      id: crypto.randomUUID(),
      type: "GOLD_CHANGED",
      tick,
      entity_id: playerId,
      payload: { entity_id: playerId, delta: action.amount, new_gold: newGold }
    })
  }

  return events
}
