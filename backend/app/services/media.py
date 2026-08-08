import io
import secrets
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Protocol

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import MediaAsset, ProductImage
from app.schemas.admin import MediaAssetResponse, MediaListResponse

MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_MIME_FORMATS = {
    "image/jpeg": ("JPEG", ".jpg"),
    "image/png": ("PNG", ".png"),
    "image/webp": ("WEBP", ".webp"),
}


@dataclass(frozen=True)
class StoredMedia:
    storage_key: str
    public_url: str


class MediaStorage(Protocol):
    def save(self, content: bytes, extension: str) -> StoredMedia: ...
    def delete(self, storage_key: str) -> None: ...


class LocalMediaStorage:
    def __init__(self, root: str, public_api_url: str):
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        self.public_api_url = public_api_url.rstrip("/")

    def save(self, content: bytes, extension: str) -> StoredMedia:
        key = PurePosixPath("products", f"{secrets.token_hex(24)}{extension}").as_posix()
        target = (self.root / Path(key)).resolve()
        if self.root not in target.parents:
            raise ValueError("Unsafe media storage path")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return StoredMedia(key, f"{self.public_api_url}/media/{key}")

    def delete(self, storage_key: str) -> None:
        target = (self.root / Path(storage_key)).resolve()
        if self.root not in target.parents:
            raise ValueError("Unsafe media storage path")
        target.unlink(missing_ok=True)


def get_media_storage() -> MediaStorage:
    if settings.media_storage_backend != "local":
        raise RuntimeError(f"Unsupported media storage backend: {settings.media_storage_backend}")
    if settings.environment == "production":
        raise RuntimeError("Local media storage is not permitted in production")
    return LocalMediaStorage(settings.media_storage_root, settings.public_api_url)


class MediaUrlResolver(Protocol):
    def resolve(self, image: ProductImage) -> str: ...


class ConfiguredMediaUrlResolver:
    def resolve(self, image: ProductImage) -> str:
        if image.public_url:
            return image.public_url
        if image.storage_key:
            return f"{settings.public_api_url.rstrip('/')}/media/{image.storage_key}"
        raise ValueError(f"Image {image.id} has no delivery reference")


media_url_resolver: MediaUrlResolver = ConfiguredMediaUrlResolver()


def serialize_media(asset: MediaAsset) -> MediaAssetResponse:
    return MediaAssetResponse(
        id=asset.id,
        storageKey=asset.storage_key,
        publicUrl=asset.public_url
        or f"{settings.public_api_url.rstrip('/')}/media/{asset.storage_key}",
        originalFilename=asset.original_filename,
        mimeType=asset.mime_type,
        sizeBytes=asset.size_bytes,
        width=asset.width,
        height=asset.height,
        createdAt=asset.created_at,
    )


async def upload_media(session: Session, upload: UploadFile) -> MediaAssetResponse:
    if upload.content_type not in ALLOWED_MIME_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported image type"
        )
    content = await upload.read(MAX_IMAGE_BYTES + 1)
    if not content or len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image exceeds 10 MB"
        )
    expected_format, extension = ALLOWED_MIME_FORMATS[upload.content_type]
    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
        with Image.open(io.BytesIO(content)) as image:
            width, height = image.size
            actual_format = image.format
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Invalid image data"
        ) from None
    if actual_format != expected_format:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Image MIME type mismatch"
        )

    stored = get_media_storage().save(content, extension)
    asset = MediaAsset(
        storage_key=stored.storage_key,
        public_url=stored.public_url,
        original_filename=Path(upload.filename or "upload").name[:255],
        mime_type=upload.content_type,
        size_bytes=len(content),
        width=width,
        height=height,
    )
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return serialize_media(asset)


def list_media(session: Session, page: int, page_size: int) -> MediaListResponse:
    total = session.scalar(select(func.count()).select_from(MediaAsset)) or 0
    assets = session.scalars(
        select(MediaAsset)
        .order_by(MediaAsset.created_at.desc(), MediaAsset.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return MediaListResponse(items=[serialize_media(asset) for asset in assets], total=total)


def delete_media(session: Session, asset_id: str) -> None:
    asset = session.get(MediaAsset, asset_id)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not found")
    in_use = session.scalar(
        select(func.count())
        .select_from(ProductImage)
        .where(ProductImage.media_asset_id == asset.id)
    )
    if in_use:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Media asset is in use")
    get_media_storage().delete(asset.storage_key)
    session.delete(asset)
    session.commit()
