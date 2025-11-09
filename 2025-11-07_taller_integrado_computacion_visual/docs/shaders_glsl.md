# Shaders Personalizados y Efectos Visuales (GLSL)

## 📋 Introducción

Este documento detalla la implementación de 7 shaders personalizados en GLSL ES 1.0 para WebGL, cubriendo técnicas fundamentales de programación de shaders desde efectos básicos hasta técnicas avanzadas como coordenadas baricéntricas para wireframe rendering.

## 🎯 Objetivos del Punto 3

1. **Dominar GLSL**: Crear shaders vertex y fragment desde cero
2. **Sistema de gestión**: Implementar ShaderManager para aplicar shaders dinámicamente
3. **Uniforms y varyings**: Comunicación JavaScript ↔ GLSL
4. **Técnicas avanzadas**: Coordenadas baricéntricas, distorsión UV, texturizado procedural
5. **Build system profesional**: Integrar vite-plugin-glsl para desarrollo modular

## 🎨 Shaders Implementados

### 1. Color por Posición (`positionColor`)

**Concepto**: Gradiente vertical basado en la coordenada Y del vértice.

**Vertex Shader** (`positionColor.vert`):
```glsl
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader** (`positionColor.frag`):
```glsl
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // Normalizar coordenada Y (asumiendo rango -5 a 5)
    float normalizedY = (vPosition.y + 5.0) / 10.0;
    
    // Colores del gradiente
    vec3 colorBottom = vec3(1.0, 0.4, 0.7); // Rosa
    vec3 colorTop = vec3(0.4, 0.7, 1.0);    // Azul
    
    // Variación horizontal con onda seno
    float horizontalVariation = sin(vPosition.x * 3.0) * 0.2;
    float mixFactor = clamp(normalizedY + horizontalVariation, 0.0, 1.0);
    
    // Mezclar colores
    vec3 finalColor = mix(colorBottom, colorTop, mixFactor);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Técnicas aplicadas**:
- **Varying variables**: Pasar posición del vertex al fragment shader
- **Normalización**: Mapear coordenadas del mundo a rango [0,1]
- **mix()**: Interpolación lineal entre dos vectores
- **clamp()**: Limitar valores al rango válido

**Aplicaciones**:
- Visualización de alturas (mapas topográficos)
- Degradados espaciales
- Color coding por posición

---

### 2. Color Animado por Tiempo (`timeColor`)

**Concepto**: Colores dinámicos usando el uniform `time` para crear ondas RGB independientes.

**Vertex Shader** (`timeColor.vert`):
```glsl
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader** (`timeColor.frag`):
```glsl
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Canal Rojo: onda seno en X
    float r = sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
    
    // Canal Verde: onda coseno en Y
    float g = cos(vUv.y * 10.0 + time * 1.5) * 0.5 + 0.5;
    
    // Canal Azul: onda combinada
    float b = sin((vUv.x + vUv.y) * 5.0 + time) * 0.5 + 0.5;
    
    gl_FragColor = vec4(r, g, b, 1.0);
}
```

**Técnicas aplicadas**:
- **Uniform time**: Variable global actualizada cada frame
- **Múltiples frecuencias**: 2.0, 1.5, 1.0 para crear complejidad
- **Normalización de seno**: `sin() * 0.5 + 0.5` mapea [-1,1] → [0,1]
- **Coordenadas UV**: Variación espacial basada en textura

**Aplicaciones**:
- Efectos psicodélicos
- Visualización de audio
- Fondos dinámicos
- Transiciones animadas

---

### 3. Toon Shading / Cel Shading (`toonShading`)

**Concepto**: Renderizado no fotorrealístico (NPR) estilo cartoon con bandas discretas de iluminación.

**Vertex Shader** (`toonShading.vert`):
```glsl
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    // Transformar normal a espacio de cámara
    vNormal = normalize(normalMatrix * normal);
    
    // Calcular posición en espacio de vista
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
}
```

**Fragment Shader** (`toonShading.frag`):
```glsl
uniform vec3 lightDirection;
uniform vec3 baseColor;
uniform int shadingLevels;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    
    // Calcular intensidad de iluminación (Lambertian)
    float intensity = max(dot(normal, lightDir), 0.0);
    
    // Discretizar en niveles (cel shading)
    float levels = float(shadingLevels);
    intensity = floor(intensity * levels) / levels;
    
    // Aplicar intensidad al color base
    vec3 color = baseColor * intensity;
    
    // Detección de bordes (silhouette)
    vec3 viewDir = normalize(vViewPosition);
    float edge = dot(viewDir, normal);
    
    // Oscurecer bordes
    if (edge < 0.3) {
        color *= 0.5;
    }
    
    gl_FragColor = vec4(color, 1.0);
}
```

**Técnicas aplicadas**:
- **Dot product**: `dot(normal, lightDir)` para cálculo de iluminación
- **floor()**: Discretización de valores continuos
- **Edge detection**: Detectar bordes con ángulo normal-vista
- **Uniforms múltiples**: Dirección de luz, color base, niveles

**Aplicaciones**:
- Videojuegos cel-shaded (Zelda: Wind Waker, Borderlands)
- Animación estilo anime
- Renderizado técnico/arquitectónico
- Comic book rendering

---

### 4. Gradiente Animado (`gradient`)

**Concepto**: Interpolación suave entre dos colores con modulación temporal.

**Vertex Shader** (`gradient.vert`):
```glsl
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader** (`gradient.frag`):
```glsl
uniform float time;
uniform vec3 color1;
uniform vec3 color2;
uniform float gradientSpeed;

varying vec2 vUv;

void main() {
    // Factor de mezcla con onda seno animada
    float mixFactor = vUv.x + sin(time * gradientSpeed + vUv.y * 3.14159) * 0.3;
    mixFactor = clamp(mixFactor, 0.0, 1.0);
    
    // Interpolar entre color1 y color2
    vec3 finalColor = mix(color1, color2, mixFactor);
    
    // Variación vertical adicional
    float verticalWave = sin(vUv.y * 5.0 + time * 0.5) * 0.1;
    finalColor += vec3(verticalWave);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Técnicas aplicadas**:
- **Uniforms vec3**: Colores como vectores RGB
- **Modulación sinusoidal**: Crear movimiento ondulante
- **Múltiples ondas**: Horizontal + vertical para complejidad
- **Ajuste de velocidad**: Parámetro `gradientSpeed` configurable

**Aplicaciones**:
- Skyboxes dinámicos
- Fondos de UI animados
- Transiciones entre escenas
- Ambientes atmosféricos

---

### 5. Distorsión UV (`uvDistortion`)

**Concepto**: Deformación de coordenadas de textura para simular líquidos, calor, portales.

**Vertex Shader** (`uvDistortion.vert`):
```glsl
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader** (`uvDistortion.frag`):
```glsl
uniform float time;
uniform float distortionStrength;
uniform float waveFrequency;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec2 distortedUv = vUv;
    
    // Ondas sinusoidales en X e Y
    distortedUv.x += sin(vUv.y * waveFrequency + time * 2.0) * distortionStrength;
    distortedUv.y += cos(vUv.x * waveFrequency + time * 1.5) * distortionStrength;
    
    // Ondas radiales desde el centro
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    float radialWave = sin(dist * 10.0 - time * 3.0) * distortionStrength * 0.5;
    distortedUv += normalize(vUv - center) * radialWave;
    
    // Generar colores basados en UV distorsionadas
    vec3 color1 = vec3(0.2, 0.6, 1.0); // Azul
    vec3 color2 = vec3(1.0, 0.3, 0.5); // Rosa
    vec3 color3 = vec3(0.3, 1.0, 0.4); // Verde
    
    float mixFactor1 = sin(distortedUv.x * 6.28318) * 0.5 + 0.5;
    float mixFactor2 = cos(distortedUv.y * 6.28318) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, mixFactor1);
    finalColor = mix(finalColor, color3, mixFactor2);
    
    // Variación temporal
    finalColor += vec3(sin(time * 0.5) * 0.1);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Técnicas aplicadas**:
- **Modificación de UV**: Desplazar coordenadas de textura
- **distance()**: Calcular distancia euclidiana
- **normalize()**: Obtener dirección del centro al pixel
- **Múltiples ondas**: Horizontal, vertical y radial combinadas

**Aplicaciones**:
- Efectos de agua y océano
- Portales mágicos
- Distorsión de calor (heat haze)
- Efectos de refracción
- Glitch art

---

### 6. Texturizado Procedural (`proceduralTexture`)

**Concepto**: Generación algorítmica de patrones sin usar imágenes externas.

**Vertex Shader** (`proceduralTexture.vert`):
```glsl
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader** (`proceduralTexture.frag`):
```glsl
uniform float time;
uniform float scale;
uniform int patternType;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Función de ruido pseudo-aleatorio
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Patrón 1: Tablero de ajedrez
vec3 checkerboard(vec2 uv, float scale) {
    vec2 scaledUv = uv * scale;
    float checker = mod(floor(scaledUv.x) + floor(scaledUv.y), 2.0);
    return vec3(checker);
}

// Patrón 2: Puntos
vec3 dots(vec2 uv, float scale) {
    vec2 scaledUv = uv * scale;
    vec2 gridUv = fract(scaledUv);
    vec2 center = vec2(0.5);
    float dist = distance(gridUv, center);
    float dot = smoothstep(0.4, 0.3, dist);
    return vec3(dot);
}

// Patrón 3: Ruido
vec3 noise(vec2 uv, float scale, float time) {
    vec2 scaledUv = uv * scale;
    vec2 i = floor(scaledUv);
    vec2 f = fract(scaledUv);
    
    // Interpolación suave
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    // Samplear 4 esquinas con variación temporal
    float a = random(i + vec2(0.0, 0.0) + time * 0.1);
    float b = random(i + vec2(1.0, 0.0) + time * 0.1);
    float c = random(i + vec2(0.0, 1.0) + time * 0.1);
    float d = random(i + vec2(1.0, 1.0) + time * 0.1);
    
    // Interpolación bilineal
    float noiseVal = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    return vec3(noiseVal);
}

// Patrón 4: Rayas
vec3 stripes(vec2 uv, float scale, float time) {
    float stripe = sin((uv.x + uv.y) * scale + time * 2.0) * 0.5 + 0.5;
    float stripe2 = sin((uv.x - uv.y) * scale * 0.7 - time * 1.5) * 0.5 + 0.5;
    float combined = stripe * 0.7 + stripe2 * 0.3;
    return vec3(combined);
}

void main() {
    vec3 pattern;
    
    // Seleccionar patrón según uniform
    if (patternType == 0) {
        pattern = checkerboard(vUv, scale);
    } else if (patternType == 1) {
        pattern = dots(vUv, scale);
    } else if (patternType == 2) {
        pattern = noise(vUv, scale, time);
    } else {
        pattern = stripes(vUv, scale, time);
    }
    
    // Colorear el patrón
    vec3 color1 = vec3(0.1, 0.2, 0.5); // Azul oscuro
    vec3 color2 = vec3(0.9, 0.7, 0.3); // Naranja claro
    vec3 finalColor = mix(color1, color2, pattern);
    
    // Iluminación simple basada en normal
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.3);
    finalColor *= diff;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Técnicas aplicadas**:
- **fract()**: Obtener parte fraccionaria (patrón repetitivo)
- **floor()**: Discretizar valores (crear grid)
- **smoothstep()**: Interpolación suave para anti-aliasing
- **Interpolación bilineal**: Suavizar ruido 2D
- **Funciones modulares**: Cada patrón es una función separada

**Aplicaciones**:
- Debugging de coordenadas UV
- Texturas sintéticas (no requieren archivo)
- Materiales generativos
- Patrones matemáticos
- Placeholder textures

---

### 7. Wireframe (`wireframe`)

**Concepto**: Renderizado de solo los bordes de triángulos usando coordenadas baricéntricas.

**Vertex Shader** (`wireframe.vert`):
```glsl
varying vec3 vBarycentric;
varying vec3 vPosition;

attribute vec3 barycentric; // Atributo custom

void main() {
    vBarycentric = barycentric;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader** (`wireframe.frag`):
```glsl
uniform vec3 wireframeColor;
uniform vec3 fillColor;
uniform float wireframeThickness;
uniform float time;

varying vec3 vBarycentric;
varying vec3 vPosition;

void main() {
    // Calcular derivadas para anti-aliasing
    vec3 deltas = fwidth(vBarycentric);
    vec3 smoothing = deltas * wireframeThickness;
    vec3 thickness = smoothing * 1.5;
    
    // Distancia a cada borde del triángulo
    vec3 edgeFactors = smoothstep(vec3(0.0), thickness, vBarycentric);
    
    // El borde más cercano determina si estamos en wireframe
    float edgeFactor = min(min(edgeFactors.x, edgeFactors.y), edgeFactors.z);
    
    // Mezclar entre color de wireframe y color de relleno
    vec3 finalColor = mix(wireframeColor, fillColor, edgeFactor);
    
    // Animar el color del wireframe (opcional)
    float pulse = sin(time * 2.0) * 0.3 + 0.7;
    finalColor = mix(finalColor, wireframeColor * pulse, 1.0 - edgeFactor);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Preparación de geometría** (JavaScript):
```javascript
prepareWireframeGeometry(mesh) {
    const geometry = mesh.geometry;
    const positionAttribute = geometry.attributes.position;
    const count = positionAttribute.count;
    const barycentric = new Float32Array(count * 3);
    
    // Asignar coordenadas baricéntricas a cada vértice
    for (let i = 0; i < count; i += 3) {
        // Primer vértice del triángulo: (1, 0, 0)
        barycentric[i * 3 + 0] = 1;
        barycentric[i * 3 + 1] = 0;
        barycentric[i * 3 + 2] = 0;
        
        // Segundo vértice del triángulo: (0, 1, 0)
        barycentric[(i + 1) * 3 + 0] = 0;
        barycentric[(i + 1) * 3 + 1] = 1;
        barycentric[(i + 1) * 3 + 2] = 0;
        
        // Tercer vértice del triángulo: (0, 0, 1)
        barycentric[(i + 2) * 3 + 0] = 0;
        barycentric[(i + 2) * 3 + 1] = 0;
        barycentric[(i + 2) * 3 + 2] = 1;
    }
    
    geometry.setAttribute('barycentric', new THREE.BufferAttribute(barycentric, 3));
}
```

**Técnicas aplicadas**:
- **Coordenadas baricéntricas**: Sistema de coordenadas dentro de un triángulo
- **fwidth()**: Derivada parcial para anti-aliasing
- **smoothstep()**: Transición suave entre bordes
- **Atributos custom**: Añadir datos personalizados a geometría
- **min()**: Seleccionar el borde más cercano

**Aplicaciones**:
- Debugging de geometría
- Visualización de topología de malla
- Estilos técnicos/arquitectónicos
- CAD/CAM rendering
- Modos de edición en 3D software

---

## 🏗️ Arquitectura del Sistema

### ShaderManager.js

Clase centralizada para gestionar todos los shaders y su ciclo de vida.

```javascript
import * as THREE from 'three';

// Importar todos los shaders
import positionColorVert from '../shaders/positionColor.vert';
import positionColorFrag from '../shaders/positionColor.frag';
// ... (importar resto de shaders)

export class ShaderManager {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.materials = {};
        this.shadedObjects = new Map(); // Guardar materiales originales
        
        this.initializeMaterials();
    }
    
    initializeMaterials() {
        // Crear ShaderMaterial para cada shader
        this.materials.positionColor = new THREE.ShaderMaterial({
            vertexShader: positionColorVert,
            fragmentShader: positionColorFrag,
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.DoubleSide
        });
        
        this.materials.timeColor = new THREE.ShaderMaterial({
            vertexShader: timeColorVert,
            fragmentShader: timeColorFrag,
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.DoubleSide
        });
        
        // ... resto de materiales
    }
    
    applyShader(object, shaderName) {
        if (!object || !object.isMesh) {
            console.warn('ShaderManager: El objeto debe ser un Mesh');
            return;
        }
        
        if (!this.materials[shaderName]) {
            console.warn(`ShaderManager: Shader "${shaderName}" no encontrado`);
            return;
        }
        
        // Guardar material original
        if (!this.shadedObjects.has(object)) {
            this.shadedObjects.set(object, object.material);
        }
        
        // Caso especial: wireframe requiere preparación
        if (shaderName === 'wireframe') {
            this.prepareWireframeGeometry(object);
        }
        
        // Aplicar shader
        object.material = this.materials[shaderName];
        object.material.needsUpdate = true;
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // Actualizar uniforms de tiempo
        Object.values(this.materials).forEach(material => {
            if (material.uniforms.time) {
                material.uniforms.time.value = this.time;
            }
        });
    }
    
    clearAllShaders() {
        this.shadedObjects.forEach((originalMaterial, object) => {
            object.material = originalMaterial;
            object.material.needsUpdate = true;
        });
        this.shadedObjects.clear();
    }
    
    dispose() {
        this.clearAllShaders();
        Object.values(this.materials).forEach(material => material.dispose());
        this.materials = {};
    }
}
```

### Build System: vite-plugin-glsl

**Configuración** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    plugins: [
        glsl({
            include: [
                '**/*.glsl',
                '**/*.vert',
                '**/*.frag',
                '**/*.vs',
                '**/*.fs'
            ],
            exclude: undefined,
            warnDuplicatedImports: true,
            defaultExtension: 'glsl',
            compress: false,
            watch: true
        })
    ],
    root: '.',
    publicDir: 'public',
    server: {
        port: 3001,
        open: true
    }
});
```

**Ventajas**:
- ✅ Importar shaders como ES modules
- ✅ Syntax highlighting en IDE
- ✅ Hot Module Replacement (HMR)
- ✅ Separación de concerns (un archivo por shader)
- ✅ Reutilización de código shader

## 📐 Conceptos GLSL Fundamentales

### 1. Varying Variables

**Propósito**: Pasar datos del vertex shader al fragment shader con interpolación automática.

```glsl
// Vertex Shader
varying vec3 vPosition;
void main() {
    vPosition = position;  // Asignar en vertex
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
varying vec3 vPosition;
void main() {
    // vPosition ahora está interpolado para cada pixel
    vec3 color = vPosition * 0.5 + 0.5;
    gl_FragColor = vec4(color, 1.0);
}
```

### 2. Uniform Variables

**Propósito**: Pasar datos constantes de JavaScript a GLSL (mismo valor para todos los vértices/píxeles).

```javascript
// JavaScript
const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Vector3(1, 0, 0) }
    },
    vertexShader: '...',
    fragmentShader: '...'
});

// Actualizar en loop
material.uniforms.time.value = clock.getElapsedTime();
```

```glsl
// GLSL
uniform float time;
uniform vec3 color;

void main() {
    float wave = sin(time * 2.0);
    gl_FragColor = vec4(color * wave, 1.0);
}
```

### 3. Funciones Built-in Esenciales

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `sin(x)`, `cos(x)` | Funciones trigonométricas | `sin(time * 2.0)` |
| `mix(a, b, t)` | Interpolación lineal: `a * (1-t) + b * t` | `mix(vec3(1,0,0), vec3(0,1,0), 0.5)` |
| `clamp(x, min, max)` | Limitar valor a rango | `clamp(value, 0.0, 1.0)` |
| `smoothstep(e0, e1, x)` | Interpolación suave Hermite | `smoothstep(0.0, 1.0, t)` |
| `dot(a, b)` | Producto punto | `dot(normal, lightDir)` |
| `normalize(v)` | Vector unitario | `normalize(vNormal)` |
| `fract(x)` | Parte fraccionaria | `fract(uv * 10.0)` |
| `floor(x)` | Redondeo hacia abajo | `floor(intensity * levels)` |
| `fwidth(x)` | Derivada parcial (anti-aliasing) | `fwidth(vBarycentric)` |

### 4. Espacios de Coordenadas

```glsl
// Model Space → World Space → View Space → Clip Space

// Vertex Shader - Transformaciones
void main() {
    // Model Space
    vec3 modelPos = position;
    
    // World Space
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    
    // View Space (espacio de cámara)
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    
    // Clip Space (para rasterización)
    gl_Position = projectionMatrix * viewPos;
}
```

## 🎯 Patrones de Diseño Aplicados

### 1. Manager Pattern

**Problema**: Gestionar múltiples shaders de forma centralizada.

**Solución**: ShaderManager como clase singleton.

**Beneficios**:
- Un único punto de entrada
- Gestión de ciclo de vida
- Fácil extensión con nuevos shaders

### 2. Factory Pattern

**Problema**: Crear ShaderMaterials con configuraciones complejas.

**Solución**: Método `initializeMaterials()` crea todos los materiales.

```javascript
initializeMaterials() {
    const shaderConfigs = [
        { name: 'positionColor', uniforms: {...}, vert: '...', frag: '...' },
        { name: 'timeColor', uniforms: {...}, vert: '...', frag: '...' }
    ];
    
    shaderConfigs.forEach(config => {
        this.materials[config.name] = new THREE.ShaderMaterial({
            vertexShader: config.vert,
            fragmentShader: config.frag,
            uniforms: config.uniforms,
            side: THREE.DoubleSide
        });
    });
}
```

### 3. Strategy Pattern

**Problema**: Aplicar diferentes shaders dinámicamente.

**Solución**: Método `applyShader(object, shaderName)` selecciona estrategia.

## 🚀 Optimizaciones y Best Practices

### 1. Minimize Uniform Updates

```javascript
// ❌ Malo: Actualizar cada frame innecesariamente
Object.values(this.materials).forEach(material => {
    material.uniforms.color.value = new THREE.Vector3(1, 0, 0);
});

// ✅ Bueno: Solo actualizar lo que cambia
if (material.uniforms.time) {
    material.uniforms.time.value = this.time;
}
```

### 2. Reuse Calculations

```glsl
// ❌ Malo: Recalcular múltiples veces
gl_FragColor = vec4(
    sin(vUv.x * 10.0 + time),
    sin(vUv.x * 10.0 + time) * 0.5,
    sin(vUv.x * 10.0 + time) * 0.3,
    1.0
);

// ✅ Bueno: Calcular una vez
float wave = sin(vUv.x * 10.0 + time);
gl_FragColor = vec4(wave, wave * 0.5, wave * 0.3, 1.0);
```

### 3. Use Appropriate Precision

```glsl
// Mobile devices: usar precision media cuando sea posible
precision mediump float;

// High precision solo cuando sea necesario
varying highp vec3 vPosition;
varying mediump vec2 vUv;
```

## 🐛 Debugging de Shaders

### Técnicas de Visualización

```glsl
// 1. Visualizar normales
void main() {
    vec3 color = vNormal * 0.5 + 0.5; // Mapear [-1,1] a [0,1]
    gl_FragColor = vec4(color, 1.0);
}

// 2. Visualizar UVs
void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}

// 3. Visualizar valores escalares
void main() {
    float value = someCalculation();
    gl_FragColor = vec4(vec3(value), 1.0); // Grayscale
}

// 4. Heatmap para debugging
vec3 heatmap(float t) {
    vec3 blue = vec3(0.0, 0.0, 1.0);
    vec3 cyan = vec3(0.0, 1.0, 1.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    vec3 red = vec3(1.0, 0.0, 0.0);
    
    if (t < 0.33) return mix(blue, cyan, t * 3.0);
    if (t < 0.66) return mix(cyan, yellow, (t - 0.33) * 3.0);
    return mix(yellow, red, (t - 0.66) * 3.0);
}
```

## 📚 Referencias y Recursos

### Documentación Oficial
- [WebGL Specification](https://www.khronos.org/webgl/)
- [GLSL ES 1.0 Reference Card](https://www.khronos.org/files/opengles_shading_language.pdf)
- [Three.js Shader Material](https://threejs.org/docs/#api/en/materials/ShaderMaterial)

### Tutoriales Recomendados
- [The Book of Shaders](https://thebookofshaders.com/) - Introducción visual a GLSL
- [Shadertoy](https://www.shadertoy.com/) - Ejemplos y playground
- [Inigo Quilez Articles](https://iquilezles.org/articles/) - Técnicas avanzadas

### Herramientas de Desarrollo
- [glslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas) - Live preview
- [GLSL Sandbox](http://glslsandbox.com/) - Editor online
- [ShaderFrog](https://shaderfrog.com/) - Visual shader editor

## 🎓 Conclusiones

### Aprendizajes Clave

1. **GLSL es un lenguaje de programación paralelo**: Cada píxel/vértice se procesa independientemente
2. **Varying = Interpolación automática**: GPU interpola valores entre vértices
3. **Uniforms = Datos globales**: Mismo valor para todos los shaders
4. **Coordenadas baricéntricas**: Técnica fundamental para efectos avanzados
5. **Build system modular**: Separar shaders en archivos mejora mantenibilidad

### Retos Superados

- **Wireframe sin geometría shader**: Implementado con coordenadas baricéntricas
- **Sincronización de tiempo**: Actualización centralizada de uniforms
- **Restauración de materiales**: Sistema de Map para guardar originales
- **Hot reload de shaders**: Integración con vite-plugin-glsl

### Próximos Pasos

- [ ] Implementar Simplex Noise para texturas más realistas
- [ ] Post-processing effects (bloom, DOF, motion blur)
- [ ] Compute shaders para física en GPU
- [ ] Ray marching para SDF rendering
- [ ] PBR shader custom desde cero
