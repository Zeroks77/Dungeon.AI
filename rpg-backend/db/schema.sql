-- Database schema for Dungeon.AI RPG backend

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  tick INT NOT NULL,
  entity_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS events_tick_idx ON events (tick ASC);
CREATE INDEX IF NOT EXISTS events_entity_id_idx ON events (entity_id);

CREATE TABLE IF NOT EXISTS snapshots (
  tick INT PRIMARY KEY,
  state JSONB NOT NULL
);
