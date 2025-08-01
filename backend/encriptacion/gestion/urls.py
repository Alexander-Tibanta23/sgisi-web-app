from django.urls import path
from . import views

urlpatterns = [
    path('subir_evidencia/', views.subir_evidencia, name='subir_evidencia'),
    # Puedes agregar otras rutas aquí después
]
