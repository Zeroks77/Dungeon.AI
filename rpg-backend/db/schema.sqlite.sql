CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  tick INTEGER NOT NULL,
  entity_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS events_tick_idx ON events (tick ASC);
CREATE INDEX IF NOT EXISTS events_entity_id_idx ON events (entity_id);
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);

CREATE TABLE IF NOT EXISTS snapshots (
  tick INTEGER PRIMARY KEY,
  state TEXT NOT NULL,
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS snapshots_session_idx ON snapshots (session_id);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  world_seed TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  player_ids TEXT NOT NULL DEFAULT '[]',
  current_tick INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL DEFAULT 'warrior',
  race_id TEXT NOT NULL DEFAULT 'human',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT,
  UNIQUE(id, session_id)
);

CREATE INDEX IF NOT EXISTS players_session_idx ON players (session_id);

CREATE TABLE IF NOT EXISTS narration_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  tick INTEGER NOT NULL,
  player_id TEXT,
  action_type TEXT,
  narration TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS narration_session_tick_idx ON narration_log (session_id, tick DESC);

CREATE TABLE IF NOT EXISTS session_events (
  session_id TEXT NOT NULL,
  id TEXT NOT NULL,
  type TEXT NOT NULL,
  tick INTEGER NOT NULL,
  entity_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (session_id, id)
);

CREATE INDEX IF NOT EXISTS session_events_tick_idx ON session_events (session_id, tick ASC);
CREATE INDEX IF NOT EXISTS session_events_entity_id_idx ON session_events (session_id, entity_id);

CREATE TABLE IF NOT EXISTS session_snapshots (
  session_id TEXT NOT NULL,
  tick INTEGER NOT NULL,
  state TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id, tick)
);

CREATE INDEX IF NOT EXISTS session_snapshots_latest_idx ON session_snapshots (session_id, tick DESC);