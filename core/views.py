import requests
import pandas as pd
from django.shortcuts import render

def index(request):
    """
    Esta view busca dados da API da NASA POWER com base nas seleções
    do utilizador e exibe os resultados numa tabela interativa.
    """
    context = {}
    if request.method == "POST":
        latitude = request.POST.get("latitude")
        longitude = request.POST.get("longitude")
        start_date_raw = request.POST.get("start_date")
        end_date_raw = request.POST.get("end_date")
        # Coleta a lista de parâmetros selecionados
        selected_parameters = request.POST.getlist("parameters")

        if not selected_parameters:
            context["error"] = "Por favor, selecione pelo menos uma variável climática."
            return render(request, "core/index.html", context)

        if start_date_raw > end_date_raw:
            context["error"] = "A data de início não pode ser posterior à data de fim."
            return render(request, "core/index.html", context)

        if latitude and longitude and start_date_raw and end_date_raw:
            start_date_api = start_date_raw.replace("-", "")
            end_date_api = end_date_raw.replace("-", "")

            context.update({
                "latitude": latitude, "longitude": longitude,
                "start_date": start_date_raw, "end_date": end_date_raw
            })

            # Junta os parâmetros selecionados numa string separada por vírgulas
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

                # Dicionário com todos os nomes possíveis para renomear
                rename_map = {
                    "ALLSKY_SFC_SW_DWN": "Radiação Solar (kWh/m²/dia)",
                    "T2M": "Temperatura (°C)",
                    "RH2M": "Umidade (%)",
                    "WS10M": "Vento (m/s)",
                    "PRECTOT": "Precipitação (mm/dia)",
                    "PRECTOTCORR": "Precipitação (mm/dia)", # Adicionado para segurança
                    "PS": "Pressão (kPa)"
                }
                df.rename(columns=rename_map, inplace=True)
                
                df["Data"] = pd.to_datetime(df.index, format="%Y%m%d").strftime("%Y-%m-%d")
                cols = ["Data"] + [col for col in df if col != "Data"]
                df = df[cols]
                
                context["table_headers"] = df.columns.tolist()
                context["table_data"] = df.to_dict("records")

            except requests.exceptions.RequestException as e:
                context["error"] = f"Erro ao acessar a API da NASA: {e}"
            except KeyError:
                 context["error"] = "Não foi possível encontrar dados para a seleção. Verifique os dados."

    return render(request, "core/index.html", context)