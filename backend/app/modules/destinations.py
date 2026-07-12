# backend/app/modules/destinations.py
from fastapi import APIRouter, Depends, HTTPException
from app.db.session import db
from app.core.dependencies import get_current_user, RoleChecker
from app.modules.schemas import DestinationCreate, DestinationResponse
from typing import List

router = APIRouter(prefix="/api/destinations", tags=["Destinations Master"])

# All authenticated users can view destination profiles
@router.get("/", response_model=List[DestinationResponse])
def list_destinations(current_user: dict = Depends(get_current_user)):
    return db.get_all_destinations()

# Only Fleet Managers can create or delete destinations
@router.post("/", response_model=DestinationCreate)
def add_destination(payload: DestinationCreate, current_user: dict = Depends(RoleChecker(["Fleet Manager"]))):
    return db.create_destination(payload.model_dump())

@router.delete("/{name}")
def remove_destination(name: str, current_user: dict = Depends(RoleChecker(["Fleet Manager"]))):
    success = db.delete_destination(name)
    if not success:
        raise HTTPException(status_code=404, detail="Destination hub not found")
    return {"message": "Destination deleted successfully"}