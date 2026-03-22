// Canonical list of event type strings used throughout the system

export const EventTypes = {
  PLAYER_MOVED: "PLAYER_MOVED",
  ATTACK_ATTEMPT: "ATTACK_ATTEMPT",
  DAMAGE_APPLIED: "DAMAGE_APPLIED",
  ENTITY_DIED: "ENTITY_DIED",
  ITEM_PICKED_UP: "ITEM_PICKED_UP",
  ITEM_DROPPED: "ITEM_DROPPED",
  EFFECT_APPLIED: "EFFECT_APPLIED",
  EFFECT_EXPIRED: "EFFECT_EXPIRED",
  NPC_MOVED: "NPC_MOVED",
  NPC_ATTACKED: "NPC_ATTACKED",
  VISIBILITY_UPDATED: "VISIBILITY_UPDATED"
} as const

export type EventType = (typeof EventTypes)[keyof typeof EventTypes]
