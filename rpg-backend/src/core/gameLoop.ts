import { processQueue } from "../infrastructure/queue/actionQueue"

const TICK_INTERVAL_MS = 100

function startGameLoop(): NodeJS.Timeout {
  return setInterval(async () => {
    await processQueue()
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
