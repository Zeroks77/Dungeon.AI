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

    default:
      return true
  }
}
