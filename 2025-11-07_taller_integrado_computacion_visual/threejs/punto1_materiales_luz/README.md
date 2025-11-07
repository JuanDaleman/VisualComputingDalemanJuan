# Taller 3 - Puntos 1 y 2: Materiales, Luz, Color y Geometría Procedural

## 📋 Descripción

Este proyecto implementa los Puntos 1 y 2 del Taller Integrado de Computación Visual:

### Punto 1: Materiales, Luz y Color (PBR y Modelos Cromáticos)
- ✅ **Texturas PBR completas**: albedo, roughness, metalness, normal map
- ✅ **Iluminación múltiple**: key light, fill light, rim light, HDRI
- ✅ **Cámaras**: alternancia perspectiva/ortográfica
- ✅ **Paleta cromática**: análisis RGB/HSV con justificación de contraste en CIELAB
- ✅ **Animaciones**: variaciones de luz y material

### Punto 2: Modelado Procedural desde Código
- ✅ **Geometría algorítmica**: rejillas, espirales, fractales
- ✅ **Bucles y recursión**: patrones espaciales matemáticos
- ✅ **Modificación dinámica**: transformaciones de vértices en tiempo real
- ✅ **Comparativa**: modelado código vs manual

## 🚀 Setup

### Prerequisites

- Node.js v16+ and npm
- Assets copied to `public/` directory (models, textures, HDRI)

### Installation

```bash
# Navigate to project directory
cd threejs/punto1_materiales_luz

# Install dependencies
npm install

# Copy assets (if not already done)
# Assets should be copied from parent directory to:
# - public/models/
# - public/textures/
# - public/hdri/

# Run development server
npm run dev
```

The project will open automatically at `http://localhost:3001`

## 📁 Project Structure

```
punto1_materiales_luz/
├── src/
│   ├── main.js                    # Main application
│   ├── ColorAnalyzer.js           # CIELAB color analysis (Point 1)
│   └── managers/
│       ├── CameraManager.js       # Camera controls
│       ├── LightingManager.js     # Lighting and HDRI
│       ├── MaterialManager.js     # PBR materials
│       ├── AnimationManager.js    # Animations
│       ├── SceneManager.js        # Scene management
│       ├── UIManager.js           # User interface
│       └── ProceduralGeometryManager.js  # Procedural modeling (Point 2)
├── public/
│   ├── models/                    # GLB models (not in repo)
│   ├── textures/                  # PBR textures (not in repo)
│   └── hdri/                      # HDRI environments (not in repo)
├── index.html
├── package.json
└── vite.config.js
```

## 🎮 Controles

### Teclado

- **C**: Alternar entre cámara perspectiva y ortográfica
- **L**: Cambiar presets de iluminación (Día/Atardecer/Noche)
- **M**: Ciclo de materiales PBR
- **A**: Iniciar animaciones
- **R**: Reset de escena
- **P**: Mostrar análisis de color en consola
- **G**: Generar Wave Grid (rejilla ondulada)
- **S**: Generar Helix Spiral (espiral 3D)
- **F**: Generar Sierpinski Fractal (pirámide recursiva)
- **K**: Generar Torus Knot (nudo toroidal)

### Mouse

- **Click + Arrastrar**: Rotar cámara
- **Scroll**: Zoom
- **Click Derecho + Arrastrar**: Panorámica

### Interfaz UI

- **🎥 Cámaras**: Botones para alternar vistas
- **💡 Iluminación**: Presets de día, atardecer y noche
- **🎨 Materiales PBR**: Cambio de materiales
- **🔷 Geometría Procedural**: 
  - 🌊 Wave Grid - Rejilla ondulada
  - 🌀 Helix Spiral - Espiral 3D
  - 🔺 Sierpinski - Fractal recursivo
  - 🎗️ Torus Knot - Nudo toroidal
  - ▶️ Animar - Modificación dinámica de vértices
  - 🗑️ Limpiar - Remover geometría procedural
- **🎬 Animaciones**: Controles de animación
- **🔬 Análisis Cromático**: Ver paleta y análisis CIELAB
- **📊 Debug**: Wireframe, helpers y reset

## 🎨 Análisis Cromático

El proyecto incluye un **ColorAnalyzer** completo que:

1. **Convierte colores** entre espacios RGB, HSV, HSL y CIELAB
2. **Calcula contraste perceptual** usando Delta E (CIE76)
3. **Justifica la paleta** según estándares de accesibilidad WCAG
4. **Genera documentación** en Markdown automáticamente

### Ver el análisis en consola:

```javascript
// En la consola del navegador (F12)
app.colorAnalyzer.printAnalysis();
```

### Exportar análisis:

```javascript
const analysis = app.colorAnalyzer.exportAnalysis();
console.log(JSON.stringify(analysis, null, 2));
```

### Generar reporte Markdown:

```javascript
const markdown = app.colorAnalyzer.generateMarkdownReport();
console.log(markdown);
// Copiar y pegar en un archivo .md
```

## 🔬 Características Técnicas

### Texturas PBR

El proyecto carga automáticamente 3 conjuntos completos de texturas PBR:

1. **Metal048B_2K-JPG**
   - Color (Albedo)
   - Normal Map (GL)
   - Roughness
   - Metalness
   - Displacement

2. **PavingStones067_2K-JPG**
   - Color
   - Normal Map
   - Roughness
   - Ambient Occlusion
   - Displacement

3. **WoodFloor064_2K-JPG**
   - Color
   - Normal Map
   - Roughness
   - Displacement
   - Specular

### Iluminación (Esquema de 3 Puntos)

**Preset Día:**
- Luz ambiental neutral (0x404040, intensidad 0.3)
- Key light blanca (10, 15, 5), intensidad 1.5
- Fill light azul cielo (-10, 10, -5), intensidad 0.8
- Rim light blanca (0, 5, -10), intensidad 0.5

**Preset Atardecer:**
- Luz ambiental cálida (0x4a3728, intensidad 0.4)
- Key light naranja (15, 8, 10), intensidad 2.0
- Fill light azul (- 8, 12, -8), intensidad 0.6
- Rim light naranja (-5, 3, -15), intensidad 0.8

**Preset Noche:**
- Luz ambiental oscura (0x1a1a2e, intensidad 0.2)
- Key light azul (8, 20, 8), intensidad 1.0
- Fill light violeta (-12, 8, -12), intensidad 0.4
- Rim light púrpura (0, 10, -20), intensidad 0.6

### Modelos HDRI

- `qwantani_sunset_puresky_4k.exr` - Atardecer despejado
- `zawiszy_czarnego_4k.hdr` - Día nublado

## 📊 Paleta de Colores

| Color | RGB | HEX | HSV | Propósito |
|-------|-----|-----|-----|-----------|
| **metalBlue** | rgb(70, 130, 180) | #4682B4 | H:207° S:61% V:71% | Elementos metálicos y tecnológicos |
| **warmOrange** | rgb(255, 140, 60) | #FF8C3C | H:25° S:76% V:100% | Luces de atardecer |
| **neutralGray** | rgb(128, 128, 128) | #808080 | H:0° S:0% V:50% | Elementos arquitectónicos |
| **woodBrown** | rgb(139, 69, 19) | #8B4513 | H:25° S:86% V:55% | Materiales de madera |
| **coolNightBlue** | rgb(30, 50, 100) | #1E3264 | H:223° S:70% V:39% | Iluminación nocturna |

## 📈 Análisis CIELAB

El sistema calcula automáticamente:

- **Delta E (ΔE)** entre pares de colores
- **Descripción perceptual** (Imperceptible → Totalmente diferente)
- **Nivel WCAG** para contraste de texto (AAA, AA, Fail)
- **Estadísticas** de luminosidad y saturación

### Ejemplo de contraste:

```
metalBlue ↔ warmOrange
ΔE = 67.34 (Totalmente diferente)
WCAG: AA (4.52:1)
```

## 🛠️ Tecnologías Utilizadas

- **Three.js** v0.157.0 - Motor de renderizado 3D
- **Vite** v4.4.5 - Bundler y servidor de desarrollo
- **Tween.js** v21.0.0 - Sistema de animaciones suaves
- **chroma-js** v2.4.2 - Conversión y análisis de color
- **dat.GUI** v0.7.9 - Interfaz de debug (opcional)

## 📝 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo (puerto 3001)
npm run build     # Compilar para producción
npm run preview   # Vista previa de la build
```

## 🐛 Solución de Problemas

### Los modelos no se cargan

1. Verificar que los symlinks se crearon correctamente
2. Comprobar la ruta en `public/models`, `public/textures`, `public/hdri`
3. Revisar la consola del navegador para errores de carga

### Las texturas no aparecen

- Asegúrate de que las texturas estén en `public/textures/[nombre]/`
- Verifica que los nombres de archivo coincidan exactamente
- El sistema usa materiales fallback automáticamente si falla la carga

### Error de puerto en uso

```bash
# Cambiar el puerto en vite.config.js
server: {
    port: 3002,  // Cambiar a otro puerto
    open: true
}
```

## 📸 Evidencias Requeridas

Para cumplir con los requisitos del taller, debes generar:

- ✅ **6 capturas** de escenas con diferentes materiales y luces
- ✅ **6 GIFs** mostrando:
  - Cambio de cámara (perspectiva ↔ ortográfica)
  - Transición entre presets de luz
  - Animación de materiales
  - Variación de propiedades PBR (roughness, metalness)
  - Recorrido de cámara
  - Análisis de color en tiempo real
- ✅ **1 video** (30-60s) de la experiencia completa

## 📚 Documentación Adicional

- `/docs/color_analysis.md` - Análisis cromático completo CIELAB
- `/docs/procedural_modeling.md` - Comparativa modelado manual vs procedural

## 🔷 Geometría Procedural (Punto 2)

El sistema de modelado procedural implementa **4 algoritmos matemáticos**:

### 1. Wave Grid (Rejilla Ondulada)
- **Técnica**: Bucles anidados + funciones trigonométricas
- **Parámetros**: width, height, segments, amplitude, frequency
- **Característica**: Modificación dinámica de vértices en tiempo real
- **Uso**: Superficies de agua, terrenos ondulados

### 2. Helix Spiral (Espiral 3D)
- **Técnica**: Bucle simple + ecuaciones paramétricas
- **Parámetros**: radius, height, turns, tubeRadius
- **Característica**: Movimiento circular + progresión vertical
- **Uso**: ADN, resortes, escaleras caracol

### 3. Sierpinski Pyramid (Fractal Recursivo)
- **Técnica**: Recursión + división fractal
- **Parámetros**: size, recursion level (1-4)
- **Característica**: Auto-similitud a diferentes escalas
- **Uso**: Visualización de fractales, arte generativo
- **Complejidad**: 4^level tetraedros

### 4. Torus Knot (Nudo Toroidal)
- **Técnica**: Ecuaciones paramétricas complejas
- **Parámetros**: p, q (parámetros del nudo), radius, tube
- **Característica**: Topología compleja en 3D
- **Uso**: Teoría de nudos, joyería paramétrica

### Ver documentación completa:
```bash
cat docs/procedural_modeling.md
```

## 👨‍💻 Autor

Juan Daleman - Visual Computing Course 2025

## 📄 Licencia

MIT
