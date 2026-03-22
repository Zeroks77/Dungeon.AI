import { GameState, Event } from "../entities/entity"
import { createPlayer } from "../entities/player"

export function applyEvent(state: GameState, event: Event): GameState {
  switch (event.type) {
    case "PLAYER_MOVED": {
      const payload = event.payload as { to: { q: number; r: number } }
      if (event.entity_id && state.entities[event.entity_id]) {
        state.entities[event.entity_id].components.position = payload.to
        state.entities[event.entity_id].version++
      }
      return state
    }

    case "NPC_MOVED": {
      const payload = event.payload as { to: { q: number; r: number } }
      if (event.entity_id && state.entities[event.entity_id]) {
        state.entities[event.entity_id].components.position = payload.to
        state.entities[event.entity_id].version++
      }
      return state
    }

    case "DAMAGE_APPLIED": {
      const payload = event.payload as { target: string; remaining_hp: number }
      if (state.entities[payload.target]) {
        const health = state.entities[payload.target].components.health as {
          hp: number
          maxHp: number
        }
        health.hp = payload.remaining_hp
        state.entities[payload.target].version++
      }
      return state
    }

    case "HEAL_APPLIED": {
      const payload = event.payload as { entity_id: string; new_hp: number }
      if (state.entities[payload.entity_id]) {
        const health = state.entities[payload.entity_id].components.health as {
          hp: number
          maxHp: number
        }
        health.hp = payload.new_hp
        state.entities[payload.entity_id].version++
      }
      return state
    }

    case "ENTITY_DIED": {
      const payload = event.payload as { entity_id: string }
      const entity = state.entities[payload.entity_id]
      if (entity && entity.type === "player") {
        // Players are never removed from state — mark as dead instead
        const health = entity.components.health as { hp: number; maxHp: number; isDead?: boolean }
        if (health) {
          health.hp = 0
          health.isDead = true
        }
        entity.version++
      } else {
        delete state.entities[payload.entity_id]
      }
      return state
    }

    case "ITEM_PICKED_UP": {
      const payload = event.payload as { player_id: string; item_id: string }
      if (state.entities[payload.player_id]) {
        const inv = state.entities[payload.player_id].components.inventory as {
          items: string[]
        }
        inv.items.push(payload.item_id)
        state.entities[payload.player_id].version++
      }
      return state
    }

    case "ITEM_DROPPED": {
      const payload = event.payload as { player_id: string; item_id: string }
      if (state.entities[payload.player_id]) {
        const inv = state.entities[payload.player_id].components.inventory as {
          items: string[]
        }
        const idx = inv.items.indexOf(payload.item_id)
        if (idx !== -1) inv.items.splice(idx, 1)
        state.entities[payload.player_id].version++
      }
      return state
    }

    case "ITEM_EQUIPPED": {
      const payload = event.payload as { entity_id: string; item_id: string; slot: string }
      if (state.entities[payload.entity_id]) {
        const equipment = state.entities[payload.entity_id].components.equipment as {
          slots: Record<string, { itemId: string; runeIds: string[] }>
        }
        if (equipment) {
          equipment.slots[payload.slot] = { itemId: payload.item_id, runeIds: [] }
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "ITEM_UNEQUIPPED": {
      const payload = event.payload as { entity_id: string; slot: string }
      if (state.entities[payload.entity_id]) {
        const equipment = state.entities[payload.entity_id].components.equipment as {
          slots: Record<string, unknown>
        }
        if (equipment) {
          delete equipment.slots[payload.slot]
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "RUNE_ENGRAVED": {
      const payload = event.payload as { entity_id: string; slot: string; rune_id: string }
      if (state.entities[payload.entity_id]) {
        const equipment = state.entities[payload.entity_id].components.equipment as {
          slots: Record<string, { itemId: string; runeIds: string[] }>
        }
        if (equipment?.slots[payload.slot]) {
          equipment.slots[payload.slot].runeIds.push(payload.rune_id)
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "MANA_CHANGED": {
      const payload = event.payload as { entity_id: string; new_mp: number }
      if (state.entities[payload.entity_id]) {
        const mana = state.entities[payload.entity_id].components.mana as {
          mp: number
          maxMp: number
        }
        if (mana) {
          mana.mp = payload.new_mp
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "GOLD_CHANGED": {
      const payload = event.payload as { entity_id: string; new_gold: number }
      if (state.entities[payload.entity_id]) {
        const char = state.entities[payload.entity_id].components.character as {
          gold: number
        }
        if (char) {
          char.gold = payload.new_gold
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "MERCHANT_STOCK_CHANGED": {
      const payload = event.payload as { merchant_id: string; item_id: string; delta: number }
      if (state.entities[payload.merchant_id]) {
        const merchant = state.entities[payload.merchant_id].components.merchant as {
          inventory: Array<{ itemId: string; stock: number }>
        }
        if (merchant) {
          const entry = merchant.inventory.find(e => e.itemId === payload.item_id)
          if (entry && entry.stock !== -1) entry.stock = Math.max(0, entry.stock + payload.delta)
          state.entities[payload.merchant_id].version++
        }
      }
      return state
    }

    case "REPUTATION_CHANGED": {
      const payload = event.payload as { entity_id: string; faction_id: string; delta: number }
      if (state.entities[payload.entity_id]) {
        const rep = state.entities[payload.entity_id].components.reputation as {
          factions: Record<string, number>
        }
        if (rep) {
          const current = rep.factions[payload.faction_id] ?? 0
          rep.factions[payload.faction_id] = Math.max(-10000, Math.min(10000, current + payload.delta))
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "XP_GAINED": {
      const payload = event.payload as { entity_id: string; amount: number }
      if (state.entities[payload.entity_id]) {
        const char = state.entities[payload.entity_id].components.character as {
          experience: number
        }
        if (char) {
          char.experience += payload.amount
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "LEVEL_UP": {
      const payload = event.payload as {
        entity_id: string
        new_level: number
        new_xp_to_next: number
        hp_gain: number
        new_abilities: string[]
      }
      if (state.entities[payload.entity_id]) {
        const char = state.entities[payload.entity_id].components.character as {
          level: number
          experienceToNextLevel: number
          knownAbilities: string[]
        }
        if (char) {
          char.level = payload.new_level
          char.experienceToNextLevel = payload.new_xp_to_next
          char.knownAbilities = [...new Set([...char.knownAbilities, ...payload.new_abilities])]
        }
        const health = state.entities[payload.entity_id].components.health as {
          hp: number
          maxHp: number
        }
        if (health) {
          health.maxHp += payload.hp_gain
          health.hp = Math.min(health.hp + payload.hp_gain, health.maxHp)
        }
        state.entities[payload.entity_id].version++
      }
      return state
    }

    case "CHARACTER_UPDATED": {
      const payload = event.payload as { entity_id: string; updates: Record<string, unknown> }
      if (state.entities[payload.entity_id]) {
        const char = state.entities[payload.entity_id].components.character as Record<string, unknown>
        if (char) {
          Object.assign(char, payload.updates)
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "QUEST_STARTED": {
      const payload = event.payload as { entity_id: string; quest_id: string; objectives: unknown[] }
      if (state.entities[payload.entity_id]) {
        const questLog = state.entities[payload.entity_id].components.questLog as {
          active: Array<{ questId: string; objectives: unknown[]; startedAtTick: number }>
          completed: string[]
        }
        if (questLog) {
          questLog.active.push({
            questId: payload.quest_id,
            objectives: payload.objectives,
            startedAtTick: state.tick
          })
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "QUEST_PROGRESS": {
      const payload = event.payload as {
        entity_id: string
        quest_id: string
        objective_id: string
        new_current: number
        completed: boolean
      }
      if (state.entities[payload.entity_id]) {
        const questLog = state.entities[payload.entity_id].components.questLog as {
          active: Array<{ questId: string; objectives: Array<{ id: string; current: number; completed: boolean }> }>
        }
        if (questLog) {
          const quest = questLog.active.find(q => q.questId === payload.quest_id)
          if (quest) {
            const obj = quest.objectives.find(o => o.id === payload.objective_id)
            if (obj) {
              obj.current = payload.new_current
              obj.completed = payload.completed
            }
          }
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "QUEST_COMPLETED": {
      const payload = event.payload as { entity_id: string; quest_id: string }
      if (state.entities[payload.entity_id]) {
        const questLog = state.entities[payload.entity_id].components.questLog as {
          active: Array<{ questId: string }>
          completed: string[]
        }
        if (questLog) {
          questLog.active = questLog.active.filter(q => q.questId !== payload.quest_id)
          questLog.completed.push(payload.quest_id)
          state.entities[payload.entity_id].version++
        }
      }
      return state
    }

    case "EFFECT_APPLIED": {
      const payload = event.payload as { effect: unknown }
      state.effects.push(payload.effect)
      return state
    }

    case "EFFECT_EXPIRED": {
      const payload = event.payload as { effectId: string }
      state.effects = state.effects.filter(
        (e) => (e as { id: string }).id !== payload.effectId
      )
      return state
    }

    case "COOLDOWN_SET": {
      const payload = event.payload as { entity_id: string; spell_id: string; expires_at_tick: number }
      if (state.entities[payload.entity_id]) {
        if (!state.entities[payload.entity_id].components.cooldowns) {
          state.entities[payload.entity_id].components.cooldowns = {}
        }
        const cooldowns = state.entities[payload.entity_id].components.cooldowns as Record<string, number>
        cooldowns[payload.spell_id] = payload.expires_at_tick
        state.entities[payload.entity_id].version++
      }
      return state
    }

    case "PLAYER_RESPAWNED": {
      const payload = event.payload as { entity_id: string; position?: { q: number; r: number } }
      if (state.entities[payload.entity_id]) {
        const health = state.entities[payload.entity_id].components.health as {
          hp: number
          maxHp: number
          isDead?: boolean
        }
        if (health) {
          health.hp = Math.ceil(health.maxHp / 2)
          health.isDead = false
        }
        state.entities[payload.entity_id].components.position = payload.position ?? { q: 0, r: 0 }
        state.entities[payload.entity_id].version++
      }
      return state
    }

    case "PLAYER_SPAWNED": {
      const payload = event.payload as {
        player_id: string
        class_id: string
        race_id: string
        position: { q: number; r: number }
      }
      const player = createPlayer(payload.player_id, payload.position, payload.class_id, payload.race_id)
      state.entities[payload.player_id] = player
      return state
    }

    case "DIALOGUE_NODE_SHOWN":
    case "NPC_AGGROED":
    case "FORAGE_SUCCESS":
    case "FORAGE_FAILED":
    case "DIALOGUE_CHOICE": {
      // Read-only notification events — no state mutation needed
      return state
    }

    case "DIALOGUE_STARTED": {
      const payload = event.payload as { player_id: string; npc_id: string }
      if (state.entities[payload.player_id]) {
        const char = state.entities[payload.player_id].components.character as {
          activeDialogue?: { npcId: string; startedAtTick: number }
        }
        if (char) {
          char.activeDialogue = { npcId: payload.npc_id, startedAtTick: state.tick }
        }
        state.entities[payload.player_id].version++
      }
      return state
    }

    case "DIALOGUE_ENDED": {
      const payload = event.payload as { player_id: string }
      if (state.entities[payload.player_id]) {
        const char = state.entities[payload.player_id].components.character as {
          activeDialogue?: unknown
        }
        if (char) {
          delete char.activeDialogue
        }
        state.entities[payload.player_id].version++
      }
      return state
    }

    case "NPC_AGGRO": {
      const payload = event.payload as { npc_id: string; target_id: string }
      if (state.entities[payload.npc_id]) {
        const behavior = state.entities[payload.npc_id].components.behavior as {
          aggro: boolean
          targetId?: string
        }
        if (behavior) {
          behavior.aggro = true
          behavior.targetId = payload.target_id
        }
        state.entities[payload.npc_id].version++
      }
      return state
    }

    case "NPC_DEAGGRO": {
      const payload = event.payload as { npc_id: string }
      if (state.entities[payload.npc_id]) {
        const behavior = state.entities[payload.npc_id].components.behavior as {
          aggro: boolean
          targetId?: string
        }
        if (behavior) {
          behavior.aggro = false
          delete behavior.targetId
        }
        state.entities[payload.npc_id].version++
      }
      return state
    }

    default:
      return state
  }
}

// applyEvent mutates state in place and also returns it for convenience.
// applyEvents relies on the in-place mutation semantics.
export function applyEvents(state: GameState, events: Event[]): void {
  for (const evt of events) {
    applyEvent(state, evt)
  }
}

export function buildState(snapshot: GameState, events: Event[]): GameState {
  const state = structuredClone(snapshot)

  for (const evt of events) {
    applyEvent(state, evt)
  }

  return state
}
