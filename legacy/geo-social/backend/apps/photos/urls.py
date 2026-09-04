from rest_framework.routers import DefaultRouter

from .views import LikeViewSet, PhotoViewSet, PlaceViewSet


router = DefaultRouter()
router.register("places", PlaceViewSet, basename="places")
router.register("", PhotoViewSet, basename="photos")
router.register("likes", LikeViewSet, basename="likes")

urlpatterns = router.urls

