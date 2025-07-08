import requests
from decouple import config
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import NasaPowerSerializer, OpenWeatherSerializer

class NasaPowerDailyAPIView(APIView):
    """
    API para buscar dados diários da NASA POWER.
    """
    def get(self, request, *args, **kwargs):
        serializer = NasaPowerSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        
        api_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        params = {
            "latitude": validated_data["latitude"],
            "longitude": validated_data["longitude"],
            "start": validated_data["start_date"].strftime("%Y%m%d"),
            "end": validated_data["end_date"].strftime("%Y%m%d"),
            "parameters": validated_data["parameters"],
            "community": "ag",
            "format": "json",
        }
        
        try:
            response = requests.get(api_url, params=params, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)

        except requests.exceptions.HTTPError:
            return Response(
                {"error": "O serviço externo retornou um erro. Verifique os parâmetros ou a disponibilidade do serviço."},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except requests.exceptions.RequestException:
            return Response(
                {"error": "Não foi possível conectar ao serviço de dados. Verifique sua conexão e tente novamente."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception:
            return Response(
                {"error": "Ocorreu um erro interno inesperado no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NasaPowerHourlyAPIView(APIView):
    """
    API para buscar dados horários da NASA POWER.
    """
    def get(self, request, *args, **kwargs):
        serializer = NasaPowerSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        
        api_url = "https://power.larc.nasa.gov/api/temporal/hourly/point"
        params = {
            "latitude": validated_data["latitude"],
            "longitude": validated_data["longitude"],
            "start": validated_data["start_date"].strftime("%Y%m%d"),
            "end": validated_data["end_date"].strftime("%Y%m%d"),
            "parameters": validated_data["parameters"],
            "community": "ag",
            "format": "json",
        }

        try:
            response = requests.get(api_url, params=params, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)

        except requests.exceptions.HTTPError:
            return Response(
                {"error": "O serviço externo retornou um erro. Verifique os parâmetros ou a disponibilidade do serviço."},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except requests.exceptions.RequestException:
            return Response(
                {"error": "Não foi possível conectar ao serviço de dados. Verifique sua conexão e tente novamente."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception:
            return Response(
                {"error": "Ocorreu um erro interno inesperado no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OpenWeatherRealTimeAPIView(APIView):
    """
    API para buscar dados em tempo real do OpenWeatherMap.
    """
    def get(self, request, *args, **kwargs):
        serializer = OpenWeatherSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        
        api_key = config("OPENWEATHER_API_KEY", default="")
        if not api_key:
            return Response(
                {"error": "Ocorreu um erro de configuração no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        api_url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": validated_data["lat"],
            "lon": validated_data["lon"],
            "appid": api_key,
            "units": "metric",
            "lang": "pt_br",
        }

        try:
            response = requests.get(api_url, params=params, timeout=15)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)

        except requests.exceptions.HTTPError:
            return Response(
                {"error": "O serviço externo retornou um erro. Verifique os parâmetros ou a disponibilidade do serviço."},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except requests.exceptions.RequestException:
            return Response(
                {"error": "Não foi possível conectar ao serviço de dados. Verifique sua conexão e tente novamente."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception:
            return Response(
                {"error": "Ocorreu um erro interno inesperado no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )