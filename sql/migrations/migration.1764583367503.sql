-- Migration created at 2025-12-01T10:02:47.503Z

ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(255);
