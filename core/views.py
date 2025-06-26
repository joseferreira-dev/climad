# core/views.py
import json
from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from decouple import config

def home_view(request):
    return render(request, "core/home.html")

def dictionary_view(request):
    """
    View para a página de dicionário de dados.
    """
    json_path = settings.STATICFILES_DIRS[0] / 'data/data_dictionary.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        dictionary_data = json.load(f)
    context = {'dictionary_data': dictionary_data}
    return render(request, "core/dictionary.html", context)

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