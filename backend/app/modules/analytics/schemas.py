from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AnalyticsSummaryResponse(BaseModel):
    totalStates: int
    totalDistricts: int
    totalRecords: int
    missingMetrics: List[str]

class StateRanking(BaseModel):
    rank: int
    state: str
    extractable_bcm: float
    status: str

class DistrictRanking(BaseModel):
    rank: int
    district: str
    state: Optional[str]
    risk_score: float
    risk_level: str

class RankingsResponse(BaseModel):
    level: str
    data: List[Any]

class TrendData(BaseModel):
    year: str
    extractable_bcm: Optional[float] = None
    depth_gt_40_pct: Optional[float] = None
    depth_20_40_pct: Optional[float] = None

class TrendsResponse(BaseModel):
    region: str
    trends: List[TrendData]

class AssessmentRecord(BaseModel):
    source: str
    assessmentYear: int
    state: str
    district: str
    assessmentUnit: str
    category: str
    sourceDocument: str
    sourcePage: int

class CategoryDistribution(BaseModel):
    category: str
    count: int

class RegionCategorySummary(BaseModel):
    region: str
    totalUnits: int
    distribution: List[CategoryDistribution]

class MapStateData(BaseModel):
    state: str
    latestAssessmentYear: int
    dominantCategory: Optional[str]
    totalAssessmentUnits: int
    totalDistricts: int
    categoryDistribution: List[CategoryDistribution]

class MapDataResponse(BaseModel):
    states: List[MapStateData]

class MapDistrictData(BaseModel):
    district: str
    assessmentUnitCount: int
    categoryCounts: Dict[str, int]
    riskCategory: Optional[str]
    assessmentYear: int
    assessmentUnits: List[AssessmentRecord] = []

class MapDistrictResponse(BaseModel):
    state: str
    districts: List[MapDistrictData]
