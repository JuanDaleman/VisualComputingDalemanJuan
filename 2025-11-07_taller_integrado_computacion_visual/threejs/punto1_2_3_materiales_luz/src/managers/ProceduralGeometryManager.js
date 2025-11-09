import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

/**
 * ProceduralGeometryManager
 * Handles algorithmic geometry generation using loops, recursion, and parametric equations.
 * Implements Workshop Point 2: Procedural modeling from code
 */
class ProceduralGeometryManager {
    constructor(scene, materialManager) {
        this.scene = scene;
        this.materialManager = materialManager;
        
        // Current procedural mesh
        this.currentProceduralMesh = null;
        this.proceduralGroup = new THREE.Group();
        this.proceduralGroup.name = 'ProceduralGroup';
        this.scene.add(this.proceduralGroup);
        
        // Animation state
        this.animationTime = 0;
        this.isAnimating = false;
        this.animationInterval = null;
        
        // Store original models state
        this.hiddenModels = [];
    }

    /**
     * Hide all loaded GLB models to see procedural geometry clearly
     */
    hideLoadedModels() {
        this.hiddenModels = [];
        
        // Ensure ProceduralGroup is in the scene
        if (!this.scene.children.includes(this.proceduralGroup)) {
            this.scene.add(this.proceduralGroup);
        }
        
        // Helper function to check if a node is inside ProceduralGroup hierarchy
        const isInsideProceduralGroup = (node) => {
            let current = node;
            while (current) {
                if (current === this.proceduralGroup) return true;
                current = current.parent;
            }
            return false;
        };
        
        // Hide all meshes except those in ProceduralGroup and Helpers
        this.scene.traverse((child) => {
            if (child.isMesh && !isInsideProceduralGroup(child) && !child.name.includes('Helper')) {
                child.visible = false;
                this.hiddenModels.push(child);
            }
        });
    }

    /**
     * Show all previously hidden models
     */
    showLoadedModels() {
        this.hiddenModels.forEach(mesh => {
            mesh.visible = true;
        });
        this.hiddenModels = [];
    }

    /**
     * Clear all procedural geometries from scene
     */
    clearProceduralGeometry() {
        if (this.currentProceduralMesh) {
            this.proceduralGroup.remove(this.currentProceduralMesh);
            
            // Dispose geometry safely
            if (this.currentProceduralMesh.geometry) {
                this.currentProceduralMesh.geometry.dispose();
            }
            
            // Dispose material safely
            if (this.currentProceduralMesh.material) {
                if (Array.isArray(this.currentProceduralMesh.material)) {
                    this.currentProceduralMesh.material.forEach(mat => mat.dispose());
                } else {
                    this.currentProceduralMesh.material.dispose();
                }
            }
            
            this.currentProceduralMesh = null;
        }
        
        // Clear any children in the group (for Sierpinski which is a Group)
        while (this.proceduralGroup.children.length > 0) {
            const child = this.proceduralGroup.children[0];
            this.proceduralGroup.remove(child);
            
            // Dispose child geometry safely
            if (child.geometry) {
                child.geometry.dispose();
            }
            
            // Dispose child material safely
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
            
            // If child is a group, dispose its children recursively
            if (child.children && child.children.length > 0) {
                child.children.forEach(grandchild => {
                    if (grandchild.geometry) grandchild.geometry.dispose();
                    if (grandchild.material) {
                        if (Array.isArray(grandchild.material)) {
                            grandchild.material.forEach(mat => mat.dispose());
                        } else {
                            grandchild.material.dispose();
                        }
                    }
                });
            }
        }
        
        // Restore original models
        this.showLoadedModels();
    }

    /**
     * ALGORITHM 1: Wave Grid - Uses LOOPS + Sine Function
     * Generates a planar grid with sinusoidal wave deformation
     * Demonstrates: Nested loops, vertex manipulation, trigonometric functions
     */
    generateWaveGrid(width = 10, height = 10, segments = 50, amplitude = 1.5, frequency = 2) {
        this.clearProceduralGeometry();
        this.hideLoadedModels();
        
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];
        
        // Generate vertices using NESTED LOOPS
        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                // Normalize coordinates to [0, 1]
                const u = i / segments;
                const v = j / segments;
                
                // Map to world space
                const x = (u - 0.5) * width;
                const z = (v - 0.5) * height;
                
                // Apply SINE WAVE for height variation (procedural deformation)
                const y = Math.sin(u * Math.PI * frequency) * 
                         Math.cos(v * Math.PI * frequency) * amplitude;
                
                vertices.push(x, y, z);
                uvs.push(u, v);
                
                // Calculate normals (simplified for wave surface)
                const nx = -Math.cos(u * Math.PI * frequency) * Math.PI * frequency * amplitude;
                const ny = 1;
                const nz = Math.sin(v * Math.PI * frequency) * Math.PI * frequency * amplitude;
                const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                normals.push(nx / length, ny / length, nz / length);
            }
        }
        
        // Generate indices for triangles using LOOPS
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = i * (segments + 1) + j;
                const b = a + segments + 1;
                const c = a + 1;
                const d = b + 1;
                
                // Two triangles per quad
                indices.push(a, b, c);
                indices.push(c, b, d);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        
        // Create material
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            side: THREE.DoubleSide,
            wireframe: false
        });
        
        this.currentProceduralMesh = new THREE.Mesh(geometry, material);
        this.currentProceduralMesh.name = 'WaveGrid';
        this.currentProceduralMesh.castShadow = true;
        this.currentProceduralMesh.receiveShadow = true;
        
        // Position and scale
        this.currentProceduralMesh.position.set(0, 5, 0);
        this.currentProceduralMesh.scale.set(2, 2, 2);
        this.proceduralGroup.add(this.currentProceduralMesh);
        
        return this.currentProceduralMesh;
    }

    /**
     * ALGORITHM 2: Helix Spiral - Uses LOOPS + Trigonometry
     * Generates a 3D spiral using parametric equations
     * Demonstrates: Parametric curves, circular motion, vertical progression
     */
    generateHelixSpiral(radius = 3, height = 8, turns = 4, segments = 200, tubeRadius = 0.2) {
        this.clearProceduralGeometry();
        this.hideLoadedModels();
        
        const path = new THREE.CurvePath();
        const points = [];
        
        // Generate spiral points using LOOP + PARAMETRIC EQUATIONS
        for (let i = 0; i <= segments; i++) {
            // Parameter t goes from 0 to 1
            const t = i / segments;
            
            // Parametric helix equations
            const angle = t * Math.PI * 2 * turns;
            const x = Math.cos(angle) * radius;
            const y = t * height - height / 2; // Center vertically
            const z = Math.sin(angle) * radius;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create curve from points
        const curve = new THREE.CatmullRomCurve3(points);
        
        // Create tube geometry along the curve
        const geometry = new THREE.TubeGeometry(curve, segments, tubeRadius, 8, false);
        
        // Apply current PBR material (default to metal)
        const material = this.materialManager.getMaterial('metal') || 
                        new THREE.MeshStandardMaterial({ 
                            color: 0x4682B4, 
                            metalness: 0.9, 
                            roughness: 0.2,
                            side: THREE.DoubleSide
                        });
        this.currentProceduralMesh = new THREE.Mesh(geometry, material);
        this.currentProceduralMesh.name = 'HelixSpiral';
        this.currentProceduralMesh.castShadow = true;
        this.currentProceduralMesh.receiveShadow = true;
        
        this.proceduralGroup.add(this.currentProceduralMesh);
        
        return this.currentProceduralMesh;
    }

    /**
     * ALGORITHM 3: Sierpinski Pyramid - Uses RECURSION
     * Generates a fractal pyramid using recursive subdivision
     * Demonstrates: Recursive algorithms, fractal patterns, self-similarity
     */
    generateSierpinskiPyramid(size = 6, level = 3) {
        this.clearProceduralGeometry();
        this.hideLoadedModels();
        
        // Base vertices of a tetrahedron (pyramid)
        const height = size * Math.sqrt(2 / 3);
        const baseVertices = [
            new THREE.Vector3(0, height / 2, 0),                          // Top
            new THREE.Vector3(-size / 2, -height / 2, size / (2 * Math.sqrt(3))),   // Front-left
            new THREE.Vector3(size / 2, -height / 2, size / (2 * Math.sqrt(3))),    // Front-right
            new THREE.Vector3(0, -height / 2, -size / Math.sqrt(3))       // Back
        ];
        
        const group = new THREE.Group();
        
        /**
         * RECURSIVE FUNCTION - Core of fractal generation
         * Base case: level 0 -> draw single tetrahedron
         * Recursive case: subdivide into 4 smaller pyramids
         */
        const recursiveSierpinski = (v0, v1, v2, v3, depth) => {
            if (depth === 0) {
                // BASE CASE: Create single tetrahedron
                const geometry = new THREE.BufferGeometry();
                const vertices = new Float32Array([
                    // Triangle 1: v0, v1, v2
                    v0.x, v0.y, v0.z,
                    v1.x, v1.y, v1.z,
                    v2.x, v2.y, v2.z,
                    // Triangle 2: v0, v2, v3
                    v0.x, v0.y, v0.z,
                    v2.x, v2.y, v2.z,
                    v3.x, v3.y, v3.z,
                    // Triangle 3: v0, v3, v1
                    v0.x, v0.y, v0.z,
                    v3.x, v3.y, v3.z,
                    v1.x, v1.y, v1.z,
                    // Triangle 4: v1, v3, v2 (base)
                    v1.x, v1.y, v1.z,
                    v3.x, v3.y, v3.z,
                    v2.x, v2.y, v2.z
                ]);
                
                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                geometry.computeVertexNormals();
                
                // Apply current PBR material (default to metal)
                const material = this.materialManager.getMaterial('metal') || 
                                new THREE.MeshStandardMaterial({ 
                                    color: 0x4682B4, 
                                    metalness: 0.9, 
                                    roughness: 0.2,
                                    side: THREE.DoubleSide
                                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
            } else {
                // RECURSIVE CASE: Calculate midpoints and subdivide
                const m01 = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
                const m02 = new THREE.Vector3().addVectors(v0, v2).multiplyScalar(0.5);
                const m03 = new THREE.Vector3().addVectors(v0, v3).multiplyScalar(0.5);
                const m12 = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
                const m13 = new THREE.Vector3().addVectors(v1, v3).multiplyScalar(0.5);
                const m23 = new THREE.Vector3().addVectors(v2, v3).multiplyScalar(0.5);
                
                // RECURSIVE CALLS: Create 4 smaller pyramids
                recursiveSierpinski(v0, m01, m02, m03, depth - 1);  // Top pyramid
                recursiveSierpinski(m01, v1, m12, m13, depth - 1);  // Front-left pyramid
                recursiveSierpinski(m02, m12, v2, m23, depth - 1);  // Front-right pyramid
                recursiveSierpinski(m03, m13, m23, v3, depth - 1);  // Back pyramid
                // Note: Center pyramid is REMOVED (creates fractal void)
            }
        };
        
        // Start recursion
        recursiveSierpinski(baseVertices[0], baseVertices[1], baseVertices[2], baseVertices[3], level);
        
        group.name = 'SierpinskiPyramid';
        this.currentProceduralMesh = group;
        this.proceduralGroup.add(group);
        
        return group;
    }

    /**
     * ALGORITHM 4: Torus Knot - Uses PARAMETRIC EQUATIONS
     * Generates a complex knot structure using mathematical curves
     * Demonstrates: Parametric surfaces, complex trigonometry, topological forms
     */
    generateTorusKnot(p = 2, q = 3, radius = 4, tube = 0.8, segments = 200) {
        this.clearProceduralGeometry();
        this.hideLoadedModels();
        
        // Three.js has built-in TorusKnotGeometry, but let's show the math
        const points = [];
        
        // PARAMETRIC TORUS KNOT EQUATIONS
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            
            // Torus knot parametric equations
            // p and q determine the number of lobes and crossings
            const r = Math.cos(q * t) + 2;
            const x = r * Math.cos(p * t) * radius / 3;
            const y = r * Math.sin(p * t) * radius / 3;
            const z = -Math.sin(q * t) * radius / 3;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create curve and tube
        const curve = new THREE.CatmullRomCurve3(points, true); // true = closed loop
        const geometry = new THREE.TubeGeometry(curve, segments, tube, 16, true);
        
        // Apply current PBR material (default to metal)
        const material = this.materialManager.getMaterial('metal') || 
                        new THREE.MeshStandardMaterial({ 
                            color: 0x4682B4, 
                            metalness: 0.9, 
                            roughness: 0.2,
                            side: THREE.DoubleSide
                        });
        this.currentProceduralMesh = new THREE.Mesh(geometry, material);
        this.currentProceduralMesh.name = 'TorusKnot';
        this.currentProceduralMesh.castShadow = true;
        this.currentProceduralMesh.receiveShadow = true;
        
        this.proceduralGroup.add(this.currentProceduralMesh);
        
        return this.currentProceduralMesh;
    }

    /**
     * DYNAMIC VERTEX MODIFICATION
     * Animates existing geometry by modifying vertex positions
     * Demonstrates: Real-time vertex manipulation, wave propagation
     */
    animateWaveGrid(time) {
        if (!this.currentProceduralMesh || this.currentProceduralMesh.name !== 'WaveGrid') {
            return;
        }
        
        const geometry = this.currentProceduralMesh.geometry;
        const positions = geometry.attributes.position.array;
        
        // Modify Y coordinate of each vertex based on time
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            
            // Wave equation with time component
            positions[i + 1] = Math.sin(x * 0.5 + time) * 
                              Math.cos(z * 0.5 + time) * 1.5;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /**
     * Start continuous animation
     */
    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
    }

    /**
     * Stop animation
     */
    stopAnimation() {
        this.isAnimating = false;
    }

    /**
     * Update loop - called from main animation loop
     */
    update(deltaTime) {
        if (this.isAnimating && this.currentProceduralMesh) {
            this.animationTime += deltaTime * 0.001;
            
            if (this.currentProceduralMesh.name === 'WaveGrid') {
                this.animateWaveGrid(this.animationTime);
            }
            
            this.currentProceduralMesh.rotation.y += deltaTime * 0.0005;
        }
    }

    /**
     * Apply a different material to current procedural geometry
     */
    applyMaterial(materialName) {
        if (!this.currentProceduralMesh) return;
        
        const newMaterial = this.materialManager.getMaterial(materialName);
        if (!newMaterial) return;
        
        if (this.currentProceduralMesh.type === 'Group') {
            this.currentProceduralMesh.children.forEach(child => {
                if (child.isMesh) {
                    child.material = newMaterial;
                }
            });
        } else {
            this.currentProceduralMesh.material = newMaterial;
        }
    }

    /**
     * Get statistics about current geometry
     */
    getStats() {
        if (!this.currentProceduralMesh) {
            return { name: 'None', vertices: 0, faces: 0 };
        }
        
        let vertices = 0;
        let faces = 0;
        
        if (this.currentProceduralMesh.type === 'Group') {
            this.currentProceduralMesh.children.forEach(child => {
                if (child.geometry) {
                    vertices += child.geometry.attributes.position.count;
                    if (child.geometry.index) {
                        faces += child.geometry.index.count / 3;
                    }
                }
            });
        } else if (this.currentProceduralMesh.geometry) {
            vertices = this.currentProceduralMesh.geometry.attributes.position.count;
            if (this.currentProceduralMesh.geometry.index) {
                faces = this.currentProceduralMesh.geometry.index.count / 3;
            }
        }
        
        return {
            name: this.currentProceduralMesh.name,
            vertices: vertices,
            faces: Math.floor(faces)
        };
    }

    /**
     * Cleanup
     */
    dispose() {
        this.clearProceduralGeometry();
        this.scene.remove(this.proceduralGroup);
    }
}

export default ProceduralGeometryManager;
