from django.urls import path
from . import views

urlpatterns = [
    # A rota raiz para a view de tempo real
    path('', views.real_time_view, name='real_time_data'), 
    
    # Rotas para os dados históricos
    path('historico/diario/', views.daily_data_view, name='daily_data'), 
    path('historico/horario/', views.hourly_data_view, name='hourly_data'),
]