import { GameState, ActionRequest, Event } from "../domain/entities/entity"

export function validateAction(action: ActionRequest, state: GameState): void {
  if (!state.entities[action.player_id]) {
    throw new Error("INVALID_PLAYER")
  }

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

    default:
      return true
  }
}
