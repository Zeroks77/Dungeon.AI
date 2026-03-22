import { GameState, ActionRequest, Event } from "../domain/entities/entity"
import { hexDistance } from "../domain/components/position"

export function validateAction(action: ActionRequest, state: GameState): void {
  // CREATE_PLAYER does not require the entity to exist yet
  if (action.type !== "CREATE_PLAYER" && !state.entities[action.player_id]) {
    throw new Error("INVALID_PLAYER")
  }

  if (action.type === "CREATE_PLAYER") {
    if (!action.class_id || typeof action.class_id !== "string") {
      throw new Error("INVALID_CLASS_ID")
    }
    if (!action.race_id || typeof action.race_id !== "string") {
      throw new Error("INVALID_RACE_ID")
    }
    return
  }

  // ── CC enforcement ────────────────────────────────────────────────────────

  const playerEffectTypes = state.effects
    .filter((e) => (e as { targetId: string }).targetId === action.player_id)
    .map((e) => (e as { type: string }).type)

  if (action.type === "MOVE") {
    if (playerEffectTypes.includes("stun")) throw new Error("PLAYER_STUNNED")
    if (playerEffectTypes.includes("root")) throw new Error("PLAYER_ROOTED")
  }

  if (action.type === "ATTACK") {
    if (playerEffectTypes.includes("stun")) throw new Error("PLAYER_STUNNED")
  }

  if (action.type === "CAST_SPELL") {
    if (playerEffectTypes.includes("stun")) throw new Error("PLAYER_STUNNED")
    if (playerEffectTypes.includes("silence")) throw new Error("PLAYER_SILENCED")
  }

  // ── Existing field checks ─────────────────────────────────────────────────

  if (action.type === "MOVE") {
    const target = action.target
    if (
      !target ||
      typeof target !== "object" ||
      !("q" in target) ||
      !("r" in target)
    ) {
      throw new Error("INVALID_MOVE_TARGET")
    }

    // Adjacency check — target must be exactly 1 hex away
    const playerPos = state.entities[action.player_id]?.components.position as
      | { q: number; r: number }
      | undefined
    if (playerPos) {
      const dest = target as { q: number; r: number }
      if (hexDistance(playerPos, dest) > 1) {
        throw new Error("MOVE_TOO_FAR")
      }
    }
  }

  if (action.type === "ATTACK") {
    if (!action.target || typeof action.target !== "string") {
      throw new Error("INVALID_ATTACK_TARGET")
    }
    if (!state.entities[action.target as string]) {
      throw new Error("TARGET_NOT_FOUND")
    }
  }

  if (action.type === "CAST_SPELL") {
    if (!action.spell_id || typeof action.spell_id !== "string") {
      throw new Error("INVALID_SPELL_ID")
    }
  }

  if (action.type === "USE_ITEM") {
    if (!action.item_id || typeof action.item_id !== "string") {
      throw new Error("INVALID_ITEM_ID")
    }
  }

  if (action.type === "EQUIP_ITEM" || action.type === "UNEQUIP_ITEM") {
    if (action.type === "EQUIP_ITEM" && (!action.item_id || typeof action.item_id !== "string")) {
      throw new Error("INVALID_ITEM_ID")
    }
    if (!action.slot || typeof action.slot !== "string") {
      throw new Error("INVALID_SLOT")
    }
  }

  if (action.type === "CRAFT_ITEM") {
    if (!action.recipe_id || typeof action.recipe_id !== "string") {
      throw new Error("INVALID_RECIPE_ID")
    }
  }

  if (action.type === "ENGRAVE_RUNE") {
    if (!action.rune_id || typeof action.rune_id !== "string") {
      throw new Error("INVALID_RUNE_ID")
    }
    if (!action.slot || typeof action.slot !== "string") {
      throw new Error("INVALID_SLOT")
    }
  }

  if (action.type === "BUY_ITEM" || action.type === "SELL_ITEM") {
    if (!action.item_id || typeof action.item_id !== "string") {
      throw new Error("INVALID_ITEM_ID")
    }
    if (!action.merchant_id || typeof action.merchant_id !== "string") {
      throw new Error("INVALID_MERCHANT_ID")
    }
  }

  if (action.type === "TALK") {
    if (!action.target || typeof action.target !== "string") {
      throw new Error("INVALID_TALK_TARGET")
    }
  }

  if (action.type === "DIALOGUE_CHOICE") {
    if (!action.dialogue_tree_id || typeof action.dialogue_tree_id !== "string") {
      throw new Error("INVALID_DIALOGUE_TREE")
    }
    if (!action.node_id || typeof action.node_id !== "string") {
      throw new Error("INVALID_NODE_ID")
    }
    if (!action.option_id || typeof action.option_id !== "string") {
      throw new Error("INVALID_OPTION_ID")
    }
  }
}

export function validateEvent(event: Event): boolean {
  if (!event.id || !event.type || typeof event.tick !== "number") {
    return false
  }

  switch (event.type) {
    case "PLAYER_MOVED":
    case "NPC_MOVED": {
      const payload = event.payload as { to?: unknown }
      return (
        !!event.entity_id &&
        !!payload.to &&
        typeof (payload.to as { q: unknown }).q === "number" &&
        typeof (payload.to as { r: unknown }).r === "number"
      )
    }

    case "DAMAGE_APPLIED": {
      const payload = event.payload as { target?: unknown; remaining_hp?: unknown }
      return (
        typeof payload.target === "string" &&
        typeof payload.remaining_hp === "number" &&
        payload.remaining_hp >= 0
      )
    }

    case "HEAL_APPLIED": {
      const payload = event.payload as { entity_id?: unknown; new_hp?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.new_hp === "number" && payload.new_hp >= 0
    }

    case "ATTACK_ATTEMPT": {
      const payload = event.payload as { target?: unknown }
      return !!event.entity_id && typeof payload.target === "string"
    }

    case "ENTITY_DIED": {
      const payload = event.payload as { entity_id?: unknown }
      return typeof payload.entity_id === "string"
    }

    case "ITEM_PICKED_UP":
    case "ITEM_DROPPED": {
      const payload = event.payload as {
        player_id?: unknown
        item_id?: unknown
      }
      return (
        typeof payload.player_id === "string" &&
        typeof payload.item_id === "string"
      )
    }

    case "CAST_SPELL": {
      const payload = event.payload as { spell_id?: unknown }
      return !!event.entity_id && typeof payload.spell_id === "string"
    }

    case "MANA_CHANGED": {
      const payload = event.payload as { entity_id?: unknown; new_mp?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.new_mp === "number" && payload.new_mp >= 0
    }

    case "GOLD_CHANGED": {
      const payload = event.payload as { entity_id?: unknown; new_gold?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.new_gold === "number" && payload.new_gold >= 0
    }

    case "ITEM_EQUIPPED": {
      const payload = event.payload as { entity_id?: unknown; item_id?: unknown; slot?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.item_id === "string" && typeof payload.slot === "string"
    }

    case "ITEM_UNEQUIPPED": {
      const payload = event.payload as { entity_id?: unknown; slot?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.slot === "string"
    }

    case "RUNE_ENGRAVED": {
      const payload = event.payload as { entity_id?: unknown; slot?: unknown; rune_id?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.slot === "string" && typeof payload.rune_id === "string"
    }

    case "XP_GAINED": {
      const payload = event.payload as { entity_id?: unknown; amount?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.amount === "number" && payload.amount >= 0
    }

    case "LEVEL_UP": {
      const payload = event.payload as { entity_id?: unknown; new_level?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.new_level === "number"
    }

    case "REPUTATION_CHANGED": {
      const payload = event.payload as { entity_id?: unknown; faction_id?: unknown; delta?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.faction_id === "string" && typeof payload.delta === "number"
    }

    case "QUEST_STARTED": {
      const payload = event.payload as { entity_id?: unknown; quest_id?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.quest_id === "string"
    }

    case "QUEST_PROGRESS": {
      const payload = event.payload as { entity_id?: unknown; quest_id?: unknown; objective_id?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.quest_id === "string" && typeof payload.objective_id === "string"
    }

    case "QUEST_COMPLETED": {
      const payload = event.payload as { entity_id?: unknown; quest_id?: unknown }
      return typeof payload.entity_id === "string" && typeof payload.quest_id === "string"
    }

    case "DIALOGUE_STARTED":
    case "DIALOGUE_CHOICE":
    case "DIALOGUE_NODE_SHOWN":
    case "DIALOGUE_ENDED": {
      return typeof (event.payload as Record<string, unknown>)["player_id"] === "string" ||
             typeof event.entity_id === "string"
    }

    case "FORAGE": {
      return typeof event.entity_id === "string"
    }

    case "FORAGE_SUCCESS": {
      const p = event.payload as { player_id?: unknown; item_id?: unknown }
      return typeof p.player_id === "string" && typeof p.item_id === "string"
    }

    case "FORAGE_FAILED": {
      const p = event.payload as { player_id?: unknown }
      return typeof p.player_id === "string"
    }

    case "EFFECT_EXPIRED":
    case "NPC_AGGROED":
    case "ATTACK_ATTEMPT": {
      return typeof event.entity_id === "string"
    }

    default:
      return true
  }
}
