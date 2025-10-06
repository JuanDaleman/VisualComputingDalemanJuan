import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import SceneManager from './managers/SceneManager.js';
import CameraManager from './managers/CameraManager.js';
import LightingManager from './managers/LightingManager.js';
import MaterialManager from './managers/MaterialManager.js';
import AnimationManager from './managers/AnimationManager.js';
import UIManager from './managers/UIManager.js';

class TallerApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.loadingElement = document.getElementById('loading');
        
        // Managers
        this.sceneManager = null;
        this.cameraManager = null;
        this.lightingManager = null;
        this.materialManager = null;
        this.animationManager = null;
        this.uiManager = null;
        
        // Core Three.js objects
        this.renderer = null;
        this.scene = null;
        this.controls = null;
        
        // Loaders
        this.gltfLoader = new GLTFLoader();
        this.rgbeLoader = new RGBELoader();
        this.exrLoader = new EXRLoader();
        
        // State
        this.loadedModels = new Map();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            this.setupRenderer();
            this.setupManagers();
            this.setupEventListeners();
            
            // Load assets
            await this.loadAssets();
            
            // Start render loop
            this.animate();
            
            // Hide loading screen
            this.loadingElement.classList.add('hidden');
            this.isInitialized = true;
            
            console.log('✅ Taller App initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Error cargando el proyecto: ' + error.message);
        }
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set color management
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupManagers() {
        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
        
        // Initialize managers
        this.sceneManager = new SceneManager(this.scene, this.renderer);
        this.cameraManager = new CameraManager(this.container);
        this.lightingManager = new LightingManager(this.scene);
        this.materialManager = new MaterialManager();
        this.animationManager = new AnimationManager(this.scene);
        this.uiManager = new UIManager(this);
        
        // Setup orbit controls
        this.controls = new OrbitControls(
            this.cameraManager.activeCamera, 
            this.renderer.domElement
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 100;
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Keyboard controls
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // UI events
        this.uiManager.setupEventListeners();
    }

    async loadAssets() {
        console.log('📦 Loading assets...');
        
        // Clear any existing scene objects first
        this.clearExistingObjects();
        
        try {
            // Try to load the main GLB scene first
            const mainSceneLoaded = await this.loadMainScene();
            
            // Load individual models only if main scene failed
            if (!mainSceneLoaded) {
                console.log('📦 Loading individual models as fallback...');
                await this.loadIndividualModels();
            }
            
            // Load HDRI environments
            await this.loadEnvironments();
            
            // Setup initial lighting
            this.lightingManager.setupDefaultLighting();
            
        } catch (error) {
            console.error('Error loading assets:', error);
            // Create fallback scene if loading fails
            this.createFallbackScene();
        }
    }

    async loadMainScene() {
        // First, try to load the downloaded GLB from the editor
        const possiblePaths = [
            '/scene_complete.glb',
            '../glb_models/scene_complete.glb',
            '../glb_models/taller_scene.glb',
            '../glb_models/exported_scene.glb'
        ];
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load: ${path}`);
                const gltf = await this.gltfLoader.loadAsync(path);
                console.log('✅ Main scene loaded:', gltf);
                
                // Add to scene
                this.scene.add(gltf.scene);
                this.loadedModels.set('main_scene', gltf);
                
                // Analyze and setup the loaded scene
                this.analyzeLoadedScene(gltf);
                
                // Successfully loaded main scene, skip individual models
                console.log('✅ Main scene loaded successfully, skipping individual models');
                return true;
                
            } catch (error) {
                console.log(`⚠️ Could not load ${path}:`, error.message);
                continue;
            }
        }
        
        console.log('⚠️ No main scene GLB found, will load individual models');
        return false;
    }

    async loadIndividualModels() {
        const models = [
            { name: 'mclaren', path: '/ScaledMclaren.glb' },
            { name: 'city', path: '/ScaledCity.glb' },
            { name: 'donald', path: '/ScaleDonald.glb' }
        ];
        
        const loadPromises = models.map(async (model) => {
            try {
                const gltf = await this.gltfLoader.loadAsync(model.path);
                console.log(`✅ Loaded ${model.name}:`, gltf);
                
                // Position models in scene
                this.positionModel(gltf.scene, model.name);
                
                this.scene.add(gltf.scene);
                this.loadedModels.set(model.name, gltf);
                
            } catch (error) {
                console.error(`❌ Failed to load ${model.name}:`, error);
            }
        });
        
        await Promise.allSettled(loadPromises);
    }

    async loadEnvironments() {
        const environments = [
            { name: 'day', path: '/hdri/zawiszy_czarnego_4k.hdr' },
            { name: 'sunset', path: '/hdri/qwantani_sunset_puresky_4k.exr' }
        ];
        
        for (const env of environments) {
            try {
                let texture;
                if (env.path.endsWith('.exr')) {
                    texture = await this.exrLoader.loadAsync(env.path);
                } else {
                    texture = await this.rgbeLoader.loadAsync(env.path);
                }
                
                texture.mapping = THREE.EquirectangularReflectionMapping;
                
                this.lightingManager.addEnvironment(env.name, texture);
                console.log(`✅ Loaded environment: ${env.name}`);
                
            } catch (error) {
                console.error(`❌ Failed to load environment ${env.name}:`, error);
            }
        }
    }

    analyzeLoadedScene(gltf) {
        console.log('🔍 Analyzing loaded scene...');
        
        const analysis = {
            meshes: [],
            materials: [],
            lights: [],
            cameras: [],
            animations: gltf.animations || []
        };
        
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                analysis.meshes.push({
                    name: child.name,
                    geometry: child.geometry.type,
                    material: child.material.type,
                    vertices: child.geometry.attributes.position?.count || 0
                });
            }
            
            if (child.material && !analysis.materials.find(m => m.uuid === child.material.uuid)) {
                analysis.materials.push(child.material);
            }
            
            if (child.isLight) {
                analysis.lights.push(child);
            }
            
            if (child.isCamera) {
                analysis.cameras.push(child);
            }
        });
        
        console.log('📊 Scene Analysis:', analysis);
        
        // Check for floor/ground planes in the loaded model
        this.detectFloorPlanes(gltf.scene);
        
        return analysis;
    }

    detectFloorPlanes(sceneObject) {
        const floorCandidates = [];
        
        sceneObject.traverse((child) => {
            if (child.isMesh) {
                // Check if this could be a floor based on position, rotation, and scale
                const pos = child.position;
                const rot = child.rotation;
                const scale = child.scale;
                
                // Look for horizontal planes near ground level
                if (Math.abs(rot.x + Math.PI/2) < 0.2 && pos.y < 2) {
                    floorCandidates.push({
                        name: child.name || 'Unnamed',
                        position: pos.clone(),
                        rotation: rot.clone(),
                        scale: scale.clone(),
                        material: child.material?.name || 'Unknown'
                    });
                }
            }
        });
        
        if (floorCandidates.length > 0) {
            console.log('🏠 Detected floor planes in model:', floorCandidates);
        } else {
            console.log('🏠 No floor planes detected in model');
        }
        
        return floorCandidates;
    }

    positionModel(model, name) {
        // Position models in a nice layout
        switch (name) {
            case 'mclaren':
                model.position.set(-3, 0, 0);
                break;
            case 'city':
                model.position.set(0, 0, -3);
                break;
            case 'donald':
                model.position.set(3, 0, 0);
                break;
        }
    }

    clearExistingObjects() {
        // Remove ALL meshes and objects except lights and cameras
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child !== this.scene && 
                !child.isLight && 
                !child.isCamera && 
                !child.name?.includes('Helper')) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            if (obj.parent) {
                obj.parent.remove(obj);
            }
            // Dispose of geometry and materials to free memory
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        
        console.log(`🧹 Cleared ${objectsToRemove.length} existing objects (including ground plane)`);
    }

    createFallbackScene() {
        console.log('🔧 Creating fallback scene...');
        
        // Add some basic geometry as fallback
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.5, 0);
        cube.castShadow = true;
        cube.name = 'FallbackCube';
        this.scene.add(cube);
        
        // Add ground plane only for fallback
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        ground.name = 'FallbackGround';
        this.scene.add(ground);
        
        console.log('🔧 Fallback scene created with temporary cube and ground');
    }

    onWindowResize() {
        if (!this.isInitialized) return;
        
        this.cameraManager.updateAspectRatio(window.innerWidth / window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(event) {
        if (!this.isInitialized) return;
        
        switch (event.key.toLowerCase()) {
            case 'c':
                this.cameraManager.switchCamera();
                this.controls.object = this.cameraManager.activeCamera;
                break;
            case 'l':
                this.lightingManager.switchLighting();
                break;
            case 'a':
                this.animationManager.startCameraAnimation(this.cameraManager.activeCamera);
                break;
            case 'r':
                this.resetScene();
                break;
        }
    }

    resetScene() {
        // Reset camera position
        this.cameraManager.resetCamera();
        this.controls.reset();
        
        // Stop animations
        this.animationManager.stopAllAnimations();
        
        console.log('🔄 Scene reset');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        if (!this.isInitialized) return;
        
        // Update controls
        this.controls.update();
        
        // Update animations
        TWEEN.update();
        this.animationManager?.update();
        
        // Update lighting if needed
        this.lightingManager?.update();
        
        // Render scene
        this.renderer.render(this.scene, this.cameraManager.activeCamera);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TallerApp();
});

export default TallerApp;