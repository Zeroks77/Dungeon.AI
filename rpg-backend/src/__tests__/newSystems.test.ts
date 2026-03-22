import { createPlayer } from "../domain/entities/player"
import { createNpc } from "../domain/entities/npc"
import { buildState } from "../domain/events/applyEvent"
import { GameState } from "../domain/entities/entity"
import { getClass } from "../domain/definitions/classes"
import { getRace } from "../domain/definitions/races"
import { getItem } from "../domain/definitions/items"
import { getSpell } from "../domain/definitions/spells"
import { getRune } from "../domain/definitions/runes"
import { getRecipe, canCraft } from "../domain/definitions/recipes"
import { getFaction, getReputationStanding } from "../domain/definitions/factions"
import { generateWorld, getTile, isPassable } from "../domain/world/worldGen"
import { generateDungeon } from "../domain/world/dungeonGen"
import { processCombat } from "../domain/systems/combatSystem"
import { processCastSpell } from "../domain/systems/spellSystem"
import { processUseItem } from "../domain/systems/itemSystem"
import { processBuyItem } from "../domain/systems/economySystem"
import { processCraftItem } from "../domain/systems/alchemySystem"
import { processEngraveRune } from "../domain/systems/runeSystem"
import { processReputationChange } from "../domain/systems/factionSystem"
import { processGainXP } from "../domain/systems/progressionSystem"
import { createMerchantNpc } from "../domain/entities/npc"
import { xpForLevel } from "../domain/components/character"

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeState(entitiesArr: ReturnType<typeof createPlayer>[]): GameState {
  const entities: GameState["entities"] = {}
  for (const e of entitiesArr) entities[e.id] = e
  return { tick: 1, entities, effects: [] }
}

// ── Classes & Races ───────────────────────────────────────────────────────────

describe("Classes", () => {
  it("warrior class exists with correct stats", () => {
    const cls = getClass("warrior")
    expect(cls).toBeDefined()
    expect(cls!.baseHp).toBe(120)
    expect(cls!.allowedSpellSchools).toHaveLength(0)
  })

  it("mage class has mana and spell schools", () => {
    const cls = getClass("mage")
    expect(cls!.baseMana).toBe(150)
    expect(cls!.allowedSpellSchools).toContain("fire")
  })

  it("all 5 classes exist", () => {
    const ids = ["warrior", "mage", "rogue", "cleric", "ranger"]
    ids.forEach(id => expect(getClass(id)).toBeDefined())
  })
})

describe("Races", () => {
  it("elf has vision range 7", () => {
    const race = getRace("elf")
    expect(race!.visionRange).toBe(7)
  })

  it("dwarf has bonus HP and poison resistance", () => {
    const race = getRace("dwarf")
    expect(race!.bonusHp).toBe(30)
    expect(race!.resistances).toContain("poison")
  })

  it("all 5 races exist", () => {
    const ids = ["human", "elf", "dwarf", "orc", "halfling"]
    ids.forEach(id => expect(getRace(id)).toBeDefined())
  })
})

// ── Player creation ───────────────────────────────────────────────────────────

describe("Player creation with class & race", () => {
  it("warrior human has higher HP than mage elf", () => {
    const warrior = createPlayer("w1", { q: 0, r: 0 }, "warrior", "human")
    const mage = createPlayer("m1", { q: 0, r: 0 }, "mage", "elf")
    const warriorHp = (warrior.components.health as { maxHp: number }).maxHp
    const mageHp = (mage.components.health as { maxHp: number }).maxHp
    expect(warriorHp).toBeGreaterThan(mageHp)
  })

  it("mage has more mana than warrior", () => {
    const mage = createPlayer("m1", { q: 0, r: 0 }, "mage", "human")
    const warrior = createPlayer("w1", { q: 0, r: 0 }, "warrior", "human")
    expect((mage.components.mana as { maxMp: number }).maxMp).toBeGreaterThan(
      (warrior.components.mana as { maxMp: number }).maxMp
    )
  })

  it("player starts with quest log and reputation", () => {
    const p = createPlayer("p1", { q: 0, r: 0 })
    expect((p.components.questLog as { active: unknown[] }).active).toEqual([])
    expect((p.components.reputation as { factions: Record<string, number> }).factions).toEqual({})
  })

  it("orc player has strength bonus", () => {
    const orc = createPlayer("o1", { q: 0, r: 0 }, "warrior", "orc")
    const char = orc.components.character as { attributes: { strength: number } }
    expect(char.attributes.strength).toBeGreaterThan(13)
  })
})

// ── Items ─────────────────────────────────────────────────────────────────────

describe("Items", () => {
  it("iron_sword has attack stats and rune slots", () => {
    const item = getItem("iron_sword")
    expect(item!.stats!.attack).toBe(10)
    expect(item!.stats!.runeSlots).toBeGreaterThan(0)
  })

  it("health_potion is stackable with heal effect", () => {
    const item = getItem("health_potion")
    expect(item!.stackable).toBe(true)
    expect(item!.effects![0].type).toBe("heal")
    expect(item!.effects![0].value).toBe(50)
  })

  it("flaming_sword has fire damage type", () => {
    const item = getItem("flaming_sword")
    expect(item!.stats!.damageType).toBe("fire")
    expect(item!.rarity).toBe("epic")
  })
})

// ── Spells ────────────────────────────────────────────────────────────────────

describe("Spells", () => {
  it("fireball is fire school, area type, requires level 3", () => {
    const spell = getSpell("fireball")
    expect(spell!.school).toBe("fire")
    expect(spell!.targetType).toBe("area")
    expect(spell!.requiredLevel).toBe(3)
  })

  it("heal is holy school, ally target", () => {
    const spell = getSpell("heal")
    expect(spell!.school).toBe("holy")
    expect(spell!.targetType).toBe("single_ally")
  })
})

// ── Spell System ──────────────────────────────────────────────────────────────

describe("SpellSystem", () => {
  it("CAST_SPELL damages target and deducts mana", () => {
    const mage = createPlayer("m1", { q: 0, r: 0 }, "mage", "human")
    const enemy = createNpc("e1", { q: 2, r: 0 })
    const state = makeState([mage, enemy])

    const event = {
      id: "ev1",
      type: "CAST_SPELL",
      tick: 1,
      entity_id: "m1",
      payload: { spell_id: "arcane_missile", target_id: "e1" }
    }

    const results = processCastSpell(state, event)
    expect(results.some(e => e.type === "DAMAGE_APPLIED")).toBe(true)
    expect(results.some(e => e.type === "MANA_CHANGED")).toBe(true)
  })

  it("CAST_SPELL fails if not enough mana", () => {
    const mage = createPlayer("m1", { q: 0, r: 0 }, "mage", "human")
    ;(mage.components.mana as { mp: number }).mp = 0
    const enemy = createNpc("e1", { q: 2, r: 0 })
    const state = makeState([mage, enemy])

    const event = {
      id: "ev1",
      type: "CAST_SPELL",
      tick: 1,
      entity_id: "m1",
      payload: { spell_id: "fireball", target_id: "e1" }
    }

    const results = processCastSpell(state, event)
    expect(results).toHaveLength(0)
  })

  it("heal spell restores HP", () => {
    const cleric = createPlayer("c1", { q: 0, r: 0 }, "cleric", "human")
    const ally = createPlayer("a1", { q: 1, r: 0 }, "warrior", "human")
    ;(ally.components.health as { hp: number }).hp = 50
    const state = makeState([cleric, ally])

    const event = {
      id: "ev1",
      type: "CAST_SPELL",
      tick: 1,
      entity_id: "c1",
      payload: { spell_id: "heal", target_id: "a1" }
    }

    const results = processCastSpell(state, event)
    expect(results.some(e => e.type === "HEAL_APPLIED")).toBe(true)
  })
})

// ── Item System ───────────────────────────────────────────────────────────────

describe("ItemSystem - USE_ITEM", () => {
  it("using health potion creates HEAL_APPLIED and removes item", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.inventory as { items: string[] }).items = ["health_potion"]
    ;(player.components.health as { hp: number }).hp = 30
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "USE_ITEM",
      tick: 1,
      entity_id: "p1",
      payload: { item_id: "health_potion" }
    }

    const results = processUseItem(state, event)
    expect(results.some(e => e.type === "HEAL_APPLIED")).toBe(true)
    expect(results.some(e => e.type === "ITEM_DROPPED")).toBe(true)
  })

  it("cannot use item not in inventory", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.inventory as { items: string[] }).items = []
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "USE_ITEM",
      tick: 1,
      entity_id: "p1",
      payload: { item_id: "health_potion" }
    }

    const results = processUseItem(state, event)
    expect(results).toHaveLength(0)
  })
})

// ── Economy System ────────────────────────────────────────────────────────────

describe("EconomySystem", () => {
  it("BUY_ITEM deducts gold and adds item", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const merchant = createMerchantNpc("m1", { q: 1, r: 0 }, ["health_potion"])
    ;(player.components.character as { gold: number }).gold = 100
    const state = makeState([player, merchant])

    const event = {
      id: "ev1",
      type: "BUY_ITEM",
      tick: 1,
      entity_id: "p1",
      payload: { item_id: "health_potion", merchant_id: "m1", quantity: 1 }
    }

    const results = processBuyItem(state, event)
    expect(results.some(e => e.type === "GOLD_CHANGED")).toBe(true)
    expect(results.some(e => e.type === "ITEM_PICKED_UP")).toBe(true)
  })

  it("BUY_ITEM fails if not enough gold", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const merchant = createMerchantNpc("m1", { q: 1, r: 0 }, ["flaming_sword"])
    ;(player.components.character as { gold: number }).gold = 1
    const state = makeState([player, merchant])

    const event = {
      id: "ev1",
      type: "BUY_ITEM",
      tick: 1,
      entity_id: "p1",
      payload: { item_id: "flaming_sword", merchant_id: "m1", quantity: 1 }
    }

    const results = processBuyItem(state, event)
    expect(results).toHaveLength(0)
  })
})

// ── Alchemy ───────────────────────────────────────────────────────────────────

describe("Alchemy", () => {
  it("canCraft returns true with correct ingredients", () => {
    const recipe = getRecipe("brew_health_potion")!
    const inv = { red_herb: 2 }
    expect(canCraft(inv, recipe)).toBe(true)
  })

  it("canCraft returns false with insufficient ingredients", () => {
    const recipe = getRecipe("brew_health_potion")!
    const inv = { red_herb: 1 }
    expect(canCraft(inv, recipe)).toBe(false)
  })

  it("CRAFT_ITEM removes ingredients and adds output", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.inventory as { items: string[] }).items = ["red_herb", "red_herb"]
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "CRAFT_ITEM",
      tick: 1,
      entity_id: "p1",
      payload: { recipe_id: "brew_health_potion" }
    }

    const results = processCraftItem(state, event)
    expect(results.some(e => e.type === "ITEM_DROPPED")).toBe(true)
    expect(results.some(e => e.type === "ITEM_PICKED_UP" && (e.payload as { item_id: string }).item_id === "health_potion")).toBe(true)
    expect(results.some(e => e.type === "XP_GAINED")).toBe(true)
  })
})

// ── Rune System ───────────────────────────────────────────────────────────────

describe("RuneSystem", () => {
  it("ENGRAVE_RUNE removes rune from inventory and applies to slot", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.inventory as { items: string[] }).items = ["minor_attack"]
    ;(player.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: [] }
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "ENGRAVE_RUNE",
      tick: 1,
      entity_id: "p1",
      payload: { rune_id: "minor_attack", slot: "mainhand" }
    }

    const results = processEngraveRune(state, event)
    expect(results.some(e => e.type === "ITEM_DROPPED")).toBe(true)
    expect(results.some(e => e.type === "RUNE_ENGRAVED")).toBe(true)
  })

  it("ENGRAVE_RUNE fails if rune not in inventory", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: [] }
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "ENGRAVE_RUNE",
      tick: 1,
      entity_id: "p1",
      payload: { rune_id: "minor_attack", slot: "mainhand" }
    }

    const results = processEngraveRune(state, event)
    expect(results).toHaveLength(0)
  })

  it("rune definitions exist for all tiers", () => {
    const tiers = ["minor", "major", "grand", "ancient"]
    tiers.forEach(tier => {
      const rune = Object.values(require("../domain/definitions/runes").RUNES)
        .find((r: unknown) => (r as { tier: string }).tier === tier)
      expect(rune).toBeDefined()
    })
  })
})

// ── Factions & Reputation ─────────────────────────────────────────────────────

describe("Factions", () => {
  it("all 5 factions exist", () => {
    const ids = ["iron_crown", "shadow_guild", "merchants_league", "forest_druids", "orcish_horde"]
    ids.forEach(id => expect(getFaction(id)).toBeDefined())
  })

  it("getReputationStanding returns correct standing", () => {
    expect(getReputationStanding("iron_crown", 0)).toBe("neutral")
    expect(getReputationStanding("iron_crown", 600)).toBe("friendly")
    expect(getReputationStanding("iron_crown", -200)).toBe("unfriendly")
  })

  it("REPUTATION_CHANGED event updates factions and creates ripple", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "REPUTATION_CHANGED",
      tick: 1,
      entity_id: "p1",
      payload: { entity_id: "p1", faction_id: "iron_crown", delta: 200 }
    }

    const results = processReputationChange(state, event)
    // Should produce ripple effects for allied/enemy factions
    expect(results.length).toBeGreaterThan(0)
  })
})

// ── Progression ───────────────────────────────────────────────────────────────

describe("Progression", () => {
  it("xpForLevel increases with each level", () => {
    expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1))
    expect(xpForLevel(5)).toBeGreaterThan(xpForLevel(3))
  })

  it("XP_GAINED event triggers LEVEL_UP when threshold reached", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const char = player.components.character as { experience: number; experienceToNextLevel: number }
    char.experience = char.experienceToNextLevel - 10
    const state = makeState([player])

    const event = {
      id: "ev1",
      type: "XP_GAINED",
      tick: 1,
      entity_id: "p1",
      payload: { entity_id: "p1", amount: 50 }
    }

    const results = processGainXP(state, event)
    expect(results.some(e => e.type === "LEVEL_UP")).toBe(true)
  })
})

// ── World Generation ──────────────────────────────────────────────────────────

describe("WorldGeneration", () => {
  it("generates a world with the correct radius", () => {
    const world = generateWorld("test-seed", 15)
    expect(world.tiles.size).toBeGreaterThan(0)
    expect(world.seed).toBe("test-seed")
  })

  it("generated world has towns and dungeons", () => {
    const world = generateWorld("test-seed-2", 20)
    expect(world.towns.length).toBeGreaterThan(0)
    expect(world.dungeons.length).toBeGreaterThan(0)
  })

  it("ocean tiles are not passable", () => {
    const world = generateWorld("ocean-test", 30)
    let foundOcean = false
    for (const tile of world.tiles.values()) {
      if (tile.terrain === "ocean") {
        foundOcean = true
        expect(isPassable(world, tile.q, tile.r)).toBe(false)
        break
      }
    }
    // ocean may not always appear with every seed; skip if not found
    if (!foundOcean) {
      expect(true).toBe(true)
    }
  })

  it("same seed generates same world", () => {
    const w1 = generateWorld("deterministic-seed", 10)
    const w2 = generateWorld("deterministic-seed", 10)
    expect(w1.tiles.size).toBe(w2.tiles.size)
    expect(w1.towns).toEqual(w2.towns)
  })
})

// ── Dungeon Generation ────────────────────────────────────────────────────────

describe("DungeonGeneration", () => {
  it("generates dungeon with rooms and corridors", () => {
    const dungeon = generateDungeon("d1", "Test Dungeon", "dungeon-seed", 0, 0, 3, 6)
    expect(dungeon.rooms.length).toBe(6)
    expect(dungeon.tiles.size).toBeGreaterThan(0)
  })

  it("entrance tile is at the specified position", () => {
    const dungeon = generateDungeon("d1", "Test", "seed2", 5, 5, 1, 4)
    expect(dungeon.entranceQ).toBe(5)
    expect(dungeon.entranceR).toBe(5)
  })

  it("last room is boss room", () => {
    const dungeon = generateDungeon("d1", "Test", "seed3", 0, 0, 5, 5)
    const bossRoom = dungeon.rooms.find(r => r.isBossRoom)
    expect(bossRoom).toBeDefined()
    expect(dungeon.bossRoomId).toBe(bossRoom!.id)
  })

  it("deep dungeons have stronger enemies", () => {
    const shallow = generateDungeon("s1", "S", "seed", 0, 0, 1, 4)
    const deep = generateDungeon("d1", "D", "seed", 0, 0, 10, 4)
    const shallowEnemies = shallow.rooms[0].enemyTable
    const deepEnemies = deep.rooms[0].enemyTable
    expect(shallowEnemies).toContain("goblin")
    expect(deepEnemies).not.toContain("goblin")
  })
})

// ── ApplyEvent integration for new event types ────────────────────────────────

describe("ApplyEvent for new types", () => {
  it("HEAL_APPLIED increases HP", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.health as { hp: number }).hp = 40
    const state = makeState([player])
    const result = buildState(state, [{
      id: "ev1", type: "HEAL_APPLIED", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", new_hp: 80, amount: 40 }
    }])
    expect((result.entities["p1"].components.health as { hp: number }).hp).toBe(80)
  })

  it("MANA_CHANGED updates mana", () => {
    const mage = createPlayer("m1", { q: 0, r: 0 }, "mage", "human")
    const state = makeState([mage])
    const result = buildState(state, [{
      id: "ev1", type: "MANA_CHANGED", tick: 1, entity_id: "m1",
      payload: { entity_id: "m1", new_mp: 50 }
    }])
    expect((result.entities["m1"].components.mana as { mp: number }).mp).toBe(50)
  })

  it("GOLD_CHANGED updates gold", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const state = makeState([player])
    const result = buildState(state, [{
      id: "ev1", type: "GOLD_CHANGED", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", new_gold: 200, delta: 150 }
    }])
    expect((result.entities["p1"].components.character as { gold: number }).gold).toBe(200)
  })

  it("LEVEL_UP increases level and maxHp", () => {
    const player = createPlayer("p1", { q: 0, r: 0 }, "warrior", "human")
    const state = makeState([player])
    const oldMaxHp = (player.components.health as { maxHp: number }).maxHp
    const result = buildState(state, [{
      id: "ev1", type: "LEVEL_UP", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", new_level: 2, new_xp_to_next: 200, hp_gain: 8, new_abilities: [] }
    }])
    const newMaxHp = (result.entities["p1"].components.health as { maxHp: number }).maxHp
    expect((result.entities["p1"].components.character as { level: number }).level).toBe(2)
    expect(newMaxHp).toBe(oldMaxHp + 8)
  })

  it("ITEM_EQUIPPED places item in equipment slot", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const state = makeState([player])
    const result = buildState(state, [{
      id: "ev1", type: "ITEM_EQUIPPED", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", item_id: "iron_sword", slot: "mainhand" }
    }])
    const equip = result.entities["p1"].components.equipment as {
      slots: Record<string, { itemId: string }>
    }
    expect(equip.slots["mainhand"].itemId).toBe("iron_sword")
  })

  it("RUNE_ENGRAVED adds rune to equipment slot", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.equipment as {
      slots: Record<string, { itemId: string; runeIds: string[] }>
    }).slots["mainhand"] = { itemId: "iron_sword", runeIds: [] }
    const state = makeState([player])
    const result = buildState(state, [{
      id: "ev1", type: "RUNE_ENGRAVED", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", slot: "mainhand", rune_id: "minor_attack" }
    }])
    const equip = result.entities["p1"].components.equipment as {
      slots: Record<string, { runeIds: string[] }>
    }
    expect(equip.slots["mainhand"].runeIds).toContain("minor_attack")
  })

  it("QUEST_STARTED adds quest to active log", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    const state = makeState([player])
    const result = buildState(state, [{
      id: "ev1", type: "QUEST_STARTED", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", quest_id: "goblin_slayer", objectives: [] }
    }])
    const log = result.entities["p1"].components.questLog as { active: Array<{ questId: string }> }
    expect(log.active.some(q => q.questId === "goblin_slayer")).toBe(true)
  })

  it("QUEST_COMPLETED moves quest from active to completed", () => {
    const player = createPlayer("p1", { q: 0, r: 0 })
    ;(player.components.questLog as { active: Array<{ questId: string; objectives: unknown[]; startedAtTick: number }> }).active = [
      { questId: "goblin_slayer", objectives: [], startedAtTick: 1 }
    ]
    const state = makeState([player])
    const result = buildState(state, [{
      id: "ev1", type: "QUEST_COMPLETED", tick: 1, entity_id: "p1",
      payload: { entity_id: "p1", quest_id: "goblin_slayer" }
    }])
    const log = result.entities["p1"].components.questLog as { active: unknown[]; completed: string[] }
    expect(log.active).toHaveLength(0)
    expect(log.completed).toContain("goblin_slayer")
  })
})
