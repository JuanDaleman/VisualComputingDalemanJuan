import * as THREE from 'three';

class CameraManager {
    constructor(container) {
        this.container = container;
        this.aspect = window.innerWidth / window.innerHeight;
        
        // Create both cameras
        this.perspectiveCamera = this.createPerspectiveCamera();
        this.orthographicCamera = this.createOrthographicCamera();
        
        // Set initial active camera
        this.activeCamera = this.perspectiveCamera;
        this.cameraType = 'perspective';
        
        // Initial positions
        this.resetCamera();
    }

    createPerspectiveCamera() {
        const camera = new THREE.PerspectiveCamera(
            50,        // FOV
            this.aspect,
            0.1,       // Near
            1000       // Far
        );
        
        camera.name = 'PerspectiveCamera';
        return camera;
    }

    createOrthographicCamera() {
        const frustumSize = 10;
        const camera = new THREE.OrthographicCamera(
            frustumSize * this.aspect / -2,  // Left
            frustumSize * this.aspect / 2,   // Right
            frustumSize / 2,                 // Top
            frustumSize / -2,                // Bottom
            0.1,                             // Near
            1000                             // Far
        );
        
        camera.name = 'OrthographicCamera';
        return camera;
    }

    switchCamera() {
        // Store current camera transform
        const currentPos = this.activeCamera.position.clone();
        const currentTarget = new THREE.Vector3();
        
        // Switch camera type
        if (this.cameraType === 'perspective') {
            this.activeCamera = this.orthographicCamera;
            this.cameraType = 'orthographic';
            console.log('📷 Switched to Orthographic Camera');
        } else {
            this.activeCamera = this.perspectiveCamera;
            this.cameraType = 'perspective';
            console.log('📷 Switched to Perspective Camera');
        }
        
        // Maintain position and orientation
        this.activeCamera.position.copy(currentPos);
        this.activeCamera.lookAt(0, 0, 0);
        
        // Update UI
        this.updateCameraUI();
        
        return this.activeCamera;
    }

    updateCameraUI() {
        const perspectiveBtn = document.getElementById('camera-perspective');
        const orthographicBtn = document.getElementById('camera-orthographic');
        
        if (this.cameraType === 'perspective') {
            perspectiveBtn?.classList.add('active');
            orthographicBtn?.classList.remove('active');
        } else {
            perspectiveBtn?.classList.remove('active');
            orthographicBtn?.classList.add('active');
        }
    }

    updateAspectRatio(aspect) {
        this.aspect = aspect;
        
        // Update perspective camera
        this.perspectiveCamera.aspect = aspect;
        this.perspectiveCamera.updateProjectionMatrix();
        
        // Update orthographic camera
        const frustumSize = 10;
        this.orthographicCamera.left = frustumSize * aspect / -2;
        this.orthographicCamera.right = frustumSize * aspect / 2;
        this.orthographicCamera.top = frustumSize / 2;
        this.orthographicCamera.bottom = frustumSize / -2;
        this.orthographicCamera.updateProjectionMatrix();
    }

    resetCamera() {
        // Default camera position
        const defaultPosition = new THREE.Vector3(-4.26, 0.62, -1.01);
        
        this.perspectiveCamera.position.copy(defaultPosition);
        this.orthographicCamera.position.copy(defaultPosition);
        
        // Look at origin
        this.perspectiveCamera.lookAt(0, 0, 0);
        this.orthographicCamera.lookAt(0, 0, 0);
    }

    getCameraInfo() {
        return {
            type: this.cameraType,
            position: this.activeCamera.position.clone(),
            target: new THREE.Vector3(0, 0, 0), // Assuming looking at origin
            fov: this.cameraType === 'perspective' ? this.perspectiveCamera.fov : null
        };
    }

    setCameraPosition(position, target = null) {
        this.activeCamera.position.copy(position);
        if (target) {
            this.activeCamera.lookAt(target);
        }
    }
}

export default CameraManager;