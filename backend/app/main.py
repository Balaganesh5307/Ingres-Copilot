from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.router import api_router

app = FastAPI(
    title="Ingres Copilot API",
    description="Backend API for Groundwater Intelligence Assistant",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """
    Basic health check endpoint to verify API is running.
    """
    return {"status": "healthy", "version": "1.0.0"}

# Mount the v1 API router
app.include_router(api_router, prefix="/api/v1")
