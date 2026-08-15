from fastapi import APIRouter

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/")
async def submit_feedback():
    """
    Submit user feedback or report an issue.
    Future: Will store feedback in a dedicated MongoDB collection.
    """
    return {"message": "Feedback module stubbed"}
