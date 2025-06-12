# Ficheiro core/views.py (VERSÃO FINAL COM 3 PÁGINAS)

import requests
import pandas as pd
from django.shortcuts import render
from django.conf import settings
from datetime import date, timedelta, datetime
import json
from django.utils.text import slugify

# --- VIEW PARA DADOS DIÁRIOS (HISTÓRICOS) ---
def daily_data_view(request):
    context = {"page_title": "Análise de Dados Diários"}
    context["Maps_api_key"] = settings.MAPS_API_KEY

    if request.method == "GET":
        today = date.today()
        one_month_ago = today - timedelta(days=30)
        context["default_start_date"] = one_month_ago.strftime("%Y-%m-%d")
        context["default_end_date"] = today.strftime("%Y-%m-%d")
        context["form_selected_parameters"] = ["ALLSKY_SFC_SW_DWN", "T2M", "RH2M", "WS10M", "PRECTOT", "PS"]
        context["table_data"] = None
        context["apex_chart_data_json"] = None

    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        start_date_raw = request.POST.get("start_date")
        end_date_raw = request.POST.get("end_date")
        selected_parameters_api = request.POST.getlist("parameters")

        context.update({
            "latitude": latitude, "longitude": longitude,
            "default_start_date": start_date_raw,
            "default_end_date": end_date_raw,
            "form_selected_parameters": selected_parameters_api
        })

        if not selected_parameters_api:
            context["error"] = "Por favor, selecione pelo menos uma variável climática."
            return render(request, "core/daily.html", context)

        if start_date_raw > end_date_raw:
            context["error"] = "A data de início não pode ser posterior à data de fim."
            return render(request, "core/daily.html", context)

        if latitude and longitude and start_date_raw and end_date_raw:
            start_date_api_format = start_date_raw.replace("-", "")
            end_date_api_format = end_date_raw.replace("-", "")
            start_date_obj = date.fromisoformat(start_date_raw)
            end_date_obj = date.fromisoformat(end_date_raw)
            
            context["start_date_formatted"] = start_date_obj.strftime("%d/%m/%Y")
            context["end_date_formatted"] = end_date_obj.strftime("%d/%m/%Y")
            
            parameters_string = ",".join(selected_parameters_api)
            base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
            params = {
                "parameters": parameters_string, "start": start_date_api_format, 
                "end": end_date_api_format, "latitude": context["latitude"], "longitude": context["longitude"],
                "format": "JSON", "community": "ag"
            }
            try:
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data_api = response.json()
                df = pd.DataFrame(data_api["properties"]["parameter"])
                if df.empty: raise KeyError("Dados não encontrados para o período/local.")
                rename_map = {
                    "ALLSKY_SFC_SW_DWN": "Radiação Solar (kWh/m²/dia)", "T2M": "Temperatura (°C)",
                    "RH2M": "Umidade (%)", "WS10M": "Vento (m/s)",
                    "PRECTOT": "Precipitação (mm/dia)", "PRECTOTCORR": "Precipitação (mm/dia)", "PS": "Pressão (kPa)"
                }
                df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)
                df["Data_Formatada"] = pd.to_datetime(df.index, format="%Y%m%d").strftime("%d/%m/%Y")
                
                apex_charts_series_data_list = []
                date_index_dt = pd.to_datetime(df.index, format="%Y%m%d")
                for api_param_name in selected_parameters_api:
                    friendly_name = rename_map.get(api_param_name)
                    if friendly_name and friendly_name in df.columns:
                        series_points = []
                        for idx, value in enumerate(df[friendly_name]):
                            series_points.append({"x": date_index_dt[idx].strftime("%d/%m/%Y"), "y": float(value) if pd.notna(value) and value not in [-999, -999.0] else None})
                        apex_charts_series_data_list.append({"name": friendly_name, "data": series_points})
                
                context["apex_charts_data_for_template_loop"] = apex_charts_series_data_list
                context["apex_chart_data_json"] = json.dumps(apex_charts_series_data_list)
                
                table_cols = ["Data_Formatada"] + [item["name"] for item in apex_charts_series_data_list]
                df_for_table = df[table_cols].copy()
                df_for_table.rename(columns={"Data_Formatada": "Data"}, inplace=True)
                context["table_headers"] = df_for_table.columns.tolist()
                context["table_data"] = df_for_table.to_dict("records")
            except (requests.exceptions.RequestException, KeyError) as e:
                print("ERRO DETALHADO (DAILY VIEW):", type(e).__name__, e)
                context["error"] = "Ocorreu um erro ao processar o seu pedido. Verifique os dados e tente novamente."
    
    return render(request, "core/daily.html", context)


# --- VIEW PARA DADOS HORÁRIOS (HISTÓRICOS) ---
def hourly_data_view(request):
    context = {}
    context["Maps_api_key"] = settings.MAPS_API_KEY
    context["page_title"] = "Análise de Dados Horários"

    if request.method == "GET":
        today = date.today()
        yesterday = today - timedelta(days=1)
        context["default_start_date"] = yesterday.strftime("%Y-%m-%d")
        context["default_end_date"] = today.strftime("%Y-%m-%d")
        context["form_selected_parameters"] = ["T2M", "RH2M", "WS10M", "PS"]
        context["table_data"] = None
        context["apex_chart_data_json"] = None

    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        start_date_raw = request.POST.get("start_date")
        end_date_raw = request.POST.get("end_date")
        selected_parameters_api = request.POST.getlist("parameters")

        context.update({
            "latitude": latitude, "longitude": longitude,
            "default_start_date": start_date_raw,
            "default_end_date": end_date_raw,
            "form_selected_parameters": selected_parameters_api
        })

        if not selected_parameters_api:
            context["error"] = "Por favor, selecione pelo menos uma variável climática."
            return render(request, "core/hourly.html", context)

        if start_date_raw > end_date_raw:
            context["error"] = "A data de início não pode ser posterior à data de fim."
            return render(request, "core/hourly.html", context)
        
        start_obj = date.fromisoformat(start_date_raw)
        end_obj = date.fromisoformat(end_date_raw)
        if (end_obj - start_obj).days > 365:
            context["error"] = "O período para dados horários não pode exceder 366 dias."
            return render(request, "core/hourly.html", context)

        if latitude and longitude and start_date_raw and end_date_raw:
            start_date_api_format = start_date_raw.replace("-", "")
            end_date_api_format = end_date_raw.replace("-", "")
            
            context["start_date_formatted"] = start_obj.strftime("%d/%m/%Y")
            context["end_date_formatted"] = end_obj.strftime("%d/%m/%Y")
            
            parameters_string = ",".join(selected_parameters_api)
            base_url = "https://power.larc.nasa.gov/api/temporal/hourly/point"
            params = {
                "parameters": parameters_string, "start": start_date_api_format, 
                "end": end_date_api_format, "latitude": context["latitude"], "longitude": context["longitude"],
                "format": "JSON", "community": "ag"
            }

            try:
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                df = pd.DataFrame(data["properties"]["parameter"])

                if df.empty: raise KeyError("Dados não encontrados para o período/local.")

                rename_map = {
                    "T2M": "Temperatura (°C)", "RH2M": "Umidade (%)",
                    "WS10M": "Vento (m/s)", "PS": "Pressão (kPa)"
                }
                df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)
                
                date_index_dt = pd.to_datetime(df.index, format="%Y%m%d%H")
                df["Data_e_Hora_Formatada"] = date_index_dt.strftime("%d/%m/%Y %H:%M")
                
                apex_charts_series_data_list = []
                for api_param_name in selected_parameters_api:
                    friendly_name = rename_map.get(api_param_name)
                    if friendly_name and friendly_name in df.columns:
                        series_points = []
                        for idx, value in enumerate(df[friendly_name]):
                            series_points.append({"x": date_index_dt[idx].strftime("%d/%m/%Y %H:%M"), "y": float(value) if pd.notna(value) and value not in [-999, -999.0] else None})
                        apex_charts_series_data_list.append({"name": friendly_name, "data": series_points})
                
                context["apex_charts_data_for_template_loop"] = apex_charts_series_data_list
                context["apex_chart_data_json"] = json.dumps(apex_charts_series_data_list)
                
                table_cols = ["Data_e_Hora_Formatada"] + [item["name"] for item in apex_charts_series_data_list]
                df_for_table = df[table_cols].copy()
                df_for_table.rename(columns={"Data_e_Hora_Formatada": "Data e Hora"}, inplace=True)
                context["table_headers"] = df_for_table.columns.tolist()
                context["table_data"] = df_for_table.to_dict("records")

            except (requests.exceptions.RequestException, KeyError) as e:
                print("ERRO DETALHADO (HOURLY VIEW):", type(e).__name__, e)
                context["error"] = "Ocorreu um erro ao processar o seu pedido. Verifique os dados e tente novamente."
    
    return render(request, "core/hourly.html", context)


# --- NOVA VIEW PARA DADOS EM TEMPO REAL ---
def real_time_view(request):
    context = {}
    context["Maps_api_key"] = settings.MAPS_API_KEY
    context["page_title"] = "Dados em Tempo Real (OpenWeather)"
    
    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        
        context.update({ "latitude": latitude, "longitude": longitude })

        if latitude and longitude:
            try:
                openweathermap_key = settings.OPENWEATHER_API_KEY
                base_url = "https://api.openweathermap.org/data/2.5/weather"
                params = {
                    "lat": latitude,
                    "lon": longitude,
                    "appid": openweathermap_key,
                    "units": "metric",
                    "lang": "pt_br"
                }
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                real_time_data = {
                    "descricao": data.get("weather", [{}])[0].get("description", "N/D").capitalize(),
                    "temperatura": data.get("main", {}).get("temp"),
                    "sensacao_termica": data.get("main", {}).get("feels_like"),
                    "temp_min": data.get("main", {}).get("temp_min"),
                    "temp_max": data.get("main", {}).get("temp_max"),
                    "umidade": data.get("main", {}).get("humidity"),
                    "vento_velocidade": round(data.get("wind", {}).get("speed", 0) * 3.6, 2), # Converte de m/s para km/h
                    "vento_direcao": data.get("wind", {}).get("deg"),
                    "pressao": data.get("main", {}).get("pressure"),
                    "visibilidade": data.get("visibility", 0) / 1000,
                    "nuvens": data.get("clouds", {}).get("all"),
                    "observado_em": datetime.fromtimestamp(data.get("dt", 0)).strftime('%d/%m/%Y %H:%M:%S'),
                    "nascer_sol": datetime.fromtimestamp(data.get("sys", {}).get("sunrise", 0)).strftime('%H:%M'),
                    "por_sol": datetime.fromtimestamp(data.get("sys", {}).get("sunset", 0)).strftime('%H:%M'),
                }
                context["real_time_data"] = real_time_data

            except requests.exceptions.RequestException as e:
                print("ERRO DETALHADO (REAL TIME VIEW):", type(e).__name__, e)
                context["error"] = "Erro de comunicação com o serviço de tempo real. Verifique as coordenadas ou a sua chave de API."
            except Exception as e:
                print("ERRO INESPERADO (REAL TIME VIEW):", type(e).__name__, e)
                context["error"] = "Ocorreu um erro ao processar os dados em tempo real."

    return render(request, "core/real_time.html", context)