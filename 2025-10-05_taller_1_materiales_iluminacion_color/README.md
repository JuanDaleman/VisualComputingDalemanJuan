# Taller 1: Materiales, Iluminación y Color en Mundo Virtual 3D

## Descripción del Mundo Virtual

Este proyecto presenta un mundo virtual interactivo que explora la interacción entre materiales PBR, iluminación dinámica y modelos de color. El concepto principal se centra en crear un entorno urbano-futurista donde diferentes tipos de objetos (orgánicos, arquitectónicos y utilitarios) coexisten bajo esquemas de iluminación que transforman la percepción visual de los materiales aplicados.

## Modelos GLB Utilizados

### Modelos Principales:
- **McLaren P1** (`ScaledMclaren.glb`) - Modelo utilitario/automotriz
  - Fuente: Modelo libre de automóvil deportivo
  - Modificaciones: Escalado para proporciones coherentes con la escena
  - Material aplicado: Metal con alta reflectividad y baja rugosidad

- **Edificio Urbano** (`ScaledCity.glb`) - Modelo arquitectónico
  - Fuente: Modelo de edificio moderno
  - Modificaciones: Escalado para servir como elemento de fondo arquitectónico
  - Material aplicado: Concreto con textura procedural y mapas PBR

- **Donald Duck** (`ScaleDonald.glb`) - Modelo orgánico/personaje
  - Fuente: Modelo de personaje animado
  - Modificaciones: Escalado para integración con otros elementos
  - Material aplicado: Materiales cartoon con colores vibrantes

### Modelos Adicionales:
- **Iron Man** (`iron_man_rig.glb`) - Modelo de personaje con rigging
- **Modelos base**: `ac_-_mclaren_p1_free.glb`, `city_building.glb`, `donald_duck.glb`

## Esquema de Iluminación

### Configuración de Tres Puntos:
- **Key Light (Luz Principal)**: Luz direccional cálida (temperatura ~3200K) posicionada en ángulo de 45° para crear sombras definidas
- **Fill Light (Luz de Relleno)**: Luz suave fría (temperatura ~5600K) para reducir contraste en sombras
- **Rim Light (Luz de Contorno)**: Luz posterior para separar objetos del fondo y crear profundidad

### Presets de Iluminación:
1. **Preset Día**: Iluminación neutra balanceada con luz ambiental suave
2. **Preset Atardecer**: Tonos cálidos dominantes con contraste acentuado

### HDRI Environment:
- **Qwantani Sunset**: `qwantani_sunset_puresky_4k.exr` - Para ambientación de atardecer
- **Zawiszy Czarnego**: `zawiszy_czarnego_4k.hdr` - Para iluminación diurna natural

## Materiales y Texturas PBR

### Configuración de Materiales:
- **Metal (McLaren)**: 
  - Roughness: 0.1-0.3
  - Metalness: 0.9-1.0
  - Normal Map: Para detalles de superficie metálica

- **Concreto (Edificio)**:
  - Roughness: 0.7-0.9
  - Metalness: 0.0
  - Displacement Map: Para relieve arquitectónico

- **Madera (Elementos decorativos)**:
  - Roughness: 0.4-0.6
  - Metalness: 0.0
  - Color Map: Vetas naturales de madera

### Texturas Aplicadas:
- **Metal048B_2K-JPG**: Textura metálica completa con todos los mapas PBR
- **PavingStones067_2K-JPG**: Textura de pavimento con ambient occlusion
- **WoodFloor064_2K-JPG**: Textura de madera con mapas especulares

## Configuración de Cámaras

### Cámara Perspectiva:
- **FOV**: 50°
- **Posición**: Optimizada para vista panorámica del mundo virtual
- **Propósito**: Proporciona profundidad natural y percepción realista del espacio 3D

### Cámara Ortográfica:
- **Configuración**: Proyección paralela sin distorsión perspectiva
- **Propósito**: Permite análisis técnico de proporciones y relaciones espaciales exactas
- **Alternancia**: Sistema implementado para cambio dinámico entre vistas

## Modelo de Color

### Paleta Principal (RGB):
- **Colores Primarios**: 
  - Azul Metálico: RGB(70, 130, 180) - Para elementos tecnológicos
  - Naranja Cálido: RGB(255, 140, 60) - Para luces de atardecer
  - Gris Neutro: RGB(128, 128, 128) - Para elementos arquitectónicos

### Espacios de Color Utilizados:
- **RGB**: Para definición básica de colores de materiales
- **HSV**: Para ajustes de saturación y brillo en iluminación dinámica
- **Consideraciones CIELAB**: Contraste perceptual optimizado para separación visual de materiales bajo diferentes condiciones de luz

### Justificación Cromática:
La paleta se basa en contrastes complementarios que mantienen legibilidad visual bajo diferentes esquemas de iluminación, utilizando principios de contraste perceptual para asegurar que cada material se distinga claramente en todas las condiciones lumínicas implementadas.

## Tecnologías Utilizadas

- **Three.js**: Motor de renderizado 3D
- **Editor Online Three.js**: Herramienta de desarrollo visual
- **Formatos soportados**: GLB/GLTF para modelos 3D, HDR/EXR para mapas de entorno
- **Texturas PBR**: Mapas completos de color, normal, roughness, metalness y displacement

## Estructura del Proyecto

```
2025-10-05_taller_1_materiales_iluminacion_color/
├── threejs/
│   └── project.json
├── glb_models/
│   ├── ScaledMclaren.glb
│   ├── ScaledCity.glb
│   ├── ScaleDonald.glb
│   └── [otros modelos]
├── textures/
│   ├── Metal048B_2K-JPG/
│   ├── PavingStones067_2K-JPG/
│   └── WoodFloor064_2K-JPG/
├── hdri/
│   ├── qwantani_sunset_puresky_4k.exr
│   └── zawiszy_czarnego_4k.hdr
├── renders/
├── README.md
└── ficha_tecnica.md
```

## Resultado Visual

El mundo virtual resultante demuestra efectivamente cómo la iluminación transforma la percepción de los materiales PBR, creando una experiencia visual coherente que responde dinámicamente a los cambios de luz y cámara. La alternancia entre vistas perspectiva y ortográfica permite apreciar tanto la naturalidad espacial como la precisión técnica del diseño implementado.