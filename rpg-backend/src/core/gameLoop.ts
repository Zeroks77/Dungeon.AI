import { processQueue } from "../infrastructure/queue/actionQueue"
import { loadLatestSnapshot } from "../infrastructure/eventStore/snapshotStore"
import { loadEvents, appendEvents } from "../infrastructure/eventStore/eventStore"
import { buildState, applyEvents } from "../domain/events/applyEvent"
import { validateEvent } from "./validation"
import { processRegen, processEffectTicks } from "../domain/systems/regenSystem"
import { processNpcs } from "../domain/systems/npcSystem"
import { processRespawn } from "../domain/systems/respawnSystem"
import { GameState } from "../domain/entities/entity"

const TICK_INTERVAL_MS = 100

async function runTick(): Promise<void> {
  try {
    // 1. Load current state (snapshot + events)
    const snapshot = await loadLatestSnapshot()
    const baseState: GameState = snapshot ?? { tick: 0, entities: {}, effects: [] }
    const events = await loadEvents(baseState.tick)
    const state = buildState(baseState, events)

    // 2. Run regen, effect ticks, respawn, and NPC AI
    const regenEvents = processRegen(state)
    const effectEvents = processEffectTicks(state)
    applyEvents(state, [...regenEvents, ...effectEvents])

    const respawnEvents = processRespawn(state)
    applyEvents(state, respawnEvents)

    const npcEvents = processNpcs(state)
    applyEvents(state, npcEvents)

    // 3. Persist resulting events
    const allTickEvents = [
      ...regenEvents,
      ...effectEvents,
      ...respawnEvents,
      ...npcEvents
    ].filter(validateEvent)

    if (allTickEvents.length > 0) {
      await appendEvents(allTickEvents)
    }
  } catch (err) {
    console.error("Game loop tick error:", err)
  }

  // 4. Process any queued player actions
  await processQueue()
}

function startGameLoop(): NodeJS.Timeout {
  return setInterval(async () => {
    await runTick()
  }, TICK_INTERVAL_MS)
}

export { startGameLoop }

// Start the game loop and WebSocket server when run directly
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../infrastructure/websocket/wsServer")

  startGameLoop()

  console.log("Game loop started. Listening for actions...")
}
