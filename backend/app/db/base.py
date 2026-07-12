# backend/app/db/base.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseRepository(ABC):
    
    # ==========================================
    # 1. CRUD DRIVER (4 Methods)
    # ==========================================
    @abstractmethod
    def create_driver(self, driver_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new driver profile keyed by license_number."""
        pass

    @abstractmethod
    def get_driver_by_license(self, license_number: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single driver profile matching the license number."""
        pass

    @abstractmethod
    def update_driver(self, license_number: str, driver_data: Dict[str, Any]) -> bool:
        """Updates driver attributes (status, safety score, contact info, etc.)."""
        pass

    @abstractmethod
    def delete_driver(self, license_number: str) -> bool:
        """Removes a driver profile entirely from the infrastructure logs."""
        pass

    # ==========================================
    # 2. CRUD VEHICLE (4 Methods)
    # ==========================================
    @abstractmethod
    def create_vehicle(self, vehicle_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new vehicle record keyed by registration_number."""
        pass

    @abstractmethod
    def get_vehicle_by_reg(self, registration_number: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single vehicle matching the unique registration plate."""
        pass

    @abstractmethod
    def update_vehicle(self, registration_number: str, vehicle_data: Dict[str, Any]) -> bool:
        """Updates vehicle states (odometer logs, workshop status, availability)."""
        pass

    @abstractmethod
    def delete_vehicle(self, registration_number: str) -> bool:
        """Permanently purges a specific vehicle record from the system."""
        pass

    # ==========================================
    # 3. CRUD USER (4 Methods)
    # ==========================================
    @abstractmethod
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers an internal user account with assigned access control roles."""
        pass

    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Finds an internal account configuration profile by email."""
        pass

    @abstractmethod
    def update_user(self, email: str, user_data: Dict[str, Any]) -> bool:
        """Updates structural elements of a user profile (credentials, access rights)."""
        pass

    @abstractmethod
    def delete_user(self, email: str) -> bool:
        """Removes administrative account profiles from database listings."""
        pass

    # ==========================================
    # 4. EXPENSES (Add & Read)
    # ==========================================
    @abstractmethod
    def add_expense(self, expense_data: Dict[str, Any]) -> Dict[str, Any]:
        """Injects a transaction log explicitly linked back to a target trip_id."""
        pass

    @abstractmethod
    def get_expenses_by_trip(self, trip_id: int) -> List[Dict[str, Any]]:
        """Retrieves all cumulative operational billing summaries incurred for a trip."""
        pass

    # ==========================================
    # 5. DESTINATIONS (Create, Delete, Read)
    # ==========================================
    @abstractmethod
    def create_destination(self, dest_data: Dict[str, Any]) -> Dict[str, Any]:
        """Inserts a verified endpoint coordinate profile into the global transit system."""
        pass

    @abstractmethod
    def get_all_destinations(self) -> List[Dict[str, Any]]:
        """Pulls the entire structural array of active distribution hubs and regions."""
        pass

    @abstractmethod
    def delete_destination(self, name: str) -> bool:
        """Erases a delivery waypoint hub record from selectable indices."""
        pass

    # ==========================================
    # 6. MAINTENANCE LOGS (Create & Update)
    # ==========================================
    @abstractmethod
    def create_maintenance_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """Spawns an active workshop work order tracking record for an asset."""
        pass

    @abstractmethod
    def update_maintenance_log(self, log_id: int, log_data: Dict[str, Any]) -> bool:
        """Closes or modifies parameters (billing additions, closure timestamp) of a log."""
        pass

    # ==========================================
    # 7. TRIPS (Create & Update)
    # ==========================================
    @abstractmethod
    def create_trip(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers a fresh transit log workflow profile initialization."""
        pass

    @abstractmethod
    def update_trip_status(self, trip_id: int, status: str) -> bool:
        """Updates the operational lifecycle state machine path of a specific trip."""
        pass

    # Add these methods inside the BaseRepository class in backend/app/db/base.py

    @abstractmethod
    def get_all_vehicles(self) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_all_drivers(self) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_all_trips(self) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_trips_by_driver(self, license_number: str) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_trips_by_vehicle(self, registration_number: str) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_trips_by_source(self, source_name: str) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_trips_by_destination(self, destination_name: str) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_all_maintenance_logs(self) -> List[Dict[str, Any]]: pass

    @abstractmethod
    def get_maintenance_logs_by_vehicle(self, registration_number: str) -> List[Dict[str, Any]]: pass