from kafka import KafkaConsumer
from pymongo import MongoClient
from datetime import datetime, timezone
import json, os

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

consumer = KafkaConsumer(
    "git-events",
    bootstrap_servers=KAFKA_BROKER,
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
    group_id="git-pulse-group"
)

mongo = MongoClient(MONGO_URI)
db = mongo["gitpulse"]

SCORES = {"push": 10, "pull_request": 20, "pull_request_review": 15, "unknown": 1}

def process(event: dict):
    actor = event.get("actor")
    event_type = event.get("event", "unknown")
    score = SCORES.get(event_type, 1)

    # Store raw event
    db.events.insert_one({**event, "timestamp": datetime.now(timezone.utc)})

    # Upsert developer score
    db.leaderboard.update_one(
        {"username": actor},
        {
            "$inc": {"score": score, "total_events": 1},
            "$set": {"last_active": datetime.now(timezone.utc)},
            "$setOnInsert": {"username": actor}
        },
        upsert=True
    )
    print(f"[+] {actor} → {event_type} (+{score} pts)")

print("Consumer running...")
for msg in consumer:
    process(msg.value)
