import requests
import json
import time
from pymongo import MongoClient

BASE_URL = "http://127.0.0.1:8000/api/v1"
client = MongoClient("mongodb://localhost:27017/")
db = client["ingres_copilot"]

def print_result(test_name, success, details=""):
    status = "PASS" if success else "FAIL"
    print(f"{test_name: <40} | {status} | {details}")

# Clear test users
db.users.delete_many({"email": {"$regex": "^test.*"}})

print("\n--- Running Authentication Tests ---\n")

# TEST 1 - NORMAL REGISTRATION
res = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Test Public User",
    "email": "test@example.com",
    "password": "validpassword",
    "agency": "Test"
})
t1_pass = res.status_code == 201 and "access_token" in res.json()
user_in_db = db.users.find_one({"email": "test@example.com"})
t1_pass = t1_pass and user_in_db and user_in_db["role"] == "Public User" and "passwordHash" in user_in_db
print_result("TEST 1 - NORMAL REGISTRATION", t1_pass)

# TEST 2 - PRIVILEGE ESCALATION
res2 = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Hacker",
    "email": "test_hacker@example.com",
    "password": "validpassword",
    "role": "Admin",
    "agency": "Hacker Corp"
})
hacker_db = db.users.find_one({"email": "test_hacker@example.com"})
t2_pass = res2.status_code == 201 and hacker_db["role"] == "Public User"
print_result("TEST 2 - PRIVILEGE ESCALATION", t2_pass)

# TEST 3 - DUPLICATE EMAIL
res3 = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Duplicate",
    "email": "test@example.com",
    "password": "validpassword",
    "agency": "Test"
})
t3_pass = res3.status_code == 400
print_result("TEST 3 - DUPLICATE EMAIL", t3_pass)

# TEST 4 - LOGIN
session = requests.Session()
res4 = session.post(f"{BASE_URL}/auth/login", json={
    "email": "test@example.com",
    "password": "validpassword"
})
t4_pass = res4.status_code == 200 and "access_token" in res4.json()
access_token = res4.json().get("access_token")
print_result("TEST 4 - LOGIN", t4_pass)

# TEST 5 - WRONG PASSWORD
res5 = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "test@example.com",
    "password": "wrongpassword"
})
t5_pass = res5.status_code == 401
print_result("TEST 5 - WRONG PASSWORD", t5_pass)

# TEST 6 - PROTECTED ROUTE WITHOUT TOKEN
res6 = requests.get(f"{BASE_URL}/auth/me")
t6_pass = res6.status_code == 401
print_result("TEST 6 - PROTECTED ROUTE WITHOUT TOKEN", t6_pass)

# TEST 7 - PUBLIC USER ADMIN ACCESS
res7 = requests.get(f"{BASE_URL}/users/", headers={"Authorization": f"Bearer {access_token}"})
t7_pass = res7.status_code == 403
print_result("TEST 7 - PUBLIC USER ADMIN ACCESS", t7_pass)

# TEST 8 - ADMIN ACCESS
# Seed an admin directly
import bcrypt
db.users.insert_one({
    "name": "Admin Test",
    "email": "test_admin@example.com",
    "passwordHash": bcrypt.hashpw("adminpassword".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
    "role": "Admin"
})
session_admin = requests.Session()
res_admin_login = session_admin.post(f"{BASE_URL}/auth/login", json={
    "email": "test_admin@example.com",
    "password": "adminpassword"
})
admin_token = res_admin_login.json().get("access_token")
res8 = requests.get(f"{BASE_URL}/users/", headers={"Authorization": f"Bearer {admin_token}"})
t8_pass = res8.status_code == 200
print_result("TEST 8 - ADMIN ACCESS", t8_pass)

# TEST 9 - PROFILE
res9 = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {access_token}"})
t9_pass = res9.status_code == 200 and res9.json().get("email") == "test@example.com"
print_result("TEST 9 - PROFILE", t9_pass)

# TEST 10 - CHAT ISOLATION
res10a = requests.post(f"{BASE_URL}/chat/conversations", headers={"Authorization": f"Bearer {access_token}"}, json={"title": "Test Chat"})
conv_id = res10a.json().get("id")

res10b = requests.get(f"{BASE_URL}/chat/conversations/{conv_id}", headers={"Authorization": f"Bearer {admin_token}"})
t10_pass = res10b.status_code == 404
print_result("TEST 10 - CHAT ISOLATION", t10_pass)

# TEST 11 - LOGOUT
session.post(f"{BASE_URL}/auth/logout")
# Technically this just deletes the cookie on the client side since we don't track refresh tokens in DB for this prototype,
# but let's test that the cookie is removed in the session.
refresh_cookie = session.cookies.get("refresh_token")
t11_pass = not refresh_cookie or refresh_cookie == ""
print_result("TEST 11 - LOGOUT", t11_pass)

# TEST 12 - TOKEN REFRESH
# Admin session still has the cookie
res12 = session_admin.post(f"{BASE_URL}/auth/refresh")
t12_pass = res12.status_code == 200 and "access_token" in res12.json()
print_result("TEST 12 - TOKEN REFRESH", t12_pass)

dummy_convs = db.conversations.count_documents({"userId": "user_mock_123"})
print(f"\nDummy-user conversations found: {dummy_convs}")
