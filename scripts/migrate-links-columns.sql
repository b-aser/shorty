-- Run this in your MySQL client BEFORE `pnpm db:push`.
-- Do NOT truncate links — click_events has a foreign key to links.

-- 1. Widen short_code (safe, no data loss)
ALTER TABLE links MODIFY COLUMN short_code VARCHAR(50) NOT NULL;

-- 2. Add new columns (nullable / defaulted so existing rows are valid)
ALTER TABLE links ADD COLUMN normalized_code VARCHAR(50) NULL;
ALTER TABLE links ADD COLUMN is_custom_code BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Backfill normalized_code from existing short codes
UPDATE links SET normalized_code = LOWER(short_code) WHERE normalized_code IS NULL;

-- 4. Enforce NOT NULL + uniqueness (matches schema.ts)
ALTER TABLE links MODIFY COLUMN normalized_code VARCHAR(50) NOT NULL;
ALTER TABLE links ADD CONSTRAINT links_normalized_code_unique UNIQUE (normalized_code);
CREATE INDEX normalized_code_idx ON links (normalized_code);
