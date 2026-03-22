// Quest system — quest definitions, progress tracking, rewards

import { GameState, Event, Entity } from "../entities/entity"

export type QuestObjectiveType =
  | "kill"
  | "collect"
  | "deliver"
  | "reach"
  | "talk"
  | "escort"

export type QuestObjective = {
  id: string
  type: QuestObjectiveType
  description: string
  targetId: string        // entity type, item id, or location id
  required: number        // quantity required
  current: number         // current progress
  completed: boolean
}

export type QuestReward = {
  xp: number
  gold: number
  itemIds: string[]
  reputationRewards: Array<{ factionId: string; delta: number }>
}

export type QuestDefinition = {
  id: string
  name: string
  description: string
  giverNpcType: string
  objectives: Omit<QuestObjective, "current" | "completed">[]
  rewards: QuestReward
  requiredLevel: number
  isRepeatable: boolean
  prerequisiteQuestIds: string[]
}

export type ActiveQuest = {
  questId: string
  objectives: QuestObjective[]
  startedAtTick: number
}

export const QUEST_DEFINITIONS: Record<string, QuestDefinition> = {
  goblin_slayer: {
    id: "goblin_slayer",
    name: "Goblinplage",
    description: "Töte 5 Goblins nahe der Stadt und melde dich beim Wachhauptmann zurück.",
    giverNpcType: "guard_captain",
    objectives: [
      { id: "kill_goblins", type: "kill", description: "Töte Goblins", targetId: "goblin", required: 5 }
    ],
    rewards: { xp: 150, gold: 30, itemIds: ["health_potion"], reputationRewards: [{ factionId: "iron_crown", delta: 100 }] },
    requiredLevel: 1,
    isRepeatable: false,
    prerequisiteQuestIds: []
  },
  herb_gathering: {
    id: "herb_gathering",
    name: "Kräutersuche",
    description: "Sammle rote Kräuter für die Alchemistin.",
    giverNpcType: "alchemist",
    objectives: [
      { id: "collect_herbs", type: "collect", description: "Sammle rote Kräuter", targetId: "red_herb", required: 5 }
    ],
    rewards: { xp: 80, gold: 15, itemIds: ["mana_potion", "antidote"], reputationRewards: [{ factionId: "forest_druids", delta: 50 }] },
    requiredLevel: 1,
    isRepeatable: true,
    prerequisiteQuestIds: []
  },
  shadow_delivery: {
    id: "shadow_delivery",
    name: "Die versiegelte Lieferung",
    description: "Liefere das Paket ohne Fragen an den Empfänger.",
    giverNpcType: "shadow_contact",
    objectives: [
      { id: "get_package", type: "collect", description: "Nimm das Paket", targetId: "sealed_package", required: 1 },
      { id: "deliver_package", type: "deliver", description: "Liefere das Paket", targetId: "shadow_receiver", required: 1 }
    ],
    rewards: { xp: 200, gold: 100, itemIds: ["smoke_bomb"], reputationRewards: [{ factionId: "shadow_guild", delta: 150 }, { factionId: "iron_crown", delta: -50 }] },
    requiredLevel: 3,
    isRepeatable: false,
    prerequisiteQuestIds: []
  },
  ancient_dungeon: {
    id: "ancient_dungeon",
    name: "Das uralte Gewölbe",
    description: "Erforsche das uralte Gewölbe und bringe die Drachenschuppe zurück.",
    giverNpcType: "scholar",
    objectives: [
      { id: "enter_dungeon", type: "reach", description: "Betritt das Gewölbe", targetId: "dungeon_entrance", required: 1 },
      { id: "get_scale", type: "collect", description: "Finde die Drachenschuppe", targetId: "dragon_scale", required: 1 }
    ],
    rewards: { xp: 800, gold: 300, itemIds: ["arcane_staff"], reputationRewards: [{ factionId: "iron_crown", delta: 250 }] },
    requiredLevel: 8,
    isRepeatable: false,
    prerequisiteQuestIds: []
  }
}

export function processQuestProgress(state: GameState, event: Event): Event[] {
  const questEvents: Event[] = []

  // Check all players for quest progress triggered by this event
  for (const entity of Object.values(state.entities)) {
    if (entity.type !== "player") continue

    const questLog = entity.components.questLog as {
      active: ActiveQuest[]
      completed: string[]
    } | undefined
    if (!questLog) continue

    for (const activeQuest of questLog.active) {
      const def = QUEST_DEFINITIONS[activeQuest.questId]
      if (!def) continue

      for (const objective of activeQuest.objectives) {
        if (objective.completed) continue

        const updated = updateObjective(objective, event, entity)
        if (updated && objective.current !== updated.current) {
          questEvents.push({
            id: crypto.randomUUID(),
            type: "QUEST_PROGRESS",
            tick: state.tick,
            entity_id: entity.id,
            payload: {
              entity_id: entity.id,
              quest_id: activeQuest.questId,
              objective_id: objective.id,
              new_current: updated.current,
              completed: updated.completed
            }
          })

          // Check if all objectives are done
          const allDone = activeQuest.objectives.every(o =>
            o.id === objective.id ? updated.completed : o.completed
          )
          if (allDone) {
            questEvents.push(...generateQuestCompletionEvents(entity, def, state.tick))
          }
        }
      }
    }
  }

  return questEvents
}

function updateObjective(
  objective: QuestObjective,
  event: Event,
  entity: Entity
): QuestObjective | null {
  let newCurrent = objective.current

  if (objective.type === "kill" && event.type === "ENTITY_DIED") {
    const payload = event.payload as { entity_id?: string; npc_type?: string }
    if (payload.npc_type === objective.targetId || payload.entity_id?.startsWith(objective.targetId)) {
      newCurrent++
    }
  }

  if (objective.type === "collect" && event.type === "ITEM_PICKED_UP") {
    const payload = event.payload as { player_id?: string; item_id?: string }
    if (payload.player_id === entity.id && payload.item_id === objective.targetId) {
      newCurrent++
    }
  }

  if (objective.type === "reach" && event.type === "PLAYER_MOVED") {
    if (event.entity_id === entity.id) {
      newCurrent = 1
    }
  }

  if (newCurrent === objective.current) return null

  const newCompleted = newCurrent >= objective.required
  return { ...objective, current: Math.min(newCurrent, objective.required), completed: newCompleted }
}

function generateQuestCompletionEvents(
  entity: Entity,
  def: QuestDefinition,
  tick: number
): Event[] {
  const events: Event[] = [
    {
      id: crypto.randomUUID(),
      type: "QUEST_COMPLETED",
      tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, quest_id: def.id }
    }
  ]

  // XP reward
  if (def.rewards.xp > 0) {
    events.push({
      id: crypto.randomUUID(),
      type: "XP_GAINED",
      tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, amount: def.rewards.xp }
    })
  }

  // Gold reward
  if (def.rewards.gold > 0) {
    const char = entity.components.character as { gold: number } | undefined
    events.push({
      id: crypto.randomUUID(),
      type: "GOLD_CHANGED",
      tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, delta: def.rewards.gold, new_gold: (char?.gold ?? 0) + def.rewards.gold }
    })
  }

  // Item rewards
  for (const itemId of def.rewards.itemIds) {
    events.push({
      id: crypto.randomUUID(),
      type: "ITEM_PICKED_UP",
      tick,
      entity_id: entity.id,
      payload: { player_id: entity.id, item_id: itemId }
    })
  }

  // Reputation rewards
  for (const repReward of def.rewards.reputationRewards) {
    events.push({
      id: crypto.randomUUID(),
      type: "REPUTATION_CHANGED",
      tick,
      entity_id: entity.id,
      payload: { entity_id: entity.id, faction_id: repReward.factionId, delta: repReward.delta }
    })
  }

  return events
}

export function startQuest(entityId: string, questId: string, tick: number): Event {
  const def = QUEST_DEFINITIONS[questId]
  return {
    id: crypto.randomUUID(),
    type: "QUEST_STARTED",
    tick,
    entity_id: entityId,
    payload: {
      entity_id: entityId,
      quest_id: questId,
      objectives: def?.objectives.map(o => ({ ...o, current: 0, completed: false })) ?? []
    }
  }
}
