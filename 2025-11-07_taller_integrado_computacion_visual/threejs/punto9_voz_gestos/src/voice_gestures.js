import * as THREE from "three";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export function iniciarExperimento() {
  // Crear contenedor
  const container = document.createElement("div");
  document.body.appendChild(container);

  const statusDiv = document.createElement("div");
  statusDiv.id = "status";
  statusDiv.style.position = "absolute";
  statusDiv.style.top = "10px";
  statusDiv.style.left = "10px";
  statusDiv.style.color = "white";
  statusDiv.style.background = "rgba(0,0,0,0.6)";
  statusDiv.style.padding = "8px";
  statusDiv.style.borderRadius = "6px";
  statusDiv.innerText = " Diga un comando o haga un gesto";
  document.body.appendChild(statusDiv);

  // Estado global
  let voiceCommand = "";
  let gesture = "";

  // Escena básica
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  scene.add(cube);

  const light = new THREE.AmbientLight();
  light.position.set(2, 2, 2);
  scene.add(light);
  camera.position.z = 5;

  // Reconocimiento de voz
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.onresult = e => {
    const result = e.results[e.results.length - 1][0].transcript.toLowerCase().trim();
    voiceCommand = result;
    console.log("Comando de voz:", voiceCommand);
    statusDiv.textContent = `🎤 Voz: ${voiceCommand} |  Gesto: ${gesture}`;
  };
  recognition.start();

  // Detección de gestos con MediaPipe
  const video = document.createElement("video");
  video.style.display = "none";
  video.width = 320;
  video.height = 240;
  document.body.appendChild(video);

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  hands.onResults(results => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const wristY = landmarks[0].y;
      const middleY = landmarks[9].y;

      if (wristY > middleY + 0.1) gesture = "mano arriba";
      else if (wristY < middleY - 0.1) gesture = "mano abajo";
      else gesture = "mano neutra";

      statusDiv.textContent = ` Voz: ${voiceCommand} |  Gesto: ${gesture}`;
    } else {
      gesture = "";
    }
  });

  const cameraFeed = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 320, height: 240
  });
  cameraFeed.start();

  // Animación
  function animate() {
    requestAnimationFrame(animate);

    // Lógica compuesta: voz + gesto
    if (voiceCommand.includes("subir") || gesture === "mano arriba") {
      if (cube.position.y < 3){
        cube.position.y += 0.01;
        cube.material.color.set(0xff0000);
      }
    } else if (voiceCommand.includes("bajar") || gesture === "mano abajo") {
    
      if (cube.position.y > -3){
        cube.position.y -= 0.01;
        cube.material.color.set(0xff0000);
      }
    } else if (voiceCommand.includes("girar") || gesture === "mano neutra") {
      cube.rotation.y += 0.01;
      cube.material.color.set(0x0000ff);
    }
    renderer.render(scene, camera);
  }

  animate();
}
