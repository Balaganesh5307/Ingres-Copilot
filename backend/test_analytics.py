import asyncio
import json
from app.modules.analytics.service import AnalyticsService
from app.core.database import connect_to_mongo, close_mongo_connection

async def test():
    await connect_to_mongo()
    service = AnalyticsService()
    summary = await service.get_summary()
    print("Summary:", summary)
    
    rankings = await service.get_rankings("state")
    print("Rankings:", rankings[:2])
    
    trends = await service.get_trends()
    print("Trends:", trends[:2])
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test())
