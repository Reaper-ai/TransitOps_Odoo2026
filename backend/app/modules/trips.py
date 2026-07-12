# backend/app/modules/trips.py
from fastapi import APIRouter, Depends, HTTPException, status
import datetime
from app.db.session import db
from app.core.dependencies import get_current_user, RoleChecker
from app.modules.schemas import TripCreate, TripResponse
from typing import List

router = APIRouter(prefix="/api/trips", tags=["Trip Dispatch Management"])

@router.get("/", response_model=List[TripResponse])
def list_all_trips(current_user: dict = Depends(get_current_user)):
    return db.get_all_trips()

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def dispatch_new_trip(payload: TripCreate, current_user: dict = Depends(RoleChecker(["Fleet Manager", "Driver"]))):
    # 1. Fetch Target Asset Contexts
    vehicle = db.get_vehicle_by_reg(payload.vehicle_reg)
    driver = db.get_driver_by_license(payload.driver_license)
    
    if not vehicle or not driver:
        raise HTTPException(status_code=404, detail="Assigned Vehicle or Driver profile not found.")
        
    # 2. Strict Business Rule Validation
    # Rule A: Cargo Weight Limit Check
    if payload.cargo_weight > vehicle["max_load_capacity"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Overload Error: Cargo ({payload.cargo_weight}kg) exceeds max vehicle capacity ({vehicle['max_load_capacity']}kg)[cite: 1]."
        )
        
    # Rule B: Asset Availability Checks[cite: 1]
    if vehicle["status"] in ('In Shop', 'Retired'):
        raise HTTPException(status_code=400, detail=f"Vehicle cannot be dispatched. Current Status: {vehicle['status']}[cite: 1].")
    if vehicle["status"] == 'On Trip':
        raise HTTPException(status_code=400, detail="Conflict: Vehicle is already actively deployed on another trip[cite: 1].")
        
    # Rule C: Driver Eligibility & License Validation[cite: 1]
    today = datetime.date.today().isoformat()
    if driver["license_expiry_date"] <= today:
        raise HTTPException(status_code=400, detail="Compliance Failure: Driver license has expired[cite: 1].")
    if driver["status"] == 'Suspended':
        raise HTTPException(status_code=400, detail="Compliance Failure: Assigned driver is currently suspended[cite: 1].")
    if driver["status"] == 'On Trip':
        raise HTTPException(status_code=400, detail="Conflict: Driver is already assigned to an active trip[cite: 1].")

    # 3. Create the Base Trip Entry
    trip_data = payload.model_dump()
    trip_data["status"] = "Dispatched"  # Auto-dispatch on successful validation[cite: 1]
    created_trip = db.create_trip(trip_data)
    
    # 4. State Cascade: Move Assets to 'On Trip'[cite: 1]
    db.update_vehicle_status(payload.vehicle_reg, "On Trip")
    db.update_driver_status(payload.driver_license, "On Trip")
    
    return created_trip

@router.put("/{trip_id}/complete")
def complete_active_transit(trip_id: int, final_odometer: float, current_user: dict = Depends(get_current_user)):
    # Find all active trips matching this ID
    trips = db.get_all_trips()
    target_trip = next((t for t in trips if t["id"] == trip_id), None)
    
    if not target_trip:
        raise HTTPException(status_code=404, detail="Trip record not found.")
    if target_trip["status"] != "Dispatched":
        raise HTTPException(status_code=400, detail="Only actively dispatched transits can be finalized.")
        
    vehicle = db.get_vehicle_by_reg(target_trip["vehicle_reg"])
    if final_odometer <= vehicle["odometer"]:
        raise HTTPException(status_code=400, detail=f"Odometer reading must be higher than starting values ({vehicle['odometer']}).")
        
    # 1. Update Lifecycle State[cite: 1]
    db.update_trip_status(trip_id, "Completed")
    
    # 2. Update Odometer Log Metrics
    vehicle["odometer"] = final_odometer
    vehicle["status"] = "Available"
    db.update_vehicle(target_trip["vehicle_reg"], vehicle)
    
    # 3. Release Driver[cite: 1]
    db.update_driver_status(target_trip["driver_license"], "Available")
    
    return {"message": "Trip completed successfully. Resources released back to active pools[cite: 1]."}