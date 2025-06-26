from django.urls import path
from .views import (
    NasaPowerDailyAPIView, 
    NasaPowerHourlyAPIView, 
    OpenWeatherRealTimeAPIView
)

app_name = "api"

urlpatterns = [
    path("nasa-power/daily/", NasaPowerDailyAPIView.as_view(), name="nasa_power_daily"),
    path("nasa-power/hourly/", NasaPowerHourlyAPIView.as_view(), name="nasa_power_hourly"),
    path("open-weather/real-time/", OpenWeatherRealTimeAPIView.as_view(), name="open_weather_real_time"),
]