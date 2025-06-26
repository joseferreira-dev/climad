from rest_framework import serializers

class NasaPowerSerializer(serializers.Serializer):
    """
    Serializador para validar os parâmetros das requisições para a API da NASA POWER.
    """
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    start_date = serializers.DateField(input_formats=["%Y-%m-%d"])
    end_date = serializers.DateField(input_formats=["%Y-%m-%d"])
    parameters = serializers.CharField()

class OpenWeatherSerializer(serializers.Serializer):
    """
    Serializador para validar os parâmetros das requisições para a API da OpenWeatherMap.
    """
    lat = serializers.FloatField()
    lon = serializers.FloatField()