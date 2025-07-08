from django.urls import path
from .views import (
    NasaPowerDailyAPIView, 
    NasaPowerHourlyAPIView, 
    OpenWeatherRealTimeAPIView
)

app_name = "api"

# urlpatterns = [
#     path("nasa-power/daily/", NasaPowerDailyAPIView.as_view(), name="nasa_power_daily"),
#     path("nasa-power/hourly/", NasaPowerHourlyAPIView.as_view(), name="nasa_power_hourly"),
#     path("open-weather/real-time/", OpenWeatherRealTimeAPIView.as_view(), name="open_weather_real_time"),
# ]

urlpatterns = [
    path('real-time/open-weather/', OpenWeatherRealTimeAPIView.as_view(), name='real_time_open_weather'),
    path('historical/daily/nasa-power/', NasaPowerDailyAPIView.as_view(), name='historical_daily_nasa_power'),
    path('historical/hourly/nasa-power/', NasaPowerHourlyAPIView.as_view(), name='historical_hourly_nasa_power'),
]