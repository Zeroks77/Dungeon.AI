import { GameState, Event } from "../entities/entity"

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

    case "ENTITY_DIED": {
      const payload = event.payload as { entity_id: string }
      delete state.entities[payload.entity_id]
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
        inv.items = inv.items.filter((i) => i !== payload.item_id)
        state.entities[payload.player_id].version++
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
