# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add these imports to your existing backend/app/main.py
from app.modules.auth import router as auth_router
from app.modules.destinations import router as dest_router
from app.modules.fleet import router as fleet_router
# Add these imports at the top of backend/app/main.py
from app.modules.trips import router as trips_router
from app.modules.maintenance import router as maintenance_router
from app.modules.finance import router as finance_router
from app.modules.dashboard import router as dashboard_router


app = FastAPI(
    title="TransitOps API Platform",
    description="Backend engine for smart transit and fleet management infrastructure.",
    version="1.0.0"
)

# Enable CORS for React frontend cross-communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to specific ports in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dest_router)
app.include_router(fleet_router)
app.include_router(trips_router)
app.include_router(maintenance_router)
app.include_router(finance_router)
app.include_router(dashboard_router)


@app.get("/")
def read_root():
    return {"status": "online", "system": "TransitOps Backend Architecture Operational"}