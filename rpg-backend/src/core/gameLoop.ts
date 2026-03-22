import { processQueue } from "../infrastructure/queue/actionQueue"
import { saveSnapshot } from "../infrastructure/eventStore/snapshotStore"
import { applyEvents } from "../domain/events/applyEvent"
import { validateEvent } from "./validation"
import { processRegen, processEffectTicks } from "../domain/systems/regenSystem"
import { processNpcs } from "../domain/systems/npcSystem"
import { processEffects } from "../domain/systems/effectSystem"
import { processRespawn } from "../domain/systems/respawnSystem"
import { GameState } from "../domain/entities/entity"
import { broadcastStateUpdate } from "../infrastructure/websocket/wsServer"
import { appendEvents } from "../infrastructure/eventStore/eventStore"
import { loadStateForSession } from "./sessionState"
import { listSessions, updateSessionTick } from "../infrastructure/eventStore/sessionStore"

const TICK_INTERVAL_MS = 100
const SNAPSHOT_EVERY_N_TICKS = 100
const BROADCAST_EVERY_N_TICKS = 3  // Broadcast state every 300ms

const activeStates = new Map<string, GameState>()

async function runTick(state: GameState): Promise<{ state: GameState; systemEvents: unknown[] }> {
  if (!state.sessionId) {
    throw new Error("SESSION_ID_REQUIRED")
  }

  const tick = state.tick + 1
  state.tick = tick

  // Advance time of day (1440 ticks = 1 day, 1 tick = ~6 seconds game-time)
  state.timeOfDay = Math.floor((tick % 1440) / 60)

  // Process regen and effect ticks
  const regenEvents = processRegen(state)
  const effectTickEvents = processEffectTicks(state)
  applyEvents(state, [...regenEvents, ...effectTickEvents])

  // Process respawns
  const respawnEvents = processRespawn(state)
  applyEvents(state, respawnEvents)

  // Process NPC autonomous actions
  const npcEvents = processNpcs(state)
  const validNpcEvents = npcEvents.filter(validateEvent)

  // Process effect expiry
  const effectEvents = processEffects(state)
  const validEffectEvents = effectEvents.filter(validateEvent)

  const systemEvents = [
    ...regenEvents.filter(validateEvent),
    ...effectTickEvents.filter(validateEvent),
    ...respawnEvents.filter(validateEvent),
    ...validNpcEvents,
    ...validEffectEvents
  ]

  if (systemEvents.length > 0) {
    applyEvents(state, [...validNpcEvents, ...validEffectEvents])
    await appendEvents(systemEvents, state.sessionId)
  }

  // Auto-snapshot every N ticks
  if (tick % SNAPSHOT_EVERY_N_TICKS === 0) {
    await saveSnapshot(state)
    console.log(`[GameLoop] Snapshot saved at tick ${tick}`)
  }

  return { state, systemEvents }
}

async function syncSessions(): Promise<string[]> {
  const sessions = await listSessions()
  const liveSessionIds = new Set(sessions.map(session => session.sessionId))

  for (const session of sessions) {
    if (!activeStates.has(session.sessionId)) {
      const state = await loadStateForSession(session.sessionId)
      activeStates.set(session.sessionId, state)
      console.log(`[GameLoop] Initialized session ${session.sessionId} at tick ${state.tick}`)
    }
  }

  for (const sessionId of activeStates.keys()) {
    if (!liveSessionIds.has(sessionId)) {
      activeStates.delete(sessionId)
    }
  }

  return sessions.map(session => session.sessionId)
}

function startGameLoop(): NodeJS.Timeout {
  let running = false

  return setInterval(async () => {
    if (running) return
    running = true

    try {
      const sessionIds = await syncSessions()

      for (const sessionId of sessionIds) {
        const state = activeStates.get(sessionId)
        if (!state) continue

        await processQueue(state)

        const { systemEvents } = await runTick(state)
        activeStates.set(sessionId, state)
        await updateSessionTick(sessionId, state.tick)

        if (state.tick % BROADCAST_EVERY_N_TICKS === 0) {
          broadcastStateUpdate(state, systemEvents)
        }
      }

    } catch (err) {
      console.error("[GameLoop] Tick error:", err)
    } finally {
      running = false
    }
  }, TICK_INTERVAL_MS)
}

export { startGameLoop, activeStates }

// Start the game loop and servers when run directly
if (require.main === module) {
  require("../infrastructure/websocket/wsServer")
  const { startApiServer } = require("../infrastructure/api/server")
  startApiServer()
  startGameLoop()
  console.log("Game loop started. Listening for actions...")
}
