import cv2
import numpy as np
import imageio
import os

def main():
    # Crear carpeta de salida si no existe
    os.makedirs('gifs', exist_ok=True)

    # 1. Carga y visualización
    # Usar ruta absoluta basada en la ubicación del script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, 'data', 'jaguar.jpg')
    img_bgr = cv2.imread(image_path)

    if img_bgr is None:
        print(f"Error: No se pudo cargar la imagen en {image_path}")
        return

    # Convertir de BGR a RGB
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    print("Imagen cargada correctamente.")

    # 2. Filtros Básicos
    # Filtro 1: Suavizado (Gaussian Blur)
    img_blur = cv2.GaussianBlur(img_rgb, (15, 15), 0)

    # Filtro 2: Realce de Bordes (Sharpening)
    kernel_sharpening = np.array([[-1, -1, -1],
                                  [-1,  9, -1],
                                  [-1, -1, -1]])
    img_sharpen = cv2.filter2D(img_rgb, -1, kernel_sharpening)

    # 4. Operaciones Morfológicas
    # Convertir a escala de grises y binarizar
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    _, img_binary = cv2.threshold(img_gray, 127, 255, cv2.THRESH_BINARY_INV)

    # Definir kernel
    kernel = np.ones((5,5), np.uint8)

    # Operación 1: Dilatación
    img_dilation = cv2.dilate(img_binary, kernel, iterations=1)

    # Operación 2: Erosión
    img_erosion = cv2.erode(img_binary, kernel, iterations=1)

    # 5. Animación (GIF)
    frames = []

    def add_label(img, text):
        img_copy = img.copy()
        if len(img_copy.shape) == 2:
            img_copy = cv2.cvtColor(img_copy, cv2.COLOR_GRAY2RGB)
        
        # Ensure contiguous array for cv2.putText
        img_copy = np.ascontiguousarray(img_copy)
        
        cv2.putText(img_copy, text, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 0, 0), 3, cv2.LINE_AA)
        return img_copy

    print("Generando frames para el GIF...")
    frames.append(add_label(img_rgb, "Original"))
    frames.append(add_label(img_blur, "Suavizado"))
    frames.append(add_label(img_sharpen, "Bordes"))
    frames.append(add_label(cv2.cvtColor(img_binary, cv2.COLOR_GRAY2RGB), "Binarizada"))
    frames.append(add_label(cv2.cvtColor(img_dilation, cv2.COLOR_GRAY2RGB), "Dilatacion"))
    frames.append(add_label(cv2.cvtColor(img_erosion, cv2.COLOR_GRAY2RGB), "Erosion"))

    # Guardar GIF
    gif_path = os.path.join(script_dir, 'gifs', 'procesamiento_jaguar.gif')
    imageio.mimsave(gif_path, frames, fps=1, loop=0)
    print(f"GIF guardado en: {gif_path}")

if __name__ == "__main__":
    main()