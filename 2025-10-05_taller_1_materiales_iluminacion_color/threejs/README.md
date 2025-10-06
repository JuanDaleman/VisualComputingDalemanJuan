# Taller 1 - Three.js Local Development

## 🚀 Instrucciones de Instalación y Ejecución

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Estructura del Proyecto

```
threejs_local/
├── src/
│   ├── main.js              # Archivo principal
│   └── managers/
│       ├── CameraManager.js      # Gestión de cámaras
│       ├── LightingManager.js    # Iluminación y HDRI
│       ├── MaterialManager.js    # Materiales PBR
│       ├── AnimationManager.js   # Animaciones
│       ├── SceneManager.js       # Gestión de escena
│       └── UIManager.js          # Interfaz de usuario
├── public/               # Assets públicos
├── package.json         # Configuración del proyecto
├── vite.config.js       # Configuración de Vite
└── index.html          # HTML principal
```

## 🎮 Controles

### Teclado

- **C**: Alternar entre cámara perspectiva y ortográfica
- **L**: Cambiar presets de iluminación
- **A**: Iniciar animaciones de cámara
- **R**: Resetear escena

### Mouse

- **Click + Arrastrar**: Rotar cámara
- **Scroll**: Zoom
- **Click Derecho + Arrastrar**: Panorámica

### Interfaz UI

- **🎥 Cámaras**: Alternar entre perspectiva y ortográfica
- **💡 Iluminación**: Presets de día, atardecer y noche
- **🎬 Animaciones**: Controles de animación para cámara, objetos y luces
- **📊 Debug**: Wireframe, helpers y reset

## 🔧 Características Implementadas

### ✅ Sistema de Cámaras

- Cámara perspectiva configurable
- Cámara ortográfica para vistas técnicas
- Alternancia suave entre cámaras
- Controles orbital integrados

### ✅ Sistema de Iluminación

- Esquema de 3 puntos (Key, Fill, Rim)
- Luz ambiental configurable
- 3 presets: Día, Atardecer, Noche
- Soporte para mapas HDRI
- Sombras en tiempo real

### ✅ Materiales PBR

- Materiales estándar: Metal, Concreto, Madera, Vidrio
- Carga automática de texturas PBR
- Soporte para mapas completos (Color, Normal, Roughness, Metalness, Displacement, AO)
- Materiales procedurales (Checkerboard, Stripes, Noise)

### ✅ Sistema de Animaciones

- Animaciones de cámara con paths suaves
- Animaciones de objetos (rotación, flotación, escala)
- Animaciones de luces dinámicas
- Soporte para animaciones GLTF/GLB
- Control de reproducción/pausa/stop

### ✅ Gestión de Escena

- Carga automática de modelos GLB
- Sistema de helpers visuales
- Modo wireframe
- Información de rendimiento en tiempo real
- Exportación de configuración de escena

## 📦 Carga de Assets

### Modelos GLB

El sistema intenta cargar automáticamente:

1. `scene_complete.glb` (exportación completa del editor)
2. `taller_scene.glb` (archivo personalizado)
3. Modelos individuales como fallback

### Texturas PBR

- Carga automática desde `../textures/`
- Soporte para conjuntos completos PBR
- Fallback a materiales básicos si fallan las texturas

### Mapas HDRI

- Carga desde `../hdri/`
- Soporte para formatos EXR y HDR
- Aplicación automática según preset de iluminación

## 🎯 Próximos Pasos

1. **Subir GLB del Editor**: Exportar desde Three.js Editor y colocar en `/glb_models/`
2. **Probar Carga**: Verificar que todos los assets se carguen correctamente
3. **Configurar Animaciones**: Ajustar paths de cámara y animaciones de objetos
4. **Optimización**: Ajustar calidad y rendimiento según necesidades

## 🐛 Solución de Problemas

### Modelos no se cargan

- Verificar que el archivo GLB esté en la carpeta correcta
- Comprobar nombres de archivo en la consola del navegador
- Usar modelos individuales como fallback

### Texturas no aparecen

- Verificar paths de texturas en la consola
- Confirmar que los nombres de archivo coincidan
- Los materiales fallback se aplicarán automáticamente

### Performance lenta

- Reducir calidad de sombras
- Desactivar helpers en modo producción
- Optimizar resolución de texturas

## 📝 Notas de Desarrollo

Este proyecto está diseñado para ser modular y extensible. Cada manager maneja un aspecto específico:

- **CameraManager**: Toda la lógica de cámaras
- **LightingManager**: Iluminación y ambientes
- **MaterialManager**: Materiales PBR y procedurales
- **AnimationManager**: Sistema completo de animaciones
- **SceneManager**: Gestión general de la escena
- **UIManager**: Interfaz e interacciones

Para agregar nuevas funcionalidades, simplemente extiende el manager correspondiente o crea uno nuevo.
