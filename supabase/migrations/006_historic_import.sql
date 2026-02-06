ALTER TABLE event_results
ALTER COLUMN position DROP NOT NULL;

ALTER TABLE event_results
ADD COLUMN IF NOT EXISTS position_text text,
ADD COLUMN IF NOT EXISTS position_label text,
ADD COLUMN IF NOT EXISTS is_bubble boolean,
ADD COLUMN IF NOT EXISTS bounty_count numeric,
ADD COLUMN IF NOT EXISTS bounty_credit_name text;

ALTER TABLE event_nights
ADD COLUMN IF NOT EXISTS players_count integer,
ADD COLUMN IF NOT EXISTS venue text;
