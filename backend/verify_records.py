import asyncio
import pymupdf
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def validate():
    await connect_to_mongo()
    db = get_database()
    col = db["groundwater_assessments"]
    
    # Get 5 records spread out across states
    docs = await col.aggregate([{"$sample": {"size": 5}}]).to_list(5)
    
    doc_pdf = pymupdf.open("ingestion/1762513884655822300file.pdf")
    
    for d in docs:
        state = d['state']
        district = d['district']
        unit = d['assessmentUnit']
        category = d['category']
        year = d['assessmentYear']
        page_num = d['sourcePage']
        
        print(f"Record:")
        print(f"1. State: {state}")
        print(f"2. District: {district}")
        print(f"3. Assessment Unit: {unit}")
        print(f"4. Category: {category}")
        print(f"5. Stage of Groundwater Extraction: Not extracted into MongoDB")
        print(f"6. Source document: 1762513884655822300file.pdf")
        print(f"7. Source page: {page_num}")
        
        # Check PDF page
        page = doc_pdf[page_num - 1] # 0-indexed in pymupdf
        text = page.get_text()
        
        # We don't have Stage of Groundwater Extraction in MongoDB or the script, but let's see if we can find it in the text.
        # Annexure IV(A) does NOT contain Stage of Extraction. It just lists categories.
        
        print(f"PDF check: Does unit '{unit}' exist on page {page_num}? {'YES' if unit in text else 'NO (might be split/typo)'}")
        print("-" * 50)
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(validate())
