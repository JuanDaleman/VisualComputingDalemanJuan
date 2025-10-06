import * as THREE from 'three';

class SceneManager {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.helpers = new Map();
        this.showHelpers = false;
        
        this.setupScene();
    }

    setupScene() {
        // Set up fog
        this.scene.fog = new THREE.Fog(0x1a1a1a, 1, 100);
        
        // Don't add automatic ground plane - use the one from scene_complete.glb
        // this.addGroundPlane();
    }

    addGroundPlane() {
        // Check if ground already exists or if there's a floor from loaded model
        const existingGround = this.scene.getObjectByName('Ground');
        if (existingGround) return;
        
        // Check if there are any horizontal planes that could be floors
        let hasFloorFromModel = false;
        this.scene.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.type === 'PlaneGeometry') {
                // Check if it's roughly horizontal (could be a floor)
                const rotation = child.rotation;
                if (Math.abs(rotation.x + Math.PI/2) < 0.1) { // Approximately horizontal
                    hasFloorFromModel = true;
                }
            }
        });
        
        if (hasFloorFromModel) {
            console.log('🏠 Floor detected in loaded model, skipping automatic ground plane');
            return;
        }
        
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x404040,
            roughness: 0.8,
            metalness: 0.0,
            transparent: true,
            opacity: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        ground.name = 'AutoGround';
        
        this.scene.add(ground);
        console.log('🏠 Added automatic ground plane');
    }

    toggleHelpers() {
        this.showHelpers = !this.showHelpers;
        
        if (this.showHelpers) {
            this.addHelpers();
        } else {
            this.removeHelpers();
        }
        
        console.log(`🔧 Helpers ${this.showHelpers ? 'enabled' : 'disabled'}`);
    }

    addHelpers() {
        // Grid helper
        const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
        gridHelper.name = 'GridHelper';
        this.scene.add(gridHelper);
        this.helpers.set('grid', gridHelper);
        
        // Axes helper
        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.name = 'AxesHelper';
        this.scene.add(axesHelper);
        this.helpers.set('axes', axesHelper);
        
        // Light helpers
        this.scene.traverse((child) => {
            if (child.isDirectionalLight) {
                const helper = new THREE.DirectionalLightHelper(child, 2);
                helper.name = `${child.name}Helper`;
                this.scene.add(helper);
                this.helpers.set(`light_${child.uuid}`, helper);
            } else if (child.isPointLight) {
                const helper = new THREE.PointLightHelper(child, 1);
                helper.name = `${child.name}Helper`;
                this.scene.add(helper);
                this.helpers.set(`light_${child.uuid}`, helper);
            } else if (child.isSpotLight) {
                const helper = new THREE.SpotLightHelper(child);
                helper.name = `${child.name}Helper`;
                this.scene.add(helper);
                this.helpers.set(`light_${child.uuid}`, helper);
            }
        });
    }

    removeHelpers() {
        this.helpers.forEach((helper, name) => {
            this.scene.remove(helper);
        });
        this.helpers.clear();
    }

    toggleWireframe() {
        let wireframeEnabled = false;
        
        this.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.wireframe = !material.wireframe;
                        wireframeEnabled = material.wireframe;
                    });
                } else {
                    child.material.wireframe = !child.material.wireframe;
                    wireframeEnabled = child.material.wireframe;
                }
            }
        });
        
        console.log(`📐 Wireframe ${wireframeEnabled ? 'enabled' : 'disabled'}`);
    }

    getSceneInfo() {
        const info = {
            objects: 0,
            meshes: 0,
            lights: 0,
            materials: new Set(),
            geometries: new Set(),
            textures: new Set()
        };
        
        this.scene.traverse((child) => {
            info.objects++;
            
            if (child.isMesh) {
                info.meshes++;
                
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => info.materials.add(mat.uuid));
                    } else {
                        info.materials.add(child.material.uuid);
                    }
                }
                
                if (child.geometry) {
                    info.geometries.add(child.geometry.uuid);
                }
            }
            
            if (child.isLight) {
                info.lights++;
            }
        });
        
        // Count renderer info
        const rendererInfo = this.renderer.info;
        
        return {
            ...info,
            materials: info.materials.size,
            geometries: info.geometries.size,
            triangles: rendererInfo.render.triangles,
            drawCalls: rendererInfo.render.calls,
            memory: {
                geometries: rendererInfo.memory.geometries,
                textures: rendererInfo.memory.textures
            }
        };
    }

    exportScene() {
        // Simple scene export (could be expanded)
        const sceneData = {
            metadata: {
                version: '1.0',
                type: 'TallerScene',
                generator: 'Three.js Scene Manager'
            },
            objects: [],
            lights: [],
            cameras: []
        };
        
        this.scene.traverse((child) => {
            if (child.isMesh) {
                sceneData.objects.push({
                    name: child.name,
                    type: child.type,
                    position: child.position.toArray(),
                    rotation: child.rotation.toArray(),
                    scale: child.scale.toArray()
                });
            } else if (child.isLight) {
                sceneData.lights.push({
                    name: child.name,
                    type: child.type,
                    color: child.color.getHex(),
                    intensity: child.intensity,
                    position: child.position?.toArray()
                });
            } else if (child.isCamera) {
                sceneData.cameras.push({
                    name: child.name,
                    type: child.type,
                    position: child.position.toArray(),
                    fov: child.fov
                });
            }
        });
        
        return sceneData;
    }

    clearScene() {
        // Remove all objects except helpers and ground
        const objectsToRemove = [];
        
        this.scene.traverse((child) => {
            if (child !== this.scene && 
                !child.name?.includes('Helper') && 
                child.name !== 'Ground') {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
        });
        
        console.log('🗑️ Scene cleared');
    }
}

export default SceneManager;