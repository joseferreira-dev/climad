from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("core.urls", namespace="core")),
    # Adicionando o caminho para a nossa API
    path("api/", include("api.urls", namespace="api")),
]