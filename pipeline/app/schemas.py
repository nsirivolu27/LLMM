from pydantic import BaseModel, Field


class UploadRequest(BaseModel):
    photo_id: int
    image_url: str
    owner_id: int
    caption: str = Field(default="", max_length=280)


class UploadResponse(BaseModel):
    photo_id: int
    task_id: str
    status: str

