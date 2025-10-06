class UIManager {
    constructor(app) {
        this.app = app;
        this.isDebugMode = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Camera controls
        const perspectiveBtn = document.getElementById('camera-perspective');
        const orthographicBtn = document.getElementById('camera-orthographic');
        
        perspectiveBtn?.addEventListener('click', () => {
            if (this.app.cameraManager.cameraType !== 'perspective') {
                this.app.cameraManager.switchCamera();
                this.app.controls.object = this.app.cameraManager.activeCamera;
            }
        });
        
        orthographicBtn?.addEventListener('click', () => {
            if (this.app.cameraManager.cameraType !== 'orthographic') {
                this.app.cameraManager.switchCamera();
                this.app.controls.object = this.app.cameraManager.activeCamera;
            }
        });

        // Lighting controls
        document.getElementById('lighting-day')?.addEventListener('click', () => {
            this.app.lightingManager.applyLightingPreset('day');
        });
        
        document.getElementById('lighting-sunset')?.addEventListener('click', () => {
            this.app.lightingManager.applyLightingPreset('sunset');
        });
        
        document.getElementById('lighting-night')?.addEventListener('click', () => {
            this.app.lightingManager.applyLightingPreset('night');
        });

        // Animation controls
        document.getElementById('animate-camera')?.addEventListener('click', () => {
            this.app.animationManager.startCameraAnimation(this.app.cameraManager.activeCamera);
        });
        
        document.getElementById('animate-objects')?.addEventListener('click', () => {
            this.app.animationManager.startObjectAnimations();
        });
        
        document.getElementById('animate-lights')?.addEventListener('click', () => {
            this.app.animationManager.startLightAnimations();
        });

        // Debug controls
        document.getElementById('toggle-wireframe')?.addEventListener('click', () => {
            this.app.sceneManager.toggleWireframe();
        });
        
        document.getElementById('toggle-helpers')?.addEventListener('click', () => {
            this.app.sceneManager.toggleHelpers();
        });
        
        document.getElementById('reset-scene')?.addEventListener('click', () => {
            this.app.resetScene();
        });

        // Add reload assets button for debugging
        const reloadBtn = document.createElement('button');
        reloadBtn.textContent = 'Reload Assets';
        reloadBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #FF9800;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 101;
        `;
        
        reloadBtn.addEventListener('click', () => {
            location.reload();
        });
        
        document.body.appendChild(reloadBtn);

        // Add info panel toggle
        this.createInfoPanel();
    }

    createInfoPanel() {
        const infoButton = document.createElement('button');
        infoButton.textContent = 'Info';
        infoButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: #2196F3;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 101;
        `;
        
        const infoPanel = document.createElement('div');
        infoPanel.id = 'info-panel';
        infoPanel.className = 'hidden';
        infoPanel.style.cssText = `
            position: absolute;
            top: 60px;
            right: 20px;
            width: 300px;
            max-height: 400px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            z-index: 100;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
        `;
        
        infoButton.addEventListener('click', () => {
            const isHidden = infoPanel.classList.contains('hidden');
            if (isHidden) {
                this.updateInfoPanel(infoPanel);
                infoPanel.classList.remove('hidden');
            } else {
                infoPanel.classList.add('hidden');
            }
        });
        
        document.body.appendChild(infoButton);
        document.body.appendChild(infoPanel);
    }

    updateInfoPanel(panel) {
        if (!this.app.isInitialized) {
            panel.innerHTML = '<p>Loading...</p>';
            return;
        }

        const sceneInfo = this.app.sceneManager.getSceneInfo();
        const cameraInfo = this.app.cameraManager.getCameraInfo();
        const lightingInfo = this.app.lightingManager.getLightingInfo();
        const animationInfo = this.app.animationManager.getAnimationInfo();
        const materialInfo = this.app.materialManager.getMaterialInfo();

        panel.innerHTML = `
            <h3 style="color: #4CAF50; margin: 0 0 10px 0;">📊 Scene Information</h3>
            
            <div style="margin-bottom: 15px;">
                <strong>🎬 Scene:</strong><br>
                Objects: ${sceneInfo.objects}<br>
                Meshes: ${sceneInfo.meshes}<br>
                Lights: ${sceneInfo.lights}<br>
                Triangles: ${sceneInfo.triangles}<br>
                Draw Calls: ${sceneInfo.drawCalls}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>📷 Camera:</strong><br>
                Type: ${cameraInfo.type}<br>
                Position: (${cameraInfo.position.x.toFixed(2)}, ${cameraInfo.position.y.toFixed(2)}, ${cameraInfo.position.z.toFixed(2)})<br>
                ${cameraInfo.fov ? `FOV: ${cameraInfo.fov}°` : ''}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>💡 Lighting:</strong><br>
                Preset: ${lightingInfo.preset}<br>
                Environment: ${lightingInfo.environment || 'None'}<br>
                Lights: ${lightingInfo.lightsCount}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>🎭 Animations:</strong><br>
                Active: ${animationInfo.activeAnimations}<br>
                GLTF Mixers: ${animationInfo.gltfMixers}<br>
                ${animationInfo.animationNames.length > 0 ? 
                    `Names: ${animationInfo.animationNames.join(', ')}` : 
                    'No active animations'
                }
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>🎨 Materials:</strong><br>
                Count: ${materialInfo.count}<br>
                ${materialInfo.materials.slice(0, 5).map(mat => 
                    `${mat.name}: ${mat.type}`
                ).join('<br>')}
                ${materialInfo.materials.length > 5 ? '<br>...' : ''}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>💾 Memory:</strong><br>
                Geometries: ${sceneInfo.memory.geometries}<br>
                Textures: ${sceneInfo.memory.textures}
            </div>
            
            <div>
                <strong>🔧 Models Loaded:</strong><br>
                ${Array.from(this.app.loadedModels.keys()).join('<br>') || 'None'}
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : type === 'warning' ? '#ff8800' : '#4CAF50'};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            max-width: 400px;
            text-align: center;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    showLoadingProgress(loaded, total, item) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement && !loadingElement.classList.contains('hidden')) {
            const progress = Math.round((loaded / total) * 100);
            loadingElement.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Cargando ${item}... ${progress}%</p>
            `;
        }
    }

    createMaterialControls() {
        // Could add dynamic material property controls here
        // This would allow real-time editing of material properties
        console.log('Material controls could be added here');
    }

    updateButtonState(buttonId, isActive) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (isActive) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }
}

export default UIManager;