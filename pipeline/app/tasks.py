from io import BytesIO

import psycopg
from PIL import Image

from .config import settings
from .worker import celery_app


def _db_connection():
    return psycopg.connect(
        host=settings.postgres_host,
        port=settings.postgres_port,
        dbname=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password,
    )


@celery_app.task(name="app.tasks.process_upload")
def process_upload(photo_id: int, image_url: str) -> dict:
    """
    Simulates thumbnail creation and persistence updates.
    In a production version this would download the image, extract EXIF,
    generate variants, and upload derived assets to object storage.
    """
    image = Image.new("RGB", (640, 640), color=(245, 184, 65))
    buffer = BytesIO()
    image.thumbnail((320, 320))
    image.save(buffer, format="JPEG")

    thumbnail_url = f"{image_url.rstrip('/')}/thumb/{photo_id}.jpg"

    with _db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE photos_photo
                SET status = %s, thumbnail_url = %s, updated_at = NOW()
                WHERE id = %s
                """,
                ("ready", thumbnail_url, photo_id),
            )
        conn.commit()

    return {"photo_id": photo_id, "thumbnail_url": thumbnail_url, "status": "ready"}

