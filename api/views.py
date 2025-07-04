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
        if serializer.is_valid():
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
                response = requests.get(api_url, params=params)
                response.raise_for_status()
                return Response(response.json(), status=status.HTTP_200_OK)
            except requests.exceptions.RequestException as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NasaPowerHourlyAPIView(APIView):
    """
    API para buscar dados horários da NASA POWER.
    """
    def get(self, request, *args, **kwargs):
        serializer = NasaPowerSerializer(data=request.query_params)
        if serializer.is_valid():
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
                response = requests.get(api_url, params=params)
                response.raise_for_status()
                return Response(response.json(), status=status.HTTP_200_OK)
            except requests.exceptions.RequestException as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OpenWeatherRealTimeAPIView(APIView):
    """
    API para buscar dados em tempo real do OpenWeatherMap.
    """
    def get(self, request, *args, **kwargs):
        serializer = OpenWeatherSerializer(data=request.query_params)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            
            api_key = config("OPENWEATHER_API_KEY", default="")
            if not api_key:
                return Response({"error": "A chave da API do OpenWeather não foi configurada."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            api_url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": validated_data["lat"],
                "lon": validated_data["lon"],
                "appid": api_key,
                "units": "metric",
                "lang": "pt_br",
            }

            try:
                response = requests.get(api_url, params=params)
                response.raise_for_status()
                return Response(response.json(), status=status.HTTP_200_OK)
            except requests.exceptions.RequestException as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)