import WebSocket from "ws"
import { enqueue } from "../queue/actionQueue"
import { ActionRequest, GameState } from "../../domain/entities/entity"
import { getVisibleTileKeys } from "../../utils/fov"

const PORT = parseInt(process.env.WS_PORT ?? "3001", 10)

const wss = new WebSocket.Server({ port: PORT })

type ClientInfo = { playerId?: string; sessionId?: string }

// Track connected clients with their player IDs
const clientMap = new Map<WebSocket, ClientInfo>()

function connectionKey(sessionId: string, playerId: string): string {
  return `${sessionId}:${playerId}`
}

/** Maps player_id → active WebSocket connection (for targeted messages) */
export const playerConnections = new Map<string, WebSocket>()

export function broadcastToPlayer(sessionId: string, playerId: string, message: unknown): void {
  const ws = playerConnections.get(connectionKey(sessionId, playerId))
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

wss.on("connection", (ws) => {
  clientMap.set(ws, {})

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString()) as {
        type: string
        payload: ActionRequest | { player_id: string }
      }

      if (data.type === "PLAYER_ACTION") {
        const action = data.payload as ActionRequest
        if (!action.session_id) {
          ws.send(JSON.stringify({ type: "ERROR", message: "SESSION_ID_REQUIRED" }))
          return
        }
        if (action.player_id) {
          clientMap.set(ws, { playerId: action.player_id, sessionId: action.session_id })
          playerConnections.set(connectionKey(action.session_id, action.player_id), ws)
        }
        enqueue(action)
      }

      if (data.type === "IDENTIFY") {
        const { player_id, session_id } = data.payload as { player_id: string; session_id?: string }
        if (!session_id) {
          ws.send(JSON.stringify({ type: "ERROR", message: "SESSION_ID_REQUIRED" }))
          return
        }
        clientMap.set(ws, { playerId: player_id, sessionId: session_id })
        playerConnections.set(connectionKey(session_id, player_id), ws)
        ws.send(JSON.stringify({ type: "IDENTIFIED", player_id, session_id }))
      }

    } catch (err) {
      console.warn("WebSocket: received malformed message", err)
      ws.send(JSON.stringify({ type: "ERROR", message: String(err) }))
    }
  })

  ws.on("close", () => {
    clientMap.delete(ws)
    for (const [playerKey, conn] of playerConnections.entries()) {
      if (conn === ws) {
        playerConnections.delete(playerKey)
        break
      }
    }
  })

  ws.on("error", (err) => {
    console.error("WebSocket: connection error", err)
  })
})

wss.on("error", (err: Error) => {
  console.error("WebSocket server error:", err)
})

// Broadcast a state update to all connected clients.
// Each client only receives entities and tiles visible to their player.
export function broadcastStateUpdate(state: GameState, changedEvents: unknown[]): void {
  for (const [ws, info] of clientMap.entries()) {
    if (ws.readyState !== WebSocket.OPEN) continue
    if (info.sessionId !== state.sessionId) continue

    const playerId = info.playerId

    let visibleEntities: Record<string, unknown> = state.entities
    let visibleTiles: Record<string, unknown> = {}

    if (playerId && state.entities[playerId]) {
      const player = state.entities[playerId]
      const pos = player.components.position as { q: number; r: number } | undefined
      if (pos) {
        const visionRange =
          (player.components.character as { visionRange?: number } | undefined)?.visionRange ?? 6

        const visibleKeys = getVisibleTileKeys(pos, visionRange, state)

        // Only include entities that are on visible tiles
        visibleEntities = Object.fromEntries(
          Object.entries(state.entities).filter(([, e]) => {
            const epos = e.components.position as { q: number; r: number } | undefined
            if (!epos) return false
            return visibleKeys.has(`${epos.q},${epos.r}`)
          })
        )

        // Include visible tiles
        for (const key of visibleKeys) {
          if (state.worldTiles?.[key]) visibleTiles[key] = state.worldTiles[key]
        }
      }
    }

    ws.send(JSON.stringify({
      type: "STATE_UPDATE",
      session_id: state.sessionId,
      tick: state.tick,
      timeOfDay: state.timeOfDay,
      weather: state.weather,
      player: playerId ? state.entities[playerId] : undefined,
      entities: visibleEntities,
      effects: state.effects,
      visible_tiles: visibleTiles,
      events: changedEvents
    }))
  }
}

// Send a targeted message to a specific player
export function sendToPlayer(sessionId: string, playerId: string, message: unknown): boolean {
  for (const [ws, info] of clientMap.entries()) {
    if (info.playerId === playerId && info.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
  }
  return false
}

export function getConnectedPlayerCount(): number {
  return clientMap.size
}

export { wss }
