import { ActionRequest, GameState } from "../../domain/entities/entity"
import { processAction } from "../../core/actionProcessor"

// In-memory queue — suitable for single-process development.
// For production, replace with a persistent queue (e.g. Redis, PostgreSQL).
const queueBySession = new Map<string, ActionRequest[]>()

function getQueue(sessionId: string): ActionRequest[] {
  const existing = queueBySession.get(sessionId)
  if (existing) return existing

  const created: ActionRequest[] = []
  queueBySession.set(sessionId, created)
  return created
}

export function enqueue(action: ActionRequest): void {
  if (!action.session_id) {
    throw new Error("SESSION_ID_REQUIRED")
  }

  getQueue(action.session_id).push(action)
}

export async function processQueue(state: GameState): Promise<void> {
  if (!state.sessionId) return

  const queue = getQueue(state.sessionId)

  // Drain at most 10 actions per tick to prevent starvation
  const maxPerTick = 10
  let processed = 0

  while (queue.length > 0 && processed < maxPerTick) {
    const action = queue.shift()
    if (action) {
      await processAction(action, state)
      processed++
    }
  }

  if (queue.length === 0) {
    queueBySession.delete(state.sessionId)
  }
}
