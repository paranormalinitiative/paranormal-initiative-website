ALTER TABLE contributors ADD COLUMN contact_name TEXT;
ALTER TABLE contributors ADD COLUMN phone TEXT;
ALTER TABLE contributors ADD COLUMN address_line1 TEXT;
ALTER TABLE contributors ADD COLUMN address_line2 TEXT;
ALTER TABLE contributors ADD COLUMN city TEXT;
ALTER TABLE contributors ADD COLUMN state TEXT;
ALTER TABLE contributors ADD COLUMN postal_code TEXT;
ALTER TABLE contributors ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contributors ADD COLUMN phone_verified INTEGER NOT NULL DEFAULT 0;
