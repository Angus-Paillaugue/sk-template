-- Migration created at 2025-12-01T17:24:04.184Z

CREATE TABLE flag (
    flag_key VARCHAR(255) NOT NULL PRIMARY KEY,
    description TEXT,
    chance INTEGER DEFAULT 0,
    override_value BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
