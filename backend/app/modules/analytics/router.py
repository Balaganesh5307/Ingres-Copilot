from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from .service import AnalyticsService
from .schemas import AnalyticsSummaryResponse, RankingsResponse, TrendsResponse, RegionCategorySummary, MapDataResponse, MapDistrictResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_service():
    return AnalyticsService()

@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def get_summary(service: AnalyticsService = Depends(get_service)):
    return await service.get_summary()

@router.get("/rankings", response_model=RankingsResponse)
async def get_rankings(
    level: str = Query(..., description="'state' or 'district'"),
    year: str = Query(..., description="Assessment year"),
    service: AnalyticsService = Depends(get_service)
):
    try:
        rankings = await service.get_rankings(level, year)
        return RankingsResponse(data=rankings)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories", response_model=RegionCategorySummary)
async def get_categories(
    level: str = Query("state", description="'state' or 'district'"),
    name: Optional[str] = Query(None, description="Name of the state or district"),
    service: AnalyticsService = Depends(get_service)
):
    return await service.get_categories(level, name)

@router.get("/map-data", response_model=MapDataResponse)
async def get_map_data(service: AnalyticsService = Depends(get_service)):
    states = await service.get_map_data()
    return MapDataResponse(states=states)

@router.get("/map-data/districts/{state}", response_model=MapDistrictResponse)
async def get_map_data_districts(state: str, service: AnalyticsService = Depends(get_service)):
    return await service.get_map_data_districts(state)

@router.get("/trends", response_model=TrendsResponse)
async def get_trends(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    service: AnalyticsService = Depends(get_service)
):
    trends = await service.get_trends(state, district)
    region = district if district and district != "all" else state if state and state != "all" else "India"
    return TrendsResponse(region=region, trends=trends)

@router.get("/state/{state}")
async def get_state_data(state: str, year: Optional[str] = Query(None), service: AnalyticsService = Depends(get_service)):
    return await service.get_region_data("state", state, year)

@router.get("/district/{state}/{district}")
async def get_district_data(state: str, district: str, year: Optional[str] = Query(None), service: AnalyticsService = Depends(get_service)):
    return await service.get_region_data("district", district, year)
