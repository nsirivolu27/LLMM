from django.contrib.gis.geos import Point
from rest_framework import serializers

from .models import Like, Photo, Place


class PlaceSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True)
    longitude = serializers.FloatField(write_only=True)

    class Meta:
        model = Place
        fields = ["id", "name", "city", "latitude", "longitude", "point"]
        read_only_fields = ["point"]

    def create(self, validated_data):
        latitude = validated_data.pop("latitude")
        longitude = validated_data.pop("longitude")
        validated_data["point"] = Point(longitude, latitude, srid=4326)
        return super().create(validated_data)


class PhotoSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    like_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Photo
        fields = [
            "id",
            "owner",
            "owner_username",
            "caption",
            "image_url",
            "thumbnail_url",
            "location",
            "status",
            "like_count",
            "created_at",
        ]
        read_only_fields = ["owner", "thumbnail_url", "status", "created_at"]


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "photo", "created_at"]
        read_only_fields = ["user", "created_at"]

