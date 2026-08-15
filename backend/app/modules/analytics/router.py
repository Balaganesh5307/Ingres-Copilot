from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary():
    """
    Retrieve aggregated analytics for recharge vs extraction.
    Future: Will perform complex aggregations over the MongoDB documents collection.
    """
    return {"message": "Analytics module stubbed"}
