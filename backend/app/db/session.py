# backend/app/db/session.py
from app.db.sqlite_repo import SQLiteRepository

# This is the single source of truth for your database instance
db = SQLiteRepository()