from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional

class RoleEnum(str, Enum):
    ADMIN = "Admin"
    RESEARCHER = "Researcher"
    GOVERNMENT_OFFICER = "Government Officer"
    PUBLIC_USER = "Public User"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.PUBLIC_USER

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
