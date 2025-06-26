# core/urls.py

from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    # A URL raiz agora aponta para a página de apresentação
    path("", views.home_view, name="home"), 
    
    # Mapeia as URLs específicas para cada tipo de análise
    path("diaria/", views.daily_view, name="daily"),
    path("horaria/", views.hourly_view, name="hourly"),
    path("tempo-real/", views.real_time_view, name="real_time"),
]