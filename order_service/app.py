from flask import Flask, jsonify, request
import requests
import sys
from pymongo import MongoClient
import os
import threading

app = Flask(__name__)
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5001

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = client["food_delivery_db"]
    orders_collection = db["orders"]
    # Check connection
    client.server_info()
    print(f"✅ Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    print(f"❌ CRITICAL: Failed to connect to MongoDB: {e}")
    print("   Make sure MongoDB is running on localhost:27017")
    orders_collection = None

COMM_HUB_URL = "http://localhost:4000"

@app.route('/orders', methods=['GET'])
def get_orders():
    if orders_collection is not None:
        orders = list(orders_collection.find({}, {'_id': 0}).sort("id", -1)) # Newest first
        return jsonify(orders)
    return jsonify({"error": "Database unavailable"}), 503

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    
    if orders_collection is None:
        return jsonify({"error": "Database unavailable"}), 503

    # Generate a simple ID
    order_id = orders_collection.count_documents({}) + 1
    
    order = {
        "id": order_id,
        "item": data.get("item"),
        "total": data.get("total"),
        "status": "Pending" # Initial status
    }
    
    orders_collection.insert_one(order.copy())
    
    # Notify Communication Hub about new order
    try:
        requests.post(f"{COMM_HUB_URL}/publish", json={
            "channel": "orders",
            "message": f"{order_id}" # Just sending ID for simplicity
        })
    except:
        print("Failed to communicate with Hub")

    if '_id' in order:
        del order['_id']

    return jsonify(order), 201

# Endpoint to receive updates from Hub (e.g. "Order Ready")
@app.route('/update_status', methods=['POST'])
def update_status():
    data = request.json
    channel = data.get('channel')
    message = data.get('message') # Format: "ID:STATUS"
    
    if channel == 'order-updates':
        try:
            order_id, new_status = message.split(':')
            orders_collection.update_one(
                {"id": int(order_id)},
                {"$set": {"status": new_status}}
            )
            print(f"Updated Order {order_id} status to {new_status}")
        except Exception as e:
            print(f"Error updating status: {e}")
            
    return jsonify({"status": "received"}), 200

def register_with_hub():
    try:
        requests.post(f"{COMM_HUB_URL}/subscribe", json={
            "service": "order_service",
            "url": f"http://localhost:{PORT}/update_status"
        })
        print(f"✅ Registered for updates on port {PORT}")
    except:
        print("❌ Failed to register with Hub")

if __name__ == '__main__':
    # Register in a separate thread to not block startup
    threading.Timer(2.0, register_with_hub).start()
    print(f"Order Service running on port {PORT}")
    app.run(port=PORT, debug=True)
