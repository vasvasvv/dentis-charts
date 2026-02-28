-- Migration: Add type field to visits table
-- Date: 2026-02-28
-- Description: Adds 'type' column to visits table to distinguish between past and future visits

-- Add type column with default value 'future'
ALTER TABLE visits ADD COLUMN type TEXT DEFAULT 'future' CHECK(type IN ('past', 'future'));

-- Optional: Update existing visits based on visitDate
-- UPDATE visits SET type = 'past' WHERE visitDate < date('now');
-- UPDATE visits SET type = 'future' WHERE visitDate >= date('now');
