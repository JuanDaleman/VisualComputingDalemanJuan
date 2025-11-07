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
import ColorAnalyzer from './ColorAnalyzer.js';

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
        this.colorAnalyzer = null;  // NEW
        
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
        this.currentMaterial = 'metal';
        this.materialAnimationInterval = null; // Store material animation interval
        
        this.init();
    }

    async init() {
        try {
            this.setupRenderer();
            this.setupManagers();
            this.setupEventListeners();
            
            // Load assets
            await this.loadAssets();
            
            // Initialize color analyzer and print analysis
            this.initializeColorAnalysis();
            
            // Start render loop
            this.animate();
            
            // Hide loading screen
            this.loadingElement.classList.add('hidden');
            this.isInitialized = true;
            
            console.log('✅ Taller 3 - Punto 1 initialized successfully');
            console.log('📊 Press "P" to see color analysis in console');
            
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
        this.colorAnalyzer = new ColorAnalyzer();  // NEW
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
        
        console.log('🎨 ColorAnalyzer initialized');
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initializeColorAnalysis() {
        // The ColorAnalyzer is already initialized with default palette
        console.log('🎨 Color Analysis ready. Available commands:');
        console.log('   app.colorAnalyzer.printAnalysis() - Print full analysis');
        console.log('   app.colorAnalyzer.exportAnalysis() - Export data');
        console.log('   app.colorAnalyzer.generateMarkdownReport() - Generate MD report');
        
        // Make app globally accessible for debugging
        window.app = this;
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
            
            // Update material count in UI
            this.updateMaterialInfo();
            
        } catch (error) {
            console.error('Error loading assets:', error);
            // Create fallback scene if loading fails
            this.createFallbackScene();
        }
    }

    async loadMainScene() {
        const possiblePaths = [
            '/models/scene_complete.glb',
            '/models/ScaledMclaren.glb'  // Fallback to McLaren if scene_complete doesn't exist
        ];
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load: ${path}`);
                const gltf = await this.gltfLoader.loadAsync(path);
                console.log('✅ Main scene loaded:', gltf);
                
                this.scene.add(gltf.scene);
                this.loadedModels.set('main_scene', gltf);
                
                this.analyzeLoadedScene(gltf);
                
                console.log('✅ Main scene loaded successfully');
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
            { name: 'mclaren', path: '/models/ScaledMclaren.glb' },
            { name: 'city', path: '/models/ScaledCity.glb' },
            { name: 'donald', path: '/models/ScaleDonald.glb' }
        ];
        
        const loadPromises = models.map(async (model) => {
            try {
                const gltf = await this.gltfLoader.loadAsync(model.path);
                console.log(`✅ Loaded ${model.name}:`, gltf);
                
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
            { name: 'sunset', path: '/hdri/qwantani_sunset_puresky_4k.exr' },
            // { name: 'day', path: '/hdri/zawiszy_czarnego_4k.hdr' },  // Uncomment when HDR file is available
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
            
            if (child.isLight) analysis.lights.push(child);
            if (child.isCamera) analysis.cameras.push(child);
        });
        
        console.log('📊 Scene Analysis:', analysis);
        return analysis;
    }

    positionModel(model, name) {
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
            if (obj.parent) obj.parent.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        
        console.log(`🧹 Cleared ${objectsToRemove.length} existing objects`);
    }

    createFallbackScene() {
        console.log('🔧 Creating fallback scene...');
        
        // Create demo spheres with different materials
        const materials = ['metal', 'concrete', 'wood', 'glass'];
        materials.forEach((matName, index) => {
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            const material = this.materialManager.getMaterial(matName);
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(index * 1.5 - 2.25, 0.5, 0);
            sphere.castShadow = true;
            sphere.name = `Sphere_${matName}`;
            this.scene.add(sphere);
        });
        
        // Add ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = this.materialManager.getMaterial('concrete');
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        ground.name = 'FallbackGround';
        this.scene.add(ground);
        
        console.log('🔧 Fallback scene created with material showcase');
    }

    applyMaterialToScene(materialName) {
        // Stop any running material animation
        this.stopMaterialAnimation();
        
        const material = this.materialManager.getMaterial(materialName);
        if (!material) {
            console.warn(`Material '${materialName}' not found`);
            return;
        }
        
        let count = 0;
        this.scene.traverse((child) => {
            if (child.isMesh && !child.name?.includes('Ground')) {
                child.material = material;
                count++;
            }
        });
        
        this.currentMaterial = materialName;
        console.log(`✅ Applied ${materialName} material to ${count} objects`);
        this.uiManager.showNotification(`Material: ${materialName.toUpperCase()}`, 'info');
    }

    startMaterialAnimation() {
        console.log('🎨 Starting material animation...');
        
        // Stop any existing material animation
        this.stopMaterialAnimation();
        
        const materials = ['metal', 'concrete', 'wood', 'glass'];
        let currentIndex = 0;
        
        // Apply first material immediately
        this.scene.traverse((child) => {
            if (child.isMesh && !child.name?.includes('Ground')) {
                child.material = this.materialManager.getMaterial(materials[currentIndex]);
            }
        });
        this.currentMaterial = materials[currentIndex];
        this.uiManager.showNotification(`Material Animation: ${materials[currentIndex].toUpperCase()}`, 'info');
        console.log(`✅ Applied ${materials[currentIndex]} material`);
        currentIndex = (currentIndex + 1) % materials.length;
        
        // Continue cycling through materials
        this.materialAnimationInterval = setInterval(() => {
            // Apply material without calling applyMaterialToScene to avoid recursion
            this.scene.traverse((child) => {
                if (child.isMesh && !child.name?.includes('Ground')) {
                    child.material = this.materialManager.getMaterial(materials[currentIndex]);
                }
            });
            this.currentMaterial = materials[currentIndex];
            this.uiManager.showNotification(`Material Animation: ${materials[currentIndex].toUpperCase()}`, 'info');
            console.log(`✅ Applied ${materials[currentIndex]} material`);
            
            currentIndex = (currentIndex + 1) % materials.length;
            
            // Complete after full cycle (4 materials)
            if (currentIndex === 0) {
                this.stopMaterialAnimation();
                console.log('✅ Material animation complete');
                this.uiManager.showNotification('Material animation complete', 'success');
            }
        }, 2000); // 2 seconds between each material change
    }
    
    stopMaterialAnimation() {
        if (this.materialAnimationInterval) {
            clearInterval(this.materialAnimationInterval);
            this.materialAnimationInterval = null;
            console.log('⏹️ Material animation stopped');
        }
    }

    updateMaterialInfo() {
        const materialInfo = this.materialManager.getMaterialInfo();
        this.uiManager.updateMaterialCount(materialInfo.count);
    }

    onWindowResize() {
        if (!this.isInitialized) return;
        
        this.cameraManager.updateAspectRatio(window.innerWidth / window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resetScene() {
        // Reset camera position
        this.cameraManager.resetCamera();
        this.controls.reset();
        
        // Stop animations
        this.animationManager.stopAllAnimations();
        this.stopMaterialAnimation(); // Also stop material animation
        
        // Reset lighting
        this.lightingManager.applyLightingPreset('sunset');
        
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
