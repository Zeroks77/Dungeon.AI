import { ActionRequest, GameState } from "../../domain/entities/entity"
import { processAction } from "../../core/actionProcessor"

// In-memory queue — suitable for single-process development.
// For production, replace with a persistent queue (e.g. Redis, PostgreSQL).
const queue: ActionRequest[] = []

export function enqueue(action: ActionRequest): void {
  queue.push(action)
}

export async function processQueue(state: GameState): Promise<void> {
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
}
