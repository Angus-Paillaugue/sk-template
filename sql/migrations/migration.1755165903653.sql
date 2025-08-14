-- Migration created at 2025-08-14T10:05:03.653Z

ALTER TABLE users ADD COLUMN totp_secret TEXT DEFAULT NULL;
