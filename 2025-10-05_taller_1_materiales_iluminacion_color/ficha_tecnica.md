# Ficha Técnica - Taller 1: Materiales, Iluminación y Color

## Información General

**Proyecto:** Mundo Virtual con Materiales PBR e Iluminación Dinámica  
**Fecha:** 05 de Octubre, 2025  
**Herramienta Principal:** Editor Online Three.js  
**Motor de Renderizado:** Three.js WebGL  

---

## Assets Utilizados

### Modelos 3D (GLB)
| Modelo | Archivo | Tipo | Escala Aplicada | Propósito |
|--------|---------|------|-----------------|-----------|
| McLaren P1 | `ScaledMclaren.glb` | Utilitario/Automotriz | Ajustada | Objeto principal metálico |
| Edificio Urbano | `ScaledCity.glb` | Arquitectónico | Ajustada | Elemento de fondo |
| Donald Duck | `ScaleDonald.glb` | Orgánico/Personaje | Ajustada | Contraste orgánico |
| Iron Man | `iron_man_rig.glb` | Personaje Rigged | Original | Elemento adicional |

### Texturas PBR Implementadas
| Material | Carpeta | Mapas Incluidos | Aplicación |
|----------|---------|-----------------|------------|
| Metal | `Metal048B_2K-JPG/` | Color, Normal, Roughness, Metalness, Displacement | McLaren P1 |
| Pavimento | `PavingStones067_2K-JPG/` | Color, Normal, Roughness, AO, Displacement | Superficie urbana |
| Madera | `WoodFloor064_2K-JPG/` | Color, Normal, Roughness, Displacement, Specular | Elementos decorativos |

### Mapas HDRI de Entorno
| Archivo | Formato | Resolución | Uso |
|---------|---------|------------|-----|
| `qwantani_sunset_puresky_4k.exr` | EXR | 4K | Preset Atardecer |
| `zawiszy_czarnego_4k.hdr` | HDR | 4K | Preset Día |

---

## Configuración Técnica de Iluminación

### Sistema de Tres Puntos
| Tipo de Luz | Posición | Color/Temperatura | Intensidad | Función |
|-------------|----------|-------------------|------------|----------|
| Key Light | 45° frontal-lateral | Cálido (3200K) | Alta | Iluminación principal |
| Fill Light | Frontal opuesto | Frío (5600K) | Media | Relleno de sombras |
| Rim Light | Posterior elevado | Neutro | Baja | Separación de fondo |
| Ambient | Global | Variable según preset | Baja | Iluminación base |

### Presets de Iluminación
| Preset | Condición | Color Dominante | Contraste | HDRI Asociado |
|--------|-----------|-----------------|-----------|---------------|
| Día | Luz natural | Neutro-frío | Medio | zawiszy_czarnego_4k.hdr |
| Atardecer | Luz cálida | Naranja-rojizo | Alto | qwantani_sunset_puresky_4k.exr |

---

## Parámetros de Materiales PBR

### Material Metálico (McLaren)
```
Base Color: RGB(70, 130, 180)
Metalness: 0.95
Roughness: 0.15
Normal Intensity: 1.0
Reflectance: 0.04
```

### Material Arquitectónico (Edificio)
```
Base Color: RGB(180, 180, 175)
Metalness: 0.0
Roughness: 0.8
Normal Intensity: 0.8
Displacement Scale: 0.02
```

### Material Orgánico (Personaje)
```
Base Color: Múltiples (según UV mapping)
Metalness: 0.0
Roughness: 0.6
Subsurface Scattering: Simulado
```

---

## Configuración de Cámaras

### Cámara Perspectiva
```
Field of View: 50°
Aspect Ratio: 16:9 (ajustable)
Near Plane: 0.1
Far Plane: 10000
Position: [-4.26, 0.62, -1.01]
Target: [0, 0, 0]
```

### Cámara Ortográfica
```
Left/Right: ±10
Top/Bottom: ±10
Near Plane: 0.1
Far Plane: 10000
Zoom: 1.0
Position: [0, 10, 0] (vista cenital)
```

---

## Modelo de Color Implementado

### Paleta RGB Principal
| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| Azul Metálico | #4682B4 | (70, 130, 180) | Elementos tecnológicos |
| Naranja Cálido | #FF8C3C | (255, 140, 60) | Iluminación atardecer |
| Gris Arquitectónico | #B4B4AF | (180, 180, 175) | Estructuras |
| Verde Acento | #5CB85C | (92, 184, 92) | Elementos orgánicos |

### Espacios de Color Utilizados
- **RGB**: Definición base de colores
- **HSV**: Ajuste dinámico de saturación según iluminación
- **Consideraciones CIELAB**: Optimización de contraste perceptual

---

## Configuración del Proyecto Three.js

### Configuración General
```json
"project": {
  "shadows": true,
  "shadowType": 1,
  "toneMapping": 0,
  "toneMappingExposure": 1
}
```

### Configuración de Escena
```json
"scene": {
  "background": 11184810,
  "backgroundRotation": [0, 0, 0, "XYZ"],
  "environmentRotation": [0, 0, 0, "XYZ"]
}
```

---

## Especificaciones Técnicas de Renderizado

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Renderer | WebGL | Motor de renderizado |
| Antialiasing | Activado | Suavizado de bordes |
| Sombras | PCF | Percentage Closer Filtering |
| Tone Mapping | Linear | Mapeo tonal estándar |
| Gamma Correction | 2.2 | Corrección gamma estándar |
| Pixel Ratio | Device-dependent | Adaptación automática |

---

## Optimizaciones Aplicadas

### Modelos 3D
- Simplificación de geometría manteniendo calidad visual
- Escalado uniforme para coherencia de escena
- Optimización de UV mapping para texturas

### Texturas
- Resolución 2K para balance calidad/rendimiento
- Compresión optimizada para web
- Mipmapping automático para diferentes distancias

### Iluminación
- Límite de luces simultáneas: 8
- Sombras selectivas en objetos principales
- Culling automático de luces fuera de rango

---

## Métricas de Rendimiento

| Métrica | Valor Objetivo | Valor Logrado |
|---------|----------------|---------------|
| FPS mínimo | 30 | Variable según dispositivo |
| Draw calls | <100 | Optimizado |
| Vértices totales | <500K | Dentro del rango |
| Memoria texturas | <200MB | Optimizado |

---

**Nota:** Esta ficha técnica documenta los elementos implementados exitosamente en el mundo virtual, enfocándose en la integración de materiales PBR, esquemas de iluminación dinámica y configuración de cámaras múltiples dentro del entorno Three.js.