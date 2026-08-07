from typing import Protocol

from app.models import ProductImage


class MediaUrlResolver(Protocol):
    """Provider-independent boundary for turning stored references into delivery URLs."""

    def resolve(self, image: ProductImage) -> str: ...


class PublicUrlMediaResolver:
    def resolve(self, image: ProductImage) -> str:
        if image.public_url:
            return image.public_url
        raise ValueError(f"Image {image.id} has no configured public delivery URL")


media_url_resolver: MediaUrlResolver = PublicUrlMediaResolver()
