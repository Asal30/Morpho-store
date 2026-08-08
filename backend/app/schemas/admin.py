from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.catalog import ProductCreate, ProductResponse


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=500)


class AdminSessionResponse(BaseModel):
    username: str
    expiresAt: datetime


class AdminDashboardResponse(BaseModel):
    totalProducts: int
    availableProducts: int
    unavailableProducts: int
    archivedProducts: int
    oversizedProducts: int
    raglanProducts: int
    customizedProducts: int
    recentProducts: list[ProductResponse]


class AdminProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int


class ProductUpdate(ProductCreate):
    pass


class MediaAssetResponse(BaseModel):
    id: str
    storageKey: str
    publicUrl: str
    originalFilename: str
    mimeType: str
    sizeBytes: int
    width: int
    height: int
    createdAt: datetime


class MediaListResponse(BaseModel):
    items: list[MediaAssetResponse]
    total: int
