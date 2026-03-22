-- Database schema for Dungeon.AI RPG backend

-- ── Events ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  tick INT NOT NULL,
  entity_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS events_tick_idx ON events (tick ASC);
CREATE INDEX IF NOT EXISTS events_entity_id_idx ON events (entity_id);
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);

-- ── Snapshots ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snapshots (
  tick INT PRIMARY KEY,
  state JSONB NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS snapshots_session_idx ON snapshots (session_id);

-- ── Sessions ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  world_seed TEXT NOT NULL,
  created_at BIGINT NOT NULL,         -- epoch ms
  player_ids JSONB NOT NULL DEFAULT '[]',
  current_tick INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Players (metadata, not the full ECS entity) ───────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL DEFAULT 'warrior',
  race_id TEXT NOT NULL DEFAULT 'human',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  UNIQUE(id, session_id)
);

CREATE INDEX IF NOT EXISTS players_session_idx ON players (session_id);

-- ── Chat / Narration Log ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS narration_log (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  tick INT NOT NULL,
  player_id TEXT,
  action_type TEXT,
  narration TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS narration_session_tick_idx ON narration_log (session_id, tick DESC);
