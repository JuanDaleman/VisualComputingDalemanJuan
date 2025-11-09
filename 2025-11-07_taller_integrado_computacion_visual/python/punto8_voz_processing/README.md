# Estructura del proyecto (DOS PROGRAMAS: Python + Processing)

Este proyecto se compone de dos programas independientes que se comunican entre sí mediante OSC (Open Sound Control):

- **Programa 1: Python → Control por voz**
  - Reconoce comandos hablados.
  - Mapea comandos a acciones (color, forma, explosión, limpiar escena, etc.).
  - Envía mensajes OSC hacia Processing.
  - Recibe confirmaciones de Processing.

- **Programa 2: Processing → Visualización**
  - Recibe comandos OSC desde Python.
  - Cambia visuales (color, tamaño, forma, efectos).
  - Envía de vuelta mensajes OSC como confirmación.

---

## Comunicación entre programas (puertos)

| Dirección | Emisor → Receptor  | Puerto | Descripción |
|----------|------------------|--------|-------------|
| Python → Processing | Envío OSC | **8000** | Python manda acciones visuales |
| Processing → Python | Respuesta OSC | **8001** | Processing confirma que cambió algo |

> Ambos programas deben usar la misma IP de localhost.

---

## Diseño de mensajes OSC

Python envía (acciones visuales):

| Dirección OSC        | Parámetros | Ejemplo |
|---------------------|------------|---------|
| `/visual/color`     | r g b floats (0–1) | `/visual/color 1.0 0.0 0.0` |
| `/visual/shape`     | string     | `/visual/shape "circulo"` |
| `/visual/rotate`    | 1/0        | `/visual/rotate 1` |
| `/visual/scale`     | float      | `/visual/scale 1.8` |
| `/scene/clear`      | (sin args) | `/scene/clear` |
| `/effects/explosion`| (sin args) | `/effects/explosion` |

**Processing responde (confirmaciones):**

| Dirección OSC                    |
|----------------------------------|
| `/processing/color_changed`      |
| `/processing/scene_cleared`      |
| `/processing/explosion_triggered`|
| `/processing/scale_done`         |

---

## Tareas de cada programa

### Python (control por voz)
1. Inicializar el micrófono y el reconocimiento de voz.
2. Escuchar continuamente frases del usuario.
3. Interpretar el texto y decidir qué acción ejecutar.
4. Enviar mensajes OSC a Processing.
5. (Opcional) Reproducir TTS indicando lo que ocurrió.
6. Recibir confirmaciones desde Processing.

### Processing (visualización)
1. Inicializar `oscP5` y configurar puertos.
2. Recibir mensajes OSC y llamar funciones de cambio visual.
3. Actualizar la escena en `draw()`.
4. Enviar mensajes OSC de regreso a Python indicando que la acción fue realizada.

---

## Estructura de carpetas y archivos
project/
├─ processing/
│ └─punto8/
│   └─sketch/
│       └─ sketch.pde # Código Processing (visual)
└─ python/
  └─punto8/
    ├─ voice_osc.py # Control por voz + cliente/servidor OSC
    ├─ requirements.txt # Librerías necesarias (pip)
    └─ README.md
    

---

## Cómo ejecutar

1. **Abrir Processing**
   - Abrir `sketch.pde`
   - Ejecutar (botón PLAY en Processing)
   - Processing queda esperando mensajes OSC en el puerto **8000**

2. **Ejecutar Python**
   ```bash```
   cd <al folder donde está este README>
   python3 -m venv .venv
   pyenv virtualenv audiorecogn
   pyenv activate audiorecogn
   pip install -r requirements.txt
   python3 src/p8.py

