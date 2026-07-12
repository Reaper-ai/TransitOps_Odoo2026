# backend/app/db/seed_db.py
import sqlite3
import json
import os
from dotenv import load_dotenv
# Load the file directly from the execution path context
load_dotenv()

# Fallback safely to current working folder if .env isn't set yet
DB_PATH = os.getenv("DB_PATH", "transitops.db")

JSON_PATH = os.getenv("JSON_PATH", "seed_data.json")

def seed_database():
    if not os.path.exists(JSON_PATH):
        print(f"Error: Could not locate dummy JSON framework file at {JSON_PATH}")
        return

    with open(JSON_PATH, "r") as f:
        data = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print("Populating initial data structures...")

    # Insert Users
    cursor.executemany("""
        INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (:email, :password_hash, :role)
    """, data.get("users", []))

    # Insert Destinations
    # If not present in JSON array, fallback to default boilerplate seeds:
    destinations = data.get("destinations", [
        {"name": "Warehouse A", "region": "North"},
        {"name": "Hub B", "region": "East"}
    ])
    cursor.executemany("""
        INSERT OR IGNORE INTO destinations (name, region) VALUES (:name, :region)
    """, destinations)

    # Insert Vehicles[cite: 1]
    cursor.executemany("""
        INSERT OR IGNORE INTO vehicles (registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
        VALUES (:registration_number, :model, :type, :max_load_capacity, :odometer, :acquisition_cost, :status)
    """, data.get("vehicles", []))

    # Insert Drivers[cite: 1]
    cursor.executemany("""
        INSERT OR IGNORE INTO drivers (license_number, name, license_category, license_expiry_date, contact_number, safety_score, status)
        VALUES (:license_number, :name, :license_category, :license_expiry_date, :contact_number, :safety_score, :status)
    """, data.get("drivers", []))

    # Insert Trips[cite: 1]
    cursor.executemany("""
        INSERT OR IGNORE INTO trips (id, source_name, destination_name, vehicle_reg, driver_license, cargo_weight, planned_distance, revenue, status)
        VALUES (:id, :source_name, :destination_name, :vehicle_reg, :driver_license, :cargo_weight, :planned_distance, :revenue, :status)
    """, data.get("trips", []))

    # Insert Maintenance Records[cite: 1]
    cursor.executemany("""
        INSERT OR IGNORE INTO maintenance_logs (id, vehicle_reg, description, cost, start_date, end_date, status)
        VALUES (:id, :vehicle_reg, :description, :cost, :start_date, :end_date, :status)
    """, data.get("maintenance_logs", []))

    # Insert Expenses[cite: 1]
    cursor.executemany("""
        INSERT OR IGNORE INTO expenses (id, trip_id, type, liters, cost, date)
        VALUES (:id, :trip_id, :type, :liters, :cost, :date)
    """, data.get("fuel_expenses", []))

    conn.commit()
    conn.close()
    print("Database seeding pipelines terminated cleanly.")

if __name__ == "__main__":
    seed_database()