import * as THREE from 'three';

class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = new Map();
        this.environments = new Map();
        this.currentPreset = 'day';
        this.currentEnvironment = null;
        
        // Lighting presets
        this.presets = {
            day: {
                ambient: { color: 0x404040, intensity: 0.3 },
                key: { color: 0xffffff, intensity: 1.5, position: [10, 15, 5] },
                fill: { color: 0x87ceeb, intensity: 0.8, position: [-10, 10, -5] },
                rim: { color: 0xffffff, intensity: 0.5, position: [0, 5, -10] }
            },
            sunset: {
                ambient: { color: 0x4a3728, intensity: 0.4 },
                key: { color: 0xff6347, intensity: 2.0, position: [15, 8, 10] },
                fill: { color: 0x4169e1, intensity: 0.6, position: [-8, 12, -8] },
                rim: { color: 0xff4500, intensity: 0.8, position: [-5, 3, -15] }
            },
            night: {
                ambient: { color: 0x1a1a2e, intensity: 0.2 },
                key: { color: 0x6495ed, intensity: 1.0, position: [8, 20, 8] },
                fill: { color: 0x483d8b, intensity: 0.4, position: [-12, 8, -12] },
                rim: { color: 0x9370db, intensity: 0.6, position: [0, 10, -20] }
            }
        };
    }

    setupDefaultLighting() {
        console.log('💡 Setting up default lighting...');
        this.applyLightingPreset('sunset');
    }

    applyLightingPreset(presetName) {
        if (!this.presets[presetName]) {
            console.error('❌ Unknown lighting preset:', presetName);
            return;
        }

        console.log(`🌅 Applying lighting preset: ${presetName}`);
        
        // Clear existing lights
        this.clearLights();
        
        const preset = this.presets[presetName];
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(
            preset.ambient.color, 
            preset.ambient.intensity
        );
        ambientLight.name = 'AmbientLight';
        this.scene.add(ambientLight);
        this.lights.set('ambient', ambientLight);
        
        // Add key light (main directional light)
        const keyLight = new THREE.DirectionalLight(
            preset.key.color, 
            preset.key.intensity
        );
        keyLight.position.set(...preset.key.position);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -20;
        keyLight.shadow.camera.right = 20;
        keyLight.shadow.camera.top = 20;
        keyLight.shadow.camera.bottom = -20;
        keyLight.name = 'KeyLight';
        
        this.scene.add(keyLight);
        this.lights.set('key', keyLight);
        
        // Add fill light
        const fillLight = new THREE.DirectionalLight(
            preset.fill.color, 
            preset.fill.intensity
        );
        fillLight.position.set(...preset.fill.position);
        fillLight.name = 'FillLight';
        this.scene.add(fillLight);
        this.lights.set('fill', fillLight);
        
        // Add rim light
        const rimLight = new THREE.DirectionalLight(
            preset.rim.color, 
            preset.rim.intensity
        );
        rimLight.position.set(...preset.rim.position);
        rimLight.name = 'RimLight';
        this.scene.add(rimLight);
        this.lights.set('rim', rimLight);
        
        // Apply environment - use sunset HDRI for all presets
        this.setEnvironment('sunset');
        
        this.currentPreset = presetName;
        this.updateLightingUI();
    }

    addEnvironment(name, texture) {
        this.environments.set(name, texture);
        console.log(`🌍 Environment '${name}' added`);
    }

    setEnvironment(envName) {
        // Always prefer sunset environment if available
        let environment = this.environments.get('sunset');
        let actualEnvName = 'sunset';
        
        // Fallback to requested environment if sunset not available
        if (!environment && envName) {
            environment = this.environments.get(envName);
            actualEnvName = envName;
        }
        
        if (environment) {
            this.scene.environment = environment;
            this.scene.background = environment;
            this.currentEnvironment = actualEnvName;
            console.log(`🌍 Environment set to: ${actualEnvName}`);
        } else {
            // Fallback to color background
            const bgColor = actualEnvName === 'sunset' ? 0x4a3728 : 0x87ceeb;
            this.scene.background = new THREE.Color(bgColor);
            console.log(`🌍 Using fallback color background for: ${actualEnvName}`);
        }
    }

    switchLighting() {
        const presets = Object.keys(this.presets);
        const currentIndex = presets.indexOf(this.currentPreset);
        const nextIndex = (currentIndex + 1) % presets.length;
        const nextPreset = presets[nextIndex];
        
        this.applyLightingPreset(nextPreset);
    }

    clearLights() {
        this.lights.forEach((light, name) => {
            this.scene.remove(light);
        });
        this.lights.clear();
    }

    updateLightingUI() {
        // Update UI buttons
        document.querySelectorAll('#ui-panel .ui-section button[id^="lighting-"]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.getElementById(`lighting-${this.currentPreset}`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Animation helpers
    animateLights() {
        console.log('✨ Starting light animation...');
        
        const keyLight = this.lights.get('key');
        if (keyLight) {
            const originalPos = keyLight.position.clone();
            
            // Create circular motion for key light
            let time = 0;
            const animate = () => {
                time += 0.02;
                keyLight.position.x = originalPos.x + Math.sin(time) * 5;
                keyLight.position.z = originalPos.z + Math.cos(time) * 5;
                
                if (time < Math.PI * 4) { // 2 full rotations
                    requestAnimationFrame(animate);
                } else {
                    keyLight.position.copy(originalPos);
                }
            };
            animate();
        }
    }

    update() {
        // Update any time-based lighting effects here
        // This could include day/night cycles, flickering lights, etc.
    }

    getLightingInfo() {
        return {
            preset: this.currentPreset,
            environment: this.currentEnvironment,
            lightsCount: this.lights.size,
            lights: Array.from(this.lights.entries()).map(([name, light]) => ({
                name,
                type: light.type,
                color: light.color.getHex(),
                intensity: light.intensity,
                position: light.position?.clone()
            }))
        };
    }
}

export default LightingManager;