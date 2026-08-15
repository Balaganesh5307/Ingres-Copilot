from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.documents.router import router as documents_router
from app.modules.users.router import router as users_router
from app.modules.chat.router import router as chat_router
from app.modules.analytics.router import router as analytics_router
from app.modules.maps.router import router as maps_router
from app.modules.feedback.router import router as feedback_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(documents_router)
api_router.include_router(chat_router)
api_router.include_router(analytics_router)
api_router.include_router(maps_router)
api_router.include_router(feedback_router)
