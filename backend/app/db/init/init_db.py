# backend/app/db/init_db.py
import sqlite3
import os
from dotenv import load_dotenv
# Load the file directly from the execution path context
load_dotenv()

# Fallback safely to current working folder if .env isn't set yet
DB_PATH = os.getenv("DB_PATH", "transitops.db")

def build_schema():
    print(f"Connecting to database at: {os.path.abspath(DB_PATH)}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enforce relational consistency constraints
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print("Creating tables...")
    
    # Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst')) NOT NULL
    );
    """)
    
    # Destinations Master
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS destinations (
        name TEXT PRIMARY KEY,
        region TEXT NOT NULL
    );
    """)
    
    # Vehicles (Keyed by Registration Number)[cite: 1]
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        registration_number TEXT PRIMARY KEY,
        model TEXT NOT NULL,
        type TEXT NOT NULL,
        max_load_capacity REAL NOT NULL,
        odometer REAL NOT NULL,
        acquisition_cost REAL NOT NULL,
        status TEXT CHECK(status IN ('Available', 'On Trip', 'In Shop', 'Retired')) DEFAULT 'Available'
    );
    """)
    
    # Drivers (Keyed by License Number)[cite: 1]
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drivers (
        license_number TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        license_category TEXT NOT NULL,
        license_expiry_date TEXT NOT NULL, -- YYYY-MM-DD
        contact_number TEXT NOT NULL,
        safety_score REAL DEFAULT 100.0,
        status TEXT CHECK(status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')) DEFAULT 'Available'
    );
    """)
    
    # Trips Management[cite: 1]
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_name TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        vehicle_reg TEXT NOT NULL,
        driver_license TEXT NOT NULL,
        cargo_weight REAL NOT NULL,
        planned_distance REAL NOT NULL,
        revenue REAL DEFAULT 0.0,
        status TEXT CHECK(status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')) DEFAULT 'Draft',
        FOREIGN KEY (source_name) REFERENCES destinations(name),
        FOREIGN KEY (destination_name) REFERENCES destinations(name),
        FOREIGN KEY (vehicle_reg) REFERENCES vehicles(registration_number),
        FOREIGN KEY (driver_license) REFERENCES drivers(license_number)
    );
    """)
    
    # Maintenance Workflow[cite: 1]
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_reg TEXT NOT NULL,
        description TEXT NOT NULL,
        cost REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        status TEXT CHECK(status IN ('Open', 'Closed')) DEFAULT 'Open',
        FOREIGN KEY (vehicle_reg) REFERENCES vehicles(registration_number)
    );
    """)
    
    # Expenses (Directly tied to context of Trips)[cite: 1]
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('Fuel', 'Toll', 'Maintenance-Surge', 'Other')) NOT NULL,
        liters REAL, 
        cost REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    conn.close()
    print("Schema built successfully! Connection closed.")

if __name__ == "__main__":
    build_schema()