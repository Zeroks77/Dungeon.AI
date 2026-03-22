import Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"

const rootDir = path.resolve(__dirname, "../../..")
const defaultDbFile = path.join(rootDir, "data", "dungeon-ai.sqlite")
const schemaPath = path.join(rootDir, "db", "schema.sqlite.sql")

const dbFile = process.env.DB_FILE
  ? path.resolve(process.cwd(), process.env.DB_FILE)
  : defaultDbFile

fs.mkdirSync(path.dirname(dbFile), { recursive: true })

const db = new Database(dbFile)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")
db.exec(fs.readFileSync(schemaPath, "utf8"))

export function getDatabase(): Database.Database {
  return db
}

export function getDatabaseFile(): string {
  return dbFile
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  return JSON.parse(value) as T
}