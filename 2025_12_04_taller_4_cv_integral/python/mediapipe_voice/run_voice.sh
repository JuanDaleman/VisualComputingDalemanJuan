#!/bin/bash
# Script para ejecutar el reconocimiento de voz

echo "🎤 Iniciando sistema de reconocimiento de voz..."
echo ""
echo "IMPORTANTE: Necesitas tener instalado:"
echo "  - SpeechRecognition"
echo "  - pyttsx3"
echo "  - pyaudio"
echo ""
echo "Instalando dependencias..."

../venv/bin/pip install SpeechRecognition pyttsx3 pyaudio

echo ""
echo "Iniciando reconocimiento de voz..."
echo "Comandos disponibles:"
echo "  • 'change color' - Cambia colores"
echo "  • 'rotate' - Activa/desactiva rotación"
echo "  • 'stop' - Detiene animaciones"
echo "  • 'reset' - Resetea la escena"
echo "  • 'quit' - Salir"
echo ""

../venv/bin/python voice_recognition.py
