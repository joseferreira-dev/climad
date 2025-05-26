import requests
import pandas as pd
from django.shortcuts import render
from django.conf import settings
from datetime import date, timedelta

def index(request):
    context = {}
    context["Maps_api_key"] = settings.MAPS_API_KEY

    if request.method == "GET":
        today = date.today()
        one_month_ago = today - timedelta(days=30)
        context["default_start_date"] = one_month_ago.strftime("%Y-%m-%d")
        context["default_end_date"] = today.strftime("%Y-%m-%d")
        context["form_selected_parameters"] = ["ALLSKY_SFC_SW_DWN", "T2M", "RH2M", "WS10M", "PRECTOT", "PS"]
        context["table_data"] = None # Garante que a tabela não aparece no GET inicial

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
                data = response.json()
                df = pd.DataFrame(data["properties"]["parameter"])

                if df.empty:
                    raise KeyError("O DataFrame retornado pela API está vazio (sem dados para o período/local).")

                rename_map = {
                    "ALLSKY_SFC_SW_DWN": "Radiação Solar (kWh/m²/dia)", "T2M": "Temperatura (°C)",
                    "RH2M": "Umidade (%)", "WS10M": "Vento (m/s)",
                    "PRECTOT": "Precipitação (mm/dia)", "PRECTOTCORR": "Precipitação (mm/dia)",
                    "PS": "Pressão (kPa)"
                }
                df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)
                
                # Cria a coluna 'Data' formatada para a tabela
                df["Data"] = pd.to_datetime(df.index, format="%Y%m%d").strftime("%d/%m/%Y")
                
                # Prepara dados para a tabela
                # Garante que "Data" é a primeira coluna
                # E inclui apenas as colunas selecionadas e renomeadas
                table_columns_ordered = ["Data"] + [
                    rename_map.get(p, p) for p in selected_parameters_api if rename_map.get(p,p) in df.columns and rename_map.get(p,p) != "Data"
                ]
                
                # Remove duplicados e garante a ordem
                unique_table_display_columns = []
                for col in table_columns_ordered:
                    if col not in unique_table_display_columns:
                        unique_table_display_columns.append(col)
                
                df_for_table = df[unique_table_display_columns].copy()

                context["table_headers"] = df_for_table.columns.tolist()
                context["table_data"] = df_for_table.to_dict("records")

            except (requests.exceptions.RequestException, KeyError) as e:
                print("ERRO DETALHADO (VIEWS.PY):", type(e).__name__, e)
                context["error"] = "Ocorreu um erro ao processar o seu pedido. Verifique os dados e tente novamente."
    
    return render(request, "core/index.html", context)