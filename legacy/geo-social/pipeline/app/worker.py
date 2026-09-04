from celery import Celery

from .config import settings


celery_app = Celery("lnkz-pipeline", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_routes = {"app.tasks.process_upload": {"queue": "uploads"}}

