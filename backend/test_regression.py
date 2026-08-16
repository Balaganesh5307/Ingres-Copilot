from pymongo import MongoClient
import requests

db = MongoClient("mongodb://localhost:27017/")["ingres_copilot"]
BASE_URL = "http://127.0.0.1:8000/api/v1"

print("\n--- Regression Tests ---\n")

analytics = requests.get(f"{BASE_URL}/analytics/summary").status_code
print(f"Analytics public access: {'PASS' if analytics == 200 else 'FAIL'} ({analytics})")

map_data = requests.get(f"{BASE_URL}/analytics/map-data").status_code
print(f"Map data public access: {'PASS' if map_data == 200 else 'FAIL'} ({map_data})")

# ChromaDB record count check (Phase 3/4)
import chromadb
try:
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_collection(name="groundwater_reports")
    chroma_count = collection.count()
    print(f"ChromaDB records: {chroma_count} (Expected: >0)")
except Exception as e:
    print(f"ChromaDB check failed: {e}")

# MongoDB assessment data check
gw_count = db.groundwater_assessments.count_documents({})
print(f"MongoDB groundwater_assessments records: {gw_count} (Expected: 1722 or similar)")

# Verify dummy user conversations 
dummy_count = db.conversations.count_documents({"userId": "user_mock_123"})
print(f"Dummy user conversations remaining: {dummy_count}")
