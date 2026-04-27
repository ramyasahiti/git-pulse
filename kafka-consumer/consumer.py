from kafka import KafkaConsumer
from pymongo import MongoClient
from datetime import datetime, timezone
import json
import os
import time


KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")


def create_consumer():
    retries = 10
    for i in range(retries):
        try:
            return KafkaConsumer(
                "git-events",
                bootstrap_servers=KAFKA_BROKER,
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                auto_offset_reset="earliest",
                group_id="git-pulse-group"
            )
        except Exception:
            print(f"Kafka not ready, retrying ({i+1}/{retries})...")
            time.sleep(5)
    raise Exception("Could not connect to Kafka after retries")


consumer = create_consumer()
mongo = MongoClient(MONGO_URI)
db = mongo["gitpulse"]

SCORES = {"push": 10, "pull_request": 20, "pull_request_review": 15, "unknown": 1}


def process(event: dict):
    actor = event.get("actor")
    event_type = event.get("event", "unknown")
    repo = event.get("repo")
    score = SCORES.get(event_type, 1)

    db.events.insert_one({**event, "timestamp": datetime.now(timezone.utc)})

    db.leaderboard.update_one(
        {"username": actor},
        {
            "$inc": {"score": score, "total_events": 1},
            "$set": {"last_active": datetime.now(timezone.utc)},
            "$setOnInsert": {"username": actor}
        },
        upsert=True
    )

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    db.stats.update_one(
        {"date": today},
        {
            "$inc": {
                "total_events": 1,
                f"total_{event_type}s": 1
            },
            "$addToSet": {"active_developers": actor},
            "$setOnInsert": {"date": today}
        },
        upsert=True
    )

    if event_type == "pull_request":
        pr_action = event.get("pr_action")
        pr_number = event.get("pr_number")
        if pr_action == "opened":
            db.pr_timings.update_one(
                {"repo": repo, "pr_number": pr_number},
                {
                    "$set": {
                        "opened_by": actor,
                        "opened_at": datetime.now(timezone.utc),
                        "repo": repo
                    },
                    "$setOnInsert": {"pr_number": pr_number}
                },
                upsert=True
            )
        elif pr_action == "merged":
            pr = db.pr_timings.find_one({"repo": repo, "pr_number": pr_number})
            if pr and pr.get("opened_at"):
                diff = datetime.now(timezone.utc) - pr["opened_at"]
                review_hours = round(diff.total_seconds() / 3600, 2)
                db.pr_timings.update_one(
                    {"repo": repo, "pr_number": pr_number},
                    {"$set": {
                        "merged_at": datetime.now(timezone.utc),
                        "review_time_hours": review_hours
                    }}
                )

    if event_type == "pull_request_review":
        pr_number = event.get("pr_number")
        reviewed_by = event.get("reviewed_by")
        db.pr_timings.update_one(
            {"repo": repo, "pr_number": pr_number},
            {"$set": {
                "reviewed_by": reviewed_by,
                "reviewed_at": datetime.now(timezone.utc)
            }}
        )

    print(f"[+] {actor} -> {event_type} (+{score} pts)")


print("Consumer running...")
for msg in consumer:
    process(msg.value)