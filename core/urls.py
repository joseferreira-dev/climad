from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("", views.home_view, name="home"), 
    path("dicionario/", views.dictionary_view, name="dictionary"),
    path("diaria/", views.daily_view, name="daily"),
    path("horaria/", views.hourly_view, name="hourly"),
    path("tempo-real/", views.real_time_view, name="real_time"),
    path("sobre/", views.about_view, name="about"),
]