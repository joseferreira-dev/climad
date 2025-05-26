import requests
import pandas as pd
from django.shortcuts import render

def index(request):
    """
    Esta view busca dados da API da NASA POWER com base na latitude e longitude
    fornecidas pelo usuário e exibe as informações.
    """
    context = {}
    if request.method == 'POST':
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        if latitude and longitude:
            # Endpoint e parâmetros da API da NASA POWER, conforme documentação [cite: 8, 44]
            base_url = 'https://power.larc.nasa.gov/api/temporal/daily/point'
            params = {
                'parameters': 'ALLSKY_SFC_SW_DWN,T2M,RH2M,WS10M,PRECTOT,PS',
                'start': '20230101', # Usando um período recente como exemplo
                'end': '20231231',
                'latitude': latitude,
                'longitude': longitude,
                'format': 'JSON',
                'community': 'ag'
            }

            try:
                # Faz a requisição para a API
                response = requests.get(base_url, params=params)
                response.raise_for_status()  # Lança uma exceção para respostas com erro
                data = response.json()

                # Processa os dados recebidos para exibição
                # Usamos a biblioteca pandas para facilitar a manipulação [cite: 4]
                df = pd.DataFrame(data['properties']['parameter'])

                # Calculamos a média para simplificar a visualização inicial
                context['weather_data'] = {
                    'rad_solar': round(df['ALLSKY_SFC_SW_DWN'].mean(), 2),
                    'temperatura': round(df['T2M'].mean(), 2),
                    'umidade': round(df['RH2M'].mean(), 2),
                    'vento': round(df['WS10M'].mean(), 2),
                    'precipitacao': round(df['PRECTOTCORR'].mean(), 2),
                    'pressao': round(df['PS'].mean(), 2),
                }
                context['latitude'] = latitude
                context['longitude'] = longitude

            except requests.exceptions.RequestException as e:
                context['error'] = f"Erro ao acessar a API da NASA: {e}"
            except KeyError:
                 context['error'] = "Não foi possível encontrar dados para a localização fornecida. Verifique as coordenadas."


    return render(request, 'core/index.html', context)