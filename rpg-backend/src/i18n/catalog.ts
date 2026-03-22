import de from "./locales/de.json"
import en from "./locales/en.json"

export type LanguagePack = typeof de

const languagePacks: Record<string, LanguagePack> = {
  de,
  en
}

export function normalizeLocale(input?: string): string {
  if (!input) return "de"
  const normalized = input.toLowerCase().split(/[-_]/)[0]
  return languagePacks[normalized] ? normalized : "de"
}

export function getLanguagePack(locale?: string): LanguagePack {
  return languagePacks[normalizeLocale(locale)]
}

export function listSupportedLocales(): string[] {
  return Object.keys(languagePacks)
}