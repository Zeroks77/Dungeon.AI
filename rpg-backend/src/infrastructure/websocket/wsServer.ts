import WebSocket from "ws"
import { enqueue } from "../queue/actionQueue"
import { ActionRequest } from "../../domain/entities/entity"

const PORT = parseInt(process.env.WS_PORT ?? "3001", 10)

const wss = new WebSocket.Server({ port: PORT })

wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString()) as {
        type: string
        payload: ActionRequest
      }

      if (data.type === "PLAYER_ACTION") {
        enqueue(data.payload)
      }
    } catch (err) {
      console.warn("WebSocket: received malformed message", err)
    }
  })

  ws.on("error", (err) => {
    console.error("WebSocket: connection error", err)
  })
})

wss.on("error", (err) => {
  console.error("WebSocket server error:", err)
})

export { wss }
