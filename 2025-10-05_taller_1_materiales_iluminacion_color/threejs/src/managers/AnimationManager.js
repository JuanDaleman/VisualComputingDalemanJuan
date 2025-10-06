import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.activeAnimations = new Map();
        this.animationMixers = [];
        this.clock = new THREE.Clock();
    }

    // Camera animations
    startCameraAnimation(camera) {
        console.log('🎬 Starting camera animation...');
        
        // Stop any existing camera animation
        this.stopAnimation('camera');
        
        // Define camera path points
        const points = [
            new THREE.Vector3(-4, 2, 4),   // Start position
            new THREE.Vector3(4, 3, 2),    // Right side
            new THREE.Vector3(0, 5, -5),   // Back high
            new THREE.Vector3(-2, 1, 3),   // Left close
            new THREE.Vector3(-4, 2, 4)    // Back to start
        ];
        
        // Create smooth camera path
        this.createCameraPath(camera, points, 8000); // 8 seconds
    }

    createCameraPath(camera, points, duration) {
        const originalPosition = camera.position.clone();
        let currentPointIndex = 0;
        
        const animateToNextPoint = () => {
            if (currentPointIndex >= points.length) {
                // Animation complete
                this.stopAnimation('camera');
                return;
            }
            
            const targetPoint = points[currentPointIndex];
            const segmentDuration = duration / points.length;
            
            const tween = new TWEEN.Tween(camera.position)
                .to({
                    x: targetPoint.x,
                    y: targetPoint.y,
                    z: targetPoint.z
                }, segmentDuration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    currentPointIndex++;
                    animateToNextPoint();
                });
            
            tween.start();
            this.activeAnimations.set('camera', tween);
        };
        
        animateToNextPoint();
    }

    // Object animations
    startObjectAnimations() {
        console.log('🎭 Starting object animations...');
        
        this.scene.traverse((child) => {
            if (child.isMesh && child.name) {
                this.animateObject(child);
            }
        });
    }

    animateObject(object) {
        const animationType = this.getAnimationTypeForObject(object.name);
        
        switch (animationType) {
            case 'rotate':
                this.createRotationAnimation(object);
                break;
            case 'float':
                this.createFloatingAnimation(object);
                break;
            case 'scale':
                this.createScaleAnimation(object);
                break;
        }
    }

    getAnimationTypeForObject(objectName) {
        // Determine animation type based on object name/type
        if (objectName.toLowerCase().includes('mclaren') || objectName.toLowerCase().includes('car')) {
            return 'rotate';
        } else if (objectName.toLowerCase().includes('donald') || objectName.toLowerCase().includes('character')) {
            return 'float';
        } else if (objectName.toLowerCase().includes('city') || objectName.toLowerCase().includes('building')) {
            return 'scale';
        }
        return 'rotate'; // default
    }

    createRotationAnimation(object) {
        const originalRotation = object.rotation.y;
        
        const tween = new TWEEN.Tween({ rotation: originalRotation })
            .to({ rotation: originalRotation + Math.PI * 2 }, 5000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate((coords) => {
                object.rotation.y = coords.rotation;
            })
            .repeat(Infinity);
        
        tween.start();
        this.activeAnimations.set(`rotate_${object.uuid}`, tween);
    }

    createFloatingAnimation(object) {
        const originalY = object.position.y;
        
        const tween = new TWEEN.Tween({ y: originalY })
            .to({ y: originalY + 0.5 }, 2000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate((coords) => {
                object.position.y = coords.y;
            })
            .yoyo(true)
            .repeat(Infinity);
        
        tween.start();
        this.activeAnimations.set(`float_${object.uuid}`, tween);
    }

    createScaleAnimation(object) {
        const originalScale = object.scale.clone();
        
        const tween = new TWEEN.Tween({ scale: 1 })
            .to({ scale: 1.1 }, 3000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((coords) => {
                object.scale.copy(originalScale.clone().multiplyScalar(coords.scale));
            })
            .yoyo(true)
            .repeat(Infinity);
        
        tween.start();
        this.activeAnimations.set(`scale_${object.uuid}`, tween);
    }

    // Light animations
    startLightAnimations() {
        console.log('💡 Starting light animations...');
        
        this.scene.traverse((child) => {
            if (child.isLight && child.type !== 'AmbientLight') {
                this.animateLight(child);
            }
        });
    }

    animateLight(light) {
        if (!light.position) return;
        
        const originalPosition = light.position.clone();
        const originalIntensity = light.intensity;
        
        // Animate light position in a circle
        const radius = 3;
        let time = 0;
        
        const animate = () => {
            if (!this.activeAnimations.has(`light_${light.uuid}`)) return;
            
            time += 0.01;
            light.position.x = originalPosition.x + Math.sin(time) * radius;
            light.position.z = originalPosition.z + Math.cos(time) * radius;
            
            // Vary intensity
            light.intensity = originalIntensity * (0.8 + 0.4 * Math.sin(time * 2));
            
            requestAnimationFrame(animate);
        };
        
        // Store animation reference
        this.activeAnimations.set(`light_${light.uuid}`, { animate, stop: () => {
            light.position.copy(originalPosition);
            light.intensity = originalIntensity;
        }});
        
        animate();
    }

    // GLTF Animation support
    playGLTFAnimations(gltf) {
        if (!gltf.animations || gltf.animations.length === 0) return;
        
        console.log(`🎞️ Playing ${gltf.animations.length} GLTF animations`);
        
        const mixer = new THREE.AnimationMixer(gltf.scene);
        
        gltf.animations.forEach((clip, index) => {
            const action = mixer.clipAction(clip);
            action.play();
            console.log(`▶️ Playing animation: ${clip.name || index}`);
        });
        
        this.animationMixers.push(mixer);
    }

    // Control methods
    stopAnimation(name) {
        const animation = this.activeAnimations.get(name);
        if (animation) {
            if (animation.stop) {
                animation.stop();
            } else if (animation.stop) {
                animation.stop();
            }
            this.activeAnimations.delete(name);
        }
    }

    stopAllAnimations() {
        console.log('⏹️ Stopping all animations...');
        
        // Stop TWEEN animations
        this.activeAnimations.forEach((animation, name) => {
            this.stopAnimation(name);
        });
        
        // Stop GLTF animations
        this.animationMixers.forEach(mixer => {
            mixer.stopAllActions();
        });
        
        // Clear TWEEN
        TWEEN.removeAll();
    }

    pauseAllAnimations() {
        this.activeAnimations.forEach((animation) => {
            if (animation.pause) {
                animation.pause();
            }
        });
        
        this.animationMixers.forEach(mixer => {
            mixer.timeScale = 0;
        });
    }

    resumeAllAnimations() {
        this.activeAnimations.forEach((animation) => {
            if (animation.resume) {
                animation.resume();
            }
        });
        
        this.animationMixers.forEach(mixer => {
            mixer.timeScale = 1;
        });
    }

    update() {
        // Update GLTF animation mixers
        const delta = this.clock.getDelta();
        this.animationMixers.forEach(mixer => {
            mixer.update(delta);
        });
    }

    getAnimationInfo() {
        return {
            activeAnimations: this.activeAnimations.size,
            gltfMixers: this.animationMixers.length,
            animationNames: Array.from(this.activeAnimations.keys())
        };
    }
}

export default AnimationManager;