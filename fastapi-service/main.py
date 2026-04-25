from fastapi import FastAPI, Query
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
import os

app = FastAPI(title="Git Pulse API", version="1.0.0")
mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = mongo["gitpulse"]

@app.get("/leaderboard")
def get_leaderboard(limit: int = Query(10, le=50)):
    """Top developers ranked by score."""
    docs = db.leaderboard.find({}, {"_id": 0}).sort("score", -1).limit(limit)
    return {"leaderboard": list(docs)}

@app.get("/developer/{username}")
def get_developer(username: str):
    """Stats and recent activity for a single developer."""
    doc = db.leaderboard.find_one({"username": username}, {"_id": 0})
    if not doc:
        return {"error": "Developer not found"}
    recent = list(db.events.find(
        {"actor": username}, {"_id": 0, "payload": 0}
    ).sort("timestamp", -1).limit(10))
    return {"profile": doc, "recent_activity": recent}

@app.get("/pulse")
def team_pulse(days: int = Query(7, le=30)):
    """Team activity summary over the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    total = db.events.count_documents({"timestamp": {"$gte": since}})
    active_devs = db.events.distinct("actor", {"timestamp": {"$gte": since}})
    return {"days": days, "total_events": total, "active_developers": len(active_devs)}

@app.get("/health")
def health():
    return {"status": "ok"}
