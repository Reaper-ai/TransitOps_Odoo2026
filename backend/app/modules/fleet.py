# backend/app/modules/fleet.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import db
from app.core.dependencies import get_current_user, RoleChecker
from app.modules.schemas import VehicleCreate, VehicleUpdate, VehicleResponse, DriverCreate, DriverUpdate, DriverResponse
from typing import List

router = APIRouter(prefix="/api/fleet", tags=["Fleet Management"])

# ==========================================
# VEHICLES ENDPOINTS
# ==========================================
@router.get("/vehicles", response_model=List[VehicleResponse])
def get_vehicles(current_user: dict = Depends(get_current_user)):
    return db.get_all_vehicles()

@router.post("/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_new_vehicle(payload: VehicleCreate, current_user: dict = Depends(RoleChecker(["Fleet Manager"]))):
    if db.get_vehicle_by_reg(payload.registration_number):
        raise HTTPException(status_code=400, detail="Vehicle Registration Number must be unique.")
    return db.create_vehicle(payload.model_dump())

@router.get("/vehicles/{reg_num}", response_model=VehicleResponse)
def get_single_vehicle(reg_num: str, current_user: dict = Depends(get_current_user)):
    vehicle = db.get_vehicle_by_reg(reg_num)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/vehicles/{reg_num}")
def modify_vehicle(reg_num: str, payload: VehicleUpdate, current_user: dict = Depends(RoleChecker(["Fleet Manager"]))):
    success = db.update_vehicle(reg_num, payload.model_dump())
    if not success:
        raise HTTPException(status_code=404, detail="Vehicle not found or modification failed")
    return {"message": "Vehicle updated successfully"}

@router.delete("/vehicles/{reg_num}")
def remove_vehicle(reg_num: str, current_user: dict = Depends(RoleChecker(["Fleet Manager"]))):
    success = db.delete_vehicle(reg_num)
    if not success:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted successfully"}

# ==========================================
# DRIVERS ENDPOINTS
# ==========================================
@router.get("/drivers", response_model=List[DriverResponse])
def get_drivers(current_user: dict = Depends(get_current_user)):
    return db.get_all_drivers()

@router.post("/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_new_driver(payload: DriverCreate, current_user: dict = Depends(RoleChecker(["Fleet Manager", "Safety Officer"]))):
    if db.get_driver_by_license(payload.license_number):
        raise HTTPException(status_code=400, detail="Driver License Number already registered.")
    return db.create_driver(payload.model_dump())

@router.get("/drivers/{license_num}", response_model=DriverResponse)
def get_single_driver(license_num: str, current_user: dict = Depends(get_current_user)):
    driver = db.get_driver_by_license(license_num)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    return driver

@router.put("/drivers/{license_num}")
def modify_driver(license_num: str, payload: DriverUpdate, current_user: dict = Depends(RoleChecker(["Fleet Manager", "Safety Officer"]))):
    success = db.update_driver(license_num, payload.model_dump())
    if not success:
        raise HTTPException(status_code=404, detail="Driver profile not found or modification failed")
    return {"message": "Driver updated successfully"}

@router.delete("/drivers/{license_num}")
def remove_driver(license_num: str, current_user: dict = Depends(RoleChecker(["Fleet Manager"]))):
    success = db.delete_driver(license_num)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"message": "Driver profile purged successfully"}