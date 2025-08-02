from django.shortcuts import render
# gestion/views.py

from django.shortcuts import render, redirect
from .utils_crypto import encrypt_file
from supabase import create_client, Client
import os

SUPABASE_URL = "https://amscyeamrvryknmnxemq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtc2N5ZWFtcnZyeWtubW54ZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTg0MDQsImV4cCI6MjA2OTIzNDQwNH0.o9qedspuliHvuLLVanKQmjKGSLA8g3jwQSaUH4tn3Bg"

# ¡Guarda esta clave en variables de entorno o settings seguro!
AES_KEY = b'8kL7mN4pQ2rStUvWxYz0123456789abc'  # 32 bytes

def subir_evidencia(request):
    if request.method == 'POST' and request.FILES.get('archivo'):
        archivo = request.FILES['archivo']
        # Guardar temporalmente el archivo original
        temp_input = 'temp_input'
        temp_enc = 'temp_output.enc'
        with open(temp_input, 'wb') as f:
            for chunk in archivo.chunks():
                f.write(chunk)
        # Cifrar
        encrypt_file(temp_input, temp_enc, AES_KEY)

        # Subir a Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        with open(temp_enc, 'rb') as f:
            data = f.read()
        # Puedes armar el nombre como quieras
        nombre_evidencia = archivo.name + '.enc'
        response = supabase.storage.from_('evidencias').upload(nombre_evidencia, data)
        print(response)

        # Limpiar temporales
        os.remove(temp_input)
        os.remove(temp_enc)

        return render(request, 'gestion/subida_exitosa.html', {"nombre": archivo.name})
    return render(request, 'gestion/form_subida.html')
