from django.urls import path
from . import views

urlpatterns = [
    path('simulate', views.simulate_attack, name='simulate_attack'),
]
