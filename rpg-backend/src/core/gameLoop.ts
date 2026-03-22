import { processQueue } from "../infrastructure/queue/actionQueue"
import { loadLatestSnapshot, saveSnapshot } from "../infrastructure/eventStore/snapshotStore"
import { loadEvents, appendEvents } from "../infrastructure/eventStore/eventStore"
import { buildState, applyEvents } from "../domain/events/applyEvent"
import { validateEvent } from "./validation"
import { processNpcs } from "../domain/systems/npcSystem"
import { processEffects } from "../domain/systems/effectSystem"
import { GameState } from "../domain/entities/entity"
import { broadcastStateUpdate } from "../infrastructure/websocket/wsServer"

const TICK_INTERVAL_MS = 100
const SNAPSHOT_EVERY_N_TICKS = 100
const BROADCAST_EVERY_N_TICKS = 3  // Broadcast state every 300ms

// In-memory reference to active game state (single session for now)
let activeState: GameState | null = null

async function initializeState(): Promise<GameState> {
  const snapshot = await loadLatestSnapshot()
  const baseState: GameState = snapshot ?? {
    tick: 0,
    entities: {},
    effects: [],
    weather: "clear",
    timeOfDay: 8
  }
  const events = await loadEvents(baseState.tick)
  return buildState(baseState, events)
}

async function runTick(state: GameState): Promise<{ state: GameState; systemEvents: unknown[] }> {
  const tick = state.tick + 1
  state.tick = tick

  // Advance time of day (1440 ticks = 1 day, 1 tick = ~6 seconds game-time)
  state.timeOfDay = Math.floor((tick % 1440) / 60)

  // Process NPC autonomous actions
  const npcEvents = processNpcs(state)
  const validNpcEvents = npcEvents.filter(validateEvent)

  // Process effect expiry
  const effectEvents = processEffects(state)
  const validEffectEvents = effectEvents.filter(validateEvent)

  const systemEvents = [...validNpcEvents, ...validEffectEvents]

  if (systemEvents.length > 0) {
    applyEvents(state, systemEvents)
    await appendEvents(systemEvents)
  }

  // Auto-snapshot every N ticks
  if (tick % SNAPSHOT_EVERY_N_TICKS === 0) {
    await saveSnapshot(state)
    console.log(`[GameLoop] Snapshot saved at tick ${tick}`)
  }

  return { state, systemEvents }
}

function startGameLoop(): NodeJS.Timeout {
  let running = false

  return setInterval(async () => {
    if (running) return
    running = true

    try {
      if (!activeState) {
        activeState = await initializeState()
        console.log(`[GameLoop] Initialized at tick ${activeState.tick}`)
      }

      // Process player actions from queue
      await processQueue(activeState)

      // Run system tick
      const { systemEvents } = await runTick(activeState)

      // Broadcast state to WebSocket clients every N ticks
      if (activeState.tick % BROADCAST_EVERY_N_TICKS === 0) {
        broadcastStateUpdate(activeState, systemEvents)
      }

    } catch (err) {
      console.error("[GameLoop] Tick error:", err)
    } finally {
      running = false
    }
  }, TICK_INTERVAL_MS)
}

export { startGameLoop, activeState }

// Start the game loop and servers when run directly
if (require.main === module) {
  require("../infrastructure/websocket/wsServer")
  const { startApiServer } = require("../infrastructure/api/server")
  startApiServer()
  startGameLoop()
  console.log("Game loop started. Listening for actions...")
}
