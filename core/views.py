# core/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from decouple import config

def home_view(request):
    """
    View para a página de apresentação/home.
    """
    return render(request, "core/home.html")

# @login_required
def daily_view(request):
    maps_api_key = config("Maps_API_KEY", default="")
    context = {"maps_api_key": maps_api_key}
    return render(request, "core/daily.html", context)


# @login_required
def hourly_view(request):
    maps_api_key = config("Maps_API_KEY", default="")
    context = {"maps_api_key": maps_api_key}
    return render(request, "core/hourly.html", context)


# @login_required
def real_time_view(request):
    maps_api_key = config("Maps_API_KEY", default="")
    context = {"maps_api_key": maps_api_key}
    return render(request, "core/real_time.html", context)