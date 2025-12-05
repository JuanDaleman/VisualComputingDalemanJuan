#!/bin/bash
# Script para ejecutar el reconocimiento de gestos con MediaPipe

echo "👋 Iniciando sistema de reconocimiento de gestos..."
echo ""
echo "Instalando MediaPipe si es necesario..."

../venv/bin/pip install mediapipe opencv-python

echo ""
echo "="*60
echo "🎥 RECONOCIMIENTO DE GESTOS CON MEDIAPIPE"
echo "="*60
echo ""
echo "Gestos reconocidos:"
echo "  ✌️  Peace sign (índice + medio) - Toggle detection"
echo "  ✊  Fist (puño cerrado) - Reset scene"
echo "  👆  Point (índice arriba) - Select object"
echo "  ✋  Open palm (mano abierta) - Stop"
echo "  👍  Thumbs up - Confirm"
echo ""
echo "Controles:"
echo "  • Presiona 'q' para salir"
echo "  • Muestra tu mano a la cámara"
echo ""
echo "="*60
echo ""

../venv/bin/python gesture_recognition.py
