import os
import sys
import asyncio
import pymupdf
from collections import defaultdict
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

STATES = [
    "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR", "CHHATTISGARH", "GOA",
    "GUJARAT", "HARYANA", "HIMACHAL PRADESH", "JHARKHAND", "KARNATAKA", "KERALA",
    "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR", "MEGHALAYA", "MIZORAM", "NAGALAND",
    "ODISHA", "PUNJAB", "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA",
    "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL", "ANDAMAN & NICOBAR", "CHANDIGARH",
    "DADRA AND NAGAR HAVELI", "DAMAN AND DIU", "DELHI", "JAMMU & KASHMIR", "LADAKH",
    "LAKSHADWEEP", "PUDUCHERRY"
]

async def main():
    await connect_to_mongo()
    db = get_database()
    col = db["groundwater_assessments"]
    
    # Create unique index
    await col.create_index(
        [("source", 1), ("assessmentYear", 1), ("state", 1), ("district", 1), ("assessmentUnit", 1)],
        unique=True
    )
    
    await col.delete_many({})
    
    pdf_path = "ingestion/1762513884655822300file.pdf"
    if not os.path.exists(pdf_path):
        pdf_path = "data/documents/1762513884655822300file.pdf"
    
    doc = pymupdf.open(pdf_path)
    
    records = []
    current_state = None
    current_district = None
    
    # Annexure IV (A) pages
    for page_num in range(364, 402):
        page = doc[page_num]
        words = page.get_text("words")
        
        # Determine State from page text more accurately
        # Look for "CATEGORIZATION" and get the state names physically near it
        # Actually, let's just search the text for isolated state names in ALL CAPS
        text = page.get_text()
        lines_text = text.split('\n')
        for line in lines_text:
            line_clean = line.strip()
            if line_clean in STATES:
                current_state = line_clean.title()
                break
            
        # Group words by line (y0 rounded to 5)
        lines = defaultdict(list)
        for w in words:
            y = round(w[1] / 5.0) * 5
            lines[y].append(w)
            
        # Sort lines by y
        sorted_y = sorted(lines.keys())
        for y in sorted_y:
            line_words = sorted(lines[y], key=lambda w: w[0])
            
            # Reconstruct string by x-bounds
            dist_words = [w[4] for w in line_words if 115 <= w[0] < 220]
            semi_words = [w[4] for w in line_words if 230 <= w[0] < 330]
            crit_words = [w[4] for w in line_words if 330 <= w[0] < 430]
            over_words = [w[4] for w in line_words if 430 <= w[0] < 550]
            
            # Clean strings
            dist_str = " ".join(dist_words).strip()
            semi_str = " ".join(semi_words).strip()
            crit_str = " ".join(crit_words).strip()
            over_str = " ".join(over_words).strip()
            
            # Skip invalid or header lines
            combined_line = dist_str + semi_str + crit_str + over_str
            skip_keywords = [
                "S. No", "District", "Critical", "Exploited", "CATEGORIZATION", 
                "National", "Compilation", "ABSTRACT", "Note", "Total", "Units", 
                "Resources"
            ]
            if any(k.lower() in combined_line.lower() for k in skip_keywords):
                continue
                
            # If district has letters
            if any(c.isalpha() for c in dist_str):
                current_district = dist_str
                
            if not current_district:
                continue
                
            def add_record(unit, category):
                if unit and any(c.isalpha() for c in unit):
                    # Clean up random numbers like "1 "
                    u = "".join([c for c in unit if c.isalpha() or c.isspace()]).strip()
                    if len(u) > 2:
                        records.append({
                            "source": "GWRA-2025",
                            "assessmentYear": 2025,
                            "state": current_state,
                            "district": current_district,
                            "assessmentUnit": u,
                            "category": category,
                            "sourceDocument": "1762513884655822300file.pdf",
                            "sourcePage": page_num + 1
                        })

            add_record(semi_str, "Semi-Critical")
            add_record(crit_str, "Critical")
            add_record(over_str, "Over-Exploited")
            
    # Insert records
    inserted = 0
    duplicates = 0
    for r in records:
        try:
            await col.insert_one(r)
            inserted += 1
        except Exception as e:
            if "duplicate key error" in str(e).lower():
                duplicates += 1
                
    # Reporting
    print(f"Total assessment records extracted: {len(records)}")
    
    cat_counts = {"Safe": 0, "Semi-Critical": 0, "Critical": 0, "Over-Exploited": 0}
    state_counts = defaultdict(int)
    
    missing_state = 0
    missing_dist = 0
    missing_unit = 0
    missing_cat = 0
    
    for r in records:
        cat = r.get("category")
        if cat in cat_counts: cat_counts[cat] += 1
        state_counts[r.get("state")] += 1
        
        if not r.get("state"): missing_state += 1
        if not r.get("district"): missing_dist += 1
        if not r.get("assessmentUnit"): missing_unit += 1
        if not r.get("category"): missing_cat += 1

    print("\nRecords by category:")
    for c, count in cat_counts.items():
        print(f"{c}: {count}")
        
    print("\nRecords by state:")
    print("State | Assessment Records")
    for s, c in sorted(state_counts.items()):
        print(f"{s} | {c}")
        
    print("\nRecords with missing:")
    print(f"State: {missing_state}")
    print(f"District: {missing_dist}")
    print(f"Assessment Unit: {missing_unit}")
    print(f"Category: {missing_cat}")
    
    print("\nFive source-validation examples:")
    for i in range(min(5, len(records))):
        r = records[i]
        print(f"{r['state']} | {r['district']} | {r['assessmentUnit']} | {r['category']} | {r['sourceDocument']} | Page {r['sourcePage']}")

    print("\nDatabase insertion:")
    print(f"Inserted newly: {inserted}")
    print(f"Duplicates skipped: {duplicates}")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
