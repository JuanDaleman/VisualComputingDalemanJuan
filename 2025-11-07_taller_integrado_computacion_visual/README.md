# Taller Integrado de Computación Visual

## 📚 Descripción General

Este repositorio contiene la implementación del **Taller Integrado de Computación Visual**, enfocado en diseñar y curar experiencias visuales interactivas que integren:

- Modelado 3D y materiales PBR
- Shaders personalizados y texturas dinámicas
- Detección multimodal (voz, gestos, EEG)
- Control de cámara y entorno

## 🎯 Puntos Implementados

### ✅ Punto 1: Materiales, Luz y Color (PBR y modelos cromáticos)

**Ubicación**: `threejs/punto1_materiales_luz/`

**Características implementadas**:
- ✅ Texturas PBR completas (albedo, roughness, metalness, normal map)
- ✅ Iluminación múltiple (key, fill, rim, HDRI)
- ✅ Cámaras con alternancia perspectiva/ortográfica
- ✅ Paleta cromática RGB/HSV con justificación CIELAB
- ✅ Animaciones que exponen variaciones de luz y material
- ✅ Análisis cromático científico con Delta E
- ✅ Sistema de conversión entre espacios de color
- ✅ Documentación completa de contraste perceptual

**Tecnologías**:
- Three.js v0.157.0
- Vite v4.4.5
- chroma-js v2.4.2 (análisis de color)
- Tween.js v21.0.0

**Ver documentación completa**: [threejs/punto1_materiales_luz/README.md](threejs/punto1_materiales_luz/README.md)

**Ver análisis cromático**: [docs/color_analysis.md](docs/color_analysis.md)

### 🚧 Punto 2-11: En desarrollo

Los puntos restantes del taller (modelado procedural, shaders, partículas, 360°, gestos, voz, EEG, espacios proyectivos) serán implementados en las carpetas correspondientes.

## 📁 Estructura del Repositorio

```
2025-11-07_taller_integrado_computacion_visual/
├── threejs/
│   ├── punto1_materiales_luz/      # ✅ Implementado
│   │   ├── src/
│   │   │   ├── main.js
│   │   │   ├── ColorAnalyzer.js    # Análisis CIELAB
│   │   │   └── managers/           # Gestores modulares
│   │   ├── public/                 # Symlinks a assets
│   │   ├── index.html
│   │   ├── package.json
│   │   └── README.md
│   ├── punto2_modelado_procedural/ # 🚧 Próximo
│   └── ...
├── python/                          # Notebooks y scripts Python
├── processing/                      # Sketches Processing
├── unity/                           # Proyectos Unity
├── renders/
│   ├── punto1/
│   │   ├── images/                 # Capturas de pantalla
│   │   └── videos/                 # Videos demostrativos
│   └── ...
├── media/                           # Assets multimedia
├── docs/
│   ├── color_analysis.md           # ✅ Análisis cromático CIELAB
│   └── ...
├── taller_3.md                     # Especificación del taller
└── README.md                       # Este archivo
```

## 🚀 Inicio Rápido - Punto 1

### Requisitos Previos

- Node.js v16 o superior
- npm o yarn
- Navegador moderno (Chrome, Firefox, Edge)

### Instalación

```bash
# 1. Clonar el repositorio (si no lo has hecho)
git clone https://github.com/JuanDaleman/VisualComputingDalemanJuan.git
cd VisualComputingDalemanJuan/2025-11-07_taller_integrado_computacion_visual

# 2. Ir al proyecto del Punto 1
cd threejs/punto1_materiales_luz

# 3. Crear symlinks a los assets del Taller 1
# En PowerShell (como Administrador):
cd public
cmd /c mklink /D "models" "..\..\..\..\2025-10-05_taller_1_materiales_iluminacion_color\glb_models"
cmd /c mklink /D "textures" "..\..\..\..\2025-10-05_taller_1_materiales_iluminacion_color\textures"
cmd /c mklink /D "hdri" "..\..\..\..\2025-10-05_taller_1_materiales_iluminacion_color\hdri"
cd ..

# Alternativa sin permisos de administrador (copiar assets):
# cp -r "../../../2025-10-05_taller_1_materiales_iluminacion_color/glb_models" "public/models"
# cp -r "../../../2025-10-05_taller_1_materiales_iluminacion_color/textures" "public/textures"
# cp -r "../../../2025-10-05_taller_1_materiales_iluminacion_color/hdri" "public/hdri"

# 4. Instalar dependencias
npm install

# 5. Ejecutar servidor de desarrollo
npm run dev
```

El proyecto se abrirá en `http://localhost:3001`

## 🎮 Controles (Punto 1)

### Teclado

| Tecla | Acción |
|-------|--------|
| **C** | Alternar cámara (Perspectiva ↔ Ortográfica) |
| **L** | Cambiar preset de iluminación (Día → Atardecer → Noche) |
| **M** | Ciclo de materiales PBR (Metal → Concreto → Madera → Vidrio) |
| **A** | Iniciar animaciones de recorrido |
| **R** | Resetear escena |
| **P** | Imprimir análisis cromático en consola |

### Mouse

- **Click + Arrastrar**: Rotar cámara
- **Scroll**: Zoom
- **Click Derecho + Arrastrar**: Panorámica

### Interfaz

- **🎥 Cámaras**: Botones para cambiar vistas
- **💡 Iluminación**: Presets visuales
- **🎨 Materiales**: Aplicar diferentes materiales PBR
- **🔬 Análisis Cromático**: Ver paleta RGB/HSV y análisis CIELAB
- **📊 Debug**: Wireframe, helpers, información de escena

## 🎨 Análisis Cromático (Punto 1)

El proyecto incluye un sistema completo de análisis de color que:

### Conversiones Automáticas

| Entrada | Salidas |
|---------|---------|
| RGB | → HEX, HSV, HSL, CIELAB |
| Cualquier color | → Valores perceptualmente uniformes |

### Métricas CIELAB

- **Delta E (ΔE)**: Diferencia perceptual entre colores (CIE76)
- **Contraste WCAG**: Niveles AA/AAA para accesibilidad
- **Armonías**: Complementarios, triádicos, análogos

### Uso en Consola

```javascript
// Imprimir análisis completo
app.colorAnalyzer.printAnalysis();

// Exportar datos JSON
const analysis = app.colorAnalyzer.exportAnalysis();
console.log(JSON.stringify(analysis, null, 2));

// Generar reporte Markdown
const markdown = app.colorAnalyzer.generateMarkdownReport();
console.log(markdown);

// Calcular contraste entre colores
const contrast = app.colorAnalyzer.calculateContrast('metalBlue', 'warmOrange');
console.log(`Delta E: ${contrast.deltaE}, ${contrast.description}`);

// Generar armonía de colores
const harmony = app.colorAnalyzer.generateHarmony('metalBlue', 'complementary');
console.log(harmony);
```

## 📊 Paleta de Colores (Punto 1)

| Color | RGB | HEX | ΔE vs Blanco | Propósito |
|-------|-----|-----|--------------|-----------|
| **metalBlue** | rgb(70, 130, 180) | #4682B4 | 52.95 | Elementos metálicos |
| **warmOrange** | rgb(255, 140, 60) | #FF8C3C | 37.48 | Luces de atardecer |
| **neutralGray** | rgb(128, 128, 128) | #808080 | 52.61 | Arquitectura |
| **woodBrown** | rgb(139, 69, 19) | #8B4513 | 70.55 | Materiales naturales |
| **coolNightBlue** | rgb(30, 50, 100) | #1E3264 | 83.71 | Iluminación nocturna |

**Contraste Destacado**:
- metalBlue ↔ warmOrange: **ΔE = 67.34** (Totalmente diferente, WCAG AA)
- coolNightBlue ↔ pureWhite: **ΔE = 83.71** (WCAG AAA 15.07:1)

Ver análisis completo en [docs/color_analysis.md](docs/color_analysis.md)

## 📸 Evidencias Visuales

### Punto 1: Materiales, Luz y Color

Ubicación: `renders/punto1/`

**Capturas requeridas** (6 mínimo):
- [ ] Material metálico bajo luz día
- [ ] Material concreto bajo luz atardecer
- [ ] Material madera bajo luz noche
- [ ] Vista perspectiva vs ortográfica
- [ ] Comparativa de materiales lado a lado
- [ ] Análisis CIELAB en UI

**GIFs requeridos** (6 mínimo):
- [ ] Transición entre presets de luz
- [ ] Cambio de cámara perspectiva ↔ ortográfica
- [ ] Ciclo de materiales PBR
- [ ] Animación de recorrido de cámara
- [ ] Variación de roughness en tiempo real
- [ ] Visualización de análisis cromático

**Video** (30-60s):
- [ ] Recorrido completo de la escena
- [ ] Demostración de controles
- [ ] Variaciones de luz y material
- [ ] Análisis cromático interactivo

## 🛠️ Tecnologías Utilizadas

### Frontend 3D
- **Three.js** v0.157.0 - Motor de renderizado WebGL
- **Vite** v4.4.5 - Build tool y dev server
- **Tween.js** v21.0.0 - Animaciones fluidas

### Análisis de Color
- **chroma-js** v2.4.2 - Conversiones y análisis cromático
- **CIELAB Delta E** - Contraste perceptual científico

### Controles
- **OrbitControls** - Navegación de cámara
- **dat.GUI** - Interfaz de debug

### Assets
- **GLTF/GLB** - Modelos 3D
- **EXR/HDR** - Mapas de entorno HDRI
- **PBR Textures** - Mapas completos 2K (Color, Normal, Roughness, Metalness, Displacement, AO)

## 📝 Criterios de Evaluación

| Criterio | Descripción | Peso | Estado |
|----------|-------------|------|--------|
| Organización | Estructura de carpetas y README claros | 10% | ✅ |
| Modelado y geometría procedural | Generación y coherencia de formas | 10% | 🚧 |
| Materiales e iluminación PBR | Realismo, coherencia y respuesta a la luz | 15% | ✅ |
| Shaders y texturizado dinámico | Efectos visuales y complejidad técnica | 15% | 🚧 |
| Interacción multimodal | Integración funcional y creativa | 15% | 🚧 |
| Cámaras y proyección | Uso correcto de perspectiva/orto y movimiento | 10% | ✅ |
| Animaciones y partículas | Movimiento expresivo, sincronización visual | 10% | ✅ |
| Evidencias visuales | GIFs, videos y capturas claras | 10% | 🔄 |
| Código y documentación | Claridad, comentarios y commits en inglés | 5% | ✅ |
| **Total** | | **100%** | **40% ✅** |

## 📚 Documentación Adicional

- [Especificación del Taller](taller_3.md) - Requisitos completos
- [Análisis Cromático CIELAB](docs/color_analysis.md) - Estudio científico de colores
- [README Punto 1](threejs/punto1_materiales_luz/README.md) - Guía detallada del Punto 1

## 🐛 Solución de Problemas

### Los symlinks no funcionan

**Solución 1 (Recomendada)**: Ejecutar PowerShell como Administrador

```powershell
# Verificar si tienes permisos
whoami /priv | findstr SeCreateSymbolicLinkPrivilege
```

**Solución 2**: Copiar assets manualmente

```bash
cp -r "../../../2025-10-05_taller_1_materiales_iluminacion_color/glb_models" "public/models"
cp -r "../../../2025-10-05_taller_1_materiales_iluminacion_color/textures" "public/textures"
cp -r "../../../2025-10-05_taller_1_materiales_iluminacion_color/hdri" "public/hdri"
```

### Error: Module not found 'chroma-js'

```bash
# Reinstalar dependencias
cd threejs/punto1_materiales_luz
rm -rf node_modules package-lock.json
npm install
```

### Los modelos no se cargan

1. Verificar que `public/models/` existe y contiene archivos .glb
2. Revisar la consola del navegador (F12) para errores de carga
3. Comprobar que las rutas en `main.js` son correctas
4. El sistema usa escena fallback con esferas si falla la carga

## 👨‍💻 Autor

**Juan Daleman**  
Visual Computing Course 2025  
Universidad Nacional de Colombia

## 📄 Licencia

MIT License - Ver [LICENSE](../LICENSE) para detalles

## 🔗 Enlaces

- **Repositorio**: [VisualComputingDalemanJuan](https://github.com/JuanDaleman/VisualComputingDalemanJuan)
- **Taller Anterior**: [2025-10-05_taller_1_materiales_iluminacion_color](../2025-10-05_taller_1_materiales_iluminacion_color/)
- **Three.js Docs**: [threejs.org/docs](https://threejs.org/docs/)
- **chroma-js**: [gka.github.io/chroma.js](https://gka.github.io/chroma.js/)

---

**Última actualización**: Noviembre 6, 2025  
**Estado del proyecto**: Punto 1 completado ✅ | Puntos 2-11 en desarrollo 🚧
