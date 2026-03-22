import { validateAction, validateEvent } from "../core/validation"
import { GameState, Event } from "../domain/entities/entity"

function makeState(): GameState {
  return {
    tick: 1,
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
}

describe("validateAction", () => {
  it("passes for valid player action", () => {
    const state = makeState()
    expect(() =>
      validateAction({ type: "MOVE", player_id: "player_1", target: { q: 1, r: 0 } }, state)
    ).not.toThrow()
  })

  it("throws INVALID_PLAYER for unknown player", () => {
    const state = makeState()
    expect(() =>
      validateAction({ type: "MOVE", player_id: "ghost" }, state)
    ).toThrow("INVALID_PLAYER")
  })

  it("throws INVALID_MOVE_TARGET when target is missing for MOVE", () => {
    const state = makeState()
    expect(() =>
      validateAction({ type: "MOVE", player_id: "player_1" }, state)
    ).toThrow("INVALID_MOVE_TARGET")
  })
})

describe("validateEvent", () => {
  it("validates a PLAYER_MOVED event", () => {
    const event: Event = {
      id: "evt-1",
      type: "PLAYER_MOVED",
      tick: 1,
      entity_id: "player_1",
      payload: { to: { q: 1, r: 2 } }
    }
    expect(validateEvent(event)).toBe(true)
  })

  it("rejects PLAYER_MOVED without entity_id", () => {
    const event: Event = {
      id: "evt-1",
      type: "PLAYER_MOVED",
      tick: 1,
      payload: { to: { q: 1, r: 2 } }
    }
    expect(validateEvent(event)).toBe(false)
  })

  it("validates a DAMAGE_APPLIED event", () => {
    const event: Event = {
      id: "evt-2",
      type: "DAMAGE_APPLIED",
      tick: 1,
      payload: { target: "npc_1", remaining_hp: 20 }
    }
    expect(validateEvent(event)).toBe(true)
  })

  it("rejects DAMAGE_APPLIED with negative hp", () => {
    const event: Event = {
      id: "evt-3",
      type: "DAMAGE_APPLIED",
      tick: 1,
      payload: { target: "npc_1", remaining_hp: -5 }
    }
    expect(validateEvent(event)).toBe(false)
  })

  it("rejects events missing required fields", () => {
    expect(validateEvent({ id: "", type: "X", tick: 1, payload: {} })).toBe(false)
    expect(validateEvent({ id: "x", type: "", tick: 1, payload: {} })).toBe(false)
  })
})
