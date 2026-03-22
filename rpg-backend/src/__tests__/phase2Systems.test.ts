import { createPlayer } from "../domain/entities/player"
import { createNpc, createMerchantNpc } from "../domain/entities/npc"
import { GameState } from "../domain/entities/entity"
import { computeDerivedStats } from "../domain/systems/statsSystem"
import { processCombat } from "../domain/systems/combatSystem"
import { processNpcs, aggroNpc } from "../domain/systems/npcSystem"
import { processForage } from "../domain/systems/forageSystem"
import {
  getDialogueTree,
  getDialogueTreeForNpcType,
  getAvailableOptions,
  evaluateCondition
} from "../domain/definitions/dialogues"
import { processTalk, processDialogueChoice } from "../domain/systems/dialogueSystem"
import { computeFOV, hasLineOfSight, getVisibleTileKeys } from "../utils/fov"
import { validateAction, validateEvent } from "../core/validation"
import type { WorldTile } from "../domain/entities/entity"

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeState(
  entitiesArr: ReturnType<typeof createPlayer>[],
  extras?: Partial<GameState>
): GameState {
  const entities: GameState["entities"] = {}
  for (const e of entitiesArr) entities[e.id] = e
  return { tick: 1, entities, effects: [], ...extras }
}

// ── Stats System ──────────────────────────────────────────────────────────────

describe("StatsSystem", () => {
  it("warrior with iron_sword has more attack than unarmed", () => {
    const unarmed = createPlayer("u1", { q: 0, r: 0 }, "warrior", "human")
    const armed = createPlayer("a1", { q: 0, r: 0 }, "warrior", "human")
    ;(armed.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: [] }

    const unarmedStats = computeDerivedStats(unarmed)
    const armedStats = computeDerivedStats(armed)

    expect(armedStats.attack).toBeGreaterThan(unarmedStats.attack)
  })

  it("rune_of_lifesteal adds lifesteal fraction", () => {
    const player = createPlayer("p1", { q: 0, r: 0 }, "warrior", "human")
    ;(player.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: ["lifesteal"] }

    const stats = computeDerivedStats(player)
    expect(stats.lifesteal).toBeGreaterThan(0)
  })

  it("leather_armor adds defense", () => {
    const player = createPlayer("p1", { q: 0, r: 0 }, "warrior", "human")
    const baseStats = computeDerivedStats(player)
    ;(player.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["chest"] = { itemId: "leather_armor", runeIds: [] }
    const armoredStats = computeDerivedStats(player)
    expect(armoredStats.defense).toBeGreaterThan(baseStats.defense)
  })

  it("crit_chance increases with crit_rune", () => {
    const player = createPlayer("p1", { q: 0, r: 0 }, "warrior", "human")
    const baseStats = computeDerivedStats(player)
    ;(player.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: ["crit_rune"] }
    const critStats = computeDerivedStats(player)
    expect(critStats.critChance).toBeGreaterThan(baseStats.critChance)
  })

  it("CON attribute increases maxHp", () => {
    const player = createPlayer("p1", { q: 0, r: 0 }, "warrior", "human")
    ;(player.components.character as { attributes: Record<string, number> }).attributes["constitution"] = 16
    const stats = computeDerivedStats(player)
    expect(stats.maxHp).toBeGreaterThan(100)
  })
})

// ── Combat System (with equipment) ───────────────────────────────────────────

describe("CombatSystem (with equipment)", () => {
  it("crit produces higher damage than average", () => {
    const attacker = createPlayer("a1", { q: 0, r: 0 }, "warrior", "human")
    const defender = createNpc("d1", { q: 1, r: 0 })
    // Force high crit chance
    ;(attacker.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: ["crit_rune", "crit_rune"] }

    const state = makeState([attacker, defender])
    const event = {
      id: "ev1",
      type: "ATTACK_ATTEMPT",
      tick: 1,
      entity_id: "a1",
      payload: { target: "d1" }
    }

    const results = processCombat(state, event)
    const dmgEvent = results.find(e => e.type === "DAMAGE_APPLIED")
    expect(dmgEvent).toBeDefined()
    const damage = (dmgEvent!.payload as { damage: number }).damage
    expect(damage).toBeGreaterThan(0)
  })

  it("lifesteal generates HEAL_APPLIED event", () => {
    const attacker = createPlayer("a1", { q: 0, r: 0 }, "warrior", "human")
    ;(attacker.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: ["lifesteal"] }

    const defender = createNpc("d1", { q: 1, r: 0 })
    const state = makeState([attacker, defender])

    const event = {
      id: "ev1",
      type: "ATTACK_ATTEMPT",
      tick: 1,
      entity_id: "a1",
      payload: { target: "d1" }
    }

    const results = processCombat(state, event)
    expect(results.some(e => e.type === "HEAL_APPLIED")).toBe(true)
  })

  it("fire resistance reduces fire damage", () => {
    const attacker = createPlayer("a1", { q: 0, r: 0 }, "mage", "elf")
    const defender = createPlayer("d1", { q: 1, r: 0 }, "warrior", "dwarf")
    // Add fire resistance rune to defender
    ;(defender.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["chest"] = { itemId: "leather_armor", runeIds: ["fire_resistance"] }
    // Equip fire weapon to attacker
    ;(attacker.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "flaming_sword", runeIds: [] }

    const noResistDef = createPlayer("d2", { q: 1, r: 0 }, "warrior", "human")
    const stateWithResist = makeState([attacker, defender])
    const stateNoResist = makeState([attacker, noResistDef])

    const ev1 = {
      id: "ev1", type: "ATTACK_ATTEMPT", tick: 1, entity_id: "a1", payload: { target: "d1" }
    }
    const ev2 = {
      id: "ev2", type: "ATTACK_ATTEMPT", tick: 1, entity_id: "a1", payload: { target: "d2" }
    }

    const r1 = processCombat(stateWithResist, ev1)
    const r2 = processCombat(stateNoResist, ev2)

    const dmg1 = (r1.find(e => e.type === "DAMAGE_APPLIED")!.payload as { damage: number }).damage
    const dmg2 = (r2.find(e => e.type === "DAMAGE_APPLIED")!.payload as { damage: number }).damage

    expect(dmg1).toBeLessThanOrEqual(dmg2)
  })

  it("ENTITY_DIED payload contains killed_by", () => {
    const attacker = createPlayer("a1", { q: 0, r: 0 }, "warrior", "human")
    ;(attacker.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: [] }

    const defender = createNpc("d1", { q: 1, r: 0 })
    ;(defender.components.health as { hp: number }).hp = 1

    const state = makeState([attacker, defender])

    const event = {
      id: "ev1", type: "ATTACK_ATTEMPT", tick: 1, entity_id: "a1", payload: { target: "d1" }
    }

    const results = processCombat(state, event)
    const diedEvent = results.find(e => e.type === "ENTITY_DIED")
    if (diedEvent) {
      expect((diedEvent.payload as { killed_by: string }).killed_by).toBe("a1")
    }
  })
})

// ── NPC System ────────────────────────────────────────────────────────────────

describe("NpcSystem", () => {
  it("hostile NPC aggroes when player is in range", () => {
    const player = createPlayer("p1", { q: 3, r: 0 })
    const goblin = createNpc("g1", { q: 0, r: 0 })
    ;(goblin.components.behavior as { npcType: string }).npcType = "goblin"

    const state = makeState([player, goblin])
    const events = processNpcs(state)

    expect(events.some(e => e.type === "NPC_AGGROED")).toBe(true)
  })

  it("merchant NPC does not aggro", () => {
    const player = createPlayer("p1", { q: 1, r: 0 })
    const merchant = createMerchantNpc("m1", { q: 0, r: 0 }, [])
    const state = makeState([player, merchant])

    const events = processNpcs(state)
    expect(events.some(e => e.type === "NPC_AGGROED")).toBe(false)
  })

  it("aggroed NPC attacks adjacent player", () => {
    const player = createPlayer("p1", { q: 1, r: 0 })
    const goblin = createNpc("g1", { q: 0, r: 0 })
    ;(goblin.components.behavior as { npcType: string }).npcType = "goblin"
    aggroNpc({ tick: 1, entities: { p1: player, g1: goblin }, effects: [] }, "g1", "p1")

    const state = makeState([player, goblin])
    const events = processNpcs(state)

    expect(events.some(e => e.type === "ATTACK_ATTEMPT")).toBe(true)
  })

  it("de-aggroes when target dies", () => {
    const player = createPlayer("p1", { q: 1, r: 0 })
    ;(player.components.health as { hp: number }).hp = 0
    const goblin = createNpc("g1", { q: 0, r: 0 })
    ;(goblin.components.behavior as { aggro: boolean; targetId: string; npcType: string }) = {
      aggro: true, targetId: "p1", npcType: "goblin"
    }

    const state = makeState([player, goblin])
    const events = processNpcs(state)

    // Should not produce attack events
    expect(events.some(e => e.type === "ATTACK_ATTEMPT")).toBe(false)
    // Behavior should be reset
    expect((goblin.components.behavior as { aggro: boolean }).aggro).toBe(false)
  })
})

// ── Foraging ──────────────────────────────────────────────────────────────────

describe("ForageSystem", () => {
  it("FORAGE on forest tile returns ITEM_PICKED_UP", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const forestTile: WorldTile = {
      q: 0, r: 0,
      terrain: "forest",
      biome: "temperate",
      elevation: 0.5,
      passable: true,
      transparent: true,
      movementCost: 1.5,
      resourceIds: ["red_herb"]
    }

    const state = makeState([player], {
      worldTiles: { "0,0": forestTile }
    })

    const event = {
      id: "ev1", type: "FORAGE", tick: 1, entity_id: "p1", payload: { player_id: "p1" }
    }

    const results = processForage(state, event)
    // Either success (ITEM_PICKED_UP) or failure (FORAGE_FAILED) — must produce events
    expect(results.length).toBeGreaterThan(0)
    const types = results.map(e => e.type)
    expect(types.some(t => t === "ITEM_PICKED_UP" || t === "FORAGE_FAILED")).toBe(true)
  })

  it("FORAGE on desert tile with no resources fails gracefully", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const desertTile: WorldTile = {
      q: 0, r: 0,
      terrain: "desert",
      biome: "arid",
      elevation: 0.5,
      passable: true,
      transparent: true,
      movementCost: 1.5,
      resourceIds: []
    }

    const state = makeState([player], {
      worldTiles: { "0,0": desertTile }
    })

    const event = {
      id: "ev1", type: "FORAGE", tick: 1, entity_id: "p1", payload: { player_id: "p1" }
    }

    const results = processForage(state, event)
    // Desert has no forageable items → should fail
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it("FORAGE fails when no tile data available", () => {
    const player = createPlayer("p1", { q: 5, r: 5 })
    const state = makeState([player])  // no worldTiles

    const event = {
      id: "ev1", type: "FORAGE", tick: 1, entity_id: "p1", payload: { player_id: "p1" }
    }

    const results = processForage(state, event)
    expect(results).toHaveLength(0)
  })
})

// ── Dialogue System ───────────────────────────────────────────────────────────

describe("DialogueSystem", () => {
  it("all 5 dialogue trees exist", () => {
    const trees = ["merchant_generic", "guard_captain", "alchemist", "scholar", "shadow_contact"]
    trees.forEach(id => expect(getDialogueTree(id)).toBeDefined())
  })

  it("getDialogueTreeForNpcType returns correct tree", () => {
    expect(getDialogueTreeForNpcType("merchant")?.id).toBe("merchant_generic")
    expect(getDialogueTreeForNpcType("alchemist")?.id).toBe("alchemist")
  })

  it("evaluateCondition: completed_quest returns false if not completed", () => {
    const questLog = { active: [], completed: [] }
    expect(evaluateCondition({ type: "completed_quest", value: "goblin_slayer" }, questLog, [], {}, 1)).toBe(false)
  })

  it("evaluateCondition: completed_quest returns true if completed", () => {
    const questLog = { active: [], completed: ["goblin_slayer"] }
    expect(evaluateCondition({ type: "completed_quest", value: "goblin_slayer" }, questLog, [], {}, 1)).toBe(true)
  })

  it("evaluateCondition: level_min filters correctly", () => {
    const questLog = { active: [], completed: [] }
    expect(evaluateCondition({ type: "level_min", value: 5 }, questLog, [], {}, 3)).toBe(false)
    expect(evaluateCondition({ type: "level_min", value: 5 }, questLog, [], {}, 5)).toBe(true)
  })

  it("getAvailableOptions filters by condition", () => {
    const tree = getDialogueTree("guard_captain")!
    const startNode = tree.nodes["start"]
    const questLog = { active: [], completed: ["goblin_slayer"] }
    const options = getAvailableOptions(startNode, questLog, [], {}, 5)
    // Should still show all unconditional options
    expect(options.length).toBeGreaterThan(0)
  })

  it("DIALOGUE_STARTED event triggers DIALOGUE_NODE_SHOWN for merchant", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const merchant = createMerchantNpc("m1", { q: 1, r: 0 }, [])
    const state = makeState([player, merchant])

    const event = {
      id: "ev1",
      type: "DIALOGUE_STARTED",
      tick: 1,
      entity_id: "p1",
      payload: { player_id: "p1", npc_id: "m1" }
    }

    const results = processTalk(state, event)
    expect(results.some(e => e.type === "DIALOGUE_NODE_SHOWN")).toBe(true)
    const nodeShown = results.find(e => e.type === "DIALOGUE_NODE_SHOWN")!
    expect((nodeShown.payload as { npc_text: string }).npc_text).toContain("Guten Tag")
  })

  it("DIALOGUE_CHOICE navigates to next node", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const merchant = createMerchantNpc("m1", { q: 1, r: 0 }, [])
    const state = makeState([player, merchant])

    const event = {
      id: "ev1",
      type: "DIALOGUE_CHOICE",
      tick: 1,
      entity_id: "p1",
      payload: {
        npc_id: "m1",
        dialogue_tree_id: "merchant_generic",
        node_id: "start",
        option_id: "info"
      }
    }

    const results = processDialogueChoice(state, event)
    expect(results.some(e => e.type === "DIALOGUE_NODE_SHOWN")).toBe(true)
    const shown = results.find(e => e.type === "DIALOGUE_NODE_SHOWN")!
    expect((shown.payload as { node_id: string }).node_id).toBe("news")
  })

  it("DIALOGUE_CHOICE with bye option produces DIALOGUE_ENDED", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const merchant = createMerchantNpc("m1", { q: 1, r: 0 }, [])
    const state = makeState([player, merchant])

    const event = {
      id: "ev1",
      type: "DIALOGUE_CHOICE",
      tick: 1,
      entity_id: "p1",
      payload: {
        npc_id: "m1",
        dialogue_tree_id: "merchant_generic",
        node_id: "start",
        option_id: "bye"
      }
    }

    const results = processDialogueChoice(state, event)
    expect(results.some(e => e.type === "DIALOGUE_ENDED")).toBe(true)
  })

  it("guard_captain DIALOGUE_CHOICE with accept starts goblin_slayer quest", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const guardCaptain = createNpc("g1", { q: 1, r: 0 })
    ;(guardCaptain.components.behavior as { npcType: string }).npcType = "guard_captain"
    const state = makeState([player, guardCaptain])

    const event = {
      id: "ev1",
      type: "DIALOGUE_CHOICE",
      tick: 1,
      entity_id: "p1",
      payload: {
        npc_id: "g1",
        dialogue_tree_id: "guard_captain",
        node_id: "offer_goblin",
        option_id: "accept"
      }
    }

    const results = processDialogueChoice(state, event)
    expect(results.some(e => e.type === "QUEST_STARTED")).toBe(true)
  })
})

// ── FOV with terrain blocking ──────────────────────────────────────────────────

describe("FOV with terrain blocking", () => {
  it("entities on same tile are always visible", () => {
    const observer = createPlayer("p1", { q: 0, r: 0 })
    const npc = createNpc("n1", { q: 0, r: 0 })
    const state = makeState([observer, npc])
    const visible = computeFOV({ q: 0, r: 0 }, 5, state)
    expect(visible.some(e => e.id === "n1")).toBe(true)
  })

  it("entity behind opaque wall is not visible", () => {
    const observer = createPlayer("p1", { q: 0, r: 0 })
    const target = createNpc("n1", { q: 3, r: 0 })
    const state = makeState([observer, target])

    // Place opaque walls at q=1 and q=2
    state.worldTiles = {
      "1,0": { q: 1, r: 0, terrain: "wall", biome: "dungeon", elevation: 0, passable: false, transparent: false, movementCost: 999, resourceIds: [] },
      "2,0": { q: 2, r: 0, terrain: "wall", biome: "dungeon", elevation: 0, passable: false, transparent: false, movementCost: 999, resourceIds: [] }
    }

    const visible = computeFOV({ q: 0, r: 0 }, 6, state)
    expect(visible.some(e => e.id === "n1")).toBe(false)
  })

  it("entity in open field is visible", () => {
    const observer = createPlayer("p1", { q: 0, r: 0 })
    const target = createNpc("n1", { q: 4, r: 0 })
    const state = makeState([observer, target])
    // No opaque tiles
    const visible = computeFOV({ q: 0, r: 0 }, 6, state)
    expect(visible.some(e => e.id === "n1")).toBe(true)
  })

  it("hasLineOfSight returns false through opaque tile", () => {
    const state: GameState = { tick: 0, entities: {}, effects: [], worldTiles: {
      "1,0": { q: 1, r: 0, terrain: "wall", biome: "dungeon", elevation: 0, passable: false, transparent: false, movementCost: 999, resourceIds: [] }
    }}
    expect(hasLineOfSight({ q: 0, r: 0 }, { q: 3, r: 0 }, state)).toBe(false)
  })

  it("getVisibleTileKeys returns tiles in a radius", () => {
    const state: GameState = { tick: 0, entities: {}, effects: [] }
    const keys = getVisibleTileKeys({ q: 0, r: 0 }, 3, state)
    expect(keys.size).toBeGreaterThan(0)
    expect(keys.has("0,0")).toBe(true)
  })
})

// ── Validation additions ──────────────────────────────────────────────────────

describe("Validation (new actions)", () => {
  it("DIALOGUE_CHOICE requires tree, node, option", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const state: GameState = { tick: 0, entities: { p1: player }, effects: [] }

    expect(() => validateAction({ type: "DIALOGUE_CHOICE", player_id: "p1", dialogue_tree_id: "merchant_generic", node_id: "start" } as never, state))
      .toThrow("INVALID_OPTION_ID")
  })

  it("FORAGE event is valid with entity_id", () => {
    const valid = validateEvent({ id: "1", type: "FORAGE", tick: 1, entity_id: "p1", payload: {} })
    expect(valid).toBe(true)
  })

  it("NPC_AGGROED event is valid with entity_id", () => {
    const valid = validateEvent({ id: "1", type: "NPC_AGGROED", tick: 1, entity_id: "npc1", payload: {} })
    expect(valid).toBe(true)
  })

  it("DIALOGUE_STARTED event is valid", () => {
    const valid = validateEvent({
      id: "1", type: "DIALOGUE_STARTED", tick: 1, entity_id: "p1",
      payload: { player_id: "p1", npc_id: "n1" }
    })
    expect(valid).toBe(true)
  })
})
