from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Like, Photo, Place
from .serializers import LikeSerializer, PhotoSerializer, PlaceSerializer


class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [permissions.IsAuthenticated]


class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.select_related("owner", "location").prefetch_related("likes").all()
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="nearby")
    def nearby(self, request):
        lat = float(request.query_params.get("lat"))
        lng = float(request.query_params.get("lng"))
        radius_m = float(request.query_params.get("radius_m", 5000))
        user_point = Point(lng, lat, srid=4326)

        queryset = (
            self.get_queryset()
            .filter(location__point__distance_lte=(user_point, radius_m))
            .annotate(distance_m=Distance("location__point", user_point))
            .order_by("distance_m")
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="mark-processing")
    def mark_processing(self, request, pk=None):
        photo = self.get_object()
        photo.status = Photo.Status.PROCESSING
        photo.save(update_fields=["status", "updated_at"])
        return Response({"status": photo.status})


class LikeViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

