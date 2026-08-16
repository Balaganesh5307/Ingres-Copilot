import bcrypt
from pymongo import MongoClient

def seed_demo_users():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["ingres_copilot"]
    
    users_to_seed = [
        {
            "name": "Demo Researcher",
            "email": "researcher@demo.com",
            "password": "demo",
            "role": "Researcher",
            "agency": "National Water Research Institute"
        },
        {
            "name": "Demo Gov Officer",
            "email": "gov@demo.com",
            "password": "demo",
            "role": "Government Officer",
            "agency": "Ministry of Jal Shakti"
        },
        {
            "name": "Demo Admin",
            "email": "admin@demo.com",
            "password": "demo",
            "role": "Admin",
            "agency": "Ingres System Admin"
        }
    ]
    
    for user in users_to_seed:
        existing = db.users.find_one({"email": user["email"]})
        if not existing:
            pwd = user.pop("password")
            user["passwordHash"] = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            db.users.insert_one(user)
            print(f"Seeded: {user['email']} ({user['role']})")
        else:
            print(f"Already exists: {user['email']}")

if __name__ == "__main__":
    seed_demo_users()
