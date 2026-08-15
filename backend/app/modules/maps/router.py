from fastapi import APIRouter

router = APIRouter(prefix="/maps", tags=["Maps"])

@router.get("/markers")
async def get_map_markers():
    """
    Retrieve geospatial data points for the interactive map.
    Future: Will return GeoJSON or coordinate data parsed from uploaded documents.
    """
    return {"message": "Maps module stubbed"}
