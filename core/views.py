import requests
import pandas as pd
from django.shortcuts import render
from django.conf import settings
from datetime import date, timedelta, datetime # Adicionado datetime
import json

def index(request):
    context = {}
    context["Maps_api_key"] = settings.MAPS_API_KEY 

    # Define valores padrão para o primeiro carregamento (GET)
    if request.method == "GET":
        today = date.today()
        one_month_ago = today - timedelta(days=30)
        context["default_start_date"] = one_month_ago.strftime("%Y-%m-%d")
        context["default_end_date"] = today.strftime("%Y-%m-%d")
        context["form_selected_parameters"] = ["ALLSKY_SFC_SW_DWN", "T2M", "RH2M", "WS10M", "PRECTOT", "PS"]
        context["table_data"] = None
        context["apex_chart_data_json"] = None # Nova variável para ApexCharts

    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        start_date_raw = request.POST.get("start_date")
        end_date_raw = request.POST.get("end_date")
        selected_parameters_api = request.POST.getlist("parameters")

        context.update({
            "latitude": latitude,
            "longitude": longitude,
            "default_start_date": start_date_raw,
            "default_end_date": end_date_raw,
            "form_selected_parameters": selected_parameters_api
        })

        if not selected_parameters_api:
            context["error"] = "Por favor, selecione pelo menos uma variável climática."
            return render(request, "core/index.html", context)

        if start_date_raw > end_date_raw:
            context["error"] = "A data de início não pode ser posterior à data de fim."
            return render(request, "core/index.html", context)

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
                data_api = response.json() # Renomeado para evitar conflito com 'data' do pandas
                df = pd.DataFrame(data_api["properties"]["parameter"])

                if df.empty:
                    raise KeyError("O DataFrame retornado pela API está vazio (sem dados para o período/local).")

                rename_map = {
                    "ALLSKY_SFC_SW_DWN": "Radiação Solar (kWh/m²/dia)", "T2M": "Temperatura (°C)",
                    "RH2M": "Umidade (%)", "WS10M": "Vento (m/s)",
                    "PRECTOT": "Precipitação (mm/dia)", "PRECTOTCORR": "Precipitação (mm/dia)", # Mantido para segurança
                    "PS": "Pressão (kPa)"
                }
                df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)
                
                # Mantém a coluna de data original (índice YYYYMMDD) para conversão para timestamp
                # e cria uma formatada para a tabela
                df["Data_Para_Tabela"] = pd.to_datetime(df.index, format="%Y%m%d").strftime("%d/%m/%Y")
                
                # **** PREPARAÇÃO DE DADOS PARA APEXCHARTS ****
                apex_charts_series_data_list = []
                # Converte o índice (datas YYYYMMDD) para objetos datetime para obter timestamps
                # ou para categorias no formato DD/MM/AAAA
                date_index_dt = pd.to_datetime(df.index, format="%Y%m%d")

                for api_param_name in selected_parameters_api:
                    friendly_name = rename_map.get(api_param_name)
                    if friendly_name and friendly_name in df.columns:
                        series_points = []
                        for idx, value in enumerate(df[friendly_name]):
                            if pd.notna(value) and (value != -999 and value != -999.0):
                                # Para ApexCharts, o eixo X pode ser uma categoria (DD/MM/AAAA) ou timestamp
                                # Usaremos a data formatada DD/MM/AAAA como categoria no eixo X
                                series_points.append({
                                    "x": date_index_dt[idx].strftime("%d/%m/%Y"), 
                                    "y": float(value)
                                })
                            else:
                                # ApexCharts lida com 'null' para dados em falta
                                series_points.append({
                                    "x": date_index_dt[idx].strftime("%d/%m/%Y"),
                                    "y": None 
                                })
                        
                        apex_charts_series_data_list.append({
                            "name": friendly_name,
                            "data": series_points
                        })
                
                # Passa a LISTA Python para o template para o loop de criação dos divs
                context["apex_charts_data_for_template_loop"] = apex_charts_series_data_list
                # Passa a STRING JSON para o JavaScript usar para os dados dos gráficos
                context["apex_chart_data_json"] = json.dumps(apex_charts_series_data_list)
                print("DEBUG: apex_chart_data_json:", context["apex_chart_data_json"])

                # Prepara dados para a tabela
                table_columns_ordered = ["Data_Para_Tabela"] + [
                    rename_map.get(p, p) for p in selected_parameters_api if rename_map.get(p,p) in df.columns and rename_map.get(p,p) != "Data_Para_Tabela"
                ]
                unique_table_display_columns = []
                for col in table_columns_ordered:
                    if col not in unique_table_display_columns: unique_table_display_columns.append(col)
                
                df_for_table = df[unique_table_display_columns].copy()
                df_for_table.rename(columns={"Data_Para_Tabela": "Data"}, inplace=True)

                context["table_headers"] = df_for_table.columns.tolist()
                context["table_data"] = df_for_table.to_dict("records")

            except (requests.exceptions.RequestException, KeyError) as e:
                print("ERRO DETALHADO (VIEWS.PY):", type(e).__name__, e)
                context["error"] = "Ocorreu um erro ao processar o seu pedido. Verifique os dados e tente novamente."
    
    return render(request, "core/index.html", context)
