import json
from django.shortcuts import render
from django.conf import settings

def home_view(request):
    """
    Renderiza a página inicial.
    """
    return render(request, "core/home.html")

def daily_view(request):
    """
    Renderiza a página de análise diária e passa as chaves de API necessárias.
    """
    context = {
        'maps_api_key': settings.MAPS_API_KEY,
        'RECAPTCHA_SITE_KEY': settings.RECAPTCHA_SITE_KEY 
    }
    return render(request, "core/daily.html", context)


def hourly_view(request):
    """
    Renderiza a página de análise horária e passa as chaves de API necessárias.
    """
    context = {
        'maps_api_key': settings.MAPS_API_KEY,
        'RECAPTCHA_SITE_KEY': settings.RECAPTCHA_SITE_KEY
    }
    return render(request, "core/hourly.html", context)


def real_time_view(request):
    """
    Renderiza a página de análise em tempo real e passa as chaves de API necessárias.
    """
    context = {
        'maps_api_key': settings.MAPS_API_KEY,
        'RECAPTCHA_SITE_KEY': settings.RECAPTCHA_SITE_KEY
    }
    return render(request, "core/real_time.html", context)


def dictionary_view(request):
    """
    Renderiza a página do dicionário de dados.
    """
    json_path = settings.STATICFILES_DIRS[0] / 'data/data_dictionary.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        dictionary_data = json.load(f)
    context = {'dictionary_data': dictionary_data}
    return render(request, "core/dictionary.html", context)

def about_view(request):
    """
    Renderiza a página Sobre o Projeto.
    """
    return render(request, "core/about.html")
