from fastapi import FastAPI

from .schemas import UploadRequest, UploadResponse
from .tasks import process_upload


app = FastAPI(title="LNKZ Upload Pipeline", version="0.1.0")


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.post("/uploads", response_model=UploadResponse)
def enqueue_upload(payload: UploadRequest):
    task = process_upload.delay(payload.photo_id, payload.image_url)
    return UploadResponse(photo_id=payload.photo_id, task_id=task.id, status="queued")

