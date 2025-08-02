from django.shortcuts import render, redirect
from .utils_crypto import encrypt_file
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Leer las claves del archivo .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
AES_KEY = os.getenv("AES_KEY").encode()  # .encode() para convertir de str a bytes

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
