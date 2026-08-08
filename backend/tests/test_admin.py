import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy.exc import OperationalError

from app.api.routes import admin_auth as admin_auth_routes
from app.core.config import settings
from app.services.auth import CSRF_COOKIE, generate_password_hash


@pytest.fixture(autouse=True)
def admin_settings(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    monkeypatch.setattr(settings, "admin_username", "test-admin")
    monkeypatch.setattr(settings, "admin_password_hash", generate_password_hash("correct-password"))
    monkeypatch.setattr(settings, "media_storage_root", str(tmp_path / "uploads"))
    monkeypatch.setattr(settings, "public_api_url", "http://testserver")
    monkeypatch.setattr(settings, "environment", "test")


def login(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/admin/auth/login",
        json={"username": "test-admin", "password": "correct-password"},
    )
    assert response.status_code == 200
    return {"origin": "http://localhost:3000", "x-csrf-token": client.cookies[CSRF_COOKIE]}


def image_file() -> tuple[str, io.BytesIO, str]:
    buffer = io.BytesIO()
    Image.new("RGB", (80, 100), "black").save(buffer, format="WEBP")
    buffer.seek(0)
    return ("fixture.webp", buffer, "image/webp")


def upload(client: TestClient, headers: dict[str, str]) -> dict:
    response = client.post("/api/admin/media", headers=headers, files={"file": image_file()})
    assert response.status_code == 201
    return response.json()


def product_payload(asset: dict, slug: str = "admin-test-design") -> dict:
    return {
        "name": "Admin Test Design",
        "slug": slug,
        "category": "oversized",
        "garment_slug": "oversized",
        "theme_slug": "toon-art",
        "color_slug": "black",
        "size_slugs": ["xs", "m", "xl"],
        "images": [
            {
                "media_asset_id": asset["id"],
                "alt_text": "Test-only black product design",
                "width": asset["width"],
                "height": asset["height"],
                "position": 0,
                "role": "primary",
            }
        ],
        "availability": "available",
        "display_order": 1,
    }


def test_admin_authentication_and_logout(client: TestClient) -> None:
    assert client.get("/api/admin/dashboard").status_code == 401
    assert (
        client.post(
            "/api/admin/auth/login", json={"username": "test-admin", "password": "wrong"}
        ).status_code
        == 401
    )
    headers = login(client)
    assert client.get("/api/admin/auth/session").status_code == 200
    assert client.post("/api/admin/auth/logout").status_code == 403
    assert client.post("/api/admin/auth/logout", headers=headers).status_code == 204
    assert client.get("/api/admin/auth/session").status_code == 401


def test_admin_login_returns_service_unavailable_when_session_storage_fails(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def raise_operational_error(_db):
        raise OperationalError("db", None, Exception("boom"))

    monkeypatch.setattr(admin_auth_routes, "create_admin_session", raise_operational_error)

    response = client.post(
        "/api/admin/auth/login",
        json={"username": "test-admin", "password": "correct-password"},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Admin authentication service is unavailable"


def test_unauthorized_mutations_are_rejected(client: TestClient) -> None:
    assert client.post("/api/admin/products", json={}).status_code == 401
    login(client)
    assert client.post("/api/admin/products", json={}).status_code == 403


def test_media_validation_and_metadata(client: TestClient) -> None:
    headers = login(client)
    asset = upload(client, headers)
    assert asset["width"] == 80
    assert asset["height"] == 100
    assert asset["storageKey"].startswith("products/")
    assert "fixture.webp" not in asset["storageKey"]
    invalid = client.post(
        "/api/admin/media",
        headers=headers,
        files={"file": ("bad.webp", b"not an image", "image/webp")},
    )
    assert invalid.status_code == 422
    unsupported = client.post(
        "/api/admin/media",
        headers=headers,
        files={"file": ("bad.gif", b"GIF89a", "image/gif")},
    )
    assert unsupported.status_code == 415


def test_create_edit_archive_and_public_catalog(client: TestClient) -> None:
    headers = login(client)
    asset = upload(client, headers)
    created = client.post("/api/admin/products", headers=headers, json=product_payload(asset))
    assert created.status_code == 201, created.text
    product = created.json()
    assert product["prices"] == {"LKR": {"minorAmount": 250_000, "currency": "LKR"}}
    assert product["displayOrder"] == 1
    assert "USD" not in product["prices"]
    assert {variant["sizeId"] for variant in product["variants"]} == {"xs", "m", "xl"}
    assert product["images"]["primary"]["src"].startswith("http://testserver/media/")

    public = client.get("/api/products")
    assert public.json()["total"] == 1
    assert client.get("/api/products/admin-test-design").status_code == 200

    duplicate = client.post("/api/admin/products", headers=headers, json=product_payload(asset))
    assert duplicate.status_code == 422
    assert duplicate.json()["detail"] == "Product slug already exists"

    updated_payload = product_payload(asset, slug="admin-test-design-edited")
    updated_payload["name"] = "Edited Admin Test Design"
    updated_payload["size_slugs"] = ["s", "l"]
    updated_payload["display_order"] = 3
    updated = client.patch(
        f"/api/admin/products/{product['id']}", headers=headers, json=updated_payload
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["name"] == "Edited Admin Test Design"
    assert updated.json()["displayOrder"] == 3
    assert {variant["sizeId"] for variant in updated.json()["variants"]} == {"s", "l"}

    assert client.delete(f"/api/admin/media/{asset['id']}", headers=headers).status_code == 409
    archived = client.post(f"/api/admin/products/{product['id']}/archive", headers=headers)
    assert archived.status_code == 204
    assert client.get("/api/products").json()["total"] == 0
    assert client.get("/api/products/admin-test-design-edited").status_code == 404


@pytest.mark.parametrize(
    "overrides",
    [
        {"color_slug": "pink"},
        {"size_slugs": ["2xl"]},
    ],
)
def test_admin_enforces_garment_options(client: TestClient, overrides: dict) -> None:
    headers = login(client)
    asset = upload(client, headers)
    payload = product_payload(asset)
    payload.update(overrides)
    response = client.post("/api/admin/products", headers=headers, json=payload)
    assert response.status_code == 422
