import OpenAI from "openai"
import { SYSTEM_PROMPT, AIContext, AIResponse } from "./prompts"

const client = new OpenAI()

export async function callLLM(input: AIContext): Promise<AIResponse> {
  const res = await client.chat.completions.create({
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
