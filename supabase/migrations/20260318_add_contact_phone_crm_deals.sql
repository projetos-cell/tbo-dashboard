-- Add contact_phone to crm_deals for richer RD Station sync
ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS contact_phone text;
