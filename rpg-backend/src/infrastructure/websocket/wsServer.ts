import WebSocket from "ws"
import { ActionRequest } from "../../domain/entities/entity"
import { processAction } from "../../core/actionProcessor"

const PORT = parseInt(process.env.WS_PORT ?? "3001", 10)

const wss = new WebSocket.Server({ port: PORT })

/** Maps player_id → active WebSocket connection */
export const playerConnections = new Map<string, WebSocket>()

export function broadcastToPlayer(playerId: string, message: unknown): void {
  const ws = playerConnections.get(playerId)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", async (msg: Buffer | string) => {
    try {
      const data = JSON.parse(msg.toString()) as {
        type: string
        payload: ActionRequest & { player_id?: string }
      }

      if (data.type === "IDENTIFY") {
        const playerId = (data.payload as { player_id?: string }).player_id
        if (playerId) {
          playerConnections.set(playerId, ws)
        }
        return
      }

      if (data.type === "PLAYER_ACTION") {
        const action = data.payload

        // Register the connection by player_id so we can push later
        if (action.player_id) {
          playerConnections.set(action.player_id, ws)
        }

        const result = await processAction(action)
        ws.send(
          JSON.stringify({
            type: "ACTION_RESULT",
            narration: result.narration,
            events: result.events
          })
        )
      }
    } catch (err) {
      console.warn("WebSocket: received malformed message", err)
      ws.send(JSON.stringify({ type: "ERROR", message: String(err) }))
    }
  })

  ws.on("error", (err: Error) => {
    console.error("WebSocket: connection error", err)
  })

  ws.on("close", () => {
    // Clean up the connection from the map
    for (const [playerId, conn] of playerConnections.entries()) {
      if (conn === ws) {
        playerConnections.delete(playerId)
        break
      }
    }
  })
})

wss.on("error", (err: Error) => {
  console.error("WebSocket server error:", err)
})

export { wss }
