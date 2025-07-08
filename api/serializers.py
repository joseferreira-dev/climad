from rest_framework import serializers
from datetime import datetime

class NasaPowerSerializer(serializers.Serializer):
    """
    Serializador para validar os parâmetros para a API NASA POWER.
    """
    latitude = serializers.FloatField(
        error_messages={'invalid': 'Latitude inválida. Um número válido é necessário.'}
    )
    longitude = serializers.FloatField(
        error_messages={'invalid': 'Longitude inválida. Um número válido é necessário.'}
    )
    start_date = serializers.DateField(
        input_formats=['%Y-%m-%d'],
        error_messages={'invalid': 'Formato de data inválido. Use o formato AAAA-MM-DD.'}
    )
    end_date = serializers.DateField(
        input_formats=['%Y-%m-%d'],
        error_messages={'invalid': 'Formato de data inválido. Use o formato AAAA-MM-DD.'}
    )
    parameters = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        error_messages={
            'not_a_list': 'Uma lista de parâmetros era esperada.',
            'min_length': 'Por favor, forneça pelo menos um parâmetro.'
        }
    )

    def validate(self, data):
        """
        Validações personalizadas para os dados da NASA POWER.

        1. Verifica se a data de início não é posterior à data de fim.
        2. Verifica se o intervalo de dias não excede 366 dias.
        """
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'non_field_errors': ["A data de início não pode ser posterior à data de fim."]
                })

            delta = data['end_date'] - data['start_date']
            if delta.days > 366:
                raise serializers.ValidationError({
                    'non_field_errors': ["O intervalo entre as datas não pode exceder 366 dias."]
                })

        return data


class OpenWeatherSerializer(serializers.Serializer):
    """
    Serializador para validar os parâmetros para a API OpenWeather.
    """
    lat = serializers.FloatField(
        error_messages={'invalid': 'Latitude inválida. Um número válido é necessário.'}
    )
    lon = serializers.FloatField(
        error_messages={'invalid': 'Longitude inválida. Um número válido é necessário.'}
    )