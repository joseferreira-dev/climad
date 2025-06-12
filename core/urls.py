from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='daily_data'),
    path('horario/', views.hourly_data_view, name='hourly_data'),
]