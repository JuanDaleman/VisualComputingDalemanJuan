# Punto 2: Modelado Procedural desde Código

## 📋 Descripción General

Este módulo implementa **geometría procedural generada algorítmicamente** usando Three.js, demostrando la diferencia fundamental entre modelado manual (importar archivos .glb/.obj) y modelado procedural (generar vértices con código).

---

## 🔬 Algoritmos Implementados

### 1. **Wave Grid (Rejilla Ondulada)**
**Técnica**: Bucles anidados + Función seno

**Algoritmo**:
```javascript
for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
        const u = i / segments;
        const v = j / segments;
        
        const x = (u - 0.5) * width;
        const z = (v - 0.5) * height;
        
        // CLAVE: Altura calculada con funciones trigonométricas
        const y = Math.sin(u * Math.PI * frequency) * 
                 Math.cos(v * Math.PI * frequency) * amplitude;
        
        vertices.push(x, y, z);
    }
}
```

**Características**:
- **Bucles**: Doble loop para generar grid 2D
- **Matemáticas**: Funciones seno/coseno para ondulación
- **Parámetros**: width, height, segments, amplitude, frequency
- **Ventaja**: Modificación dinámica de vértices en tiempo real

**Aplicación**: Superficies de agua, terrenos ondulados, visualización de datos

---

### 2. **Helix Spiral (Espiral 3D)**
**Técnica**: Bucle + Ecuaciones paramétricas

**Algoritmo**:
```javascript
for (let i = 0; i <= segments; i++) {
    const t = i / segments;  // Parámetro normalizado [0, 1]
    
    // Ecuaciones paramétricas de una hélice
    const angle = t * Math.PI * 2 * turns;
    const x = Math.cos(angle) * radius;
    const y = t * height - height / 2;  // Progresión vertical
    const z = Math.sin(angle) * radius;
    
    points.push(new THREE.Vector3(x, y, z));
}
```

**Características**:
- **Bucle simple**: Un solo loop para curva 3D
- **Ecuaciones paramétricas**: Conversión de parámetro t a coordenadas (x,y,z)
- **Parámetros**: radius, height, turns, tubeRadius
- **Progresión**: Movimiento circular + ascenso vertical simultáneo

**Aplicación**: ADN, resortes, escaleras caracol, antenas

---

### 3. **Sierpinski Pyramid (Fractal Recursivo)**
**Técnica**: Recursión + División fractal

**Algoritmo**:
```javascript
function recursiveSierpinski(v0, v1, v2, v3, depth) {
    if (depth === 0) {
        // CASO BASE: Crear tetraedro individual
        createTetrahedron(v0, v1, v2, v3);
    } else {
        // CASO RECURSIVO: Calcular puntos medios
        const m01 = midpoint(v0, v1);
        const m02 = midpoint(v0, v2);
        const m03 = midpoint(v0, v3);
        const m12 = midpoint(v1, v2);
        const m13 = midpoint(v1, v3);
        const m23 = midpoint(v2, v3);
        
        // DIVIDIR EN 4 SUBPIRÁMIDES (el centro se elimina)
        recursiveSierpinski(v0, m01, m02, m03, depth - 1);
        recursiveSierpinski(m01, v1, m12, m13, depth - 1);
        recursiveSierpinski(m02, m12, v2, m23, depth - 1);
        recursiveSierpinski(m03, m13, m23, v3, depth - 1);
    }
}
```

**Características**:
- **Recursión**: Función que se llama a sí misma
- **Fractal**: Auto-similitud a diferentes escalas
- **Parámetros**: size, level (profundidad de recursión)
- **Complejidad**: Número de tetraedros = 4^level

**Aplicación**: Visualización de fractales, estructuras de datos, arte generativo

**Matemáticas**:
- Level 0: 1 tetraedro
- Level 1: 4 tetraedros
- Level 2: 16 tetraedros
- Level 3: 64 tetraedros
- Level 4: 256 tetraedros

---

### 4. **Torus Knot (Nudo Toroidal)**
**Técnica**: Ecuaciones paramétricas complejas

**Algoritmo**:
```javascript
for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    
    // Ecuaciones de nudo toroidal
    // p y q determinan número de vueltas
    const r = Math.cos(q * t) + 2;
    const x = r * Math.cos(p * t) * radius / 3;
    const y = r * Math.sin(p * t) * radius / 3;
    const z = -Math.sin(q * t) * radius / 3;
    
    points.push(new THREE.Vector3(x, y, z));
}
```

**Características**:
- **Topología**: Curvas cerradas en el espacio 3D
- **Parámetros**: p (vueltas longitudinales), q (vueltas meridianas), radius, tube
- **Matemáticas avanzadas**: Teoría de nudos
- **Variaciones**: (2,3), (3,2), (3,4), (5,3) producen nudos diferentes

**Aplicación**: Teoría de nudos, arte matemático, joyería paramétrica

---

## 📊 Comparativa: Modelado Manual vs Procedural

| Aspecto | Modelado Manual | Modelado Procedural |
|---------|----------------|---------------------|
| **Creación** | Software 3D (Blender, Maya) | Código (JavaScript, Python) |
| **Archivo** | .glb, .obj, .fbx (5-50 MB) | Generado en memoria (<1 KB código) |
| **Tiempo de carga** | Lento (parsing, texturas) | Instantáneo (cálculo) |
| **Parametrización** | Difícil (requiere re-modelado) | Fácil (cambiar variables) |
| **Modificación dinámica** | No (estático) | Sí (animaciones, morfeo) |
| **Complejidad visual** | Alta (orgánico, detallado) | Media (geométrico, matemático) |
| **Control artístico** | Total (escultórico) | Limitado (matemático) |
| **Reproducibilidad** | Baja (archivo único) | Alta (mismo código = mismo resultado) |
| **Optimización** | Manual (reducir polígonos) | Automática (ajustar parámetros) |
| **Casos de uso** | Personajes, vehículos, props | Terrenos, patrones, fractales |

---

## 🎨 Ejemplos de Uso en el Proyecto

### Ejemplo 1: Wave Grid con Material PBR
```javascript
// Generar rejilla de 10x10 con 50 subdivisiones
app.proceduralGeometryManager.generateWaveGrid(10, 10, 50, 1.5, 2);

// Aplicar material metálico
app.materialManager.applyMaterial('metal');

// Animar ondas en tiempo real
app.proceduralGeometryManager.startAnimation();
```

### Ejemplo 2: Sierpinski con diferentes niveles
```javascript
// Nivel 2: 16 tetraedros
app.proceduralGeometryManager.generateSierpinskiPyramid(6, 2);

// Nivel 3: 64 tetraedros (más detallado)
app.proceduralGeometryManager.generateSierpinskiPyramid(6, 3);

// Nivel 4: 256 tetraedros (muy complejo)
app.proceduralGeometryManager.generateSierpinskiPyramid(6, 4);
```

### Ejemplo 3: Torus Knot con variaciones
```javascript
// Nudo trefoil (3,2)
app.proceduralGeometryManager.generateTorusKnot(3, 2, 4, 0.8, 200);

// Nudo cinquefoil (5,2)
app.proceduralGeometryManager.generateTorusKnot(5, 2, 4, 0.8, 200);
```

---

## 💡 Ventajas del Modelado Procedural

### 1. **Parametrización**
```javascript
// Cambiar parámetros fácilmente
const smallGrid = generateWaveGrid(5, 5, 20, 0.5, 1);
const largeGrid = generateWaveGrid(20, 20, 100, 3.0, 4);
```

### 2. **Modificación Dinámica**
```javascript
// Animar vértices en tiempo real
animateWaveGrid(time) {
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 1] = Math.sin(vertices[i] + time) * amplitude;
    }
}
```

### 3. **Repetibilidad**
```javascript
// Mismo código, mismo resultado (determinístico)
const grid1 = generateWaveGrid(10, 10, 50);
const grid2 = generateWaveGrid(10, 10, 50);
// grid1 === grid2 (vértices idénticos)
```

### 4. **Optimización**
```javascript
// Ajustar nivel de detalle según necesidad
const lowPoly = generateSpiral(3, 8, 4, 50);   // 50 segmentos
const highPoly = generateSpiral(3, 8, 4, 500);  // 500 segmentos
```

---

## 🔧 Implementación Técnica

### Estructura de Clases
```
ProceduralGeometryManager
├── generateWaveGrid()      → Loops + Sine
├── generateHelixSpiral()   → Loops + Parametric
├── generateSierpinskiPyramid() → Recursion
├── generateTorusKnot()     → Parametric
├── animateWaveGrid()       → Dynamic vertex modification
├── clearProceduralGeometry() → Cleanup
└── update()                → Animation loop
```

### Flujo de Generación
1. **Cálculo de vértices**: Algoritmo matemático genera array de posiciones
2. **Cálculo de normales**: Para iluminación PBR correcta
3. **Cálculo de UVs**: Para mapeo de texturas (opcional)
4. **Creación de BufferGeometry**: Estructura optimizada de Three.js
5. **Aplicación de material**: PBR del MaterialManager
6. **Añadir a escena**: Insertar en ProceduralGroup

---

## 📈 Complejidad Computacional

| Geometría | Vértices | Triángulos | Complejidad |
|-----------|----------|------------|-------------|
| Wave Grid (50x50) | 2,601 | 5,000 | O(n²) |
| Helix Spiral (200 seg) | 1,600 | 3,200 | O(n) |
| Sierpinski (Level 3) | 192 | 256 | O(4ⁿ) |
| Torus Knot (200 seg) | 3,216 | 6,400 | O(n) |

**Nota**: 
- O(n²): Bucles anidados (grid)
- O(n): Bucle simple (espiral, knot)
- O(4ⁿ): Recursión exponencial (fractal)

---

## 🎯 Conclusiones

### Cuándo usar Modelado Procedural:
✅ Patrones repetitivos (rejillas, arrays)  
✅ Formas matemáticas (espirales, fractales)  
✅ Necesidad de parametrización  
✅ Animaciones dinámicas  
✅ Generación en tiempo real  
✅ Optimización de memoria  

### Cuándo usar Modelado Manual:
✅ Formas orgánicas complejas  
✅ Control artístico total  
✅ Detalles escultóricos  
✅ Personajes y criaturas  
✅ Assets únicos y especiales  

### Mejor de ambos:
🌟 **Híbrido**: Combinar modelos manuales con geometría procedural  
- Modelos manuales como base (vehículo, edificio)
- Geometría procedural para efectos (partículas, terreno, decoración)

---

## 🚀 Extensiones Posibles

1. **Noise procedural** (Perlin, Simplex) para terrenos orgánicos
2. **L-Systems** para generar plantas y árboles
3. **Voronoi diagrams** para fragmentación y celdas
4. **Metaballs** para formas orgánicas fluidas
5. **Extrusion paths** para arquitectura procedural
6. **Grammar-based modeling** para ciudades procedurales

---

## 📚 Referencias

- **Three.js BufferGeometry**: [Documentación oficial](https://threejs.org/docs/#api/en/core/BufferGeometry)
- **Parametric Surfaces**: Curves and surfaces for CAGD (Gerald Farin)
- **Fractal Geometry**: The Fractal Geometry of Nature (Benoit Mandelbrot)
- **Procedural Modeling**: Procedural Modeling of Cities (Parish & Müller)

---

## 🎨 Evidencias Visuales

### Capturas requeridas:
1. Wave Grid con material metálico + iluminación día
2. Helix Spiral con material madera + iluminación atardecer
3. Sierpinski Pyramid (level 3) con material concreto + wireframe
4. Torus Knot (3,2) con material vidrio + iluminación noche

### GIFs requeridos:
1. Wave Grid animándose en tiempo real (ondas propagándose)
2. Rotación de Sierpinski mostrando estructura fractal
3. Torus Knot con cambio de materiales PBR
4. Comparativa: Modelo manual vs Procedural lado a lado

---

**Implementado por**: ProceduralGeometryManager.js  
**Fecha**: Noviembre 2025  
**Curso**: Computación Visual - Taller 3, Punto 2
