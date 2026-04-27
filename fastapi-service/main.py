from fastapi import FastAPI, Query
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import os


app = FastAPI(title="Git Pulse API", version="2.0.0")
mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = mongo["gitpulse"]


@app.post("/workspace")
def create_workspace(data: dict):
    """Create a new team workspace."""
    workspace_id = str(uuid4())[:8]
    workspace = {
        "workspace_id": workspace_id,
        "name": data.get("name", "My Team"),
        "repos": data.get("repos", []),
        "members": data.get("members", []),
        "created_at": datetime.now(timezone.utc)
    }
    db.workspaces.insert_one(workspace)
    return {"workspace_id": workspace_id, "message": "Workspace created"}


@app.get("/workspace/{workspace_id}")
def get_workspace(workspace_id: str):
    """Get workspace details."""
    doc = db.workspaces.find_one(
        {"workspace_id": workspace_id}, {"_id": 0}
    )
    if not doc:
        return {"error": "Workspace not found"}
    return doc


@app.get("/workspace/{workspace_id}/leaderboard")
def get_leaderboard(workspace_id: str, limit: int = Query(10, le=50)):
    """Team leaderboard scoped to workspace."""
    workspace = db.workspaces.find_one({"workspace_id": workspace_id})
    if not workspace:
        return {"error": "Workspace not found"}
    members = workspace.get("members", [])
    docs = db.leaderboard.find(
        {"username": {"$in": members}}, {"_id": 0}
    ).sort("score", -1).limit(limit)
    return {"workspace_id": workspace_id, "leaderboard": list(docs)}


@app.get("/workspace/{workspace_id}/balance")
def get_balance(workspace_id: str):
    """Contribution balance across team members."""
    workspace = db.workspaces.find_one({"workspace_id": workspace_id})
    if not workspace:
        return {"error": "Workspace not found"}
    members = workspace.get("members", [])
    balance = []
    for member in members:
        doc = db.leaderboard.find_one(
            {"username": member}, {"_id": 0}
        )
        if doc:
            balance.append({
                "username": member,
                "score": doc.get("score", 0),
                "total_events": doc.get("total_events", 0),
                "last_active": doc.get("last_active")
            })
        else:
            balance.append({
                "username": member,
                "score": 0,
                "total_events": 0,
                "last_active": None
            })
    return {"workspace_id": workspace_id, "balance": balance}


@app.get("/workspace/{workspace_id}/pr-timings")
def get_pr_timings(workspace_id: str):
    """PR review time tracker for workspace."""
    workspace = db.workspaces.find_one({"workspace_id": workspace_id})
    if not workspace:
        return {"error": "Workspace not found"}
    repos = workspace.get("repos", [])
    timings = list(db.pr_timings.find(
        {"repo": {"$in": repos}}, {"_id": 0}
    ).sort("opened_at", -1).limit(20))
    return {"workspace_id": workspace_id, "pr_timings": timings}


@app.get("/workspace/{workspace_id}/pulse")
def get_pulse(workspace_id: str, days: int = Query(7, le=30)):
    """Team activity summary for workspace."""
    workspace = db.workspaces.find_one({"workspace_id": workspace_id})
    if not workspace:
        return {"error": "Workspace not found"}
    members = workspace.get("members", [])
    since = datetime.now(timezone.utc) - timedelta(days=days)
    total = db.events.count_documents({
        "actor": {"$in": members},
        "timestamp": {"$gte": since}
    })
    return {
        "workspace_id": workspace_id,
        "days": days,
        "total_events": total,
        "members_tracked": len(members)
    }


@app.get("/leaderboard")
def get_global_leaderboard(limit: int = Query(10, le=50)):
    """Global leaderboard."""
    docs = db.leaderboard.find({}, {"_id": 0}).sort("score", -1).limit(limit)
    return {"leaderboard": list(docs)}


@app.get("/stats")
def get_stats(days: int = Query(7, le=30)):
    """Daily stats for the last N days."""
    from datetime import date
    dates = [
        (date.today() - timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(days)
    ]
    docs = list(db.stats.find(
        {"date": {"$in": dates}}, {"_id": 0}
    ).sort("date", -1))
    return {"stats": docs}


@app.get("/health")
def health():
    return {"status": "ok"}