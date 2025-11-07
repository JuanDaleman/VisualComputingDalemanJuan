class UIManager {
    constructor(app) {
        this.app = app;
        this.currentMaterialIndex = 0;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('camera-perspective')?.addEventListener('click', () => {
            if (this.app.cameraManager.cameraType !== 'perspective') {
                this.app.cameraManager.switchCamera();
                this.app.controls.object = this.app.cameraManager.activeCamera;
            }
        });
        document.getElementById('camera-orthographic')?.addEventListener('click', () => {
            if (this.app.cameraManager.cameraType !== 'orthographic') {
                this.app.cameraManager.switchCamera();
                this.app.controls.object = this.app.cameraManager.activeCamera;
            }
        });
        document.getElementById('lighting-day')?.addEventListener('click', () => this.app.lightingManager.applyLightingPreset('day'));
        document.getElementById('lighting-sunset')?.addEventListener('click', () => this.app.lightingManager.applyLightingPreset('sunset'));
        document.getElementById('lighting-night')?.addEventListener('click', () => this.app.lightingManager.applyLightingPreset('night'));
        document.getElementById('material-metal')?.addEventListener('click', () => this.app.applyMaterialToScene('metal'));
        document.getElementById('material-concrete')?.addEventListener('click', () => this.app.applyMaterialToScene('concrete'));
        document.getElementById('material-wood')?.addEventListener('click', () => this.app.applyMaterialToScene('wood'));
        document.getElementById('material-glass')?.addEventListener('click', () => this.app.applyMaterialToScene('glass'));
        document.getElementById('cycle-materials')?.addEventListener('click', () => this.cycleMaterials());
        document.getElementById('animate-camera')?.addEventListener('click', () => this.app.animationManager.startCameraAnimation(this.app.cameraManager.activeCamera));
        document.getElementById('animate-materials')?.addEventListener('click', () => this.app.startMaterialAnimation());
        document.getElementById('animate-lights')?.addEventListener('click', () => this.app.animationManager.startLightAnimations());
        document.getElementById('show-color-analysis')?.addEventListener('click', () => this.showColorPalette());
        document.getElementById('show-cielab-analysis')?.addEventListener('click', () => this.showCIELABAnalysis());
        document.getElementById('toggle-wireframe')?.addEventListener('click', () => this.app.sceneManager.toggleWireframe());
        document.getElementById('toggle-helpers')?.addEventListener('click', () => this.app.sceneManager.toggleHelpers());
        document.getElementById('reset-scene')?.addEventListener('click', () => this.app.resetScene());
        
        // Procedural Geometry Controls
        document.getElementById('procedural-grid')?.addEventListener('click', () => this.app.proceduralGeometryManager?.generateWaveGrid());
        document.getElementById('procedural-spiral')?.addEventListener('click', () => this.app.proceduralGeometryManager?.generateHelixSpiral());
        document.getElementById('procedural-fractal')?.addEventListener('click', () => this.app.proceduralGeometryManager?.generateSierpinskiPyramid());
        document.getElementById('procedural-knot')?.addEventListener('click', () => this.app.proceduralGeometryManager?.generateTorusKnot());
        document.getElementById('procedural-animate')?.addEventListener('click', () => {
            if (this.app.proceduralGeometryManager?.isAnimating) {
                this.app.proceduralGeometryManager.stopAnimation();
                document.getElementById('procedural-animate').textContent = '▶️ Animar';
            } else {
                this.app.proceduralGeometryManager?.startAnimation();
                document.getElementById('procedural-animate').textContent = '⏸️ Pausar';
            }
        });
        document.getElementById('procedural-clear')?.addEventListener('click', () => {
            this.app.proceduralGeometryManager?.clearProceduralGeometry();
            this.showNotification('🗑️ Geometría procedural limpiada');
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'c') { this.app.cameraManager.switchCamera(); this.app.controls.object = this.app.cameraManager.activeCamera; }
            else if (e.key === 'l') { const p = ['day', 'sunset', 'night']; const i = (p.indexOf(this.app.lightingManager.currentPreset || 'day') + 1) % p.length; this.app.lightingManager.applyLightingPreset(p[i]); }
            else if (e.key === 'm') this.cycleMaterials();
            else if (e.key === 'p') this.app.colorAnalyzer.printAnalysis();
            else if (e.key === 'g') this.app.proceduralGeometryManager?.generateWaveGrid();
            else if (e.key === 's') this.app.proceduralGeometryManager?.generateHelixSpiral();
            else if (e.key === 'f') this.app.proceduralGeometryManager?.generateSierpinskiPyramid();
            else if (e.key === 'k') this.app.proceduralGeometryManager?.generateTorusKnot();
        });
    }
    
    cycleMaterials() {
        const m = ['metal', 'concrete', 'wood', 'glass'];
        this.currentMaterialIndex = (this.currentMaterialIndex + 1) % m.length;
        this.app.applyMaterialToScene(m[this.currentMaterialIndex]);
    }
    
    showColorPalette() {
        if (!this.app.colorAnalyzer) {
            this.showNotification('Error: ColorAnalyzer no inicializado', 'error');
            return;
        }
        
        try {
            const d = this.app.colorAnalyzer.exportAnalysis();
            
            if (!d || !d.palette) {
                this.showNotification('Error: Datos de paleta inválidos', 'error');
                return;
            }
            
            let h = '<h3>Paleta RGB/HSV</h3><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#333"><th>Color</th><th>Nombre</th><th>RGB</th><th>HEX</th><th>HSV</th></tr></thead><tbody>';
            
            for (const [n, c] of Object.entries(d.palette)) {
                if (!c) continue;
                
                const hex = c.hex || '#000000';
                const rgbR = c.rgb?.r !== undefined ? c.rgb.r : 0;
                const rgbG = c.rgb?.g !== undefined ? c.rgb.g : 0;
                const rgbB = c.rgb?.b !== undefined ? c.rgb.b : 0;
                const hsvH = c.hsv?.h !== undefined ? Math.round(c.hsv.h) : 0;
                const hsvS = c.hsv?.s !== undefined ? Math.round(c.hsv.s) : 0;
                const hsvV = c.hsv?.v !== undefined ? Math.round(c.hsv.v) : 0;
                
                h += '<tr><td><div style="width:40px;height:40px;background:' + hex + ';border:1px solid #fff"></div></td><td>' + n + '</td><td>rgb(' + rgbR + ',' + rgbG + ',' + rgbB + ')</td><td>' + hex + '</td><td>H:' + hsvH + '° S:' + hsvS + '% V:' + hsvV + '%</td></tr>';
            }
            
            h += '</tbody></table>';
            this.showModal('Paleta RGB/HSV', h);
            
        } catch (error) {
            this.showNotification('Error al mostrar paleta: ' + error.message, 'error');
        }
    }
    
    showCIELABAnalysis() {
        if (!this.app.colorAnalyzer) {
            this.showNotification('Error: ColorAnalyzer no inicializado', 'error');
            return;
        }
        
        try {
            const d = this.app.colorAnalyzer.exportAnalysis();
            
            if (!d || !d.palette || !d.contrasts) {
                this.showNotification('Error: Datos de análisis inválidos', 'error');
                return;
            }
            
            let h = '<h3>Análisis CIELAB</h3><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#333"><th>Color</th><th>L*</th><th>a*</th><th>b*</th></tr></thead><tbody>';
            
            for (const [n, c] of Object.entries(d.palette)) {
                if (!c || !c.cielab) continue;
                
                const l = c.cielab.l !== undefined ? c.cielab.l : 0;
                const a = c.cielab.a !== undefined ? c.cielab.a : 0;
                const b = c.cielab.b !== undefined ? c.cielab.b : 0;
                
                h += '<tr><td><div style="width:30px;height:30px;background:' + c.hex + ';border:1px solid #fff;display:inline-block;margin-right:8px"></div>' + n + '</td><td>' + l.toFixed(2) + '</td><td>' + a.toFixed(2) + '</td><td>' + b.toFixed(2) + '</td></tr>';
            }
            
            h += '</tbody></table><h4>Top 5 Contrastes (Delta E)</h4><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#333"><th>Par de Colores</th><th>Delta E</th><th>Descripción</th><th>WCAG</th></tr></thead><tbody>';
            
            const topContrasts = d.contrasts.slice(0, 5);
            for (const p of topContrasts) {
                if (!p) continue;
                
                const deltaE = p.deltaE !== undefined ? p.deltaE : 0;
                const description = p.description || 'N/A';
                const wcagLevel = p.wcagLevel || 'N/A';
                
                h += '<tr><td>' + p.color1 + ' - ' + p.color2 + '</td><td>' + deltaE.toFixed(2) + '</td><td>' + description + '</td><td>' + wcagLevel + '</td></tr>';
            }
            
            h += '</tbody></table>';
            this.showModal('Análisis CIELAB', h);
            
        } catch (error) {
            this.showNotification('Error al generar análisis CIELAB: ' + error.message, 'error');
        }
    }
    
    showModal(title, content) {
        const e = document.getElementById('color-modal');
        if (e) e.remove();
        const m = document.createElement('div');
        m.id = 'color-modal';
        m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000';
        const c = document.createElement('div');
        c.style.cssText = 'background:#1a1a1a;color:white;padding:30px;border-radius:12px;max-width:90%;max-height:90%;overflow-y:auto;position:relative';
        const b = document.createElement('button');
        b.textContent = 'X';
        b.style.cssText = 'position:absolute;top:10px;right:10px;background:#f44;border:none;color:white;width:30px;height:30px;border-radius:50%;cursor:pointer';
        b.onclick = () => m.remove();
        c.innerHTML = '<h2>' + title + '</h2>' + content;
        c.appendChild(b);
        m.appendChild(c);
        m.onclick = (ev) => { if (ev.target === m) m.remove(); };
        document.body.appendChild(m);
    }
    
    showNotification(message, type = 'info') {
        const existingNotification = document.getElementById('notification-toast');
        if (existingNotification) existingNotification.remove();
        
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336'
        };
        
        const notification = document.createElement('div');
        notification.id = 'notification-toast';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        // Add CSS animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    updateMaterialCount(count) {
        const materialCountElement = document.getElementById('material-count');
        if (materialCountElement) {
            materialCountElement.textContent = `Materiales: ${count}`;
        }
    }
}
export default UIManager;
