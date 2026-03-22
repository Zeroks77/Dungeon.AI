import { applyEvent, buildState, applyEvents } from "../domain/events/applyEvent"
import { GameState, Event } from "../domain/entities/entity"

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    tick: 0,
    entities: {},
    effects: [],
    ...overrides
  }
}

describe("applyEvent", () => {
  it("applies PLAYER_MOVED event", () => {
    const state = makeState({
      entities: {
        player_1: {
          id: "player_1",
          type: "player",
          version: 1,
          components: {
            position: { q: 0, r: 0 }
          }
        }
      }
    })

    const event: Event = {
      id: "evt-1",
      type: "PLAYER_MOVED",
      tick: 1,
      entity_id: "player_1",
      payload: { to: { q: 1, r: 2 } }
    }

    const next = applyEvent(state, event)
    expect(next.entities["player_1"].components.position).toEqual({ q: 1, r: 2 })
    expect(next.entities["player_1"].version).toBe(2)
  })

  it("applies DAMAGE_APPLIED event", () => {
    const state = makeState({
      entities: {
        npc_1: {
          id: "npc_1",
          type: "npc",
          version: 1,
          components: {
            health: { hp: 50, maxHp: 50 }
          }
        }
      }
    })

    const event: Event = {
      id: "evt-2",
      type: "DAMAGE_APPLIED",
      tick: 1,
      payload: { target: "npc_1", remaining_hp: 30 }
    }

    const next = applyEvent(state, event)
    const health = next.entities["npc_1"].components.health as { hp: number }
    expect(health.hp).toBe(30)
  })

  it("removes entity on ENTITY_DIED", () => {
    const state = makeState({
      entities: {
        npc_1: {
          id: "npc_1",
          type: "npc",
          version: 1,
          components: { health: { hp: 0, maxHp: 50 } }
        }
      }
    })

    const event: Event = {
      id: "evt-3",
      type: "ENTITY_DIED",
      tick: 1,
      payload: { entity_id: "npc_1" }
    }

    const next = applyEvent(state, event)
    expect(next.entities["npc_1"]).toBeUndefined()
  })

  it("handles unknown event type gracefully", () => {
    const state = makeState()
    const event: Event = {
      id: "evt-4",
      type: "UNKNOWN_TYPE",
      tick: 1,
      payload: {}
    }

    const next = applyEvent(state, event)
    expect(next).toBe(state)
  })
})

describe("buildState", () => {
  it("applies multiple events to a snapshot", () => {
    const snapshot: GameState = {
      tick: 0,
      entities: {
        player_1: {
          id: "player_1",
          type: "player",
          version: 1,
          components: { position: { q: 0, r: 0 } }
        }
      },
      effects: []
    }

    const events: Event[] = [
      {
        id: "e1",
        type: "PLAYER_MOVED",
        tick: 1,
        entity_id: "player_1",
        payload: { to: { q: 2, r: 3 } }
      },
      {
        id: "e2",
        type: "PLAYER_MOVED",
        tick: 2,
        entity_id: "player_1",
        payload: { to: { q: 4, r: 5 } }
      }
    ]

    const result = buildState(snapshot, events)
    expect(result.entities["player_1"].components.position).toEqual({ q: 4, r: 5 })
    // Snapshot should not be mutated
    expect(snapshot.entities["player_1"].components.position).toEqual({ q: 0, r: 0 })
  })
})
