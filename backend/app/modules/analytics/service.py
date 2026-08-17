from app.core.database import get_database
from typing import List, Dict, Any, Optional

class AnalyticsService:
    @property
    def collection(self):
        return get_database()["analytics_data"]
        
    @property
    def assessments_collection(self):
        return get_database()["groundwater_assessments"]
        
    async def get_summary(self) -> Dict[str, Any]:
        total_states = len(await self.collection.distinct("state", {"type": "state"}))
        total_districts = len(await self.collection.distinct("district", {"type": "district"}))
        total_records = await self.collection.count_documents({})
        return {
            "totalStates": total_states,
            "totalDistricts": total_districts,
            "totalRecords": total_records,
            "missingMetrics": ["annualRecharge", "annualExtraction", "stageOfExtraction", "category"]
        }

    async def get_rankings(self, level: str, year: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
        match_stage = {"type": level}
        if year:
            match_stage["year"] = year
        if state:
            match_stage["state"] = {"$regex": f"^{state}$", "$options": "i"}

        if level == "state":
            # Rank by extractable_bcm
            pipeline = [
                {"$match": match_stage},
                {"$sort": {"extractable_bcm": -1}}
            ]
            results = await self.collection.aggregate(pipeline).to_list(100)
            
            rankings = []
            for i, r in enumerate(results):
                bcm = r.get("extractable_bcm", 0)
                status = "Critical" if bcm < 1.0 else "Warning" if bcm < 5.0 else "Stable"
                rankings.append({
                    "rank": i + 1,
                    "state": r.get("state"),
                    "extractable_bcm": bcm,
                    "status": status
                })
            return rankings
            
        elif level == "district":
            # Rank by risk_score
            pipeline = [
                {"$match": match_stage},
                {"$sort": {"risk_score": -1}}
            ]
            results = await self.collection.aggregate(pipeline).to_list(100)
            
            rankings = []
            for i, r in enumerate(results):
                score = r.get("risk_score", 0)
                risk_level = "Extreme" if score > 30 else "High" if score > 15 else "Medium"
                rankings.append({
                    "rank": i + 1,
                    "district": r.get("district"),
                    "state": r.get("state"),
                    "risk_score": score,
                    "risk_level": risk_level
                })
            return rankings
            
        return []

    async def get_trends(self, state: Optional[str] = None, district: Optional[str] = None) -> List[Dict[str, Any]]:
        match_stage = {}
        if district and district != "all":
            match_stage["type"] = "district"
            match_stage["district"] = {"$regex": f"^{district}$", "$options": "i"}
        elif state and state != "all":
            match_stage["type"] = "state"
            match_stage["state"] = {"$regex": f"^{state}$", "$options": "i"}
        else:
            # For 'all', we will aggregate total state BCM
            match_stage["type"] = "state"

        pipeline = [
            {"$match": match_stage},
            {"$sort": {"year": 1}}
        ]
        
        results = await self.collection.aggregate(pipeline).to_list(100)
        
        # If 'all', we need to sum by year
        if not state or state == "all":
            grouped = {}
            for r in results:
                y = r.get("year")
                if y not in grouped:
                    grouped[y] = {"year": y, "extractable_bcm": 0}
                grouped[y]["extractable_bcm"] += r.get("extractable_bcm", 0)
            return sorted(list(grouped.values()), key=lambda x: x["year"])
            
        return results

    async def get_region_data(self, type: str, name: str, year: Optional[str] = None) -> Dict[str, Any]:
        query = {"type": type, type: {"$regex": f"^{name}$", "$options": "i"}}
        if year:
            query["year"] = year
            return await self.collection.find_one(query, {"_id": 0})
            
        # Return latest year if none specified
        return await self.collection.find_one(query, {"_id": 0}, sort=[("year", -1)])

    async def get_categories(self, level: str, name: Optional[str] = None) -> Dict[str, Any]:
        match_stage = {}
        if level == "state" and name:
            match_stage["state"] = {"$regex": f"^{name}$", "$options": "i"}
        elif level == "district" and name:
            match_stage["district"] = {"$regex": f"^{name}$", "$options": "i"}

        pipeline = [
            {"$match": match_stage},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        results = await self.assessments_collection.aggregate(pipeline).to_list(100)
        
        distribution = [{"category": r["_id"], "count": r["count"]} for r in results if r["_id"]]
        total_units = sum(r["count"] for r in distribution)
        
        return {
            "region": name or "India",
            "totalUnits": total_units,
            "distribution": distribution
        }

    async def get_map_data(self) -> List[Dict[str, Any]]:
        pipeline = [
            {"$group": {
                "_id": "$state",
                "categories": {"$push": "$category"},
                "districts": {"$addToSet": "$district"},
                "assessmentYear": {"$max": "$assessmentYear"}
            }}
        ]
        results = await self.assessments_collection.aggregate(pipeline).to_list(100)
        
        map_data = []
        for r in results:
            state = r["_id"]
            if not state: continue
            
            categories = r["categories"]
            dist_counts = {}
            for c in categories:
                dist_counts[c] = dist_counts.get(c, 0) + 1
                
            dist_list = [{"category": k, "count": v} for k, v in dist_counts.items()]
            
            # Find dominant category
            dominant = None
            if dist_counts:
                dominant = max(dist_counts.items(), key=lambda x: x[1])[0]
                
            map_data.append({
                "state": state,
                "latestAssessmentYear": r.get("assessmentYear", 2025),
                "dominantCategory": dominant,
                "totalAssessmentUnits": len(categories),
                "totalDistricts": len(r["districts"]),
                "categoryDistribution": dist_list
            })
            
        return map_data

    async def get_map_data_districts(self, state: str) -> Dict[str, Any]:
        pipeline = [
            {"$match": {"state": {"$regex": f"^{state}$", "$options": "i"}}},
            {"$group": {
                "_id": "$district",
                "categories": {"$push": "$category"},
                "assessmentYear": {"$max": "$assessmentYear"},
                "units": {"$push": {
                    "assessmentUnit": "$assessmentUnit",
                    "category": "$category",
                    "assessmentYear": "$assessmentYear",
                    "sourceDocument": "$sourceDocument",
                    "sourcePage": "$sourcePage",
                    "source": "$source",
                    "state": "$state",
                    "district": "$district"
                }}
            }}
        ]
        results = await self.assessments_collection.aggregate(pipeline).to_list(1000)
        
        districts = []
        for r in results:
            district = r["_id"]
            if not district: continue
            
            categories = r["categories"]
            dist_counts = {}
            for c in categories:
                dist_counts[c] = dist_counts.get(c, 0) + 1
            
            # Risk Priority: Over-Exploited > Critical > Semi-Critical > Safe
            risk = None
            if "Over-Exploited" in dist_counts:
                risk = "Over-Exploited"
            elif "Critical" in dist_counts:
                risk = "Critical"
            elif "Semi-Critical" in dist_counts:
                risk = "Semi-Critical"
            elif "Safe" in dist_counts:
                risk = "Safe"
                
            districts.append({
                "district": district,
                "assessmentUnitCount": len(categories),
                "categoryCounts": dist_counts,
                "riskCategory": risk,
                "assessmentYear": r.get("assessmentYear", 2025),
                "assessmentUnits": r.get("units", [])
            })
            
        return {
            "state": state,
            "districts": districts
        }

    async def get_assessment_units(self, state: Optional[str] = None, district: Optional[str] = None, category: Optional[str] = None, limit: int = 15) -> List[Dict[str, Any]]:
        match_stage = {}
        if state:
            match_stage["State Name"] = {"$regex": f"^{state}$", "$options": "i"}
        if district:
            match_stage["District Name"] = {"$regex": f"^{district}$", "$options": "i"}
        if category:
            match_stage["Categorization"] = {"$regex": f"^{category}$", "$options": "i"}
            
        pipeline = [
            {"$match": match_stage},
            {"$sort": {"Stage of Ground Water Extraction (%)": -1}},
            {"$limit": limit},
            {"$project": {
                "_id": 0,
                "State Name": 1,
                "District Name": 1,
                "Name of Assessment Unit": 1,
                "Categorization": 1,
                "Stage of Ground Water Extraction (%)": 1,
                "Total Annual Ground Water Extraction": 1,
                "Annual Extractable Ground Water Resource": 1
            }}
        ]
        
        results = await self.assessments_collection.aggregate(pipeline).to_list(limit)
        return results

    async def get_comparison(self, entities: List[Any], entity_type: str, target_region: Optional[str] = None, year: Optional[int] = None) -> Dict[str, Any]:
        """
        Compare multiple entities. entity_type can be "state", "district", or "year".
        Returns formatted structure for comparison engine.
        """
        comparison_results = []
        
        for entity in entities:
            match_stage = {}
            if entity_type == "state":
                match_stage["state"] = {"$regex": f"^{entity}$", "$options": "i"}
                if year:
                    match_stage["assessmentYear"] = year
            elif entity_type == "district":
                match_stage["district"] = {"$regex": f"^{entity}$", "$options": "i"}
                if year:
                    match_stage["assessmentYear"] = year
            elif entity_type == "year":
                match_stage["assessmentYear"] = int(entity)
                if target_region:
                    match_stage["$or"] = [
                        {"state": {"$regex": f"^{target_region}$", "$options": "i"}},
                        {"district": {"$regex": f"^{target_region}$", "$options": "i"}}
                    ]

            pipeline = [
                {"$match": match_stage},
                {"$group": {
                    "_id": "$category",
                    "count": {"$sum": 1},
                    "maxYear": {"$max": "$assessmentYear"}
                }}
            ]
            
            results = await self.assessments_collection.aggregate(pipeline).to_list(1000)
            
            if results:
                total_units = sum(r["count"] for r in results)
                category_counts = {}
                max_year = None
                for r in results:
                    cat = r["_id"]
                    if cat:
                        category_counts[cat] = r["count"]
                    if r.get("maxYear"):
                        if max_year is None or r["maxYear"] > max_year:
                            max_year = r["maxYear"]
                
                # Format name based on entity type to be highly readable for UI
                name = str(entity)
                if entity_type == "year" and target_region:
                    name = f"{target_region} ({entity})"
                elif year:
                    name = f"{entity} ({year})"
                    
                comparison_results.append({
                    "name": name,
                    "assessmentYear": year or max_year or 2025,
                    "totalAssessmentUnits": total_units,
                    "categoryCounts": category_counts
                })
        
        return {"comparison": comparison_results}
