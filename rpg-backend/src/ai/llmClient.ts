import OpenAI from "openai"
import { SYSTEM_PROMPT, AIContext, AIResponse } from "./prompts"

let client: OpenAI | null = null

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  if (!client) {
    client = new OpenAI({ apiKey })
  }

  return client
}

function fallbackResponse(input: AIContext): AIResponse {
  const action = input.player_action as { type?: string }
  const actionType = action.type ?? "UNKNOWN_ACTION"

  return {
    narration: `Aktion ${actionType} wurde ohne KI-Narration verarbeitet. Setze OPENAI_API_KEY fuer LLM-Antworten.`,
    proposed_events: []
  }
}

export async function callLLM(input: AIContext): Promise<AIResponse> {
  const openAiClient = getClient()
  if (!openAiClient) {
    return fallbackResponse(input)
  }

  const res = await openAiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(input) }
    ],
    response_format: { type: "json_object" }
  })

  const content = res.choices[0].message.content
  if (!content) {
    throw new Error("Empty response from LLM")
  }

  return JSON.parse(content) as AIResponse
}
