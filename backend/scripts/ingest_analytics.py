import os
import asyncio
import pandas as pd
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def ingest_analytics():
    await connect_to_mongo()
    db = get_database()
    col = db["analytics_data"]
    
    # Clear existing to avoid duplicates during dev
    await col.delete_many({})
    
    ingestion_dir = "ingestion"
    if not os.path.exists(ingestion_dir):
        ingestion_dir = "data/documents"

    # 1. State Level Data
    state_csv = os.path.join(ingestion_dir, "RS_Session_265_AU_1522_A.csv")
    states_count = 0
    if os.path.exists(state_csv):
        df_state = pd.read_csv(state_csv)
        # Columns: Sl. No.,State,Annual Extractable Ground Water Resource in BCM - 2023, ... 2022, ... 2020
        # We need to unpivot this
        for idx, row in df_state.iterrows():
            state = row.get("State")
            if pd.isna(state) or state == "Total":
                continue
            
            for year in ["2020", "2022", "2023"]:
                col_name = f"Annual Extractable Ground Water Resource in BCM - {year}"
                if col_name in row and not pd.isna(row[col_name]):
                    record = {
                        "type": "state",
                        "state": str(state).strip(),
                        "district": None,
                        "year": year,
                        "extractable_bcm": float(row[col_name]),
                    }
                    await col.insert_one(record)
                    states_count += 1
                    
    # 2. District Level Data
    dist_csv = os.path.join(ingestion_dir, "RS_Session_257_AU_896_3.csv")
    dist_count = 0
    if os.path.exists(dist_csv):
        df_dist = pd.read_csv(dist_csv)
        for idx, row in df_dist.iterrows():
            dist = row.get("District")
            if pd.isna(dist) or dist == "Total":
                continue
                
            year = str(row.get("Year"))
            
            # Extract high-risk percentages (e.g. > 40 mbgl or 20-40 mbgl)
            gt_40 = row.get("Depth to Water Level (mbgl) - > 40 - %", 0)
            bt_20_40 = row.get("Depth to Water Level (mbgl) - 20 - 40 - %", 0)
            
            # Safely cast to float
            try: gt_40 = float(gt_40)
            except: gt_40 = 0.0
            
            try: bt_20_40 = float(bt_20_40)
            except: bt_20_40 = 0.0
            
            # Map Tamil Nadu districts implicitly since this CSV is heavily TN, but leave state null as it's not in CSV
            record = {
                "type": "district",
                "state": "Tamil Nadu", # Hardcoding TN since the dataset districts (Coimbatore, Chennai) are TN
                "district": str(dist).strip(),
                "year": year,
                "depth_gt_40_pct": gt_40,
                "depth_20_40_pct": bt_20_40,
                "risk_score": gt_40 + (bt_20_40 * 0.5) # Calculate a risk score for the dashboard
            }
            await col.insert_one(record)
            dist_count += 1

    # Data Integrity Check Output
    total_states = len(await col.distinct("state", {"type": "state"}))
    total_districts = len(await col.distinct("district", {"type": "district"}))
    
    print(f"Ingested {states_count} state records and {dist_count} district records.")
    print("\nDATA INTEGRITY CHECK:")
    print(f"States with assessmentData (extractable_bcm): {total_states}")
    print(f"Districts with assessmentData (depth_pct): {total_districts}")
    print("Missing fields in source CSVs: annualRecharge, annualExtraction, stageOfExtraction, category.")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(ingest_analytics())
