-- Migration created at 2025-12-01T17:24:04.184Z

CREATE TABLE flag_ (
    flag_key VARCHAR(255) NOT NULL PRIMARY KEY,
    override_value BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
