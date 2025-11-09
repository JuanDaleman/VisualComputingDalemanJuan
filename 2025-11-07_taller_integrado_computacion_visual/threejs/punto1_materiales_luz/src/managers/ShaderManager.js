import * as THREE from 'three';

// Importar shaders
import positionColorVert from '../shaders/positionColor.vert';
import positionColorFrag from '../shaders/positionColor.frag';
import timeColorVert from '../shaders/timeColor.vert';
import timeColorFrag from '../shaders/timeColor.frag';
import toonShadingVert from '../shaders/toonShading.vert';
import toonShadingFrag from '../shaders/toonShading.frag';
import gradientVert from '../shaders/gradient.vert';
import gradientFrag from '../shaders/gradient.frag';
import uvDistortionVert from '../shaders/uvDistortion.vert';
import uvDistortionFrag from '../shaders/uvDistortion.frag';
import proceduralTextureVert from '../shaders/proceduralTexture.vert';
import proceduralTextureFrag from '../shaders/proceduralTexture.frag';
import wireframeVert from '../shaders/wireframe.vert';
import wireframeFrag from '../shaders/wireframe.frag';

/**
 * ShaderManager - Gestiona materiales con shaders personalizados
 */
export class ShaderManager {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.materials = {};
        this.shadedObjects = new Map(); // Almacenar objetos con sus materiales originales
        
        this.initializeMaterials();
    }

    /**
     * Crear todos los materiales con shaders personalizados
     */
    initializeMaterials() {
        // 1. Position Color Shader
        this.materials.positionColor = new THREE.ShaderMaterial({
            vertexShader: positionColorVert,
            fragmentShader: positionColorFrag,
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.DoubleSide
        });

        // 2. Time Color Shader
        this.materials.timeColor = new THREE.ShaderMaterial({
            vertexShader: timeColorVert,
            fragmentShader: timeColorFrag,
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.DoubleSide
        });

        // 3. Toon Shading
        this.materials.toonShading = new THREE.ShaderMaterial({
            vertexShader: toonShadingVert,
            fragmentShader: toonShadingFrag,
            uniforms: {
                lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                baseColor: { value: new THREE.Vector3(0.3, 0.6, 0.9) },
                shadingLevels: { value: 4 }
            },
            side: THREE.DoubleSide
        });

        // 4. Gradient Shader
        this.materials.gradient = new THREE.ShaderMaterial({
            vertexShader: gradientVert,
            fragmentShader: gradientFrag,
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Vector3(1.0, 0.2, 0.5) }, // Rosa
                color2: { value: new THREE.Vector3(0.2, 0.5, 1.0) }, // Azul
                gradientSpeed: { value: 1.0 }
            },
            side: THREE.DoubleSide
        });

        // 5. UV Distortion Shader
        this.materials.uvDistortion = new THREE.ShaderMaterial({
            vertexShader: uvDistortionVert,
            fragmentShader: uvDistortionFrag,
            uniforms: {
                time: { value: 0 },
                distortionStrength: { value: 0.1 },
                waveFrequency: { value: 5.0 }
            },
            side: THREE.DoubleSide
        });

        // 6. Procedural Texture Shader
        this.materials.proceduralTexture = new THREE.ShaderMaterial({
            vertexShader: proceduralTextureVert,
            fragmentShader: proceduralTextureFrag,
            uniforms: {
                time: { value: 0 },
                scale: { value: 10.0 },
                patternType: { value: 0 } // 0: checkerboard, 1: dots, 2: noise, 3: stripes
            },
            side: THREE.DoubleSide
        });

        // 7. Wireframe Shader (requiere geometría especial)
        this.materials.wireframe = new THREE.ShaderMaterial({
            vertexShader: wireframeVert,
            fragmentShader: wireframeFrag,
            uniforms: {
                wireframeColor: { value: new THREE.Vector3(0.0, 1.0, 1.0) }, // Cyan
                fillColor: { value: new THREE.Vector3(0.1, 0.1, 0.2) }, // Azul oscuro
                wireframeThickness: { value: 1.0 },
                time: { value: 0 }
            },
            side: THREE.DoubleSide
        });
    }

    /**
     * Aplicar shader a un objeto
     * @param {THREE.Object3D} object - Objeto al que aplicar el shader
     * @param {string} shaderName - Nombre del shader
     */
    applyShader(object, shaderName) {
        if (!object || !object.isMesh) {
            console.warn('ShaderManager: El objeto debe ser un Mesh');
            return;
        }

        if (!this.materials[shaderName]) {
            console.warn(`ShaderManager: Shader "${shaderName}" no encontrado`);
            return;
        }

        // Guardar material original si no existe
        if (!this.shadedObjects.has(object)) {
            this.shadedObjects.set(object, object.material);
        }

        // Caso especial: wireframe requiere coordenadas baricéntricas
        if (shaderName === 'wireframe') {
            this.prepareWireframeGeometry(object);
        }

        // Aplicar material shader
        object.material = this.materials[shaderName];
        object.material.needsUpdate = true;
    }

    /**
     * Preparar geometría para shader wireframe (agregar coordenadas baricéntricas)
     * @param {THREE.Mesh} mesh - Mesh a preparar
     */
    prepareWireframeGeometry(mesh) {
        const geometry = mesh.geometry;
        
        // Verificar si ya tiene coordenadas baricéntricas
        if (geometry.attributes.barycentric) {
            return;
        }

        // Crear coordenadas baricéntricas
        const positionAttribute = geometry.attributes.position;
        const count = positionAttribute.count;
        const barycentric = new Float32Array(count * 3);

        // Asignar coordenadas baricéntricas a cada vértice
        for (let i = 0; i < count; i += 3) {
            // Primer vértice del triángulo (1, 0, 0)
            barycentric[i * 3 + 0] = 1;
            barycentric[i * 3 + 1] = 0;
            barycentric[i * 3 + 2] = 0;

            // Segundo vértice del triángulo (0, 1, 0)
            barycentric[(i + 1) * 3 + 0] = 0;
            barycentric[(i + 1) * 3 + 1] = 1;
            barycentric[(i + 1) * 3 + 2] = 0;

            // Tercer vértice del triángulo (0, 0, 1)
            barycentric[(i + 2) * 3 + 0] = 0;
            barycentric[(i + 2) * 3 + 1] = 0;
            barycentric[(i + 2) * 3 + 2] = 1;
        }

        geometry.setAttribute('barycentric', new THREE.BufferAttribute(barycentric, 3));
    }

    /**
     * Restaurar material original de un objeto
     * @param {THREE.Object3D} object - Objeto a restaurar
     */
    restoreMaterial(object) {
        if (this.shadedObjects.has(object)) {
            object.material = this.shadedObjects.get(object);
            object.material.needsUpdate = true;
            this.shadedObjects.delete(object);
        }
    }

    /**
     * Limpiar todos los shaders aplicados
     */
    clearAllShaders() {
        this.shadedObjects.forEach((originalMaterial, object) => {
            object.material = originalMaterial;
            object.material.needsUpdate = true;
        });
        this.shadedObjects.clear();
    }

    /**
     * Crear objeto de demostración con shader específico
     * @param {string} shaderName - Nombre del shader
     * @param {THREE.BufferGeometry} geometry - Geometría a usar
     * @param {THREE.Vector3} position - Posición del objeto
     * @returns {THREE.Mesh} Mesh con shader aplicado
     */
    createShaderDemo(shaderName, geometry, position = new THREE.Vector3(0, 0, 0)) {
        const mesh = new THREE.Mesh(geometry, this.materials[shaderName]);
        mesh.position.copy(position);
        
        if (shaderName === 'wireframe') {
            this.prepareWireframeGeometry(mesh);
        }
        
        this.shadedObjects.set(mesh, null); // No hay material original
        this.scene.add(mesh);
        return mesh;
    }

    /**
     * Actualizar uniforms de shaders con el tiempo
     * @param {number} deltaTime - Tiempo desde el último frame
     */
    update(deltaTime) {
        this.time += deltaTime;

        // Actualizar uniforms que usan tiempo
        if (this.materials.timeColor) {
            this.materials.timeColor.uniforms.time.value = this.time;
        }
        if (this.materials.gradient) {
            this.materials.gradient.uniforms.time.value = this.time;
        }
        if (this.materials.uvDistortion) {
            this.materials.uvDistortion.uniforms.time.value = this.time;
        }
        if (this.materials.proceduralTexture) {
            this.materials.proceduralTexture.uniforms.time.value = this.time;
        }
        if (this.materials.wireframe) {
            this.materials.wireframe.uniforms.time.value = this.time;
        }
    }

    /**
     * Obtener lista de shaders disponibles
     * @returns {string[]} Array con nombres de shaders
     */
    getAvailableShaders() {
        return Object.keys(this.materials);
    }

    /**
     * Obtener material shader por nombre
     * @param {string} shaderName - Nombre del shader
     * @returns {THREE.ShaderMaterial|null} Material o null si no existe
     */
    getMaterial(shaderName) {
        return this.materials[shaderName] || null;
    }

    /**
     * Cambiar parámetros de un shader específico
     * @param {string} shaderName - Nombre del shader
     * @param {object} uniforms - Objeto con uniforms a actualizar
     */
    updateShaderUniforms(shaderName, uniforms) {
        const material = this.materials[shaderName];
        if (!material) {
            console.warn(`ShaderManager: Shader "${shaderName}" no encontrado`);
            return;
        }

        Object.keys(uniforms).forEach(key => {
            if (material.uniforms[key]) {
                material.uniforms[key].value = uniforms[key];
            }
        });
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        // Restaurar materiales originales
        this.clearAllShaders();

        // Dispose de materiales shader
        Object.values(this.materials).forEach(material => {
            material.dispose();
        });

        this.materials = {};
    }
}
