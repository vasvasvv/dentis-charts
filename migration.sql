-- Migration script to add doctor_id, middleName, and gender fields to patients table
-- This script should be run on the existing Cloudflare D1 database

-- Step 1: Add new columns to patients table
-- Note: SQLite doesn't support adding multiple columns with FOREIGN KEY in one statement
-- So we need to recreate the table

-- Create a temporary table with the new structure
CREATE TABLE patients_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  middleName TEXT,
  gender TEXT,
  dateOfBirth TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  doctor_id INTEGER NOT NULL DEFAULT 1, -- Default to first doctor during migration
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Copy data from old table to new table
INSERT INTO patients_new (id, firstName, lastName, dateOfBirth, phone, email, address, notes, created_at, updated_at)
SELECT id, firstName, lastName, dateOfBirth, phone, email, address, notes, created_at, updated_at
FROM patients;

-- Drop old table
DROP TABLE patients;

-- Rename new table to patients
ALTER TABLE patients_new RENAME TO patients;

-- Step 2: Update doctor_id for existing patients (optional - assign to first available doctor with role_id = 2)
-- You may want to manually assign doctors to patients based on your business logic
-- Example: UPDATE patients SET doctor_id = (SELECT id FROM users WHERE role_id = 2 LIMIT 1);

COMMIT;
