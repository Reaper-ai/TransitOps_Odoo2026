# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.sqlite_repo import SQLiteRepository

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

# Global database interface instance injection point
db = SQLiteRepository()

@app.get("/")
def read_root():
    return {"status": "online", "system": "TransitOps Backend Architecture Operational"}