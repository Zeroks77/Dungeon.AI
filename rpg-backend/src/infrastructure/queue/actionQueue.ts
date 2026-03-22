import { ActionRequest } from "../../domain/entities/entity"
import { processAction } from "../../core/actionProcessor"

// In-memory queue — suitable for single-process development.
// For production, replace with a persistent queue (e.g. Redis, PostgreSQL).
const queue: ActionRequest[] = []

export function enqueue(action: ActionRequest): void {
  queue.push(action)
}

export async function processQueue(): Promise<void> {
  while (queue.length > 0) {
    const action = queue.shift()
    if (action) {
      await processAction(action)
    }
  }
}
