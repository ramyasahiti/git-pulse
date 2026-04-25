from flask import Flask, request, jsonify
from kafka import KafkaProducer
import json
import os


app = Flask(__name__)

producer = KafkaProducer(
    bootstrap_servers=os.getenv("KAFKA_BROKER", "localhost:9092"),
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)


@app.route("/webhook", methods=["POST"])
def receive_webhook():
    """GitHub sends events here."""
    event_type = request.headers.get("X-GitHub-Event", "unknown")
    payload = request.json or {}
    message = {
        "event": event_type,
        "repo": payload.get("repository", {}).get("full_name"),
        "actor": payload.get("sender", {}).get("login"),
        "payload": payload
    }
    producer.send("git-events", value=message)
    producer.flush()
    return jsonify({"status": "queued", "event": event_type}), 200


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)