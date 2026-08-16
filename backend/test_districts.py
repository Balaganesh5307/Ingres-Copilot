import asyncio
import json
from app.modules.analytics.service import AnalyticsService
from app.core.database import connect_to_mongo, close_mongo_connection

async def test():
    await connect_to_mongo()
    service = AnalyticsService()
    
    districts = await service.get_map_data_districts("Tamil Nadu")
    print("TAMIL NADU DISTRICTS:")
    print(json.dumps(districts, indent=2))
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test())
