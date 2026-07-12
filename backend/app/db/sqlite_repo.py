# backend/app/db/sqlite_repo.py
import os
import sqlite3
from typing import List, Dict, Any, Optional
from .base import BaseRepository

from dotenv import load_dotenv
# Load the file directly from the execution path context
load_dotenv()

# Fallback safely to current working folder if .env isn't set yet
DB_PATH = os.getenv("DB_PATH", "transitops.db")


class SQLiteRepository(BaseRepository):
    def _get_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    # ==========================================
    # 1. CRUD DRIVER LOGIC
    # ==========================================
    def create_driver(self, driver_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO drivers (license_number, name, license_category, license_expiry_date, contact_number, safety_score, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (driver_data['license_number'], driver_data['name'], driver_data['license_category'], 
                  driver_data['license_expiry_date'], driver_data['contact_number'], 
                  driver_data.get('safety_score', 100.0), driver_data.get('status', 'Available')))
            conn.commit()
            return driver_data

    def get_driver_by_license(self, license_number: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM drivers WHERE license_number = ?", (license_number,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_driver(self, license_number: str, driver_data: Dict[str, Any]) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE drivers SET name=?, license_category=?, license_expiry_date=?, contact_number=?, safety_score=?, status=?
                WHERE license_number=?
            """, (driver_data['name'], driver_data['license_category'], driver_data['license_expiry_date'], 
                  driver_data['contact_number'], driver_data['safety_score'], driver_data['status'], license_number))
            conn.commit()
            return cursor.rowcount > 0

    def delete_driver(self, license_number: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM drivers WHERE license_number = ?", (license_number,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================
    # 2. CRUD VEHICLE LOGIC
    # ==========================================
    def create_vehicle(self, vehicle_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO vehicles (registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (vehicle_data['registration_number'], vehicle_data['model'], vehicle_data['type'], 
                  vehicle_data['max_load_capacity'], vehicle_data['odometer'], vehicle_data['acquisition_cost'], 
                  vehicle_data.get('status', 'Available')))
            conn.commit()
            return vehicle_data

    def get_vehicle_by_reg(self, registration_number: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vehicles WHERE registration_number = ?", (registration_number,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_vehicle(self, registration_number: str, vehicle_data: Dict[str, Any]) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE vehicles SET model=?, type=?, max_load_capacity=?, odometer=?, acquisition_cost=?, status=?
                WHERE registration_number=?
            """, (vehicle_data['model'], vehicle_data['type'], vehicle_data['max_load_capacity'], 
                  vehicle_data['odometer'], vehicle_data['acquisition_cost'], vehicle_data['status'], registration_number))
            conn.commit()
            return cursor.rowcount > 0

    def delete_vehicle(self, registration_number: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM vehicles WHERE registration_number = ?", (registration_number,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================
    # 3. CRUD USER LOGIC
    # ==========================================
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)", 
                           (user_data['email'], user_data['password_hash'], user_data['role']))
            conn.commit()
            return user_data

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_user(self, email: str, user_data: Dict[str, Any]) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET password_hash=?, role=? WHERE email=?", 
                           (user_data['password_hash'], user_data['role'], email))
            conn.commit()
            return cursor.rowcount > 0

    def delete_user(self, email: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE email = ?", (email,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================
    # 4. EXPENSES LAYER
    # ==========================================
    def add_expense(self, expense_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO expenses (trip_id, type, liters, cost, date) VALUES (?, ?, ?, ?, ?)
            """, (expense_data['trip_id'], expense_data['type'], expense_data.get('liters'), 
                  expense_data['cost'], expense_data['date']))
            conn.commit()
            expense_data['id'] = cursor.lastrowid
            return expense_data

    def get_expenses_by_trip(self, trip_id: int) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM expenses WHERE trip_id = ?", (trip_id,))
            return [dict(row) for row in cursor.fetchall()]

    # ==========================================
    # 5. DESTINATIONS MASTER
    # ==========================================
    def create_destination(self, dest_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO destinations (name, region) VALUES (?, ?)", 
                           (dest_data['name'], dest_data['region']))
            conn.commit()
            return dest_data

    def get_all_destinations(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM destinations")
            return [dict(row) for row in cursor.fetchall()]

    def delete_destination(self, name: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM destinations WHERE name = ?", (name,))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================
    # 6. MAINTENANCE LIFECYCLE
    # ==========================================
    def create_maintenance_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO maintenance_logs (vehicle_reg, description, cost, start_date, end_date, status)
                VALUES (?, ?, ?, ?, ?, 'Open')
            """, (log_data['vehicle_reg'], log_data['description'], log_data['cost'], 
                  log_data['start_date'], log_data.get('end_date')))
            conn.commit()
            log_data['id'] = cursor.lastrowid
            return log_data

    def update_maintenance_log(self, log_id: int, log_data: Dict[str, Any]) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE maintenance_logs SET description=?, cost=?, start_date=?, end_date=?, status=?
                WHERE id=?
            """, (log_data['description'], log_data['cost'], log_data['start_date'], 
                  log_data.get('end_date'), log_data['status'], log_id))
            conn.commit()
            return cursor.rowcount > 0

    # ==========================================
    # 7. DISPATCH OPERATION LIFECYCLE
    # ==========================================
    def create_trip(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO trips (source_name, destination_name, vehicle_reg, driver_license, cargo_weight, planned_distance, revenue, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (trip_data['source_name'], trip_data['destination_name'], trip_data['vehicle_reg'], 
                  trip_data['driver_license'], trip_data['cargo_weight'], trip_data['planned_distance'], 
                  trip_data.get('revenue', 0.0), trip_data.get('status', 'Draft')))
            conn.commit()
            trip_data['id'] = cursor.lastrowid
            return trip_data

    def update_trip_status(self, trip_id: int, status: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE trips SET status = ? WHERE id = ?", (status, trip_id))
            conn.commit()
            return cursor.rowcount > 0