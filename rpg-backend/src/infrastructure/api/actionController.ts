import { ActionRequest } from "../../domain/entities/entity"
import { enqueue } from "../queue/actionQueue"

export function handleAction(req: { body: unknown }): {
  status: number
  body: unknown
} {
  const action = req.body as ActionRequest

  if (!action || !action.type || !action.player_id) {
    return { status: 400, body: { error: "INVALID_ACTION" } }
  }

  if (!action.session_id || typeof action.session_id !== "string") {
    return { status: 400, body: { error: "SESSION_ID_REQUIRED" } }
  }

  enqueue(action)
  return { status: 202, body: { queued: true } }
}
