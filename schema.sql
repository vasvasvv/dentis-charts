-- Create tables for Dentis Cards

-- Roles: superadmin, doctor, admin
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('superadmin'), ('doctor'), ('admin');

-- Users/Employees
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  fullName TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Patients
CREATE TABLE patients (
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
  doctor_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Visits
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  visitDate TEXT NOT NULL,
  type TEXT DEFAULT 'future' CHECK(type IN ('past', 'future')),
  reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Tooth Data (Status of each tooth for a patient)
CREATE TABLE tooth_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  tooth_number INTEGER NOT NULL,
  status TEXT NOT NULL, -- e.g., 'healthy', 'caries', 'filling', 'missing', 'crown'
  notes TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  UNIQUE(patient_id, tooth_number)
);

-- History of changes (Audit Log)
CREATE TABLE history_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- 'patient' or 'tooth'
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  changes TEXT, -- JSON string of changes
  changed_by INTEGER NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
