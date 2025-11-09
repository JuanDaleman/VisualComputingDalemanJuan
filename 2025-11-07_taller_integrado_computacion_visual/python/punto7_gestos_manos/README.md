# 7

## Setting up the environment for execution

1. Create a virtual environment:
   en bash
   python3 -m venv .venv
   pyenv virtualenv mediapipe-312
   pyenv activate mediapipe-312
   pip install -r requirements.txt
   
2. execute 
   python3 src/p7.py


## Manejo de herramientas de IA
 Para tener un programa funcional el prompt principal fue el texto principal del problema además de solicitar que se hiciera un juego de piedra, papel, tijera para que creara el registro de las formas directamente.
El uso de la IA dentro de este ejercicio no funcionó directamente al existir librerías que no funcionaban en la última versión de python, por lo que se utilizó un virtual environment para la ejecución de este programa tl como lo describe el setup para su ejecución.

## Componentes principales

### 1. Captura de video (OpenCV)
- Se abre la cámara con `cv2.VideoCapture()`.
- Cada cuadro del video se procesa y se muestra en pantalla.

### 2. Detección de mano (MediaPipe Hands)
- MediaPipe localiza la mano y genera **21 puntos de referencia (landmarks)** de la mano.
- También indica si la mano es **izquierda o derecha**.

### 3. Conteo de dedos y reconocimiento de gesto
- Se revisa si cada dedo está extendido o no mediante posiciones de landmarks.
- El pulgar se evalúa distinto dependiendo de si es mano izquierda o derecha.
- Según qué dedos están arriba:
  - **0 dedos → Piedra**
  - **5 dedos → Papel**
  - **Índice y medio arriba → Tijera**

### 4. Lógica del juego
- Cuando el usuario mantiene un gesto estable varios cuadros seguidos, el gesto queda “bloqueado”.
- La computadora elige aleatoriamente entre piedra / papel / tijera.
- Se compara para determinar si el usuario gana, pierde o empata.

### 5. Visualización gráfica
- Se dibujan los puntos de la mano y conexiones en la cámara.
- Se muestran textos indicando:
  - Estado del juego (`detectando`, `resultado`, `idle`)
  - Gesto detectado
  - Resultado final

---

## ⌨️ Controles
| Tecla | Acción |
|-------|--------|
| `r`   | Reinicia la ronda |
| `q`   | Salir del programa |

