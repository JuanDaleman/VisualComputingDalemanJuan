import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// -------------------------
// Scene + Camera + Renderer
// -------------------------
const canvas = document.getElementById("app");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(3, 3, 3);

const controls = new OrbitControls(camera, renderer.domElement);

// -------------------------
// Objects
// -------------------------
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// zona de colisión (trigger)
const zoneGeometry = new THREE.BoxGeometry(2, 0.2, 2);
const zoneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
const triggerZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
triggerZone.position.set(0, -1, 0);
scene.add(triggerZone);

// luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// -------------------------
// UI Interaction
// -------------------------
let rotationSpeed = 0.02;

document.getElementById("btnAction").addEventListener("click", () => {
  cube.material.color.set(Math.random() * 0xffffff);
});

document.getElementById("speedSlider").addEventListener("input", (e) => {
  rotationSpeed = parseFloat(e.target.value);
});

// -------------------------
// Input teclado
// -------------------------
const movement = { x: 0, z: 0 };

window.addEventListener("keydown", (e) => {
  if (e.key === "w") movement.z = -0.05;
  if (e.key === "s") movement.z = 0.05;
  if (e.key === "a") movement.x = -0.05;
  if (e.key === "d") movement.x = 0.05;
});

window.addEventListener("keyup", () => {
  movement.x = 0;
  movement.z = 0;
});

// -------------------------
// Touch input
// -------------------------
window.addEventListener("touchstart", () => cube.material.color.set(0xff00ff));

// -------------------------
// Collision detection
// -------------------------
function checkCollision() {
  const cubeBox = new THREE.Box3().setFromObject(cube);
  const triggerBox = new THREE.Box3().setFromObject(triggerZone);

  if (cubeBox.intersectsBox(triggerBox)) {
    triggerZone.material.color.set(0x00ff00); // cambiar a verde si hay colisión
  } else {
    triggerZone.material.color.set(0xff0000); // rojo si no hay colisión
  }
}

// -------------------------
// Animation loop
// -------------------------
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.y += rotationSpeed;
  cube.position.x += movement.x;
  cube.position.z += movement.z;

  checkCollision();

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Fix resizing
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
