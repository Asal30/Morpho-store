from functools import lru_cache

from pydantic import AnyHttpUrl, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "MORPHO Store API"
    environment: str = "development"
    frontend_url: AnyHttpUrl = "http://localhost:3000"
    cors_origins: list[AnyHttpUrl] = [AnyHttpUrl("http://localhost:3000")]

    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "morpho_store"
    db_user: str = "morpho"
    db_password: str = "morpho_local"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
