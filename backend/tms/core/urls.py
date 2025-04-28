from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r'tournaments', views.TournamentViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'participants', views.ParticipantViewSet)
router.register(r'matches', views.MatchViewSet)

urlpatterns = [
    path('auth/login/', views.login, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('tournaments/<int:pk>/add-sample-participants/', 
         views.TournamentViewSet.as_view({'post': 'add_sample_participants'}), 
         name='add-sample-participants'),
    path('', include(router.urls)),
]