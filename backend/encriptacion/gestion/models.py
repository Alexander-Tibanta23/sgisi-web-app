from django.db import models
from django.contrib.auth.models import AbstractUser

# Roles del sistema
ROLES = [
    ('ciso', 'CISO'),
    ('analista', 'Analista'),
    ('usuario', 'Usuario'),
]

class Usuario(AbstractUser):
    rol = models.CharField(max_length=20, choices=ROLES, default='usuario')

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

class Incidente(models.Model):
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    severidad = models.CharField(
        max_length=10,
        choices=[("Alta", "Alta"), ("Media", "Media"), ("Baja", "Baja")]
    )
    estado = models.CharField(max_length=20, default="Nuevo")
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="incidentes")
    clasificado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name="clasificados")

    def __str__(self):
        return f"{self.titulo} ({self.severidad})"

class Evidencia(models.Model):
    incidente = models.ForeignKey(Incidente, on_delete=models.CASCADE, related_name="evidencias")
    archivo = models.FileField(upload_to="evidencias/")
    tipo = models.CharField(max_length=50)
    subida_por = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    subida_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} para incidente {self.incidente.titulo}"

class LogUsuario(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    accion = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.accion} ({self.fecha.date()})"