from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

CurrencyCode = Literal["LKR", "USD"]
Availability = Literal["available", "unavailable"]
Category = Literal["oversized", "raglan", "customized"]
ImageRole = Literal["primary", "hover", "gallery"]


class OptionResponse(BaseModel):
    id: str
    label: str
    swatch: str | None = None


class PriceResponse(BaseModel):
    minorAmount: int
    currency: CurrencyCode


class ImageResponse(BaseModel):
    src: str
    alt: str
    width: int
    height: int


class ProductImagesResponse(BaseModel):
    primary: ImageResponse
    hover: ImageResponse | None = None
    gallery: list[ImageResponse]


class ThemeResponse(BaseModel):
    id: str
    label: str


class VariantResponse(BaseModel):
    id: str
    colorId: str
    sizeId: str
    availability: Availability
    prices: dict[CurrencyCode, PriceResponse] | None = None


class ProductResponse(BaseModel):
    id: str
    slug: str
    name: str
    category: Category
    garmentType: str
    theme: ThemeResponse | None
    description: str | None = None
    images: ProductImagesResponse
    colors: list[OptionResponse]
    sizes: list[OptionResponse]
    prices: dict[CurrencyCode, PriceResponse]
    variants: list[VariantResponse]
    availability: Availability


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    page: int
    pageSize: int
    total: int
    pages: int


class GarmentOptionsResponse(BaseModel):
    id: str
    label: str
    colors: list[OptionResponse]
    sizes: list[OptionResponse]
    standardPrices: dict[CurrencyCode, PriceResponse]
    customizedPrices: dict[CurrencyCode, PriceResponse]


class CatalogOptionsResponse(BaseModel):
    themes: list[ThemeResponse]
    garments: list[GarmentOptionsResponse]


class ProductImageCreate(BaseModel):
    storage_key: str | None = None
    public_url: HttpUrl | None = None
    alt_text: str = Field(min_length=1, max_length=300)
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    position: int = Field(ge=0)
    role: ImageRole


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=160)
    description: str | None = None
    category: Category
    garment_slug: Literal["oversized", "raglan"]
    theme_slug: str | None = None
    color_slug: str
    size_slugs: list[str] = Field(min_length=1)
    images: list[ProductImageCreate] = Field(min_length=1)
    availability: Availability = "available"
    display_order: int = Field(default=0, ge=0)
