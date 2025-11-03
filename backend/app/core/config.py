from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    FIREBASE_PROJECT_ID: str | None = None
    GROQ_API_KEY: str | None = None
    HUGGINGFACE_API_KEY: str | None = None

    # Load values from .env and ignore any extra keys that are not defined
    # on this Settings class so that a wider .env does not raise validation
    # errors when Settings() is constructed.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
