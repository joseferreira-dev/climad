import requests
import pandas as pd
from django.shortcuts import render
from django.conf import settings
from datetime import date, timedelta

def index(request):
    """
    Esta view busca dados da API da NASA POWER com base nas seleções
    do utilizador e exibe os resultados numa tabela interativa.
    """
    context = {}
    context["Maps_api_key"] = settings.MAPS_API_KEY

    if request.method == "GET":
        today = date.today()
        one_month_ago = today - timedelta(days=30)
        context["default_start_date"] = one_month_ago.strftime("%Y-%m-%d")
        context["default_end_date"] = today.strftime("%Y-%m-%d")

    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        start_date_raw = request.POST.get("start_date")
        end_date_raw = request.POST.get("end_date")
        selected_parameters = request.POST.getlist("parameters")

        if not selected_parameters:
            context["error"] = "Por favor, selecione pelo menos uma variável climática."
            today = date.today()
            one_month_ago = today - timedelta(days=30)
            context["default_start_date"] = one_month_ago.strftime("%Y-%m-%d")
            context["default_end_date"] = today.strftime("%Y-%m-%d")
            return render(request, "core/index.html", context)

        if start_date_raw > end_date_raw:
            context["error"] = "A data de início não pode ser posterior à data de fim."
            return render(request, "core/index.html", context)

        if latitude and longitude and start_date_raw and end_date_raw:
            start_date_api = start_date_raw.replace("-", "")
            end_date_api = end_date_raw.replace("-", "")

            start_date_obj = date.fromisoformat(start_date_raw)
            end_date_obj = date.fromisoformat(end_date_raw)

            context.update({
                "latitude": latitude, "longitude": longitude,
                "start_date_formatted": start_date_obj.strftime("%d/%m/%Y"),
                "end_date_formatted": end_date_obj.strftime("%d/%m/%Y")
            })

            parameters_string = ",".join(selected_parameters)
            
            base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
            params = {
                "parameters": parameters_string,
                "start": start_date_api, "end": end_date_api,
                "latitude": latitude, "longitude": longitude,
                "format": "JSON", "community": "ag"
            }

            try:
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                df = pd.DataFrame(data["properties"]["parameter"])

                if df.empty:
                    raise KeyError("O DataFrame retornado pela API está vazio.")

                rename_map = {
                    "ALLSKY_SFC_SW_DWN": "Radiação Solar (kWh/m²/dia)",
                    "T2M": "Temperatura (°C)",
                    "RH2M": "Umidade (%)",
                    "WS10M": "Vento (m/s)",
                    "PRECTOT": "Precipitação (mm/dia)",
                    "PRECTOTCORR": "Precipitação (mm/dia)",
                    "PS": "Pressão (kPa)"
                }
                df.rename(columns=rename_map, inplace=True)
                
                df["Data"] = pd.to_datetime(df.index, format="%Y%m%d").strftime("%Y-%m-%d")
                cols = ["Data"] + [col for col in df if col != "Data"]
                df = df[cols]
                
                context["table_headers"] = df.columns.tolist()
                context["table_data"] = df.to_dict("records")

            except requests.exceptions.RequestException as e:
                print("ERRO DE API:", e)
                context["error"] = "Ocorreu um erro de comunicação com o serviço de dados climáticos. Por favor, tente novamente mais tarde."
            except KeyError:
                context["error"] = "Não foram encontrados dados para a combinação de local e período selecionados. Por favor, verifique os dados."

    return render(request, "core/index.html", context)