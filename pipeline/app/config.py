import os


class Settings:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    postgres_host = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port = int(os.getenv("POSTGRES_PORT", "5432"))
    postgres_db = os.getenv("POSTGRES_DB", "lnkz")
    postgres_user = os.getenv("POSTGRES_USER", "lnkz")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "lnkz")


settings = Settings()

