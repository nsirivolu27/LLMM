from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    bio = models.CharField(max_length=280, blank=True)
    home_city = models.CharField(max_length=120, blank=True)
    avatar_url = models.URLField(blank=True)

