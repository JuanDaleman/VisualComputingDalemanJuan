import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 1. Setup Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// 2. Setup Camera
let currentCameraIndex = 0;
const cameras = [];

// Camera 1: Perspective High Angle
const camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera1.position.set(5, 5, 5);
camera1.lookAt(0, 0, 0);
cameras.push(camera1);

// Camera 2: Perspective Low Angle / Side
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera2.position.set(-5, 2, 5);
camera2.lookAt(0, 0, 0);
cameras.push(camera2);

let camera = cameras[currentCameraIndex];

// 3. Setup Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 4. Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// 6. Textures
const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load('/textures/WoodFloor064_2K-JPG/WoodFloor064_2K-JPG_Color.jpg');
const metalTexture = textureLoader.load('/textures/Metal048B_2K-JPG/Metal048B_2K-JPG_Color.jpg');

// 7. Objects

// Floor
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: woodTexture,
    side: THREE.DoubleSide
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Cube (Metal)
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ 
    map: metalTexture,
    roughness: 0.2,
    metalness: 0.8
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 1, 0);
cube.castShadow = true;
scene.add(cube);

// Sphere (Metal)
const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ 
    map: metalTexture,
    roughness: 0.1,
    metalness: 0.9
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 1, 2);
sphere.castShadow = true;
scene.add(sphere);

// Cone (Color)
const coneGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xff5733 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.set(-2, 0.75, -2);
cone.castShadow = true;
scene.add(cone);

// 8. UI / Interaction
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '10px';
infoDiv.style.left = '10px';
infoDiv.style.color = 'white';
infoDiv.style.fontFamily = 'sans-serif';
infoDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
infoDiv.style.padding = '10px';
infoDiv.innerHTML = '<h3>Controles</h3><p>Click + Drag: Rotar</p><p>Scroll: Zoom</p><p>Tecla "C": Cambiar Cámara</p>';
document.body.appendChild(infoDiv);

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        camera = cameras[currentCameraIndex];
        controls.object = camera; // Update controls to use new camera
        console.log("Camera switched to index " + currentCameraIndex);
    }
});

// 9. Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Animations
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    sphere.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.5; // Floating effect

    cone.rotation.z -= 0.02;

    controls.update();
    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    cameras.forEach(cam => {
        cam.aspect = window.innerWidth / window.innerHeight;
        cam.updateProjectionMatrix();
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();