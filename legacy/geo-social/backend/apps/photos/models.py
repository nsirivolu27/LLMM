from django.conf import settings
from django.contrib.gis.db import models


class Place(models.Model):
    name = models.CharField(max_length=120)
    city = models.CharField(max_length=120)
    point = models.PointField(geography=True)

    def __str__(self):
        return f"{self.name} ({self.city})"


class Photo(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="photos")
    caption = models.CharField(max_length=280, blank=True)
    image_url = models.URLField()
    thumbnail_url = models.URLField(blank=True)
    location = models.ForeignKey(Place, null=True, blank=True, on_delete=models.SET_NULL, related_name="photos")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Photo<{self.id}> by {self.owner_id}"


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "photo")

