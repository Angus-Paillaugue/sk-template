-- Migration SQL Script at 2025-08-05T17:21:10.000Z

\c "sk-template";

GRANT ALL PRIVILEGES ON DATABASE "sk-template" TO "sk-template";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO "sk-template";

CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
