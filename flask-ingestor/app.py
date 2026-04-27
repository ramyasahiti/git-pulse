from flask import Flask, request, jsonify
from kafka import KafkaProducer
import json
import os
import time


app = Flask(__name__)


def create_producer():
    retries = 10
    for i in range(retries):
        try:
            return KafkaProducer(
                bootstrap_servers=os.getenv("KAFKA_BROKER", "localhost:9092"),
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
        except Exception:
            print(f"Kafka not ready, retrying ({i+1}/{retries})...")
            time.sleep(5)
    raise Exception("Could not connect to Kafka after retries")


producer = create_producer()


@app.route("/webhook", methods=["POST"])
def receive_webhook():
    """Receive GitHub webhook events."""
    event_type = request.headers.get("X-GitHub-Event", "unknown")
    payload = request.json or {}
    repo = payload.get("repository", {}).get("full_name")
    actor = payload.get("sender", {}).get("login")

    message = {
        "event": event_type,
        "repo": repo,
        "actor": actor,
        "payload": payload
    }

    if event_type == "pull_request":
        action = payload.get("action")
        pr_number = payload.get("number")
        if action == "opened":
            message["pr_action"] = "opened"
            message["pr_number"] = pr_number
        elif action == "closed" and payload.get("pull_request", {}).get("merged"):
            message["pr_action"] = "merged"
            message["pr_number"] = pr_number

    if event_type == "pull_request_review":
        message["pr_number"] = payload.get("pull_request", {}).get("number")
        message["reviewed_by"] = actor

    producer.send("git-events", value=message)
    producer.flush()
    return jsonify({"status": "queued", "event": event_type}), 200


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)